// Os SVGs da marca são brancos; como máscara, eles pegam a cor de onde estão
// (terra roxa no céu claro, luz do sol à noite).
const MARKS = {
  wordmark: { src: "/logos/wordmark-horizontal.svg", ratio: 750 / 68 },
  spark: { src: "/logos/spark-icon.svg", ratio: 589 / 596 },
} as const;

export function Logo({
  mark,
  height,
  className = "",
  label = "MirageKouth",
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
