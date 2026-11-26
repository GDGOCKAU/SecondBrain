// Question sets ("files"): the host can keep several and pick one per room.
// A question: { id, category, baseText, highlightText, ar? }
const STORAGE_KEY = "mindsync_question_sets_v1";

export const DEFAULT_SET = {
  id: "default",
  builtIn: true,
  name: "General",
  questions: [
    {
      id: "d1",
      category: "Space & Science",
      baseText: "What is the only planet that rotates",
      highlightText: "clockwise?",
      ar: { category: "الفضاء والعلوم", baseText: "ما هو الكوكب الوحيد الذي يدور", highlightText: "مع عقارب الساعة؟" },
    },
    {
      id: "d2",
      category: "Pop Culture",
      baseText: "Name something people always forget at",
      highlightText: "home?",
      ar: { category: "ثقافة شعبية", baseText: "اذكر شيئًا ينساه الناس دائمًا في", highlightText: "المنزل؟" },
    },
    {
      id: "d3",
      category: "Food & Drink",
      baseText: "What is the best late-night",
      highlightText: "snack?",
      ar: { category: "طعام ومشروبات", baseText: "ما هي أفضل", highlightText: "وجبة خفيفة في منتصف الليل؟" },
    },
  ],
};

export function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyQuestion() {
  return { id: newId(), category: "", baseText: "", highlightText: "" };
}

function normalizeQuestion(item) {
  if (typeof item === "string") {
    const text = item.trim();
    return text ? { id: newId(), category: "", baseText: text, highlightText: "" } : null;
  }
  if (!item || typeof item !== "object") return null;
  const text = String(item.baseText ?? item.text ?? item.question ?? "").trim();
  if (!text) return null;
  return {
    id: item.id || newId(),
    category: String(item.category ?? "").trim(),
    baseText: text,
    highlightText: String(item.highlightText ?? "").trim(),
  };
}

export function loadCustomSets() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((s) => s && typeof s.id === "string" && Array.isArray(s.questions))
      .map((s) => ({
        id: s.id,
        name: String(s.name ?? ""),
        questions: s.questions.map(normalizeQuestion).filter(Boolean),
      }));
  } catch {
    return [];
  }
}

export function saveCustomSets(sets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  } catch {
    // Ignore storage errors
  }
}

export function loadAllSets() {
  return [DEFAULT_SET, ...loadCustomSets()];
}

/**
 * Reads a questions file.
 *  - .json: an array of strings/objects, or { name, questions: [...] }
 *  - .txt / .csv: one question per line, optionally "Category | Question"
 * Returns { name, questions } (questions may be empty if nothing was readable).
 */
export function parseQuestionsFile(text, filename = "") {
  const fileName = filename.replace(/\.[^.]+$/, "").trim();
  const trimmed = (text || "").replace(/^﻿/, "").trim();

  if (filename.toLowerCase().endsWith(".json") || /^[[{]/.test(trimmed)) {
    try {
      const data = JSON.parse(trimmed);
      const list = Array.isArray(data) ? data : data?.questions;
      if (Array.isArray(list)) {
        return {
          name: (!Array.isArray(data) && data.name) || fileName,
          questions: list.map(normalizeQuestion).filter(Boolean),
        };
      }
    } catch {
      // fall through to plain text
    }
  }

  const questions = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [first, ...rest] = line.split("|");
      return rest.length
        ? normalizeQuestion({ category: first, text: rest.join("|") })
        : normalizeQuestion(line);
    })
    .filter(Boolean);

  return { name: fileName, questions };
}

export function exportSet(set) {
  const data = {
    name: set.name,
    questions: set.questions.map(({ category, baseText, highlightText }) => ({
      category,
      text: highlightText ? `${baseText} ${highlightText}` : baseText,
    })),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(set.name || "questions").replace(/[^\w؀-ۿ-]+/g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Round-count choices that fit a set's size.
export function roundOptions(size) {
  const options = [5, 10, 15, 20].filter((n) => n <= size);
  if (size > 0 && size <= 20 && !options.includes(size)) options.push(size);
  return options.sort((a, b) => a - b);
}
