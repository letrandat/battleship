import React from "react";
import { StyleSheet, View } from "react-native";

export function Field() {
  // Create a 10x10 grid of squares
  const renderSquares = () => {
    const squares = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        squares.push(<View key={`${i}-${j}`} style={styles.square} />);
      }
    }
    return squares;
  };

  return <View style={styles.field}>{renderSquares()}</View>;
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
  },
  square: {
    width: "10%",
    height: "10%",
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
});
