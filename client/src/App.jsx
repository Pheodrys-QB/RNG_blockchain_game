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
    instant: "animation-instant",
    ease: "animation-ease",
    ease_fast: "animation-ease-fast",
  };

  const [WIDTH, setWidth] = useState(window.innerWidth);
  const [isTitleShown, setIsTitleShown] = useState(false);
  const [fadeTitle, setFadeTitle] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  const [error, setError] = useState(null);

  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(0);

  const [gameState, setGameState] = useState(STATE.start);
  const [isSelectable, setIsSelectable] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [allowClick, setAllowClick] = useState(true);

  const [choice, setChoice] = useState(-1);
  const [rewards, setRewards] = useState([]);
  const [rotateAnimations, setRotateAnimations] = useState([{}, {}, {}]);

  const ATTRIBUTE = {
    hidden: "",
    selectable: "selectable",
    selected: "selected",
    reveal: "reveal",
  };

  const POSITION = {
    left: { left: WIDTH / 2.1 - CARD_WIDTH * 2.5, top: 250 },
    center: { left: WIDTH / 2.1 - CARD_WIDTH / 2, top: 250 },
    right: { left: WIDTH / 2.1 + CARD_WIDTH * 1.5, top: 250 },
    offscreen_Top: {
      top: -300,
      left: WIDTH / 2.1 - CARD_WIDTH / 2,
      transform:
        gameState == STATE.start ? "rotateZ(-180deg)" : "rotateZ(0deg)",
    },
    offscreen_Left: { top: 250, left: -500, opacity: 0 },
  };

  const [cardAnimations, setCardAnimations] = useState([
    ANIMATION.instant,
    ANIMATION.instant,
    ANIMATION.instant,
  ]);

  const [cardPositions, setCardPositions] = useState([{}, {}, {}]);

  useEffect(() => {
    // Check if MetaMask is installed
    //setError({ code: 1, message: "MetaMask is not installed" });

    connect();

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const connect = async () => {
    // Try to connect using ethers.js
    //setError({ code: 2, message: "MetaMask connection failure" });
  };
  const getBalance = async () => {};

  const handleStart = () => {
    setAllowClick(false);
    setCardPositions([POSITION.left, POSITION.center, POSITION.right]);
    setCardAnimations([
      ANIMATION.ease,
      ANIMATION.ease + " delay-02",
      ANIMATION.ease + " delay-04",
    ]);
    setGameState(STATE.ongoing);
  };

  const handleSubmit = async () => {
    setAllowClick(false);
    setIsSubmitted(true);

    // call contract

    // await result

    setRewards([0, 0.5, 0.2]);

    const anim = [
      { animation: ATTRIBUTE.reveal, transitionDelay: true },
      { animation: ATTRIBUTE.reveal, transitionDelay: true },
      { animation: ATTRIBUTE.reveal, transitionDelay: true },
    ];
    anim[choice].transitionDelay = false;
    setIsRevealed(true);
    const t_anim = anim.map((a) => {
      if (a.transitionDelay) return a.animation + " delay-05";
      return a.animation;
    });
    setRotateAnimations(t_anim);

    setGameState(STATE.end);
  };

  const handleDiscard = () => {
    setAllowClick(false);
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
    setChoice(-1);
    setIsRevealed(false);
    setIsSubmitted(false);
    setRotateAnimations(["", "", ""]);
  };

  return (
    <div className="main-container">
      <div className="game-board">
        {isTitleShown && (
          <div className="title" style={fadeTitle ? { opacity: 0 } : {}}>
            <div>
              <img src="/images/title.png" />
            </div>
          </div>
        )}

        <div className="dealer">
          <img src="/images/dealer.png" />
        </div>
        {!isTitleShown && !error && (
          <>
            <div
              className="game-state-controller"
              style={{ position: "absolute", bottom: 20 }}
            >
              <div className="game-message"></div>
              <button
                disabled={gameState == STATE.ongoing? choice < 0 : !allowClick}
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
              className={
                "card-container" +
                (" " + cardAnimations[0]) +
                (gameState == STATE.ongoing ? " " + ATTRIBUTE.selectable : "") +
                (gameState != STATE.reset && choice == 0
                  ? " " + ATTRIBUTE.selected
                  : "") +
                (isRevealed ? " " + rotateAnimations[0] : "")
              }
              style={{ ...POSITION.offscreen_Top, ...cardPositions[0] }}
              onTransitionEnd={() => {
                setAllowClick(true);

                if (gameState == STATE.reset) {
                  handleReset();
                }
              }}
              onClick={() => {
                if (gameState != STATE.ongoing) return;
                setChoice(0);
              }}
            >
              <div className="card">
                <div className="card-front">
                  <div className="card-front-image"></div>
                  <div className="card-front-content">
                    <h1>+{rewards[0]}</h1>
                  </div>
                </div>
                <div className="card-back"></div>
              </div>
            </div>

            <div
              className={
                "card-container" +
                (" " + cardAnimations[1]) +
                (gameState == STATE.ongoing ? " " + ATTRIBUTE.selectable : "") +
                (gameState != STATE.reset && choice == 1
                  ? " " + ATTRIBUTE.selected
                  : "") +
                (isRevealed ? " " + rotateAnimations[1] : "")
              }
              style={{ ...POSITION.offscreen_Top, ...cardPositions[1] }}
              onTransitionEnd={() => {
                if (gameState == STATE.reset) {
                  handleReset();
                }
              }}
              onClick={() => {
                if (gameState != STATE.ongoing) return;
                setChoice(1);
              }}
            >
              <div className="card">
                <div className="card-front">
                  <div className="card-front-image"></div>
                  <div className="card-front-content">
                    <h1>+{rewards[1]}</h1>
                  </div>
                </div>
                <div className="card-back"></div>
              </div>
            </div>

            <div
              className={
                "card-container" +
                (" " + cardAnimations[2]) +
                (gameState == STATE.ongoing ? " " + ATTRIBUTE.selectable : "") +
                (gameState != STATE.reset && choice == 2
                  ? " " + ATTRIBUTE.selected
                  : "") +
                (isRevealed ? " " + rotateAnimations[2] : "")
              }
              style={{ ...POSITION.offscreen_Top, ...cardPositions[2] }}
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
              <div className="card">
                <div className="card-front">
                  <div className="card-front-image"></div>
                  <div className="card-front-content">
                    <h1>+{rewards[2]}</h1>
                  </div>
                </div>
                <div className="card-back"></div>
              </div>
            </div>
          </>
        )}

        {/* <div
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
            <div className="card-front">
              <div style={{ flex: 7 }}></div>
              <div
                style={{
                  flex: 3,
                  textAlign: "center",
                }}
              >
                <h1>+{rewards[1]}</h1>
              </div>
            </div>
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
          
          onClick={() => {
            if (gameState != STATE.ongoing) return;
            setChoice(2);
          }}
        >
          <div className="card" style={isRevealed ? rotateAnimations[2] : {}}>
            <div className="card-front">
              <div style={{ flex: 7 }}></div>
              <div
                style={{
                  flex: 3,
                  textAlign: "center",
                }}
              >
                <h1>+{rewards[2]}</h1>
              </div>
            </div>
            <div className="card-back"></div>
          </div>
        </div> */}
      </div>

      <div className="info-container"></div>
      <div className="auth-container"></div>
    </div>
  );
}

export default App;
