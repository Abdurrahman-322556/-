import { ElevationLevel, FilePermission, FileSystemItem, PrincipalType } from '../types/system';

export interface PrincipalInfo {
  id: PrincipalType;
  name: string;
  category: 'user' | 'group' | 'system' | 'service';
  description: string;
  badge: string;
}

export const PRINCIPALS: Record<PrincipalType, PrincipalInfo> = {
  user: {
    id: 'user',
    name: 'User (Общий администратор)',
    category: 'user',
    description: 'Текущая учетная запись локального пользователя с правами администратора.',
    badge: 'Пользователь',
  },
  admins: {
    id: 'admins',
    name: 'Администраторы (Administrators)',
    category: 'group',
    description: 'Встроенная группа безопасности с правами управления компьютером.',
    badge: 'Группа',
  },
  admin: {
    id: 'admin',
    name: 'Администратор (Administrator)',
    category: 'user',
    description: 'Встроенная главная учетная запись локального администратора.',
    badge: 'Админ',
  },
  system: {
    id: 'system',
    name: 'СИСТЕМА (NT AUTHORITY\\SYSTEM)',
    category: 'system',
    description: 'Высочайшие системные привилегии операционной системы Windows NT.',
    badge: 'СИСТЕМА',
  },
  trustedinstaller: {
    id: 'trustedinstaller',
    name: 'TrustedInstaller (NT SERVICE\\TrustedInstaller)',
    category: 'service',
    description: 'Служба установщика модулей Windows. Рекордный уровень прав для защиты системных файлов.',
    badge: 'TrustedInstaller',
  },
  interactive: {
    id: 'interactive',
    name: 'ИНТЕРАКТИВНЫЕ (Служба защиты от переименования)',
    category: 'service',
    description: 'Специальная системная служба. При наличии в разрешениях строго блокирует переименование объекта.',
    badge: 'Служба',
  },
};

export const DEFAULT_FILE_PERMISSIONS: FilePermission[] = [
  {
    principal: 'system',
    principalName: 'СИСТЕМА',
    allowFullControl: true,
    allowModify: true,
    allowRead: true,
    allowWrite: true,
    allowRename: true,
  },
  {
    principal: 'admins',
    principalName: 'Администраторы',
    allowFullControl: true,
    allowModify: true,
    allowRead: true,
    allowWrite: true,
    allowRename: true,
  },
  {
    principal: 'user',
    principalName: 'User (Общий администратор)',
    allowFullControl: true,
    allowModify: true,
    allowRead: true,
    allowWrite: true,
    allowRename: true,
  },
];

export interface SecurityCheckResult {
  allowed: boolean;
  reason?: string;
  requiredElevation?: ElevationLevel;
}

/**
 * Checks if a user at a given elevationLevel can open/read a file or folder.
 */
export function checkCanOpenFile(
  file: FileSystemItem,
  elevation: ElevationLevel = 'user'
): SecurityCheckResult {
  const permissions = file.permissions || DEFAULT_FILE_PERMISSIONS;
  const hasTrustedInstaller = permissions.some((p) => p.principal === 'trustedinstaller');

  // Rule: If TrustedInstaller is in permissions and elevation is not TrustedInstaller,
  // user cannot open the file/folder!
  if (hasTrustedInstaller && elevation !== 'trustedinstaller') {
    return {
      allowed: false,
      reason: 'Нет доступа к объекту. У вас нет разрешений на доступ к этому объекту. Требуются разрешения от TrustedInstaller.',
      requiredElevation: 'trustedinstaller',
    };
  }

  // TrustedInstaller, SYSTEM, and Admin have open access
  if (elevation === 'trustedinstaller' || elevation === 'system' || elevation === 'admin') {
    return { allowed: true };
  }

  // Check user permission
  const userPerm = permissions.find((p) => p.principal === 'user');
  if (userPerm && !userPerm.allowRead && !userPerm.allowFullControl) {
    return {
      allowed: false,
      reason: 'Вам отказано в доступе на чтение этого файла/папки.',
      requiredElevation: 'admin',
    };
  }

  return { allowed: true };
}

/**
 * Checks if a user at a given elevationLevel can rename a file or folder.
 */
export function checkCanRenameFile(
  file: FileSystemItem,
  elevation: ElevationLevel = 'user'
): SecurityCheckResult {
  const permissions = file.permissions || DEFAULT_FILE_PERMISSIONS;

  // Rule 1: TrustedInstaller lock
  const hasTrustedInstaller = permissions.some((p) => p.principal === 'trustedinstaller');
  if (hasTrustedInstaller && elevation !== 'trustedinstaller') {
    return {
      allowed: false,
      reason: 'Вам отказано в доступе на переименование. Запросите разрешение от TrustedInstaller.',
      requiredElevation: 'trustedinstaller',
    };
  }

  // Rule 2: ИНТЕРАКТИВНЫЕ service strictly forbids renaming!
  const hasInteractive = permissions.some((p) => p.principal === 'interactive');
  if (hasInteractive && elevation !== 'trustedinstaller') {
    return {
      allowed: false,
      reason: 'Вам отказано в доступе. Для переименования этого объекта требуется специальное разрешение от службы ИНТЕРАКТИВНЫЕ.',
      requiredElevation: 'trustedinstaller',
    };
  }

  if (elevation === 'trustedinstaller' || elevation === 'system') {
    return { allowed: true };
  }

  const userPerm = permissions.find((p) => p.principal === 'user');
  if (userPerm && userPerm.denyRename) {
    return {
      allowed: false,
      reason: 'Политикой безопасности запрещено переименование этого объекта.',
      requiredElevation: 'admin',
    };
  }

  return { allowed: true };
}

/**
 * Checks if a user at a given elevationLevel can delete a file or folder.
 */
export function checkCanDeleteFile(
  file: FileSystemItem,
  elevation: ElevationLevel = 'user'
): SecurityCheckResult {
  const permissions = file.permissions || DEFAULT_FILE_PERMISSIONS;

  // Rule: TrustedInstaller lock
  const hasTrustedInstaller = permissions.some((p) => p.principal === 'trustedinstaller');
  if (hasTrustedInstaller && elevation !== 'trustedinstaller') {
    return {
      allowed: false,
      reason: 'Вам отказано в доступе на удаление. Запросите разрешение от TrustedInstaller.',
      requiredElevation: 'trustedinstaller',
    };
  }

  if (elevation === 'trustedinstaller' || elevation === 'system') {
    return { allowed: true };
  }

  const userPerm = permissions.find((p) => p.principal === 'user');
  if (userPerm && !userPerm.allowModify && !userPerm.allowFullControl) {
    return {
      allowed: false,
      reason: 'Вам отказано в доступе на удаление этого объекта. Требуются права администратора.',
      requiredElevation: 'admin',
    };
  }

  return { allowed: true };
}
