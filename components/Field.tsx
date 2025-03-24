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
  shipSegments?: (ShipSegment & {
    shipName?: string;
    isHead?: boolean;
    isTail?: boolean;
    isVertical?: boolean;
  })[];
  shots?: { [key: string]: "hit" | "miss" };
};

export function Field({ shipSegments = [], shots = {} }: FieldProps) {
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
      })
    | undefined => {
    if (row >= NUM_ROWS - 1 || col === 0) return undefined; // Skip labels

    const letter = String.fromCharCode(65 + row); // Convert 0-9 to A-J
    const coordinate = `${letter}${col}`;

    return shipSegments.find((segment) => segment.coordinate === coordinate);
  };

  // Check if a coordinate has been shot at
  const getShotStatus = (row: number, col: number): "hit" | "miss" | null => {
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

  // Render a 5-point star
  const renderStar = () => {
    return (
      <View style={styles.starContainer}>
        <View style={styles.star}>
          <View
            style={[styles.starPoint, { transform: [{ rotate: "0deg" }] }]}
          />
          <View
            style={[styles.starPoint, { transform: [{ rotate: "72deg" }] }]}
          />
          <View
            style={[styles.starPoint, { transform: [{ rotate: "144deg" }] }]}
          />
          <View
            style={[styles.starPoint, { transform: [{ rotate: "216deg" }] }]}
          />
          <View
            style={[styles.starPoint, { transform: [{ rotate: "288deg" }] }]}
          />
        </View>
      </View>
    );
  };

  // Render an enhanced hit marker with explosion effect
  const renderHitMarker = (shipName?: string) => {
    return (
      <View style={styles.hitContainer}>
        {renderStar()}
        <View style={styles.explosionOuter} />
        <View style={styles.explosionInner} />
        {shipName && (
          <Text style={styles.hitShipName}>{shipName.charAt(0)}</Text>
        )}
      </View>
    );
  };

  // Render a miss marker (circle with X)
  const renderMissMarker = () => {
    return (
      <View style={styles.missContainer}>
        <View style={styles.missCircle}>
          <View style={styles.missX1} />
          <View style={styles.missX2} />
        </View>
      </View>
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
          const shotStatus = getShotStatus(r, c);

          let squareStyle: ViewStyle = { ...styles.square };
          let content = null;

          if (segment) {
            if (segment.status === "damaged" || shotStatus === "hit") {
              squareStyle.backgroundColor = "rgba(255, 0, 0, 0.9)"; // Brighter red for damaged
              content = renderHitMarker(segment.shipName); // Enhanced hit marker with ship info
            } else {
              // Apply custom color based on ship name
              squareStyle.backgroundColor = getShipColor(segment.shipName);

              // Add indicators for head and tail
              if (segment.isHead) {
                if (segment.isVertical) {
                  content = <View style={styles.verticalHeadIndicator} />;
                } else {
                  content = <View style={styles.horizontalHeadIndicator} />;
                }
              } else if (segment.isTail) {
                content = <View style={styles.tailIndicator} />;
              }
            }
          } else if (shotStatus === "miss") {
            // Show miss marker
            content = renderMissMarker();
          }

          cells.push(
            <View key={`${r}-${c}`} style={squareStyle}>
              {content}
            </View>
          );
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
  verticalHeadIndicator: {
    width: 24,
    height: 24,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    transform: [{ rotate: "45deg" }],
    marginTop: -6, // Shift up slightly to indicate upward direction
  },
  horizontalHeadIndicator: {
    width: 24,
    height: 24,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    transform: [{ rotate: "45deg" }],
    marginLeft: -6, // Shift left slightly to indicate leftward direction
  },
  tailIndicator: {
    width: "60%",
    height: "60%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 3,
  },
  starContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  star: {
    width: 22,
    height: 22,
    position: "relative",
  },
  starPoint: {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 22,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "yellow",
    left: 0,
    top: 0,
  },
  hitContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  explosionOuter: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 100, 0, 0.6)",
  },
  explosionInner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 220, 0, 0.8)",
  },
  hitShipName: {
    position: "absolute",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  missContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  missCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "navy",
    justifyContent: "center",
    alignItems: "center",
  },
  missX1: {
    position: "absolute",
    width: 16,
    height: 2,
    backgroundColor: "navy",
    transform: [{ rotate: "45deg" }],
  },
  missX2: {
    position: "absolute",
    width: 16,
    height: 2,
    backgroundColor: "navy",
    transform: [{ rotate: "-45deg" }],
  },
});
