# Estampas de documento

Folhas de rosto nossas, no desenho do site, para postagens que falam de um
documento e não têm figura própria. **Não são a capa do original**: se o Perez
mandar a capa de verdade, ela entra no lugar — é trocar o arquivo e o caminho
em `src/data/postagens.json`.

```
python3 ferramentas/capas/gerar.py <EBGaramond[wght].ttf>
```

O TTF é o da variável do Google Fonts, a mesma família que o site carrega:
`https://raw.githubusercontent.com/google/fonts/main/ofl/ebgaramond/EBGaramond%5Bwght%5D.ttf`.

480x640, como as estampas dos padroeiros: no cartão da faixa o quadro mede
7rem por 9,5rem, que num celular a 3x pede 336 de largura. O nome leva a
impressão do conteúdo, e trocar a imagem tem de trocar o nome, senão o
navegador de quem já visitou continua com a antiga.
