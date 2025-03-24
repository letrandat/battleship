import React from "react";
import { StyleSheet, View } from "react-native";
import { ShipSegment } from "./Ship";
import { Cell } from "./Cell";

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

type ShotInfo = {
  result: "hit" | "miss";
  isSunk: boolean;
  shipName?: string;
};

type FieldProps = {
  shipSegments?: (ShipSegment & {
    shipName?: string;
    isHead?: boolean;
    isTail?: boolean;
    isVertical?: boolean;
    isShipSunk?: boolean;
  })[];
  shots?: { [key: string]: ShotInfo };
  sunkShips?: string[];
};

export function Field({
  shipSegments = [],
  shots = {},
  sunkShips = [],
}: FieldProps) {
  // Helper to find segment at specific coordinate
  const findSegmentAt = (
    row: number,
    col: number
  ):
    | (ShipSegment & {
        shipName?: string;
        isHead?: boolean;
        isTail?: boolean;
        isVertical?: boolean;
        isShipSunk?: boolean;
      })
    | undefined => {
    if (row >= NUM_ROWS - 1 || col === 0) return undefined; // Skip labels

    const letter = String.fromCharCode(65 + row); // Convert 0-9 to A-J
    const coordinate = `${letter}${col}`;

    return shipSegments.find((segment) => segment.coordinate === coordinate);
  };

  // Check if a coordinate has been shot at
  const getShotInfo = (row: number, col: number): ShotInfo | null => {
    if (row >= NUM_ROWS - 1 || col === 0) return null; // Skip labels

    const letter = String.fromCharCode(65 + row); // Convert 0-9 to A-J
    const coordinate = `${letter}${col}`;

    return shots[coordinate] || null;
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
        const isCoordinateLabel =
          (r === NUM_ROWS - 1 && c > 0) || (c === 0 && r !== NUM_ROWS - 1);
        const segment = findSegmentAt(r, c);
        const shotInfo = getShotInfo(r, c);

        cells.push(
          <View
            key={`${r}-${c}`}
            style={{ width: `${100 / NUM_COLS}%`, height: "100%" }}
          >
            <Cell
              row={r}
              col={c}
              segment={segment}
              shotInfo={shotInfo}
              isCoordinateLabel={isCoordinateLabel}
              sunkShips={sunkShips}
            />
          </View>
        );
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
});
