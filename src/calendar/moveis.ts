import { movelDoBrasil } from "./proprioBrasil";
import { diasMoveis } from "./proprios";

const normalizar = (s: string) =>
  s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const TAMBEM: Record<string, string[]> = {
  "Domingo de Páscoa": ["Domingo da Ressurreição"],
};

export function dataDaFestaMovel(texto: string, ano: number): Date | undefined {
  const alvo = normalizar(texto);
  let achado: { data: Date; letras: number } | undefined;

  const movel = movelDoBrasil(ano);
  const candidatos: [Date, { nome: string }][] = [
    ...diasMoveis(ano),
    [new Date(Date.UTC(ano, movel.mes - 1, movel.dia)), movel],
  ];

  for (const [data, dia] of candidatos) {
    for (const nome of [dia.nome, ...(TAMBEM[dia.nome] ?? [])]) {
      const n = normalizar(nome);
      if (!alvo.includes(n)) continue;
      if (!achado || n.length > achado.letras) achado = { data, letras: n.length };
    }
  }
  return achado?.data;
}
