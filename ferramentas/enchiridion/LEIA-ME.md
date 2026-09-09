# Transcrição do Enchiridion

`src/data/indulgencias-enchiridion.json` não foi digitado: é gerado a partir do
`.docx` que o Perez mandou. Se ele mandar uma correção, **não edite o JSON à
mão**: corrija o `.docx` e rode isto de novo, senão a próxima remessa apaga o
conserto.

```
python3 extrair.py     # descompacta o .docx e lê os parágrafos com a formatação
python3 converter.py   # monta o JSON do site
python3 conferir.py    # confere a transcrição contra o original; sai != 0 se falhar
cp enchiridion.json ../../src/data/indulgencias-enchiridion.json
```

`extrair.py` espera o `.docx` já descompactado em `docx/`:

```
mkdir -p docx && cd docx && unzip -o "…/Indulgências - Orientações litúrgico-pastorais.docx"
```

## O que o conversor faz que não é transcrever

- **Os parágrafos 4 a 8 do original são recados do Perez para mim**, não texto
  do livro: "Inserir link no texto", "Essa parte quero em destaque". Viram o que
  ele pediu (os dois links, a caixa destacada) em vez de irem publicados.
- **As notas saem do fim do capítulo** e viram um mapa em `Conteudo.notas`, para
  a chamada mostrá-las onde são lidas. São 123, mais a do asterisco.
- **O asterisco vermelho** vira a chamada de uma nota de chave `*`, e o texto
  que estava solto no fim do documento vira o conteúdo dela.
- **O sumário impresso** (parágrafos 13 a 67) não é copiado: a seção "Índice do
  livro" usa o bloco `indice`, que deriva o índice das próprias seções. Índice
  copiado à mão de um documento de cem páginas começa certo e termina apontando
  para onde o texto não está mais.
- **O índice analítico** ganha um link por entrada, para a concessão exata, ou
  para a oração quando ela tem âncora própria.

## Duas armadilhas que já custaram caro

1. **Sobrescrito partido em duas runs.** O Word quebra "³⁸" em duas quando só o
   "³" está em negrito. Marcar antes de extrair produzia
   `[nota]3[/nota][nota]8[/nota]`: duas chamadas que existem, e por isso nenhuma
   checagem de link quebrado pegava. Por isso `marcar()` tira os sobrescritos
   das runs *antes* de aplicar qualquer formatação.
2. **Nota que se cita a si mesma.** O parágrafo da nota do asterisco começa pelo
   próprio asterisco. Deixá-lo fazia a nota chamar a si mesma e o navegador
   estourava a memória. O conversor tira, e `src/data/conteudo.teste.ts` guarda
   contra a volta.

## O que `conferir.py` garante

- todo parágrafo do original está na saída, ou é uma omissão com motivo escrito;
- as 123 chamadas de nota aparecem na mesma ordem do original, uma vez cada;
- as 108 entradas do índice analítico mantêm o nome e apontam para o número certo.

## O que foi mantido do original de propósito

A pontuação, inclusive os travessões. É tradução aprovada pela CNBB de um texto
da Santa Sé: mexer na pontuação para seguir o estilo do site seria alterar um
documento oficial.
