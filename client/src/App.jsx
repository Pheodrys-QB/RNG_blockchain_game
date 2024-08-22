import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const CARD_WIDTH = 168.75;
  const STATE = {
    start: "start",
    ongoing: "ongoing",
    end: "end",
    reset: "reset",
  };

  const ANIMATION = {
    instant: { transition: "top 0s, left 0s, right 0s" },
    ease: {
      transition: "top 0.5s, left 0.5s, right 0.5s",
      transitionTimingFunction: "ease-in-out",
    },
    ease_fast: {
      transition: "top 0.3s, left 0.3s, right 0.3s",
      transitionTimingFunction: "ease-out",
    },
  };

  const [WIDTH, setWidth] = useState(window.innerWidth);
  const [count, setCount] = useState(0);

  const [error, setError] = useState(null);

  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(0);

  const [gameState, setGameState] = useState(STATE.start);
  const [isSelectable, setIsSelectable] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [choice, setChoice] = useState(-1);
  const [rewards, setRewards] = useState([]);
  const [rotateAnimations, setRotateAnimations] = useState([{}, {}, {}]);

  const ATTRIBUTE = {
    hidden: {},
    selectable: gameState == STATE.ongoing ? { cursor: "pointer" } : {},
    selected: gameState == STATE.reset ? {} : { backgroundColor: "red" },
    reveal: { transition: "transform 0.8s", transform: "rotateY(-180deg)" },
  };

  const POSITION = {
    left: { left: WIDTH / 2.1 - CARD_WIDTH * 3, top: 250 },
    center: { left: WIDTH / 2.1 - CARD_WIDTH / 2, top: 250 },
    right: { left: WIDTH / 2.1 + CARD_WIDTH * 2, top: 250 },
    offscreen_Top: { top: -250, left: WIDTH / 2.1 - CARD_WIDTH / 2 },
    offscreen_Left: { top: 250, left: -500 },
  };

  const [cardAnimations, setCardAnimations] = useState([
    ANIMATION.instant,
    ANIMATION.instant,
    ANIMATION.instant,
  ]);

  const [cardPositions, setCardPositions] = useState([{}, {}, {}]);

  useEffect(() => {
    // Check if MetaMask is installed
    connect();

    setError({ code: 1, message: "MetaMask is not installed" });
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const connect = async () => {
    // Try to connect using ethers.js

    setError({ code: 2, message: "MetaMask connection failure" });
  };
  const getBalance = async () => {};

  const handleStart = () => {
    setCardPositions([POSITION.left, POSITION.center, POSITION.right]);
    setCardAnimations([
      { ...ANIMATION.ease, transitionDelay: "0s" },
      { ...ANIMATION.ease, transitionDelay: "0.2s" },
      { ...ANIMATION.ease, transitionDelay: "0.4s" },
    ]);
    setGameState(STATE.ongoing);
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);

    // await result

    setRewards([0, 0, 0]);

    const anim = [
      { ...ATTRIBUTE.reveal, transitionDelay: "0.5s" },
      { ...ATTRIBUTE.reveal, transitionDelay: "0.5s" },
      { ...ATTRIBUTE.reveal, transitionDelay: "0.5s" },
    ];
    anim[choice].transitionDelay = "0s";
    setIsRevealed(true);
    setRotateAnimations(anim);

    setGameState(STATE.end);
  };

  const handleDiscard = () => {
    setCardPositions([
      POSITION.offscreen_Left,
      POSITION.offscreen_Left,
      POSITION.offscreen_Left,
    ]);
    setCardAnimations([
      ANIMATION.ease_fast,
      ANIMATION.ease_fast,
      ANIMATION.ease_fast,
    ]);
    setGameState(STATE.reset);
  };

  const handleReset = () => {
    setCardPositions([{}, {}, {}]);
    setCardAnimations([
      ANIMATION.instant,
      ANIMATION.instant,
      ANIMATION.instant,
    ]);
    setGameState(STATE.start);
    setChoice(null);
    setIsRevealed(false);
    setIsSubmitted(false);
    setRotateAnimations([{}, {}, {}]);
  };

  return (
    <div className="main-container">
      <div className="info-container"></div>
      <div className="auth-container"></div>

      <div
        className="game-board"
        style={{
          backgroundColor: "green",
          position: "absolute",
          top: 20,
          left: 20,
          bottom: 20,
          right: 20,
          justifyContent: "center",
          display: "flex",
        }}
      >
        <div className="title"></div>

        <div className="dealer"></div>

        <div
          className="game-state-controller"
          style={{ position: "absolute", bottom: 20 }}
        >
          <div className="game-message"></div>
          <button
            onClick={() => {
              if (gameState == STATE.start) {
                handleStart();
                return;
              }
              if (gameState == STATE.ongoing) {
                handleSubmit();
                return;
              }
              if (gameState == STATE.end) {
                handleDiscard();
                return;
              }
            }}
          >
            {gameState}
          </button>
        </div>

        <div
          className="card-container"
          style={
            choice == 0
              ? {
                  ...POSITION.offscreen_Top,
                  ...cardAnimations[0],
                  ...cardPositions[0],
                  ...ATTRIBUTE.selectable,
                  ...ATTRIBUTE.selected,
                }
              : {
                  ...POSITION.offscreen_Top,
                  ...cardAnimations[0],
                  ...cardPositions[0],
                  ...ATTRIBUTE.selectable,
                }
          }
          onClick={() => {
            if (gameState != STATE.ongoing) return;
            setChoice(0);
          }}
        >
          <div className="card" style={isRevealed ? rotateAnimations[0] : {}}>
            <div className="card-front"></div>
            <div className="card-back"></div>
          </div>
        </div>

        <div
          className="card-container"
          style={
            choice == 1 && gameState
              ? {
                  ...POSITION.offscreen_Top,
                  ...cardAnimations[1],
                  ...cardPositions[1],
                  ...ATTRIBUTE.selectable,
                  ...ATTRIBUTE.selected,
                }
              : {
                  ...POSITION.offscreen_Top,
                  ...cardAnimations[1],
                  ...cardPositions[1],
                  ...ATTRIBUTE.selectable,
                }
          }
          onClick={() => {
            if (gameState != STATE.ongoing) return;
            setChoice(1);
          }}
        >
          <div className="card" style={isRevealed ? rotateAnimations[1] : {}}>
            <div className="card-front"></div>
            <div className="card-back"></div>
          </div>
        </div>

        <div
          className="card-container"
          style={
            choice == 2
              ? {
                  ...POSITION.offscreen_Top,
                  ...cardAnimations[2],
                  ...cardPositions[2],
                  ...ATTRIBUTE.selectable,
                  ...ATTRIBUTE.selected,
                }
              : {
                  ...POSITION.offscreen_Top,
                  ...cardAnimations[2],
                  ...cardPositions[2],
                  ...ATTRIBUTE.selectable,
                }
          }
          onTransitionEnd={() => {
            if (gameState == STATE.reset) {
              handleReset();
            }
          }}
          onClick={() => {
            if (gameState != STATE.ongoing) return;
            setChoice(2);
          }}
        >
          <div className="card" style={isRevealed ? rotateAnimations[2] : {}}>
            <div className="card-front"></div>
            <div className="card-back"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
