/*
 * O parágrafo que só anuncia a penitência sai da lista: ele já virou a linha
 * em destaque acima e a cruz na grade, e repetido aqui embaixo é a mesma
 * informação pela terceira vez. Conferido: os 53 dias que a trazem dizem
 * exatamente uma destas três frases, e mais nada.
 */
const SO_PENITENCIA =
  /^(Dia de (jejum e )?abstinência|Hoje é dispensada a Abstinência de carne)$/i;

/** O Ordo marca com ➢ ou ❖ a nota que é rubrica, e deixa corrida a que é aviso. */
const ehMarcada = (p: string) => /^[➢❖]/.test(p);

export const notasQueValem = (notas: string[]): string[] =>
  notas.filter((p) => !SO_PENITENCIA.test(p.trim()));

/**
 * As rubricas que o Ordo escreve embaixo do dia.
 *
 * Em arquivo próprio porque são duas telas: o detalhe do dia no calendário e
 * a faixa de hoje na página inicial. "No calendário da página inicial eu
 * quero que dê pra ver as notas do dia, quando houver", pediu o Perez — e
 * eram justamente elas que a faixa deixava de fora, enquanto o calendário as
 * trazia. Copiado o filtro, as duas telas divergiriam na primeira correção.
 */
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
