import React from 'react';
import { X, Crop, Maximize2, Image as ImageIcon, Sparkles, Check, Palette } from 'lucide-react';
import { ConverterSettings, FitMode, Language, OutputFormat } from '../types';
import { t } from '../utils/translations';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ConverterSettings;
  setSettings: React.Dispatch<React.SetStateAction<ConverterSettings>>;
  language: Language;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  language,
}) => {
  if (!isOpen) return null;

  const fitModes: { id: FitMode; titleKey: 'fitCover' | 'fitContainBlur' | 'fitContainSolid' | 'fitStretch'; descKey: 'fitCoverDesc' | 'fitContainBlurDesc' | 'fitContainSolidDesc' | 'fitStretchDesc'; icon: React.ReactNode }[] = [
    {
      id: 'cover',
      titleKey: 'fitCover',
      descKey: 'fitCoverDesc',
      icon: <Crop className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'contain-blur',
      titleKey: 'fitContainBlur',
      descKey: 'fitContainBlurDesc',
      icon: <Sparkles className="w-5 h-5 text-violet-400" />,
    },
    {
      id: 'contain-black',
      titleKey: 'fitContainSolid',
      descKey: 'fitContainSolidDesc',
      icon: <Palette className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'stretch',
      titleKey: 'fitStretch',
      descKey: 'fitStretchDesc',
      icon: <Maximize2 className="w-5 h-5 text-cyan-400" />,
    },
  ];

  const formats: { id: OutputFormat; label: string; ext: string }[] = [
    { id: 'image/jpeg', label: 'JPG', ext: '.jpg' },
    { id: 'image/png', label: 'PNG', ext: '.png' },
    { id: 'image/webp', label: 'WEBP', ext: '.webp' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t(language, 'settings')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Fit Mode */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              {t(language, 'fitMode')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fitModes.map((item) => {
                const active = settings.fitMode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSettings((s) => ({ ...s, fitMode: item.id }))}
                    className={`relative p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      active
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-800/60 border-slate-750 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 rounded-lg bg-slate-900/70 border border-slate-750">
                        {item.icon}
                      </div>
                      {active && (
                        <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 mb-1">
                        {t(language, item.titleKey)}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {t(language, item.descKey)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              {t(language, 'formatTitle')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {formats.map((fmt) => {
                const active = settings.format === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setSettings((s) => ({ ...s, format: fmt.id }))}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer font-medium text-xs ${
                      active
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-sm block">{fmt.label}</span>
                    <span className="text-[10px] text-slate-400">{fmt.ext}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality Slider (for JPG and WEBP) */}
          {settings.format !== 'image/png' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-200">
                  {t(language, 'qualityTitle')}
                </label>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {Math.round(settings.quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1"
                step="0.05"
                value={settings.quality}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, quality: parseFloat(e.target.value) }))
                }
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Small file (60%)</span>
                <span>Balanced (85%)</span>
                <span>Maximum (100%)</span>
              </div>
            </div>
          )}

          {/* Auto-download Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-750">
            <div>
              <div className="text-xs font-bold text-slate-100">
                {t(language, 'autoDownloadActive')}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t(language, 'autoDownloadActiveDesc')}
              </p>
            </div>
            <button
              onClick={() => setSettings((s) => ({ ...s, autoDownload: !s.autoDownload }))}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.autoDownload ? 'bg-indigo-600 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            {t(language, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
};
