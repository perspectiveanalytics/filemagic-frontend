import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../src/api/client';
import { useMultiFileConversion } from '../src/hooks/useMultiFileConversion';
import { useInspection } from '../src/hooks/useInspection';
import { useConversion } from '../src/hooks/useConversion';
import { useTextConversion } from '../src/hooks/useTextConversion';
import { useMergeConversion } from '../src/hooks/useMergeConversion';
import { useArchiveConversion } from '../src/hooks/useArchiveConversion';
import { useCertConversion } from '../src/hooks/useCertConversion';

vi.mock('../src/api/client', () => ({
  apiClient: {
    submitConversion: vi.fn(),
    submitDecompress: vi.fn(),
    submitInspection: vi.fn(),
    submitInspectionText: vi.fn(),
    submitText: vi.fn(),
    submitMerge: vi.fn(),
    submitArchive: vi.fn(),
    submitCertConversion: vi.fn(),
    pollJobStatus: vi.fn(),
    getDownloadUrl: (id: string) => `/api/download/${id}`,
    getZipDownloadUrl: (id: string) => `/api/download/${id}/zip`,
    getFileDownloadUrl: (id: string, index: number) => `/api/download/${id}/file/${index}`,
  },
}));

function deferred<T = any>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

const file = new File(['fixture'], 'input.bin');
const accepted = (jobId: string) => ({ jobId, position: 1, estimatedWait: 5 });
const completed = (name: string) => ({
  status: 'done', position: 0,
  metadata: { files: [{ index: 0, name, size: 7 }] },
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.mocked(apiClient.pollJobStatus).mockImplementation(() => new Promise(() => {}));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('multiple-file results', () => {
  it.each(['resolve', 'reject'] as const)('ignores an old upload that later %ss', async outcome => {
    const first = deferred();
    vi.mocked(apiClient.submitDecompress)
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(accepted('new'));
    const { result } = renderHook(() => useMultiFileConversion('/archive/decompress'));
    act(() => { void result.current.startConversion(file); });
    await act(async () => { await result.current.startConversion(file); });
    await act(async () => {
      if (outcome === 'resolve') first.resolve(accepted('old'));
      else first.reject(new Error('Old upload failed'));
    });
    expect(result.current.jobId).toBe('new');
    expect(result.current.status).toBe('queued');
    expect(apiClient.pollJobStatus).toHaveBeenCalledTimes(1);
    expect(apiClient.pollJobStatus).toHaveBeenCalledWith('new', expect.any(AbortSignal));
  });

  it('does not attach an old manifest to a newer job', async () => {
    const firstPoll = deferred();
    vi.mocked(apiClient.submitDecompress)
      .mockResolvedValueOnce(accepted('old'))
      .mockResolvedValueOnce(accepted('new'));
    vi.mocked(apiClient.pollJobStatus)
      .mockReturnValueOnce(firstPoll.promise)
      .mockResolvedValueOnce(completed('new.txt') as any);
    const { result } = renderHook(() => useMultiFileConversion('/archive/decompress'));
    await act(async () => { await result.current.startConversion(file); });
    await act(async () => { await result.current.startConversion(file); });
    await act(async () => { firstPoll.resolve(completed('old.txt')); });
    expect(result.current.files.map(item => item.name)).toEqual(['new.txt']);
    expect(result.current.zipDownloadUrl).toBe('/api/download/new/zip');
    expect(result.current.getFileUrl(0)).toBe('/api/download/new/file/0');
  });

  it.each(['reset', 'unmount'] as const)('does not restart polling after %s', async action => {
    const pendingPoll = deferred();
    vi.mocked(apiClient.submitConversion).mockResolvedValue(accepted('old'));
    vi.mocked(apiClient.pollJobStatus).mockReturnValue(pendingPoll.promise);
    const { result, unmount } = renderHook(() => useMultiFileConversion('/convert/pdf/extract-images'));
    await act(async () => { await result.current.startConversionWithOptions(file, {}); });
    const signal = vi.mocked(apiClient.pollJobStatus).mock.calls[0][1]!;
    expect(signal.aborted).toBe(false);
    act(() => { if (action === 'reset') result.current.reset(); else unmount(); });
    expect(signal.aborted).toBe(true);
    await act(async () => { pendingPoll.resolve({ status: 'queued', position: 2 }); });
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(apiClient.pollJobStatus).toHaveBeenCalledTimes(1);
    if (action === 'reset') expect(result.current.status).toBe('idle');
  });
});

describe('certificate inspection', () => {
  it.each(['resolve', 'reject'] as const)('ignores a superseded response that %ss', async outcome => {
    const pending = deferred();
    vi.mocked(apiClient.submitInspection).mockReturnValue(pending.promise);
    vi.mocked(apiClient.submitInspectionText).mockResolvedValue({ certCount: 2 } as any);
    const { result } = renderHook(() => useInspection('/inspect/certificate'));
    act(() => { void result.current.inspect(file); });
    await act(async () => { await result.current.inspectText('new certificate'); });
    await act(async () => {
      if (outcome === 'resolve') pending.resolve({ certCount: 1 });
      else pending.reject(new Error('old failure'));
    });
    expect(result.current.status).toBe('done');
    expect(result.current.result?.certCount).toBe(2);
  });

  it('keeps reset state when a request finishes late', async () => {
    const pending = deferred();
    vi.mocked(apiClient.submitInspectionText).mockReturnValue(pending.promise);
    const { result } = renderHook(() => useInspection('/inspect/certificate'));
    act(() => { void result.current.inspectText('certificate'); });
    act(() => result.current.reset());
    await act(async () => pending.resolve({ certCount: 1 }));
    expect(result.current.status).toBe('idle');
    expect(result.current.result).toBeNull();
  });
});

describe('single-result conversions', () => {
  it('uses the server queue budget instead of ending text jobs after one minute', async () => {
    vi.mocked(apiClient.submitText).mockResolvedValue({ ...accepted('queued'), timeoutSeconds: 120 });
    vi.mocked(apiClient.pollJobStatus).mockResolvedValue({ status: 'queued', position: 1 } as any);
    const { result } = renderHook(() => useTextConversion('/generate/qrcode'));
    await act(async () => { await result.current.generate('text'); });
    await act(async () => { await vi.advanceTimersByTimeAsync(65_000); });
    expect(result.current.status).toBe('queued');
    await act(async () => { await vi.advanceTimersByTimeAsync(65_000); });
    expect(result.current.status).toBe('error');
    expect(result.current.error).toMatch(/timed out/);
  });

  const cases = [
    { name: 'file', hook: () => useConversion('/convert/image'), api: 'submitConversion', start: (hook: any) => hook.startConversion(file, {}) },
    { name: 'text', hook: () => useTextConversion('/generate/qrcode'), api: 'submitText', start: (hook: any) => hook.generate('text') },
    { name: 'merge', hook: () => useMergeConversion('/merge/pdf'), api: 'submitMerge', start: (hook: any) => hook.startConversion([file], {}) },
    { name: 'archive', hook: () => useArchiveConversion('/archive/create'), api: 'submitArchive', start: (hook: any) => hook.startConversion([file], 'zip') },
    { name: 'certificate', hook: () => useCertConversion('/convert/certificate'), api: 'submitCertConversion', start: (hook: any) => hook.startConversion(file, 'pem') },
  ];

  for (const item of cases) {
    it(`${item.name}: applies the deadline advertised for this job`, async () => {
      vi.mocked(apiClient[item.api as keyof typeof apiClient] as any).mockResolvedValue({
        ...accepted('queued'), timeoutSeconds: 2,
      });
      vi.mocked(apiClient.pollJobStatus).mockResolvedValue({ status: 'queued', position: 1 } as any);
      const { result } = renderHook(item.hook as () => any);
      await act(async () => { await item.start(result.current); });
      await act(async () => { await vi.advanceTimersByTimeAsync(6_000); });
      expect(result.current.status).toBe('error');
      expect(result.current.error).toMatch(/timed out/);
    });

    it(`${item.name}: reset invalidates an upload in flight`, async () => {
      const pending = deferred();
      vi.mocked(apiClient[item.api as keyof typeof apiClient] as any).mockReturnValue(pending.promise);
      const { result } = renderHook(item.hook as () => any);
      act(() => { void item.start(result.current); });
      const signal = vi.mocked(apiClient[item.api as keyof typeof apiClient] as any).mock.calls[0].at(-1) as AbortSignal;
      expect(signal.aborted).toBe(false);
      act(() => result.current.reset());
      expect(signal.aborted).toBe(true);
      await act(async () => pending.resolve(accepted('old')));
      expect(result.current.status).toBe('idle');
      expect(apiClient.pollJobStatus).not.toHaveBeenCalled();
    });
  }

  it.each(['file', 'text'] as const)('%s previews release object URLs on unmount', async kind => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      blob: async () => new Blob(['image'], { type: 'image/png' }),
    }));
    const createObjectURL = vi.fn().mockReturnValue('blob:preview');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', class extends URL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = revokeObjectURL;
    });
    vi.mocked(apiClient.submitConversion).mockResolvedValue(accepted('image'));
    vi.mocked(apiClient.submitText).mockResolvedValue(accepted('image'));
    vi.mocked(apiClient.pollJobStatus).mockResolvedValue({ status: 'done' } as any);
    const hook = kind === 'file' ? () => useConversion('/convert/image') : () => useTextConversion('/generate/qrcode');
    const { result, unmount } = renderHook(hook as () => any);
    await act(async () => {
      if (kind === 'file') await result.current.startConversion(file, {});
      else await result.current.generate('image');
    });
    expect(result.current.previewUrl).toBe('blob:preview');
    expect(revokeObjectURL).not.toHaveBeenCalled();
    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });
});
