import { diaProprio } from "./proprios";
import { tempoDe } from "./tempo";

const ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
  "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII", "XXVIII"];

const DIAS_DA_SEMANA = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado"];

/** Nome do dia dentro do Temporal. Não consulta o Santoral. */
export function nomeDoDia(data: Date): string {
  const proprio = diaProprio(data);
  if (proprio) return proprio.nome;

  const { tempo, semana } = tempoDe(data);
  const domingo = data.getUTCDay() === 0;
  const n = semana ? ROMANOS[semana] ?? String(semana) : "";

  if (domingo) {
    switch (tempo) {
      case "advento": return `Domingo ${n} do Advento`;
      case "depoisDaEpifania": return `Domingo ${n} depois da Epifania`;
      case "quaresma": return `Domingo ${n} da Quaresma`;
      case "pascoa": return `Domingo ${ROMANOS[(semana ?? 2) - 1]} depois da Páscoa`;
      case "depoisDePentecostes": return `Domingo ${n} depois de Pentecostes`;
      case "natal": return "Domingo no Tempo do Natal";
      default: return "Domingo";
    }
  }

  const feria = DIAS_DA_SEMANA[data.getUTCDay()];
  switch (tempo) {
    case "advento": return `${feria} da ${n} semana do Advento`;
    case "quaresma": return `${feria} da ${n} semana da Quaresma`;
    case "paixao": return `${feria} da Semana da Paixão`;
    case "depoisDePentecostes": return `${feria} da ${n} semana depois de Pentecostes`;
    case "natal": return `${feria} do Tempo do Natal`;
    default: return feria;
  }
}
