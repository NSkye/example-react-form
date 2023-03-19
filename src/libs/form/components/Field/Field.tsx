import { useLayoutEffect, useMemo, useState } from 'react';

import { useFormContext } from '../Form';

const defaultValidate = (_value: string) => {
  return undefined;
};

type RenderField = (props: {
  inputProps: any;
  meta: {
    error: string | undefined;
    touched: boolean;
  };
}) => React.ReactNode;

export const Field = (props: {
  name: string;
  initialValue?: string;
  validate?: (value: string) => string | undefined;
  children?: RenderField;
  render?: RenderField;
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

  useLayoutEffect(() => {
    const onUpdate = (formState: any) => {
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
