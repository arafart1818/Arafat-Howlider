export type FitMode = 'cover' | 'contain-blur' | 'contain-black' | 'stretch';

export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ConverterSettings {
  fitMode: FitMode;
  format: OutputFormat;
  quality: number; // 0.1 to 1.0 (for JPEG/WEBP)
  autoDownload: boolean;
  soundEnabled: boolean;
  blurStrength: number; // px for blur background
  customBgColor: string;
}

export interface ConvertedImage {
  id: string;
  name: string;
  originalName: string;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  convertedWidth: number;
  convertedHeight: number;
  convertedSize: number;
  format: OutputFormat;
  fitMode: FitMode;
  blob: Blob;
  dataUrl: string;
  timestamp: number;
  downloaded: boolean;
}

export type Language = 'bn' | 'en';
