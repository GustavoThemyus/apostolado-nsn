import { MissaContinua } from "../components/MissaContinua";

const IDS = [
  "preparacao", "asperges", "pe-altar", "catecumenos", "ofertorio",
  "canon", "comunhao", "conclusao", "leoninas", "acao-de-gracas",
];

export default function Ordinario() {
  return <MissaContinua titulo="Ordinário da Missa" subtitulo="Ordo Missæ" ids={IDS} comProprio={false} />;
}
