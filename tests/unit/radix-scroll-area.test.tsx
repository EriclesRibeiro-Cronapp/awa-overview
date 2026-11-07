import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RadixScrollArea } from '../../src/renderer/components/radix/scroll-area';

describe('Radix Scroll Area', () => {
  it('exibe os 10 itens e deixa o viewport focável para rolagem por teclado', () => {
    const { container } = render(
      <RadixScrollArea className="card-body">
        {Array.from({ length: 10 }, (_, index) => (
          <p key={index}>Item {index + 1}</p>
        ))}
      </RadixScrollArea>,
    );

    expect(screen.getByText('Item 10')).toBeInTheDocument();
    expect(screen.getAllByText(/^Item /)).toHaveLength(10);

    const viewport = container.querySelector('.radix-scroll-viewport');
    expect(viewport).toHaveAttribute('tabindex', '0');
    expect(container.querySelector('.radix-scroll-area')).toHaveClass('card-body');

    const css = readFileSync(join(process.cwd(), 'src/renderer/styles/global.css'), 'utf8');
    expect(css).toMatch(/\.radix-scrollbar\s*\{\s*display:\s*none;/);
  });
});
