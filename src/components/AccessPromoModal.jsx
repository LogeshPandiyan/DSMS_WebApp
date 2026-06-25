import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
    FileText, 
    Bell, 
    ShieldCheck, 
    ChevronLeft, 
    ChevronRight,
    ArrowRight,
    ArrowLeft,
    X
} from 'lucide-react';

const AccessPromoModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(0);

    const slides = [
        {
            icon: FileText,
            title: "Centralized document tracking",
            description: "Manage, sign, and view all your documents from a single organized dashboard."
        },
        {
            icon: Bell,
            title: "Real-time signature alerts",
            description: "Get notified instantly when participants open, sign, or complete your document workflows."
        },
        {
            icon: ShieldCheck,
            title: "Secure electronic signing",
            description: "Execute legally-binding agreements with absolute security, encryption, and audit logs."
        }
    ];

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    // Auto-slide effect
    useEffect(() => {
        if (!isOpen || isDragging) return;
        const interval = setInterval(() => {
            handleNext();
        }, 4000);
        return () => clearInterval(interval);
    }, [currentIndex, isDragging, isOpen]);

    if (!isOpen) return null;

    // Drag event handlers
    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragStartX.current = e.clientX;
        setDragOffset(0);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const currentX = e.clientX;
        const diff = currentX - dragStartX.current;
        setDragOffset(diff);
    };

    const handleMouseUp = () => {
        if (!isDragging) return;
        setIsDragging(false);
        const threshold = 80; // Minimum pixels to drag to trigger transition
        if (dragOffset < -threshold) {
            handleNext();
        } else if (dragOffset > threshold) {
            handlePrev();
        }
        setDragOffset(0);
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            handleMouseUp();
        }
    };

    // Touch event handlers for mobile devices
    const handleTouchStart = (e) => {
        setIsDragging(true);
        dragStartX.current = e.touches[0].clientX;
        setDragOffset(0);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - dragStartX.current;
        setDragOffset(diff);
    };

    const handleTouchEnd = () => {
        handleMouseUp();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm dark:bg-slate-950/80" 
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 w-full max-w-3xl rounded-[5px] p-8 shadow-2xl animate-in zoom-in duration-200 flex flex-col items-center justify-between min-h-[580px] max-h-[90vh] overflow-y-auto">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute right-4 top-4 h-8 w-8 rounded-md bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Header Text */}
                <div className="text-center space-y-2 mt-2 w-full">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                        Create account to access
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm max-w-md mx-auto">
                        To access dashboards, view documents, or upload new files, please create a registered account.
                    </p>
                </div>

                {/* Slider Container */}
                <div className="w-full bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/50 rounded-[5px] p-6 flex flex-col items-center justify-center my-6 relative select-none overflow-hidden h-[260px]">
                    
                    {/* Drag Area wrapper */}
                    <div 
                        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div 
                            className="flex h-full w-full transition-transform duration-500 ease-out"
                            style={{ 
                                transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
                                transition: isDragging ? 'none' : 'transform 0.5s ease-out' 
                            }}
                        >
                            {slides.map((slide, idx) => {
                                const IconComponent = slide.icon;
                                return (
                                    <div key={idx} className="w-full h-full flex-shrink-0 flex flex-col items-center justify-center text-center px-8 space-y-4">
                                        {/* Icon Container */}
                                        <div className="h-14 w-14 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center shadow-sm border border-primary-100/50 dark:border-primary-900/30">
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        
                                        {/* Text Section */}
                                        <div className="space-y-1">
                                            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                                                {slide.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
                                                {slide.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Left Arrow Button */}
                    <button 
                        onClick={handlePrev}
                        type="button"
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 shadow-sm transition-all focus:outline-none border border-slate-100 dark:border-slate-700"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {/* Right Arrow Button */}
                    <button 
                        onClick={handleNext}
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 shadow-sm transition-all focus:outline-none border border-slate-100 dark:border-slate-700"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Dots indicator & Action Buttons Area */}
                <div className="w-full flex flex-col items-center gap-6 mt-2">
                    {/* Dots indicator */}
                    <div className="flex gap-2">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-5 bg-slate-600 dark:bg-slate-400' : 'w-1.5 bg-slate-300 dark:bg-slate-700'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                        <button
                            onClick={onClose}
                            type="button"
                            className="flex-1 py-3 px-6 rounded-[5px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Cancel
                        </button>
                        
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/register');
                            }}
                            type="button"
                            className="flex-1 py-3 px-6 rounded-[5px] bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                        >
                            Register now
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AccessPromoModal;
