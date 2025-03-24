import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import { Field } from "./Field";
import { createShip, Ship, Coordinate } from "./Ship";

// Ship sizes and names in the game
const SHIPS = [
  { size: 5, name: "Carrier" },
  { size: 4, name: "Battleship" },
  { size: 3, name: "Cruiser" },
  { size: 3, name: "Submarine" },
  { size: 2, name: "Destroyer" },
];

export function GameBoard() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerShips, setPlayerShips] = useState<Ship[]>([]);
  const [shipCoordinates, setShipCoordinates] = useState<string[]>([]);

  // Generate a random coordinate (e.g., "A1", "B5")
  const generateRandomCoordinate = (): Coordinate => {
    const row = String.fromCharCode(65 + Math.floor(Math.random() * 10)); // A-J
    const col = 1 + Math.floor(Math.random() * 10); // 1-10
    return `${row}${col}`;
  };

  // Check if coordinate is valid (within grid)
  const isValidCoordinate = (coord: string): boolean => {
    const row = coord.charAt(0);
    const col = parseInt(coord.slice(1));
    return row >= "A" && row <= "J" && col >= 1 && col <= 10;
  };

  // Check if a coordinate is already occupied by another ship
  const isCoordinateOccupied = (
    coord: string,
    existingShips: Ship[]
  ): boolean => {
    return existingShips.some((ship) =>
      ship.segments.some((segment) => segment.coordinate === coord)
    );
  };

  // Generate coordinates for a ship of specified size
  const generateShipCoordinates = (
    size: number,
    existingShips: Ship[]
  ): Coordinate[] => {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      attempts++;

      // Pick a random starting point and direction
      const startCoord = generateRandomCoordinate();
      const isVertical = Math.random() > 0.5;

      // Generate all coordinates for the ship
      const coords: Coordinate[] = [startCoord];

      const startRow = startCoord.charAt(0).charCodeAt(0);
      const startCol = parseInt(startCoord.slice(1));

      let valid = true;

      // Generate the rest of the coordinates
      for (let i = 1; i < size; i++) {
        let nextCoord: Coordinate;

        if (isVertical) {
          nextCoord = `${String.fromCharCode(startRow + i)}${startCol}`;
        } else {
          nextCoord = `${String.fromCharCode(startRow)}${startCol + i}`;
        }

        // Check if the coordinate is valid and not occupied
        if (
          !isValidCoordinate(nextCoord) ||
          isCoordinateOccupied(nextCoord, existingShips)
        ) {
          valid = false;
          break;
        }

        coords.push(nextCoord);
      }

      if (valid && !isCoordinateOccupied(startCoord, existingShips)) {
        return coords;
      }
    }

    console.error("Could not place ship after max attempts");
    return [];
  };

  const placeShips = () => {
    const ships: Ship[] = [];
    const allCoordinates: string[] = [];
    const shipDetails: { name: string; coordinates: string[] }[] = [];

    // Place each ship
    for (const ship of SHIPS) {
      const coordinates = generateShipCoordinates(ship.size, ships);
      if (coordinates.length === ship.size) {
        const newShip = createShip(coordinates, ship.name);
        ships.push(newShip);
        allCoordinates.push(...coordinates);
        shipDetails.push({ name: ship.name, coordinates: [...coordinates] });
      }
    }

    setPlayerShips(ships);
    setShipCoordinates(allCoordinates);
    setGameStarted(true);

    // Log ship information using the toString method
    console.log("Ships placed:");
    ships.forEach((ship) => {
      console.log(ship.toString());
      console.log("-".repeat(30)); // Separator for better readability
    });
  };

  return (
    <View style={styles.gameBoard}>
      <View style={styles.boardContainer}>
        <View style={styles.fieldContainer}>
          <Field />
        </View>
        <View style={styles.fieldContainer}>
          <Field />
        </View>
      </View>
      <View style={styles.dividerLine} />

      {!gameStarted && (
        <TouchableOpacity style={styles.startButton} onPress={placeShips}>
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

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
    top: 20,
    left: "50%",
    transform: [{ translateX: -60 }],
    backgroundColor: "#4a90e2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: 120,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
