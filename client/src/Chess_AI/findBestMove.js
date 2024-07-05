import { Chess } from "chess.js";
import minimax from "./minimax";

const getSearchDepth = (game) => {
  const pieceCount = game.board().flat().filter(piece => piece).length;
  const blackpieceCount = game.board().flat().filter(piece => piece && piece.color === 'w').length;
  if (blackpieceCount<=4) return 2;
  if (pieceCount <= 10) return 5;
  if (pieceCount <= 14) return 4; // Midgame
  return 3; // Opening
};

const findBestMove = (FEN) => {
  const game = new Chess(FEN);
  const depth = getSearchDepth(game);
  const [_, bestMove] = minimax(game, depth, -Infinity, Infinity,game.turn() === 'w');
  return bestMove;
};

export default findBestMove;
