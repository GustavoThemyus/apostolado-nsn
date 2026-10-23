/**
 * Suíte do leitor de iCal. Roda junto com `npm test`.
 *
 * O que importa aqui é o desdobramento de linha e a detecção do calendário
 * partilhado sem detalhes: as duas coisas que, erradas, fazem o site mostrar
 * lixo em cima do calendário litúrgico em vez de nada.
 */

import { lerIcal, lerRepeticao, semDetalhes, separarCor } from "./agenda";

let passaram = 0;
const falhas: string[] = [];

const conferir = (rotulo: string, obtido: unknown, esperado: unknown) => {
  if (JSON.stringify(obtido) === JSON.stringify(esperado)) passaram += 1;
  else
    falhas.push(
      `${rotulo}: ${JSON.stringify(obtido)} != ${JSON.stringify(esperado)}`,
    );
};

const ics = (corpo: string) =>
  ["BEGIN:VCALENDAR", "VERSION:2.0", corpo, "END:VCALENDAR"].join("\r\n");

// --- o caso simples ---------------------------------------------------------
conferir(
  "evento de dia inteiro",
  lerIcal(
    ics(
      [
        "BEGIN:VEVENT",
        "DTSTART;VALUE=DATE:20260805",
        "DTEND;VALUE=DATE:20260806",
        "SUMMARY:Nossa Senhora das Neves",
        "END:VEVENT",
      ].join("\r\n"),
    ),
  ),
  [{ data: "2026-08-05", titulo: "Nossa Senhora das Neves" }],
);

conferir(
  "evento com hora vira o dia dele",
  lerIcal(
    ics(
      [
        "BEGIN:VEVENT",
        "DTSTART;TZID=America/Sao_Paulo:20260805T190000",
        "SUMMARY:Missa cantada",
        "END:VEVENT",
      ].join("\r\n"),
    ),
  ),
  [{ data: "2026-08-05", titulo: "Missa cantada" }],
);

// --- desdobramento: o iCal quebra em 75 octetos e continua com espaço -------
conferir(
  "linha continuada",
  lerIcal(
    ics(
      [
        "BEGIN:VEVENT",
        "DTSTART;VALUE=DATE:20260613",
        "SUMMARY:Santo Antônio de Pádua\\, confessor e doutor da Igre",
        " ja",
        "END:VEVENT",
      ].join("\r\n"),
    ),
  ),
  [
    {
      data: "2026-06-13",
      titulo: "Santo Antônio de Pádua, confessor e doutor da Igreja",
    },
  ],
);

conferir(
  "descrição com quebra escapada",
  lerIcal(
    ics(
      [
        "BEGIN:VEVENT",
        "DTSTART;VALUE=DATE:20261102",
        "SUMMARY:Finados",
        "DESCRIPTION:Visita ao cemitério.\\nIndulgência plenária.",
        "END:VEVENT",
      ].join("\r\n"),
    ),
  ),
  [
    {
      data: "2026-11-02",
      titulo: "Finados",
      descricao: "Visita ao cemitério. Indulgência plenária.",
    },
  ],
);

// --- o que tem de ser descartado -------------------------------------------
conferir(
  "evento sem título é descartado",
  lerIcal(
    ics(
      ["BEGIN:VEVENT", "DTSTART;VALUE=DATE:20260805", "END:VEVENT"].join(
        "\r\n",
      ),
    ),
  ),
  [],
);
conferir(
  "evento sem data é descartado",
  lerIcal(ics(["BEGIN:VEVENT", "SUMMARY:Sem data", "END:VEVENT"].join("\r\n"))),
  [],
);
conferir("calendário vazio", lerIcal(ics("")), []);
conferir(
  "linhas fora de VEVENT não viram evento",
  lerIcal(ics("X-WR-CALNAME:Ordo\r\nSUMMARY:isto não é um evento")),
  [],
);

// --- ordem ------------------------------------------------------------------
conferir(
  "sai em ordem de data",
  lerIcal(
    ics(
      [
        "BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261102\r\nSUMMARY:Finados\r\nEND:VEVENT",
        "BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20260805\r\nSUMMARY:Neves\r\nEND:VEVENT",
      ].join("\r\n"),
    ),
  ).map((i) => i.data),
  ["2026-08-05", "2026-11-02"],
);

// --- partilha sem detalhes --------------------------------------------------
const ocupado = [
  { data: "2026-07-16", titulo: "Busy" },
  { data: "2026-07-20", titulo: "Busy" },
];
conferir("só Busy é calendário sem detalhes", semDetalhes(ocupado), true);
conferir(
  "um título de verdade já basta",
  semDetalhes([...ocupado, { data: "2026-08-05", titulo: "Neves" }]),
  false,
);
conferir("vazio não é sem detalhes", semDetalhes([]), false);

// --- o marcador de cor do Ordo -------------------------------------------
// O Ordo da capela prefixa o título com um emoji de cor. Ele tem de sair do
// texto e virar dado, senão sai cru na tela na fonte colorida do sistema.
conferir("branco", separarCor("⚪São Raimundo de Pennafort"),
  { titulo: "São Raimundo de Pennafort", cor: "branco" });
conferir("vermelho", separarCor("🔴Santo Estanislau Bispo e Mártir"),
  { titulo: "Santo Estanislau Bispo e Mártir", cor: "vermelho" });
