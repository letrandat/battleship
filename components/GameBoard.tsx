import React, { useState, forwardRef, useImperativeHandle } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Field } from "./Field";
import { Ship } from "./Ship";
import { generatePlayerShips } from "../utils/shipUtils";

type GameBoardProps = {
  onGameStart?: () => void;
  isHumanTurn?: boolean;
  onCellShot?: (coordinate: string, isHit: boolean) => void;
};

export const GameBoard = forwardRef<any, GameBoardProps>(
  ({ onGameStart, isHumanTurn = true, onCellShot }, ref) => {
    const [gameStarted, setGameStarted] = useState(false);
    const [leftPlayerShips, setLeftPlayerShips] = useState<Ship[]>([]);
    const [rightPlayerShips, setRightPlayerShips] = useState<Ship[]>([]);
    const [leftShipCoordinates, setLeftShipCoordinates] = useState<string[]>(
      []
    );
    const [rightShipCoordinates, setRightShipCoordinates] = useState<string[]>(
      []
    );
    const [showRightShips, setShowRightShips] = useState(false);
    const [rightFieldShots, setRightFieldShots] = useState<{
      [key: string]: {
        result: "hit" | "miss";
        isSunk: boolean;
        shipName?: string;
      };
    }>({});
    const [leftFieldShots, setLeftFieldShots] = useState<{
      [key: string]: {
        result: "hit" | "miss";
        isSunk: boolean;
        shipName?: string;
      };
    }>({});
    const [sunkRightShips, setSunkRightShips] = useState<string[]>([]);
    const [sunkLeftShips, setSunkLeftShips] = useState<string[]>([]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getRightPlayerShips: () => rightPlayerShips,
      getLeftPlayerShips: () => leftPlayerShips,
      recordShot: (
        coordinate: string,
        result: "hit" | "miss",
        isPlayerShot: boolean,
        isSunk: boolean = false,
        shipName?: string
      ) => {
        // Record shots on the appropriate field
        if (isPlayerShot) {
          // Player shot at the right field
          setRightFieldShots((prev) => ({
            ...prev,
            [coordinate]: {
              result,
              isSunk,
              shipName: isSunk ? shipName : undefined,
            },
          }));

          // If a ship was sunk, add it to the list of sunk ships
          if (isSunk && shipName && !sunkRightShips.includes(shipName)) {
            setSunkRightShips((prev) => {
              const newSunkShips = [...prev, shipName];
              // Check for player victory (all 5 enemy ships sunk)
              if (newSunkShips.length === 5) {
                console.log("🎮 GAME OVER: You've won! All enemy ships are destroyed!");
                alert("You've won! All enemy ships are destroyed!");
              }
              return newSunkShips;
            });
            console.log(`💥 SHIP SUNK: Player has sunk the enemy's ${shipName}!`);
          }
        } else {
          // Bot shot at the left field
          setLeftFieldShots((prev) => ({
            ...prev,
            [coordinate]: {
              result,
              isSunk,
              shipName: isSunk ? shipName : undefined,
            },
          }));

          // If a ship was sunk, add it to the list of sunk ships
          if (isSunk && shipName && !sunkLeftShips.includes(shipName)) {
            setSunkLeftShips((prev) => {
              const newSunkShips = [...prev, shipName];
              // Check for bot victory (all 5 player ships sunk)
              if (newSunkShips.length === 5) {
                console.log("🎮 GAME OVER: Bot has won! All your ships are destroyed!");
                alert("Game over! The enemy has destroyed all your ships!");
              }
              return newSunkShips;
            });
            console.log(`💥 SHIP SUNK: Enemy has sunk your ${shipName}!`);
          }
        }
      },
      getRightFieldShots: () => {
        // Convert the complex shot info back to simple hit/miss for compatibility
        const simpleShots: { [key: string]: "hit" | "miss" } = {};
        Object.entries(rightFieldShots).forEach(([coord, info]) => {
          simpleShots[coord] = info.result;
        });
        return simpleShots;
      },
      getLeftFieldShots: () => {
        // Convert the complex shot info back to simple hit/miss for compatibility
        const simpleShots: { [key: string]: "hit" | "miss" } = {};
        Object.entries(leftFieldShots).forEach(([coord, info]) => {
          simpleShots[coord] = info.result;
        });
        return simpleShots;
      },
      getSunkRightShips: () => sunkRightShips,
      getSunkLeftShips: () => sunkLeftShips,
    }));

    const placeShips = () => {
      // Generate ships for left player
      const leftShips = generatePlayerShips();
      const leftCoordinates = leftShips.flatMap((ship) =>
        ship.segments.map((segment) => segment.coordinate)
      );

      // Generate ships for right player
      const rightShips = generatePlayerShips();
      const rightCoordinates = rightShips.flatMap((ship) =>
        ship.segments.map((segment) => segment.coordinate)
      );

      setLeftPlayerShips(leftShips);
      setRightPlayerShips(rightShips);
      setLeftShipCoordinates(leftCoordinates);
      setRightShipCoordinates(rightCoordinates);
      setGameStarted(true);

      // Reset sunk ships
      setSunkLeftShips([]);
      setSunkRightShips([]);

      // Notify parent component that game has started
      if (onGameStart) {
        onGameStart();
      }

      /* 
      // Log ship information
      console.log("Left player ships:");
      leftShips.forEach((ship) => {
        console.log(ship.toString());
        console.log("-".repeat(30));
      });

      console.log("Right player ships:");
      rightShips.forEach((ship) => {
        console.log(ship.toString());
        console.log("-".repeat(30));
      });
      */
    };

    // Get hit ships to always display, even when showRightShips is false
    const getVisibleRightShipSegments = () => {
      if (showRightShips) {
        // Show all ships
        return rightPlayerShips.flatMap((ship) =>
          ship.segments.map((segment, index, array) => ({
            ...segment,
            shipName: ship.name,
            isHead: index === 0,
            isTail: index === array.length - 1,
            isVertical: ship.isVertical,
            isShipSunk: sunkRightShips.includes(ship.name),
          }))
        );
      } else {
        // Only show ships that have been hit
        return rightPlayerShips.flatMap((ship) => {
          const isShipSunk = sunkRightShips.includes(ship.name);

          return ship.segments
            .filter(
              (segment) =>
                // Show if segment is damaged or if ship is completely sunk
                segment.status === "damaged" || isShipSunk
            )
            .map((segment, _, array) => ({
              ...segment,
              shipName: ship.name,
              // Only show head/tail when ship is fully sunk
              isHead: isShipSunk ? ship.segments.indexOf(segment) === 0 : false,
              isTail: isShipSunk
                ? ship.segments.indexOf(segment) === ship.segments.length - 1
                : false,
              isVertical: ship.isVertical,
              isShipSunk,
            }));
        });
      }
    };

    // Function to handle cell shots on the right field (opponent's field)
    const handleRightFieldShot = (coordinate: string) => {
      // Only allow shots if it's the player's turn and the game has started
      if (!isHumanTurn || !gameStarted) return;

      // Check if this coordinate was already shot at
      if (rightFieldShots[coordinate]) return;

      // Check if the shot is a hit
      const isHit = rightShipCoordinates.includes(coordinate);

      // Call the parent component's handler with hit information
      if (onCellShot) {
        onCellShot(coordinate, isHit);
      }
    };

    return (
      <View style={styles.gameBoard}>
        <View style={styles.boardContainer}>
          <View style={styles.fieldContainer}>
            <Field
              shipSegments={leftPlayerShips.flatMap((ship) =>
                ship.segments.map((segment, index, array) => ({
                  ...segment,
                  shipName: ship.name,
                  isHead: index === 0, // First segment is the head
                  isTail: index === array.length - 1, // Last segment is the tail
                  isVertical: ship.isVertical, // Pass the ship orientation
                  isShipSunk: sunkLeftShips.includes(ship.name),
                }))
              )}
              shots={leftFieldShots}
              sunkShips={sunkLeftShips}
              isHumanTurn={isHumanTurn}
              gameStarted={gameStarted}
              isRightField={false}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Field
              shipSegments={getVisibleRightShipSegments()}
              shots={rightFieldShots}
              sunkShips={sunkRightShips}
              onCellShot={handleRightFieldShot}
              isHumanTurn={isHumanTurn}
              gameStarted={gameStarted}
              isRightField={true}
            />
          </View>
        </View>
        <View style={styles.dividerLine} />

        {!gameStarted && (
          <TouchableOpacity style={styles.startButton} onPress={placeShips}>
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        )}

        {gameStarted && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowRightShips(!showRightShips)}
          >
            <Text style={styles.buttonText}>
              {showRightShips ? "Hide" : "Show"} Opponent's Ships
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  gameBoard: {
    width: "100%",
    aspectRatio: 1, // Back to square aspect ratio
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
  },
  boardContainer: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
  },
  fieldContainer: {
    width: "50%",
    height: "50%",
    padding: 3, // Minimum padding to maximize grid space
    position: "relative",
  },
  dividerLine: {
    position: "absolute",
    width: 2,
    height: "100%",
    backgroundColor: "red",
    left: "50%",
    transform: [{ translateX: -1 }],
  },
  startButton: {
    position: "absolute",
    top: "25%",
    left: "50%",
    transform: [{ translateX: -100 }, { translateY: -30 }],
    backgroundColor: "#4a90e2",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24,
  },
  toggleButton: {
    position: "absolute",
    top: 0,
    right: 10,
    backgroundColor: "rgba(244, 67, 54, 0.8)",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: "center",
  },
});
