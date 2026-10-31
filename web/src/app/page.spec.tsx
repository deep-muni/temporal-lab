import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('the home page', () => {
  it('greets the visitor with Hello World', () => {
    render(<HomePage />);

    expect(screen.getByTestId('home-greeting')).toHaveTextContent(
      'Hello World',
    );
  });
});
