import { Fragment } from 'react';

import { Field, Form } from '@libs/observable-form';

import './App.css';

function App() {
  return (
    <div className="App">
      <Form>
        {() => (
          <Fragment>
            <div>
              <Field name="email" initialValue="foo@bar.com">
                {({ inputProps, meta }) => (
                  <div>
                    <label>
                      <div>Email</div>
                      <input
                        id="email"
                        type="text"
                        name={inputProps.name}
                        onBlur={inputProps.onBlur}
                        onChange={inputProps.onChange}
                        value={inputProps.value}
                      />
                    </label>
                    {meta.touched && meta.error && <div>{meta.error}</div>}
                  </div>
                )}
              </Field>
            </div>
            <div>
              <Field name="password">
                {({ inputProps, meta }) => (
                  <div>
                    <label>
                      <div>Password</div>
                      <input
                        id="password"
                        type="text"
                        name={inputProps.name}
                        onBlur={inputProps.onBlur}
                        onChange={inputProps.onChange}
                        value={inputProps.value}
                      />
                    </label>
                    {meta.touched && meta.error && <div>{meta.error}</div>}
                  </div>
                )}
              </Field>
            </div>
          </Fragment>
        )}
      </Form>
    </div>
  );
}

export default App;
