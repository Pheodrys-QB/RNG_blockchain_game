import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import contract_json from "../artifacts/contracts/RNG_game.sol/RNG_game.json";
function App() {
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const CONTRACT_ABI = contract_json.abi;
  const ETHERSCAN_API_KEY = "UC5BR5S9MUGFZGRK2IPTK9C58UU1DMAIGY";

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
  const [isTitleShown, setIsTitleShown] = useState(true);
  const [fadeTitle, setFadeTitle] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  const [error, setError] = useState(null);

  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [isHistoryShown, setIsHistoryShown] = useState(false);

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

    connectWallet();

    const handleResize = () => {
      setWidth(window.innerWidth);
      if (gameState == STATE.ongoing) {
        const fixPos = [POSITION.left, POSITION.center, POSITION.right];
        setCardPositions((prev) => fixPos);
      }
      if (gameState == STATE.start) {
        //setCardPositions([POSITION.left, POSITION.center, POSITION.right]);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    try {
      if (!contract) return;

      setAllowClick(false);
      setIsSubmitted(true);

      // call contract
      const tx = await contract
        .connect(signer)
        .drawCards(choice, { value: ethers.parseEther("0.001") });
      const receipt = await tx.wait(1);
      console.log(receipt.logs[0].eventName);
      console.log(receipt.logs[0].args.getValue("choice"));
      const reward = receipt.logs[0].args.getValue("reward").toArray();
      console.log(reward);
      // await result

      setRewards([
        ethers.formatEther(reward[0]),
        ethers.formatEther(reward[1]),
        ethers.formatEther(reward[2]),
      ]);

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
      getBalance();
      setGameState(STATE.end);
    } catch (e) {}
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

  useEffect(() => {
    if (address && provider) {
      getBalance();
    }
  }, [address, provider]);

  const connectWallet = async () => {
    setIsConnecting(true);
    if (window.ethereum) {
      try {
        const prov = new ethers.BrowserProvider(window.ethereum);
        const name = (await prov.getNetwork()).name;
        // if (name != "sepolia") {
        //   setError({ code: 5, message: "Please use Sepolia Network" });
        //   return;
        // }
        const accounts = await prov.send("eth_requestAccounts", []);

        // const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const sign = await prov.getSigner();

        const gameContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          prov
        );
        setContract(gameContract);
        setSigner(sign);
        setProvider(prov);
        setAddress(accounts[0]);
        setIsConnecting(false);
        setFadeTitle(true);
      } catch (e) {
        setError({ code: 2, message: "Connection to wallet fail" });
      }
    } else {
      // provider = ethers.getDefaultProvider()

      setError({ code: 1, message: "MetaMask not detected" });
    }
  };

  const getBalance = async () => {
    try {
      // const balance = await provider.send("eth_getBalance", [
      //   activeAccount,
      //   "latest",
      // ]);

      const bal = await provider.getBalance(address);
      setBalance(ethers.formatEther(bal));
    } catch (e) {
      setError({ code: 3, message: "Fail to get address balance" });
    }
  };

  const getHistory = async ({
    address,
    start = 0,
    end = 99999999,
    page = 1,
    offset = 10,
    sort = "desc",
    apikey,
    contractAddress,
  }) => {
    try {
      const res = await fetch(
        `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${start}&endblock=${end}&page=${page}&offset=${offset}&sort=${sort}&apikey=${apikey}`
      );
      const data = await res.json();
      const data_filter = data.result.filter((txt) => {
        if (!contractAddress) return txt.from == address;
        return txt.to == contractAddress && txt.from == address;
      });
      setHistory(data_filter);
      console.log(data);
    } catch (e) {
      setError({ code: 4, message: "Fail to get history from Etherscan" });
    }
  };

  return (
    <div className="main-container">
      <div className="game-board">
        {isTitleShown && (
          <div
            className="title"
            style={fadeTitle ? { opacity: 0 } : {}}
            onTransitionEnd={() => {
              setIsTitleShown(false);
            }}
          >
            <div style={{ marginTop: -150 }}>
              <img src="/images/title.png" />
            </div>
            <div
              style={{
                height: 20,
                color: "wheat",
                marginTop: 100,
                paddingBottom: 20,
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              {error?.message}
            </div>
            <button
              onClick={() => {
                connectWallet();
              }}
            >
              connect
            </button>
          </div>
        )}

        <div className="dealer">
          <img src="/images/dealer.png" />
        </div>
        <div
          className="game-state-controller"
          style={{ position: "absolute", bottom: 20 }}
        >
          <div className="game-message"></div>
          <button
            disabled={gameState == STATE.ongoing ? choice < 0 : !allowClick}
            onClick={() => {
              if (isTitleShown) return;
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
      </div>
      <div
        className="info-container"
        onClick={() => {
          setIsHistoryShown(true);
          getHistory({
            address: address,
            contractAddress: CONTRACT_ADDRESS,
            apikey: ETHERSCAN_API_KEY,
          });
        }}
      >
        <img src="/images/history.png" height={50} width={50} />
      </div>
      <div className="auth-container">
        <div style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
          {balance} Eth
        </div>
        <img
          src="/images/coin-pouch.png"
          height={50}
          width={50}
          style={{ marginBottom: -10 }}
        />
      </div>
      {isHistoryShown && (
        <div style={{ top: 0, left: 0, bottom: 0, right: 0 }}>
          <div
            className="history-background"
            onClick={() => {
              setIsHistoryShown(false);
            }}
          ></div>
          <div className="history-container">
            <div className="history-title">Transaction History</div>
            <div className="history-list">
              {history.map((tx, index) => {
                return (
                  <div style={{ width: "80%" }}>
                    <a
                      href="https://www.w3schools.com/HOWTO/howto_css_custom_scrollbar.asp"
                      target="_blank"
                      className="history-item"
                    >
                      {tx.hash}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
