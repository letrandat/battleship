import React from "react";
import { StyleSheet, View } from "react-native";
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
    aspectRatio: 1,
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    position: "relative",
  },
  boardContainer: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
  },
  fieldContainer: {
    flex: 1,
    padding: 10,
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
