// Filename: app/home.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import PagerView from "react-native-pager-view";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import Navbar from "../components/Navbar.jsx";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const router = useRouter();
  const [location, setLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [errorMsg, setErrorMsg] = useState("");

  const pastTrips = [
    { id: "1", name: "Beach Getaway 2024", location: "Malibu" },
    { id: "2", name: "Mountain Adventure", location: "Colorado" },
    { id: "3", name: "City Exploration", location: "New York" },
  ];
  useEffect(() => {
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
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TripSync!</Text>
      <Text style={styles.subtitle}>Plan, Sync & Travel Together.</Text>

      {/* Carousel for Past Trips */}
      <View style={styles.carouselContainer}>
        <Text style={styles.carouselTitle}>Past Trips</Text>
        <PagerView style={styles.pagerView} initialPage={0}>
          {pastTrips.map((trip) => (
            <View style={styles.page} key={trip.id}>
              <Text style={styles.tripName}>{trip.name}</Text>
              <Text style={styles.tripLocation}>{trip.location}</Text>
            </View>
          ))}
        </PagerView>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("Create a Group Clicked")}
      >
        <Text style={styles.buttonText}>Create a Group</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("Join a group clicked")}
      >
        <Text style={styles.buttonText}>Join a Group</Text>
      </TouchableOpacity>

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
      <Navbar />
    </View>
  );
};

export default HomeScreen;

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
  mapContainer: {
    width: "80%",
    height: 150,
    marginVertical: 10,
    borderRadius: 12, // Softer corners
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0", // Light gray border for definition
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapLoadingText: {
    fontSize: 16,
    color: "#555",
  },
});
