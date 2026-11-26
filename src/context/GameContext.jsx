import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";

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
    totalRounds: 0, // follows the chosen question file
    roundTime: 20,
    roundEndTime: null, // set when the host presses Start on a question
    roundStarted: false,
    roundEvaluated: false,
    questions: [], // no file chosen yet: the host picks one after creating the room
    setId: null,
    setName: "",
    pendingSet: null, // file picked mid-room: takes over from the next question / next game
    questionBase: 0,
    players: initialPlayers,
  };
}

export function GameProvider({ children }) {
  const [game, setGame] = useState(loadInitialState);
  const [timeLeft, setTimeLeft] = useState(() =>
    game.roundStarted === false || !game.roundEndTime
      ? game.roundTime
      : Math.max(0, Math.ceil((game.roundEndTime - Date.now()) / 1000))
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
    if (game.roundStarted === false || !game.roundEndTime) {
      setTimeLeft(game.roundTime); // waiting for the host to press Start
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((game.roundEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    tick();
    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [game.roundEndTime, game.roundStarted, game.roundTime]);

  // Automatically evaluate matches when the timer hits 0
  useEffect(() => {
    if (game.roundStarted !== false && timeLeft === 0 && !game.roundEvaluated) {
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
  }, [timeLeft, game.roundEvaluated, game.roundStarted]);

  // Everyone has submitted: no reason to wait for the clock
  useEffect(() => {
    if (game.roundStarted === false || game.roundEvaluated || timeLeft === 0 || game.players.length === 0) return;
    if (game.players.every((p) => p.status === "answered")) {
      updateGame((prev) => ({ ...prev, roundEndTime: Date.now() }));
    }
  }, [game.players, game.roundEvaluated, game.roundStarted, timeLeft]);

  // Host ends the round now (scores are evaluated by the timer effect above)
  const endRound = () => {
    updateGame((prev) =>
      prev.roundEvaluated || prev.roundStarted === false ? prev : { ...prev, roundEndTime: Date.now() }
    );
  };

  // Host presses Start: the question opens for answers and the clock begins
  const startRound = () => {
    updateGame((prev) =>
      prev.roundStarted === false && prev.questions.length > 0
        ? { ...prev, roundStarted: true, roundEndTime: Date.now() + prev.roundTime * 1000 }
        : prev
    );
  };

  // 1. Host starts game from LobbyModal
  // `fresh` = a brand-new room: no question file chosen yet
  const startGame = ({ roomCode, timeLimit, questions, fresh }) => {
    updateGame((prev) => {
      if (fresh) prev = { ...prev, questions: [], setId: null, setName: "", pendingSet: null };
      const picked = questions?.length ? { questions } : prev.pendingSet;
      return {
      ...prev,
      roomCode: roomCode || prev.roomCode,
      questions: picked?.questions?.length ? picked.questions : prev.questions,
      setId: picked?.setId ?? prev.setId,
      setName: picked?.setName ?? prev.setName,
      pendingSet: null,
      questionBase: 0,
      currentRound: 1,
      totalRounds: (picked?.questions?.length ? picked.questions : prev.questions).length,
      roundTime: timeLimit ?? prev.roundTime,
      roundEndTime: null,
      roundStarted: false,
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

  // Host picks another question file while inside the room (also after the last question).
  // Before a question has been started the file swaps right away; otherwise it waits for the next question.
  const queueQuestionSet = (set) => {
    updateGame((prev) => {
      if (set.id === prev.setId) return { ...prev, pendingSet: null };
      if (prev.roundStarted === false) {
        return {
          ...prev,
          questions: set.questions,
          setId: set.id,
          setName: set.name,
          pendingSet: null,
          questionBase: prev.currentRound - 1,
          totalRounds: prev.currentRound - 1 + set.questions.length,
        };
      }
      return { ...prev, pendingSet: { setId: set.id, setName: set.name, questions: set.questions } };
    });
  };

  // Host removes a player from the room
  const removePlayer = (playerId) => {
    updateGame((prev) => ({ ...prev, players: prev.players.filter((p) => p.id !== playerId) }));
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
    if (!trimmed || timeLeft === 0 || game.roundStarted === false) return;

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
      const swap = prev.pendingSet;
      return {
        ...prev,
        ...(swap
          ? {
              questions: swap.questions,
              setId: swap.setId,
              setName: swap.setName,
              pendingSet: null,
              questionBase: nextRoundNum - 1, // the new file starts from its first question
              totalRounds: nextRoundNum - 1 + swap.questions.length,
            }
          : {}),
        currentRound: nextRoundNum,
        roundEndTime: null,
        roundStarted: false,
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
  const total = game.questions.length || 1;
  const questionIndex = (((game.currentRound - 1 - (game.questionBase || 0)) % total) + total) % total;
  const baseQuestion = game.questions[questionIndex] || { id: "none", category: "", baseText: "", highlightText: "" };
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
        endRound,
        startRound,
        queueQuestionSet,
        removePlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}