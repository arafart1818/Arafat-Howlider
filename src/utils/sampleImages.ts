export interface SampleImage {
  id: string;
  name: string;
  titleBn: string;
  titleEn: string;
  aspect: string;
  url: string;
}

// Generate crisp SVG data URLs representing different input dimensions
const createSampleSvg = (
  width: number,
  height: number,
  gradientStart: string,
  gradientEnd: string,
  title: string,
  subtitle: string
): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradientStart}" />
        <stop offset="100%" stop-color="${gradientEnd}" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#grad)" />
    <rect width="${width}" height="${height}" fill="url(#grid)" />
    <circle cx="${width / 2}" cy="${height / 2 - 40}" r="${Math.min(width, height) * 0.18}" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="4"/>
    <text x="${width / 2}" y="${height / 2 + 50}" font-family="system-ui, sans-serif" font-size="${Math.max(18, Math.min(width, height) * 0.055)}" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
    <text x="${width / 2}" y="${height / 2 + 90}" font-family="system-ui, sans-serif" font-size="${Math.max(14, Math.min(width, height) * 0.035)}" fill="rgba(255,255,255,0.85)" text-anchor="middle">${subtitle}</text>
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-dasharray="8 8" rx="16"/>
    <text x="40" y="55" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="rgba(255,255,255,0.9)">${width} × ${height}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const sampleImages: SampleImage[] = [
  {
    id: 'sample-portrait',
    name: 'mobile-portrait-1080x1920.svg',
    titleBn: 'ভার্টিক্যাল মোবাইল ছবি (9:16)',
    titleEn: 'Vertical Portrait (1080×1920)',
    aspect: '1080 × 1920',
    url: createSampleSvg(1080, 1920, '#4f46e5', '#ec4899', 'Mobile Portrait Photo', 'Original 1080×1920 (9:16)'),
  },
  {
    id: 'sample-square',
    name: 'instagram-square-1080x1080.svg',
    titleBn: 'স্কয়ার ছবি (1:1)',
    titleEn: 'Square Image (1080×1080)',
    aspect: '1080 × 1080',
    url: createSampleSvg(1080, 1080, '#06b6d4', '#3b82f6', 'Square Social Media', 'Original 1080×1080 (1:1)'),
  },
  {
    id: 'sample-ultrawide',
    name: 'panoramic-landscape-2560x1080.svg',
    titleBn: 'প্যানোরামিক ল্যান্ডস্কেপ (21:9)',
    titleEn: 'Panoramic Ultrawide (2560×1080)',
    aspect: '2560 × 1080',
    url: createSampleSvg(2560, 1080, '#10b981', '#059669', 'Panoramic Ultrawide Shot', 'Original 2560×1080 (21:9)'),
  },
];
