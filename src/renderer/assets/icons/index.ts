const modules = import.meta.glob('./*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function getIconSvg(name: string): string | null {
  const entry = Object.entries(modules).find(([path]) => path.endsWith(`/${name}.svg`));
  if (!entry) return null;

  return entry[1]
    .replace(/<svg([^>]*)>/, (_match, attributes: string) => {
      const cleaned = attributes
        .replace(/\swidth="[^"]*"/g, '')
        .replace(/\sheight="[^"]*"/g, '');
      return `<svg${cleaned}>`;
    })
    .replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"');
}
