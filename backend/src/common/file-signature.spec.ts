import { verifyFile } from './file-signature';

const pad = (head: number[]) => Buffer.concat([Buffer.from(head), Buffer.alloc(32)]);
const JPEG = pad([0xff, 0xd8, 0xff, 0xe0]);
const PNG = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(16)]);
const EXE = Buffer.concat([Buffer.from('MZ'), Buffer.alloc(40)]);
const PHOTOS = ['jpg', 'jpeg', 'png', 'webp'];

describe('verifyFile (photo uploads)', () => {
  it('accepts real JPEG, PNG and WebP content with a matching extension', () => {
    expect(verifyFile('front.jpg', JPEG, PHOTOS)).toMatchObject({ mime: 'image/jpeg', ext: 'jpg' });
    expect(verifyFile('front.JPEG', JPEG, PHOTOS)).toMatchObject({ mime: 'image/jpeg', ext: 'jpg' });
    expect(verifyFile('lawn.png', PNG, PHOTOS)).toMatchObject({ mime: 'image/png', ext: 'png' });
    expect(verifyFile('garden.webp', WEBP, PHOTOS)).toMatchObject({ mime: 'image/webp', ext: 'webp' });
  });

  it('rejects an executable renamed to .jpg', () => {
    expect(verifyFile('photo.jpg', EXE, PHOTOS)).toBeNull();
  });

  it('rejects content that disagrees with the extension', () => {
    expect(verifyFile('photo.png', JPEG, PHOTOS)).toBeNull();
  });

  it('rejects extensions that are not allowed', () => {
    expect(verifyFile('notes.pdf', Buffer.from('%PDF-1.7 ' + 'x'.repeat(20)), PHOTOS)).toBeNull();
    expect(verifyFile('noextension', JPEG, PHOTOS)).toBeNull();
  });

  it('rejects tiny or empty buffers', () => {
    expect(verifyFile('a.jpg', Buffer.alloc(0), PHOTOS)).toBeNull();
    expect(verifyFile('a.jpg', Buffer.from([0xff, 0xd8, 0xff]), PHOTOS)).toBeNull();
  });
});
