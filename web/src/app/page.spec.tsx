import { Provider } from '@/components/ui/provider';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('the home page', () => {
  it('greets the visitor with Hello World', () => {
    render(<HomePage />, { wrapper: Provider });

    expect(screen.getByTestId('home-greeting')).toHaveTextContent(
      'Hello World',
    );
  });
});
