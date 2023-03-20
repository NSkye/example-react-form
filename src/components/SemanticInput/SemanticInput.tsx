import { forwardRef, useCallback, useId, useMemo, useRef } from 'react';

import { FormHandlers } from '@libs/observable-form';

import config from '@/app.config.json';
import { CloseIcon } from '@/components/CloseIcon';
import { getInputType, isRefObject } from '@/helpers';
import { useCaret } from '@/hooks';

import { FieldConfig } from '../Fields';

import './SemanticField.css';

export const SemanticInput: React.ForwardRefExoticComponent<
  {
    type: FieldConfig<string>['type'];
    required?: FieldConfig<string>['required'];
    label: FieldConfig<string>['label'];
    defaultValue?: FieldConfig<string>['defaultValue'];
    name: string;
    value: string;
    touched?: boolean;
    error?: string;
    onChange?: FormHandlers['onChange'];
    onBlur?: FormHandlers['onBlur'];
  } & React.RefAttributes<HTMLInputElement>
> = forwardRef((props, passedRef) => {
  const { onChange, onBlur, name } = props;
  const defaultRef = useRef<HTMLInputElement>(null);
  const ref = passedRef ?? defaultRef;
  const { withCaret } = useCaret(ref, props.value);

  const id = useId();
  const hintId = `${id}-hint`;

  const handleChange = useMemo(
    () =>
      withCaret((event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
      }),
    [onChange, withCaret],
  );

  const handleClear = useCallback(() => {
    onChange?.({
      target: {
        name,
        value: '',
      },
    });

    if (!isRefObject(ref)) return;

    ref.current?.focus();
  }, [name, onChange, ref]);

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event);
    },
    [onBlur],
  );

  return (
    <div className="field">
      <label htmlFor={id} aria-label={props.label} className="field__with-hint">
        <input
          ref={ref}
          className="field__input"
          value={props.value}
          name={props.name}
          onChange={handleChange}
          onBlur={handleBlur}
          type={getInputType(props.type)}
          required={props.required}
          placeholder={props.label}
          aria-describedby={hintId}
          aria-label={props.label}
          id={id}
        />
        <button
          aria-label={config.clear}
          type="button"
          onClick={handleClear}
          className={`field__clear${!props.value ? ' field__clear--hidden' : ''}`}
          aria-hidden
        >
          <CloseIcon aria-hidden width="2rem" />
        </button>
        <p
          className="field__hint"
          role="alert"
          aria-live="assertive"
          aria-relevant="text"
          id={hintId}
        >
          {props.touched && !!props.error && props.error}
        </p>
      </label>
    </div>
  );
});
