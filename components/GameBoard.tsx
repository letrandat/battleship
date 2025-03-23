import React from "react";
import { StyleSheet, View } from "react-native";

export function GameBoard() {
  return (
    <View style={styles.gameBoard}>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  gameBoard: {
    width: "100%",
    aspectRatio: 1,
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
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
});
