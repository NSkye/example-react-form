import { useCallback, useMemo } from 'react';

import { Field, Form, Watch } from '@libs/observable-form';
import { ObservableFormState } from '@libs/observable-form/core';

import { SemanticInput } from '@/components/SemanticInput';
import { validate } from '@/helpers';

import './Fields.css';
import { FieldsComponent } from './Fields.types';

const VALUES: ['values'] = ['values'];
const ERRORS: ['errors'] = ['errors'];

export const Fields: FieldsComponent = ({ fields, onChange, onValid, description }) => {
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
        return (
          <Field
            key={field.id}
            name={field.id}
            initialValue={field.defaultValue}
            validate={validate(field)}
          >
            {({ inputProps, meta }) => (
              <SemanticInput
                type={field.type}
                required={field.required}
                label={field.label}
                defaultValue={field.defaultValue}
                {...meta}
                {...inputProps}
              />
            )}
          </Field>
        );
      }),
    [fields],
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
