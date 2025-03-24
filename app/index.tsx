import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Animated,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GameBoard } from "@/components/GameBoard";
import { Ship } from "@/components/Ship";

export default function GameScreen() {
  const [coordinate, setCoordinate] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isHumanTurn, setIsHumanTurn] = useState(true); // Human starts first
  const [gameStarted, setGameStarted] = useState(false);
  const [hitNotification, setHitNotification] = useState<{
    visible: boolean;
    message: string;
    shipName: string | null;
    isSunk: boolean;
  }>({ visible: false, message: "", shipName: null, isSunk: false });

  // Animation values
  const notificationOpacity = useRef(new Animated.Value(0)).current;
  const notificationScale = useRef(new Animated.Value(0.5)).current;

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

  const isValidCoordinate = (coord: string) => {
    // Check format like A1, B7, etc. (A-J and 1-10)
    const pattern = /^[A-Ja-j]([1-9]|10)$/;
    return pattern.test(coord);
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

  const handleSubmit = () => {
    if (!gameStarted) {
      setModalMessage("Please start the game first.");
      setModalVisible(true);
      return;
    }

    if (!isHumanTurn) {
      setModalMessage("It's not your turn! Please wait for the bot to play.");
      setModalVisible(true);
      return;
    }

    if (isValidCoordinate(coordinate)) {
      const normalizedCoord = coordinate.toUpperCase();

      // Check if this coordinate was already shot at
      if (
        gameBoardRef.current &&
        gameBoardRef.current.getRightFieldShots()[normalizedCoord]
      ) {
        setModalMessage(
          `You already fired at ${normalizedCoord}. Try a different coordinate.`
        );
        setModalVisible(true);
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
        }

        // Display result message
        setModalMessage(result.message);
        setModalVisible(true);

        // Clear the coordinate input
        setCoordinate("");

        // Human's turn is done, switch to bot's turn
        setIsHumanTurn(false);

        // Simulate bot's turn after a delay
        setTimeout(() => {
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
          }

          setIsHumanTurn(true); // Switch back to human turn
        }, 2000);
      } else {
        setModalMessage("Game not initialized yet. Please wait.");
        setModalVisible(true);
      }
    } else {
      setModalMessage(
        "Please enter a valid coordinate like A1, B7, etc. (A-J and 1-10)"
      );
      setModalVisible(true);
      console.error("Invalid coordinate:", coordinate);
    }
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
  const handleCellShot = (coordinate: string) => {
    // The same logic as handleSubmit but with the coordinate passed from the cell
    if (!gameStarted) {
      setModalMessage("Please start the game first.");
      setModalVisible(true);
      return;
    }

    if (!isHumanTurn) {
      setModalMessage("It's not your turn! Please wait for the bot to play.");
      setModalVisible(true);
      return;
    }

    const normalizedCoord = coordinate.toUpperCase();

    // Check if this coordinate was already shot at
    if (
      gameBoardRef.current &&
      gameBoardRef.current.getRightFieldShots()[normalizedCoord]
    ) {
      setModalMessage(
        `You already fired at ${normalizedCoord}. Try a different coordinate.`
      );
      setModalVisible(true);
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
      }

      // Display result message
      setModalMessage(result.message);
      setModalVisible(true);

      // Clear the coordinate input
      setCoordinate("");

      // Human's turn is done, switch to bot's turn
      setIsHumanTurn(false);

      // Simulate bot's turn after a delay
      setTimeout(() => {
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
        }

        setIsHumanTurn(true); // Switch back to human turn
      }, 2000);
    } else {
      setModalMessage("Game not initialized yet. Please wait.");
      setModalVisible(true);
    }
  };

  const handleGameStart = () => {
    setGameStarted(true);
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
          {isHumanTurn ? "Your Turn" : "Bot Turn"}
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

      {/* Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ThemedText style={styles.modalText}>Game Message</ThemedText>
            <ThemedText style={styles.modalMessage}>{modalMessage}</ThemedText>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(false)}
            >
              <ThemedText style={styles.buttonText}>OK</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalMessage: {
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 5,
    padding: 10,
    paddingHorizontal: 20,
    elevation: 2,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
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
});
