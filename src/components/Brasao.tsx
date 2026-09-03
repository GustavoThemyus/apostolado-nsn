const TAMANHOS = {
  barra: { classe: "barra__brasao", arquivo: "/brasao-pequeno.png", largura: 66, altura: 72 },
  cabecalho: { classe: "cabecalho__brasao", arquivo: "/brasao.png", largura: 331, altura: 360 },
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
      alt={tamanho === "cabecalho" ? "Brasão do Apostolado Nossa Senhora das Neves" : ""}
      aria-hidden={tamanho === "barra" ? true : undefined}
      loading={tamanho === "cabecalho" ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
