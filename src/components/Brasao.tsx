/*
 * Todos apontam para o mesmo arquivo de propósito. O de 66px servia a barra e
 * dava 0,67 de densidade num celular a 3x, ou seja, ampliado; e como o
 * cabeçalho de toda página já carrega o grande, usá-lo na barra não custa
 * byte nenhum a mais e ainda poupa uma requisição. O pequeno fica só como
 * ícone da aba, que é onde 66px bastam.
 */
const TAMANHOS = {
  barra: { classe: "barra__brasao", arquivo: "/brasao-b7c45edf.webp", largura: 331, altura: 360 },
  cabecalho: { classe: "cabecalho__brasao", arquivo: "/brasao-b7c45edf.webp", largura: 331, altura: 360 },
  pagina: { classe: "cabecalho__brasao cabecalho__brasao--pagina", arquivo: "/brasao-b7c45edf.webp", largura: 331, altura: 360 },
  menu: { classe: "menu__brasao", arquivo: "/brasao-b7c45edf.webp", largura: 331, altura: 360 },
} as const;

/** Brasão do Apostolado: campo estrelado, lírio e o lema Iter para tutum. */
export function Brasao({ tamanho }: { tamanho: keyof typeof TAMANHOS }) {
  const { classe, arquivo, largura, altura } = TAMANHOS[tamanho];
  return (
    <img
      className={classe}
      src={arquivo}
      width={largura}
      height={altura}
      alt={tamanho === "barra" || tamanho === "menu" ? "" : "Brasão do Apostolado Nossa Senhora das Neves"}
      aria-hidden={tamanho === "barra" || tamanho === "menu" ? true : undefined}
      loading={tamanho === "cabecalho" ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
