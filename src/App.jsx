import React, { useState, useEffect } from 'react';
import foodSoundEffect from './sounds/point.mp3';
import gameOverSoundEffect from './sounds/gameover.mp3'; // Game over sound effect

const INITIAL_SNAKE = [{ x: 2, y: 2 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

const App = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0); // Score state
  const [speed, setSpeed] = useState(null); // Speed state (set when button is clicked)
  const [muted, setMuted] = useState(false); // State for mute toggle
  const handleMuteToggle = () => setMuted((prevMuted) => !prevMuted);
  const [increasedS, setIncreasedS] = useState(false);

  const MAX_ROWS = 15;
  const MAX_COLS = 15;

  const [boardSize, setBoardSize] = useState({ rows: MAX_ROWS, cols: MAX_COLS });
  const [cellSize, setCellSize] = useState(20);

  // Sound effect for eating food
  const foodSound = new Audio(foodSoundEffect); 
  const gameOverSound = new Audio(gameOverSoundEffect); // Game over sound instance

  const handleGameOver = () => {
    if (!muted) gameOverSound.play(); // Play game over sound if not muted
    if (increasedS) setIncreasedS(false);
    setGameOver(true);
  };

  useEffect(() => {
    foodSound.volume = muted ? 0 : 1; // Set volume based on mute state
    gameOverSound.volume = muted ? 0 : 1;
  }, [muted]);

  const isSnakeCell = (x, y) => {
    return snake.some(segment => segment.x === x && segment.y === y);
  };

  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const newCellSize = Math.min(width, height) / Math.max(MAX_ROWS, MAX_COLS);
    setCellSize(Math.min(newCellSize, 20));
    setBoardSize({ rows: MAX_ROWS, cols: MAX_COLS });
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generateFoodPosition = () => {
    let newFoodPosition;
    while (!newFoodPosition || isSnakeCell(newFoodPosition.x, newFoodPosition.y)) {
      newFoodPosition = {
        x: Math.floor(Math.random() * boardSize.cols),
        y: Math.floor(Math.random() * boardSize.rows),
      };
    }
    return newFoodPosition;
  };

  const [food, setFood] = useState(generateFoodPosition);

  const checkWallCollision = (head) => {
    return head.x < 0 || head.x >= boardSize.cols || head.y < 0 || head.y >= boardSize.rows;
  };

  const checkSelfCrossing = (newHead, prevSnake) => {
    // Check if the new head is in the path of the body (excluding the next segment)
    const bodySegments = prevSnake.slice(1); // Exclude the head
    const isOverlapping = bodySegments.some(segment => segment.x === newHead.x && segment.y === newHead.y);

    // Optional: Debug log for understanding collisions
    //console.log('New Head:', newHead, 'Body:', bodySegments, 'Overlap:', isOverlapping);

    return isOverlapping;
  };

  useEffect(() => {
    if (!gameStarted || gamePaused || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const newHead = {
          x: prevSnake[0].x + direction.x,
          y: prevSnake[0].y + direction.y,
        };

        if (checkWallCollision(newHead) || checkSelfCrossing(newHead, prevSnake)) {
          handleGameOver(); // Trigger game over sound and state
          clearInterval(intervalId);
          return prevSnake;
        }

        const hasEatenFood = newHead.x === food.x && newHead.y === food.y;
        const newSnake = hasEatenFood ? [newHead, ...prevSnake] : [newHead, ...prevSnake.slice(0, -1)];

        if (hasEatenFood) {
          setFood(generateFoodPosition());
          setScore((prevScore) => prevScore + 1); // Increment score when food is eaten
          if (increasedS) setSpeed(speed - 10);
          //console.log(speed);
          if (!muted) foodSound.play(); // Play food sound if not muted
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, speed); // Use speed state for interval timing
    return () => clearInterval(intervalId);
  }, [direction, food, gameStarted, gamePaused, gameOver, speed, boardSize, muted]);

  const handleKeyDown = (event) => {
    event.preventDefault();
    switch (event.key) {
    
      case 'w':
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case 's':
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case 'd':
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case 'a':
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
      case 'p':
        setGamePaused(true);
        break;
      case 'r':
        setGamePaused(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStarted, gameOver]);

  const handleStartGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFoodPosition());
    setGameStarted(true);
    setGamePaused(false);
    setGameOver(false);
    setScore(0); // Reset score
  };

  const boardStyle = {
    display: 'grid',
    gridTemplateRows: `repeat(${boardSize.rows}, ${cellSize}px)`,
    gridTemplateColumns: `repeat(${boardSize.cols}, ${cellSize}px)`,
    gap: '0',
    backgroundColor: 'lightgreen',
    width: `${boardSize.cols * cellSize}px`,
    height: `${boardSize.rows * cellSize}px`,
    border: '2px solid darkgreen',
    boxSizing: 'content-box',
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    flexDirection: 'column',
    backgroundColor: 'lightblue',
    overflow: 'hidden',
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  };

  const muteButtonStyle = {
    position: 'absolute',
    top: '20px', // Move it slightly down for more visibility
    right: '20px', // Move it slightly to the left for balance
    zIndex: 10,
    padding: '15px 20px', // Increase padding for larger clickable area
    backgroundColor: muted ? 'red' : 'green', // Stronger colors: red for mute, green for unmute
    color: 'white', // White text for contrast
    border: 'none',
    borderRadius: '10px', // More rounded corners for a polished look
    cursor: 'pointer',
    fontSize: '18px', // Bigger font size
    fontWeight: 'bold', // Bold text for emphasis
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)', // Add shadow for depth
    transition: 'background-color 0.3s ease, transform 0.2s ease', // Smooth color change and scaling
  };

  return (
    <div style={containerStyle}>
      <h1>Snake Game</h1>
       {/* Mute Button */}
       <button style={muteButtonStyle} onClick={handleMuteToggle}  
       onMouseDown={(e) => (e.target.style.transform = 'scale(0.95)')} // Add a slight click effect
        onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}>
        {muted ? 'Unmute' : 'Mute'}
      </button>
        <div>
          <div style={buttonContainerStyle}>
            <button
              onClick={() => {
                setSpeed(200); // Normal speed
                handleStartGame();
              }}
              style={{ padding: '10px' }}
            >
              Normal Speed
            </button>
            <button
              onClick={() => {
                setSpeed(100); // Fast speed
                handleStartGame();
              }}
              style={{ padding: '10px' }}
            >
              Fast Speed
            </button>
            <button
              onClick={() => {
                setSpeed(200); // Normal speed at the beginning
                handleStartGame();
                setIncreasedS(true);
              }}
              style={{ padding: '10px' }}
            >
              Increasing speed
            </button>
          </div>
        </div>
      {gameOver && (
        <div>
          <p>Game Over! Your Score: {score}</p>
        </div>
      )}
      {gamePaused && !gameOver && (
        <div>
          <p>Game Paused! Press 'r' to resume</p>
        </div>
      )}
      <div style={{ marginBottom: '10px', fontSize: '18px', color: 'darkgreen' }}>
        Score: {score} {/* Display score above the board */}
      </div>
      <div style={boardStyle}>
        {Array.from({ length: boardSize.rows * boardSize.cols }, (_, i) => {
          const x = i % boardSize.cols;
          const y = Math.floor(i / boardSize.cols);
          const isSnake = isSnakeCell(x, y);
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: isSnake ? 'green' : isFood ? 'red' : 'lightgreen',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default App;
