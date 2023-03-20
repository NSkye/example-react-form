import React, { useCallback } from 'react';

import { Fields } from '@/components/Fields';

import './App.css';
import illustration from './assets/woman-tipping-hand.png';

function App() {
  const [currentValues, setCurrentValues] = React.useState<Record<string, string>>({});
  const [isValid, setIsValid] = React.useState<boolean>(true);

  const onSubmit = useCallback(
    (e: React.FormEvent<unknown>) => {
      e.preventDefault();
      console.log(currentValues);
    },
    [currentValues],
  );

  const handleValid = useCallback((hasErrors: boolean) => {
    setIsValid(!hasErrors);
  }, []);

  const handleChange = useCallback((values: Record<string, string>) => {
    setCurrentValues(values);
  }, []);

  return (
    <div className="App">
      <div aria-hidden className="App__illustration">
        <img src={illustration} className="App__image" alt="illustration" />
      </div>
      <h2 className="App__heading">Авторизация</h2>
      <form className="form" onSubmit={onSubmit}>
        <Fields
          onValid={handleValid}
          description={
            <p className="App__caption">
              Для доступа к личному кабинету вашей компании авторизуйтесь на сайте.
            </p>
          }
          onChange={handleChange}
          fields={[
            {
              id: 'first_name',
              type: 'inputText',
              label: 'First Name',
              defaultValue: 'Some first name',
            },
            {
              id: 'last_name',
              type: 'inputText',
              label: 'Last Name',
            },
            {
              id: 'email',
              type: 'inputEmail',
              label: 'Email',
              required: true,
            },
            {
              id: 'password',
              type: 'inputPassword',
              label: 'Password',
              required: true,
            },
          ]}
        />
        <button className="form__submit" onSubmit={onSubmit} type="submit" disabled={!isValid}>
          Войти
        </button>
      </form>
    </div>
  );
}

export default App;
