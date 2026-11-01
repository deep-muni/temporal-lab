import { Provider } from '@/components/ui/provider';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ColorModeToggle } from './color-mode-toggle';

describe('switching between light and dark mode', () => {
  it('switches to dark mode and offers to switch back', async () => {
    const user = userEvent.setup();
    render(<ColorModeToggle />, { wrapper: Provider });
    const toggle = await screen.findByTestId('app-color-mode-toggle');
    expect(toggle).toHaveAccessibleName('Switch to dark mode');

    await user.click(toggle);

    expect(
      await screen.findByTestId('app-color-mode-toggle'),
    ).toHaveAccessibleName('Switch to light mode');
    expect(document.documentElement).toHaveClass('dark');
  });
});
