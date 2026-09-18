# Estampas dos padroeiros

Os arquivos levam a impressão do conteúdo no nome (`neves-d5e531fa.webp`).
Trocar a imagem tem de trocar o nome, senão o navegador de quem já visitou
continua com a antiga: o cache aqui é de um ano, e é seguro justamente porque
o nome muda junto.

Ao substituir uma estampa, atualizar o caminho em `src/data/inicio.json`, em
`src/data/postagens.json` e, para a Padroeira, em `src/data/site.json` (a lateral).

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

## Nossa Senhora das Neves, trocada em 18/09/2026

Perez mandou o ícone original, o *Salus Populi Romani* restaurado, no lugar da
cópia que havia. A foto traz a moldura quadriculada pintada em volta; o recorte
é por dentro dela, como na estampa anterior, porque dentro da moldura dourada
do site a quadriculação viraria um segundo friso, e na lateral, com quatro
pixels de largura, só ruído.

1. Miolo por dentro da moldura pintada, com 6px de folga: x 84 a 802, y 104
   a 1243 (a moldura termina em 78, 808, 98 e 1249 na foto de 896x1339).
2. Recorte 3:4 com âncora 0,05: a sobra, 182px, sai quase toda de baixo, para
   não cortar as letras ΜΡ ΘΥ no alto.
3. Redução, nitidez e WebP como acima.
