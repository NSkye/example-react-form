import { FormHandlers } from '@libs/observable-form';

export type FieldRenderer = (props: {
  inputProps: FormHandlers & {
    name: string;
    value: string;
  };
  meta: {
    error: string | undefined;
    touched: boolean;
  };
}) => React.ReactNode;
