import { ReactNode, useCallback, useContext, useMemo, useRef } from 'react';
import { createContext } from 'react';

class CForm {
  state: {
    values: Record<string, string>;
    validators: Record<string, (value: string) => string | undefined>;
    errors: Record<string, string | undefined>;
    touched: Record<string, boolean>;
    submitting: boolean;
  };
  subscribtions: Map<string, Set<(state: CForm['state']) => void>>;
  notificationTimeout: Parameters<typeof clearTimeout>[0];
  waitingToNotify: string[] = [];

  constructor() {
    this.state = {
      values: {},
      validators: {},
      errors: {},
      touched: {},
      submitting: false,
    };
    this.subscribtions = new Map();
  }

  notify = (subscribtionTypes: string[]) => {
    this.waitingToNotify = this.waitingToNotify.concat(subscribtionTypes);
    clearTimeout(this.notificationTimeout);

    this.notificationTimeout = setTimeout(() => {
      const subscribtions = this.waitingToNotify
        .map(type => this.subscribtions.get(type) ?? [])
        .map(set => [...set])
        .flat();

      new Set(subscribtions).forEach(callback => callback(this.state));
      this.waitingToNotify = [];
    }, 0);
  };

  validate = (name: string, value: string) => {
    const validator = this.state.validators[name];
    const error = validator ? validator(value) : undefined;
    if (error === this.state.errors[name]) return;

    this.state.errors[name] = error;
    this.notify(['all', 'errors', `name:${name}`]);
  };

  updateValue = (name: string, value: string) => {
    if (value === this.state.values[name]) return;

    this.state.values[name] = value;
    this.validate(name, value);

    this.notify(['all', 'values', `name:${name}`]);
  };

  updateTouched = (name: string, touched: boolean) => {
    if (touched === this.state.touched[name]) return;

    this.state.touched[name] = touched;
    this.notify(['all', 'touched', `name:${name}`]);
  };

  updateSubmitting = (submitting: boolean) => {
    if (submitting === this.state.submitting) return;

    this.state.submitting = submitting;
    this.notify(['all', 'submitting']);
  };

  updateErrors = (errors: Record<string, string | undefined>) => {
    const erroredFields = [];

    for (const [name, error] of Object.entries(errors)) {
      if (error === this.state.errors[name]) continue;
      this.state.errors[name] = error;
      erroredFields.push(`name:${name}`);
    }

    this.notify(['all', 'errors', ...erroredFields]);
  };

  registerField = (options: {
    name: string;
    initialValue: string;
    validate: (value: string) => string | undefined;
  }) => {
    const { name, initialValue, validate } = options;

    this.state.values[name] = initialValue;
    this.state.validators[name] = validate;
    this.validate(name, initialValue);

    // this.notify(['all', 'values', 'validators', `name:${name}`]);
  };

  deregisterField = (name: string) => {
    delete this.state.values[name];
    delete this.state.validators[name];
    delete this.state.errors[name];
    delete this.state.touched[name];

    // this.notify(['all', 'values', 'touched', 'errors', 'validators', `name:${name}`]);
  };

  subscribe = (name: string, callback: (state: CForm['state']) => void) => {
    const set = this.subscribtions.get(name) || new Set();
    set.add(callback);
    this.subscribtions.set(name, set);
  };

  unsubscribe = (name: string, callback: (state: CForm['state']) => void) => {
    const set = this.subscribtions.get(name);
    if (set) {
      set.delete(callback);
    }
  };
}

const FormContext = createContext<{
  handlers: {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  };
  actions: {
    registerField: (options: {
      name: string;
      initialValue: string;
      validate: (value: string) => string | undefined;
      callback: (state: CForm['state']) => void;
    }) => void;
    deregisterField: (name: string, callback: (state: CForm['state']) => void) => void;
    subscribe: (name: string, callback: (state: CForm['state']) => void) => void;
    unsubscribe: (name: string, callback: (state: CForm['state']) => void) => void;
  };
} | null>(null);

export const useFormContext = () => {
  const form = useContext(FormContext);
  if (!form) {
    throw new Error('FormContext is not set');
  }
  return form;
};

