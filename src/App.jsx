import { BrowserRouter, Route } from "react-router-dom";
import { RequireAdmin } from "./components/AdminGate";
import AnimatedRoutes from "./components/AnimatedRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorPage from "./components/ErrorPage";
import { GameProvider } from "./context/GameContext";
import BlurOrbs from "./components/BlurOrbs";
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
        <BlurOrbs />
        <NetworkBackground />
        <div className="relative z-10">
        <ErrorBoundary>
        <AnimatedRoutes>
          <Route path="/"element={<ResponsiveLanding />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <LandingPage openHostLobby />
              </RequireAdmin>
            }
          />
          <Route path="/join" element={<AvatarSelection />} />
          <Route path="/avatar" element={<AvatarSelection />} />
          <Route path="/player" element={<PlayerPage />} />
          <Route path="/player/leaderboard" element={<PlayerLeaderboard />} />
          <Route path="/game" element={<QuestionPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route
            path="/sets"
            element={
              <RequireAdmin>
                <QuestionSetsPage />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<ErrorPage kind="notFound" />} />
        </AnimatedRoutes>
        </ErrorBoundary>
        </div>
      </BrowserRouter>
    </GameProvider>
    </SettingsProvider>
  );
}
