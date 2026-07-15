import { forwardRef, type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. Defaults to "primary". */
  variant?: ButtonVariant;
}

/**
 * Token-styled native <button>. Forwards its ref and spreads all native button
 * props (onClick, disabled, type, etc.). Defaults `type` to "button" so it does
 * not accidentally submit an enclosing form.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', type = 'button', className, children, ...rest },
  ref,
) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  return (
    <button ref={ref} type={type} data-variant={variant} className={classes} {...rest}>
      {children}
    </button>
  );
});
