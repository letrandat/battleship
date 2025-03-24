import React from "react";
import { StyleSheet, View } from "react-native";
import { ShipSegment, SHIP_COLORS } from "./Ship";
import { Cell } from "./Cell";

// Constants for grid size
const NUM_ROWS = 11;
const NUM_COLS = 11;

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
  onCellShot?: (coordinate: string) => void;
  isHumanTurn?: boolean;
  gameStarted?: boolean;
  isRightField?: boolean;
};

export function Field({
  shipSegments = [],
  shots = {},
  sunkShips = [],
  onCellShot,
  isHumanTurn = false,
  gameStarted = false,
  isRightField = false,
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
              onCellShot={onCellShot}
              isHumanTurn={isHumanTurn}
              gameStarted={gameStarted}
              isRightField={isRightField}
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
