import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface GameState {
  isPlaying: boolean;
  score: number;
  gameOver: boolean;
  capibaraY: number;
  capibaraVelocity: number;
  obstacles: { x: number; y: number; width: number; height: number }[];
  secretCode: string | null;
}

export default function CosmicGame() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    gameOver: false,
    capibaraY: 200,
    capibaraVelocity: 0,
    obstacles: [],
    secretCode: null,
  });

  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  const GAME_SPEED = 4;
  const CAPIBARA_SIZE = 60;

  const jump = useCallback(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    setGameState((prev) => ({
      ...prev,
      capibaraVelocity: JUMP_FORCE,
    }));
  }, [gameState.isPlaying, gameState.gameOver]);

  const startGame = () => {
    setGameState({
      isPlaying: true,
      score: 0,
      gameOver: false,
      capibaraY: 200,
      capibaraVelocity: 0,
      obstacles: [],
      secretCode: null,
    });
  };

  const resetGame = () => {
    setGameState({
      isPlaying: false,
      score: 0,
      gameOver: false,
      capibaraY: 200,
      capibaraVelocity: 0,
      obstacles: [],
      secretCode: null,
    });
  };

  const generateObstacle = () => {
    const height = Math.random() * 100 + 50;
    return {
      x: 800,
      y: 350 - height,
      width: 30,
      height: height,
    };
  };

  const checkCollision = (capibaraY: number, obstacle: any) => {
    const capibaraX = 100;
    const capibaraBottom = capibaraY + CAPIBARA_SIZE;

    return (
      capibaraX < obstacle.x + obstacle.width &&
      capibaraX + CAPIBARA_SIZE > obstacle.x &&
      capibaraBottom > obstacle.y &&
      capibaraY < obstacle.y + obstacle.height
    );
  };

  const gameLoop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.gameOver) return prev;
      let newCapibaraY = prev.capibaraY + prev.capibaraVelocity;
      let newCapibaraVelocity = prev.capibaraVelocity + GRAVITY;

      // Ground collision
      if (newCapibaraY > 300) {
        newCapibaraY = 300;
        newCapibaraVelocity = 0;
      }

      // Ceiling collision
      if (newCapibaraY < 0) {
        newCapibaraY = 0;
        newCapibaraVelocity = 0;
      }

      // Move obstacles
      let newObstacles = prev.obstacles
        .map((obs) => ({
          ...obs,
          x: obs.x - GAME_SPEED,
        }))
        .filter((obs) => obs.x > -obs.width);

      // Add new obstacles
      if (
        newObstacles.length === 0 ||
        newObstacles[newObstacles.length - 1].x < 400
      ) {
        newObstacles.push(generateObstacle());
      }

      // Check collisions
      const collision = newObstacles.some((obs) =>
        checkCollision(newCapibaraY, obs),
      );
      if (collision) {
        return {
          ...prev,
          gameOver: true,
        };
      }

      // Update score
      const newScore = prev.score + 1;
      let secretCode = prev.secretCode;

      // Show secret code at 100 points
      if (newScore >= 100 && !secretCode) {
        secretCode = "КосмическаяКопибара";
      }

      return {
        ...prev,
        capibaraY: newCapibaraY,
        capibaraVelocity: newCapibaraVelocity,
        obstacles: newObstacles,
        score: newScore,
        secretCode,
      };
    });
  }, []);

  useEffect(() => {
    const animate = () => {
      gameLoop();
      animationRef.current = requestAnimationFrame(animate);
    };

    if (gameState.isPlaying && !gameState.gameOver) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop, gameState.isPlaying, gameState.gameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [jump]);

  return (
    <div className="min-h-screen bg-cosmic-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-cosmic-dark border-cosmic-purple">
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-cosmic-purple mb-2">
              🚀 Космическая Копибара
            </h1>
            <p className="text-cosmic-gray">
              Нажми ПРОБЕЛ или стрелку вверх для прыжка
            </p>
          </div>

          {/* Game Area */}
          <div
            ref={gameRef}
            className="relative w-full h-96 bg-gradient-to-b from-purple-900 to-cosmic-dark rounded-lg overflow-hidden border-2 border-cosmic-purple cursor-pointer"
            onClick={jump}
          >
            {/* Stars Background */}
            <div className="absolute inset-0 opacity-50">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Capibara */}
            <div
              className="absolute w-15 h-15 transition-all duration-75 z-10"
              style={{
                left: "100px",
                top: `${gameState.capibaraY}px`,
                transform: `rotate(${gameState.capibaraVelocity * 2}deg)`,
              }}
            >
              <img
                src="https://cdn.poehali.dev/files/28a76284-ce81-44fa-a8e2-49a784e1abd7.png"
                alt="Космическая Копибара"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>

            {/* Obstacles */}
            {gameState.obstacles.map((obstacle, index) => (
              <div
                key={index}
                className="absolute bg-gradient-to-b from-cosmic-purple to-purple-800 rounded-lg shadow-lg"
                style={{
                  left: `${obstacle.x}px`,
                  top: `${obstacle.y}px`,
                  width: `${obstacle.width}px`,
                  height: `${obstacle.height}px`,
                }}
              />
            ))}

            {/* Ground */}
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-r from-cosmic-purple to-purple-700 opacity-80" />

            {/* Score */}
            <div className="absolute top-4 left-4 text-white text-xl font-bold">
              Очки: {gameState.score}
            </div>

            {/* Secret Code */}
            {gameState.secretCode && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cosmic-purple bg-opacity-90 p-6 rounded-lg text-center animate-pulse">
                <div className="text-white text-2xl font-bold mb-2">
                  🎉 Секретный код! 🎉
                </div>
                <div className="text-yellow-300 text-3xl font-bold">
                  {gameState.secretCode}
                </div>
              </div>
            )}

            {/* Game Over */}
            {gameState.gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white text-3xl font-bold mb-4">
                    Игра окончена!
                  </div>
                  <div className="text-cosmic-gray text-xl mb-6">
                    Очки: {gameState.score}
                  </div>
                  <Button
                    onClick={resetGame}
                    className="bg-cosmic-purple hover:bg-purple-600 text-white"
                  >
                    <Icon name="RotateCcw" className="mr-2 h-4 w-4" />
                    Играть снова
                  </Button>
                </div>
              </div>
            )}

            {/* Start Screen */}
            {!gameState.isPlaying && !gameState.gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-white text-3xl font-bold mb-4">
                    Готов к космическому приключению?
                  </div>
                  <Button
                    onClick={startGame}
                    className="bg-cosmic-purple hover:bg-purple-600 text-white text-lg px-8 py-3"
                  >
                    <Icon name="Rocket" className="mr-2 h-5 w-5" />
                    Поехали!
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-6 text-center">
            <div className="flex justify-center space-x-4">
              <Button
                onClick={jump}
                disabled={!gameState.isPlaying || gameState.gameOver}
                className="bg-cosmic-purple hover:bg-purple-600 text-white"
              >
                <Icon name="ArrowUp" className="mr-2 h-4 w-4" />
                Прыжок
              </Button>
              <Button
                onClick={resetGame}
                variant="outline"
                className="border-cosmic-purple text-cosmic-purple hover:bg-cosmic-purple hover:text-white"
              >
                <Icon name="RotateCcw" className="mr-2 h-4 w-4" />
                Сброс
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
