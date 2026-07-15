import { forwardRef, type HTMLAttributes } from 'react';
import styles from './Card.module.css';

export type CardProps = HTMLAttributes<HTMLDivElement>;

/**
 * Token-styled container. Forwards its ref, spreads native div props, and
 * renders its children inside a bordered, elevated surface.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, children, ...rest },
  ref,
) {
  const classes = [styles.card, className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={classes} {...rest}>
      {children}
    </div>
  );
});
