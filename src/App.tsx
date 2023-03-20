import { Fields } from '@/components/Fields';

import './App.css';

function App() {
  return (
    <div className="App">
      <Fields
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
    </div>
  );
}

export default App;
