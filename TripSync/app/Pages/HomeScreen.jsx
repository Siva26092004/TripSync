import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import PagerView from "react-native-pager-view";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [pastTrips, setPastTrips] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupCode, setGroupCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // Fetch user location
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();

    // Fetch past trips
    const fetchPastTrips = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          setErrorMsg("Please log in to view past trips");
          setIsLoadingTrips(false);
          navigation.navigate("Login");
          return;
        }

        const response = await fetch("https://trip-sync-xi.vercel.app/api/trips/mytrips", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const trips = await response.json();
          const formattedTrips = trips.map((trip) => ({
            id: trip._id || String(Date.now() + Math.random()),
            name: trip.title || "Untitled Trip",
            location: trip.destination || "Unknown Location",
          }));
          setPastTrips(formattedTrips);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch trips");
        }
      } catch (error) {
        console.log("Error fetching trips:", error);
        setErrorMsg(error.message || "Could not fetch past trips");
      } finally {
        setIsLoadingTrips(false);
      }
    };

    fetchPastTrips();
  }, [navigation]);

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) {
      Alert.alert("Error", "Please enter a group code");
      return;
    }
    console.log("called",groupCode);

    setIsJoining(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      console.log(token);
      if (!token) {
        Alert.alert("Error", "Please log in to join a group");
        setModalVisible(false);
        navigation.navigate("Login");
        return;
      }

      const response = await fetch("https://trip-sync-xi.vercel.app/api/trips/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ groupCode }),
      });
      

      if (response.ok) {
        console.log(response);
        const updatedTrip = await response.json();
        Alert.alert("Success", "You have joined the trip successfully!");
        setModalVisible(false);
        setGroupCode("");
          // Optionally refresh past trips
          const fetchPastTrips = async () => {
            try {
              const tripsResponse = await fetch("https://trip-sync-xi.vercel.app/api/trips/mytrips", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
              });
              if (tripsResponse.ok) {
                const trips = await tripsResponse.json();
                const formattedTrips = trips.map((trip) => ({
                  id: trip._id || String(Date.now() + Math.random()),
                  name: trip.title || "Untitled Trip",
                  location: trip.destination || "Unknown Location",
                }));
                setPastTrips(formattedTrips);
              }
            } catch (error) {
              console.log("Error refreshing trips:", error);
            }
          };
          fetchPastTrips();
      
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid group code");
      }
    } catch (error) {
      console.log("Error joining group:", error);
      Alert.alert("Error", error.message || "Could not join the group");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TripSync!</Text>
      <Text style={styles.subtitle}>Plan, Sync & Travel Together.</Text>

      {/* Carousel for Past Trips */}
      <View style={styles.carouselContainer}>
        <Text style={styles.carouselTitle}>Past Trips</Text>
        {isLoadingTrips ? (
          <ActivityIndicator size="large" color="#003366" />
        ) : errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : pastTrips.length === 0 ? (
          <Text style={styles.noTripsText}>No past trips found</Text>
        ) : (
          <PagerView style={styles.pagerView} initialPage={0}>
            {pastTrips.map((trip) => (
              <View style={styles.page} key={trip.id}>
                <Text style={styles.tripName}>{trip.name}</Text>
                <Text style={styles.tripLocation}>{trip.location}</Text>
              </View>
            ))}
          </PagerView>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateGroupPage")}
      >
        <Text style={styles.buttonText}>Create a Group</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Join a Group</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join a Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Group Code"
              value={groupCode}
              onChangeText={setGroupCode}
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.joinButton]}
                onPress={handleJoinGroup}
                disabled={isJoining}
              >
                <Text style={styles.buttonText}>
                  {isJoining ? "Joining..." : "Join"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={location}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            <Marker coordinate={location} title="Your Location" />
          </MapView>
        ) : (
          <Text style={styles.mapLoadingText}>
            {errorMsg || "Loading map..."}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#003366",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: "#555",
  },
  carouselContainer: {
    width: "100%",
    height: 200,
    marginBottom: 30,
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    marginLeft: 20,
    marginBottom: 10,
  },
  pagerView: {
    flex: 1,
    width: "100%",
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 150,
  },
  tripName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 5,
  },
  tripLocation: {
    fontSize: 16,
    color: "#555",
  },
  button: {
    backgroundColor: "#003366",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  mapContainer: {
    width: "80%",
    height: 150,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapLoadingText: {
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
  },
  noTripsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#9FA8DA",
  },
  joinButton: {
    backgroundColor: "#003366",
  },
});

export default HomeScreen;