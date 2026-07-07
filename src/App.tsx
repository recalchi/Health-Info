import {
  Activity,
  Bell,
  BookOpen,
  Brain,
  BriefcaseMedical,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  HeartPulse,
  Home,
  Layers3,
  LogIn,
  Pill,
  Save,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import HealthMannequin from "./HealthMannequin";
import { bodyAreas, conditions, trainingPlans, type BodyArea } from "./data/conditions";
import { isFirebaseConfigured, listenToUser, loginWithGoogle, logout, saveStudySession } from "./firebase";

type LayerMode = "muscular" | "skeletal" | "organs" | "training";

const navItems = [
  { label: "Visao Geral", icon: Home },
  { label: "Doencas", icon: BriefcaseMedical },
  { label: "Tratamentos", icon: Stethoscope },
  { label: "Sistemas do Corpo", icon: Layers3 },
  { label: "Medicamentos", icon: Pill },
  { label: "Treinos e Exercicios", icon: Dumbbell },
  { label: "Guias Clinicos", icon: BookOpen },
];

const layerTabs: Array<{ id: LayerMode; label: string }> = [
  { id: "muscular", label: "Muscular" },
  { id: "skeletal", label: "Esqueletico" },
  { id: "organs", label: "Orgaos" },
  { id: "training", label: "Treino" },
];

const systemCards = [
  { area: "torax" as BodyArea, title: "Cardiovascular", count: 312, icon: HeartPulse },
  { area: "torax" as BodyArea, title: "Respiratorio", count: 276, icon: Stethoscope },
  { area: "abdome" as BodyArea, title: "Digestivo", count: 248, icon: Activity },
  { area: "cabeca" as BodyArea, title: "Nervoso", count: 312, icon: Brain },
];

const medicationClasses = [
  { title: "Anti-hipertensivos", count: 134, detail: "IECA, BRA, BCC e diureticos", tone: "danger" },
  { title: "Anti-inflamatorios", count: 112, detail: "Dor, edema e inflamacao", tone: "warning" },
  { title: "Broncodilatadores", count: 38, detail: "Asma e DPOC", tone: "info" },
  { title: "Antidiabeticos", count: 91, detail: "Controle de glicemia", tone: "success" },
];

const selectedAreaCondition: Record<BodyArea, string> = {
  cabeca: "ansiedade",
  torax: "hipertensao",
  abdome: "diabetes-tipo-2",
  bracos: "atividade-fisica",
  pernas: "atividade-fisica",
};

export default function App() {
  const [selectedArea, setSelectedArea] = useState<BodyArea>("torax");
  const [query, setQuery] = useState("");
  const [activeNav, setActiveNav] = useState("Visao Geral");
  const [layer, setLayer] = useState<LayerMode>("muscular");
  const [user, setUser] = useState<User | null>(null);
  const [saveState, setSaveState] = useState("Sessao local");

  useEffect(() => listenToUser(setUser), []);

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    return conditions.filter((condition) => {
      const matchesArea = condition.area === selectedArea || activeNav === "Doencas";
      const haystack = [condition.title, condition.category, condition.summary, ...condition.signals, ...condition.prevention]
        .join(" ")
        .toLowerCase();
      return matchesArea && (!term || haystack.includes(term));
    });
  }, [activeNav, query, selectedArea]);

  const featured =
    filtered.find((condition) => condition.id === selectedAreaCondition[selectedArea]) ??
    filtered[0] ??
    conditions.find((condition) => condition.area === selectedArea) ??
    conditions[0];

  async function handleSave() {
    if (!user) return;
    setSaveState("Salvando no Firestore...");
    await saveStudySession(user.uid, {
      focusArea: bodyAreas[selectedArea].label,
      selectedCondition: featured.title,
    });
    setSaveState("Sessao salva");
  }

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Health Info">
          <img src="/health-info-logo.svg" alt="" />
          <span>Health Info</span>
        </a>

        <nav className="side-nav" aria-label="Navegacao principal">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={activeNav === label ? "active" : ""} onClick={() => setActiveNav(label)}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <section className="origin-note">
          <ShieldCheck size={20} />
          <strong>Nota de origem</strong>
          <p>
            Ideia iniciada no periodo em que estive na faculdade da Uni9, como complemento de um projeto de semestre
            voltado a novas ideias e negocios criativos.
          </p>
        </section>

        <section className="side-card">
          <span>Fontes confiaveis</span>
          <p>Conteudo educativo com referencias publicas e aviso de uso responsavel.</p>
        </section>
      </aside>

      <section className="main-area" id="top">
        <header className="top-search">
          <label>
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar doencas, sintomas, tratamentos, sistemas, medicamentos..."
            />
          </label>
          <button className="search-button">Buscar</button>
          <div className="top-actions">
            <button><Bell size={17} />Atualizacoes</button>
            <button><BookOpen size={17} />Sobre</button>
          </div>
          <div className="auth-pill">
            {isFirebaseConfigured() ? (
              user ? (
                <>
                  <span>{user.displayName || user.email}</span>
                  <button onClick={handleSave}><Save size={14} />Salvar</button>
                  <button onClick={logout}>Sair</button>
                </>
              ) : (
                <button onClick={loginWithGoogle}><LogIn size={14} />Google</button>
              )
            ) : (
              <span>Firebase opcional</span>
            )}
          </div>
        </header>

        <section className="hero-grid">
          <section className="anatomy-card">
            <div className="hero-title">
              <div>
                <span>Visualizacao Anatomica Interativa</span>
                <h1>Explore sistemas, sintomas e cuidados em um corpo 3D</h1>
              </div>
              <button className="tutorial">Tutorial rapido</button>
            </div>

            <div className="anatomy-workspace">
              <div className="filters-panel">
                <div className="panel-row">
                  <strong>Filtros e camadas</strong>
                  <button>Limpar</button>
                </div>
                {Object.entries(bodyAreas).map(([key, area]) => (
                  <button
                    key={key}
                    className={selectedArea === key ? "filter active" : "filter"}
                    onClick={() => setSelectedArea(key as BodyArea)}
                  >
                    <span>{area.label}</span>
                    <small>{area.description}</small>
                  </button>
                ))}
              </div>

              <div className="body-stage">
                <div className="stage-toolbar">
                  <button className="active">Frontal</button>
                  <button>Posterior</button>
                </div>
                <HealthMannequin selectedArea={selectedArea} onSelectArea={setSelectedArea} layer={layer} />
                <div className="callout callout-left">
                  <strong>{featured.title}</strong>
                  <span>{featured.category}</span>
                  <small>{featured.prevention[0]}</small>
                </div>
                <div className="callout callout-right">
                  <strong>{bodyAreas[selectedArea].label}</strong>
                  <span>{featured.signals[0]}</span>
                  <small>{featured.seekCare}</small>
                </div>
                <div className="layer-tabs">
                  {layerTabs.map((tab) => (
                    <button key={tab.id} className={layer === tab.id ? "active" : ""} onClick={() => setLayer(tab.id)}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="condition-panel">
            <span>Condicao selecionada</span>
            <h2>{featured.title}</h2>
            <small>{featured.category} - guia educativo</small>
            <div className="segmented">
              <button className="active">Visao geral</button>
              <button>Medicamentos</button>
              <button>Tratamento</button>
              <button>Evidencias</button>
            </div>
            <p>{featured.summary}</p>
            <div className="check-grid">
              <InfoList title="Sinais principais" items={featured.signals} />
              <InfoList title="Prevencao" items={featured.prevention} />
            </div>
            <div className="region-preview">
              <HeartPulse />
              <div>
                <strong>{bodyAreas[selectedArea].label}</strong>
                <p>{bodyAreas[selectedArea].description}</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="lower-grid">
          <article className="data-card wide">
            <div className="card-head">
              <h2>Doencas relacionadas</h2>
              <a>Ver todas <ChevronRight size={15} /></a>
            </div>
            <div className="condition-list rich">
              {filtered.slice(0, 4).map((condition) => (
                <button key={condition.id} onClick={() => setSelectedArea(condition.area)}>
                  <HeartPulse size={18} />
                  <span>{condition.title}</span>
                  <small>{condition.category}</small>
                  <b>{condition.area === selectedArea ? "Ativa" : "Estudo"}</b>
                </button>
              ))}
            </div>
          </article>

          <article className="data-card">
            <div className="card-head">
              <h2>Medicamentos e classes</h2>
              <a>Ver mapa</a>
            </div>
            <div className="med-grid">
              {medicationClasses.map((item) => (
                <button key={item.title} className={item.tone}>
                  <Pill size={20} />
                  <strong>{item.title}</strong>
                  <span>{item.count} referencias</span>
                  <small>{item.detail}</small>
                </button>
              ))}
            </div>
          </article>

          <article className="data-card">
            <div className="card-head">
              <h2>Sistemas do corpo</h2>
              <a>Ver todos</a>
            </div>
            <div className="system-grid">
              {systemCards.map(({ area, title, count, icon: Icon }) => (
                <button key={title} onClick={() => setSelectedArea(area)}>
                  <Icon size={24} />
                  <strong>{title}</strong>
                  <span>{count} artigos</span>
                </button>
              ))}
            </div>
          </article>

          <article className="data-card wide">
            <div className="card-head">
              <h2>Treinos e exercicios</h2>
              <a>Plano semanal</a>
            </div>
            <div className="training-row">
              {trainingPlans.map((plan) => (
                <section key={plan.title}>
                  <Dumbbell size={19} />
                  <strong>{plan.title}</strong>
                  <span>{plan.focus}</span>
                  <small>{plan.duration}</small>
                </section>
              ))}
            </div>
          </article>

          <article className="data-card">
            <div className="card-head">
              <h2>Evolucao do estudo</h2>
              <a>{saveState}</a>
            </div>
            <div className="mini-chart" aria-hidden="true">
              <span style={{ height: "32%" }} />
              <span style={{ height: "46%" }} />
              <span style={{ height: "41%" }} />
              <span style={{ height: "62%" }} />
              <span style={{ height: "57%" }} />
              <span style={{ height: "78%" }} />
              <span style={{ height: "70%" }} />
            </div>
          </article>

          <article className="data-card notice-card">
            <CalendarDays size={22} />
            <h2>Conteudo educacional</h2>
            <p>
              Informacoes para estudo e triagem educativa. Diagnostico, tratamento e medicacao devem ser definidos por
              profissionais de saude.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3>{title}</h3>
      <ul>
        {items.slice(0, 4).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
