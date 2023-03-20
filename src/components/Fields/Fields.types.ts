import { ReactNode } from 'react';

export type FieldConfig<T extends string> = {
  id: T;
  type: 'inputText' | 'inputEmail' | 'inputPassword';
  label: string;
  defaultValue?: string;
  required?: boolean;
};

export type FieldsConfig<T extends string> = FieldConfig<T>[];

export type FieldsComponent = <T extends string>(props: {
  fields: FieldsConfig<T>;
  description?: ReactNode;
  title?: ReactNode;
  onChange?: (values: Record<T, string>) => void;
  onValid?: (isValid: boolean) => void;
}) => React.ReactElement;
