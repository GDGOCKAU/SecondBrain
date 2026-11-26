import { BrowserRouter, Route } from "react-router-dom";
import AnimatedRoutes from "./components/AnimatedRoutes";
import { GameProvider } from "./context/GameContext";
import NetworkBackground from "./components/NetworkBackground";
import { SettingsProvider } from "./context/SettingsContext";
import LandingPage from "./pages/LandingPage";
import QuestionPage from "./pages/QuestionPage";
import ResultsPage from "./pages/ResultsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import QuestionSetsPage from "./pages/QuestionSetsPage";
import PlayerLandingPage from "./pages/player/PlayerLandingPage";
import AvatarSelection from "./pages/player/AvatarSelection";
import PlayerPage from "./pages/player/PlayerPage";
import PlayerLeaderboard from "./pages/player/PlayerLeaderboard";

function ResponsiveLanding() {
  return (
    <>
      <div className="block md:hidden">
        <PlayerLandingPage />
      </div>
      <div className="hidden md:block">
        <LandingPage />
      </div>
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
    <GameProvider>
      <BrowserRouter>
        <NetworkBackground />
        <div className="relative z-10">
        <AnimatedRoutes>
          <Route path="/" element={<ResponsiveLanding />} />
          <Route path="/admin" element={<LandingPage openHostLobby />} />
          <Route path="/join" element={<AvatarSelection />} />
          <Route path="/avatar" element={<AvatarSelection />} />
          <Route path="/player" element={<PlayerPage />} />
          <Route path="/player/leaderboard" element={<PlayerLeaderboard />} />
          <Route path="/game" element={<QuestionPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/sets" element={<QuestionSetsPage />} />
        </AnimatedRoutes>
        </div>
      </BrowserRouter>
    </GameProvider>
    </SettingsProvider>
  );
}
