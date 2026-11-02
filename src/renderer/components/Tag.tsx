import type { ReactNode } from 'react';

export type TagType = 'success' | 'danger' | 'inactive' | 'alert' | 'info';

export function Tag({ type, children }: { type: TagType; children: ReactNode }) {
  return <span className={`tag tag-${type}`}>{children}</span>;
}
