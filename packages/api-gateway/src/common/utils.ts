export const isObject = (obj: any): boolean => {
  const type = typeof obj;
  return type === 'function' || (type === 'object' && !!obj);
};
export const trim = (value: any, exclude?: string): any => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (isObject(value)) {
    Object.keys(value).forEach((key) => {
      if (key !== exclude) value[key] = trim(value[key]);
    });
    return value;
  }
  return value;
};
