# Retratos da lateral

O Soberano Pontífice e o Arcebispo Metropolitano, na coluna à direita das
páginas. A Padroeira usa a estampa de `public/padroeiros/`.

Como as estampas, os arquivos levam a impressão do conteúdo no nome: o cache é
de um ano, e trocar a imagem tem de trocar o nome. Ao gerar de novo, atualizar
os caminhos em `src/data/site.json`, no campo `lateral`.

```
python3 ferramentas/retratos/gerar.py <foto do papa> <foto do arcebispo>
```

## O que o gerador faz

- **Papa** — a foto oficial de 8 de maio de 2025 vem num cartão, com margem
  branca e a assinatura embaixo. O gerador acha a borda da foto pelo papel,
  recorta, tira a assinatura, faz o 3:4 tirando a sobra quase toda de baixo
  (em cima está o solidéu), reduz a 480x640 e aplica a mesma nitidez das
  estampas.
- **Arcebispo** — foto de estúdio em fundo branco, com um pedestal branco. O
  gerador põe uma vinheta **só no fundo**: acha o branco ligado à borda do
  quadro, e o pedestal numa segunda passada, e escurece os dois em degradê a
  partir do rosto. A figura não é tocada. O arquivo de origem tem 320x417 e
  7 KB, e o resultado fica nesse tamanho: ampliar não traria detalhe nenhum.
  Uma foto maior do Arcebispo melhoraria o retrato.
