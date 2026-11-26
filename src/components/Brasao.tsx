const TAMANHOS = {
  cabecalho: { classe: "cabecalho__brasao" },
  pagina: { classe: "cabecalho__brasao cabecalho__brasao--pagina" },
  menu: { classe: "menu__brasao" },
} as const;

const ARQUIVO = "/brasao-9ea57f61.webp";
const LARGURA = 572;
const ALTURA = 620;

export function Brasao({ tamanho }: { tamanho: keyof typeof TAMANHOS | "barra" }) {
  if (tamanho === "barra") {
    return <span className="barra__brasao" aria-hidden="true" />;
  }

  const { classe } = TAMANHOS[tamanho];
  return (
    <img
      className={classe}
      src={ARQUIVO}
      width={LARGURA}
      height={ALTURA}
      alt={tamanho === "menu" ? "" : "Brasão do Apostolado Nossa Senhora das Neves"}
      aria-hidden={tamanho === "menu" ? true : undefined}
      loading={tamanho === "cabecalho" ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
