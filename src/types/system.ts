export type PrincipalType =
  | 'user'
  | 'admins'
  | 'admin'
  | 'system'
  | 'trustedinstaller'
  | 'interactive';

export interface FilePermission {
  principal: PrincipalType;
  principalName: string;
  allowFullControl: boolean;
  allowModify: boolean;
  allowRead: boolean;
  allowWrite: boolean;
  allowRename: boolean;
  denyRename?: boolean;
}

export interface FileSystemItem {
  id: string;
  name: string;
  path: string; // e.g., 'C:/Users/User/Desktop/Notes.txt'
  isDirectory: boolean;
  content?: string;
  size?: number; // bytes
  updatedAt: string;
  icon?: string;
  owner?: PrincipalType;
  permissions?: FilePermission[];
  isReadOnly?: boolean;
  isHidden?: boolean;
}

export type AppCategory = 'System' | 'Productivity' | 'Development' | 'Entertainment' | 'Utilities';

export interface AppDefinition {
  id: string;
  name: string;
  icon: string; // identifier or Lucide icon key
  description: string;
  category: AppCategory;
  size: string;
  rating: number;
  isInstalled: boolean;
  isDefault: boolean;
  hasDesktopIcon: boolean;
  executableName: string;
  version: string;
}

export type ElevationLevel = 'user' | 'admin' | 'system' | 'trustedinstaller';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  snapState?: 'left' | 'right' | null;
  elevationLevel?: ElevationLevel;
  customProps?: Record<string, unknown>;
}

export interface SystemSettings {
  theme: 'dark' | 'light';
  wallpaper: string; // image url or gradient key
  accentColor: string; // hex or tailwind token
  soundEnabled: boolean;
  volume: number; // 0 - 100
  brightness: number; // 0 - 100
  wifi: boolean;
  bluetooth: boolean;
  nightLight: boolean;
  airplaneMode: boolean;
  taskbarAlignment: 'center' | 'left';
  computerName: string;
  registeredOwner: string;
}

export interface RestorePoint {
  id: string;
  name: string;
  timestamp: string;
  description: string;
  snapshot: {
    files: FileSystemItem[];
    installedAppIds: string[];
    settings: SystemSettings;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  appName: string;
  time: string;
  unread: boolean;
}

export type WindowsVersion =
  | 'win11_23h2_pro'
  | 'win11_24h1_pro'
  | 'win11_25h2_pro'
  | 'win11_latest';

export type BootMode = 'normal' | 'safemode' | 'safemode_network' | 'safemode_cmd';

export interface WindowsVersionInfo {
  id: WindowsVersion;
  name: string;
  version: string;
  build: string;
  edition: string;
  features: string[];
  releaseDate: string;
  updateSize: string;
  experiencePack: string;
}

export type SystemStatus =
  | 'desktop'
  | 'lockscreen'
  | 'resetting'
  | 'rebooting'
  | 'winre'
  | 'bsod'
  | 'updating'
  | 'startup_settings';

export interface UpdateProgressState {
  targetVersion: WindowsVersion;
  percentage: number;
  phase: 'downloading' | 'installing' | 'working_on_updates';
}

export interface ResetProgressState {
  mode: 'keep_files' | 'remove_all';
  phase: 'preparing' | 'resetting' | 'installing' | 'finalizing';
  percentage: number;
}
