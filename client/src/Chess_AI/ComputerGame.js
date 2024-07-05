import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import Container from "@mui/material/Container";
import socket from "../socket";
import { TextField, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import CustomDialog from "../components/CustomDialog";
import runEngine from "./runEngine";
import "../components/Game.css";

const HomeContainer = styled(Container)({
  paddingTop: "10px",
});

export default function ComputerGame() {
  const [username, setUsername] = useState("");
  const [usernameSubmitted, setUsernameSubmitted] = useState(false);
  const chess = useMemo(() => new Chess(), []);
  const [fen, setFen] = useState(chess.fen());
  const [over, setOver] = useState("");
  const [players, setPlayers] = useState([]);
  const [orientation, setOrientation] = useState("white");

  const cleanup = useCallback(() => {
   
    setPlayers([]);
    
  }, []);

  const makeAMove = useCallback(
    (move) => {
      try {
        const result = chess.move(move);
        setFen(chess.fen());

        if (chess.isGameOver()) {
          if (chess.isCheckmate()) {
            setOver(`Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`);
          } else if (chess.isDraw()) {
            setOver("Draw");
          } else {
            setOver("Game over");
          }
        }

        return result;
      } catch (e) {
        return null;
      }
    },
    [chess]
  );

  const onDrop = async (sourceSquare, targetSquare) => {
    if (chess.turn() !== "w") return false;

    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    setTimeout(async () => {
      const bestMove = await runEngine(chess.fen(), 3);
      if (bestMove) {
        makeAMove({
          from: bestMove.from,
          to: bestMove.to,
          promotion: "q",
        });
      } else {
        const possibleMoves = chess.moves({ verbose: true });
        if (possibleMoves.length > 0) {
          const fallbackMove = possibleMoves[0];
          makeAMove({
            from: fallbackMove.from,
            to: fallbackMove.to,
            promotion: "q",
          });
        }
      }
    }, 250);

    return true;
  };

  useEffect(() => {
    chess.reset();
    setFen(chess.fen());
    setOver("");

    if (chess.turn() === "b") {
      setTimeout(async () => {
        const bestMove = await runEngine(chess.fen(), 3);
        if (bestMove) {
          makeAMove({
            from: bestMove.from,
            to: bestMove.to,
            promotion: "q",
          });
        } else {
          const possibleMoves = chess.moves({ verbose: true });
          if (possibleMoves.length > 0) {
            const fallbackMove = possibleMoves[0];
            makeAMove({
              from: fallbackMove.from,
              to: fallbackMove.to,
              promotion: "q",
            });
          }
        }
      }, 250);
    }
  }, [chess]);

  return (
    <HomeContainer>

      <CustomDialog
        open={!usernameSubmitted}
        handleClose={() => setUsernameSubmitted(true)}
        title="Pick a username"
        contentText="Please select a username"
        handleContinue={() => {
          if (!username) return;
          socket.emit("username", username);
          setUsernameSubmitted(true);
        }}
      >
        <TextField
          autoFocus
          margin="dense"
          id="username"
          label="Username"
          name="username"
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          fullWidth
          variant="standard"
        />
      </CustomDialog>
    <div className="game-container">
      <div className="game-content">
        <div className="board-container">
        <div className="top_player">
            <img
              src={process.env.PUBLIC_URL + '/chess_profile.webp'}
              className="profile-pic"
              alt="Default Profile"
            />
            <h5>{"Chess Bot"}</h5>
          </div>

          <Chessboard position={fen} onPieceDrop={onDrop} boardOrientation={orientation} />
          <div className="bottom_player">
            <img
              src={process.env.PUBLIC_URL + '/chess_profile.webp'}
              className="profile-pic"
              alt="Default Profile"
            />
            <h5>{ username}</h5>
          </div>
        </div>
      </div>
      {over && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h4>{over}</h4>
            <button onClick={() => {
              chess.reset();
              setOver("");
              setFen(chess.fen());
            }}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
    </HomeContainer>
  );
}
