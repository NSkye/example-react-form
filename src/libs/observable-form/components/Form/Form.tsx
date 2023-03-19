import { ReactNode, useCallback, useContext, useMemo, useRef } from 'react';
import { createContext } from 'react';

import {
  ObservableForm,
  ObservableFormCallback,
  ObservableFormState,
  ObservableFormValidator,
} from '@libs/observable-form/core';

import { FormHandlers } from './Form.types';

const FormContext = createContext<{
  handlers: FormHandlers;
  actions: {
    registerField: (options: {
      name: string;
      initialValue: ObservableFormState['values'][string];
      validate: ObservableFormValidator;
      callback: ObservableFormCallback;
    }) => void;
    deregisterField: (name: string, callback: ObservableFormCallback) => void;
    subscribe: (name: string, callback: ObservableFormCallback) => void;
    unsubscribe: (name: string, callback: ObservableFormCallback) => void;
  };
} | null>(null);

export const useFormContext = () => {
  const form = useContext(FormContext);
  if (!form) {
    throw new Error('FormContext is not set');
  }
  return form;
};

/**
 * Form component.
 * It is responsible for managing form state and providing form handlers to children.
 * @param onSubmit - form submit handler
 * @param children - render function (children as render)
 * @returns
 */
export const Form = (props: {
  onSubmit?: (values: Record<string, string>) => Promise<Record<string, string | undefined>>;
  children?: (onSubmit: (event: React.FormEvent<HTMLFormElement>) => void) => ReactNode;
}) => {
  const { onSubmit, children } = props;
  const formState = useRef(new ObservableForm());

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      formState.current.updateSubmitting(true);

      const errors = await onSubmit?.(formState.current.state.values);
      formState.current.updateErrors(errors ?? {});
      formState.current.updateSubmitting(false);
    },
    [onSubmit],
  );

  const handleChange: FormHandlers['onChange'] = useCallback(
    event => {
      const { name, value } = event.target;
      formState.current.updateValue(name, value);
    },
    [formState],
  );

  const handleBlur: FormHandlers['onBlur'] = useCallback(
    event => {
      const { name } = event.target;
      formState.current.updateTouched(name, true);
    },
    [formState],
  );

  const registerField = useCallback(
    (options: {
      name: string;
      initialValue: string;
      validate: ObservableFormValidator;
      callback: ObservableFormCallback;
    }) => {
      formState.current.registerField(options);
      formState.current.subscribe(`name:${options.name}`, options.callback);
    },
    [formState],
  );

  const deregisterField = useCallback(
    (name: string, callback: ObservableFormCallback) => {
      formState.current.deregisterField(name);
      formState.current.unsubscribe(`name:${name}`, callback);
    },
    [formState],
  );

  const subscribe = useCallback(
    (name: string, callback: ObservableFormCallback) => {
      formState.current.subscribe(name, callback);
    },
    [formState],
  );

  const unsubscribe = useCallback(
    (name: string, callback: ObservableFormCallback) => {
      formState.current.unsubscribe(name, callback);
    },
    [formState],
  );

  return useMemo(
    () => (
      <FormContext.Provider
        value={{
          actions: {
            registerField,
            deregisterField,
            subscribe,
            unsubscribe,
          },
          handlers: {
            onChange: handleChange,
            onBlur: handleBlur,
          },
        }}
      >
        {children?.(handleSubmit)}
      </FormContext.Provider>
    ),
    [
      registerField,
      deregisterField,
      subscribe,
      unsubscribe,
      handleChange,
      handleBlur,
      children,
      handleSubmit,
    ],
  );
};
