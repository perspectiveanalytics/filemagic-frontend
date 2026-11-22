import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { apiClient } from '../src/api/client';
import { getTurnstileToken } from '../src/turnstile';

vi.mock('../src/i18n', () => ({ i18n: { locale: 'en' } }));
vi.mock('../src/turnstile', () => ({ getTurnstileToken: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => vi.unstubAllGlobals());

it('does not upload when cancelled while waiting for the challenge token', async () => {
  let resolveToken!: (value: string) => void;
  vi.mocked(getTurnstileToken).mockReturnValue(new Promise(resolve => { resolveToken = resolve; }));
  const controller = new AbortController();
  const pending = apiClient.submitConversion('/convert/image', new File(['test'], 'image.png'), {}, controller.signal);
  controller.abort();
  resolveToken('token');
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(fetch).not.toHaveBeenCalled();
});

it('forwards cancellation to an inspection request and a status request', async () => {
  vi.mocked(getTurnstileToken).mockResolvedValue(null);
  vi.mocked(fetch).mockImplementation(async () => new Response('{}', { status: 200 }));
  const controller = new AbortController();
  await apiClient.submitInspectionText('/inspect/certificate/text', 'certificate', controller.signal);
  expect(fetch).toHaveBeenLastCalledWith(expect.stringContaining('/inspect/certificate/text'), expect.objectContaining({ signal: controller.signal }));
  await apiClient.pollJobStatus('job', controller.signal);
  expect(fetch).toHaveBeenLastCalledWith(expect.stringContaining('/queue/position/job'), expect.objectContaining({ signal: controller.signal }));
});

it('does not replay a challenged upload after cancellation', async () => {
  let resolveRetryToken!: (value: string) => void;
  vi.mocked(getTurnstileToken)
    .mockResolvedValueOnce('first-token')
    .mockImplementationOnce(() => new Promise(resolve => { resolveRetryToken = resolve; }));
  vi.mocked(fetch).mockResolvedValue(new Response('', { status: 403, headers: { 'Cf-Mitigated': 'challenge' } }));
  const controller = new AbortController();
  const pending = apiClient.submitText('/generate/qrcode', 'text', {}, controller.signal);
  await vi.waitFor(() => expect(getTurnstileToken).toHaveBeenCalledTimes(2));
  controller.abort();
  resolveRetryToken('retry-token');
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(fetch).toHaveBeenCalledTimes(1);
});
