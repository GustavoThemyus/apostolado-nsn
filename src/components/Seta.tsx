/** A seta que marca "isto leva a outro lugar". Decorativa: o texto já diz. */
export function Seta({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h13M12 6l6 6-6 6" />
    </svg>
  );
}
