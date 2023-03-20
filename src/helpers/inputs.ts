import { FieldConfig } from '@/components/Fields';

export const getInputType = (typeInConfig: FieldConfig<string>['type']) =>
  ({
    inputText: 'text',
    inputEmail: 'text',
    inputPassword: 'password',
  }[typeInConfig]);
