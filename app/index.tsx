import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Animated, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GameBoard } from "@/components/GameBoard";
import { Ship } from "@/components/Ship";

export default function GameScreen() {
  const [isHumanTurn, setIsHumanTurn] = useState(true); // Human starts first
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [hitNotification, setHitNotification] = useState<{
    visible: boolean;
    message: string;
    shipName: string | null;
    isSunk: boolean;
  }>({ visible: false, message: "", shipName: null, isSunk: false });

  // Animation values
  const notificationOpacity = useRef(new Animated.Value(0)).current;
  const notificationScale = useRef(new Animated.Value(0.5)).current;
  const gameOverOpacity = useRef(new Animated.Value(0)).current;
  const gameOverScale = useRef(new Animated.Value(0.5)).current;

  const gameBoardRef = useRef<any>(null);

  // Handle hit notification animation
  useEffect(() => {
    if (hitNotification.visible) {
      // Reset animation values
      notificationOpacity.setValue(0);
      notificationScale.setValue(0.5);

      // Animate in
      Animated.parallel([
        Animated.timing(notificationOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(notificationScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after delay
      const timer = setTimeout(() => {
        Animated.timing(notificationOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setHitNotification((prev) => ({ ...prev, visible: false }));
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [hitNotification.visible]);

  // Check after each shot if the game is over
  useEffect(() => {
    if (gameBoardRef.current) {
      const sunkRightShips = gameBoardRef.current.getSunkRightShips();
      const sunkLeftShips = gameBoardRef.current.getSunkLeftShips();
      
      if (sunkRightShips.length === 5) {
        // Player won
        setGameOver(true);
        setGameOverMessage("Victory! You've destroyed all enemy ships!");
        animateGameOver();
      } else if (sunkLeftShips.length === 5) {
        // Bot won
        setGameOver(true);
        setGameOverMessage("Defeat! All your ships have been destroyed!");
        animateGameOver();
      }
    }
  }, [gameBoardRef.current?.getSunkRightShips(), gameBoardRef.current?.getSunkLeftShips()]);

  // Animate game over message
  const animateGameOver = () => {
    // Reset animation values
    gameOverOpacity.setValue(0);
    gameOverScale.setValue(0.5);

    // Animate in
    Animated.parallel([
      Animated.timing(gameOverOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(gameOverScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkForHit = (coord: string, botShips: Ship[]) => {
    // Normalize coordinate to uppercase
    const normalizedCoord = coord.toUpperCase();

    // Check if any ship segment is at this coordinate
    for (const ship of botShips) {
      const hitSegmentIndex = ship.segments.findIndex(
        (segment) => segment.coordinate === normalizedCoord
      );

      if (hitSegmentIndex >= 0) {
        // Found a hit!
        const shipSegment = ship.segments[hitSegmentIndex];
        // Mark segment as damaged
        shipSegment.status = "damaged";

        // Check if the ship is now completely destroyed
        const isSunk = ship.isDestroyed;

        // Only reveal ship name if it's sunk
        let hitMessage = isSunk
          ? `HIT and SUNK! You've completely destroyed the enemy's ${ship.name}!`
          : "HIT! You struck an enemy ship!";

        return {
          hit: true,
          message: hitMessage,
          shipName: ship.name,
          isSunk: isSunk,
        };
      }
    }

    // No hit found
    return {
      hit: false,
      message: "MISS! Your shot didn't hit any ships.",
      shipName: null,
      isSunk: false,
    };
  };

  // Generate a random coordinate for the bot's shot
  const generateBotShot = (): string | null => {
    if (!gameBoardRef.current) return null;

    const existingShots = gameBoardRef.current.getLeftFieldShots();
    let attempts = 0;

    while (attempts < 100) {
      // Generate random row (A-J) and column (1-10)
      const row = String.fromCharCode(65 + Math.floor(Math.random() * 10));
      const col = 1 + Math.floor(Math.random() * 10);
      const coord = `${row}${col}`;

      // Check if this coordinate hasn't been targeted yet
      if (!existingShots[coord]) {
        return coord;
      }

      attempts++;
    }

    // If we reach here, couldn't find a new coordinate (unlikely)
    console.error("Bot couldn't find a valid shot coordinate");
    return null;
  };

  // Check if the bot's shot hit any player ships
  const checkBotShot = (coord: string, playerShips: Ship[]) => {
    // Normalize coordinate
    const normalizedCoord = coord.toUpperCase();

    // Check if any ship segment is at this coordinate
    for (const ship of playerShips) {
      const hitSegmentIndex = ship.segments.findIndex(
        (segment) => segment.coordinate === normalizedCoord
      );

      if (hitSegmentIndex >= 0) {
        // Found a hit!
        const shipSegment = ship.segments[hitSegmentIndex];
        // Mark segment as damaged
        shipSegment.status = "damaged";

        // Check if the ship is completely destroyed
        const isSunk = ship.isDestroyed;

        return {
          hit: true,
          shipName: ship.name,
          isSunk: isSunk,
        };
      }
    }

    // No hit found
    return {
      hit: false,
      shipName: null,
      isSunk: false,
    };
  };

  // Function to handle shots from cell clicks
  const handleCellShot = (coordinate: string, isHit: boolean) => {
    if (!gameStarted || !isHumanTurn || gameOver) {
      return;
    }

    const normalizedCoord = coordinate.toUpperCase();

    // Check if this coordinate was already shot at
    if (
      gameBoardRef.current &&
      gameBoardRef.current.getRightFieldShots()[normalizedCoord]
    ) {
      return;
    }

    if (gameBoardRef.current) {
      const botShips = gameBoardRef.current.getRightPlayerShips();
      const result = checkForHit(normalizedCoord, botShips);

      // Record the shot in the game board
      gameBoardRef.current.recordShot(
        normalizedCoord,
        result.hit ? "hit" : "miss",
        true, // true means it's the player's shot
        result.isSunk, // pass whether the ship is sunk
        result.shipName // pass the ship name (only used if isSunk is true)
      );

      // Show hit notification if it's a hit
      if (result.hit) {
        setHitNotification({
          visible: true,
          message: result.message,
          shipName: result.shipName,
          isSunk: result.isSunk,
        });

        // Log detailed information if a ship was sunk
        if (result.isSunk) {
          console.log(`🎯 PLAYER ACTION: Sunk enemy ${result.shipName} ship at coordinate ${normalizedCoord}!`);
        }

        // Player gets to go again after a hit
        return;
      }

      // Human's turn is done, switch to bot's turn
      setIsHumanTurn(false);

      // Simulate bot's turn after a delay
      setTimeout(() => {
        handleBotTurn();
      }, 2000);
    }
  };

  // Function to handle bot's turn
  const handleBotTurn = () => {
    if (!gameBoardRef.current || gameOver) return;

    let botContinuesTurn = true;

    while (botContinuesTurn) {
      // Bot makes a random shot
      const botShot = generateBotShot();
      if (botShot) {
        const playerShips = gameBoardRef.current.getLeftPlayerShips();
        const botShotResult = checkBotShot(botShot, playerShips);

        // Record bot's shot
        gameBoardRef.current.recordShot(
          botShot,
          botShotResult.hit ? "hit" : "miss",
          false, // false means it's the bot's shot
          botShotResult.isSunk,
          botShotResult.shipName
        );

        console.log(
          `Bot fired at ${botShot}: ${botShotResult.hit ? "HIT" : "MISS"}${
            botShotResult.isSunk ? " and SUNK!" : ""
          }`
        );

        // Add more detailed log if a ship was sunk
        if (botShotResult.isSunk) {
          console.log(`🎯 BOT ACTION: Sunk player's ${botShotResult.shipName} ship at coordinate ${botShot}!`);
        }

        // Bot continues turn if it was a hit
        botContinuesTurn = botShotResult.hit;

        // Add a small delay between bot's multiple shots
        if (botContinuesTurn) {
          // We'll break the loop and use setTimeout to continue the bot's turn
          // This creates a visible delay between multiple bot shots
          botContinuesTurn = false;
          setTimeout(() => {
            handleBotTurn();
          }, 1500);
          return;
        }
      } else {
        botContinuesTurn = false;
      }
    }

    // Bot's turn is over, switch back to human
    setIsHumanTurn(true);
  };

  const handleGameStart = () => {
    setGameStarted(true);
  };

  // Function to restart the game
  const handleRestartGame = () => {
    // Reset game states
    setGameOver(false);
    setGameOverMessage("");
    setGameStarted(false);
    setIsHumanTurn(true);
    setHitNotification({ visible: false, message: "", shipName: null, isSunk: false });
    
    // Reset the game board (will trigger a new ship placement when "Start Game" is pressed)
    if (gameBoardRef.current) {
      // Re-render the GameBoard which will reset its internal state
      gameBoardRef.current = null;
      setTimeout(() => {
        setGameStarted(false);
      }, 0);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.statusContainer}>
        <ThemedText
          style={[
            styles.statusText,
            isHumanTurn ? styles.activeStatus : styles.inactiveStatus,
          ]}
        >
          {gameOver ? "Game Over" : (isHumanTurn ? "Your Turn" : "Bot Turn")}
        </ThemedText>
      </View>

      <GameBoard
        ref={gameBoardRef}
        onGameStart={handleGameStart}
        isHumanTurn={isHumanTurn}
        onCellShot={handleCellShot}
      />

      {/* Hit Notification */}
      {hitNotification.visible && (
        <Animated.View
          style={[
            styles.hitNotification,
            {
              opacity: notificationOpacity,
              transform: [{ scale: notificationScale }],
            },
          ]}
        >
          <ThemedText style={styles.hitNotificationText}>
            {hitNotification.message}
          </ThemedText>
        </Animated.View>
      )}

      {/* Game Over Message */}
      {gameOver && (
        <Animated.View
          style={[
            styles.gameOverNotification,
            {
              opacity: gameOverOpacity,
              transform: [{ scale: gameOverScale }],
            },
          ]}
        >
          <ThemedText style={styles.gameOverText}>
            {gameOverMessage}
          </ThemedText>
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={handleRestartGame}
          >
            <ThemedText style={styles.restartButtonText}>
              Play Again
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  statusContainer: {
    marginBottom: 15,
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  activeStatus: {
    color: "green",
  },
  inactiveStatus: {
    color: "red",
  },
  hitNotification: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    padding: 15,
    borderRadius: 10,
    minWidth: "70%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  hitNotificationText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 22,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  gameOverNotification: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    padding: 25,
    borderRadius: 15,
    minWidth: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2,
    borderColor: "gold",
  },
  gameOverText: {
    color: "gold",
    fontWeight: "bold",
    fontSize: 28,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 15,
    borderWidth: 2,
    borderColor: "white",
  },
  restartButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 22,
  },
});
