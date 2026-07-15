import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Visible label text. When provided, a <label> is rendered and associated
   * with the input, giving it an accessible name. Omit only when an accessible
   * name is supplied another way (e.g. an `aria-label` prop).
   */
  label?: string;
}

/**
 * Token-styled native <input>. Forwards its ref and spreads all native input
 * props (value, onChange, type, disabled, etc.). When `label` is given it
 * renders an associated <label>; otherwise the bare input is returned so the
 * consumer can supply an accessible name via aria-* props.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputClasses = [styles.input, className].filter(Boolean).join(' ');
  const input = <input ref={ref} id={inputId} className={inputClasses} {...rest} />;

  if (label === undefined) {
    return input;
  }

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {input}
    </div>
  );
});
