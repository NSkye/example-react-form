import { deepCopy } from '@/libs/observable-form';

import {
  ObservableFormCallback,
  ObservableFormState,
  ObservableFormSubscribtionOptions,
  ObservableFormValidator,
} from './ObservableForm.types';

export class ObservableForm {
  state: ObservableFormState;
  subscribtions: Map<ObservableFormSubscribtionOptions, Set<ObservableFormCallback>>;
  notificationTimeout: Parameters<typeof clearTimeout>[0];
  waitingToNotify: ObservableFormSubscribtionOptions[] = [];
  safeMode: boolean;

  constructor(safe = true) {
    this.state = {
      values: {},
      validators: {},
      errors: {},
      touched: {},
      submitting: false,
    };
    this.subscribtions = new Map();
    this.safeMode = safe;
  }

  /**
   * Subscribe to form state changes.
   * @param name - Name of the field.
   * @param callback - Callback to be called when the state changes.
   */
  subscribe = (name: ObservableFormSubscribtionOptions, callback: ObservableFormCallback) => {
    const set = this.subscribtions.get(name) || new Set();
    set.add(callback);
    this.subscribtions.set(name, set);
  };

  /**
   * Unsubscribe from form state changes.
   * @param name - Name of the field.
   * @param callback - Callback that was previously passed to `subscribe`.
   */
  unsubscribe = (name: ObservableFormSubscribtionOptions, callback: ObservableFormCallback) => {
    const set = this.subscribtions.get(name);

    if (set) {
      set.delete(callback);
    }

    if (set?.size === 0) {
      this.subscribtions.delete(name);
    }
  };

  /**
   * Notify all subscribers about state changes.
   * @param subscribtionTypes - List of subscribtion types to notify.
   */
  notify = (subscribtionTypes: ObservableFormSubscribtionOptions[]) => {
    this.waitingToNotify = this.waitingToNotify.concat(subscribtionTypes);
    clearTimeout(this.notificationTimeout);

    // Timeout used to avoid notifying multiple times in a row.
    this.notificationTimeout = setTimeout(() => {
      const subscribtions = this.waitingToNotify
        .map(type => this.subscribtions.get(type) ?? [])
        .map(set => [...set])
        .flat();

      // Set is used to avoid notifying the same callback multiple times.
      new Set(subscribtions).forEach(callback =>
        callback(this.safeMode ? deepCopy(this.state) : this.state),
      );
      this.waitingToNotify = [];
    }, 0);
  };

  /**
   * Register a field in the form: add it to the state.
   * @param options - Options for registering a field.
   */
  registerField = (options: {
    name: string;
    initialValue: ObservableFormState['values'][string];
    validate: ObservableFormValidator;
  }) => {
    const { name, initialValue, validate } = options;

    this.state.values[name] = initialValue;
    this.state.validators[name] = validate;
    this.state.errors[name] = undefined;
    this.state.touched[name] = false;
    this.validate(name, initialValue);
  };

  /**
   * Deregister a field from the form: remove it from the state and unsubscribe all subscribers.
   * @param name - Name of the field.
   */
  deregisterField = (name: string) => {
    this.subscribtions.delete(`name:${name}`);
    delete this.state.values[name];
    delete this.state.validators[name];
    delete this.state.errors[name];
    delete this.state.touched[name];
  };

  /**
   * Validate a field, update the state and notify subscribers.
   * @param name name of the field
   * @param value value of the field
   * @returns
   */
  validate = (name: string, value: ObservableFormState['values'][string]) => {
    const validator = this.state.validators[name];
    const error = validator ? validator(value) : undefined;
    if (error === this.state.errors[name]) return;

    this.state.errors[name] = error;
    this.notify(['all', 'errors', `name:${name}`]);
  };

  /**
   * Update the value of a field, validate it and notify subscribers.
   * @param name name of the field
   * @param value value of the field
   * @returns
   */
  updateValue = (name: string, value: ObservableFormState['values'][string]) => {
    if (value === this.state.values[name]) return;

    this.state.values[name] = value;
    this.validate(name, value);

    this.notify(['all', 'values', `name:${name}`]);
  };

  /**
   * Mark a field as touched (was interacted with) and notify subscribers.
   * @param name name of the field
   * @param touched whether the field was touched
   * @returns
   */
  updateTouched = (name: string, touched: ObservableFormState['touched'][string]) => {
    if (touched === this.state.touched[name]) return;

    this.state.touched[name] = touched;
    this.notify(['all', 'touched', `name:${name}`]);
  };

  /**
   * Update the submitting state and notify subscribers.
   * @param submitting whether the form is submitting
   * @returns
   */
  updateSubmitting = (submitting: ObservableFormState['submitting']) => {
    if (submitting === this.state.submitting) return;

    this.state.submitting = submitting;
    this.notify(['all', 'submitting']);
  };

  /**
   * Overwrite existing errors with new ones and notify subscribers.
   * @param errors
   */
  updateErrors = (errors: ObservableFormState['errors']) => {
    const erroredFields: ObservableFormSubscribtionOptions[] = [];

    for (const [name, error] of Object.entries(errors)) {
      if (error === this.state.errors[name]) continue;
      this.state.errors[name] = error;
      erroredFields.push(`name:${name}`);
    }

    this.notify(['all', 'errors', ...erroredFields]);
  };
}
