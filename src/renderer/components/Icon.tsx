interface IconProps {
  name: string;
  size?: number;
  label?: string;
}

export function Icon({ name, size = 24, label }: IconProps) {
  return (
    <span
      className="icon"
      data-icon={name}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
