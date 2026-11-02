import { getIconSvg } from '../assets/icons';

interface IconProps {
  name: string;
  size?: number;
  label?: string;
}

export function Icon({ name, size = 24, label }: IconProps) {
  const svg = getIconSvg(name);
  if (!svg) return null;

  return (
    <span
      className="icon"
      data-icon={name}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
