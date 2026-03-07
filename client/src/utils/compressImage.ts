const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = src;
  });

interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

export const compressImage = async (
  dataUrl: string,
  { maxDimension = 1200, quality = 0.80 }: CompressOptions = {},
): Promise<Blob> => {
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/jpeg',
      quality,
    );
  });
};

export const compressProfileImage = (dataUrl: string): Promise<Blob> =>
  compressImage(dataUrl, { maxDimension: 400, quality: 0.85 });

export const compressListingImage = (dataUrl: string): Promise<Blob> =>
  compressImage(dataUrl, { maxDimension: 1200, quality: 0.80 });
