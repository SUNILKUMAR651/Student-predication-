import pytest
import httpx
from backend.app.main import app

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.fixture
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

@pytest.mark.anyio
async def test_health_endpoint(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["online", "degraded"]
    assert "version" in data
    assert data["artifacts_ready"] is True

@pytest.mark.anyio
async def test_model_info_endpoint(client):
    response = await client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["historical_model"] is not None
    assert data["early_model"] is not None

@pytest.mark.anyio
async def test_metrics_endpoint(client):
    response = await client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "total_predictions" in data
    assert "historical_evaluation" in data
    assert "early_evaluation" in data

@pytest.mark.anyio
async def test_predict_endpoint_valid(client):
    payload = {
        "student_name": "Test Student A",
        "student_id": "STU101",
        "mode": "historical",
        "scale": "100",
        "studytime": 3,
        "absences": 2,
        "failures": 0,
        "G1": 14.0,
        "G2": 15.0,
        "age": 16,
        "sex": "F",
        "school": "GP"
    }
    response = await client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["student_name"] == "Test Student A"
    assert "predicted_score_100" in data
    assert 0.0 <= data["predicted_score_100"] <= 100.0
    assert data["id"] is not None

    # Verify retrieval of saved record
    get_res = await client.get(f"/api/predictions/{data['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["student_name"] == "Test Student A"

@pytest.mark.anyio
async def test_predict_endpoint_validation_error(client):
    bad_payload = {
        "mode": "historical",
        "studytime": -5,
        "age": 99
    }
    response = await client.post("/api/predict", json=bad_payload)
    assert response.status_code == 422  # Pydantic validation failure

@pytest.mark.anyio
async def test_predictions_list_and_delete(client):
    payload = {
        "student_name": "Temporary Delete Me",
        "student_id": "TEMP01",
        "mode": "early",
        "scale": "100",
        "studytime": 2,
        "absences": 4,
        "failures": 0
    }
    post_res = await client.post("/api/predict", json=payload)
    pred_id = post_res.json()["id"]

    del_res = await client.delete(f"/api/predictions/{pred_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    get_res = await client.get(f"/api/predictions/{pred_id}")
    assert get_res.status_code == 404

@pytest.mark.anyio
async def test_dataset_validate_csv(client):
    valid_csv = (
        "school;sex;age;address;famsize;Pstatus;Medu;Fedu;Mjob;Fjob;reason;guardian;traveltime;studytime;failures;"
        "schoolsup;famsup;paid;activities;nursery;higher;internet;romantic;famrel;freetime;goout;Dalc;Walc;health;absences;G1;G2;G3\n"
        "GP;F;16;U;GT3;T;3;3;other;other;home;mother;1;2;0;no;yes;no;yes;yes;yes;yes;no;4;3;3;1;1;4;4;12;13;14\n"
    )
    files = {"file": ("test.csv", valid_csv.encode('utf-8'), "text/csv")}
    response = await client.post("/api/dataset/validate", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["row_count"] == 1
