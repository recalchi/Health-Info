import { Activity, BookOpen, Dumbbell, HeartPulse, LogIn, Save, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import HealthMannequin from "./HealthMannequin";
import { bodyAreas, conditions, trainingPlans, type BodyArea } from "./data/conditions";
import { isFirebaseConfigured, listenToUser, loginWithGoogle, logout, saveStudySession } from "./firebase";
import type { User } from "firebase/auth";

const tabs = ["Atlas", "Condicoes", "TreinoLivre", "Fontes"];

export default function App() {
  const [selectedArea, setSelectedArea] = useState<BodyArea>("torax");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [user, setUser] = useState<User | null>(null);
  const [saveState, setSaveState] = useState("Nao salvo");

  useEffect(() => listenToUser(setUser), []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    return conditions.filter((condition) => {
      const matchesArea = condition.area === selectedArea || activeTab === "Condicoes";
      const matchesSearch =
        !term ||
        [condition.title, condition.category, condition.summary, ...condition.signals].join(" ").toLowerCase().includes(term);
      return matchesArea && matchesSearch;
    });
  }, [activeTab, query, selectedArea]);

  const featured = filtered[0] ?? conditions.find((condition) => condition.area === selectedArea) ?? conditions[0];

  async function handleSave() {
    if (!user) return;
    setSaveState("Salvando...");
    await saveStudySession(user.uid, {
      focusArea: bodyAreas[selectedArea].label,
      selectedCondition: featured.title,
    });
    setSaveState("Sessao salva no Firestore");
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <span className="eyebrow">Health Info 2.0</span>
          <h1>Portal educativo de saude e prevencao</h1>
        </div>
        <div className="auth-card">
          <ShieldCheck size={18} />
          {isFirebaseConfigured() ? (
            user ? (
              <>
                <span>{user.displayName || user.email}</span>
                <button onClick={handleSave}><Save size={15} />Salvar estudo</button>
                <button onClick={logout}>Sair</button>
              </>
            ) : (
              <button onClick={loginWithGoogle}><LogIn size={15} />Entrar com Google</button>
            )
          ) : (
            <span>Firebase opcional nao configurado</span>
          )}
        </div>
      </section>

      <section className="workspace">
        <aside className="control-panel">
          <div className="notice">
            Conteudo educativo. Nao use este app para diagnostico, prescricao ou emergencia medica.
          </div>

          <div className="tabs">
            {tabs.map((tab) => (
              <button key={tab} className={tab === activeTab ? "active" : ""} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          <label className="search">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar sintomas, categoria ou tema" />
          </label>

          <div className="area-list">
            {Object.entries(bodyAreas).map(([key, area]) => (
              <button
                key={key}
                className={key === selectedArea ? "area active" : "area"}
                onClick={() => setSelectedArea(key as BodyArea)}
              >
                <span>{area.label}</span>
                <small>{area.description}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="stage">
          <div className="scene-wrap">
            <HealthMannequin selectedArea={selectedArea} onSelectArea={setSelectedArea} />
            <div className="scene-overlay">
              <span>{bodyAreas[selectedArea].label}</span>
              <strong>{featured.title}</strong>
              <p>{bodyAreas[selectedArea].description}</p>
            </div>
          </div>
        </section>

        <section className="content-panel">
          {activeTab === "TreinoLivre" ? (
            <TrainingView />
          ) : activeTab === "Fontes" ? (
            <SourcesView />
          ) : (
            <ConditionView featured={featured} filtered={filtered} onSelectArea={setSelectedArea} />
          )}
          <div className="save-state">{saveState}</div>
        </section>
      </section>
    </main>
  );
}

function ConditionView({
  featured,
  filtered,
  onSelectArea,
}: {
  featured: (typeof conditions)[number];
  filtered: typeof conditions;
  onSelectArea: (area: BodyArea) => void;
}) {
  return (
    <>
      <div className="panel-heading">
        <HeartPulse />
        <div>
          <span>{featured.category}</span>
          <h2>{featured.title}</h2>
        </div>
      </div>
      <p className="summary">{featured.summary}</p>

      <div className="info-grid">
        <ArticleBlock title="Sinais para estudar" items={featured.signals} />
        <ArticleBlock title="Prevencao e autocuidado" items={featured.prevention} />
      </div>

      <div className="urgent">
        <strong>Quando procurar cuidado:</strong> {featured.seekCare}
      </div>

      <h3>Biblioteca relacionada</h3>
      <div className="condition-list">
        {filtered.map((condition) => (
          <button key={condition.id} onClick={() => onSelectArea(condition.area)}>
            <span>{condition.title}</span>
            <small>{condition.category}</small>
          </button>
        ))}
      </div>
    </>
  );
}

function ArticleBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <article>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function TrainingView() {
  return (
    <>
      <div className="panel-heading">
        <Dumbbell />
        <div>
          <span>Integracao TreinoLivre</span>
          <h2>Rotina preventiva guiada</h2>
        </div>
      </div>
      <p className="summary">
        A ideia do TreinoLivre foi incorporada como trilha de prevencao: planos curtos, progressivos e adequados para estudo.
      </p>
      <div className="training-grid">
        {trainingPlans.map((plan) => (
          <article key={plan.title}>
            <Activity />
            <span>{plan.focus}</span>
            <h3>{plan.title}</h3>
            <strong>{plan.duration}</strong>
            <ol>
              {plan.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </>
  );
}

function SourcesView() {
  const sources = Array.from(new Map(conditions.map((condition) => [condition.sourceUrl, condition.sourceLabel])).entries());
  return (
    <>
      <div className="panel-heading">
        <BookOpen />
        <div>
          <span>Conteudo responsavel</span>
          <h2>Fontes e limites</h2>
        </div>
      </div>
      <p className="summary">
        O app organiza informacoes de estudo e prevencao. Para sintomas reais, condicoes existentes, medicacao ou emergencia, consulte profissionais e servicos de saude.
      </p>
      <div className="source-list">
        {sources.map(([url, label]) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            {label}
          </a>
        ))}
      </div>
    </>
  );
}

