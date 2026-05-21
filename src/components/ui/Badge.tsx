import React from 'react';

interface BadgeProps {
  tone?: 'blue' | 'red' | 'green' | 'amber' | 'gray' | 'solid-red' | 'solid-blue';
  dot?: boolean;
  children: React.ReactNode;
}

export default function Badge({ tone = 'blue', dot, children }: Readonly<BadgeProps>) {
  return (
    <span className={`bm-badge bm-badge-${tone}`}>
      {dot && <span className="bm-badge-dot"/>}
      {children}
    </span>
  );
}
