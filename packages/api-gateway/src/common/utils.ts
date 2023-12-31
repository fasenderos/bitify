import { isPlainObject } from 'lodash';
import sanitizeHtml from 'sanitize-html';
import { getRandomValues } from 'crypto';

export const sanitize = (value: string): string => {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

export const trim = (value: any, exclude?: string): any => {
  if (typeof value === 'string') {
    return sanitize(value).trim();
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

export const createRandomString = (length = 32): string => {
  let result = '';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const alphanumeric = numbers + lowercase + uppercase;
  const charactersLength = alphanumeric.length;

  // Create an array of 32-bit unsigned integers
  const randomValues = new Uint32Array(length);
  // Generate random values
  getRandomValues(randomValues);
  randomValues.forEach((value) => {
    result += alphanumeric.charAt(value % charactersLength);
  });
  return result;
};

export const isExpired = (date: Date, expireInMs: number): boolean => {
  return Date.now() - date.getTime() > expireInMs;
};
