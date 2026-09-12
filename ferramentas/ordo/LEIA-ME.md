# O Ordo pré-55

`src/data/ordo/<ano>.json` não foi digitado nem calculado: é o Ordo que a
própria capela publica, importado do calendário do Google.

```
python3 importar.py --baixar   # busca o .ics e gera os JSON e o índice
python3 conferir.py            # confere o JSON contra o .ics; sai != 0 se falhar
```

Depois, do lado do site: `npm test` roda a suíte `src/calendario/ordo.teste.ts`,
que confere a forma do JSON — ano sem buracos, cor entre as seis litúrgicas,
todo dia com celebração e com grau.

## Por que copiar em vez de calcular

O calendário de 1962 do site é calculado: computo, Temporal, Santoral,
precedência e transferências, em `src/calendario/`. Para o pré-55 o caminho é
outro, e de propósito.

O Ordo da capela traz o que regra nenhuma devolveria: o grau no vocabulário
anterior a 1955 ("Duples maior", "Oitava privilegiada de 2ª ordem"), a Missa
pelo intróito, as comemorações, o Prefácio, o fecho, as rubricas do dia, as
Missas permitidas, o próprio da Arquidiocese da Paraíba e as transferências que
o redator decidiu à mão. Reescrever isso a partir das rubricas daria menos
informação, com risco de contradizer o Ordo que a capela de fato segue.

Medida da diferença entre os dois calendários, em 2026: **135 dos 365 dias**.
Não é grafia — são as oitavas, a Solenidade de São José, o 1º de maio dos
Santos Felipe e Tiago, a Invenção da Santa Cruz, as férias menores.

## O preço, e o que se faz com ele

Cobre os anos que a capela publicou, e só esses: hoje, 2026. Fora deles a
página diz que não há Ordo, em vez de adivinhar um. Quando o Apostolado
publicar o ano seguinte, é rodar `importar.py --baixar` de novo.

Um arquivo por ano, carregado sob demanda: 27 KB comprimidos cada, e quem fica
no calendário de 1962 — que é o padrão — não baixa nenhum.

## A armadilha que já custou caro

**O iCalendar dobra linhas longas.** A continuação vem na linha seguinte com um
espaço na frente. Procurei a dobra como `\r\n ` e este arquivo usa `\n `: nada
se desdobrava, e os nomes chegavam cortados no meio de uma palavra — "Padroeira
da Arquidiocese da Paraí / ba". Por isso `desdobrar()` casa `\r?\n[ \t]`, e por
isso `conferir.py` compara o texto inteiro de cada dia, e não só o começo.

## O que o importador garante

- todo dia do Ordo virou um dia publicado, e nenhum dia foi inventado;
- o círculo colorido do título concorda com a cor escrita por extenso na
  descrição — nos 365 dias de 2026 concordam, e é isso que autoriza usar o
  círculo como cor da grade;
- o amarelo do Ordo (o ouro das solenidades) entra como **branco**, que é o que
  a própria descrição diz; o site tem seis cores litúrgicas e não tem ouro.
