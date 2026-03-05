export const formatPrice = (price: number | string | undefined): string => {
  if (!price && price !== 0) return '0 kr';
  return Number(price).toLocaleString('nb-NO') + ' kr';
};
