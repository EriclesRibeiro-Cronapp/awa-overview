import * as ScrollArea from '@radix-ui/react-scroll-area';
import type { ReactNode } from 'react';

export function RadixScrollArea({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ScrollArea.Root className={`radix-scroll-area ${className}`.trim()} type="auto">
      <ScrollArea.Viewport className="radix-scroll-viewport" tabIndex={0}>
        {children}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className="radix-scrollbar"
        orientation="vertical"
        aria-label="Rolagem do conteúdo"
      >
        <ScrollArea.Thumb className="radix-scrollbar-thumb" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner className="radix-scroll-corner" />
    </ScrollArea.Root>
  );
}
