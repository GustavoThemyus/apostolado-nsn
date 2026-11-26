import { MissaContinua } from "../components/MissaContinua";

const IDS = [
  "preparacao", "asperges", "pe-altar", "catecumenos", "ofertorio",
  "canon", "comunhao", "conclusao", "leoninas", "acao-de-gracas",
];

export default function MissaDoDia() {
  return <MissaContinua titulo="Missa do dia" ids={IDS} comProprio />;
}
