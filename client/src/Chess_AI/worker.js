/* eslint-disable no-restricted-globals */
import findBestMove from "./findBestMove";

self.addEventListener("message", ({ data: [FEN, depth] }) => {
  const bestMove = findBestMove(FEN);
  self.postMessage(bestMove);
});
/* eslint-enable no-restricted-globals */
