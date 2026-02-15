/**
 * Hash Utilities
 * For file and content hashing
 */

import * as crypto from 'crypto';

export function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function hashFile(content: Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function generateSnapshotHash(files: Array<{ path: string; content: string }>): string {
  const sortedFiles = files
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(f => `${f.path}:${hashString(f.content)}`)
    .join('|');
  
  return hashString(sortedFiles);
}

export function verifyHash(content: string, expectedHash: string): boolean {
  return hashString(content) === expectedHash;
}
