import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import socket from "../socket";
import "./Game.css";
import Chat from './Chat';
import Timer from './Timer';
import MoveList from './MoveList';
import { FaHandshake, FaFlag } from "react-icons/fa"; // Importing draw and resign icons



function Game({ players = [], room, orientation, cleanup, username }) {
  const chess = useMemo(() => new Chess(), []); 
  const [fen, setFen] = useState(chess.fen());
  const [over, setOver] = useState("");
  const [timeoutMessage, settimeoutMessage] = useState(""); 
 
  const [offerDraw, setOfferDraw] = useState(null);
  const [drawOfferedBy, setDrawOfferedBy] = useState(null);
 // const [resigned, setResigned] = useState(false);

  const copyMsgRef = useRef(null);
  const [squareStyles, setSquareStyles] = useState({});
  const [lastMove, setLastMove] = useState(null);
  const [hoverSquare, setHoverSquare] = useState(null);
  const [stylesLegal, setStylesLegal] = useState({});
  const [moveList, setMoveList] = useState([]); // State for move list
  //const [gameStarted, setGameStarted] = useState(false); // State for game start

  // Timer states
  const [whiteMinutes, setWhiteMinutes] = useState(5);
  const [whiteSeconds, setWhiteSeconds] = useState(0);
  const [blackMinutes, setBlackMinutes] = useState(5);
  const [blackSeconds, setBlackSeconds] = useState(0);
  const [isWhiteActive, setIsWhiteActive] = useState(true); // White timer starts active
  const [isBlackActive, setIsBlackActive] = useState(false); // Black timer starts inactive

  const removeHighlightSquares = () => {
    setSquareStyles({});
  };

  const removeHighlightLegalSquares = () => {
    setStylesLegal({});
  };

  const highlightLegalSquare = (sourceSquare, squaresToHighlight) => {
    const highlightStylesLegal = [sourceSquare].concat(squaresToHighlight).reduce((a, c) => {
      return {
        ...a,
        [c]: {
          background: "radial-gradient(circle, rgba(0, 0, 0, 0.4) 46%, transparent 40%)",
          borderRadius: "50%",
        }
      };
    }, {});

    setStylesLegal({ ...highlightStylesLegal });
  };

  const highlightSquare = (sourceSquare, squaresToHighlight) => {
    const highlightStyles = [sourceSquare].concat(squaresToHighlight).reduce((a, c) => {
      return {
        ...a,
        [c]: {
          background: "radial-gradient(circle, rgba(0, 0, 0, 0.4) 46%, transparent 40%)",
          borderRadius: "50%",
        }
      };
    }, {});

    setSquareStyles(highlightStyles);
  };

  const updateSquareStyles = (move = null, hover = null) => {
    const styles = {};
    if (move) {
      styles[move.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
      styles[move.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    }
    if (hover) {
      styles[hover] = { backgroundColor: 'rgba(0, 0, 255, 0.3)' };
    }
    setSquareStyles(styles);
  };

  const makeAMove = useCallback(
    (move) => {
      try {
        const result = chess.move(move);
        if (result) {
          setFen(chess.fen());
          setLastMove(move);
          updateSquareStyles(move, hoverSquare);

          // Update move list
          setMoveList((prevMoveList) => [
            ...prevMoveList,
            { move: result.san, fen: chess.fen() }
          ]);

          

          // Switch active timer based on the turn
          if (chess.turn() === 'w') {
            setIsWhiteActive(true);
            setIsBlackActive(false);
          } else {
            setIsWhiteActive(false);
            setIsBlackActive(true);
          }

          if (chess.isGameOver()) {
            setIsWhiteActive(false);
            setIsBlackActive(false);

            if (chess.isCheckmate()) {
              setOver(`Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`);
            } else if (chess.isDraw()) {
              setOver("Draw");
            } else {
              setOver("Game over");
            }
          }
        }

        return result;
      } catch (e) {
        return null;
      }
    },
    [chess, hoverSquare]
  );

  
  function onDrop(sourceSquare, targetSquare) {
    removeHighlightLegalSquares();
    removeHighlightSquares();

    if (chess.turn() !== orientation[0]) return false;
    if (players.length < 2) return false;

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    };

    const move = makeAMove(moveData);

    if (move === null) return false;

    socket.emit("move", {
      move: moveData,
      room,
    });

    return true;
  }

  useEffect(() => {
    socket.on("move", (move) => {
      makeAMove(move);
    });

    socket.on('playerDisconnected', (player) => {
      setOver(`${player.username} has disconnected`);
    });

    socket.on('closeRoom', ({ roomId }) => {
      if (roomId === room) {
        cleanup();
      }
    });

    socket.on("hover", (square) => {
      setHoverSquare(square);
      updateSquareStyles(lastMove, square);
    });

    socket.on("drawOffer", (data) => {
      setOfferDraw(data);
      setDrawOfferedBy(data.username);
    });

    socket.on("resign", ({ username, winner }) => {
      setOver(`${username} has resigned.`);
    });

    socket.on("drawAccepted", () => {
      setOver("Draw");
    });

    return () => {
      socket.off('move');
      socket.off('playerDisconnected');
      socket.off('closeRoom');
      socket.off('hover');
      socket.off('drawOffer');
      socket.off('resign');
      socket.off('drawAccepted');
    };
  }, [makeAMove, room, cleanup, players, lastMove]);

  const handleOfferDraw = () => {
    socket.emit("offerDraw", { room, username });
  };

  const handleAcceptDraw = () => {
    socket.emit("acceptDraw", { room });
    setOver("Draw");
    setOfferDraw(null);
    setDrawOfferedBy(null);
  };

  const handleDeclineDraw = () => {
    setOfferDraw(null);
    setDrawOfferedBy(null);
  };

  const handleResign = () => {
    const winner = orientation === "white" ? playerBlack.username : playerWhite.username;
    socket.emit("resign", { room, username, winner });
    setOver(`${username} has resigned.`);
  };

  const getPlayer = (color) => {
    if (!Array.isArray(players)) return null;

    return players.find((player, index) => {
      if (orientation === "white") {
        return index === (color === "w" ? 0 : 1);
      } else {
        return index === (color === "w" ? 1 : 0);
      }
    });
  };

  const playerWhite = getPlayer("w");
  const playerBlack = getPlayer("b");

  const copyRoomIdToClipboard = () => {
    navigator.clipboard.writeText(room).then(() => {
      const copyMsg = copyMsgRef.current;
      copyMsg.innerText = "Copied";
      copyMsg.classList.add("active");

      setTimeout(() => {
        copyMsg.classList.remove("active");
        copyMsg.innerText = ""; // Clear message after timeout
      }, 2000);
    });
  };

  const onMouseOverSquare = (square) => {
    removeHighlightLegalSquares();

    setHoverSquare(square);
    const moves = chess.moves({
      square: square,
      verbose: true
    });

    if (moves.length === 0) return;

    const squaresToHighlightLegal = moves.map(move => move.to);
    highlightLegalSquare(square, squaresToHighlightLegal);

    const squaresToHighlight = moves.map(move => move.to);
    highlightSquare(square, squaresToHighlight);
    updateSquareStyles(lastMove, square);
    socket.emit("hover", square);
  };

  const onMouseOutSquare = () => {
    removeHighlightLegalSquares();

    setHoverSquare(null);
    updateSquareStyles(lastMove);
    socket.emit("hover", null);
  };

  // Combine squareStyles and stylesLegal into a single object
  const combinedStyles = { ...squareStyles, ...stylesLegal };

  const handleWhiteTimeUp = () => {
    settimeoutMessage("White's time is up! Black wins!");

  };

  const handleBlackTimeUp = () => {
    
    settimeoutMessage("Black's time is up! White wins!");
   
  };

  const handleTimeChange = (minutes, seconds, color) => {
    if (color === 'w') {
      setWhiteMinutes(minutes);
      setWhiteSeconds(seconds);
    } else {
      setBlackMinutes(minutes);
      setBlackSeconds(seconds);
    }
  };

  

  return (
    <div className="game-container">
      
      <div className="game-card">
        <h5>Room ID: {room}</h5>
        <button onClick={copyRoomIdToClipboard}>
          <span className="tooltip" ref={copyMsgRef}></span>
          Copy Room ID
        </button>
      </div>

      <div className="game-content">
        <div className="board-container">
          <div className="top_player">
            <img
              src={process.env.PUBLIC_URL + '/chess_profile.webp'}
              className="profile-pic"
              alt="Default Profile"
            />
            <h5>{playerBlack ? playerBlack.username : "Waiting for opponent..."}</h5>
          </div>
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation={orientation}
            onMouseOverSquare={onMouseOverSquare}
            onMouseOutSquare={onMouseOutSquare}
            customSquareStyles={combinedStyles} // Pass combined styles as a prop
          />
          <div className="bottom_player">
            <img
              src={process.env.PUBLIC_URL + '/chess_profile.webp'}
              className="profile-pic"
              alt="Default Profile"
            />
            <h5>{playerWhite ? playerWhite.username : "Waiting for opponent..."}</h5>
          </div>
        </div>
       <div className="SideBar">
        <div className="timer-section">
          <div className="white-timer">
            <h5>{"White Player"}</h5>
            <Timer
              initialMinutes={whiteMinutes}
              initialSeconds={whiteSeconds}
              isActive={isWhiteActive && players.length === 2}
              onTimeUp={handleWhiteTimeUp}
              onTimeChange={(minutes, seconds) => handleTimeChange(minutes, seconds, 'w')}
            />
          </div>
          <div className="black-timer">
            <h5>{"Black Player"}</h5>
            <Timer
              initialMinutes={blackMinutes}
              initialSeconds={blackSeconds}
              isActive={isBlackActive && players.length === 2}
              onTimeUp={handleBlackTimeUp}
              onTimeChange={(minutes, seconds) => handleTimeChange(minutes, seconds, 'b')}
            />
          </div>
          </div>
          <div className="move-list-section">
          <MoveList moves={moveList} />
        </div>
        <div className="undo-redo-buttons">
            
            <button onClick={handleOfferDraw}>
              <FaHandshake /> {/* Using the imported icon */}
              Offer Draw
            </button>
            <button onClick={handleResign}>
              <FaFlag /> {/* Using the imported icon */}
              Resign
            </button>

            
        </div>
        {offerDraw && drawOfferedBy !== username && (
          <div className="draw-offer">
            <p>{offerDraw.username} offers a draw. Do you accept?</p>
            <div className="draw-offer-buttons">

            <button onClick={handleAcceptDraw}>Accept</button>
            <button onClick={handleDeclineDraw}>Decline</button>
            </div>

          </div>
        )}
        <div className="chat-section">
          <Chat roomId={room} username={username} />
        </div>
        </div>
        
      </div>

      {over && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h4>{over}</h4>
            <button
              onClick={() => {
                socket.emit("closeRoom", { roomId: room });
                cleanup();
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {timeoutMessage && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h4>{timeoutMessage}</h4>
            <button
              onClick={() => {
                socket.emit("closeRoom", { roomId: room });
                cleanup();
              }}
            >
              Close
            </button>
          </div>
        </div>
        
        
      )}


    </div>
  );
}

export default Game;
