import { useLayoutEffect, useMemo, useState } from 'react';

import { useFormContext } from '@libs/observable-form';
import {
  ObservableFormCallback,
  ObservableFormState,
  ObservableFormValidator,
} from '@libs/observable-form/core';

import { FieldRenderer } from './Field.types';

const defaultValidate = (_value: string) => {
  return undefined;
};

/**
 * Field component.
 * It is responsible for registering field in form and updating field value.
 * It also provides inputProps and meta to render function.
 * @param name - field name
 * @param initialValue - initial field value
 * @param validate - field validator
 * @param children - render function (children as render)
 * @param render - render function (render prop)
 * @returns
 */
export const Field = (props: {
  name: string;
  initialValue?: ObservableFormState['values'][string];
  validate?: ObservableFormValidator;
  children?: FieldRenderer;
  render?: FieldRenderer;
}) => {
  const [value, setValue] = useState(props.initialValue ?? '');
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);

  const { actions, handlers } = useFormContext();
  const { registerField, deregisterField } = actions;

  const render = useMemo(() => props.children ?? props.render, [props.children, props.render]);

  const inputProps = useMemo(
    () => ({
      name: props.name,
      value,
      ...handlers,
    }),
    [props.name, value, handlers],
  );

  const meta = useMemo(
    () => ({
      error,
      touched,
    }),
    [error, touched],
  );

  /**
   * Register field on mount and deregister on unmount.
   * useEffect is not used here because we want to register field before render.
   * This is important because we want to have access to field value in render function.
   * If we use useEffect, we will have to wait for next render to get field value.
   */
  useLayoutEffect(() => {
    const onUpdate: ObservableFormCallback = formState => {
      const nextValue = formState.values[props.name];
      const nextError = formState.errors[props.name];
      const nextTouched = formState.touched[props.name];

      setValue(nextValue);
      setError(nextError);
      setTouched(nextTouched);
    };

    registerField({
      name: props.name,
      initialValue: props.initialValue ?? '',
      validate: props.validate ?? defaultValidate,
      callback: onUpdate,
    });

    return () => deregisterField(props.name, onUpdate);
  }, [props.name, props.initialValue, props.validate, registerField, deregisterField]);

  return useMemo(
    () => <>{render ? render({ inputProps, meta }) : null}</>,
    [render, inputProps, meta],
  );
};
