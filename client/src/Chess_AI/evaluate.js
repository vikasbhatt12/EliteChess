const pieceValues = {
    p: 100,
    r: 500,
    n: 320,
    b: 330,
    q: 900,
    k: 20000,
  };
  
  const pawnEvalWhite = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
  
  const pawnEvalBlack = pawnEvalWhite.slice().reverse();
  
  const evaluate = (game) => {
    const board = game.board();
    let evaluation = 0;
  
    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
      const row = board[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const piece = row[colIndex];
        if (piece) {
          const pieceValue = pieceValues[piece.type];
          const positionalValue = piece.type === 'p' ? 
            (piece.color === 'w' ? pawnEvalWhite[rowIndex][colIndex] : pawnEvalBlack[rowIndex][colIndex]) : 0;
          evaluation += piece.color === 'w' ? (pieceValue + positionalValue) : -(pieceValue + positionalValue);
        }
      }
    }
  
    if (game.isCheckmate()) {
      evaluation = game.turn() === 'w' ? -Infinity : Infinity;
    } else if (game.isDraw()) {
      evaluation = 0;
    } else {
      const endgamePhase = countPieces(board) <= 6;
      if (endgamePhase) {
        const whiteKingPos = getKingPosition(game, 'w');
        const blackKingPos = getKingPosition(game, 'b');
        if (whiteKingPos && blackKingPos) {
          const distance = distanceBetweenSquares(whiteKingPos, blackKingPos);
          evaluation += game.turn() === 'w' ? -distance : distance;
        }
      }
    }
  
    return evaluation;
  };
  
  const getKingPosition = (game, color) => {
    const board = game.board();
    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
      const row = board[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const piece = row[colIndex];
        if (piece && piece.type === 'k' && piece.color === color) {
          return [rowIndex, colIndex];
        }
      }
    }
    return null;
  };
  
  const distanceBetweenSquares = (pos1, pos2) => {
    return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
  };
  
  const countPieces = (board) => {
    let count = 0;
    for (let row of board) {
      for (let piece of row) {
        if (piece && piece.type !== 'p') {
          count++;
        }
      }
    }
    return count;
  };
  
  export default evaluate;
  