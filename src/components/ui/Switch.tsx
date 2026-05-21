'use client';

interface SwitchProps {
  on: boolean;
  onChange: (v: boolean) => void;
}

export default function Switch({ on, onChange }: SwitchProps) {
  return (
    <button
      className={`bm-switch ${on ? 'on' : ''}`}
      onClick={() => onChange(!on)}
      aria-pressed={on}
    />
  );
}
