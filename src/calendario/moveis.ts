import { diasMoveis } from "./proprios";

/**
 * As festas móveis dos calendários das confrarias, calculadas aqui.
 *
 * Um calendário do Google repete por regra: "todo 16 de julho", "o último
 * domingo de outubro". Festa móvel não é regra nenhuma que o iCal saiba
 * escrever — o Sagrado Coração é a sexta-feira depois da Oitava de Corpus
 * Christi, e Corpus Christi se conta a partir da Páscoa —, e por isso o Perez
 * as digitou uma a uma, um evento por ano.
 *
 * Isso tem prazo de validade, e foi o que ele viu: nas cinco agendas, toda
 * festa de data fixa aparece nos quatro anos da janela do Worker, e duas
 * aparecem só até 2027, que é até onde ele digitou. O Sagrado Coração do
 * Apostolado da Oração e a Páscoa da Ordem Terceira Dominicana somem da grade
 * no fim de 2027, sem aviso nenhum.
 *
 * A saída não é digitar mais quatro anos: é parar de acreditar na data. Quando
 * o nome do evento é de festa que o motor sabe situar, a data que veio do
 * Google se descarta e a do motor entra no lugar, para o ano que a grade está
 * mostrando. Deixa de ter prazo, e de quebra passa a acompanhar o calendário
 * de 1962 em vez de divergir dele.
 */

const normalizar = (s: string) =>
  s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Como as confrarias escrevem o que o motor chama de outra coisa.
 *
 * Só o que diverge, e por isso uma linha só. O Apostolado da Oração escreve
 * "Sagrado Coração de Jesus", igual ao motor, e não precisa de entrada; a
 * Dominicana escreve "Domingo da Ressurreição de Nosso Senhor Jesus Cristo",
 * e o motor diz "Domingo de Páscoa" — dois nomes em que nenhum contém o
 * outro, e o único caso assim nas cinco agendas de hoje.
 *
 * Estrito de propósito. Um apelido frouxo aqui põe a festa errada num dia que
 * ninguém vai conferir, e o que não casa continua aparecendo na data que o
 * Perez digitou: não reconhecer é o modo seguro de errar.
 */
const TAMBEM: Record<string, string[]> = {
  "Domingo de Páscoa": ["Domingo da Ressurreição"],
};

/**
 * Onde cai, neste ano, a festa móvel que o evento anuncia — ou nada.
 *
 * Procura o nome do motor dentro do texto do evento, e nunca o contrário: a
 * confraria escreve "Nosso Pai São Francisco de Assis, Fundador das Três
 * Ordens Seráficas", com chapéu na frente e qualificação atrás, e é o nome
 * curto que tem de caber no longo. É a mesma regra de `vinculo.ts`.
 *
 * Ganha o nome mais longo que couber, e não o primeiro: "Domingo da Oitava da
 * Páscoa" e "Domingo de Páscoa" são dois dias diferentes, e o dia certo é o
 * que casa com mais palavras.
 */
export function dataDaFestaMovel(texto: string, ano: number): Date | undefined {
  const alvo = normalizar(texto);
  let achado: { data: Date; letras: number } | undefined;

  for (const [data, dia] of diasMoveis(ano)) {
    for (const nome of [dia.nome, ...(TAMBEM[dia.nome] ?? [])]) {
      const n = normalizar(nome);
      if (!alvo.includes(n)) continue;
      if (!achado || n.length > achado.letras) achado = { data, letras: n.length };
    }
  }
  return achado?.data;
}
