import { ConvertedImage, ConverterSettings, OutputFormat } from '../types';

export const TARGET_WIDTH = 1920;
export const TARGET_HEIGHT = 1080;

/**
 * Loads an image file into an HTMLImageElement
 */
export const loadImage = (source: File | Blob | string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const url = URL.createObjectURL(source);
      img.src = url;
    }
  });
};

/**
 * Converts any image to 1920x1080 using the selected settings
 */
export const convertTo1920x1080 = async (
  fileOrUrl: File | Blob | string,
  settings: ConverterSettings,
  fileName = 'image.png'
): Promise<ConvertedImage> => {
  const img = await loadImage(fileOrUrl);
  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;
  const originalSize = fileOrUrl instanceof File || fileOrUrl instanceof Blob ? fileOrUrl.size : 0;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;
  const ctx = canvas.getContext('2d', { alpha: true });

  if (!ctx) {
    throw new Error('Canvas 2D context could not be created');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const { fitMode, format, quality, customBgColor } = settings;

  if (fitMode === 'stretch') {
    // Exact stretch
    ctx.drawImage(img, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
  } else if (fitMode === 'cover') {
    // Fill the 1920x1080 frame, crop excess centered
    const scale = Math.max(TARGET_WIDTH / originalWidth, TARGET_HEIGHT / originalHeight);
    const scaledW = originalWidth * scale;
    const scaledH = originalHeight * scale;
    const offsetX = (TARGET_WIDTH - scaledW) / 2;
    const offsetY = (TARGET_HEIGHT - scaledH) / 2;

    ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
  } else if (fitMode === 'contain-blur') {
    // 1. Draw blurred, darkened background to fill 1920x1080
    ctx.save();
    const bgScale = Math.max(TARGET_WIDTH / originalWidth, TARGET_HEIGHT / originalHeight);
    const bgW = originalWidth * bgScale;
    const bgH = originalHeight * bgScale;
    const bgX = (TARGET_WIDTH - bgW) / 2;
    const bgY = (TARGET_HEIGHT - bgH) / 2;

    // Filter for blur
    ctx.filter = `blur(${settings.blurStrength || 30}px) brightness(0.65) saturate(1.2)`;
    ctx.drawImage(img, bgX, bgY, bgW, bgH);
    ctx.restore();

    // 2. Draw centered foreground image with subtle shadow
    const fgScale = Math.min(TARGET_WIDTH / originalWidth, TARGET_HEIGHT / originalHeight);
    const fgW = originalWidth * fgScale;
    const fgH = originalHeight * fgScale;
    const fgX = (TARGET_WIDTH - fgW) / 2;
    const fgY = (TARGET_HEIGHT - fgH) / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;
    ctx.drawImage(img, fgX, fgY, fgW, fgH);
    ctx.restore();
  } else {
    // contain-black / solid background
    if (format === 'image/jpeg' || customBgColor !== 'transparent') {
      ctx.fillStyle = customBgColor || '#000000';
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
    }

    const scale = Math.min(TARGET_WIDTH / originalWidth, TARGET_HEIGHT / originalHeight);
    const targetW = originalWidth * scale;
    const targetH = originalHeight * scale;
    const targetX = (TARGET_WIDTH - targetW) / 2;
    const targetY = (TARGET_HEIGHT - targetH) / 2;

    ctx.drawImage(img, targetX, targetY, targetW, targetH);
  }

  // Convert to Blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create image blob'));
      },
      format,
      format === 'image/png' ? undefined : quality
    );
  });

  const dataUrl = canvas.toDataURL(format, format === 'image/png' ? undefined : quality);

  // Generate output filename
  const rawName = (fileOrUrl instanceof File ? fileOrUrl.name : fileName) || 'converted-image';
  const dotIdx = rawName.lastIndexOf('.');
  const baseName = dotIdx > 0 ? rawName.substring(0, dotIdx) : rawName;
  const ext = getExtensionForFormat(format);
  const outputFileName = `${baseName}-1920x1080.${ext}`;

  return {
    id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    name: outputFileName,
    originalName: rawName,
    originalWidth,
    originalHeight,
    originalSize: originalSize || blob.size,
    convertedWidth: TARGET_WIDTH,
    convertedHeight: TARGET_HEIGHT,
    convertedSize: blob.size,
    format,
    fitMode,
    blob,
    dataUrl,
    timestamp: Date.now(),
    downloaded: false,
  };
};

export const getExtensionForFormat = (format: OutputFormat): string => {
  switch (format) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/png':
    default:
      return 'png';
  }
};

/**
 * Triggers a download of the converted image
 */
export const downloadConvertedImage = (item: ConvertedImage): void => {
  const url = URL.createObjectURL(item.blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = item.name;
  document.body.appendChild(a);
  a.click();

  // Cleanup after trigger
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
};

/**
 * Downloads multiple converted images staggered
 */
export const downloadMultipleImages = (items: ConvertedImage[], delayMs = 350): void => {
  items.forEach((item, index) => {
    setTimeout(() => {
      downloadConvertedImage(item);
    }, index * delayMs);
  });
};

/**
 * Format bytes to readable string (KB, MB)
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
