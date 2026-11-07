import * as Separator from '@radix-ui/react-separator';

export function RadixSeparator({ className = '' }: { className?: string }) {
  return <Separator.Root className={`radix-separator ${className}`.trim()} decorative />;
}
