import React, { useRef, useState } from 'react';
import { UploadCloud, Layers, Sparkles, CheckCircle2, ArrowDownToLine, Loader2, ImagePlus, ShieldCheck } from 'lucide-react';
import { ConverterSettings, FitMode, Language, OutputFormat } from '../types';
import { sampleImages, SampleImage } from '../utils/sampleImages';
import { t } from '../utils/translations';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onSampleSelected: (sample: SampleImage) => void;
  isProcessing: boolean;
  processingCount: number;
  settings: ConverterSettings;
  setSettings: React.Dispatch<React.SetStateAction<ConverterSettings>>;
  language: Language;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onSampleSelected,
  isProcessing,
  processingCount,
  settings,
  setSettings,
  language,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const imageFiles: File[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.type.startsWith('image/')) {
          imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
      if (filesArray.length > 0) {
        onFilesSelected(filesArray);
      }
      e.target.value = '';
    }
  };

  const fitPills: { id: FitMode; label: string }[] = [
    { id: 'cover', label: language === 'bn' ? 'কভার ও ক্রপ (নো বার)' : 'Cover & Crop' },
    { id: 'contain-blur', label: language === 'bn' ? 'ব্লার ব্যাকগ্রাউন্ড' : 'Blur Backdrop' },
    { id: 'contain-black', label: language === 'bn' ? 'কালো ব্যাকগ্রাউন্ড' : 'Solid Black' },
    { id: 'stretch', label: language === 'bn' ? 'স্ট্রেচ (হুবহু)' : 'Stretch' },
  ];

  const formatPills: { id: OutputFormat; label: string }[] = [
    { id: 'image/jpeg', label: 'JPG' },
    { id: 'image/png', label: 'PNG' },
    { id: 'image/webp', label: 'WEBP' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* 16:9 Aspect Ratio Hero Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/40 shadow-[0_0_50px_rgba(99,102,241,0.35)] scale-[1.01]'
            : 'border-slate-700/80 hover:border-indigo-500/80 bg-slate-900/60 hover:bg-slate-900/90 shadow-2xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Resolution Corner Watermark */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 border border-slate-800 text-[11px] font-mono font-semibold text-indigo-300 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          <span>1920 × 1080 px</span>
        </div>

        {/* Main Content Stage */}
        <div className="px-6 py-14 sm:py-20 flex flex-col items-center justify-center text-center relative z-10">
          {/* Animated Icon Avatar */}
          <div className="relative mb-6">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center transition-transform duration-300 ${
                isDragOver ? 'scale-110 bg-indigo-600 text-white' : 'bg-gradient-to-tr from-indigo-900/80 via-slate-800 to-slate-900 text-indigo-400 border border-indigo-500/30 group-hover:scale-105 group-hover:border-indigo-500/60'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-indigo-400" />
              ) : isDragOver ? (
                <ArrowDownToLine className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
              ) : (
                <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12" />
              )}
            </div>

            {/* Glowing ring animation on drag */}
            {isDragOver && (
              <div className="absolute inset-0 rounded-2xl animate-pulse-ring pointer-events-none" />
            )}
          </div>

          {/* Heading */}
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {isProcessing
                ? `${processingCount} ${t(language, 'processingCount')}`
                : isDragOver
                ? t(language, 'dragAnywhereTitle')
                : t(language, 'dropZoneTitle')}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-medium">
              {isProcessing
                ? t(language, 'processing')
                : t(language, 'dropZoneSubtitle')}
            </p>

            <p className="text-xs text-slate-400 pt-1">
              {t(language, 'dropZoneHint')}
            </p>
          </div>

          {/* Auto-download feature badge */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t(language, 'autoDownloadActive')}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t(language, 'instantSpeedBadge')}</span>
            </div>
          </div>
        </div>

        {/* Dropzone Footer Quick Config Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          {/* Fit Mode Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium">{t(language, 'fitMode')}:</span>
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {fitPills.map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSettings((s) => ({ ...s, fitMode: pill.id }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    settings.fitMode === pill.id
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">{t(language, 'formatTitle')}:</span>
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {formatPills.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSettings((s) => ({ ...s, format: fmt.id }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    settings.format === fmt.id
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Test Samples */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{t(language, 'testWithSample')}:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {sampleImages.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelected(sample)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 text-xs font-medium text-slate-200 transition-all cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'bn' ? sample.titleBn : sample.titleEn}</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {sample.aspect}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
