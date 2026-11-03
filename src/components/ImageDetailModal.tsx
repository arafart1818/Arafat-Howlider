import React from 'react';
import { X, Download, Copy, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { ConvertedImage, Language } from '../types';
import { formatBytes, downloadConvertedImage } from '../utils/imageProcessor';
import { t } from '../utils/translations';

interface ImageDetailModalProps {
  image: ConvertedImage | null;
  onClose: () => void;
  language: Language;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  image,
  onClose,
  language,
}) => {
  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="min-w-0 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="font-bold text-white text-sm sm:text-base truncate">
              {image.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview Canvas Stage (16:9) */}
        <div className="p-4 sm:p-6 bg-slate-950 flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 relative shadow-2xl flex items-center justify-center">
            <img
              src={image.dataUrl}
              alt={image.name}
              className="w-full h-full object-contain"
            />
            {/* Watermark badge */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-cyan-300">
              1920 × 1080 (16:9)
            </div>
          </div>
        </div>

        {/* Stats & Comparison Strip */}
        <div className="p-6 bg-slate-900/80 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-850/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">{t(language, 'resolution')}</span>
            <div className="flex items-center gap-1 font-mono font-bold text-slate-200">
              <span>{image.originalWidth}×{image.originalHeight}</span>
              <ArrowRight className="w-3 h-3 text-indigo-400" />
              <span className="text-indigo-400">1920×1080</span>
            </div>
          </div>

          <div className="bg-slate-850/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">{t(language, 'fileSize')}</span>
            <div className="font-mono font-bold text-slate-200">
              {formatBytes(image.convertedSize)}
            </div>
          </div>

          <div className="bg-slate-850/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">{t(language, 'formatTitle')}</span>
            <div className="font-mono font-bold uppercase text-slate-200">
              {image.format.replace('image/', '')}
            </div>
          </div>

          <div className="bg-slate-850/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">{t(language, 'fitMode')}</span>
            <div className="font-bold text-slate-200 capitalize">
              {image.fitMode.replace('-', ' ')}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
          <a
            href={image.dataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open raw in tab</span>
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t(language, 'close')}
            </button>
            <button
              onClick={() => downloadConvertedImage(image)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t(language, 'downloadAgain')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
