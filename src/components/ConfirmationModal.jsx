import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'CONFIRM', variant = 'danger', icon: Icon }) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            iconBg: 'bg-red-500/10 border-red-500/20',
            iconColor: 'text-red-500',
            confirmBtn: 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
        },
        primary: {
            iconBg: 'bg-primary-500/10 border-primary-500/20',
            iconColor: 'text-primary-600',
            confirmBtn: 'bg-primary-600 hover:bg-primary-500 shadow-primary-600/20'
        }
    };

    const style = variantStyles[variant] || variantStyles.danger;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm dark:bg-slate-950/80" 
                onClick={onClose}>
            </div>
            
            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 w-full max-w-sm rounded-[5px] 
                            p-6 shadow-2xl animate-in zoom-in duration-200">
                <button 
                    onClick={onClose} 
                    className="absolute right-4 top-4 h-8 w-8 rounded-md bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:hover:text-white hover:bg-slate-100"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                    {Icon && (
                        <div className={`h-14 w-14 rounded-[5px] flex items-center justify-center mb-4 border ${style.iconBg}`}>
                            <Icon className={`h-7 w-7 ${style.iconColor}`} />
                        </div>
                    )}
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed font-medium">
                        {message}
                    </p>

                    <div className="flex w-full gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-[5px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold 
                            text-xs tracking-wide hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-3 rounded-[5px] text-white font-bold text-xs tracking-wide 
                            transition-all active:scale-[0.98] shadow-lg ${style.confirmBtn}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
