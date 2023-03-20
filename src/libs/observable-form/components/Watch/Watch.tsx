import { useLayoutEffect } from 'react';

import { useFormContext } from '@libs/observable-form';
import { ObservableFormState, ObservableFormSubscribtionOptions } from '@libs/observable-form/core';

export const Watch = (props: {
  changes: ObservableFormSubscribtionOptions[];
  onChange: (state: ObservableFormState) => void;
}) => {
  const { actions } = useFormContext();

  const { changes, onChange } = props;
  const { subscribe, unsubscribe } = actions;

  useLayoutEffect(() => {
    const handleChange = (state: ObservableFormState) => {
      onChange(state);
    };

    for (const change of changes) {
      subscribe(change, handleChange);
    }

    return () => {
      for (const change of changes) {
        unsubscribe(change, handleChange);
      }
    };
  }, [changes, onChange, subscribe, unsubscribe]);

  return null;
};
