export const buildObjectName = (originalName = 'upload.log') => {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `uploads/${Date.now()}-${safeName}`;
};

export const getFileExtension = (name = '') => {
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return name.slice(dotIndex).toLowerCase();
};
