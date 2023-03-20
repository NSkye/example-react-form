import { FieldConfig } from '@/components/Fields';

export const getInputType = (typeInConfig: FieldConfig<string>['type']) =>
  ({
    inputText: 'text',
    inputEmail: 'email',
    inputPassword: 'password',
  }[typeInConfig]);
