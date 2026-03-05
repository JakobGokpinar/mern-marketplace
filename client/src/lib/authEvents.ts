const target = new EventTarget();

export const emitUnauthorized = () =>
  target.dispatchEvent(new Event('unauthorized'));

export const onUnauthorized = (handler: () => void) => {
  target.addEventListener('unauthorized', handler);
  return () => target.removeEventListener('unauthorized', handler);
};
