import { MissaContinua } from "../components/MissaContinua";

/*
 * A Missa de hoje: da oração preparatória à ação de graças, e só isso. O que
 * está fora desse intervalo (a voz do Magistério, a bênção do Santíssimo)
 * fica no Ordinário. O próprio do dia entra nos dez lugares do impresso.
 */
const IDS = [
  "preparacao", "asperges", "pe-altar", "catecumenos", "ofertorio",
  "canon", "comunhao", "conclusao", "leoninas", "acao-de-gracas",
];

export default function MissaDoDia() {
  return <MissaContinua titulo="Missa do dia" ids={IDS} comProprio />;
}
