import { customAlphabet } from 'nanoid';
import { isPlainObject } from 'lodash';
import sanitizeHtml from 'sanitize-html';

const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '0123456789';
const alphanumeric = numbers + lowercase + uppercase;
const nanoid = customAlphabet(alphanumeric);

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
  return nanoid(length);
};

export const isExpired = (date: Date, expireInMs: number): boolean => {
  return Date.now() - date.getTime() > expireInMs;
};
