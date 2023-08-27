import { isPlainObject } from 'lodash';

export const trim = (value: any, exclude?: string): any => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (Array.isArray(value)) {
    value.forEach((element, index) => {
      value[index] = trim(element);
    });
    return value;
  }
  if (isPlainObject(value)) {
    Object.keys(value).forEach((key) => {
      if (key !== exclude) value[key] = trim(value[key]);
    });
    return value;
  }
  return value;
};
