import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';

import { FormHandlers } from '@libs/observable-form';

import config from '@/app.config.json';
import { CloseIcon } from '@/components/CloseIcon';
import { getInputType } from '@/helpers';

import { FieldConfig } from '../Fields';

import './StyledField.css';

const isRefObject = (ref: unknown): ref is React.RefObject<HTMLInputElement> => {
  if (typeof ref !== 'object' || ref === null) {
    return false;
  }

  return Object.hasOwn(ref, 'current');
};

export const StyledField: React.ForwardRefExoticComponent<
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
  const [selectionRange, setSelectionRange] = useState<Record<
    'selectionStart' | 'selectionEnd',
    number | null
  > | null>(null);
  const id = useId();
  const hintId = `${id}-hint`;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      const { selectionStart, selectionEnd } = event.target;
      setSelectionRange({ selectionStart, selectionEnd });
    },
    [onChange],
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

  useEffect(() => {
    if (!isRefObject(ref)) return;

    const input = ref.current;

    if (input && selectionRange && selectionRange.selectionStart) {
      const newPosition = selectionRange.selectionStart + (props.value.length - input.value.length);

      if (input === document.activeElement) {
        input.setSelectionRange(newPosition, newPosition);
      }
    }
  }, [props.value.length, ref, selectionRange]);

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
          className="field__clear"
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
