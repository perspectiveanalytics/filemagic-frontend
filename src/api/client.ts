import type { SubmitResponse, JobStatusResponse, ApiError, ConversionOptions, CertificateInfo } from '../types/api';
import { getTurnstileToken } from '../turnstile';

class ApiClient {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

  async submitConversion(
    endpoint: string,
    file: File,
    options: ConversionOptions
  ): Promise<SubmitResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    const headers: Record<string, string> = {};

    const token = await getTurnstileToken();
    if (token) {
      headers['X-Turnstile-Token'] = token;
    }

    const response = await this.fetchWithChallenge(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(this.getErrorMessage(error));
    }

    return response.json();
  }

  async submitMerge(
    endpoint: string,
    files: File[],
    options: ConversionOptions
  ): Promise<SubmitResponse> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    formData.append('options', JSON.stringify(options));

    const headers: Record<string, string> = {};

    const token = await getTurnstileToken();
    if (token) {
      headers['X-Turnstile-Token'] = token;
    }

    const response = await this.fetchWithChallenge(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(this.getErrorMessage(error));
    }

    return response.json();
  }

  async submitText(
    endpoint: string,
    text: string,
    options?: Record<string, unknown>
  ): Promise<SubmitResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = await getTurnstileToken();
    if (token) {
      headers['X-Turnstile-Token'] = token;
    }

    const response = await this.fetchWithChallenge(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify({ text, options: options || {} }),
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(this.getErrorMessage(error));
    }

    return response.json();
  }

  async submitInspection(
    endpoint: string,
    file: File,
    password?: string
  ): Promise<CertificateInfo> {
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password);
    }

    const headers: Record<string, string> = {};

    const token = await getTurnstileToken();
    if (token) {
      headers['X-Turnstile-Token'] = token;
    }

    const response = await this.fetchWithChallenge(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(this.getErrorMessage(error));
    }

    return response.json();
  }

  async submitInspectionText(
    endpoint: string,
    pem: string
  ): Promise<CertificateInfo> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = await getTurnstileToken();
    if (token) {
      headers['X-Turnstile-Token'] = token;
    }

    const response = await this.fetchWithChallenge(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify({ pem }),
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(this.getErrorMessage(error));
    }

    return response.json();
  }

  async submitCertConversion(
    endpoint: string,
    file: File,
    targetFormat: string,
    password?: string,
    outputPassword?: string
  ): Promise<SubmitResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetFormat', targetFormat);
    if (password) {
      formData.append('password', password);
    }
    if (outputPassword) {
      formData.append('outputPassword', outputPassword);
    }

    const headers: Record<string, string> = {};

    const token = await getTurnstileToken();
    if (token) {
      headers['X-Turnstile-Token'] = token;
    }

    const response = await this.fetchWithChallenge(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(this.getErrorMessage(error));
    }

    return response.json();
  }

  async submitArchive(
    endpoint: string,
    files: File[],
    format: string,
    password?: string
  ): Promise<SubmitResponse> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    formData.append('format', format);
    if (password) {
      formData.append('password', password);
    }

    const headers: Record<string, string> = {};

    const token = await getTurnstileToken();
    if (token) {
      headers['X-Turnstile-Token'] = token;
    }

    const response = await this.fetchWithChallenge(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(this.getErrorMessage(error));
    }

    return response.json();
  }

  async revealEmail(): Promise<string> {
    const headers: Record<string, string> = {};

    const token = await getTurnstileToken();
    if (token) {
      headers['X-Turnstile-Token'] = token;
    }

    const response = await this.fetchWithChallenge(`${this.baseUrl}/contact/email`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(this.getErrorMessage(error));
    }

    const data: { email: string } = await response.json();
    return data.email;
  }

  async pollJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await this.fetchWithChallenge(`${this.baseUrl}/queue/position/${jobId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(this.getErrorMessage(error));
    }

    return response.json();
  }

  async getStats(): Promise<{ filesProcessed: number; thanks: number }> {
    const response = await fetch(`${this.baseUrl}/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    return response.json();
  }

  async postThanks(): Promise<void> {
    const headers: Record<string, string> = {};

    const token = await getTurnstileToken();
    if (token) {
      headers['X-Turnstile-Token'] = token;
    }

    await this.fetchWithChallenge(`${this.baseUrl}/stats/thanks`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });
  }

  getDownloadUrl(jobId: string): string {
    return `${this.baseUrl}/download/${jobId}`;
  }

  getFileDownloadUrl(jobId: string, index: number): string {
    return `${this.baseUrl}/download/${jobId}/file/${index}`;
  }

  getZipDownloadUrl(jobId: string): string {
    return `${this.baseUrl}/download/${jobId}/zip`;
  }

  async submitDecompress(
    endpoint: string,
    file: File,
    password?: string
  ): Promise<SubmitResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password);
    }

    const headers: Record<string, string> = {};

    const token = await getTurnstileToken();
    if (token) {
      headers['X-Turnstile-Token'] = token;
    }

    const response = await this.fetchWithChallenge(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(this.getErrorMessage(error));
    }

    return response.json();
  }

  private async fetchWithChallenge(url: string, init?: RequestInit): Promise<Response> {
    const response = await fetch(url, init);

    if (response.headers.get('Cf-Mitigated') === 'challenge') {
      const token = await getTurnstileToken();
      if (token && init) {
        const retryHeaders = new Headers(init.headers);
        retryHeaders.set('X-Turnstile-Token', token);
        return fetch(url, { ...init, headers: retryHeaders });
      }
    }

    return response;
  }

  private getErrorMessage(error: ApiError): string {
    switch (error.code) {
      case 'QUEUE_FULL':
        return 'Server is busy. Please try again in a moment.';
      case 'FILE_TOO_LARGE':
        return 'File is too large. Maximum size is 20MB.';
      case 'VALIDATION_ERROR':
        return error.error || 'Invalid file or options.';
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment.';
      case 'CONVERSION_FAILED':
        return 'Processing failed. Please try a different file.';
      case 'NOT_FOUND':
        return 'Job not found or expired.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

export const apiClient = new ApiClient();
