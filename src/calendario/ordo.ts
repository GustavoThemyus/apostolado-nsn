import { ANOS, ARQUIVOS } from "../data/ordo/indice";
import type { Penitencia } from "./penitencia";
import { tempoDe } from "./tempo";
import type { Cor, Tempo } from "./tipos";

/**
 * O calendário anterior à reforma de 1955.
 *
 * Ao contrário do de 1962, este não é calculado: é o Ordo que a própria capela
 * publica, importado dia a dia por `ferramentas/ordo/importar.py`. A razão de
 * copiar em vez de deduzir é que o Ordo traz o que regra nenhuma devolveria —
 * o grau no vocabulário pré-55, a Missa, as comemorações, o Prefácio, as
 * rubricas do dia e o próprio da Arquidiocese da Paraíba.
 *
 * Por isso ele cobre os anos que a capela publicou, e só esses. Fora deles a
 * página diz que não há Ordo, em vez de inventar um.
 */
export interface DiaDoOrdo {
  data: Date;
  /** Calculado, não copiado: o cômputo do tempo é o mesmo nos dois usos. */
  tempo: Tempo;
  nome: string;
  cor: Cor;
  /** Grau nas palavras do Ordo: "Duples maior", "Oitava privilegiada de 2ª ordem". */
  grau: string;
  /** Só quando a cor não é uma palavra só: dois paramentos, ou o róseo. */
  cores?: string;
  guarda?: boolean;
  /** Abstinência e jejum, como o próprio Ordo os marca. */
  penitencia?: Penitencia;
  /** Os PDF do próprio da Missa, anexados ao dia no Ordo. */
  anexos?: { nome: string; url: string }[];
  /** Missa, comemorações, Prefácio e rubricas, nas palavras do Ordo. */
  partes: string[];
}

export interface ArquivoDoOrdo {
  fonte: string;
  descricao: string;
  ano: number;
  dias: Record<string, Omit<DiaDoOrdo, "data" | "tempo">>;
}

/*
 * Um arquivo por ano, carregado sob demanda: são 27 KB comprimidos cada um, e
 * quem fica no calendário de 1962 — que é o padrão — não baixa nenhum. O
 * índice é gerado junto com os arquivos, e é o que permite saber quais anos
 * existem sem baixar nenhum deles.
 */
export const ANOS_COM_ORDO: number[] = [...ANOS].sort((a, b) => a - b);

export const temOrdo = (ano: number) => ANOS_COM_ORDO.includes(ano);

const carregados = new Map<number, ArquivoDoOrdo>();

export async function carregarOrdo(ano: number): Promise<ArquivoDoOrdo | null> {
  const emCache = carregados.get(ano);
  if (emCache) return emCache;
  const abrir = ARQUIVOS[ano];
  if (!abrir) return null;
  // o JSON chega com `cor: string`; a forma é garantida pelo importador e
  // conferida por ferramentas/ordo/conferir.py, que é onde isso se prova
  const modulo = (await abrir()) as unknown as { default: ArquivoDoOrdo };
  carregados.set(ano, modulo.default);
  return modulo.default;
}

