import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Field } from "./Field";

export function GameBoard() {
  return (
    <View style={styles.gameBoard}>
      <View style={styles.boardContainer}>
        <View style={styles.fieldContainer}>
          <Field />
        </View>
        <View style={styles.fieldContainer}>
          <Field />
        </View>
      </View>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  gameBoard: {
    width: "100%",
    aspectRatio: 1, // Back to square aspect ratio
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
  },
  boardContainer: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
  },
  fieldContainer: {
    width: "50%",
    height: "50%",
    padding: 3, // Minimum padding to maximize grid space
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
