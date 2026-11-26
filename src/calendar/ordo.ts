import { ANOS, ARQUIVOS, ATE } from "../data/ordo/indice";
import type { Penitencia } from "./penitencia";
import { tempoDe } from "./tempo";
import type { Cor, Tempo } from "./tipos";

export interface DiaDoOrdo {
  data: Date;
  tempo: Tempo;
  nome: string;
  cor: Cor;
  rito: string;
  grau?: string;
  subtitulo?: string;
  proprio?: string;
  outras?: OutraMissa[];
  cores?: string;
  guarda?: boolean;
  penitencia?: Penitencia;
  anexos?: { nome: string; url: string }[];
  partes: string[];
}

export interface OutraMissa {
  rotulo?: string;
  alternativa?: boolean;
  nome: string;
  subtitulo?: string;
  proprio?: string;
  grau?: string;
  rito: string;
  cor: Cor;
  cores?: string;
  partes: string[];
}

type DiaGravado = Omit<DiaDoOrdo, "data" | "tempo" | "rito"> & { rito?: string };

export interface ArquivoDoOrdo {
  fonte: string;
  descricao: string;
  ano: number;
  dias: Record<string, DiaGravado>;
}

export const ANOS_COM_ORDO: number[] = [...ANOS].sort((a, b) => a - b);

export const temOrdo = (ano: number, mes = 1, dia = 1) =>
  ANOS_COM_ORDO.includes(ano) && chave(ano, mes, dia) <= ATE[ano];

export const ultimoDiaDoOrdo = (): string =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${ATE[ANOS_COM_ORDO[ANOS_COM_ORDO.length - 1]]}T00:00:00Z`),
  );

const carregados = new Map<number, ArquivoDoOrdo>();

export async function carregarOrdo(ano: number): Promise<ArquivoDoOrdo | null> {
  const emCache = carregados.get(ano);
  if (emCache) return emCache;
  const abrir = ARQUIVOS[ano];
  if (!abrir) return null;
  const modulo = (await abrir()) as unknown as { default: ArquivoDoOrdo };
  carregados.set(ano, modulo.default);
  return modulo.default;
}

const chave = (ano: number, mes: number, dia: number) =>
  `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

export function mesDoOrdo(arquivo: ArquivoDoOrdo, ano: number, mes: number): DiaDoOrdo[] {
  const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const dias: DiaDoOrdo[] = [];
  for (let d = 1; d <= ultimo; d++) {
    const registro = arquivo.dias[chave(ano, mes, d)];
    if (!registro) continue;
    const data = new Date(Date.UTC(ano, mes - 1, d));
    const { rito, grau, ...resto } = registro;
    dias.push({
      ...resto,
      ...(rito ? { rito, grau } : { rito: grau ?? "" }),
      data,
      tempo: tempoDe(data).tempo,
      partes: registro.partes ?? [],
    });
  }
  return dias;
}

export const soAsPermitidas = (linha: string): string =>
  linha.replace(/^➢\s*Missas permitidas:\s*/i, "").trim();

export const ehMissasPermitidas = (p: string): boolean =>
  /^➢\s*Missas permitidas/i.test(p);

export function patrocinioDoGrau(grau: string): { patrocinio?: string; grau: string } {
  const corte = /^(.*?),\s*((?:semi)?duples\b.*)$/i.exec(grau);
  if (!corte || !/padroeir|titular/i.test(corte[1])) return { grau };
  return { patrocinio: corte[1].trim(), grau: corte[2].trim() };
}

export const ehFestaMaiorDoOrdo = (dia: DiaDoOrdo): boolean =>
  /[12]\s*[ªa]\s*classe/i.test(`${dia.grau ?? ""} ${dia.rito}`);

export interface Celebracao {
  rotulo?: string;
  ficha?: Omit<OutraMissa, "rotulo" | "alternativa" | "proprio" | "partes">;
  posto?: string;
  missa?: string;
  proprio?: string;
  notas: string[];
  permitidas: string[];
  alternativa?: boolean;
}

const ABRE_ESCOLHA = /^Pode-se celebrar, à escolha:?$/i;

