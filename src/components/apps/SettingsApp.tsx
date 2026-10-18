import React, { useState } from 'react';
import {
  Laptop,
  Palette,
  RotateCcw,
  Shield,
  Layers,
  Volume2,
  Sun,
  HardDrive,
  Info,
  Clock,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  RefreshCw,
  DownloadCloud,
  CheckCircle2,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { WALLPAPERS, USER_AVATAR, WINDOWS_VERSIONS } from '../../utils/initialData';
import { AppIcon } from '../common/AppIcon';
import { WindowsVersion } from '../../types/system';

export const SettingsApp: React.FC = () => {
  const {
    settings,
    updateSettings,
    apps,
    uninstallApp,
    restorePoints,
    createRestorePoint,
    restoreToPoint,
    deleteRestorePoint,
    resetThisPC,
    bootToWinRE,
    currentVersion,
    bootMode,
    installWindowsUpdate,
    bootIntoSafeMode,
    exitSafeMode,
    openStartupSettings,
    openWindow,
  } = useSystem();

  const [activeTab, setActiveTab] = useState<'system' | 'personalization' | 'recovery' | 'updates' | 'apps' | 'about'>('system');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCreateRpModal, setShowCreateRpModal] = useState(false);
  const [newRpName, setNewRpName] = useState('');
  const [restoringRpId, setRestoringRpId] = useState<string | null>(null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  const isDark = settings.theme === 'dark';
  const currentInfo = WINDOWS_VERSIONS[currentVersion] || WINDOWS_VERSIONS.win11_23h2_pro;

  const handleCheckUpdates = () => {
    setIsCheckingUpdates(true);
    setTimeout(() => {
      setIsCheckingUpdates(false);
    }, 1200);
  };

  const handleCreateRestorePoint = () => {
    if (!newRpName.trim()) return;
    createRestorePoint(newRpName.trim());
    setNewRpName('');
    setShowCreateRpModal(false);
  };

  const handleApplyRestorePoint = async (pointId: string) => {
    setRestoringRpId(pointId);
    await new Promise((r) => setTimeout(r, 1000));
    await restoreToPoint(pointId);
    setRestoringRpId(null);
  };

  return (
    <div className="flex-1 flex h-full text-xs overflow-hidden">
      {/* Sidebar Navigation */}
      <div
        className={`w-52 border-r p-3 flex flex-col gap-1 shrink-0 ${
          isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50/80 border-slate-200'
        }`}
      >
        {/* User Card */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg mb-3 bg-zinc-500/5">
          <img
            src={USER_AVATAR}
            alt="User"
            className="w-10 h-10 rounded-full object-cover border border-zinc-400/20"
          />
          <div className="overflow-hidden">
            <div className="font-semibold text-xs truncate">{settings.registeredOwner}</div>
            <div className="text-[10px] text-zinc-400 truncate">Локальная учетная запись</div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
            activeTab === 'system'
              ? 'bg-sky-500/15 text-sky-500 font-medium'
              : 'hover:bg-zinc-500/10 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          <Laptop size={16} />
          <span>Система</span>
        </button>

        <button
          onClick={() => setActiveTab('personalization')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
            activeTab === 'personalization'
              ? 'bg-sky-500/15 text-sky-500 font-medium'
              : 'hover:bg-zinc-500/10 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          <Palette size={16} />
          <span>Персонализация</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
            activeTab === 'recovery'
              ? 'bg-sky-500/15 text-sky-500 font-medium'
              : 'hover:bg-zinc-500/10 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          <RotateCcw size={16} className="text-amber-500" />
          <span className="font-medium text-amber-500">Восстановление и сброс</span>
        </button>

        <button
          onClick={() => setActiveTab('updates')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
            activeTab === 'updates'
              ? 'bg-sky-500/15 text-sky-500 font-medium'
              : 'hover:bg-zinc-500/10 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          <RefreshCw size={16} className="text-sky-500" />
          <span className="font-medium text-sky-500">Центр обновления</span>
        </button>

        <button
          onClick={() => setActiveTab('apps')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
            activeTab === 'apps'
              ? 'bg-sky-500/15 text-sky-500 font-medium'
              : 'hover:bg-zinc-500/10 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          <Layers size={16} />
          <span>Приложения</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
            activeTab === 'about'
              ? 'bg-sky-500/15 text-sky-500 font-medium'
              : 'hover:bg-zinc-500/10 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          <Info size={16} />
          <span>О системе</span>
        </button>
      </div>

      {/* Main Settings Page Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: SYSTEM */}
        {activeTab === 'system' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Система</h2>
              <p className="text-zinc-400 text-xs">Дисплей, звук, питание и управление памятью</p>
            </div>

            {/* Display & Brightness Card */}
            <div className="p-4 rounded-xl border bg-zinc-500/5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Sun size={18} className="text-amber-500" />
                <div className="flex-1">
                  <div className="font-medium">Яркость дисплея</div>
                  <div className="text-[11px] text-zinc-400">Регулировка яркости встроенного экрана</div>
                </div>
                <span className="font-mono text-xs">{settings.brightness}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={settings.brightness}
                onChange={(e) => updateSettings({ brightness: parseInt(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Sound & Volume Card */}
            <div className="p-4 rounded-xl border bg-zinc-500/5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Volume2 size={18} className="text-sky-500" />
                <div className="flex-1">
                  <div className="font-medium">Громкость звука</div>
                  <div className="text-[11px] text-zinc-400">Системные звуки и звуковые эффекты</div>
                </div>
                <span className="font-mono text-xs">{settings.volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: parseInt(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />

              <div className="flex items-center justify-between pt-2 border-t border-zinc-500/10">
                <span className="text-[11px]">Звуковые эффекты Windows</span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Recovery Shortcut Card */}
            <div
              onClick={() => setActiveTab('recovery')}
              className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/30 flex items-center justify-between cursor-pointer hover:bg-amber-500/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <RotateCcw size={20} className="text-amber-500" />
                <div>
                  <div className="font-medium text-amber-600 dark:text-amber-400">
                    Восстановление системы и сброс до заводских настроек
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Сброс этого ПК, контрольные точки восстановления, среда WinRE
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-400" />
            </div>
          </div>
        )}

        {/* TAB 2: PERSONALIZATION */}
        {activeTab === 'personalization' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Персонализация</h2>
              <p className="text-zinc-400 text-xs">Фон рабочего стола, темы оформления и акцентные цвета</p>
            </div>

            {/* Theme mode toggle */}
            <div className="p-4 rounded-xl border bg-zinc-500/5 flex items-center justify-between">
              <div>
                <div className="font-medium">Режим оформления</div>
                <div className="text-[11px] text-zinc-400">Выберите светлую или темную тему Windows 11</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`px-3 py-1.5 rounded-lg border font-medium ${
                    settings.theme === 'light'
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  Светлая
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`px-3 py-1.5 rounded-lg border font-medium ${
                    settings.theme === 'dark'
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  Темная
                </button>
              </div>
            </div>

            {/* Wallpapers grid */}
            <div className="flex flex-col gap-3">
              <div className="font-medium">Выберите фоновый рисунок</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WALLPAPERS.map((wp) => (
                  <div
                    key={wp.id}
                    onClick={() => updateSettings({ wallpaper: wp.url, theme: wp.theme })}
                    className={`group relative rounded-xl overflow-hidden aspect-video border-2 cursor-pointer transition-all ${
                      settings.wallpaper === wp.url ? 'border-sky-500 ring-2 ring-sky-500/30' : 'border-transparent hover:border-zinc-400'
                    }`}
                  >
                    {wp.url.startsWith('linear-gradient') ? (
                      <div className="w-full h-full" style={{ background: wp.url }} />
                    ) : (
                      <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] text-white text-center truncate">
                      {wp.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Taskbar alignment */}
            <div className="p-4 rounded-xl border bg-zinc-500/5 flex items-center justify-between">
              <div>
                <div className="font-medium">Выравнивание панели задач</div>
                <div className="text-[11px] text-zinc-400">По центру (стиль Windows 11) или по левому краю</div>
              </div>
              <select
                value={settings.taskbarAlignment}
                onChange={(e) => updateSettings({ taskbarAlignment: e.target.value as 'center' | 'left' })}
                className={`px-3 py-1.5 rounded-lg border outline-none ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300'
                }`}
              >
                <option value="center">По центру</option>
                <option value="left">По левому краю</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 3: RECOVERY & FACTORY RESET & WINRE */}
        {activeTab === 'recovery' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-amber-500">Восстановление системы</h2>
              <p className="text-zinc-400 text-xs">
                Сброс параметров компьютера к заводским, управление точками восстановления и запуск среды WinRE
              </p>
            </div>

            {/* Section 1: Reset this PC ("Сбросить этот ПК") */}
            <div className="p-4 rounded-xl border bg-zinc-500/5 flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-sm">Сбросить этот ПК</div>
                <div className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                  Если компьютер работает нестабильно, его сброс может помочь. Вы можете сохранить свои файлы или удалить их, а затем переустановить Windows.
                </div>
              </div>
              <button
                onClick={() => setShowResetModal(true)}
                className="shrink-0 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs transition-colors shadow-sm"
              >
                Сбросить ПК
              </button>
            </div>

            {/* Section 2: Advanced startup / WinRE */}
            <div className="p-4 rounded-xl border bg-blue-500/5 border-blue-500/20 flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-sm flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Shield size={16} />
                  <span>Особые варианты загрузки (Среда восстановления WinRE)</span>
                </div>
                <div className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                  Перезапуск компьютера в среду восстановления Windows (Windows Recovery Environment) для восстановления из контрольных точек, исправления неполадок при загрузке или использования командной строки WinRE.
                </div>
              </div>
              <button
                onClick={bootToWinRE}
                className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-sm"
              >
                Перезагрузить сейчас
              </button>
            </div>

            {/* Section 2.5: Safe Mode (Безопасный режим) */}
            <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/30 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-sm flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <ShieldAlert size={16} />
                    <span>Безопасный режим (Safe Mode)</span>
                  </div>
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                    Запуск системы с ограниченным набором файлов и драйверов. Позволяет выявлять и устранять программные конфликты и системные неполадки.
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {bootMode !== 'normal' ? (
                    <button
                      onClick={exitSafeMode}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-sm"
                    >
                      Выйти из безопасного режима
                    </button>
                  ) : (
                    <button
                      onClick={() => bootIntoSafeMode('safemode')}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs transition-colors shadow-sm"
                    >
                      Запустить в Safe Mode
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-amber-500/15 text-[11px]">
                <span className="text-zinc-400">
                  Текущий режим: {bootMode !== 'normal' ? <strong className="text-amber-500">Безопасный режим активен</strong> : 'Обычная загрузка'}
                </span>
                <button
                  onClick={openStartupSettings}
                  className="text-sky-500 hover:underline cursor-pointer"
                >
                  Все параметры загрузки (F1-F9) &gt;
                </button>
              </div>
            </div>

            {/* Section 3: System Restore Points */}
            <div className="p-4 rounded-xl border bg-zinc-500/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">Контрольные точки восстановления системы</div>
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                    Возврат состояния системы, реестра и программ к предыдущему моменту времени.
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateRpModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-500 text-sky-500 hover:bg-sky-500/10 transition-colors"
                >
                  <Plus size={14} />
                  <span>Создать точку</span>
                </button>
              </div>

              {/* Restore Points List */}
              <div className="flex flex-col gap-2 mt-1">
                {restorePoints.length === 0 ? (
                  <div className="text-zinc-400 py-3 text-center">Нет сохраненных точек восстановления</div>
                ) : (
                  restorePoints.map((rp) => (
                    <div
                      key={rp.id}
                      className="p-3 rounded-lg border bg-white dark:bg-zinc-800/80 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="overflow-hidden">
                        <div className="font-medium text-xs truncate">{rp.name}</div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(rp.timestamp).toLocaleString('ru-RU')}
                          </span>
                          <span>·</span>
                          <span>{rp.description}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApplyRestorePoint(rp.id)}
                          disabled={restoringRpId !== null}
                          className="px-2.5 py-1 rounded-md bg-sky-500 text-white font-medium text-[11px] hover:bg-sky-600 transition-colors disabled:opacity-50"
                        >
                          {restoringRpId === rp.id ? 'Восстановление...' : 'Восстановить'}
                        </button>

                        {restorePoints.length > 1 && (
                          <button
                            onClick={() => deleteRestorePoint(rp.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10"
                            title="Удалить точку"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: WINDOWS UPDATE (Центр обновления Windows) */}
        {activeTab === 'updates' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4 pb-2 border-b border-zinc-500/10">
              <div>
                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  <RefreshCw size={20} className="text-sky-500" />
                  <span>Центр обновления Windows</span>
                </h2>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Загрузка и установка официальных обновлений Windows 11, сборок 24H1 Pro, 25H2 Pro и последней версии
                </p>
              </div>

              <button
                onClick={handleCheckUpdates}
                disabled={isCheckingUpdates}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                <RefreshCw size={13} className={isCheckingUpdates ? 'animate-spin' : ''} />
                <span>{isCheckingUpdates ? 'Проверка...' : 'Проверить наличие обновлений'}</span>
              </button>
            </div>

            {/* Current OS status banner */}
            <div className="p-4 rounded-xl border bg-zinc-500/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                <div>
                  <div className="font-semibold text-xs">
                    Текущая установленная система: {currentInfo.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Сборка ОС: {currentInfo.build} · {currentInfo.experiencePack}
                  </div>
                </div>
              </div>
              <button
                onClick={() => openWindow('winver')}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-500/10"
              >
                Сведения Winver
              </button>
            </div>

            {/* Available Editions / Updates List */}
            <div className="flex flex-col gap-3">
              <div className="font-semibold text-xs text-zinc-400 uppercase tracking-wider">
                Доступные выпуски и обновления Windows 11
              </div>

              {Object.values(WINDOWS_VERSIONS).map((ver) => {
                const isCurrent = ver.id === currentVersion;

                return (
                  <div
                    key={ver.id}
                    className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
                      isCurrent
                        ? 'bg-sky-500/10 border-sky-500/40 shadow-xs'
                        : isDark
                        ? 'bg-zinc-800/60 border-zinc-700 hover:border-zinc-500'
                        : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{ver.name}</h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500 text-white">
                              Установлено
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          Версия: <strong>{ver.version}</strong> · Сборка: <strong>{ver.build}</strong> · Размер: {ver.updateSize}
                        </div>
                      </div>

                      {!isCurrent ? (
                        <button
                          onClick={() => installWindowsUpdate(ver.id as WindowsVersion)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs transition-colors shadow-xs shrink-0 cursor-pointer"
                        >
                          <DownloadCloud size={14} />
                          <span>Обновить сейчас</span>
                        </button>
                      ) : (
                        <span className="text-emerald-500 font-medium text-xs flex items-center gap-1 shrink-0">
                          <Check size={14} />
                          <span>Активно</span>
                        </span>
                      )}
                    </div>

                    {/* Features list */}
                    <div className="pt-2 border-t border-zinc-500/10">
                      <div className="text-[11px] font-medium text-zinc-400 mb-1">Основные новшества:</div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {ver.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-sky-500" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: APPS */}
        {activeTab === 'apps' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Установленные приложения</h2>
              <p className="text-zinc-400 text-xs">Управление программами и компонентами Windows 11</p>
            </div>

            <div className="flex flex-col gap-2">
              {apps
                .filter((a) => a.isInstalled)
                .map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl border bg-zinc-500/5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg p-1 bg-zinc-500/10 flex items-center justify-center">
                        <AppIcon icon={app.icon} size={22} />
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{app.name}</div>
                        <div className="text-[10px] text-zinc-400">
                          Версия {app.version} · {app.size} · {app.category}
                        </div>
                      </div>
                    </div>

                    {!app.isDefault ? (
                      <button
                        onClick={() => uninstallApp(app.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={13} />
                        <span>Удалить</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-400 bg-zinc-500/10 px-2 py-1 rounded">
                        Системный компонент
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 5: ABOUT */}
        {activeTab === 'about' && (
          <div className="max-w-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">О системе</h2>
                <p className="text-zinc-400 text-xs">Характеристики устройства и спецификации Windows</p>
              </div>
              <button
                onClick={() => openWindow('winver')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white font-medium text-xs hover:bg-sky-600 transition-colors"
              >
                <ExternalLink size={13} />
                <span>Открыть Winver</span>
              </button>
            </div>

            {/* Device specs */}
            <div className="p-4 rounded-xl border bg-zinc-500/5 flex flex-col gap-2.5">
              <div className="font-semibold text-xs mb-1">Характеристики устройства</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <span className="text-zinc-400">Имя устройства</span>
                <span className="font-medium">{settings.computerName}</span>
                <span className="text-zinc-400">Процессор</span>
                <span className="font-medium">13th Gen Intel(R) Core(TM) i9-13900K 3.00 GHz</span>
                <span className="text-zinc-400">Оперативная память</span>
                <span className="font-medium">32,0 ГБ (доступно 31,8 ГБ)</span>
                <span className="text-zinc-400">Тип системы</span>
                <span className="font-medium">64-разрядная ОС, процессор x64</span>
                <span className="text-zinc-400">Владелец</span>
                <span className="font-medium">{settings.registeredOwner}</span>
              </div>
            </div>

            {/* Windows specs */}
            <div className="p-4 rounded-xl border bg-zinc-500/5 flex flex-col gap-2.5">
              <div className="font-semibold text-xs mb-1">Характеристики Windows</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <span className="text-zinc-400">Выпуск</span>
                <span className="font-medium">{currentInfo.edition}</span>
                <span className="text-zinc-400">Версия</span>
                <span className="font-medium">{currentInfo.version} ({currentInfo.name})</span>
                <span className="text-zinc-400">Сборка ОС</span>
                <span className="font-medium font-mono">{currentInfo.build}</span>
                <span className="text-zinc-400">Взаимодействие</span>
                <span className="font-medium text-[10px] text-zinc-300">{currentInfo.experiencePack}</span>
                <span className="text-zinc-400">Режим загрузки</span>
                <span className={bootMode !== 'normal' ? 'font-bold text-amber-500' : 'font-medium text-emerald-500'}>
                  {bootMode !== 'normal' ? 'Безопасный режим (Safe Mode)' : 'Обычный'}
                </span>
                <span className="text-zinc-400">Среда восстановления</span>
                <span className="font-medium text-emerald-500">WinRE включена (активна)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: RESET THIS PC */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 win-acrylic">
          <div
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl ${
              isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold">Сбросить этот компьютер?</h3>
                <p className="text-xs text-zinc-400">Выберите вариант сброса Windows 11</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 my-4">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  resetThisPC('keep_files');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all hover:border-sky-500 ${
                  isDark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-semibold text-xs text-sky-500">Сохранить мои файлы</div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Удаляет установленные приложения и сбрасывает настройки системы, но сохраняет ваши личные файлы на рабочем столе и в документах.
                </div>
              </button>

              <button
                onClick={() => {
                  setShowResetModal(false);
                  resetThisPC('remove_all');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all hover:border-red-500 ${
                  isDark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-semibold text-xs text-red-500">Удалить все (Полный сброс)</div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Удаляет абсолютно все личные файлы, программы и настройки. Восстанавливает систему к первозданному заводскому состоянию.
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-500/10"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE RESTORE POINT */}
      {showCreateRpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 win-acrylic">
          <div
            className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl ${
              isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-slate-200 text-zinc-900'
            }`}
          >
            <h3 className="text-base font-semibold mb-2">Создать контрольную точку</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Введите понятное описание для идентификации этой точки восстановления.
            </p>

            <input
              type="text"
              value={newRpName}
              onChange={(e) => setNewRpName(e.target.value)}
              placeholder="Например: Перед установкой нового ПО"
              className={`w-full px-3 py-2 rounded-lg border text-xs outline-none mb-4 ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300'
              }`}
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateRpModal(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs hover:bg-zinc-500/10"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateRestorePoint}
                disabled={!newRpName.trim()}
                className="px-3 py-1.5 rounded-lg bg-sky-500 text-white font-medium text-xs hover:bg-sky-600 disabled:opacity-50"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
