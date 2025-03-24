import React from "react";
import { StyleSheet, View, Text, ViewStyle } from "react-native";
import { ShipSegment } from "./Ship";

// Constants for grid size
const NUM_ROWS = 11;
const NUM_COLS = 11;

// Ship color mapping
const SHIP_COLORS = {
  Carrier: "rgba(70, 130, 180, 0.3)", // Steel Blue
  Battleship: "rgba(60, 179, 113, 0.3)", // Medium Sea Green
  Cruiser: "rgba(147, 112, 219, 0.3)", // Medium Purple
  Submarine: "rgba(255, 165, 0, 0.3)", // Orange
  Destroyer: "rgba(255, 99, 71, 0.3)", // Tomato
  default: "rgba(100, 149, 237, 0.3)", // Default Light Blue
};

type FieldProps = {
  shipSegments?: (ShipSegment & { shipName?: string })[];
};

export function Field({ shipSegments = [] }: FieldProps) {
  // Helper to find segment at specific coordinate
  const findSegmentAt = (
    row: number,
    col: number
  ): (ShipSegment & { shipName?: string }) | undefined => {
    if (row >= NUM_ROWS - 1 || col === 0) return undefined; // Skip labels

    const letter = String.fromCharCode(65 + row); // Convert 0-9 to A-J
    const coordinate = `${letter}${col}`;

    return shipSegments.find((segment) => segment.coordinate === coordinate);
  };

  // Get color for ship segment based on ship name
  const getShipColor = (shipName?: string): string => {
    if (!shipName) return SHIP_COLORS.default;
    return (
      SHIP_COLORS[shipName as keyof typeof SHIP_COLORS] || SHIP_COLORS.default
    );
  };

  // Create a 10x10 grid of squares with coordinates
  const renderSquares = () => {
    const rows = [];
    for (let r = 0; r < NUM_ROWS; r++) {
      const cells = [];
      for (let c = 0; c < NUM_COLS; c++) {
        if (r === NUM_ROWS - 1 && c > 0) {
          // Bottom row for numeric coordinates (1-10)
          cells.push(
            <View key={`${r}-${c}`} style={styles.square}>
              <Text style={styles.coordinateText}>{c}</Text>
            </View>
          );
        } else if (c === 0 && r !== NUM_ROWS - 1) {
          // First column for letter coordinates (A-J)
          const letter = String.fromCharCode(65 + r); // 'A' starts at 65 in ASCII
          cells.push(
            <View key={`${r}-${c}`} style={styles.square}>
              <Text style={styles.coordinateText}>{letter}</Text>
            </View>
          );
        } else {
          // Regular grid cells - check if there's a ship segment here
          const segment = findSegmentAt(r, c);

          let squareStyle: ViewStyle = { ...styles.square };

          if (segment) {
            if (segment.status === "damaged") {
              squareStyle.backgroundColor = "rgba(255, 0, 0, 0.7)"; // Red for damaged
            } else {
              // Apply custom color based on ship name
              squareStyle.backgroundColor = getShipColor(segment.shipName);
            }
          }

          cells.push(<View key={`${r}-${c}`} style={squareStyle} />);
        }
      }
      rows.push(
        <View key={`row-${r}`} style={styles.row}>
          {cells}
        </View>
      );
    }
    return rows;
  };

  return <View style={styles.field}>{renderSquares()}</View>;
}

const styles = StyleSheet.create({
  field: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f8f8f8",
    borderRadius: 2,
  },
  row: {
    flexDirection: "row",
    height: `${100 / NUM_ROWS}%`,
  },
  square: {
    width: `${100 / NUM_COLS}%`,
    height: "100%",
    borderWidth: 0.5,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  coordinateText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  damagedSegment: {
    backgroundColor: "rgba(255, 0, 0, 0.7)", // Red with some transparency
  },
});
