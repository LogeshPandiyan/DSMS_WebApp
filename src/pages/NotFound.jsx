import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();
    const brandColor = '#12b79f';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            <div className="relative z-10 max-w-md w-full text-center space-y-8">
                {/* 404 Graphic (Static, No Animation) */}
                <div className="relative inline-block">
                    <div className="relative h-28 w-28 mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-lg dark:shadow-2xl">
                        <ShieldAlert className="h-14 w-14 text-[#12b79f]" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3">
                    <h1 className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none select-none">
                        4<span style={{ color: brandColor }}>0</span>4
                    </h1>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                        We couldn't find the page you are looking for. Please check if the URL is typed correctly or return to the dashboard.
                    </p>
                </div>

                {/* Action Buttons (Standard light/dark styling) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-[5px] font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ backgroundColor: brandColor }}
                        className="w-full sm:w-auto px-6 py-3 text-white rounded-[5px] font-bold text-sm shadow-md shadow-[#12b79f]/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="h-4 w-4" />
                        Return Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
