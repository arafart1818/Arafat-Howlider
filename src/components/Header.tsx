import React from 'react';
import { Sparkles, Volume2, VolumeX, Globe, ArrowDownToLine, SlidersHorizontal } from 'lucide-react';
import { ConverterSettings, Language } from '../types';
import { t } from '../utils/translations';

interface HeaderProps {
  settings: ConverterSettings;
  setSettings: React.Dispatch<React.SetStateAction<ConverterSettings>>;
  language: Language;
  setLanguage: (lang: Language) => void;
  openSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  setSettings,
  language,
  setLanguage,
  openSettingsModal,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-cyan-400">
              <span className="font-extrabold text-sm tracking-tighter bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                1080p
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">
                {t(language, 'appTitle')}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                1920 × 1080
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              {t(language, 'appSubtitle')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Auto Download Status Indicator */}
          <button
            onClick={() => setSettings((s) => ({ ...s, autoDownload: !s.autoDownload }))}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              settings.autoDownload
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'
            }`}
            title={
              settings.autoDownload
                ? t(language, 'autoDownloadActiveDesc')
                : t(language, 'autoDownloadOff')
            }
          >
            <ArrowDownToLine className={`w-3.5 h-3.5 ${settings.autoDownload ? 'animate-bounce text-emerald-400' : ''}`} />
            <span className="hidden xs:inline">
              {settings.autoDownload ? t(language, 'autoDownloadActive') : t(language, 'autoDownloadOff')}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                settings.autoDownload ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-500'
              }`}
            />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
            className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
              settings.soundEnabled
                ? 'bg-slate-800/80 border-slate-700 text-cyan-400 hover:bg-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={t(language, 'soundToggle')}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            title="বাংলা / English"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={openSettingsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t(language, 'settings')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
