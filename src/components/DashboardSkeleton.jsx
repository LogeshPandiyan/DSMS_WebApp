import React from 'react';
import Skeleton from './Skeleton';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex transition-colors duration-300">
            {/* Sidebar Skeleton (Hidden on mobile) */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 backdrop-blur-xl">
                <div className="p-6">
                    <Skeleton className="h-10 w-40" />
                </div>
                <div className="flex-1 px-4 py-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-visible">
                {/* Header Skeleton */}
                <header className="h-20 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 flex items-center justify-between px-8">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                        <div className="h-8 w-px bg-slate-200 dark:bg-white/5 mx-2"></div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                </header>

                <main className="flex-1 p-8">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {/* Hero Section Skeleton */}
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-transparent rounded-[5px] p-10 h-64 flex flex-col justify-center space-y-4">
                            <Skeleton className="h-10 w-48" />
                            <Skeleton className="h-4 w-64" />
                            <Skeleton className="h-10 w-32 mt-4" />
                        </div>

                        {/* Info Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Account Details Card */}
                            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-[5px] p-8 space-y-6">
                                <div className="flex justify-between">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                                <div className="space-y-4">
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            </div>

                            {/* Security Scan Card */}
                            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-[5px] p-8 flex flex-col items-center justify-center space-y-4">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
