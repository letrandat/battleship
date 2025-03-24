import React from "react";
import { StyleSheet, View, Text, ViewStyle } from "react-native";
import { ShipSegment } from "./Ship";

type ShotInfo = {
  result: "hit" | "miss";
  isSunk: boolean;
  shipName?: string;
};

type CellProps = {
  row: number;
  col: number;
  segment?: ShipSegment & {
    shipName?: string;
    isHead?: boolean;
    isTail?: boolean;
    isVertical?: boolean;
    isShipSunk?: boolean;
  };
  shotInfo?: ShotInfo | null;
  isCoordinateLabel?: boolean;
  sunkShips?: string[];
};

export function Cell({
  row,
  col,
  segment,
  shotInfo,
  isCoordinateLabel,
  sunkShips = [],
}: CellProps) {
  // Get color for ship segment based on ship name
  const getShipColor = (shipName?: string): string => {
    const SHIP_COLORS = {
      Carrier: "rgba(70, 130, 180, 0.3)", // Steel Blue
      Battleship: "rgba(60, 179, 113, 0.3)", // Medium Sea Green
      Cruiser: "rgba(147, 112, 219, 0.3)", // Medium Purple
      Submarine: "rgba(255, 165, 0, 0.3)", // Orange
      Destroyer: "rgba(255, 99, 71, 0.3)", // Tomato
      default: "rgba(100, 149, 237, 0.3)", // Default Light Blue
    };

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
  const renderHitMarker = (shipName?: string, isShipSunk: boolean = false) => {
    return (
      <View style={styles.hitContainer}>
        {renderStar()}
        <View style={styles.explosionOuter} />
        <View style={styles.explosionInner} />
        {/* Only show ship name initial if the ship is sunk */}
        {isShipSunk && shipName && (
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

  // Handle coordinate label cells
  if (isCoordinateLabel) {
    let label = "";
    if (row === 10 && col > 0) {
      // Bottom row for numeric coordinates (1-10)
      label = col.toString();
    } else if (col === 0 && row < 10) {
      // First column for letter coordinates (A-J)
      label = String.fromCharCode(65 + row);
    }

    return (
      <View style={styles.square}>
        <Text style={styles.coordinateText}>{label}</Text>
      </View>
    );
  }

  // Handle regular grid cells
  let squareStyle: ViewStyle = { ...styles.square };
  let content = null;

  if (segment) {
    const isShipSunk =
      !!segment.isShipSunk ||
      !!(segment.shipName && sunkShips.includes(segment.shipName));

    if (segment.status === "damaged" || shotInfo?.result === "hit") {
      // Bright red for hit/damaged segments
      squareStyle.backgroundColor = "rgba(255, 0, 0, 0.9)";
      // Enhanced hit marker with ship info only shown if ship is sunk
      content = renderHitMarker(segment.shipName, isShipSunk);
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
  } else if (shotInfo?.result === "miss") {
    // Show miss marker
    content = renderMissMarker();
  }

  return <View style={squareStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  square: {
    width: `100%`,
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
