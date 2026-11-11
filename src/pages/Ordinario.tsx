import { MissaContinua } from "../components/MissaContinua";

/*
 * O Ordo Missæ inteiro: o rito sem o próprio, com a postura do fiel em cada
 * momento. As partes que o dia não tem (Glória no Advento, Credo nos dias de
 * semana, aspersão fora do domingo) não aparecem.
 *
 * Fora a capa, que é o título da página.
 */
const IDS = [
  "magisterio", "preparacao", "asperges", "pe-altar", "catecumenos", "ofertorio",
  "canon", "comunhao", "conclusao", "leoninas", "acao-de-gracas", "bencao",
];

export default function Ordinario() {
  return <MissaContinua titulo="Ordinário da Missa" subtitulo="Ordo Missæ" ids={IDS} comProprio={false} />;
}
