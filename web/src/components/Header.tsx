export function Header() {
  return (
    <header className="flex items-center justify-center pt-10 pb-4 sm:pt-14">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/logo-horizontal.svg"
        alt="MirageKouth"
        className="h-24 sm:h-32 w-auto opacity-95"
      />
    </header>
  );
}
