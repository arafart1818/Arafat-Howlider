/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle, Info, Monitor, Cpu, ShieldCheck } from 'lucide-react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { FullScreenDragOverlay } from './components/FullScreenDragOverlay';
import { SettingsPanel } from './components/SettingsPanel';
import { RecentList } from './components/RecentList';
import { ImageDetailModal } from './components/ImageDetailModal';
import { ConverterSettings, ConvertedImage, Language } from './types';
import { convertTo1920x1080, downloadConvertedImage, downloadMultipleImages } from './utils/imageProcessor';
import { playDownloadChime } from './utils/sound';
import { SampleImage } from './utils/sampleImages';
import { t } from './utils/translations';

const DEFAULT_SETTINGS: ConverterSettings = {
  fitMode: 'cover',
  format: 'image/jpeg',
  quality: 0.95,
  autoDownload: true, // Enabled by default as specifically requested!
  soundEnabled: true,
  blurStrength: 28,
  customBgColor: '#000000',
};

export default function App() {
  const [settings, setSettings] = useState<ConverterSettings>(() => {
    try {
      const saved = localStorage.getItem('auto_1080p_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [language, setLanguage] = useState<Language>('bn'); // Bengali by default
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState<ConvertedImage | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dragCounter = useRef(0);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('auto_1080p_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Global window drag and drop listener
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current += 1;
      if (e.dataTransfer?.types.includes('Files')) {
        setIsWindowDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsWindowDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsWindowDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const imageFiles: File[] = [];
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          if (file.type.startsWith('image/')) {
            imageFiles.push(file);
          }
        }
        if (imageFiles.length > 0) {
          processFiles(imageFiles);
        }
      }
    };

    // Global Paste Listener (Ctrl+V / Cmd+V)
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const imageFiles: File[] = [];
        for (let i = 0; i < e.clipboardData.files.length; i++) {
          const file = e.clipboardData.files[i];
          if (file.type.startsWith('image/')) {
            imageFiles.push(file);
          }
        }
        if (imageFiles.length > 0) {
          processFiles(imageFiles);
        }
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('paste', handlePaste);
    };
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  /**
   * Process multiple files, convert them to 1920x1080 and trigger auto-download
   */
  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProcessingCount(files.length);

    const convertedResults: ConvertedImage[] = [];

    try {
      for (const file of files) {
        try {
          const result = await convertTo1920x1080(file, settings, file.name);
          convertedResults.push(result);
        } catch (err) {
          console.error('Failed to convert file:', file.name, err);
        }
      }

      if (convertedResults.length > 0) {
        // Prepend new results
        setImages((prev) => [...convertedResults, ...prev]);

        // Auto Download execution as requested!
        if (settings.autoDownload) {
          if (convertedResults.length === 1) {
            downloadConvertedImage(convertedResults[0]);
          } else {
            downloadMultipleImages(convertedResults, 350);
          }

          if (settings.soundEnabled) {
            playDownloadChime();
          }

          // Trigger confetti burst
          try {
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.65 },
              colors: ['#6366f1', '#a855f7', '#06b6d4', '#10b981'],
            });
          } catch {
            // ignore confetti error if canvas context issues
          }

          showToast(
            language === 'bn'
              ? `${convertedResults.length}টি ছবি ১৯২০x১০৮০ তে কনভার্ট হয়ে ডাউনলোড শুরু হয়েছে!`
              : `${convertedResults.length} image(s) converted to 1920x1080 and download started!`
          );
        } else {
          showToast(
            language === 'bn'
              ? `${convertedResults.length}টি ছবি ১৯২০x১০৮০ তে কনভার্ট সম্পন্ন!`
              : `${convertedResults.length} image(s) converted to 1920x1080!`
          );
        }
      }
    } finally {
      setIsProcessing(false);
      setProcessingCount(0);
    }
  };

  /**
   * Test sample image conversion
   */
  const handleSampleSelected = async (sample: SampleImage) => {
    setIsProcessing(true);
    setProcessingCount(1);
    try {
      const result = await convertTo1920x1080(sample.url, settings, sample.name);
      setImages((prev) => [result, ...prev]);

      if (settings.autoDownload) {
        downloadConvertedImage(result);
        if (settings.soundEnabled) {
          playDownloadChime();
        }
        try {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.65 },
          });
        } catch {
          // ignore
        }
        showToast(
          language === 'bn'
            ? 'নমুনা ছবিটি ১৯২০x১০৮০ তে কনভার্ট হয়ে স্বয়ংক্রিয়ভাবে ডাউনলোড হয়েছে!'
            : 'Sample image converted to 1920x1080 & downloaded!'
        );
      }
    } catch (err) {
      console.error('Failed to convert sample image:', err);
    } finally {
      setIsProcessing(false);
      setProcessingCount(0);
    }
  };

  const handleDeleteImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleClearAll = () => {
    setImages([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative selection:bg-indigo-500 selection:text-white">
      {/* Full Screen Drag Overlay */}
      <FullScreenDragOverlay isVisible={isWindowDragging} language={language} />

      {/* Header */}
      <Header
        settings={settings}
        setSettings={setSettings}
        language={language}
        setLanguage={setLanguage}
        openSettingsModal={() => setIsSettingsOpen(true)}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-4">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-between">
        <div className="space-y-8">
          {/* Hero Banner / Instructions */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t(language, 'aspect169Badge')}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {language === 'bn' ? (
                <>
                  ছবি ড্রপ করলেই{' '}
                  <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
                    ১৯২০×১০৮০
                  </span>{' '}
                  কনভার্ট ও অটো ডাউনলোড
                </>
              ) : (
                <>
                  Drop Any Image to Convert to{' '}
                  <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
                    1920×1080
                  </span>{' '}
                  & Auto Download
                </>
              )}
            </h2>

            <p className="text-sm sm:text-base text-slate-400 font-normal max-w-2xl mx-auto">
              {language === 'bn'
                ? 'যেকোনো সাইজের বা রেজোলিউশনের ছবি এখানে টেনে এনে ছেড়ে দিন। স্বয়ংক্রিয়ভাবে ফুল এইচডি (1080p) ফরম্যাটে কনভার্ট হয়ে ডাউনলোড শুরু হবে।'
                : 'Drag and drop any picture from your desktop or folder. It will instantly rescale to standard Full HD (1920x1080) and download automatically.'}
            </p>
          </div>

          {/* Interactive Drag & Drop Stage */}
          <DropZone
            onFilesSelected={processFiles}
            onSampleSelected={handleSampleSelected}
            isProcessing={isProcessing}
            processingCount={processingCount}
            settings={settings}
            setSettings={setSettings}
            language={language}
          />

          {/* Feature Highlights Grid */}
          <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  {language === 'bn' ? 'স্ট্যান্ডার্ড 16:9 1080p' : 'Standard 16:9 Full HD'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {language === 'bn'
                    ? 'ইউটিউব থাম্বনেইল, ওয়ালপেপার, স্লাইডশো ও সব ডিসপ্লের পারফেক্ট সাইজ।'
                    : 'Ideal for YouTube thumbnails, desktop wallpapers, slides & streaming displays.'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  {language === 'bn' ? 'তাত্ক্ষণিক অটো ডাউনলোড' : 'Instant Auto-Trigger'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {language === 'bn'
                    ? 'ছবি দেওয়ার পর কোনো বাটনে ক্লিক করতে হবে না, নিমিষেই ডাউনলোড শুরু হবে।'
                    : 'Zero extra clicks. File is automatically converted and downloaded on drop.'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  {language === 'bn' ? '১০০% প্রাইভেট ও অফলাইন' : '100% Private in Browser'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {language === 'bn'
                    ? 'আপনার ছবি সার্ভারে পাঠানো হয় না, সম্পূর্ণ কাজ আপনার ডিভাইসের ব্রাউজারেই হয়।'
                    : 'Client-side processing via Canvas. Photos never leave your personal computer.'}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Converted Items */}
          <RecentList
            images={images}
            onSelectImage={setSelectedImage}
            onDeleteImage={handleDeleteImage}
            onClearAll={handleClearAll}
            language={language}
          />
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
          <p>
            {language === 'bn'
              ? 'অটো ১৯২০x১০৮০ ইমেজ কনভার্টার • ড্র্যাগ করুন, কনভার্ট করুন ও ডাউনলোড করুন'
              : 'Auto 1920x1080 Image Converter & Auto Downloader • Drag, convert & enjoy'}
          </p>
        </footer>
      </main>

      {/* Settings Modal */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        language={language}
      />

      {/* Image Detail & Zoom Modal */}
      <ImageDetailModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        language={language}
      />
    </div>
  );
}
