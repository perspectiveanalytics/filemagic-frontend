import { i18n } from '../i18n';
import type { SubmitResponse, JobStatusResponse, ApiError, ConversionOptions, CertificateInfo } from '../types/api';
import { getTurnstileToken } from '../turnstile';

class ApiClient {
  private baseUrl = import.meta.env.PUBLIC_API_BASE_URL
    || import.meta.env.VITE_API_BASE_URL
    || (import.meta.env.DEV ? '/api' : 'https://api.filemagic.app/api');

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
      throw await this.responseError(response);
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
      throw await this.responseError(response);
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
      throw await this.responseError(response);
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
      throw await this.responseError(response);
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
      throw await this.responseError(response);
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
      throw await this.responseError(response);
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
      throw await this.responseError(response);
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
      throw await this.responseError(response);
    }

    const data: { email: string } = await response.json();
    return data.email;
  }

  async pollJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await this.fetchWithChallenge(`${this.baseUrl}/queue/position/${jobId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw await this.responseError(response);
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
      throw await this.responseError(response);
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

  private async responseError(response: Response): Promise<Error> {
    const fr = i18n.locale === 'fr';
    if (response.status === 403) return new Error(fr
      ? 'La vérification de sécurité a échoué. Rechargez la page puis réessayez.'
      : 'Security verification failed. Reload the page and try again.');
    if (response.status === 429) return new Error(fr
      ? 'Trop de demandes. Patientez un moment avant de réessayer.'
      : 'Too many requests. Please wait a moment before trying again.');
    let error: ApiError | undefined;
    try { error = await response.json(); } catch { /* Proxies may return HTML. */ }
    return new Error(this.getErrorMessage(error ?? { code: 'INTERNAL_ERROR', error: '' }));
  }

  private getErrorMessage(error: ApiError): string {
    const fr = i18n.locale === 'fr';
    switch (error.code) {
      case 'QUEUE_FULL':
        return fr ? 'Le serveur est occupé. Réessayez dans un moment.' : 'Server is busy. Please try again in a moment.';
      case 'FILE_TOO_LARGE':
        return fr ? 'Le fichier dépasse la taille autorisée. Choisissez un fichier plus petit.' : 'File exceeds the size limit. Choose a smaller file.';
      case 'VALIDATION_ERROR':
        return fr ? 'Vérifiez le format du fichier et les options, puis réessayez.' : 'Check the file format and options, then try again.';
      case 'RATE_LIMITED':
        return fr ? 'Trop de demandes. Patientez un moment.' : 'Too many requests. Please wait a moment.';
      case 'CONVERSION_FAILED':
        return fr ? 'Le traitement a échoué. Essayez avec un autre fichier.' : 'Processing failed. Please try a different file.';
      case 'NOT_FOUND':
        return fr ? 'Le résultat a expiré. Relancez le traitement.' : 'Result expired. Please process the file again.';
      default:
        return fr ? 'Le service est indisponible. Réessayez dans un moment.' : 'Service unavailable. Please try again in a moment.';
    }
  }
}

export const apiClient = new ApiClient();
