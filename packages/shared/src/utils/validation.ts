/**
 * Validation Utilities
 * For input validation and sanitization
 */

import { SNAPSHOT_CONFIG } from '../constants';

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidTeamName(name: string): boolean {
  return name.length >= 3 && name.length <= 50 && /^[a-zA-Z0-9\s-_]+$/.test(name);
}

export function isAllowedFileExtension(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return (SNAPSHOT_CONFIG.ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

export function isIgnoredPath(path: string): boolean {
  return SNAPSHOT_CONFIG.IGNORED_PATTERNS.some(pattern => 
    path.includes(pattern)
  );
}

export function sanitizeFilePath(path: string): string {
  return path.replace(/\.\./g, '').replace(/^\/+/, '');
}

export function validateSnapshotSize(sizeInBytes: number): boolean {
  const maxBytes = SNAPSHOT_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024;
  return sizeInBytes <= maxBytes;
}

export function validateFileCount(count: number): boolean {
  return count <= SNAPSHOT_CONFIG.MAX_FILES;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
