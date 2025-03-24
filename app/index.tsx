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
  const [isHumanTurn, setIsHumanTurn] = useState(true); // Human starts first

  const isValidCoordinate = (coord: string) => {
    // Check format like A1, B7, etc. (A-J and 1-10)
    const pattern = /^[A-Ja-j]([1-9]|10)$/;
    return pattern.test(coord);
  };

  const handleSubmit = () => {
    if (!isHumanTurn) {
      setModalMessage("It's not your turn! Please wait for the bot to play.");
      setModalVisible(true);
      return;
    }

    if (isValidCoordinate(coordinate)) {
      console.log("Valid coordinate entered:", coordinate);
      // Human's turn is done, switch to bot's turn
      setIsHumanTurn(false);

      // Simulate bot's turn after a delay
      setTimeout(() => {
        console.log("Bot played its turn");
        setIsHumanTurn(true); // Switch back to human turn
      }, 2000);
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
      <View style={styles.statusContainer}>
        <ThemedText
          style={[
            styles.statusText,
            isHumanTurn ? styles.activeStatus : styles.inactiveStatus,
          ]}
        >
          {isHumanTurn ? "Your Turn" : "Bot Turn"}
        </ThemedText>
      </View>

      <View style={styles.headerContainer}>
        <TextInput
          style={styles.input}
          value={coordinate}
          onChangeText={setCoordinate}
          placeholder="Enter coordinate (e.g., A5)"
          editable={isHumanTurn} // Only allow input during human's turn
        />
        <Button
          title="Boom"
          onPress={handleSubmit}
          color="red"
          disabled={!isHumanTurn} // Disable button during bot's turn
        />
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
            <ThemedText style={styles.modalText}>Game Message</ThemedText>
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
  statusContainer: {
    marginBottom: 15,
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  activeStatus: {
    color: "green",
  },
  inactiveStatus: {
    color: "red",
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
