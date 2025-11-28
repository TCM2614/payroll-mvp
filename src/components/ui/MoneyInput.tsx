'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatCurrency = (value?: number, prefix = '£') => {
  if (value == null || Number.isNaN(value)) return '';
  return `${prefix}${currencyFormatter.format(value)}`;
};

const sanitizeNumeric = (raw: string) => {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(cleaned.replace(/,/g, ''));
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
};

type MoneyInputProps = {
  id?: string;
  value?: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
  prefix?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  'aria-label'?: string;
};

export function MoneyInput({
  id,
  value,
  onValueChange,
  placeholder,
  prefix = '£',
  className,
  disabled,
  name,
  'aria-label': ariaLabel,
}: MoneyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const formatted = useMemo(() => formatCurrency(value, prefix), [value, prefix]);
  const [displayValue, setDisplayValue] = useState<string>(formatted);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatted);
    }
  }, [formatted, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(value != null && !Number.isNaN(value) && value !== 0 ? String(value) : '');
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setDisplayValue(raw);
    const numeric = sanitizeNumeric(raw);
    onValueChange(numeric);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setDisplayValue(value != null ? formatCurrency(value, prefix) : '');
  };

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="decimal"
      aria-label={ariaLabel}
      value={displayValue}
      placeholder={placeholder}
      disabled={disabled}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={[
        'w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30',
        className ?? '',
      ].join(' ').trim()}
    />
  );
}
