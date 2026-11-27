import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { CloseIcon, PlusIcon } from "../components/Icons";
import { GoogleBar } from "../components/Ui";
import { useSettings } from "../context/SettingsContext";
import {
  DEFAULT_SET,
  emptyQuestion,
  exportSet,
  loadCustomSets,
  newId,
  parseQuestionsFile,
  saveCustomSets,
} from "../questionSets";

export default function QuestionSetsPage() {
  const navigate = useNavigate();
  const { t, tn } = useSettings();
  const fileRef = useRef(null);
  const [custom, setCustom] = useState(loadCustomSets);
  const [selectedId, setSelectedId] = useState(DEFAULT_SET.id);
  const [message, setMessage] = useState("");

  const sets = [DEFAULT_SET, ...custom];
  const selected = sets.find((s) => s.id === selectedId) || DEFAULT_SET;
  const readOnly = Boolean(selected.builtIn);
  const nameOf = (set) => (set.builtIn ? t("defaultSetName") : set.name || t("untitledSet"));

  const commit = (next) => {
    setCustom(next);
    saveCustomSets(next);
  };
  const patchSet = (id, patch) => commit(custom.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const patchQuestion = (qid, patch) =>
    patchSet(selected.id, {
      questions: selected.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)),
    });

  const addSet = (set) => {
    commit([...custom, set]);
    setSelectedId(set.id);
  };

  const handleNew = () => {
    addSet({ id: newId(), name: "", questions: [emptyQuestion()] });
    setMessage("");
  };

  const handleDuplicate = () => {
    addSet({
      id: newId(),
      name: `${nameOf(selected)} · ${t("duplicateSet")}`.slice(0, 60),
      // Copies are plain, editable questions (no built-in Arabic overlay).
      questions: selected.questions.map((q) => ({
        id: newId(),
        category: q.category,
        baseText: q.baseText,
        highlightText: q.highlightText,
      })),
    });
  };

  const handleDelete = () => {
    if (readOnly || !window.confirm(t("confirmDelete"))) return;
    commit(custom.filter((s) => s.id !== selected.id));
    setSelectedId(DEFAULT_SET.id);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const { name, questions } = parseQuestionsFile(await file.text(), file.name);
    if (!questions.length) {
      setMessage(t("importError"));
      return;
    }
    setMessage("");
    addSet({ id: newId(), name: name.slice(0, 60), questions });
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header>
        <button type="button" className="btn-outline !h-9 !px-4 !text-[13px]" onClick={() => navigate("/")}>
          <span aria-hidden="true" className="rtl:rotate-180">
            ←
          </span>
          {t("backHome")}
        </button>
      </Header>

      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-[clamp(8px,2dvh,24px)] px-5 py-[clamp(8px,2dvh,24px)] md:px-8">
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-[clamp(1.4rem,min(3.5vw,5dvh),2.5rem)] font-bold leading-tight tracking-[-0.04em]">
              {t("setsTitle")}
            </h1>
            <p className="m-0 text-base text-muted">{t("setsSub")}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.csv,.json,text/plain,application/json"
              className="hidden"
              onChange={handleImport}
              aria-label={t("importFile")}
            />
            <button type="button" className="btn-outline" onClick={() => fileRef.current?.click()}>
              {t("importFile")}
            </button>
            <button type="button" className="btn-primary !h-12" onClick={handleNew}>
              <PlusIcon /> {t("newSet")}
            </button>
          </div>
        </div>

        <p className={`m-0 shrink-0 text-[13px] ${message ? "text-red-ink" : "text-muted"}`} role={message ? "alert" : undefined}>
          {message || t("importHint")}
        </p>

        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,2fr)_minmax(0,3fr)] gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
          <ul className="m-0 flex min-h-0 min-w-0 list-none flex-col gap-2 overflow-y-auto p-0">
            {sets.map((set, i) => {
              const on = set.id === selected.id;
              const tint = ["bg-blue-soft", "bg-red-soft", "bg-yellow-soft", "bg-green-soft"][i % 4];
              return (
                <li key={set.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelectedId(set.id)}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-panel border bg-surface p-3.5 text-start transition-all hover:-translate-y-px hover:shadow-card ${
                      on ? "border-g-blue shadow-card" : "border-line"
                    }`}
                  >
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-[30%] text-sm font-bold ${tint}`}>
                      {set.questions.length}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-[15px]" dir="auto">
                        {nameOf(set)}
                      </strong>
                      <span className="text-xs text-muted">
                        {tn("questionsOne", "questionsMany", set.questions.length)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <section
            aria-label={nameOf(selected)}
            className="card flex min-h-0 min-w-0 flex-col gap-4 p-5"
          >
            <div className="flex shrink-0 flex-wrap items-end gap-3">
              <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                <label htmlFor="set-name" className="text-[13px] font-medium text-muted">
                  {t("setName")}
                </label>
                <input
                  id="set-name"
                  dir="auto"
                  value={readOnly ? t("defaultSetName") : selected.name}
                  readOnly={readOnly}
                  maxLength={60}
                  placeholder={t("untitledSet")}
                  onChange={(e) => patchSet(selected.id, { name: e.target.value })}
                  className="field h-11 px-3.5 text-base font-semibold"
                />
              </div>
              <button type="button" className="btn-outline !h-11 !px-4 !text-sm" onClick={handleDuplicate}>
                {t("duplicateSet")}
              </button>
              <button
                type="button"
                className="btn-outline !h-11 !px-4 !text-sm"
                onClick={() => exportSet({ ...selected, name: nameOf(selected) })}
              >
                {t("exportSet")}
              </button>
              {!readOnly && (
                <button
                  type="button"
                  className="btn-outline !h-11 !px-4 !text-sm !text-red-ink"
                  onClick={handleDelete}
                >
                  {t("deleteSet")}
                </button>
              )}
            </div>

            {readOnly && <p className="m-0 shrink-0 text-[13px] text-muted">{t("builtInNote")}</p>}

            {selected.questions.length === 0 && (
              <p className="m-0 text-sm text-muted">{t("noQuestionsYet")}</p>
            )}

            <ol className="m-0 flex min-h-0 flex-1 list-none flex-col gap-2.5 overflow-y-auto p-0">
              {selected.questions.map((q, i) => (
                <li key={q.id} className="flex flex-wrap items-center gap-2.5 rounded-[14px] bg-field p-2.5">
                  <span className="w-6 text-center text-xs font-semibold tabular-nums text-muted">
                    {i + 1}
                  </span>
                  {readOnly ? (
                    <>
                      <span className="pill bg-yellow-soft !py-1 !text-xs font-semibold text-yellow-ink">
                        {q.category}
                      </span>
                      <span className="min-w-0 flex-1 text-sm" dir="auto">
                        {q.baseText} {q.highlightText}
                      </span>
                    </>
                  ) : (
                    <>
                      <input
                        dir="auto"
                        value={q.category}
                        maxLength={40}
                        placeholder={t("categoryOptional")}
                        aria-label={t("categoryOptional")}
                        onChange={(e) => patchQuestion(q.id, { category: e.target.value })}
                        className="field h-10 w-40 max-w-full px-3 text-sm"
                      />
                      <input
                        dir="auto"
                        value={q.highlightText ? `${q.baseText} ${q.highlightText}` : q.baseText}
                        maxLength={200}
                        placeholder={t("questionText")}
                        aria-label={`${t("questionText")} ${i + 1}`}
                        onChange={(e) =>
                          patchQuestion(q.id, { baseText: e.target.value, highlightText: "" })
                        }
                        className="field h-10 min-w-[200px] flex-1 px-3 text-sm"
                      />
                      <button
                        type="button"
                        aria-label={t("removeQuestion", { n: i + 1 })}
                        onClick={() =>
                          patchSet(selected.id, {
                            questions: selected.questions.filter((x) => x.id !== q.id),
                          })
                        }
                        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:text-red-ink"
                      >
                        <CloseIcon />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ol>

            {!readOnly && (
              <button
                type="button"
                className="btn-tonal !h-11 shrink-0 self-start !px-5 !text-sm"
                onClick={() =>
                  patchSet(selected.id, { questions: [...selected.questions, emptyQuestion()] })
                }
              >
                <PlusIcon /> {t("addQuestion")}
              </button>
            )}
          </section>
        </div>
      </main>
      <GoogleBar />
    </div>
  );
}
