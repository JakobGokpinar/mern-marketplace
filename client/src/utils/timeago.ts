const rtf = new Intl.RelativeTimeFormat('no', { numeric: 'auto' });

export function timeago(date: string | Date): string {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60)       return rtf.format(-Math.round(diff), 'second');
  if (diff < 3600)     return rtf.format(-Math.round(diff / 60), 'minute');
  if (diff < 86400)    return rtf.format(-Math.round(diff / 3600), 'hour');
  if (diff < 2592000)  return rtf.format(-Math.round(diff / 86400), 'day');
  if (diff < 31536000) return rtf.format(-Math.round(diff / 2592000), 'month');
  return rtf.format(-Math.round(diff / 31536000), 'year');
}
