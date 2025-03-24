import React from "react";
import { StyleSheet, View } from "react-native";

type ShipProps = {
  length: 2 | 3 | 4 | 5;
  isVertical?: boolean;
};

export function Ship({ length, isVertical = false }: ShipProps) {
  const renderShipSegments = () => {
    const segments = [];
    for (let i = 0; i < length; i++) {
      segments.push(
        <View
          key={`segment-${i}`}
          style={[
            styles.segment,
            i === 0 && (isVertical ? styles.topSegment : styles.leftSegment),
            i === length - 1 &&
              (isVertical ? styles.bottomSegment : styles.rightSegment),
          ]}
        />
      );
    }
    return segments;
  };

  return (
    <View
      style={[styles.ship, isVertical ? styles.vertical : styles.horizontal]}
    >
      {renderShipSegments()}
    </View>
  );
}

const styles = StyleSheet.create({
  ship: {
    backgroundColor: "#555",
  },
  horizontal: {
    flexDirection: "row",
  },
  vertical: {
    flexDirection: "column",
  },
  segment: {
    width: 30,
    height: 30,
    backgroundColor: "#555",
    borderWidth: 1,
    borderColor: "#333",
  },
  leftSegment: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  rightSegment: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  topSegment: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bottomSegment: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});
