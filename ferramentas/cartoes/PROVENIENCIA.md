# Estampas dos cartões

Quase todas em **domínio público**, da Wikimedia Commons. Domínio público foi
critério, e não acaso: obra sob licença que exige atribuição obrigaria o site a
carregar o crédito em toda página onde a imagem aparece.

As duas exceções entraram em 22/10/2026 e têm outra base: são **fotografias da
Anna Gabriella**, feitas na Basílica de Santa Maria Maior e cedidas por ela ao
Apostolado. Não são domínio público. Se um dia ela pedir crédito ou pedir que
saiam, a troca é por aqui, e é por isso que estão anotadas.

| arquivo | obra | autor | origem |
| --- | --- | --- | --- |
| `missa-*` | A Missa de São Gregório | Simon Marmion (c. 1425-1489) | Commons, 3596x5465 |
| `calendario-*` | Les Très Riches Heures du duc de Berry, folha de janeiro | Irmãos Limbourg (séc. XV) | Commons, 1333x2062 |
| `indulgencias-*` | A entrega das chaves a São Pedro, Capela Sistina | Pietro Perugino (1481-82) | Commons, 3187x1923 |
| `inicio-*` | Altar-mor de Santa Maria Maior | Anna Gabriella, 2026 | cedida ao Apostolado, 2000x1331 |
| `apostolado-*` | Capela Borghese, com a Salus Populi Romani | Anna Gabriella, 2026 | cedida ao Apostolado, 2000x1331 |

A escolha de *A entrega das chaves* não é decorativa: a seção das indulgências
diz, com o cânon 911, que "o fundamento é o poder das chaves". A pintura é o
próprio texto.

## Como gerar

```
python3 ferramentas/cartoes/gerar.py <imagem> <nome> [ancora]
```

Recorte 16:9 com âncora escolhida por imagem, redução para 1100x619 com
LANCZOS, máscara de nitidez (raio 0,8, força 70%, limiar 2) e WebP em 76.
1100 cobre o pior caso: o cartão mede 353px no celular, o que a 3x pede 1059.

As duas fotografias usam âncora 0,25: no Apostolado é onde o ícone fica
centrado sem encher de grade; no Início é onde a pintura cabe inteira com o
altar no meio.

O nome leva a impressão do conteúdo. Trocar a estampa tem de trocar o nome,
senão o navegador de quem já visitou continua com a antiga.

## As seis estampas de seção

Cada seção de topo tem uma estampa, herdada pelas subpáginas: ela aparece no
cartão da seção e atrás do cabeçalho de toda página dela.

| seção | obra | autor |
| --- | --- | --- |
| Início | Altar-mor de Santa Maria Maior | Anna Gabriella, 2026 |
| A Missa Tridentina | A Missa de São Gregório | Simon Marmion, séc. XV |
| Calendário | Très Riches Heures, folha de janeiro | Irmãos Limbourg, séc. XV |
| Indulgências | A entrega das chaves a São Pedro | Perugino, 1481 |
| Sobre o Apostolado | Capela Borghese, com a Salus Populi Romani | Anna Gabriella, 2026 |
| Postagens | São Jerônimo escrevendo | Caravaggio, c. 1606 |

As quatro primeiras em domínio público, da Wikimedia Commons; as duas
fotografias, cedidas pela autora.
