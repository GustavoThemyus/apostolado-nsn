/*
 * O brasão do Apostolado: campo estrelado, lírio e o lema Iter para tutum.
 *
 * Três dos quatro lugares usam a arte colorida, e todos apontam para o mesmo
 * arquivo de propósito: o cabeçalho de toda página já o carrega, então o menu
 * e a página do brasão não custam byte nenhum a mais.
 *
 * A barra é o quarto, e é diferente. A 2,05rem o colorido virava borrão, e lá
 * ele vai em silhueta — a mesma arte do selo do rodapé, que toda página também
 * já baixa. Como a silhueta troca de arte com o tema, quem a desenha é o CSS,
 * por `--brasao-mono`: um <img> teria de escolher um dos dois arquivos aqui,
 * e o escolhido ficaria invisível no outro tema.
 */
const TAMANHOS = {
  cabecalho: { classe: "cabecalho__brasao" },
  pagina: { classe: "cabecalho__brasao cabecalho__brasao--pagina" },
  menu: { classe: "menu__brasao" },
} as const;

const ARQUIVO = "/brasao-9ea57f61.webp";
const LARGURA = 572;
const ALTURA = 620;

export function Brasao({ tamanho }: { tamanho: keyof typeof TAMANHOS | "barra" }) {
  // decorativo nos dois casos em que o nome do Apostolado vem escrito ao lado
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
