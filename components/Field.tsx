import React from "react";
import { StyleSheet, View, Text } from "react-native";

export function Field() {
  // Create a 10x10 grid of squares with coordinates
  const renderSquares = () => {
    const rows = [];
    for (let r = 0; r < 10; r++) {
      const cells = [];
      for (let c = 0; c < 10; c++) {
        if (r === 0 && c > 0) {
          // Top row for numeric coordinates (1-10)
          cells.push(
            <View key={`${r}-${c}`} style={styles.square}>
              <Text style={styles.coordinateText}>{c}</Text>
            </View>
          );
        } else if (c === 0) {
          // First column for letter coordinates (A-J)
          const letter = String.fromCharCode(65 + r); // 'A' starts at 65 in ASCII
          cells.push(
            <View key={`${r}-${c}`} style={styles.square}>
              <Text style={styles.coordinateText}>{letter}</Text>
            </View>
          );
        } else {
          // Regular grid cells
          cells.push(<View key={`${r}-${c}`} style={styles.square} />);
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
    height: "10%",
  },
  square: {
    width: "10%",
    height: "100%",
    borderWidth: 0.5,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  coordinateText: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
