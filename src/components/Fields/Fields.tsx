import { useCallback, useId, useMemo } from 'react';

import { Field, Form, Watch } from '@libs/observable-form';

import { ObservableFormState } from '@/libs/observable-form/core';

import './Fields.css';
import { FieldConfig, FieldsComponent } from './Fields.types';
import { validate } from './helpers';

const VALUES: ['values'] = ['values'];
const ERRORS: ['errors'] = ['errors'];

const getInputType = (typeInConfig: FieldConfig<never>['type']) =>
  ({
    inputText: 'text',
    inputEmail: 'email',
    inputPassword: 'password',
  }[typeInConfig]);

export const Fields: FieldsComponent = ({ fields, onChange, onValid, description }) => {
  const id = useId();
  const makeId = useCallback((fieldId: string) => `${id}-${fieldId}`, [id]);
  const hintId = useCallback((fieldId: string) => `${makeId(fieldId)}-hint`, [makeId]);

  const handleChange = useCallback(
    (state: ObservableFormState) => {
      onChange?.(state.values as Record<(typeof fields)[number]['id'], string>);
    },
    [onChange],
  );

  const handleErrors = useCallback(
    (state: ObservableFormState) => {
      const errors = state.errors;
      const hasErrors = Object.values(errors).some(error => !!error);
      onValid?.(hasErrors);
    },
    [onValid],
  );

  const renderedFields = useMemo(
    () =>
      fields.map(field => {
        const inputId = makeId(field.id);
        const hintInputId = hintId(field.id);

        return (
          <Field
            key={field.id}
            name={field.id}
            initialValue={field.defaultValue}
            validate={validate(field)}
          >
            {({ inputProps, meta }) => (
              <div className="field">
                <div className="field__with-hint">
                  <input
                    className="field__input"
                    type={getInputType(field.type)}
                    required={field.required}
                    placeholder={field.label}
                    aria-describedby={hintInputId}
                    aria-label={field.label}
                    id={inputId}
                    {...inputProps}
                  />
                  <p
                    className="field__hint"
                    role="alert"
                    aria-live="assertive"
                    aria-relevant="text"
                    id={hintInputId}
                  >
                    {meta.touched && !!meta.error && meta.error}
                  </p>
                </div>
              </div>
            )}
          </Field>
        );
      }),
    [fields, hintId, makeId],
  );

  return useMemo(
    () => (
      <Form>
        {() => (
          <fieldset className="fields">
            {description && <legend className="legend">{description}</legend>}
            {renderedFields}
            <Watch changes={VALUES} onChange={handleChange} />
            <Watch changes={ERRORS} onChange={handleErrors} />
          </fieldset>
        )}
      </Form>
    ),
    [description, handleChange, handleErrors, renderedFields],
  );
};
