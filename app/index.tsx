import React, { useState } from "react";
import { StyleSheet, View, TextInput, Button } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GameBoard } from "@/components/GameBoard";

export default function GameScreen() {
  const [gameName, setGameName] = useState("Battleship");

  const handleSubmit = () => {
    // Handle the submission of the text
    console.log("Game name submitted:", gameName);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <TextInput
          style={styles.input}
          value={gameName}
          onChangeText={setGameName}
          placeholder="Location"
        />
        <Button title="Boom" onPress={handleSubmit} color="red" />
      </View>
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    flex: 1,
    backgroundColor: "white",
  },
});
