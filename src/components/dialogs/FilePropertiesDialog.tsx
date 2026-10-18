import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  User,
  Users,
  Cpu,
  Lock,
  Plus,
  Trash2,
  Check,
  X,
  FileText,
  Folder,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import {
  FilePermission,
  FileSystemItem,
  PrincipalType,
} from '../../types/system';
import {
  DEFAULT_FILE_PERMISSIONS,
  PRINCIPALS,
  PrincipalInfo,
} from '../../utils/security';

interface FilePropertiesDialogProps {
  fileId: string | null;
  onClose: () => void;
}

export const FilePropertiesDialog: React.FC<FilePropertiesDialogProps> = ({
  fileId,
  onClose,
}) => {
  const { files, updateFileSecurity, settings } = useSystem();
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('security');

  const file = files.find((f) => f.id === fileId);

  // Security state
  const [owner, setOwner] = useState<PrincipalType>(file?.owner || 'user');
  const [permissions, setPermissions] = useState<FilePermission[]>(
    file?.permissions || DEFAULT_FILE_PERMISSIONS
  );
  const [selectedPrincipal, setSelectedPrincipal] = useState<PrincipalType>(
    file?.permissions?.[0]?.principal || 'user'
  );

  const [showAddPrincipalModal, setShowAddPrincipalModal] = useState(false);
  const [showChangeOwnerModal, setShowChangeOwnerModal] = useState(false);

  useEffect(() => {
    if (file) {
      setOwner(file.owner || 'user');
      const perms = file.permissions && file.permissions.length > 0
        ? file.permissions
        : DEFAULT_FILE_PERMISSIONS;
      setPermissions(perms);
      setSelectedPrincipal(perms[0]?.principal || 'user');
    }
  }, [file]);

  if (!file) return null;

  const currentPerm = permissions.find((p) => p.principal === selectedPrincipal);
  const isDark = settings.theme === 'dark';

  // Permission toggles
  const handleTogglePermission = (
    key: 'allowFullControl' | 'allowModify' | 'allowRead' | 'allowWrite' | 'allowRename'
  ) => {
    if (!currentPerm) return;
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.principal === selectedPrincipal) {
          const newVal = !p[key];
          if (key === 'allowFullControl' && newVal) {
            return {
              ...p,
              allowFullControl: true,
              allowModify: true,
              allowRead: true,
              allowWrite: true,
              allowRename: true,
            };
          }
          return { ...p, [key]: newVal };
        }
        return p;
      })
    );
  };

  // Add Principal
  const handleAddPrincipal = (pId: PrincipalType) => {
    if (permissions.some((p) => p.principal === pId)) {
      setShowAddPrincipalModal(false);
      setSelectedPrincipal(pId);
      return;
    }

    const info = PRINCIPALS[pId];
    const newPerm: FilePermission = {
      principal: pId,
      principalName: info.name,
      allowFullControl: pId !== 'interactive',
      allowModify: pId !== 'interactive',
      allowRead: true,
      allowWrite: pId !== 'interactive',
      allowRename: pId !== 'interactive', // If interactive, rename is false!
      denyRename: pId === 'interactive',
    };

    setPermissions((prev) => [...prev, newPerm]);
    setSelectedPrincipal(pId);
    setShowAddPrincipalModal(false);
  };

  // Remove Principal
  const handleRemovePrincipal = () => {
    if (permissions.length <= 1) return;
    setPermissions((prev) => prev.filter((p) => p.principal !== selectedPrincipal));
    setSelectedPrincipal(permissions.find((p) => p.principal !== selectedPrincipal)?.principal || 'user');
  };

  // Apply Changes
  const handleApply = () => {
    updateFileSecurity(file.id, owner, permissions);
  };

  const handleOk = () => {
    handleApply();
    onClose();
  };

  const ownerInfo = PRINCIPALS[owner] || PRINCIPALS.user;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 win-acrylic select-none animate-in fade-in zoom-in-95 duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden font-sans text-xs ${
          isDark
            ? 'bg-zinc-900 border-zinc-700 text-zinc-100 shadow-black/80'
            : 'bg-white border-zinc-300 text-zinc-900 shadow-slate-900/30'
        }`}
      >
        {/* Titlebar */}
        <div
          className={`h-9 px-4 flex items-center justify-between border-b ${
            isDark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 font-medium truncate">
            {file.isDirectory ? (
              <Folder size={15} className="text-amber-500 fill-amber-400" />
            ) : (
              <FileText size={15} className="text-sky-500" />
            )}
            <span className="truncate">Свойства: {file.name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-500/20 text-zinc-400 hover:text-current"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-500/10 px-4 pt-2 gap-2 bg-zinc-500/5">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-white dark:bg-zinc-800 border-t border-x border-zinc-300 dark:border-zinc-700 text-sky-500 shadow-xs'
                : 'text-zinc-500 hover:text-current'
            }`}
          >
            Общие
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-medium transition-colors ${
              activeTab === 'security'
                ? 'bg-white dark:bg-zinc-800 border-t border-x border-zinc-300 dark:border-zinc-700 text-sky-500 shadow-xs'
                : 'text-zinc-500 hover:text-current'
            }`}
          >
            <Shield size={13} className="text-sky-500" />
            <span>Безопасность</span>
          </button>
        </div>

        {/* TAB: GENERAL */}
        {activeTab === 'general' && (
          <div className="p-5 space-y-4 max-h-[460px] overflow-y-auto">
            <div className="flex items-center gap-4 pb-4 border-b border-zinc-500/10">
              {file.isDirectory ? (
                <Folder size={44} className="text-amber-500 fill-amber-400 shrink-0" />
              ) : (
                <FileText size={44} className="text-sky-500 shrink-0" />
              )}
              <div className="flex-1 overflow-hidden">
                <input
                  type="text"
                  value={file.name}
                  readOnly
                  className="w-full px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 font-medium text-xs outline-none"
                />
                <div className="text-[11px] text-zinc-400 mt-1">
                  {file.isDirectory ? 'Папка с файлами' : 'Текстовый документ (.txt)'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] leading-relaxed">
              <span className="text-zinc-400">Расположение:</span>
              <span className="col-span-2 font-mono truncate">{file.path}</span>

              <span className="text-zinc-400">Размер:</span>
              <span className="col-span-2 font-mono">{file.size ? `${file.size} байт` : '4.00 КБ'}</span>

              <span className="text-zinc-400">Создан:</span>
              <span className="col-span-2">{new Date(file.updatedAt).toLocaleString('ru-RU')}</span>

              <span className="text-zinc-400">Изменен:</span>
              <span className="col-span-2">{new Date(file.updatedAt).toLocaleString('ru-RU')}</span>

              <span className="text-zinc-400">Владелец:</span>
              <span className="col-span-2 font-semibold text-sky-500">{ownerInfo.name}</span>
            </div>
          </div>
        )}

        {/* TAB: SECURITY */}
        {activeTab === 'security' && (
          <div className="p-4 space-y-3.5 max-h-[490px] overflow-y-auto">
            {/* Object Path */}
            <div className="text-[11px]">
              <span className="text-zinc-400">Имя объекта: </span>
              <span className="font-mono text-zinc-600 dark:text-zinc-300 truncate">{file.path}</span>
            </div>

            {/* Owner Section */}
            <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400">Текущий владелец объекта:</span>
                <div className="font-semibold text-xs text-sky-500 flex items-center gap-1.5 mt-0.5">
                  <Shield size={13} />
                  <span>{ownerInfo.name}</span>
                </div>
              </div>
              <button
                onClick={() => setShowChangeOwnerModal(true)}
                className="px-3 py-1 rounded-lg border border-sky-500/40 text-sky-500 hover:bg-sky-500/10 text-xs font-medium cursor-pointer transition-colors"
              >
                Сменить владельца
              </button>
            </div>

            {/* Group or user names list */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs font-medium">
                <span>Имена групп или пользователей:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowAddPrincipalModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500 text-white hover:bg-sky-600 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Добавить...</span>
                  </button>
                  <button
                    onClick={handleRemovePrincipal}
                    disabled={permissions.length <= 1}
                    className="flex items-center gap-1 px-2 py-1 rounded border border-red-500/40 text-red-500 hover:bg-red-500/10 text-[11px] font-medium transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Удалить</span>
                  </button>
                </div>
              </div>

              {/* Principals List Box */}
              <div className="border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden divide-y divide-zinc-500/10 bg-white dark:bg-zinc-900 max-h-36 overflow-y-auto">
                {permissions.map((p) => {
                  const isSelected = selectedPrincipal === p.principal;
                  const info = PRINCIPALS[p.principal] || { badge: 'Роль' };

                  return (
                    <div
                      key={p.principal}
                      onClick={() => setSelectedPrincipal(p.principal)}
                      className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-sky-500/15 text-sky-500 font-semibold'
                          : 'hover:bg-zinc-500/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {p.principal === 'user' ? (
                          <User size={14} className="text-blue-500" />
                        ) : p.principal === 'trustedinstaller' ? (
                          <Shield size={14} className="text-amber-500 fill-amber-500/20" />
                        ) : p.principal === 'interactive' ? (
                          <ShieldAlert size={14} className="text-rose-500" />
                        ) : (
                          <Users size={14} className="text-indigo-400" />
                        )}
                        <span className="text-xs">{p.principalName}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-400">
                        {info.badge}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special rule notices */}
            {permissions.some((p) => p.principal === 'trustedinstaller') && (
              <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] leading-snug flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-500" />
                <span>
                  <strong>Внимание (TrustedInstaller):</strong> Добавление TrustedInstaller лишает обычного пользователя прав на открытие, переименование и удаление этого файла. Доступ разрешен только при <em>«Запуске от имени TrustedInstaller»</em>.
                </span>
              </div>
            )}

            {permissions.some((p) => p.principal === 'interactive') && (
              <div className="p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-[11px] leading-snug flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0 mt-0.5 text-rose-500" />
                <span>
                  <strong>Служба ИНТЕРАКТИВНЫЕ:</strong> Включена защита от переименования. Любая попытка переименовать файл будет заблокирована службой ИНТЕРАКТИВНЫЕ.
                </span>
              </div>
            )}

            {/* Permissions Checkboxes Grid */}
            {currentPerm && (
              <div>
                <div className="text-xs font-semibold mb-1.5">
                  Разрешения для «{currentPerm.principalName}»:
                </div>
                <div className="border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden text-[11px] divide-y divide-zinc-500/10 bg-white dark:bg-zinc-900">
                  <div className="grid grid-cols-5 px-3 py-1.5 font-medium text-zinc-400 bg-zinc-500/5">
                    <span className="col-span-3">Разрешение</span>
                    <span className="text-center">Разрешить</span>
                    <span className="text-center">Запретить</span>
                  </div>

                  {/* Full control */}
                  <div className="grid grid-cols-5 px-3 py-1.5 items-center">
                    <span className="col-span-3">Полный доступ</span>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={currentPerm.allowFullControl}
                        onChange={() => handleTogglePermission('allowFullControl')}
                        className="accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={!currentPerm.allowFullControl}
                        onChange={() => handleTogglePermission('allowFullControl')}
                        className="accent-red-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Modify */}
                  <div className="grid grid-cols-5 px-3 py-1.5 items-center">
                    <span className="col-span-3">Изменение</span>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={currentPerm.allowModify}
                        onChange={() => handleTogglePermission('allowModify')}
                        className="accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={!currentPerm.allowModify}
                        onChange={() => handleTogglePermission('allowModify')}
                        className="accent-red-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Read & Execute */}
                  <div className="grid grid-cols-5 px-3 py-1.5 items-center">
                    <span className="col-span-3">Чтение и выполнение</span>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={currentPerm.allowRead}
                        onChange={() => handleTogglePermission('allowRead')}
                        className="accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={!currentPerm.allowRead}
                        onChange={() => handleTogglePermission('allowRead')}
                        className="accent-red-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Write */}
                  <div className="grid grid-cols-5 px-3 py-1.5 items-center">
                    <span className="col-span-3">Запись</span>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={currentPerm.allowWrite}
                        onChange={() => handleTogglePermission('allowWrite')}
                        className="accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={!currentPerm.allowWrite}
                        onChange={() => handleTogglePermission('allowWrite')}
                        className="accent-red-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Rename */}
                  <div className="grid grid-cols-5 px-3 py-1.5 items-center">
                    <span className="col-span-3 font-semibold text-rose-500">
                      Особые разрешения (Переименование)
                    </span>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={currentPerm.allowRename && currentPerm.principal !== 'interactive'}
                        disabled={currentPerm.principal === 'interactive'}
                        onChange={() => handleTogglePermission('allowRename')}
                        className="accent-sky-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={!currentPerm.allowRename || currentPerm.principal === 'interactive'}
                        disabled={currentPerm.principal === 'interactive'}
                        onChange={() => handleTogglePermission('allowRename')}
                        className="accent-red-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Buttons */}
        <div className="h-14 px-5 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-500/10 flex items-center justify-end gap-2.5">
          <button
            onClick={handleOk}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            ОК
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            Применить
          </button>
        </div>
      </div>

      {/* MODAL: ADD PRINCIPAL / SERVICE */}
      {showAddPrincipalModal && (
        <div
          onClick={() => setShowAddPrincipalModal(false)}
          className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 win-acrylic"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-5 ${
              isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
            }`}
          >
            <h3 className="text-sm font-semibold mb-1">Выбор: пользователи или службы</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Выберите учетную запись пользователя, группу или системную службу для добавления в разрешения:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(Object.keys(PRINCIPALS) as PrincipalType[]).map((pKey) => {
                const pInfo = PRINCIPALS[pKey];
                const alreadyAdded = permissions.some((p) => p.principal === pKey);

                return (
                  <div
                    key={pKey}
                    onClick={() => handleAddPrincipal(pKey)}
                    className="p-3 rounded-xl border border-zinc-500/20 hover:border-sky-500 cursor-pointer transition-all hover:bg-sky-500/5 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-xs flex items-center gap-1.5">
                        <span>{pInfo.name}</span>
                        {alreadyAdded && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-500">
                            В списке
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                        {pInfo.description}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-zinc-400 shrink-0 mt-1" />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowAddPrincipalModal(false)}
                className="px-4 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-500/10"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE OWNER */}
      {showChangeOwnerModal && (
        <div
          onClick={() => setShowChangeOwnerModal(false)}
          className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 win-acrylic"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-5 ${
              isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
            }`}
          >
            <h3 className="text-sm font-semibold mb-1">Смена владельца объекта</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Выберите нового владельца для управления разрешениями и полным доступом к файлу:
            </p>

            <div className="space-y-2">
              {(['user', 'admins', 'admin', 'system', 'trustedinstaller'] as PrincipalType[]).map((pKey) => {
                const pInfo = PRINCIPALS[pKey];
                const isCurrentOwner = owner === pKey;

                return (
                  <div
                    key={pKey}
                    onClick={() => {
                      setOwner(pKey);
                      setShowChangeOwnerModal(false);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isCurrentOwner
                        ? 'bg-sky-500/15 border-sky-500 text-sky-500 font-semibold'
                        : 'border-zinc-500/20 hover:border-sky-500 hover:bg-zinc-500/5'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{pInfo.name}</div>
                      <div className="text-[10px] text-zinc-400">{pInfo.description}</div>
                    </div>
                    {isCurrentOwner && <Check size={16} className="text-sky-500" />}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowChangeOwnerModal(false)}
                className="px-4 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-500/10"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
