'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'bin';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: React.ReactNode;
}

export default function Button({ variant = 'primary', size = 'md', leftIcon, children, className = '', ...rest }: Readonly<ButtonProps>) {
  return (
    <button className={`bm-btn bm-btn-${variant} bm-btn-${size} ${className}`} {...rest}>
      {leftIcon}{children}
    </button>
  );
}