const EH_ROTULO =
  /^(No Calendário Universal|Na Igreja universal|No Brasil|Na Igreja Catedral[^:]*?)\s*:?\s*$/;

export const DA_IGREJA_UNIVERSAL = /^(No Calendário Universal|Na Igreja universal)/;

export function ladosDoDia(celebracoes: Celebracao[]): {
  daqui: Celebracao[];
  universal: Celebracao[];
} {
  const abre = celebracoes.findIndex(
    (c, i) => i > 0 && DA_IGREJA_UNIVERSAL.test(c.rotulo ?? ""),
  );
  if (abre < 0) return { daqui: celebracoes, universal: [] };
  let fim = abre + 1;
  while (fim < celebracoes.length && !celebracoes[fim].rotulo) fim += 1;
  return {
    daqui: [...celebracoes.slice(0, abre), ...celebracoes.slice(fim)],
    universal: celebracoes.slice(abre, fim),
  };
}

function soltarRotulo(parte: string): string[] {
  const [primeira, ...resto] = parte.split("\n");
  return resto.length && !resto[0].startsWith("  ") && EH_ROTULO.test(primeira.trim())
    ? [primeira, resto.join("\n")]
    : [parte];
}

const EH_POSTO = /[–-]\s*cor\s+\p{L}+\s*$/u;

const ehRubrica = (p: string) => p.startsWith("➢");

function separarOProprio(cru: string): { proprio?: string; linha: string } {
  const linhas = cru.split("\n");
  if (linhas.length < 2 || !linhas[1].startsWith("  ")) return { linha: cru };
  const titulo = linhas[0].trim();
  if (!titulo || ehRubrica(titulo)) return { linha: cru };
  return {
    proprio: titulo,
    linha: linhas.slice(1).map((l) => l.trim()).join("\n"),
  };
}

export function celebracoesDoOrdo(dia: DiaDoOrdo): Celebracao[] {
  if (dia.outras || dia.proprio) return celebracoesSeparadas(dia);

  const saida: Celebracao[] = [];
  let atual: Celebracao = { notas: [], permitidas: [] };
  let escolhendo = false;

  const fechar = () => {
    const vazia =
      !atual.rotulo && !atual.posto && !atual.missa &&
      atual.notas.length === 0 && atual.permitidas.length === 0;
    if (!vazia) saida.push(atual);
    atual = { notas: [], permitidas: [] };
  };

  for (const bruto of dia.partes.flatMap(soltarRotulo)) {
    const { proprio, linha: cru } = separarOProprio(bruto);
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
    if (!ehRubrica(p) && !atual.missa) {
      atual.missa = cru;
      if (proprio) atual.proprio = proprio;
      continue;
    }
    atual.notas.push(proprio ? bruto : cru);
  }

  fechar();
  return saida;
}

function celebracoesSeparadas(dia: DiaDoOrdo): Celebracao[] {
  const ler = (partes: string[]) => {
    const c: Celebracao = { notas: [], permitidas: [] };
    for (const p of partes) {
      if (ehMissasPermitidas(p)) c.permitidas.push(p);
      else if (!ehRubrica(p) && !c.missa) c.missa = p;
      else c.notas.push(p);
    }
    return c;
  };
  return [
    { ...ler(dia.partes), proprio: dia.proprio },
    ...(dia.outras ?? []).map(({ rotulo, alternativa, proprio, partes, ...ficha }) => ({
      ...ler(partes),
      rotulo,
      alternativa,
      proprio,
      ficha,
    })),
  ];
}

export interface NaMissa {
  gloria: boolean;
  credo: boolean;
  gloriaPorque?: string;
  credoPorque?: string;
  prefacio?: string;
  oracaoSobreOPovo: boolean;
  communicantes?: boolean;
  fecho?: string;
  ultimoEvangelho?: string;
  entreAsLeituras: string[];
  comemoracoes: string[];
  oracoes: string[];
  resto: string[];
}

