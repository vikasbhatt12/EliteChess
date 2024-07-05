import { Chess } from "chess.js";
import evaluate from "./evaluate";

const minimax = (game, depth, alpha, beta, isMaximizingPlayer) => {
  if (depth === 0 || game.isGameOver()) {
    return [evaluate(game), null];
  }

  const possibleMoves = game.moves({ verbose: true });
  let bestMove = null;

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (let move of possibleMoves) {
      game.move(move);
      const [evaluation] = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
      }
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return [maxEval, bestMove];
  } else {
    let minEval = Infinity;
    for (let move of possibleMoves) {
      game.move(move);
      const [evaluation] = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move;
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return [minEval, bestMove];
  }
};

export default minimax;