const chave = (ano: number, mes: number, dia: number) =>
  `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

/** Os dias de um mês, já com o tempo litúrgico calculado. */
export function mesDoOrdo(arquivo: ArquivoDoOrdo, ano: number, mes: number): DiaDoOrdo[] {
  const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const dias: DiaDoOrdo[] = [];
  for (let d = 1; d <= ultimo; d++) {
    const registro = arquivo.dias[chave(ano, mes, d)];
    if (!registro) continue;
    const data = new Date(Date.UTC(ano, mes - 1, d));
    dias.push({ ...registro, data, tempo: tempoDe(data).tempo, partes: registro.partes ?? [] });
  }
  return dias;
}

/**
 * As Missas que o dia permite além da do dia: votiva, nupcial, de defuntos.
 *
 * O Ordo as traz numa linha só, sempre com a mesma abertura, em 385 das 365
 * — e o excedente não é um dia dizer duas vezes: é a segunda celebração
 * trazendo as dela. Por isso cada celebração guarda as suas, e não o dia.
 */
export const soAsPermitidas = (linha: string): string =>
  linha.replace(/^➢\s*Missas permitidas:\s*/i, "").trim();

/** A linha reconhecida como "Missas permitidas", para a lista de notas não a repetir. */
export const ehMissasPermitidas = (p: string): boolean =>
  /^➢\s*Missas permitidas/i.test(p);

/**
 * O grau do dia, separado do patrocínio quando há um.
 *
 * O Ordo escreve os dois numa frase só: "Padroeiro principal do país, duples
 * de 1ª classe com Oitava comum". São duas coisas de natureza diferente — o
 * que o santo é para esta terra, e que grau a festa tem —, e o Perez pediu
 * que aparecessem separadas.
 *
 * São cinco dias no ano, e o corte é sempre na vírgula antes da palavra do
 * grau. Quando ela não aparece, não se corta nada: inventar um corte num dia
 * que não previmos seria pior do que mostrar a frase inteira, como sempre.
 */
export function patrocinioDoGrau(grau: string): { patrocinio?: string; grau: string } {
  const corte = /^(.*?),\s*((?:semi)?duples\b.*)$/i.exec(grau);
  if (!corte || !/padroeir|titular/i.test(corte[1])) return { grau };
  return { patrocinio: corte[1].trim(), grau: corte[2].trim() };
}

/**
 * Festa maior: a de 1ª ou 2ª classe, no vocabulário pré-55.
 *
 * O Ordo escreve a classe dentro do grau — "Duples de 1ª classe" — e só as
 * duas primeiras existem: nos 365 dias de 2026 há 43 de 1ª e 38 de 2ª, e
 * nenhuma terceira. O resto se classifica por outra escala (duples,
 * semiduples, simples), que não se mistura com esta.
 *
 * Cuidado com a palavra vizinha: o Ordo também diz "féria maior de 2ª ordem"
 * e "Oitava privilegiada de 1ª ordem". Ordem não é classe, e por isso a
 * expressão inteira entra na busca.
 */
export const ehFestaMaiorDoOrdo = (dia: DiaDoOrdo): boolean =>
  /[12]\s*[ªa]\s*classe/i.test(dia.grau);

/**
 * Uma celebração dentro do dia.
 *
 * O Ordo do Perez não traz uma Missa por dia: traz a da capela e, em 32 dias
 * de 2026, a do mesmo dia como outro calendário o guarda — o Universal, o do
 * Brasil, o da Igreja Catedral da Arquidiocese. Em alguns dias traz também
 * uma segunda celebração da própria capela, como a Missa das Rogações, que
 * se anuncia só pelo posto.
 *
 * Tudo isso vinha num bloco de observações corrido, porque a tela lia só a
 * primeira linha e empilhava o resto. O Perez chegou a perguntar se teria de
 * criar um segundo evento no Google Calendar para separá-las; não tem — o
 * texto dele já vem separado e rotulado, faltava quem lesse.
 */
export interface Celebracao {
  /** "No Calendário Universal", "No Brasil", "Na Igreja Catedral…". */
  rotulo?: string;
  /** "Féria menor, simples – cor roxa": o posto do dia naquele calendário. */
  posto?: string;
  /** A linha da Missa, crua. Ausente quando o Ordo diz "Missa como acima". */
  missa?: string;
  /** Rubricas e o mais que vier, na ordem em que o Ordo as escreve. */
  notas: string[];
  /** As linhas de "Missas permitidas", cruas. */
  permitidas: string[];
  /**
   * É uma das Missas que a capela pode dizer no lugar da principal.
   *
   * Diferente de uma celebração rotulada: aquela é o mesmo dia noutro
   * calendário, e esta é uma escolha dentro deste. O Perez pediu as duas
   * coisas separadas, e com razão, porque "o que o Brasil reza" e "o que eu
   * posso rezar hoje" são perguntas distintas.
   */
  alternativa?: boolean;
}

/**
 * A linha que abre as Missas à escolha, no Ordo de 2027 em diante.
 *
 * Exata, e uma só. Aceitar variações seria a mesma frouxidão que já deixou
 * "No Brasil" e "No Brasil:" conviverem, e que custa uma conferência a cada
 * ano novo.
 */
const ABRE_ESCOLHA = /^Pode-se celebrar, à escolha:?$/i;

/*
 * Os três rótulos que o Ordo usa, e só eles, em linha que não diga mais nada.
 *
 * Estrito de propósito. Há uma linha que começa com "No Brasil" e continua
 * por uma frase inteira — "No Brasil pode-se dizer, com rito festivo, a Missa
 * do Dia segundo da Oitava de Nossa Senhora Aparecida – cor branca" —, e ela
 * não é rótulo: é o próprio anúncio da celebração, que entra pelo posto logo
 * abaixo.
 */
const EH_ROTULO =
  /^(No Calendário Universal|No Brasil|Na Igreja Catedral[^:]*?)\s*:?\s*$/;

/*
 * O posto: a linha que diz o grau e a cor daquela celebração, e que termina
 * sempre em "– cor <alguma>". É o único anúncio que a Missa das Rogações tem
 * — ela não vem debaixo de rótulo nenhum.
 */
const EH_POSTO = /[–-]\s*cor\s+\p{L}+\s*$/u;

const ehRubrica = (p: string) => p.startsWith("➢");

/**
 * Separa o dia nas celebrações que ele traz.
 *
 * A propriedade que vale mais que o acerto da estrutura: **nenhuma linha se
 * perde e nenhuma se repete.** O que o separador não reconhece continua
 * aparecendo, como nota, na ordem em que o Ordo escreveu. `ordo.teste.ts`
 * confere isso nos 365 dias — inventar estrutura é pior que mostrar a linha
 * crua, porque o que some ninguém vê sumir.
 */
export function celebracoesDoOrdo(dia: DiaDoOrdo): Celebracao[] {
  const saida: Celebracao[] = [];
  let atual: Celebracao = { notas: [], permitidas: [] };
  /* uma vez aberta, vale até um rótulo começar outro calendário */
  let escolhendo = false;

  const fechar = () => {
    const vazia =
      !atual.rotulo && !atual.posto && !atual.missa &&
      atual.notas.length === 0 && atual.permitidas.length === 0;
    if (!vazia) saida.push(atual);
    atual = { notas: [], permitidas: [] };
  };

  for (const cru of dia.partes) {
    const p = cru.trim();

    if (!ehRubrica(p) && ABRE_ESCOLHA.test(p)) {
      fechar();
      escolhendo = true;
      continue;
    }
    if (!ehRubrica(p) && EH_ROTULO.test(p)) {
      fechar();
      escolhendo = false;
      atual.rotulo = cru;
      continue;
    }
    if (!ehRubrica(p) && !p.startsWith("Missa") && EH_POSTO.test(p)) {
      /*
       * Rótulo e posto são o mesmo anúncio em duas linhas — "No Calendário
       * Universal:" e, embaixo, "São Pedro Canísio…, duples – cor branca".
       * Abrir celebração no posto quando o rótulo acabou de abrir uma
       * deixava o rótulo sozinho num bloco vazio e jogava a Missa e as
       * rubricas para um terceiro.
       */
      const soTemRotulo =
        atual.rotulo && !atual.posto && !atual.missa &&
        atual.notas.length === 0 && atual.permitidas.length === 0;
      if (!soTemRotulo) fechar();
      atual.posto = cru;
      if (escolhendo) atual.alternativa = true;
      continue;
    }
    if (ehMissasPermitidas(p)) {
      atual.permitidas.push(cru);
      continue;
    }
    /*
     * A primeira linha da celebração, e só ela. Não se exige que comece em
     * "Missa": no Tríduo e na Vigília de Pentecostes ela começa em "Rito:",
     * porque ali o que se faz não é uma Missa — é a ação litúrgica do dia.
     * Quem decide se dá para analisá-la em campos é `analisarMissa`, e,
     * quando não dá, a tela mostra a linha inteira.
     *
     * Só a primeira porque o Ordo escreve outras Missas mais abaixo, debaixo
     * da rubrica que diz em que caso valem — "Nas Missas privadas", "Onde se
     * fizer procissão e celebrar apenas uma Missa". Promovê-las separaria
     * cada uma da rubrica que lhe dá sentido, e a tela mostraria como Missa
     * do dia o que é exceção.
     */
    if (!ehRubrica(p) && !atual.missa) {
      atual.missa = cru;
      continue;
    }
    atual.notas.push(cru);
  }

  fechar();
  return saida;
}

export interface NaMissa {
  gloria: boolean;
  credo: boolean;
  /** O Ordo às vezes diz por quê: "por causa da Oitava", "por causa do Doutor". */
  gloriaPorque?: string;
  credoPorque?: string;
  prefacio?: string;
  /** O Ordo diz "Prefácio e Communicantes do Natal": o Communicantes é próprio. */
  communicantes?: boolean;
  fecho?: string;
  ultimoEvangelho?: string;
  /** Trato, Sequência, Aleluia: só quando o Ordo se dá ao trabalho de dizer. */
  entreAsLeituras: string[];
  comemoracoes: string[];
  /**
   * O que sobra da linha depois de tirar tudo o que já está nos campos acima:
   * o nome da Missa e as orações. É o que de fato muda de um dia para o
   * outro — o resto do itinerário se repete o ano inteiro, e repetido duas
   * vezes na mesma tela vira cansaço.
   */
  resto: string[];
}

/**
 * Procura um item na linha da Missa.
 *
 * Item por item, e não segmento por segmento: o Ordo tanto escreve "Glória"
 * sozinho entre dois pontos e vírgulas quanto "Missa Quasi modo do domingo
 * precedente: Glória" tudo junto, e num dia faltou o ponto e vírgula antes do
 * Prefácio. Exigir segmento próprio perdia 18 Glórias e 25 Credos.
 *
 * A negação é sempre "sem": não há "omite-se o Credo" em lugar nenhum do ano.
 */
function achar(linha: string, termo: string): { tem: boolean; porque?: string } {
  const achado = new RegExp(`(sem\\s+)?${termo}(\\s*\\(([^)]*)\\))?`).exec(linha);
  if (!achado) return { tem: false };
  return { tem: !achado[1], porque: achado[3] };
}

const primeiro = (linha: string, padrao: RegExp) => linha.match(padrao)?.[0]?.trim();

/**
 * O que acontece na Missa do dia, segundo o Ordo.
 *
 * O irmão disto do lado de 1962 é `desenvolvimentoDe`, que *deduz* das
 * rubricas gerais. Aqui não se deduz nada: o Ordo já escreve a linha da Missa
 * — "Missa Ecce advenit; Glória; Credo; Prefácio da Epifania; Ite, Missa est"
 * — e o que se faz é separá-la em campos.
 *
 * A diferença não é de estilo. No Natalício de São João Batista o Ordo não
 * manda Credo, e a dedução de 1962 mandaria, porque ela olha a classe: o
 * Credo depende da categoria da festa, não do grau. Onde os dois discordam,
 * quem está certo é o Ordo.
 *
 * A convenção da linha é que ela enumera o que se diz. Por isso a ausência de
 * "Glória" ou de "Credo" é uma afirmação, e não uma omissão — e o redator
 * ainda escreve "sem Credo" onde quer deixar claro.
 *
 * Recebe a linha, e não o dia, desde que o dia passou a ter mais de uma: a
 * mesma análise serve à Missa da capela e à do Calendário Universal logo
 * abaixo, que antes nem era lida.
 */
export function analisarMissa(linha: string | undefined): NaMissa | null {
  // Sexta-feira Santa, Sábado Santo e a Vigília de Pentecostes não abrem com
  // "Missa": abrem com o rito do dia, que não cabe nesta tabela
  if (!linha?.startsWith("Missa")) return null;

  const gloria = achar(linha, "Glória");
  const credo = achar(linha, "Credo");
  const prefacio = primeiro(linha, /Prefácio[^;]*/);
  const evangelho = primeiro(linha, /Último Evangelho[^;]*/);
  const fecho = primeiro(linha, /(Ite, Missa est|Benedicamus Domino|Requiescant in pace)[^;]*/);

  const entreAsLeituras: string[] = [];
  const comemoracoes: string[] = [];
  const resto: string[] = [];
  /*
   * O Ordo às vezes cola o primeiro item ao nome da Missa com dois pontos —
   * "Missa Quasi modo do domingo precedente: Glória", "Missa Ad te levavi do
   * domingo precedente: comemoração de São Sabas". Sem separar ali, o nome da
   * Missa ia embora junto com o item, e a linha ficava vazia.
   */
  const segmentos = linha.split(";").flatMap((cru) => {
    const corte = /^Missa\b[^:]*:/.exec(cru);
    return corte ? [corte[0].slice(0, -1), cru.slice(corte[0].length)] : [cru];
  });
  for (const cru of segmentos) {
    const p = cru.trim();
    if (/^(sem\s+)?Trato$/.test(p) || /^Sequência/.test(p) || /Aleluia/.test(p)) {
      entreAsLeituras.push(p);
    } else if (p.includes("comemoração")) comemoracoes.push(p);
    else {
      /*
       * O que sobra do segmento depois de tirar os itens que já viraram
       * campo. Tira-se de dentro, e não o segmento inteiro, porque o Ordo às
       * vezes cola dois numa frase só: "Missa Quasi modo do domingo
       * precedente: Glória" perderia o nome da Missa se o segmento fosse
       * descartado por causa da Glória.
       */
      const sobra = p
        .replace(/(sem\s+)?(Glória|Credo)(\s*\([^)]*\))?/g, "")
        .replace(/Prefácio[^;]*/g, "")
        .replace(/Último Evangelho[^;]*/g, "")
        .replace(/(Ite, Missa est|Benedicamus Domino|Requiescant in pace)[^;]*/g, "")
        .replace(/\s*[:,]\s*$/, "")
        .trim();
      if (sobra) resto.push(sobra);
    }
  }

  /*
   * "Prefácio e Communicantes da Epifania" é uma frase só e quer dizer duas
   * coisas: o Prefácio daquela festa e o Communicantes próprio dela. Tirar só
   * a palavra "Prefácio" deixaria a linha lendo "Prefácio: e Communicantes da
   * Epifania", que parece erro de digitação.
   */
  const composto = prefacio?.startsWith("Prefácio e Communicantes");

  return {
    gloria: gloria.tem,
    gloriaPorque: gloria.porque,
    credo: credo.tem,
    credoPorque: credo.porque,
    prefacio: prefacio?.replace(/^Prefácio( e Communicantes)?\s*/, ""),
    communicantes: composto || undefined,
    fecho,
    ultimoEvangelho: evangelho?.replace(/^Último Evangelho\s*/, ""),
    entreAsLeituras,
    comemoracoes,
    resto,
  };
}

/** A Missa da capela: a primeira do dia. */
export const naMissaDoOrdo = (dia: DiaDoOrdo): NaMissa | null =>
  analisarMissa(dia.partes[0]);
