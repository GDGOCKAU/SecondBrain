import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";
import { DEFAULT_SET } from "../questionSets";

const GameContext = createContext(null);
const STORAGE_KEY = "sb_room_state_v1";

// Shared Arabic & English normalizer
export function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, "") // Strip Arabic tashkeel
    .replace(/ـ/g, "")                     // Strip tatweel
    .replace(/[أإآ]/g, "ا")                 // Unify Alef
    .replace(/ة/g, "ه")                     // Unify Taa Marbuta
    .replace(/ى/g, "ي")                     // Unify Alef Maksura
    .replace(/(^|\s)ال/g, "$1")             // Strip leading "ال"
    .replace(/\s+/g, " ");
}

export function areAnswersMatching(ansA, ansB) {
  const normA = normalizeText(ansA);
  const normB = normalizeText(ansB);
  return Boolean(normA && normB && normA === normB);
}

// ---------------------------------------------------------
// Replace this initial mock state
// with your database room & players subscription!
// ---------------------------------------------------------
const initialPlayers = [
  { id: "p1", name: "Maya", score: 8, avatar: "cat", status: "answered", roundAnswer: "زهره", matchPoints: 0, hostBonus: 0 },
  { id: "p2", name: "Theo", score: 6, avatar: "robot", status: "answered", roundAnswer: "المريخ", matchPoints: 0, hostBonus: 0 },
  { id: "p3", name: "Jules", score: 5, avatar: "alien", status: "answered", roundAnswer: "Venus", matchPoints: 0, hostBonus: 0 },
  { id: "p4", name: "Arlo", score: 4, avatar: "ghost", status: "answered", roundAnswer: "زحل", matchPoints: 0, hostBonus: 0 },
  { id: "you", name: "3yoosh", score: 7, avatar: "blob", status: "you", roundAnswer: "", matchPoints: 0, hostBonus: 0 },
  { id: "p6", name: "Priya", score: 6, avatar: "frog", status: "answered", roundAnswer: "الزهرة", matchPoints: 0, hostBonus: 0 },
  { id: "p7", name: "Sam", score: 4, avatar: "star", status: "answered", roundAnswer: "Mars", matchPoints: 0, hostBonus: 0 },
  { id: "p8", name: "Lena", score: 3, avatar: "monster", status: "answered", roundAnswer: "الزهره", matchPoints: 0, hostBonus: 0 },
];

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore storage errors
  }

  return {
    roomCode: "KAU1",
    currentRound: 1,
    totalRounds: 10,
    roundTime: 20,
    roundEndTime: Date.now() + 20 * 1000,
    roundEvaluated: false,
    questions: DEFAULT_SET.questions,
    players: initialPlayers,
  };
}

export function GameProvider({ children }) {
  const [game, setGame] = useState(loadInitialState);
  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, Math.ceil((game.roundEndTime - Date.now()) / 1000))
  );

  // Save state & broadcast across open tabs ( replaces this with DB write)
  const updateGame = (updater) => {
    setGame((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Listen for real-time updates from other tabs ( replaces with DB onSnapshot/subscribe)
  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setGame(JSON.parse(raw));
      } catch {
        // Ignore parse errors
      }
    };
    window.addEventListener("storage", sync);
    const poll = window.setInterval(sync, 300);
    return () => {
      window.removeEventListener("storage", sync);
      window.clearInterval(poll);
    };
  }, []);

  // Master synced countdown based on `roundEndTime` timestamp (survives page refreshes)
  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((game.roundEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    tick();
    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [game.roundEndTime]);

  // Automatically evaluate matches when the timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && !game.roundEvaluated) {
      updateGame((prev) => {
        if (prev.roundEvaluated) return prev;

        const updatedPlayers = prev.players.map((player) => {
          if (!player.roundAnswer?.trim()) {
            return { ...player, matchPoints: 0 };
          }
          const matches = prev.players.filter(
            (other) =>
              other.id !== player.id &&
              areAnswersMatching(player.roundAnswer, other.roundAnswer)
          ).length;

          return {
            ...player,
            score: player.score + matches,
            matchPoints: matches,
          };
        });

        return {
          ...prev,
          players: updatedPlayers,
          roundEvaluated: true,
        };
      });
    }
  }, [timeLeft, game.roundEvaluated]);

  // 1. Host starts game from LobbyModal
  const startGame = ({ roomCode, totalRounds, timeLimit, questions }) => {
    updateGame((prev) => ({
      ...prev,
      roomCode: roomCode || prev.roomCode,
      questions: questions?.length ? questions : prev.questions,
      currentRound: 1,
      totalRounds,
      roundTime: timeLimit,
      roundEndTime: Date.now() + timeLimit * 1000,
      roundEvaluated: false,
      players: prev.players.map((p) => ({
        ...p,
        matchPoints: 0,
        hostBonus: 0,
        roundAnswer: p.id === "you" ? "" : p.roundAnswer,
      })),
    }));
  };

  // 2. Player sets their name & avatar from AvatarSelection
  const registerPlayer = ({ name, avatar }) => {
    updateGame((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === "you" ? { ...p, name, avatar, status: "you" } : p
      ),
    }));
  };

  // 3. Player submits their answer (clock keeps ticking until 0)
  const submitAnswer = (answerText) => {
    const trimmed = answerText.trim();
    if (!trimmed || timeLeft === 0) return;

    updateGame((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === "you" ? { ...p, roundAnswer: trimmed, status: "answered" } : p
      ),
    }));
  };

  // 4. Host manually gives or deducts points (+1 / -1)
  const adjustScore = (playerId, delta) => {
    updateGame((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === playerId
          ? {
              ...p,
              score: Math.max(0, p.score + delta),
              hostBonus: (p.hostBonus || 0) + delta,
            }
          : p
      ),
    }));
  };

  // 5. Host advances to the next round from ResultsPage
  const nextRound = () => {
    updateGame((prev) => {
      const nextRoundNum =
        prev.currentRound < prev.totalRounds ? prev.currentRound + 1 : 1;
      return {
        ...prev,
        currentRound: nextRoundNum,
        roundEndTime: Date.now() + prev.roundTime * 1000,
        roundEvaluated: false,
        players: prev.players.map((p) => ({
          ...p,
          matchPoints: 0,
          hostBonus: 0,
          roundAnswer: p.id === "you" ? "" : p.roundAnswer,
          status: p.id === "you" ? "you" : "answered",
        })),
      };
    });
  };

  const { lang } = useSettings();
  const questionIndex = (game.currentRound - 1) % game.questions.length;
  const baseQuestion = game.questions[questionIndex] || game.questions[0];
  const currentQuestion =
    lang === "ar" && baseQuestion?.ar ? { ...baseQuestion, ...baseQuestion.ar } : baseQuestion;

  const myPlayer =
    game.players.find((p) => p.id === "you") || game.players[0];

  return (
    <GameContext.Provider
      value={{
        game,
        timeLeft,
        currentQuestion,
        myPlayer,
        startGame,
        registerPlayer,
        submitAnswer,
        adjustScore,
        nextRound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}