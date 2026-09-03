/** Estrela de oito pontas, o motivo que preenche o campo do brasão. */
export function Estrela({ className = "estrela" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 0l2.1 7.2L21 4.2l-3 6.9 6.9 2.1-6.9 2.1 3 6.9-6.9-3L12 24l-2.1-7.2-6.9 3 3-6.9L-1 12l7-2.1-3-6.9 6.9 3z" />
    </svg>
  );
}
