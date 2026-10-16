import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { hashAlgorithms, hashBlob } from '../src/lib/hash.ts';

test('all algorithms preserve bytes across chunks and handle empty input', async () => {
  for (const size of [0, 3, 2 * 1024 * 1024 + 17]) {
    const input = new Uint8Array(size).map((_, index) => index % 251);
    const progress = [];
    const actual = await hashBlob(new Blob([input]), value => progress.push(value));
    for (const [name, digest] of Object.entries(actual)) {
      assert.equal(digest, createHash(name.replace('-', '').toLowerCase()).update(input).digest('hex'));
    }
    if (size) assert.equal(progress.at(-1), 1);
  }
});

test('MD5 encodes the high length word at 512 MiB', () => {
  const block = new Uint8Array(2 * 1024 * 1024);
  const actual = hashAlgorithms.MD5.create();
  const expected = createHash('md5');
  for (let i = 0; i < 256; i++) { actual.update(block); expected.update(block); }
  assert.equal(Buffer.from(actual.digest()).toString('hex'), expected.digest('hex'));
});
