import { useEffect, useRef, useState, useCallback } from "react";

const GAME_WIDTH = 740;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 18;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 20;
const BALL_SPEED = 4;
const PADDLE_SPEED = 5;
const AI_SPEED = 3.5;

interface GameState {
  ballX: number;
  ballY: number;
  ballDX: number;
  ballDY: number;
  leftPaddleY: number;
  rightPaddleY: number;
  scoreLeft: number;
  scoreRight: number;
  running: boolean;
}

const starPath =
  "M10 0L12.9389 7.6738H21.0611L14.5611 12.4025L17.5 20.0763L10 15.3475L2.5 20.0763L5.43893 12.4025L-1.06107 7.6738H7.06107L10 0Z";

export function PongGame() {
  const [state, setState] = useState<GameState>({
    ballX: GAME_WIDTH / 2,
    ballY: GAME_HEIGHT / 2,
    ballDX: BALL_SPEED,
    ballDY: BALL_SPEED * 0.6,
    leftPaddleY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    rightPaddleY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    scoreLeft: 0,
    scoreRight: 0,
    running: true,
  });

  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current.add(e.key);
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.key);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const update = () => {
      setState((prev) => {
        if (!prev.running) return prev;

        const keys = keysRef.current;
        let {
          ballX,
          ballY,
          ballDX,
          ballDY,
          leftPaddleY,
          rightPaddleY,
          scoreLeft,
          scoreRight,
        } = prev;

        // Right paddle (player) - Arrow keys
        if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) {
          rightPaddleY = Math.max(0, rightPaddleY - PADDLE_SPEED);
        }
        if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) {
          rightPaddleY = Math.min(
            GAME_HEIGHT - PADDLE_HEIGHT,
            rightPaddleY + PADDLE_SPEED
          );
        }

        // Left paddle (AI)
        const leftCenter = leftPaddleY + PADDLE_HEIGHT / 2;
        if (ballY > leftCenter + 10) {
          leftPaddleY = Math.min(
            GAME_HEIGHT - PADDLE_HEIGHT,
            leftPaddleY + AI_SPEED
          );
        } else if (ballY < leftCenter - 10) {
          leftPaddleY = Math.max(0, leftPaddleY - AI_SPEED);
        }

        // Move ball
        ballX += ballDX;
        ballY += ballDY;

        // Top/bottom bounce
        if (ballY <= 0) {
          ballY = 0;
          ballDY = Math.abs(ballDY);
        }
        if (ballY >= GAME_HEIGHT - BALL_SIZE) {
          ballY = GAME_HEIGHT - BALL_SIZE;
          ballDY = -Math.abs(ballDY);
        }

        // Left paddle collision
        if (
          ballX <= 20 + PADDLE_WIDTH &&
          ballX >= 20 &&
          ballY + BALL_SIZE >= leftPaddleY &&
          ballY <= leftPaddleY + PADDLE_HEIGHT &&
          ballDX < 0
        ) {
          ballDX = Math.abs(ballDX) * 1.02;
          const hitPos =
            (ballY + BALL_SIZE / 2 - leftPaddleY) / PADDLE_HEIGHT - 0.5;
          ballDY = hitPos * BALL_SPEED * 2;
        }

        // Right paddle collision
        if (
          ballX + BALL_SIZE >= GAME_WIDTH - 20 - PADDLE_WIDTH &&
          ballX + BALL_SIZE <= GAME_WIDTH - 20 &&
          ballY + BALL_SIZE >= rightPaddleY &&
          ballY <= rightPaddleY + PADDLE_HEIGHT &&
          ballDX > 0
        ) {
          ballDX = -Math.abs(ballDX) * 1.02;
          const hitPos =
            (ballY + BALL_SIZE / 2 - rightPaddleY) / PADDLE_HEIGHT - 0.5;
          ballDY = hitPos * BALL_SPEED * 2;
        }

        // Score
        if (ballX <= 0) {
          scoreRight += 1;
          ballX = GAME_WIDTH / 2;
          ballY = GAME_HEIGHT / 2;
          ballDX = BALL_SPEED;
          ballDY = BALL_SPEED * (Math.random() - 0.5);
        }
        if (ballX >= GAME_WIDTH) {
          scoreLeft += 1;
          ballX = GAME_WIDTH / 2;
          ballY = GAME_HEIGHT / 2;
          ballDX = -BALL_SPEED;
          ballDY = BALL_SPEED * (Math.random() - 0.5);
        }

        // Clamp speed
        const maxSpeed = 10;
        ballDX = Math.max(-maxSpeed, Math.min(maxSpeed, ballDX));
        ballDY = Math.max(-maxSpeed, Math.min(maxSpeed, ballDY));

        return {
          ...prev,
          ballX,
          ballY,
          ballDX,
          ballDY,
          leftPaddleY,
          rightPaddleY,
          scoreLeft,
          scoreRight,
        };
      });

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const resetGame = () => {
    setState({
      ballX: GAME_WIDTH / 2,
      ballY: GAME_HEIGHT / 2,
      ballDX: BALL_SPEED,
      ballDY: BALL_SPEED * 0.6,
      leftPaddleY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      rightPaddleY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      scoreLeft: 0,
      scoreRight: 0,
      running: true,
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-8 text-2xl">
        <span className="text-red-500 min-w-[40px] text-center">
          {state.scoreLeft}
        </span>
        <span className="text-gray-400">:</span>
        <span className="text-emerald-400 min-w-[40px] text-center">
          {state.scoreRight}
        </span>
      </div>

      <div
        className="relative border border-black bg-gray-950 overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        tabIndex={0}
      >
        {/* Center line */}
        <div
          className="absolute top-0 w-px bg-gray-700"
          style={{
            left: GAME_WIDTH / 2,
            height: GAME_HEIGHT,
            borderLeft: "2px dashed rgba(255,255,255,0.15)",
          }}
        />

        {/* Left paddle (AI - red) */}
        <div
          className="absolute bg-red-600 rounded-sm"
          style={{
            left: 20,
            top: state.leftPaddleY,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
          }}
        />

        {/* Right paddle (player - green) */}
        <div
          className="absolute bg-emerald-400 rounded-sm"
          style={{
            left: GAME_WIDTH - 20 - PADDLE_WIDTH,
            top: state.rightPaddleY,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
          }}
        />

        {/* Ball (star) */}
        <svg
          className="absolute"
          style={{
            left: state.ballX,
            top: state.ballY,
            width: BALL_SIZE,
            height: BALL_SIZE,
          }}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d={starPath} fill="#D9D9D9" />
        </svg>
      </div>

      <div className="flex items-center gap-6 text-gray-400 text-sm">
        <span>↑↓ lub W/S — sterowanie zielonym odbijaczem</span>
        <button
          onClick={resetGame}
          className="px-4 py-1.5 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
