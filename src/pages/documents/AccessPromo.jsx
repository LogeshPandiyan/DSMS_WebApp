import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    FileText, 
    Bell, 
    ShieldCheck, 
    ChevronLeft, 
    ChevronRight,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';

const AccessPromo = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fromPath = location.state?.fromPath || '/';

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
        if (isDragging) return;
        const interval = setInterval(() => {
            handleNext();
        }, 4000);
        return () => clearInterval(interval);
    }, [currentIndex, isDragging]);

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

    return (
        <div className="w-full max-w-[1200px] mx-auto min-h-[calc(100vh-140px)] flex flex-col justify-between items-center py-6 px-4 animate-in fade-in duration-500">
            {/* Header Text */}
            <div className="text-center space-y-2 mt-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    Create account to access
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm max-w-md mx-auto">
                    To access dashboards, view documents, or upload new files, please create a registered account.
                </p>
            </div>

            {/* Slider Container (Rectangle area matches red outline) */}
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] p-8 shadow-sm flex flex-col items-center justify-center my-6 relative select-none overflow-hidden h-[340px]">
                
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
                                <div key={idx} className="w-full h-full flex-shrink-0 flex flex-col items-center justify-center text-center px-8 space-y-6">
                                    {/* Icon Container */}
                                    <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center shadow-sm">
                                        <IconComponent className="h-8 w-8" />
                                    </div>
                                    
                                    {/* Text Section */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                            {slide.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 shadow-sm transition-all focus:outline-none"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Right Arrow Button */}
                <button 
                    onClick={handleNext}
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 shadow-sm transition-all focus:outline-none"
                    aria-label="Next slide"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Dots indicator & Action Buttons Area */}
            <div className="w-full flex flex-col items-center gap-6 mb-4">
                {/* Dots indicator */}
                <div className="flex gap-2">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-6 bg-slate-600 dark:bg-slate-400' : 'w-2 bg-slate-300 dark:bg-slate-700'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <button
                        onClick={() => navigate(fromPath)}
                        type="button"
                        className="flex-1 py-3 px-6 rounded-[5px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Cancel
                    </button>
                    
                    <button
                        onClick={() => navigate('/register')}
                        type="button"
                        className="flex-1 py-3 px-6 rounded-[5px] bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                    >
                        Register now
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessPromo;
