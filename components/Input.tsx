import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          className={`
            w-full px-4 py-3 rounded-xl bg-slate-50 border 
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none
            transition-all duration-200
            dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:focus:border-primary-500
            ${icon ? 'pl-11' : ''}
            ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}
            ${className}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
};