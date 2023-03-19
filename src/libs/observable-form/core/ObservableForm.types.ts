export type ObservableFormState = {
  values: Record<string, string>;
  validators: Record<string, (value: string) => string | undefined>;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  submitting: boolean;
};

export type ObservableFormCallback = (state: ObservableFormState) => void;

export type ObservableFormValidator = (
  value: ObservableFormState['values'][string],
) => ObservableFormState['errors'][string];
