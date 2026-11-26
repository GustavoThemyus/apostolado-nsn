import prosa from "../data/indulgencias-calendario.json";
import { AssinarAgenda } from "../components/AssinarAgenda";
import { comoConteudo } from "../data/carregar";
import { indulgencias } from "../data/indulgenciasDias";
import { PaginaDeDocumento } from "./PaginaDeDocumento";
import type { Bloco, Conteudo } from "../data/tipos";

const A_VISTA = new Set(["s-rosario-nota", "d-oitava-dos-defuntos-nota"]);

const recolhidas: Record<string, string> = {};

function chamada(texto: string): string {
  const base = Object.keys(indulgencias.notas ?? {}).length;
  const achada = Object.keys(recolhidas).find((k) => recolhidas[k] === texto);
  const chave = achada ?? String(base + Object.keys(recolhidas).length + 1);
  recolhidas[chave] = texto;
  return `[nota]${chave}[/nota]`;
}

function comoTexto(blocos: Bloco[]): string {
  const partes: string[] = [];
  for (const b of blocos) {
    if (b.tipo === "paragrafo") partes.push(b.texto);
    else if (b.tipo === "lista") partes.push(b.itens.map((i) => `• ${i}`).join("\n"));
    else if (b.tipo === "nota") {
      const texto = `[b]${b.titulo}[/b]\n${b.paragrafos.join("\n\n")}`;
      if (A_VISTA.has(b.id ?? "") || partes.length === 0) partes.push(texto);
      else partes[partes.length - 1] += chamada(texto);
    }
  }
  return partes.join("\n\n");
}

const obraEFonte = (i: { obra: Bloco[]; fonte?: string }): string =>
  i.fonte ? `${comoTexto(i.obra)}\n\n[i]${i.fonte}[/i]` : comoTexto(i.obra);

const OBRA = "Obra indulgenciada prescrita";

const quadroDosDias = (): Bloco => ({
  tipo: "tabela",
  colunas: ["Data", "Festividade litúrgica", OBRA],
  linhas: indulgencias.dias.map((i) => [i.quandoPorExtenso, i.titulo, obraEFonte(i)]),
});

const quadroSemDiaFixo = (): Bloco => ({
  tipo: "tabela",
  colunas: ["Indulgência", OBRA],
  linhas: indulgencias.semDiaFixo.map((i) => [i.titulo, obraEFonte(i)]),
});

const ENXERTOS: Record<string, Bloco[]> = {
  normas: indulgencias.condicoes.blocos,
  observacoes: indulgencias.observacoes.blocos,
  "calendario-corrido": [quadroDosDias()],
  "toties-quoties": [quadroSemDiaFixo()],
};

const secoes = comoConteudo(prosa).secoes.map((s) => ({
  ...s,
  blocos: [...s.blocos, ...(ENXERTOS[s.id] ?? [])],
}));

const conteudo: Conteudo = {
  ...comoConteudo(prosa),
  notas: { ...indulgencias.notas, ...recolhidas },
  secoes,
};

export default function IndulgenciasCalendario() {
  return (
    <PaginaDeDocumento conteudo={conteudo}>
      <AssinarAgenda
        grupo="indulgencias-apostolado"
        titulo="Levar as indulgências no celular"
        explicacao="O calendário que o Apostolado mantém, com os dias que ele marca."
      />
    </PaginaDeDocumento>
  );
}
