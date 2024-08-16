import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  const [error, setError] = useState(null);

  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(0);

  const [gameState, setGameState] = useState("");

  const [choice, setChoice] = useState(-1);
  const [rewards, setRewards] = useState([]);

  const [cardAnimation, setCardAnimation] = useState({});

  const [cardPositions, setCardPositions] = useState([
    POSITION.offscreen_Top,
    POSITION.offscreen_Top,
    POSITION.offscreen_Top,
  ]);

  const STATE = {
    start: "start",
    ongoing: "ongoing",
    end: "end",
    reset: "reset",
  };

  const ATTRIBUTE = {
    hidden: {},
    selectable: {},
    selected: {},
    reveal: {},
  };

  const POSITION = {
    left: {},
    center: {},
    right: {},
    offscreen_Top: {},
    offscreen_Left: {},
  };

  const ANIMATION = {
    draw: {},
    flip: {},
    discard: {},
    reset: {},
  };

  useEffect(() => {
    // Check if MetaMask is installed
    connect();

    setError({ code: 1, message: "MetaMask is not installed" });
  }, {});

  const connect = async () => {
    // Try to connect using ethers.js

    setError({ code: 2, message: "MetaMask connection failure" });
  };
  const getBalance = async () => {};

  const handleStart = () => {};

  const handleSubmit = async () => {};

  const handleReset = () => {};

  return (
    <div id="main-container">
      <div id="info-container"></div>
      <div id="auth-container"></div>

      <div id="game-board">
        <div id="title"></div>

        <div id="dealer"></div>

        <div id="card-container">
          <div id="card">
            <div id="card-front"></div>
            <div id="card-back"></div>
          </div>
        </div>

        <div id="card-container">
          <div id="card">
            <div id="card-front"></div>
            <div id="card-back"></div>
          </div>
        </div>

        <div id="card-container">
          <div id="card">
            <div id="card-front"></div>
            <div id="card-back"></div>
          </div>
        </div>

        <div id="game-state-controller">
          <div id="game-message"></div>
          <div id="button"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
