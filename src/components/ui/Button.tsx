'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'bin';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: React.ReactNode;
  loading?: boolean;
}

export default function Button({ variant = 'primary', size = 'md', leftIcon, loading, children, className = '', disabled, ...rest }: Readonly<ButtonProps>) {
  return (
    <button
      className={`bm-btn bm-btn-${variant} bm-btn-${size} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : leftIcon}
      {children}
    </button>
  );
}