function achar(linha: string, termo: string): { tem: boolean; porque?: string } {
  const achado = new RegExp(`(sem\\s+)?${termo}(\\s*\\(([^)]*)\\))?`).exec(linha);
  if (!achado) return { tem: false };
  return { tem: !achado[1], porque: achado[3] };
}

const primeiro = (linha: string, padrao: RegExp) => linha.match(padrao)?.[0]?.trim();

const EH_ORACAO = /^(após a )?[Oo]raç(ão|ões)\b/;

const ORACAO_SEM_NOME = /(^|\s)(própri[oa]s?|única)\b/i;

const CORTE_DA_ORACAO = /\s+e\s+(?=[Oo]ração\b)/;

export function analisarMissa(linha: string | undefined): NaMissa | null {
  if (!linha?.startsWith("Missa")) return null;

  const gloria = achar(linha, "Glória");
  const credo = achar(linha, "Credo");
  const prefacio = primeiro(linha, /Prefácio[^;]*/);
  const sobreOPovo = achar(linha, "Oração sobre o povo");
  const fecho = primeiro(linha, /(Ite,? Missa est|Benedicamus Domino|Requiescant in pace)[^;]*/);

  const entreAsLeituras: string[] = [];
  const comemoracoes: string[] = [];
  const oracoes: string[] = [];
  const resto: string[] = [];
  const pontuada = linha
    .replace(/,\s*(?=Benedicamus Domino)/g, "; ")
    .replace(/:\s*(?=Credo\b)/g, "; ");
  const segmentos = pontuada.split(";").flatMap((cru) => {
    const corte = /^Missa\b[^:]*:/.exec(cru);
    return corte ? [corte[0].slice(0, -1), cru.slice(corte[0].length)] : [cru];
  });

  const evangelho = segmentos
    .map((s) => s.trim())
    .find((s) => s.startsWith("Último Evangelho"));

  for (const cru of segmentos) {
    const p = cru.trim();
    if (/^(sem\s+)?Oração sobre o povo/.test(p)) continue;
    if (/^(sem\s+)?(Trato|Gradual)\b/.test(p) || /^Sequência/.test(p) || /Aleluia/.test(p)) {
      entreAsLeituras.push(p);
    } else if (/comemoração/i.test(p)) {
      const [comemorado, ...oracao] = p.split(CORTE_DA_ORACAO);
      comemoracoes.push(comemorado.trim());
      for (const o of oracao) {
        const t = o.trim();
        (ORACAO_SEM_NOME.test(t) ? resto : oracoes).push(t);
      }
    } else if (EH_ORACAO.test(p) && !ORACAO_SEM_NOME.test(p)) oracoes.push(p);
    else {
      const sobra = p
        .replace(/(sem\s+)?(Glória|Credo)(\s*\([^)]*\))?/g, "")
        .replace(/Prefácio[^;]*/g, "")
        .replace(/^Último Evangelho[^;]*/, "")
        .replace(/(Ite,? Missa est|Benedicamus Domino|Requiescant in pace)[^;]*/g, "")
        .replace(/\s*[:,]\s*$/, "")
        .trim();
      if (sobra) resto.push(sobra);
    }
  }

  const composto = prefacio?.startsWith("Prefácio e Communicantes");

  return {
    gloria: gloria.tem,
    gloriaPorque: gloria.porque,
    credo: credo.tem,
    credoPorque: credo.porque,
    prefacio: prefacio?.replace(/^Prefácio( e Communicantes)?\s*/, ""),
    communicantes: composto || undefined,
    oracaoSobreOPovo: sobreOPovo.tem,
    fecho,
    ultimoEvangelho: evangelho?.replace(/^Último Evangelho\s*/, ""),
    entreAsLeituras,
    comemoracoes,
    oracoes,
    resto,
  };
}

export const naQuaresma = (tempo: Tempo): boolean =>
  tempo === "quaresma" || tempo === "paixao";

export const soONomeDaMissa = (data: Date): boolean => data.getUTCFullYear() >= 2027;

export const naMissaDoOrdo = (dia: DiaDoOrdo): NaMissa | null =>
  analisarMissa(separarOProprio(dia.partes[0] ?? "").linha);
