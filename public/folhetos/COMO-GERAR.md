# Estampas dos folhetos

A figura de cada folheto, tirada do PDF que o Perez manda. O resto do
impresso — moldura, títulos, orações, condições — vira texto em
`src/data/folhetos.json`, que é o ponto de hospedar o folheto nativo em vez
de servir o PDF.

Como as outras estampas, o arquivo leva a impressão do conteúdo no nome: o
cache é de um ano, e trocar a imagem tem de trocar o nome. Gerando de novo,
atualizar o campo `imagem` do folheto em `src/data/folhetos.json` — a suíte
`npm test` recusa estampa que não exista em `/public`.

```
python3 ferramentas/folhetos/gerar.py <pdf>                   lista as imagens
python3 ferramentas/folhetos/gerar.py <pdf> <indice> [nome]   grava aquela
```

Lista primeiro de propósito. Num folheto de duas páginas há três imagens, e
duas são a mesma moldura repetida — a figura é a que sobra. Exemplo:

```
python3 ferramentas/folhetos/gerar.py "OBRA INDULGENCIADA CRISTO REI.pdf"
python3 ferramentas/folhetos/gerar.py "OBRA INDULGENCIADA CRISTO REI.pdf" 1 cristo-rei
```

A figura não é ampliada: a do PDF é o único original que existe, e 1000px de
largura é o teto para o que vier maior.
