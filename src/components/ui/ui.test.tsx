import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRef, useState } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

afterEach(() => {
  cleanup();
});
// Import through the barrel so these tests also prove src/components/ui/index.ts
// re-exports all three primitives (AC10 barrel requirement).
import { Button, Input, Card } from '@components/ui';

describe('Button (AC10)', () => {
  it('renders its children as the button accessible name', () => {
    // fails if Button stops rendering children into a native <button>.
    render(<Button>Save changes</Button>);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('spreads native props: onClick fires when clicked', async () => {
    // fails if Button no longer spreads native props (onClick) onto the element.
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    // fails if the disabled native prop is dropped and the handler still fires.
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Click me
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('selects a distinct rendered variant via the variant prop', () => {
    // fails if the variant prop is ignored — primary/secondary would be indistinguishable.
    render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Primary' })).toHaveAttribute(
      'data-variant',
      'primary',
    );
    expect(screen.getByRole('button', { name: 'Secondary' })).toHaveAttribute(
      'data-variant',
      'secondary',
    );
  });

  it('defaults the variant to primary', () => {
    // fails if the primary default is removed.
    render(<Button>Default</Button>);
    expect(screen.getByRole('button', { name: 'Default' })).toHaveAttribute(
      'data-variant',
      'primary',
    );
  });

  it('forwards its ref to the underlying <button>', () => {
    // fails if forwardRef wiring is dropped — consumers could not reach the DOM node.
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref target</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe('Ref target');
  });
});

describe('Input (AC10)', () => {
  it('exposes an accessible name via an associated label', () => {
    // fails if the label is no longer associated with the input.
    render(<Input label="Email" />);
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });

  it('exposes an accessible name via aria-label when no label is given', () => {
    // fails if the bare-input (aria-label) branch stops spreading aria props.
    render(<Input aria-label="Search" />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('spreads value/onChange so typing updates the controlled value', async () => {
    // fails if value/onChange native props are not spread onto the <input>.
    function ControlledInput() {
      const [value, setValue] = useState('');
      return <Input label="Name" value={value} onChange={(e) => setValue(e.target.value)} />;
    }
    render(<ControlledInput />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    await userEvent.type(input, 'Ada');
    expect(input).toHaveValue('Ada');
  });
});

describe('Card (AC10)', () => {
  it('renders its children inside the container', () => {
    // fails if Card stops rendering its children.
    render(
      <Card>
        <span>card body</span>
      </Card>,
    );
    expect(screen.getByText('card body')).toBeInTheDocument();
  });
});
