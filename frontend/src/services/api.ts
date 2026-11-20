import { StudentInput, PredictionResult, SystemMetrics, DatasetInfo } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string' 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        // Fall back to default status message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getHealth(): Promise<{ status: string; version: string; artifacts_ready: boolean; database_ready: boolean }> {
    return this.request('/api/health');
  }

  async getModelInfo(): Promise<any> {
    return this.request('/api/model-info');
  }

  async getMetrics(): Promise<SystemMetrics> {
    return this.request('/api/metrics');
  }

  async predict(input: StudentInput): Promise<PredictionResult> {
    return this.request('/api/predict', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getPredictions(params?: { search?: string; mode?: string; page?: number; limit?: number }): Promise<{
    items: PredictionResult[];
    total: number;
    page: number;
    pages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.mode) searchParams.append('mode', params.mode);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/api/predictions${qs}`);
  }

  async getPredictionById(id: number): Promise<PredictionResult> {
    return this.request(`/api/predictions/${id}`);
  }

  async deletePrediction(id: number): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/predictions/${id}`, {
      method: 'DELETE',
    });
  }

  async getDatasetInfo(): Promise<DatasetInfo> {
    return this.request('/api/dataset/info');
  }

  async validateDataset(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/dataset/validate`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Validation failed' }));
      throw new Error(err.detail || 'Failed to validate dataset');
    }

    return response.json();
  }

  getExportCsvUrl(): string {
    return `${API_BASE_URL}/api/predictions/export/csv`;
  }

  getExportPdfUrl(): string {
    return `${API_BASE_URL}/api/predictions/export/pdf`;
  }

  async getFirebaseStatus(): Promise<{
    connected: boolean;
    provider: string;
    project_id: string;
    collection: string;
    message: string;
  }> {
    return this.request('/api/firebase/status');
  }

  async configureFirebase(credentialsJson: string): Promise<any> {
    return this.request('/api/firebase/config', {
      method: 'POST',
      body: JSON.stringify({ credentials_json: credentialsJson }),
    });
  }

  async seedRealData(count: number = 35): Promise<any> {
    return this.request(`/api/database/seed?count=${count}`, {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
