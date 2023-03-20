import config from '@/app.config.json';
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

/**
 * Only for example purposes, in practice email can take almost any
 * shape or form so it's better to use specific library for validation
 * or (better) ditch email validation altogether. See: https://stackoverflow.com/a/201378
 */
const validateEmail = (value: string) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(value) ? undefined : config.emailIsInvalid;
};

const validateRequired = (value: string) => {
  return value ? undefined : config.fieldIsRequired;
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
