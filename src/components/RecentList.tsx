import React, { useState } from 'react';
import { Download, Copy, Check, Eye, Trash2, Archive, ArrowRight, Image as ImageIcon, Sparkles } from 'lucide-react';
import JSZip from 'jszip';
import { ConvertedImage, Language } from '../types';
import { formatBytes, downloadConvertedImage } from '../utils/imageProcessor';
import { t } from '../utils/translations';

interface RecentListProps {
  images: ConvertedImage[];
  onSelectImage: (image: ConvertedImage) => void;
  onDeleteImage: (id: string) => void;
  onClearAll: () => void;
  language: Language;
}

export const RecentList: React.FC<RecentListProps> = ({
  images,
  onSelectImage,
  onDeleteImage,
  onClearAll,
  language,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = async (item: ConvertedImage) => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        // Can copy PNG blobs directly to clipboard
        let blobToCopy = item.blob;
        if (item.format !== 'image/png') {
          // If not png, copy as png to satisfy clipboard API
          const img = new Image();
          img.src = item.dataUrl;
          await new Promise((res) => (img.onload = res));
          const canvas = document.createElement('canvas');
          canvas.width = item.convertedWidth;
          canvas.height = item.convertedHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          blobToCopy = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blobToCopy }),
        ]);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        // Fallback: copy base64 data URL
        await navigator.clipboard.writeText(item.dataUrl);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
    }
  };

  const handleDownloadZip = async () => {
    if (images.length === 0 || isZipping) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder('1920x1080_converted_images');

      images.forEach((item, index) => {
        const uniqueName = `${String(index + 1).padStart(2, '0')}_${item.name}`;
        folder?.file(uniqueName, item.blob);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `1920x1080_images_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error('Error generating ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  if (images.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-10 rounded-3xl border border-slate-800/80 bg-slate-900/30 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500">
          <ImageIcon className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 mb-1">
          {t(language, 'recentConversions')}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {t(language, 'noRecent')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>{t(language, 'recentConversions')}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {images.length}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {images.length > 1 && (
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Creating ZIP...' : t(language, 'downloadAllZip')}</span>
            </button>
          )}

          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs font-medium transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t(language, 'clearAll')}</span>
          </button>
        </div>
      </div>

      {/* Grid of converted items */}
      <div className="grid grid-cols-1 gap-3">
        {images.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 transition-all gap-4 shadow-lg shadow-black/20"
          >
            {/* Left: Thumbnail & Details */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {/* 16:9 Thumbnail preview */}
              <div
                onClick={() => onSelectImage(item)}
                className="relative w-28 sm:w-36 aspect-video shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group-hover:border-indigo-500/50 cursor-pointer shadow-md"
              >
                <img
                  src={item.dataUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Eye className="w-5 h-5 drop-shadow" />
                </div>
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] font-bold text-cyan-300 border border-white/10">
                  1080p
                </div>
              </div>

              {/* Text Info */}
              <div className="min-w-0 space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs sm:text-sm text-slate-100 truncate block">
                    {item.name}
                  </span>
                </div>

                {/* Dimensions Transformation Badge */}
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                    {item.originalWidth} × {item.originalHeight}
                  </span>
                  <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="font-mono font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
                    1920 × 1080 (Full HD)
                  </span>
                </div>

                {/* Metadata tags */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                  <span className="uppercase font-bold text-slate-300 font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">
                    {item.format.replace('image/', '')}
                  </span>
                  <span>•</span>
                  <span>{formatBytes(item.convertedSize)}</span>
                  <span>•</span>
                  <span className="capitalize">{item.fitMode.replace('-', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80 shrink-0">
              {/* Copy Image Button */}
              <button
                onClick={() => handleCopy(item)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                title={t(language, 'copyImage')}
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-xs">{t(language, 'copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{t(language, 'copyImage')}</span>
                  </>
                )}
              </button>

              {/* View/Inspect Button */}
              <button
                onClick={() => onSelectImage(item)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
                title={t(language, 'viewFull')}
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Re-download button */}
              <button
                onClick={() => downloadConvertedImage(item)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t(language, 'downloadAgain')}</span>
              </button>

              {/* Delete button */}
              <button
                onClick={() => onDeleteImage(item.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
