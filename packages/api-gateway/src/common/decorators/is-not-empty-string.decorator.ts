import {
  ValidationOptions,
  registerDecorator,
  isNotEmpty,
  isString,
  ValidationArguments,
} from 'class-validator';

// Check the value is a non empty string
export function IsNotEmptyString(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'isNotEmptyString',
      target: object.constructor,
      propertyName,
      options: validationOptions ?? {},
      validator: {
        validate: (value: any): boolean =>
          isString(value) && isNotEmpty(value.trim()),
        defaultMessage: (validationArguments?: ValidationArguments): string =>
          `${validationArguments?.property} must be a non empty string`,
      },
    });
  };
}
