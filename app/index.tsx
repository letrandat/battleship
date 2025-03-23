import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GameBoard } from "@/components/GameBoard";

export default function GameScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Battleship</ThemedText>
      <GameBoard />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
});
