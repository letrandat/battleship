import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { GameBoard } from "@/components/GameBoard";

export default function GameScreen() {
  const [coordinate, setCoordinate] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const isValidCoordinate = (coord: string) => {
    // Check format like A1, B7, etc. (A-J and 1-10)
    const pattern = /^[A-Ja-j]([1-9]|10)$/;
    return pattern.test(coord);
  };

  const handleSubmit = () => {
    if (isValidCoordinate(coordinate)) {
      console.log("Valid coordinate entered:", coordinate);
    } else {
      setModalMessage(
        "Please enter a valid coordinate like A1, B7, etc. (A-J and 1-10)"
      );
      setModalVisible(true);
      console.error("Invalid coordinate:", coordinate);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <TextInput
          style={styles.input}
          value={coordinate}
          onChangeText={setCoordinate}
          placeholder="Enter coordinate (e.g., A5)"
        />
        <Button title="Boom" onPress={handleSubmit} color="red" />
      </View>
      <GameBoard />

      {/* Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ThemedText style={styles.modalText}>Invalid Coordinate</ThemedText>
            <ThemedText style={styles.modalMessage}>{modalMessage}</ThemedText>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(false)}
            >
              <ThemedText style={styles.buttonText}>OK</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalMessage: {
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 5,
    padding: 10,
    paddingHorizontal: 20,
    elevation: 2,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
