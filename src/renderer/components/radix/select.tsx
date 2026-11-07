import * as Select from '@radix-ui/react-select';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components';

const ALL_VALUE = '__all__';

export interface RadixSelectOption {
  value: string;
  label: string;
}

interface RadixSelectProps {
  id?: string;
  value: string;
  options: RadixSelectOption[];
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function RadixSelect({
  id,
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
  disabled = false,
  loading = false,
  className = '',
}: RadixSelectProps) {
  const normalizedValue = value === '' ? ALL_VALUE : value;
  const [open, setOpen] = useState(false);
  const tabIndexSnapshot = useRef<Array<{ element: HTMLElement; value: string | null }>>([]);
  const portalContainer =
    typeof document === 'undefined' ? undefined : (document.getElementById('root') ?? undefined);

  useEffect(() => {
    if (!open) return;
    // Radix Select hides the rest of the app with aria-hidden while open. The
    // background is already keyboard-trapped by the listbox; remove its
    // tab stops as well so it is not exposed as hidden focusable content.
    const timer = window.setTimeout(() => {
      const selector = 'button, [href], input, select, textarea, [tabindex]';
      const hiddenElements = Array.from(
        document.querySelectorAll<HTMLElement>('[aria-hidden="true"]'),
      );
      const focusable = new Set<HTMLElement>();
      for (const hidden of hiddenElements) {
        if (hidden.matches(selector)) focusable.add(hidden);
        hidden.querySelectorAll<HTMLElement>(selector).forEach((element) => focusable.add(element));
      }

      tabIndexSnapshot.current = Array.from(focusable).map((element) => ({
        element,
        value: element.getAttribute('tabindex'),
      }));
      tabIndexSnapshot.current.forEach(({ element }) => element.setAttribute('tabindex', '-1'));
    }, 0);

    return () => {
      window.clearTimeout(timer);
      tabIndexSnapshot.current.forEach(({ element, value }) => {
        if (value === null) element.removeAttribute('tabindex');
        else element.setAttribute('tabindex', value);
      });
      tabIndexSnapshot.current = [];
    };
  }, [open]);

  return (
    <Select.Root
      open={open}
      onOpenChange={setOpen}
      value={normalizedValue}
      onValueChange={(next) => onChange(next === ALL_VALUE ? '' : next)}
      disabled={disabled || loading}
    >
      <Select.Trigger
        id={id}
        className={`select radix-select-trigger ${className}`.trim()}
        aria-label={ariaLabel}
      >
        <Select.Value placeholder={loading ? 'Carregando…' : placeholder} />
        <Select.Icon className="radix-select-icon">
          <Icon name="arrow-down-s-line" size={16} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal container={portalContainer}>
        <Select.Content className="radix-select-content" position="popper" sideOffset={4}>
          <Select.Viewport className="radix-select-viewport">
            {options.map((option) => (
              <Select.Item
                key={option.value === '' ? ALL_VALUE : option.value}
                value={option.value === '' ? ALL_VALUE : option.value}
                className="radix-select-item"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="radix-select-indicator">
                  <Icon name="check-line" size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
