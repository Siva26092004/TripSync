import React from 'react'
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default Navbar = () => {
    const navigation = useNavigation();
  return (
          <View style={styles.navbar}>
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => navigation.navigate("HomeScreen")}
            >
              <Ionicons name="home" size={24} color="#003366" />
              <Text style={styles.navText}>Home</Text>
            </TouchableOpacity>
    
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => navigation.navigate('TripPage')}
            >
              <Ionicons name="airplane" size={24} color="#003366" />
              <Text style={styles.navText}>Trips</Text>
            </TouchableOpacity>
    
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => console.log("communiy clicked")}
            >
              <Ionicons name="people" size={24} color="#003366" />
              <Text style={styles.navText}>Community</Text>
            </TouchableOpacity>
    
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => navigation.navigate('UserProfile')}
            >
              <Ionicons name="person" size={24} color="#003366" />
              <Text style={styles.navText}>Profile</Text>
            </TouchableOpacity>
          </View>
  )
}



const styles = StyleSheet.create({
 
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
})