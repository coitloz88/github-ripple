import sharp from 'sharp';

export async function fetchAvatarBase64(url: string): Promise<string> {
  const separator = url.includes('?') ? '&' : '?';
  const res = await fetch(`${url}${separator}s=64`);
  if (!res.ok) {
    throw new Error(`Failed to fetch avatar ${url}: ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const normalized = await sharp(buf).png().toBuffer();
  return `data:image/png;base64,${normalized.toString('base64')}`;
}
