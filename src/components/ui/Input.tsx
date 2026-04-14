import React from 'react';

// --- INICIO DA ALTERAÇÃO ---
// Componente de Input padronizado para o MELEVA
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <label className="text-sm font-medium text-[var(--color-anthracite)]">
        {label}
      </label>
      <input
        className={`h-[56px] rounded-[12px] border px-4 bg-white text-[var(--color-anthracite)] outline-none transition-colors
          ${error ? 'border-[var(--color-sos)] focus:border-[var(--color-sos)]' : 'border-gray-300 focus:border-[var(--color-emerald)]'}`}
        {...props}
      />
      {error && <span className="text-xs text-[var(--color-sos)]">{error}</span>}
    </div>
  );
}
// --- FIM DA ALTERAÇÃO ---
