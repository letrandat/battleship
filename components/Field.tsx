import React from "react";
import { StyleSheet, View } from "react-native";

export function Field() {
  // Create a 10x10 grid of squares
  const renderSquares = () => {
    const rows = [];
    for (let i = 0; i < 11; i++) {
      const cells = [];
      for (let j = 0; j < 11; j++) {
        cells.push(<View key={`${i}-${j}`} style={styles.square} />);
      }
      rows.push(
        <View key={`row-${i}`} style={styles.row}>
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
    height: "10%",
  },
  square: {
    width: "10%",
    height: "100%",
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
});
