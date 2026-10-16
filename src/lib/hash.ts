import { md5, sha1 } from '@noble/hashes/legacy.js';
import { sha256, sha384, sha512 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

export const hashAlgorithms = { MD5: md5, 'SHA-1': sha1, 'SHA-256': sha256, 'SHA-384': sha384, 'SHA-512': sha512 };

export async function hashBlob(data: Blob, onProgress: (progress: number) => void) {
  const hashes = Object.entries(hashAlgorithms).map(([name, algorithm]) => [name, algorithm.create()] as const);
  const chunkSize = 2 * 1024 * 1024;
  for (let offset = 0; offset < data.size; offset += chunkSize) {
    const bytes = new Uint8Array(await data.slice(offset, offset + chunkSize).arrayBuffer());
    for (const [, hash] of hashes) hash.update(bytes);
    onProgress(Math.min((offset + bytes.length) / data.size, 1));
  }
  return Object.fromEntries(hashes.map(([name, hash]) => [name, bytesToHex(hash.digest())]));
}
