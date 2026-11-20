"""
Seed script to populate SQLite and Firebase with authentic student records
derived directly from the real UCI Student Performance Portuguese dataset.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import pandas as pd
import numpy as np
from backend.ml.dataset_loader import load_or_prepare_dataset
from backend.app.services.prediction_service import prediction_service

# Authentic Portuguese / International student names for demonstration
FIRST_NAMES_F = ["Maria", "Ana", "Beatriz", "Inês", "Mariana", "Carolina", "Sofia", "Francisca", "Leonor", "Matilde", "Lara", "Clara", "Diana", "Helena", "Camila"]
FIRST_NAMES_M = ["João", "Rodrigo", "Martim", "Francisco", "Santiago", "Afonso", "Tomás", "Duarte", "Miguel", "Gabriel", "Lucas", "Tiago", "Diogo", "Rafael", "Pedro"]
LAST_NAMES = ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins", "Jesus", "Sousa", "Fernandes", "Gonçalves", "Gomes", "Lopes", "Marques"]

def generate_student_name(sex: str, idx: int) -> str:
    rng = np.random.default_rng(100 + idx)
    first_list = FIRST_NAMES_F if sex == 'F' else FIRST_NAMES_M
    first = rng.choice(first_list)
    last1 = rng.choice(LAST_NAMES)
    last2 = rng.choice(LAST_NAMES)
    while last2 == last1:
        last2 = rng.choice(LAST_NAMES)
    return f"{first} {last1} {last2}"

def seed_database(num_samples: int = 40):
    print(f"Loading authentic UCI Student Performance dataset...")
    df = load_or_prepare_dataset()
    print(f"Dataset shape: {df.shape}")

    # Sample rows across different academic achievement percentiles
    df_sorted = df.sort_values(by='G3', ascending=False).reset_index(drop=True)
    step = max(1, len(df_sorted) // num_samples)
    sampled_indices = [i * step for i in range(num_samples) if i * step < len(df_sorted)]

    seeded_count = 0
    for idx, row_idx in enumerate(sampled_indices):
        row = df_sorted.iloc[row_idx]
        sex = str(row['sex']).strip()
        student_name = generate_student_name(sex, idx)
        student_id = f"STU-POR-{2024001 + idx}"

        # Alternate between historical mode (with G1/G2) and early prediction mode
        mode = "historical" if idx % 4 != 0 else "early"
        
        # Build prediction payload
        request_data = {
            "student_name": student_name,
            "student_id": student_id,
            "mode": mode,
            "scale": "100",
            "studytime": int(row['studytime']),
            "absences": int(row['absences']),
            "failures": int(row['failures']),
            "age": int(row['age']),
            "sex": sex,
            "school": str(row['school']).strip(),
            "address": str(row['address']).strip(),
            "famsize": str(row['famsize']).strip(),
            "Pstatus": str(row['Pstatus']).strip(),
            "Medu": int(row['Medu']),
            "Fedu": int(row['Fedu']),
            "Mjob": str(row['Mjob']).strip(),
            "Fjob": str(row['Fjob']).strip(),
            "reason": str(row['reason']).strip(),
            "guardian": str(row['guardian']).strip(),
            "traveltime": int(row['traveltime']),
            "schoolsup": str(row['schoolsup']).strip(),
            "famsup": str(row['famsup']).strip(),
            "paid": str(row['paid']).strip(),
            "activities": str(row['activities']).strip(),
            "nursery": str(row['nursery']).strip(),
            "higher": str(row['higher']).strip(),
            "internet": str(row['internet']).strip(),
            "romantic": str(row['romantic']).strip(),
            "famrel": int(row['famrel']),
            "freetime": int(row['freetime']),
            "goout": int(row['goout']),
            "Dalc": int(row['Dalc']),
            "Walc": int(row['Walc']),
            "health": int(row['health'])
        }

        if mode == "historical":
            # Convert 0-20 scale in dataset to 0-100 scale for input
            request_data["G1"] = float(round((row['G1'] / 20.0) * 100.0, 1))
            request_data["G2"] = float(round((row['G2'] / 20.0) * 100.0, 1))

        try:
            prediction_service.create_prediction(request_data)
            seeded_count += 1
        except Exception as e:
            print(f"Error seeding student {student_name}: {e}")

    print(f"Successfully seeded {seeded_count} authentic student records into the database!")

if __name__ == "__main__":
    seed_database(40)
