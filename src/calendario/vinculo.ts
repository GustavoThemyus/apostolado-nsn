import { SANTORAL } from "./santoral";
import { PROPRIO_LOCAL } from "./proprioLocal";
import type { Postagem } from "../data/tipos";

/**
 * Qual postagem fala do que se celebra num dia.
 *
 * Casa em duas regras, nesta ordem: pelo nome da celebração, depois por mês e
 * dia. O ponto de projeto é **casar com a celebração, não com a casa do
 * calendário**: o motor já dá isso de graça, porque `nome` acompanha a festa
 * até a data para onde ela foi transferida.
 *
 * Quando 8 de dezembro cai em domingo do Advento e a Imaculada vai para o dia
 * 9, a postagem dela vai junto, sozinha. A regra por mês e dia é a saída para
 * quem está preso à data, e por isso ela confere `transferidaDe` antes de
 * `data`: a festa transferida guarda ali de onde veio.
 */

/**
 * O que daqui se precisa saber do dia.
 *
 * Mínimo de propósito, para servir aos dois calendários: o `DiaLiturgico`
 * calculado de 1962 e o `DiaDoOrdo` copiado do pré-55 satisfazem os dois a
 * forma, e o Perez quis o título clicável nos dois.
 */
export interface DiaParaVinculo {
  nome: string;
  data: Date;
  comemoracoes?: string[];
  transferidaDe?: string;
}

const normalizar = (s: string) =>
  s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * O nome da festa aparece no nome do dia?
 *
 * Igualdade era pouco, e era por isso que Cristo Rei não ligava: o Ordo da
 * capela escreve "FESTA DE NOSSO SENHOR JESUS CRISTO REI", com chapéu na
 * frente, e "Santo Antônio de Pádua, Confessor e Doutor da Igreja", com a
 * qualificação atrás.
 *
 * Procura-se o nome da festa dentro do nome do dia, e nunca o contrário. O
 * nome curto é o que a postagem declara, e os acréscimos são do calendário;
 * ao contrário, uma postagem chamada "São João" casaria com todos os Joões do
 * ano. Mesmo assim o nome declarado tem de ser inteiro: quem puser "São José"
 * numa postagem vai casar também com "São José Operário", e é por isso que o
 * campo aceita mais de um nome em vez de pedir um nome vago.
 */
const mesmoNome = (nomeDoDia: string, daFesta: string) =>
  normalizar(nomeDoDia).includes(normalizar(daFesta));

/** O campo aceita um nome ou vários: ver `Postagem.festa`. */
const nomesDa = (festa: { nome: string | string[] }): string[] =>
  Array.isArray(festa.nome) ? festa.nome : [festa.nome];

/**
 * A postagem que fala da celebração deste dia, achada pelo nome dela.
 *
 * Separada da busca por data porque as duas não valem o mesmo. Esta diz "o
 * dia é esta festa", e é a que faz do título um elo; a por data diz apenas
 * "há algo escrito sobre esta data" — Santa Filomena é 11 de agosto, e em
 * 1962 aquele dia é uma féria —, e para isso basta o cartão embaixo, que
 * nomeia a postagem em vez de prometer que o título leva a ela.
 */
export function postagemDaFesta(
  postagens: Postagem[],
  dia: DiaParaVinculo
): Postagem | undefined {
  return postagens.find((p) => {
    const f = p.festa;
    if (!f || !("nome" in f)) return false;
    return nomesDa(f).some(
      (nome) =>
        mesmoNome(dia.nome, nome) ||
        (dia.comemoracoes ?? []).some((c) => mesmoNome(c, nome)),
    );
  });
}

export function postagemDoDia(
  postagens: Postagem[],
  dia: DiaParaVinculo
): Postagem | undefined {
  const porNome = postagemDaFesta(postagens, dia);
  if (porNome) return porNome;

  // a data de origem, quando houve transferência; senão a do próprio dia
  const origem = dia.transferidaDe
    ? new Date(`${dia.transferidaDe}T12:00:00Z`)
    : dia.data;
  const mes = origem.getUTCMonth() + 1;
  const numero = origem.getUTCDate();

  return postagens.find((p) => {
    const f = p.festa;
    return !!f && "mes" in f && f.mes === mes && f.dia === numero;
  });
}

/**
 * Em que dia a festa cai normalmente, para ordenar uma lista de postagens.
 *
 * É só para ordenar: no calendário quem manda é a precedência, e uma festa
 * transferida aparece no dia para onde foi, não neste.
 */
export function diaHabitualDaFesta(
  festa: { nome: string | string[] } | { mes: number; dia: number } | undefined
): { mes: number; dia: number } | undefined {
  if (!festa) return undefined;
  if ("mes" in festa) return { mes: festa.mes, dia: festa.dia };
  const nomes = nomesDa(festa);
  const achada = [...PROPRIO_LOCAL, ...SANTORAL].find((f) =>
    nomes.some((nome) => mesmoNome(f.nome, nome)),
  );
  return achada ? { mes: achada.mes, dia: achada.dia } : undefined;
}
