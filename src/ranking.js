// Sorts by score, highest first. Players on the same score share a rank and the next rank follows
// directly (1, 1, 2, 3), so two winners never push third place out of the podium.
export function rankPlayers(players) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const ranked = [];
  sorted.forEach((player, i) => {
    const tied = i > 0 && player.score === sorted[i - 1].score;
    ranked.push({ ...player, rank: tied ? ranked[i - 1].rank : i > 0 ? ranked[i - 1].rank + 1 : 1 });
  });
  return ranked;
}
