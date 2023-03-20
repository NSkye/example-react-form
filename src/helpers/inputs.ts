import { ForwardedRef, RefObject } from 'react';

import { FieldConfig } from '@/components/Fields';

export const getInputType = (typeInConfig: FieldConfig<string>['type']) =>
  ({
    inputText: 'text',
    inputEmail: 'text',
    inputPassword: 'password',
  }[typeInConfig]);

export const isRefObject = <T>(ref: RefObject<T> | ForwardedRef<T>): ref is React.RefObject<T> => {
  if (typeof ref !== 'object' || ref === null) {
    return false;
  }

  return Object.hasOwn(ref, 'current');
};
