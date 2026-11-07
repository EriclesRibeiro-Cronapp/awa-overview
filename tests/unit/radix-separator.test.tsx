import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RadixSeparator } from '../../src/renderer/components/radix/separator';

describe('Radix Separator', () => {
  it('renderiza separador horizontal decorativo com a classe visual atual', () => {
    const { container } = render(<RadixSeparator className="card-divider" />);
    const separator = container.querySelector('.radix-separator');

    expect(separator).not.toBeNull();
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    expect(separator).toHaveClass('card-divider');
  });

  it('mantém 1px e o token de borda no CSS', () => {
    const css = readFileSync(join(process.cwd(), 'src/renderer/styles/global.css'), 'utf8');
    const rule = css.match(/\.card-divider\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(rule).toMatch(/height:\s*1px/);
    expect(rule).toMatch(/background:\s*var\(--color-border-subtle\)/);
  });
});
