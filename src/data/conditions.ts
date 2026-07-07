export type BodyArea = "cabeca" | "torax" | "abdome" | "bracos" | "pernas";

export type Condition = {
  id: string;
  title: string;
  category: string;
  area: BodyArea;
  summary: string;
  signals: string[];
  prevention: string[];
  seekCare: string;
  sourceLabel: string;
  sourceUrl: string;
};

export const bodyAreas: Record<BodyArea, { label: string; description: string }> = {
  cabeca: {
    label: "Cabeca e sistema nervoso",
    description: "Observa sinais neurologicos, saude mental, sono, dor e alteracoes de consciencia.",
  },
  torax: {
    label: "Torax, coracao e pulmoes",
    description: "Relaciona respiracao, circulacao, dor toracica, tosse e condicionamento cardiorrespiratorio.",
  },
  abdome: {
    label: "Abdome e metabolismo",
    description: "Acompanha digestao, glicemia, energia, hidratacao e sinais de infeccao ou inflamacao.",
  },
  bracos: {
    label: "Membros superiores",
    description: "Ajuda a estudar forca, mobilidade, ergonomia, dor articular e rotina de fortalecimento.",
  },
  pernas: {
    label: "Membros inferiores",
    description: "Foca em locomocao, equilibrio, circulacao, treino e sinais de alerta em pernas e pes.",
  },
};

export const conditions: Condition[] = [
  {
    id: "hipertensao",
    title: "Hipertensao arterial",
    category: "Cardiovascular",
    area: "torax",
    summary:
      "Pressao alta persistente aumenta risco cardiovascular e costuma exigir acompanhamento, habitos saudaveis e, em alguns casos, medicacao.",
    signals: ["Pode nao gerar sintomas", "Dor de cabeca ou tontura em alguns casos", "Pressao elevada em medidas repetidas"],
    prevention: ["Reduzir excesso de sal", "Praticar atividade fisica regular", "Evitar tabaco e excesso de alcool"],
    seekCare: "Procure atendimento urgente diante de dor no peito, falta de ar, fraqueza em um lado do corpo ou confusao.",
    sourceLabel: "WHO - Noncommunicable diseases",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases",
  },
  {
    id: "diabetes-tipo-2",
    title: "Diabetes tipo 2",
    category: "Metabolica",
    area: "abdome",
    summary:
      "Condicao cronica ligada ao controle da glicose. Educacao, alimentacao, movimento e acompanhamento reduzem complicacoes.",
    signals: ["Sede excessiva", "Urinar com frequencia", "Cansaco", "Visao turva"],
    prevention: ["Manter rotina ativa", "Priorizar alimentos in natura", "Monitorar glicemia quando indicado"],
    seekCare: "Procure atendimento se houver vomitos persistentes, sonolencia intensa, desidratacao ou glicemias muito altas.",
    sourceLabel: "WHO - Noncommunicable diseases",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases",
  },
  {
    id: "asma",
    title: "Asma e crise respiratoria",
    category: "Respiratoria",
    area: "torax",
    summary:
      "Inflamacao das vias respiratorias que pode causar chiado, tosse e falta de ar. Plano de acao e gatilhos conhecidos ajudam no controle.",
    signals: ["Chiado no peito", "Falta de ar", "Tosse noturna", "Aperto no peito"],
    prevention: ["Identificar gatilhos", "Manter medicacao prescrita", "Evitar fumaca e poeira quando possivel"],
    seekCare: "Busque urgencia se houver dificuldade para falar, labios arroxeados ou falta de ar que nao melhora.",
    sourceLabel: "WHO - Noncommunicable diseases",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases",
  },
  {
    id: "ansiedade",
    title: "Ansiedade e sinais de estresse",
    category: "Saude mental",
    area: "cabeca",
    summary:
      "Ansiedade pode afetar respiracao, sono, foco e corpo. Acompanhamento profissional e estrategias de autocuidado podem ajudar.",
    signals: ["Preocupacao persistente", "Tensao muscular", "Palpitacoes", "Sono prejudicado"],
    prevention: ["Rotina de sono", "Respiracao guiada", "Rede de apoio", "Reduzir estimulantes quando pioram sintomas"],
    seekCare: "Procure ajuda imediata se houver risco de autoagressao, panico intenso ou prejuizo importante nas atividades.",
    sourceLabel: "PAHO/WHO - NCDs and mental health context",
    sourceUrl: "https://www.paho.org/en/topics/noncommunicable-diseases",
  },
  {
    id: "infeccoes-respiratorias",
    title: "Infeccoes respiratorias",
    category: "Infecciosa",
    area: "torax",
    summary:
      "Resfriados, gripes e outras infeccoes podem variar de leves a graves. Higiene, vacinacao e isolamento quando necessario reduzem transmissao.",
    signals: ["Febre", "Tosse", "Dor no corpo", "Coriza", "Falta de ar em casos graves"],
    prevention: ["Higienizar maos", "Manter vacinas em dia", "Evitar contato proximo quando sintomatico"],
    seekCare: "Procure atendimento diante de falta de ar, febre persistente, confusao, dor no peito ou piora rapida.",
    sourceLabel: "WHO - Health topics",
    sourceUrl: "https://www.who.int/health-topics",
  },
  {
    id: "atividade-fisica",
    title: "Atividade fisica preventiva",
    category: "Prevencao e treino",
    area: "pernas",
    summary:
      "Movimento regular apoia saude cardiovascular, metabolismo, equilibrio, humor e autonomia. O modulo TreinoLivre foi integrado aqui.",
    signals: ["Sedentarismo", "Cansaço aos esforcos", "Perda de mobilidade", "Dor por sobrecarga"],
    prevention: ["150 minutos semanais de atividade moderada", "2 dias de fortalecimento", "Progressao gradual"],
    seekCare: "Pessoas com dor no peito, tontura intensa ou condicoes cronicas devem ajustar o plano com profissional de saude.",
    sourceLabel: "CDC - Physical Activity Guidelines",
    sourceUrl: "https://www.cdc.gov/physical-activity-basics/guidelines/index.html",
  },
];

export const trainingPlans = [
  {
    title: "Base ativa",
    duration: "20 min",
    focus: "Cardiorrespiratorio",
    steps: ["5 min caminhada leve", "10 min caminhada rapida", "5 min volta calma e alongamento leve"],
  },
  {
    title: "Forca inicial",
    duration: "18 min",
    focus: "Membros e postura",
    steps: ["3 series de sentar e levantar", "Flexao na parede", "Remada com elastico ou toalha", "Prancha curta"],
  },
  {
    title: "Mobilidade diaria",
    duration: "12 min",
    focus: "Articulacoes",
    steps: ["Rotacao de ombros", "Mobilidade de quadril", "Panturrilha", "Respiracao lenta"],
  },
];

