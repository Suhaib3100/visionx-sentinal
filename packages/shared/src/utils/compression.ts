/**
 * Compression Utilities
 * For file compression and decompression
 */

import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export async function compressString(input: string): Promise<Buffer> {
  return await gzip(Buffer.from(input, 'utf-8'));
}

export async function decompressString(input: Buffer): Promise<string> {
  const decompressed = await gunzip(input);
  return decompressed.toString('utf-8');
}

export async function compressFiles(
  files: Array<{ path: string; content: string }>
): Promise<Buffer> {
  const json = JSON.stringify(files);
  return await compressString(json);
}

export async function decompressFiles(
  compressed: Buffer
): Promise<Array<{ path: string; content: string }>> {
  const json = await decompressString(compressed);
  return JSON.parse(json);
}

export function getCompressionRatio(original: number, compressed: number): number {
  return Math.round(((original - compressed) / original) * 100);
}
