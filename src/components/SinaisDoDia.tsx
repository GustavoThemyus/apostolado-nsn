import { celebracoesDoOrdo, type DiaDoOrdo } from "../calendario/ordo";
import type { DiaLiturgico } from "../calendario/tipos";

/**
 * Os sinais do canto da casa do dia, além da cor e da cruz de abstinência.
 *
 * O Perez pediu três grupos: as primeiras quintas e sextas do mês, as festas
 * próprias do Brasil e as quatro Têmporas. "O símbolo fica ao teu critério,
 * no estilo daquelas cruzes nas sextas pra marcar abstinência, mas pode ficar
 * em outro lugar, tipo no canto direito como está nas indulgências, e com um
 * símbolo específico para cada grupo."
 *
 * Canto direito, portanto, onde a grade das indulgências já põe o quadradinho
 * da plenária. A cruz fica onde estava: ela é da coluna do número, embaixo da
 * bolinha da cor, e mexer nela mexeria num sinal que o leitor já aprendeu.
 *
 * Desenho, e não caractere. É o que o resto da casa faz — a cruz são dois
 * gradientes, a bolinha é um `border-radius` — e por um motivo prático: a 8px
 * o que decide se o sinal se lê é a forma, e caractere depende da fonte que o
 * aparelho tiver. As quatro formas aqui são de longe distinguíveis umas das
 * outras: um círculo vazado, um coração, um losango e quatro pontos.
 */
export type Sinal = "primeiraQuinta" | "primeiraSexta" | "brasil" | "temporas";

export const NOME_DO_SINAL: Record<Sinal, string> = {
  primeiraQuinta: "Primeira quinta-feira do mês",
  primeiraSexta: "Primeira sexta-feira do mês",
  brasil: "Próprio do Brasil",
  temporas: "Têmporas",
};

/**
 * O desenho de cada sinal, num quadro de 10 por 10.
 *
 * A escolha não é arbitrária, e é o que faz o leitor lembrar sem consultar a
 * legenda duas vezes: a primeira quinta-feira é a da Hora Santa, e o círculo
 * vazado é a hóstia; a primeira sexta é a do Sagrado Coração, e é um coração;
 * o losango é a forma que sobrou, longe das outras três, para o Brasil; as
 * Têmporas são quatro pontos, que é o nome delas — as *quatro* Têmporas.
 */
function Desenho({ sinal }: { sinal: Sinal }) {
  if (sinal === "primeiraQuinta") {
    return <circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.3" />;
  }
  if (sinal === "primeiraSexta") {
    return (
      <path
        d="M5 9C1.4 6.4 0.6 4.4 1.6 2.7 2.5 1.2 4.2 1.3 5 2.6 5.8 1.3 7.5 1.2 8.4 2.7 9.4 4.4 8.6 6.4 5 9Z"
        fill="currentColor"
      />
    );
  }
  if (sinal === "brasil") {
    return (
      <path d="M5 0.8 9.2 5 5 9.2 0.8 5Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
    );
  }
  return (
    <>
      <circle cx="2.6" cy="2.6" r="1.5" fill="currentColor" />
      <circle cx="7.4" cy="2.6" r="1.5" fill="currentColor" />
      <circle cx="2.6" cy="7.4" r="1.5" fill="currentColor" />
      <circle cx="7.4" cy="7.4" r="1.5" fill="currentColor" />
    </>
  );
}

/** Um sinal sozinho, do tamanho em que ele aparece na legenda. */
export function Sinal({ sinal }: { sinal: Sinal }) {
  return (
    <svg
      className={`calendario__sinal calendario__sinal--${sinal}`}
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
    >
      <Desenho sinal={sinal} />
    </svg>
  );
}

/** Os sinais do dia, no canto da casa. Nenhum sinal, nenhum canto. */
export function SinaisDoDia({ sinais }: { sinais: Sinal[] }) {
  if (sinais.length === 0) return null;
  return (
    <span className="calendario__sinais" aria-hidden="true">
      {sinais.map((s) => (
        <Sinal sinal={s} key={s} />
      ))}
    </span>
  );
}

/**
 * As primeiras quinta e sexta do mês, que são devoção e não liturgia.
 *
 * Contam-se no calendário civil, e não no litúrgico: a primeira sexta-feira
 * de junho é a primeira sexta-feira de junho, caia o que cair nela. Por isso
 * saem da data pura e valem nos dois calendários da página.
 */
function primeirasDoMes(data: Date): Sinal[] {
  if (data.getUTCDate() > 7) return [];
  if (data.getUTCDay() === 4) return ["primeiraQuinta"];
  if (data.getUTCDay() === 5) return ["primeiraSexta"];
  return [];
}

/**
 * Os sinais de um dia do calendário de 1962, que este site calcula.
 *
 * As Têmporas saem do nome que o motor dá ao dia, e também da comemoração:
 * quando uma festa vence a féria, a Têmpora não some, desce a comemorada, e
 * é o que acontece com dois sábados de 2030 — São Mateus em 21 de setembro e
 * São Tomé em 21 de dezembro. Olhando só o nome, aquele ano teria dez
 * Têmporas em vez de doze, caladamente.
 *
 * As de Pentecostes precisam de uma terceira regra: naquela semana o motor
 * chama o dia de "Quarta-feira da Oitava de Pentecostes", porque é o que ele
 * é — a Oitava vence —, e as Têmporas não aparecem nem no nome nem na
 * comemoração. São a quarta, a sexta e o sábado dessa oitava, e nenhum outro
 * dia dela.
 *
 * O próprio do Brasil não entra aqui, e é a única das três coisas que falta:
 * o motor de 1962 conhece o Santoral universal e o Titular da capela, e as
 * festas brasileiras ele não tem. Elas estão no Ordo, escritas pelo Perez, e
 * é lá que o sinal aparece.
 */
export function sinaisDe1962(dia: DiaLiturgico): Sinal[] {
  const sinais = primeirasDoMes(dia.data);
  const naOitavaDePentecostes = /da Oitava de Pentecostes$/.test(dia.nome);
  const diaDeTempora = [3, 5, 6].includes(dia.data.getUTCDay());
  const ehTempora = (n: string) => /das Têmporas/.test(n);
  if (
    ehTempora(dia.nome) ||
    dia.comemoracoes.some(ehTempora) ||
    (naOitavaDePentecostes && diaDeTempora)
  ) {
    sinais.push("temporas");
  }
  return sinais;
}

/**
 * Os sinais de um dia do Ordo pré-55, que é copiado e não calculado.
 *
 * Os dois grupos litúrgicos saem do título que o Perez escreve acima da linha
 * da Missa — "Próprio do Brasil", "Quatro Têmporas da Quaresma" —, que o
 * separador do Ordo já lê e guarda em `proprio`. São 22 dias de Brasil e 12
 * de Têmporas em 2026, e é o que ele quis dizer com "todos já assinalados no
 * calendário": o dado estava escrito, faltava a grade mostrá-lo.
 *
 * Pelo título, e não por uma lista de nomes de festa: o Ordo de cada ano traz
 * os seus, e uma lista fechada deixaria de reconhecer os novos calada.
 */
export function sinaisDoOrdo(dia: DiaDoOrdo): Sinal[] {
  const sinais = primeirasDoMes(dia.data);
  const proprios = celebracoesDoOrdo(dia)
    .map((c) => c.proprio)
    .filter((p): p is string => !!p);
  if (proprios.some((p) => /^Próprio do Brasil/.test(p))) sinais.push("brasil");
  if (proprios.some((p) => /Têmporas/.test(p))) sinais.push("temporas");
  return sinais;
}
