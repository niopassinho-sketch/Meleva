import React from 'react';

// --- INICIO DA ALTERAÇÃO ---
// Componente de Botão padronizado para o MELEVA
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  
  const baseStyles = "h-[56px] rounded-[12px] font-semibold text-base flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--color-emerald)] text-white hover:bg-[#008f5a]",
    secondary: "bg-[var(--color-anthracite)] text-white hover:bg-[#1a1a1a]",
    danger: "bg-[var(--color-sos)] text-white hover:bg-[#c21f2d]",
    outline: "bg-transparent border-2 border-[var(--color-emerald)] text-[var(--color-emerald)] hover:bg-emerald-50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
// --- FIM DA ALTERAÇÃO ---
