const originalToFixed = Number.prototype.toFixed;
Number.prototype.toFixed = function(digits?: number): string {
  const n = Number(this);
  if (isNaN(n)) return '0.00';
  return originalToFixed.call(n, digits ?? 2);
};
export {};
