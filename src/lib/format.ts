export function formatNaira(amount: number, opts: { decimals?: boolean } = {}): string {
  const minimumFractionDigits = opts.decimals === false ? 0 : 2;
  const maximumFractionDigits = opts.decimals === false ? 0 : 2;
  const formatted = amount.toLocaleString('en-NG', {
    minimumFractionDigits,
    maximumFractionDigits,
  });
  return `\u20A6${formatted}`;
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const timeFormatter = new Intl.DateTimeFormat('en-NG', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const dateFormatter = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatRelativeDate(ts: number | string): string {
  const date = typeof ts === 'string' ? new Date(ts) : new Date(ts);
  const now = new Date();
  if (isSameDay(date, now)) {
    return `Today, ${timeFormatter.format(date)}`;
  }
  const yesterday = new Date(now.getTime() - 86400000);
  if (isSameDay(date, yesterday)) {
    return `Yesterday, ${timeFormatter.format(date)}`;
  }
  return dateTimeFormatter.format(date);
}

export function formatShortDate(ts: number | string): string {
  const date = typeof ts === 'string' ? new Date(ts) : new Date(ts);
  return dateFormatter.format(date);
}

export function formatPhoneNumber(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) {
    const m = digits.match(/^(\d{3})(\d{4})(\d{4})$/);
    if (m) return `+234 ${m[1]} ${m[2]} ${m[3]}`;
  }
  if (digits.length === 13 && digits.startsWith('234')) {
    const m = digits.match(/^(\d{3})(\d{3})(\d{4})(\d{3})$/);
    if (m) return `+234 ${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
  }
  return mobile;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ST';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function maskPan(pan: string): string {
  const cleaned = pan.replace(/\D/g, '');
  if (cleaned.length < 8) return cleaned;
  return `${cleaned.slice(0, 4)} **** **** ${cleaned.slice(-4)}`;
}