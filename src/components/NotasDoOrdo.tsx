const SO_PENITENCIA =
  /^(Dia de (jejum e )?abstinência|Hoje é dispensada a Abstinência de carne)$/i;

const ehMarcada = (p: string) => /^[➢❖]/.test(p);

export const notasQueValem = (notas: string[]): string[] =>
  notas.filter((p) => !SO_PENITENCIA.test(p.trim()));

export function NotasDoOrdo({ notas }: { notas: string[] }) {
  const valem = notasQueValem(notas);
  if (valem.length === 0) return null;
  return (
    <ul className="ordo__notas">
      {valem.map((p) => (
        <li
          className={ehMarcada(p) ? "ordo__nota" : "ordo__nota ordo__nota--corrida"}
          key={p}
        >
          {p.replace(/^[➢❖]\s*/, "")}
        </li>
      ))}
    </ul>
  );
}
