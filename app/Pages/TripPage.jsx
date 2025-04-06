import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const TripPage = () => {
  const navigation = useNavigation();

  const handleCreateGroup = () => {
    navigation.navigate("CreateGroupPage");
  };

  const handleJoinGroup = () => {
    //navigation.navigate("CreateGroupPage");
    console.log("Join a group clicked");
  };

  const handleTripsPlanned = () => {
    navigation.navigate("TripsPlanned");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip Planner</Text>

      <TouchableOpacity onPress={handleCreateGroup}>
        <View style={[styles.button, styles.createButton]}>
          <Text style={styles.buttonText}>Create Trip</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleJoinGroup}>
        <View style={[styles.button, styles.joinButton]}>
          <Text style={styles.buttonText}>Join Trip</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleTripsPlanned}>
        <View style={[styles.button, styles.joinButton]}>
          <Text style={styles.buttonText}>Trips Planned</Text>
        </View>
      </TouchableOpacity>
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8EAF6",
  },
  title: {
    fontSize: 40,
    fontWeight: "300",
    color: "#1A237E", 
    marginBottom: 50,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 15,
    width: 250,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },
  createButton: {
    backgroundColor: "#1A237E",
  },
  joinButton: {
    backgroundColor: "#3F51B5",
  },
  navbar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  navText: {
    fontSize: 12,
    color: "#003366",
    marginTop: 4,
  },
});

export default TripPage;
