import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = "Search...", className = "" }) => {
    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
                type="text"
                placeholder={placeholder}
                className="w-full pl-12 pr-12 py-2 bg-white dark:bg-slate-900 border
                 border-slate-200 dark:border-slate-800 rounded-[5px] outline-none 
                 transition-all text-slate-900 dark:text-white shadow-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <button 
                    onClick={() => onChange('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
