import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function GameScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Battleship</ThemedText>
      <View style={styles.gameBoard}>
        {/* Game board will be implemented here */}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  gameBoard: {
    width: "100%",
    aspectRatio: 1,
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
});
