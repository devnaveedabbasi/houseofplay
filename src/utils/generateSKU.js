export function generateSKU(formData) {
  const prefix = formData.productName.trim().toUpperCase().replace(/\s+/g, '-');
  const dims = `${formData.lengthMM || 0}x${formData.widthMM || 0}x${formData.heightMM || 0}`;
  const pack = `P${formData.denominationPackSize || 0}`;
  return `${prefix}-${dims}-${pack}`;
}