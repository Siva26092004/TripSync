import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Card, Divider } from "react-native-paper";

const UserProfile = () => {
  const [user, setUser] = useState({
    name: "John Doe",
    phone: "9876543210",
    vehicleType: "Bike",
    vehicleNumber: "TN 01 AB 1234",
    location: "Chennai",
    profilePic: "https://via.placeholder.com/100",
    joinedDate: "March 2024",
  });

  const [editing, setEditing] = useState(false);
  const [tempUser, setTempUser] = useState(user);

  const handleSave = () => {
    setUser(tempUser);
    setEditing(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setTempUser({ ...tempUser, profilePic: result.assets[0].uri });
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        {editing ? (
          <View>
            <Text style={styles.heading}>Edit Profile</Text>

            {/* Profile Picture */}
            <TouchableOpacity onPress={pickImage}>
              <Image source={{ uri: tempUser.profilePic }} style={styles.profileImage} />
              <Text style={styles.changePhoto}>Change Photo</Text>
            </TouchableOpacity>

            {/* Editable Fields with Labels */}
            {[
              { key: "name", label: "👤 Name" },
              { key: "phone", label: "📞 Mobile" },
              { key: "location", label: "📍 Location" },
              { key: "vehicleType", label: "🏍 Vehicle Type" },
              { key: "vehicleNumber", label: "🔢 Vehicle Number" },
            ].map(({ key, label }) => (
              <View key={key} style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{label}:</Text>
                <TextInput
                  style={styles.input}
                  value={tempUser[key]}
                  onChangeText={(text) => setTempUser({ ...tempUser, [key]: text })}
                  placeholder={`Enter ${label}`}
                />
              </View>
            ))}

            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Profile Picture */}
            <Image source={{ uri: user.profilePic }} style={styles.profileImage} />

            {/* Name */}
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.joinedDate}>Joined {user.joinedDate}</Text>

            <Divider style={styles.divider} />

            {/* User Info Display */}
            <Text style={styles.infoText}>📞 Mobile: {user.phone}</Text>
            <Text style={styles.infoText}>📍 Location: {user.location}</Text>
            <Text style={styles.infoText}>🏍 Vehicle Type: {user.vehicleType}</Text>
            <Text style={styles.infoText}>🔢 Vehicle Number: {user.vehicleNumber}</Text>

            <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changePhoto: {
    color: "blue",
    textAlign: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  joinedDate: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 10,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  infoText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 3,
  },
  editButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  editButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default UserProfile;