conferir("roxo", separarCor("🟣Quinta-feira depois das Cinzas"),
  { titulo: "Quinta-feira depois das Cinzas", cor: "roxo" });
conferir("verde", separarCor("🟢II Domingo depois da Epifania"),
  { titulo: "II Domingo depois da Epifania", cor: "verde" });
conferir("preto", separarCor("⚫Comemoração de todos os fiéis defuntos"),
  { titulo: "Comemoração de todos os fiéis defuntos", cor: "preto" });
conferir("rosa", separarCor("🩷III Domingo do Advento"),
  { titulo: "III Domingo do Advento", cor: "rosa" });
conferir("ouro, que o nosso calendário nunca emite", separarCor("🟡TODOS OS SANTOS"),
  { titulo: "TODOS OS SANTOS", cor: "ouro" });
conferir("espaço depois do marcador some", separarCor("🔴 São Jorge"),
  { titulo: "São Jorge", cor: "vermelho" });
conferir("sem marcador, o título fica inteiro", separarCor("Indulgência Plenária"),
  { titulo: "Indulgência Plenária" });
conferir("emoji que não é cor não é cortado", separarCor("✝️Exaltação da Cruz"),
  { titulo: "✝️Exaltação da Cruz" });
conferir(
  "o iCal já entrega o item sem o emoji",
  lerIcal(
    ics(["BEGIN:VEVENT", "DTSTART;VALUE=DATE:20260908",
         "SUMMARY:🟡Natividade da Bem-aventurada Virgem Maria", "END:VEVENT"].join("\r\n"))
  ),
  [{ data: "2026-09-08", titulo: "Natividade da Bem-aventurada Virgem Maria", cor: "ouro" }]
);

// --- repetição anual --------------------------------------------------------
/*
 * Estas são as regras que os calendários do Apostolado de fato usam, copiadas
 * dos iCal deles. Valem porque o leitor as ignorava, e com isso o Escapulário,
 * o Cordão e a Terceira Franciscana mostravam **zero** dias de 2026 em diante:
 * cada festa anual ficava parada no ano em que foi criada.
 */
const janela = { de: 2025, ate: 2027 };
const datas = (itens: { data: string }[]) => itens.map((i) => i.data);

const serie = (dtstart: string, rrule: string) =>
  ics(["BEGIN:VEVENT", `DTSTART;VALUE=DATE:${dtstart}`,
       `RRULE:${rrule}`, "SUMMARY:Indulgência Plenária", "END:VEVENT"].join("\r\n"));

conferir(
  "anual por mês e dia: uma ocorrência em cada ano da janela",
  datas(lerIcal(serie("20231124", "FREQ=YEARLY;WKST=SU;INTERVAL=1;BYMONTHDAY=24;BYMONTH=11"), janela)),
  ["2025-11-24", "2026-11-24", "2027-11-24"],
);

conferir(
  "a série não começa antes do primeiro evento",
  datas(lerIcal(serie("20261124", "FREQ=YEARLY;INTERVAL=1;BYMONTHDAY=24;BYMONTH=11"), janela)),
  ["2026-11-24", "2027-11-24"],
);

conferir(
  "UNTIL encerra a série",
  datas(lerIcal(serie("20230802", "FREQ=YEARLY;WKST=SU;UNTIL=20260801T235959Z;INTERVAL=1;BYMONTHDAY=2;BYMONTH=8"), janela)),
  ["2025-08-02"],
);

/*
 * "último domingo de outubro" é Cristo Rei no calendário antigo. Em 2026 cai
 * em 25 de outubro, que é o que o Ordo da capela diz, e por isso esta é a
 * conferência que prova a conta do fim do mês.
 */
conferir(
  "BYDAY=-1SU: o último domingo do mês",
  datas(lerIcal(serie("20231029", "FREQ=YEARLY;WKST=SU;INTERVAL=1;BYDAY=-1SU;BYMONTH=10"), janela)),
  ["2025-10-26", "2026-10-25", "2027-10-31"],
);

conferir(
  "de doze em doze meses é uma vez por ano, no mês do DTSTART",
  datas(lerIcal(serie("20240630", "FREQ=MONTHLY;INTERVAL=12;BYDAY=-1SU"), janela)),
  ["2025-06-29", "2026-06-28", "2027-06-27"],
);

/*
 * O que não se sabe expandir não se perde nem se adivinha: vale uma vez, pela
 * data do próprio evento. Mensal de verdade é o caso, e nenhum destes
 * calendários tem um.
 */
conferir("regra mensal de verdade não se expande", lerRepeticao("FREQ=MONTHLY;INTERVAL=1"), null);
conferir("BYDAY com lista não se expande", lerRepeticao("FREQ=YEARLY;BYDAY=MO,WE"), null);
conferir(
  "e o evento continua valendo pela data dele",
  datas(lerIcal(serie("20260315", "FREQ=MONTHLY;INTERVAL=1"), janela)),
  ["2026-03-15"],
);

conferir(
  "evento sem RRULE não muda de comportamento",
  datas(lerIcal(ics(["BEGIN:VEVENT", "DTSTART;VALUE=DATE:20190704",
                     "SUMMARY:Avulso", "END:VEVENT"].join("\r\n")), janela)),
  ["2019-07-04"],
);

const total = passaram + falhas.length;
console.log(`\nleitura de iCal: ${passaram}/${total}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
