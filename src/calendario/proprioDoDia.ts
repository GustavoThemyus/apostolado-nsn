import proprios from "../data/proprios-no-ordo.json";

/**
 * O folheto de próprio que corresponde a um anexo do Ordo.
 *
 * O Ordo anexa a cada dia o PDF do próprio, no Drive do Apostolado, e alguns
 * desses PDFs já viraram folheto neste site. O que liga um ao outro é o id do
 * arquivo no Drive, que é o mesmo dos dois lados.
 *
 * O índice é gerado junto com os folhetos, e é pequeno de propósito:
 * importar a coleção aqui traria 165 KB de orações para o calendário mostrar
 * uma linha.
 *
 * Mora no motor do calendário, e não na tela que primeiro precisou dele,
 * porque agora são duas as telas que precisam: o detalhe do dia, que oferece
 * o próprio para ler, e o modo missa, que o encaixa dentro do Ordinário.
 */
const ID_NO_DRIVE = /\/file\/d\/([^/?#]+)/;

export function folhetoDoAnexo(url: string): string | undefined {
  const achado = ID_NO_DRIVE.exec(url);
  return achado ? (proprios as Record<string, string>)[achado[1]] : undefined;
}

/** O primeiro anexo do dia que já é folheto aqui. */
export function folhetoDoDia(anexos?: { url: string }[]): string | undefined {
  for (const anexo of anexos ?? []) {
    const folheto = folhetoDoAnexo(anexo.url);
    if (folheto) return folheto;
  }
  return undefined;
}
