// Os SVGs da marca são brancos; como máscara, eles pegam a cor de onde estão
// (terra roxa no céu claro, luz do sol à noite).
const MARKS = {
  wordmark: { src: "/brand/kouth-wordmark.svg", ratio: 618 / 115 },
  spark: { src: "/brand/kouth-monogram.svg", ratio: 150 / 128 },
} as const;

export function Logo({
  mark,
  height,
  className = "",
  label = "KOUTH",
}: {
  mark: keyof typeof MARKS;
  height: number;
  className?: string;
  label?: string;
}) {
  const { src, ratio } = MARKS[mark];
  return (
    <span
      role="img"
      aria-label={label}
      className={`logo-mask inline-block shrink-0 ${className}`}
      style={{
        height,
        width: Math.round(height * ratio),
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
      }}
    />
  );
}
