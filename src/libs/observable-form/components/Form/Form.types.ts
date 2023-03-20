type ChangeEvent = {
  target: {
    name: React.ChangeEvent<HTMLInputElement>['target']['name'];
    value: React.ChangeEvent<HTMLInputElement>['target']['value'];
  };
};

type FocusEvent = {
  target: {
    name: React.FocusEvent<HTMLInputElement, Element>['target']['name'];
  };
};

export type FormHandlers = {
  onChange: (event: ChangeEvent) => void;
  onBlur: (event: FocusEvent) => void;
};
