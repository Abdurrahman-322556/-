/**
 * Windows 11 Simulator with interactive desktop, classic system features,
 * factory reset ("Сброс этого ПК"), virtual software installation (Microsoft Store),
 * and Windows Recovery Environment (WinRE) with system restore.
 */
import React, { useState, useEffect } from 'react';
import { SystemProvider, useSystem } from './context/SystemContext';
import { Desktop } from './components/Desktop/Desktop';
import { Taskbar } from './components/Taskbar/Taskbar';
import { StartMenu } from './components/StartMenu/StartMenu';
import { SearchFlyout } from './components/SearchFlyout/SearchFlyout';
import { QuickSettings } from './components/QuickSettings/QuickSettings';
import { CalendarFlyout } from './components/CalendarFlyout/CalendarFlyout';

// System screens
import { WinRE } from './components/system/WinRE';
import { ResetScreen } from './components/system/ResetScreen';
import { RebootScreen } from './components/system/RebootScreen';
import { LockScreen } from './components/system/LockScreen';
import { UpdateScreen } from './components/system/UpdateScreen';
import { StartupSettingsScreen } from './components/system/StartupSettingsScreen';
import { UacDialog } from './components/dialogs/UacDialog';
import { SecurityErrorDialog } from './components/dialogs/SecurityErrorDialog';
import { FilePropertiesDialog } from './components/dialogs/FilePropertiesDialog';
import { playSound } from './utils/sound';

const Windows11OS: React.FC = () => {
  const {
    systemStatus,
    settings,
    uacRequest,
    confirmUac,
    cancelUac,
    apps,
    securityModal,
    closeSecurityModal,
    propertiesDialogFileId,
    closePropertiesDialog,
  } = useSystem();

  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Play startup sound on first load when interacting
  useEffect(() => {
    const handleFirstClick = () => {
      if (settings.soundEnabled) {
        playSound('startup', settings.volume / 100);
      }
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, [settings.soundEnabled, settings.volume]);

  const closeAllFlyouts = () => {
    setIsStartOpen(false);
    setIsSearchOpen(false);
    setIsQuickSettingsOpen(false);
    setIsCalendarOpen(false);
  };

  // Route depending on system state
  if (systemStatus === 'winre') {
    return <WinRE />;
  }

  if (systemStatus === 'startup_settings') {
    return <StartupSettingsScreen />;
  }

  if (systemStatus === 'updating') {
    return <UpdateScreen />;
  }

  if (systemStatus === 'resetting') {
    return <ResetScreen />;
  }

  if (systemStatus === 'rebooting') {
    return <RebootScreen />;
  }

  if (systemStatus === 'lockscreen') {
    return <LockScreen />;
  }

  return (
    <div
      onClick={closeAllFlyouts}
      className={`relative w-screen h-screen overflow-hidden ${
        settings.theme === 'dark' ? 'dark' : ''
      }`}
    >
      {/* Interactive Desktop Area */}
      <Desktop />

      {/* Start Menu Flyout */}
      <StartMenu
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        onOpenSearch={() => {
          setIsStartOpen(false);
          setIsSearchOpen(true);
        }}
      />

      {/* Search Flyout */}
      <SearchFlyout
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Action Center / Quick Settings */}
      <QuickSettings
        isOpen={isQuickSettingsOpen}
        onClose={() => setIsQuickSettingsOpen(false)}
      />

      {/* Calendar & Notifications Flyout */}
      <CalendarFlyout
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      {/* Windows 11 Taskbar */}
      <Taskbar
        onToggleStart={() => {
          setIsStartOpen(!isStartOpen);
          setIsSearchOpen(false);
          setIsQuickSettingsOpen(false);
          setIsCalendarOpen(false);
        }}
        isStartOpen={isStartOpen}
        onToggleSearch={() => {
          setIsSearchOpen(!isSearchOpen);
          setIsStartOpen(false);
          setIsQuickSettingsOpen(false);
          setIsCalendarOpen(false);
        }}
        isSearchOpen={isSearchOpen}
        onToggleQuickSettings={() => {
          setIsQuickSettingsOpen(!isQuickSettingsOpen);
          setIsStartOpen(false);
          setIsSearchOpen(false);
          setIsCalendarOpen(false);
        }}
        isQuickSettingsOpen={isQuickSettingsOpen}
        onToggleCalendar={() => {
          setIsCalendarOpen(!isCalendarOpen);
          setIsStartOpen(false);
          setIsSearchOpen(false);
          setIsQuickSettingsOpen(false);
        }}
        isCalendarOpen={isCalendarOpen}
      />

      {/* Root-Level System Security & UAC Modals */}
      <FilePropertiesDialog
        fileId={propertiesDialogFileId}
        onClose={closePropertiesDialog}
      />

      <SecurityErrorDialog
        isOpen={!!securityModal?.visible}
        title={securityModal?.title}
        message={securityModal?.message || ''}
        fileId={securityModal?.fileId}
        onClose={closeSecurityModal}
      />

      <UacDialog
        isOpen={!!uacRequest}
        appName={apps.find((a) => a.id === uacRequest?.appId)?.name || uacRequest?.appId || 'Системный компонент'}
        elevationLevel={uacRequest?.level || 'admin'}
        onConfirm={confirmUac}
        onCancel={cancelUac}
      />
    </div>
  );
};

export default function App() {
  return (
    <SystemProvider>
      <Windows11OS />
    </SystemProvider>
  );
}
