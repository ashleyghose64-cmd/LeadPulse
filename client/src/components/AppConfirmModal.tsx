import { useEffect } from 'react';
import { create } from 'zustand';
import { AlertTriangle, Trash2, Info, CheckCircle2, X, ShieldAlert } from 'lucide-react';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
}

export interface AlertDialogOptions {
  title?: string;
  message: string;
  buttonText?: string;
  variant?: 'error' | 'warning' | 'info' | 'success';
}

interface DialogState {
  isOpen: boolean;
  mode: 'confirm' | 'alert';
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'primary' | 'warning' | 'error' | 'info' | 'success';
  resolve: ((val: boolean) => void) | null;
  openConfirm: (opts: ConfirmDialogOptions | string) => Promise<boolean>;
  openAlert: (opts: AlertDialogOptions | string) => Promise<void>;
  closeDialog: (confirmed: boolean) => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  isOpen: false,
  mode: 'confirm',
  title: 'Confirm Action',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger',
  resolve: null,

  openConfirm: (opts) => {
    const prevResolve = get().resolve;
    if (prevResolve) prevResolve(false);

    const normalized: ConfirmDialogOptions =
      typeof opts === 'string' ? { message: opts } : opts;

    const isDeleteOrDisconnect = /delete|remove|disconnect|clear/i.test(
      `${normalized.title || ''} ${normalized.message}`
    );

    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        mode: 'confirm',
        title:
          normalized.title ||
          (isDeleteOrDisconnect ? 'Confirm Removal' : 'Confirm Action'),
        message: normalized.message,
        confirmText:
          normalized.confirmText ||
          (isDeleteOrDisconnect ? 'Confirm' : 'Continue'),
        cancelText: normalized.cancelText || 'Cancel',
        variant: normalized.variant || (isDeleteOrDisconnect ? 'danger' : 'primary'),
        resolve,
      });
    });
  },

  openAlert: (opts) => {
    const prevResolve = get().resolve;
    if (prevResolve) prevResolve(false);

    const normalized: AlertDialogOptions =
      typeof opts === 'string' ? { message: opts } : opts;

    const isError = /fail|error|invalid|could not|unable/i.test(
      `${normalized.title || ''} ${normalized.message}`
    );

    return new Promise<void>((resolve) => {
      set({
        isOpen: true,
        mode: 'alert',
        title: normalized.title || (isError ? 'Action Notice' : 'Workspace Notice'),
        message: normalized.message,
        confirmText: normalized.buttonText || 'Got it',
        cancelText: '',
        variant: normalized.variant || (isError ? 'error' : 'info'),
        resolve: () => resolve(),
      });
    });
  },

  closeDialog: (confirmed) => {
    const currentResolve = get().resolve;
    set({ isOpen: false, resolve: null });
    if (currentResolve) {
      currentResolve(confirmed);
    }
  },
}));

export const confirmDialog = (opts: ConfirmDialogOptions | string): Promise<boolean> =>
  useDialogStore.getState().openConfirm(opts);

export const alertDialog = (opts: AlertDialogOptions | string): Promise<void> =>
  useDialogStore.getState().openAlert(opts);

const AppConfirmModal = () => {
  const { isOpen, mode, title, message, confirmText, cancelText, variant, closeDialog } =
    useDialogStore();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        closeDialog(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDialog]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger' || variant === 'error';
  const isWarning = variant === 'warning';
  const isSuccess = variant === 'success';

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => closeDialog(false)}
    >
      <div
        className="bg-white border border-slate-200 rounded-md shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div
          className={`h-1 w-full ${
            isDanger
              ? 'bg-red-600'
              : isWarning
              ? 'bg-amber-500'
              : isSuccess
              ? 'bg-emerald-600'
              : 'bg-[#C85A32]'
          }`}
        />

        {/* Modal Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3.5">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                  isDanger
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : isWarning
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : isSuccess
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-blue-50 text-[#C85A32] border-blue-200'
                }`}
              >
                {isDanger ? (
                  mode === 'confirm' ? (
                    <Trash2 className="w-4 h-4" />
                  ) : (
                    <ShieldAlert className="w-4 h-4" />
                  )
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#191716] font-delight tracking-tight">
                  {title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => closeDialog(false)}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-sm transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          {mode === 'confirm' && (
            <button
              type="button"
              onClick={() => closeDialog(false)}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-delight font-medium transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={() => closeDialog(true)}
            className={`px-4 py-1.5 rounded-md text-xs font-delight font-semibold text-white transition-colors shadow-xs cursor-pointer ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 border border-red-700'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-700 border border-amber-700'
                : 'bg-[#191716] hover:bg-slate-800 border border-[#191716]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppConfirmModal;
