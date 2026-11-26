import proprios from "../data/proprios-no-ordo.json";

const ID_NO_DRIVE = /\/file\/d\/([^/?#]+)/;

export function folhetoDoAnexo(url: string): string | undefined {
  const achado = ID_NO_DRIVE.exec(url);
  return achado ? (proprios as Record<string, string>)[achado[1]] : undefined;
}

export function folhetoDoDia(anexos?: { url: string }[]): string | undefined {
  for (const anexo of anexos ?? []) {
    const folheto = folhetoDoAnexo(anexo.url);
    if (folheto) return folheto;
  }
  return undefined;
}