export const Form = (props: {
  onSubmit?: (values: Record<string, string>) => Promise<Record<string, string | undefined>>;
  children?: (onSubmit: (event: React.FormEvent<HTMLFormElement>) => void) => ReactNode;
}) => {
  const { onSubmit } = props;
  const formState = useRef(new CForm());

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

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      formState.current.updateValue(name, value);
    },
    [formState],
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const { name } = event.target;
      formState.current.updateTouched(name, true);
    },
    [formState],
  );

  const registerField = useCallback(
    (options: {
      name: string;
      initialValue: string;
      validate: (value: string) => string | undefined;
      callback: (state: CForm['state']) => void;
    }) => {
      formState.current.registerField(options);
      formState.current.subscribe(`name:${options.name}`, options.callback);
    },
    [formState],
  );

  const deregisterField = useCallback(
    (name: string, callback: (state: CForm['state']) => void) => {
      formState.current.deregisterField(name);
      formState.current.unsubscribe(`name:${name}`, callback);
    },
    [formState],
  );

  const subscribe = useCallback(
    (name: string, callback: (state: CForm['state']) => void) => {
      formState.current.subscribe(name, callback);
    },
    [formState],
  );

  const unsubscribe = useCallback(
    (name: string, callback: (state: CForm['state']) => void) => {
      formState.current.unsubscribe(name, callback);
    },
    [formState],
  );

  const handlers = useMemo(
    () => ({
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [handleChange, handleBlur],
  );

  const actions = useMemo(
    () => ({
      registerField,
      deregisterField,
      subscribe,
      unsubscribe,
    }),
    [registerField, deregisterField, subscribe, unsubscribe],
  );

  const formContextValue = useMemo(() => ({ handlers, actions }), [handlers, actions]);

  return useMemo(
    () => (
      <FormContext.Provider value={formContextValue}>
        {props.children?.(handleSubmit)}
      </FormContext.Provider>
    ),
    [formContextValue, props, handleSubmit],
  );
};

/* export type FormState = {
  values: Record<string, string>;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  submitting: boolean;
  getFieldProps: (
    name: string,
    initialValue?: string,
  ) => {
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  };
};

export type FormActions = {
  registerField: (options: {
    name: string;
    initialValue: string;
    validate: (value: string) => string | undefined;
  }) => void;
  deregisterField: (name: string) => void;
};

type FormProps = {
  handlers: {
    onSubmit: (values: React.FormEvent<HTMLFormElement>) => void;
  };
};

const FormContext = createContext<FormState['getFieldProps'] | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('FormContext is not available');
  }
  return context;
};

export const Form = (props: {
  onSubmit?: (values: Record<string, string>) => Promise<Record<string, string | undefined>>;
  children?: ReactNode;
  render?: (formProps: FormProps) => React.ReactNode;
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const _render = props.render || props.children || (() => null);

  const { onSubmit } = props;

  const _handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitting(true);
      if (onSubmit) {
        const errors = await onSubmit(values);
        setErrors(previousErrors => ({ ...previousErrors, ...errors }));
      }
      setSubmitting(false);
    },
    [onSubmit, values],
  );

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues(previousValues => ({ ...previousValues, [name]: value }));
  }, []);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    setTouched(previousTouched => ({ ...previousTouched, [name]: true }));
  }, []);

  const getFieldProps: FormState['getFieldProps'] = useCallback(
    (name: string, defaultValue?: string) => ({
      name,
      value: values[name] ?? defaultValue ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur],
  );

  const registerField = useCallback(
    (options: {
      name: string;
      initialValue: string;
      validate: (value: string) => string | undefined;
    }) => {
      setValues(previousValues => ({ ...previousValues, [options.name]: options.initialValue }));
      setErrors(previousErrors => ({
        ...previousErrors,
        [options.name]: options.validate(options.initialValue),
      }));
      setTouched(previousTouched => ({ ...previousTouched, [options.name]: false }));
    },
    [],
  );

  const deregisterField = useCallback((name: string) => {
    setValues(previousValues => {
      const { [name]: _, ...rest } = previousValues;
      return rest;
    });
    setErrors(previousErrors => {
      const { [name]: _, ...rest } = previousErrors;
      return rest;
    });
    setTouched(previousTouched => {
      const { [name]: _, ...rest } = previousTouched;
      return rest;
    });
  }, []);

  const formActions: FormActions = useMemo(
    () => ({
      registerField,
      deregisterField,
    }),
    [registerField, deregisterField],
  );

  const formState: FormState = useMemo(
    () => ({ values, errors, touched, submitting, getFieldProps }),
    [values, errors, touched, submitting, getFieldProps],
  );

  const formContextValue = useMemo(
    () => ({ state: formState, actions: formActions }),
    [formState, formActions],
  );

  return useMemo(
    () => <FormContext.Provider value={getFieldProps}>{props.children}</FormContext.Provider>,
    [formContextValue, props.children, getFieldProps],
  );
};
*/
