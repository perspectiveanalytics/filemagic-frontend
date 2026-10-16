import { hashBlob } from '../lib/hash';

self.onmessage = async ({ data }: MessageEvent<Blob>) => {
  try {
    const results = await hashBlob(data, progress => self.postMessage({ progress }));
    self.postMessage({ results });
  } catch {
    self.postMessage({ error: true });
  }
};
