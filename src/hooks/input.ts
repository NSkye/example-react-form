import { ForwardedRef, RefObject, useCallback, useEffect, useState } from 'react';

import { isRefObject } from '@/helpers';

/**
 * Hook to handle caret position in input field when value changes
 * and prevent caret from jumping to the end of the input field.
 * @param inputRef
 * @param value
 * @returns
 */
export const useCaret = (
  inputRef: RefObject<HTMLInputElement> | ForwardedRef<HTMLInputElement>,
  value: string,
) => {
  const [selectionRange, setSelectionRange] = useState<Record<
    'selectionStart' | 'selectionEnd',
    number | null
  > | null>(null);

  const handleCaret = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectionStart, selectionEnd } = event.target;
    setSelectionRange({ selectionStart, selectionEnd });
  }, []);

  const withCaret = useCallback(
    (callback: (event: React.ChangeEvent<HTMLInputElement>) => void) => {
      return (event: React.ChangeEvent<HTMLInputElement>) => {
        const result = callback(event);
        handleCaret(event);
        return result;
      };
    },
    [handleCaret],
  );

  useEffect(() => {
    if (!isRefObject(inputRef)) return;

    const input = inputRef.current;

    if (input && selectionRange) {
      const newPosition = selectionRange.selectionStart ?? 0 + (value.length - input.value.length);
      if (input === document.activeElement) {
        input.setSelectionRange(newPosition, newPosition);
      }
    }
  }, [inputRef, selectionRange, value.length]);

  return { withCaret };
};
