import { FieldConfig } from '@/components/Fields/Fields.types';

const validateCompose =
  (...validators: Array<(value: string) => string | undefined>) =>
  (value: string) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        return error;
      }
    }

    return undefined;
  };

const validateEmail = (value: string) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(value) ? undefined : 'Invalid email address';
};

const validateRequired = (value: string) => {
  return value ? undefined : 'Required';
};

export const validate = (field: Pick<FieldConfig<string>, 'type' | 'required'>) => {
  const validators = [];

  if (field.required) {
    validators.push(validateRequired);
  }

  if (field.type === 'inputEmail') {
    validators.push(validateEmail);
  }

  return validateCompose(...validators);
};
