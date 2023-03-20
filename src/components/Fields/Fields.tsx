import { useId } from 'react';

import { Field, Form } from '@libs/observable-form';

import { FieldConfig, FieldsComponent } from './Fields.types';
import { validate } from './helpers';

const getInputType = (typeInConfig: FieldConfig<never>['type']) =>
  ({
    inputText: 'text',
    inputEmail: 'email',
    inputPassword: 'password',
  }[typeInConfig]);

export const Fields: FieldsComponent = ({ fields }) => {
  const id = useId();
  const makeId = (fieldId: string) => `${id}-${fieldId}`;
  const hintId = (fieldId: string) => `${makeId(fieldId)}-hint`;

  const renderedFields = fields.map(field => {
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
          <div>
            <label htmlFor={inputId}>{field.label}</label>
            <input
              type={getInputType(field.type)}
              aria-describedby={hintInputId}
              id={inputId}
              {...inputProps}
            />
            <p role="alert" aria-live="assertive" aria-relevant="text" id={hintInputId}>
              {meta.touched && !!meta.error && meta.error}
            </p>
          </div>
        )}
      </Field>
    );
  });

  return <Form>{() => <div>{renderedFields}</div>}</Form>;
};
