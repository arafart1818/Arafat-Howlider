import React from 'react';
import { ArrowDownToLine, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';

interface FullScreenDragOverlayProps {
  isVisible: boolean;
  language: Language;
}

export const FullScreenDragOverlay: React.FC<FullScreenDragOverlayProps> = ({
  isVisible,
  language,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl aspect-video rounded-3xl border-4 border-dashed border-indigo-500 bg-indigo-950/40 p-8 flex flex-col items-center justify-center text-center shadow-[0_0_80px_rgba(99,102,241,0.5)]">
        <div className="w-24 h-24 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/50 animate-bounce">
          <ArrowDownToLine className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          {t(language, 'dragAnywhereTitle')}
        </h2>
        <p className="text-base text-indigo-200 font-medium max-w-md">
          {t(language, 'dragAnywhereSubtitle')}
        </p>
        <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>1920 × 1080 Full HD (16:9)</span>
        </div>
      </div>
    </div>
  );
};
