import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'CONFIRM', variant = 'danger', icon: Icon }) => {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsClosing(false);
        } else if (shouldRender) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsClosing(false);
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [isOpen, shouldRender]);

    const handleClose = () => {
        if (isClosing) return;
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setShouldRender(false);
            setIsClosing(false);
        }, 250);
    };

    const handleConfirm = () => {
        if (isClosing) return;
        setIsClosing(true);
        setTimeout(() => {
            onConfirm();
            onClose();
            setShouldRender(false);
            setIsClosing(false);
        }, 200);
    };

    if (!shouldRender) return null;

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
            {/* Backdrop with smooth fade in/out */}
            <div 
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm dark:bg-slate-950/80 transition-opacity"
                style={{
                    animation: `${isClosing ? 'backdropFadeOut 0.25s' : 'backdropFadeIn 0.3s'} cubic-bezier(0.16, 1, 0.3, 1) forwards`
                }}
                onClick={handleClose}>
            </div>
            
            {/* Modal sliding smoothly from top & reverse back up on close */}
            <div 
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 w-full max-w-sm rounded-[5px] 
                            p-6 shadow-2xl"
                style={{
                    animation: `${isClosing ? 'modalSlideUpToTop 0.25s' : 'modalSlideFromTop 0.35s'} cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    willChange: 'transform, opacity'
                }}
            >
                <button 
                    onClick={handleClose} 
                    className="absolute right-4 top-4 h-8 w-8 rounded-md bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
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
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 rounded-[5px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold 
                            text-xs tracking-wide hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirm}
                            className={`flex-1 px-4 py-3 rounded-[5px] text-white font-bold text-xs tracking-wide 
                            transition-all active:scale-[0.98] shadow-lg ${style.confirmBtn}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes modalSlideFromTop {
                    0% {
                        opacity: 0;
                        transform: translateY(-60px) scale(0.94);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes modalSlideUpToTop {
                    0% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.94);
                    }
                }
                @keyframes backdropFadeIn {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
                @keyframes backdropFadeOut {
                    0% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                    }
                }
            `}} />
        </div>,
        document.body
    );
};

export default ConfirmationModal;
