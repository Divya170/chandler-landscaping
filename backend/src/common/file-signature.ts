/**
 * Detects a file's real type from its first bytes (magic numbers) and checks it agrees with the extension,
 * so a renamed executable can't be uploaded as "drawings.pdf".
 */
export type FileKind = { mime: string; ext: string; isImage: boolean };

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ENQUIRY_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];

const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  xls: 'application/vnd.ms-excel',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

type Family = 'pdf' | 'ole' | 'zip' | 'jpeg' | 'png' | 'webp';

function family(buf: Buffer): Family | null {
  if (!buf || buf.length < 12) return null;
  if (buf.toString('ascii', 0, 5) === '%PDF-') return 'pdf';
  if (buf.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) return 'ole'; // .doc / .xls
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) return 'zip'; // .docx / .xlsx
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

const EXPECTED: Record<string, Family> = { pdf: 'pdf', doc: 'ole', xls: 'ole', docx: 'zip', xlsx: 'zip', jpg: 'jpeg', jpeg: 'jpeg', png: 'png', webp: 'webp' };

export const extOf = (name: string) => (name.split('.').pop() || '').toLowerCase();

/** Returns the verified kind, or null when the content doesn't match the extension (or the extension isn't allowed). */
export function verifyFile(name: string, buf: Buffer, allowed: string[]): FileKind | null {
  const ext = extOf(name);
  if (!allowed.includes(ext)) return null;
  if (family(buf) !== EXPECTED[ext]) return null;
  // Office Open XML files are zips — make sure it's the right kind of zip.
  if (ext === 'docx' && !buf.includes(Buffer.from('word/'))) return null;
  if (ext === 'xlsx' && !buf.includes(Buffer.from('xl/'))) return null;
  return { mime: MIME[ext], ext: ext === 'jpeg' ? 'jpg' : ext, isImage: ['jpg', 'jpeg', 'png', 'webp'].includes(ext) };
}
