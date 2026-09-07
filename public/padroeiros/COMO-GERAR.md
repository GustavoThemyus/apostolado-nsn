# Estampas dos padroeiros

Os arquivos levam a impressão do conteúdo no nome (`neves-12d3d280.webp`).
Trocar a imagem tem de trocar o nome, senão o navegador de quem já visitou
continua com a antiga: o cache aqui é de um ano, e é seguro justamente porque
o nome muda junto.

Ao substituir uma estampa, atualizar o caminho em `src/data/inicio.json` e em
`src/data/postagens.json`.

## Como foram geradas

A partir do arquivo original, com Pillow:

1. Recorte 3:4, com a âncora escolhida por imagem para não cortar rosto
   (0,42 na Filomena, 0,32 nas Neves, 0,46 no Antônio; 0 é topo/esquerda).
2. Redução para 480x640 com LANCZOS. 480 cobre o pior caso medido: o quadro
   para de crescer em 9rem, o que num celular a 3x pede 432 pixels de tela.
3. Máscara de nitidez, raio 0,8, força 80%, limiar 2. A imagem é reamostrada
   duas vezes até a tela, aqui e no navegador, e cada passagem custava cerca
   de 20% da energia de borda. Este ajuste foi medido contra o original
   reduzido direto ao tamanho de tela e devolve 99% da nitidez dele; 110% de
   força já ultrapassa o original e começa a criar halo.
4. WebP com qualidade 78. Depois de afiar, 78 mede o mesmo que 86 na tela e
   pesa 65 KB menos nas três somadas.
