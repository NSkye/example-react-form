import React, { useCallback } from 'react';

import { Fields, FieldsConfig } from '@/components/Fields';

import './App.css';
import config from './app.config.json';
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
      <h2 className="App__heading">{config.title}</h2>
      <form className="form" onSubmit={onSubmit}>
        <Fields
          onValid={handleValid}
          description={<p className="App__caption">{config.description}</p>}
          onChange={handleChange}
          fields={config.fields as FieldsConfig<string>}
        />
        <button className="form__submit" onSubmit={onSubmit} type="submit" disabled={!isValid}>
          {config.submit}
        </button>
      </form>
    </div>
  );
}

export default App;
