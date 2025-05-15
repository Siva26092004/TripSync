import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const TripsPlanned = () => {
  const navigation = useNavigation();
  const [trips, setTrips] = useState([]);
  const API_URL = 'http://192.168.43.32:5000';

  const fetchTrips = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No authentication token found. Please log in.');
        navigation.navigate('AuthScreen');
        return;
      }
      const response = await fetch(`${API_URL}/api/trips/mytrips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Fetched trips (TripsPlanned):', data);
        setTrips(data);
      } else {
        console.error('Trips fetch error:', data);
        throw new Error(data.error || 'Failed to fetch trips');
      }
    } catch (error) {
      console.error('Fetch trips exception:', error);
      Alert.alert('Error', error.message || 'Failed to load trips');
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleStartTrip = async (tripId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/trips/${tripId}/start`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Started trip:', data);
        fetchTrips(); // Refresh trips
        Alert.alert('Success', 'Trip started!');
      } else {
        console.error('Start trip error:', data);
        throw new Error(data.error || 'Failed to start trip');
      }
    } catch (error) {
      console.error('Start trip exception:', error);
      Alert.alert('Error', error.message);
    }
  };

  const refreshTrips = () => {
    fetchTrips();
  };

  const renderTrip = ({ item }) => (
    <View style={styles.tripItem}>
      <Text style={styles.tripTitle}>{item.title}</Text>
      <Text style={styles.tripDetails}>Destination: {item.destination}</Text>
      <Text style={styles.tripDetails}>Status: {item.status}</Text>
      <Text style={styles.tripDetails}>Group Code: {item.groupCode}</Text>
      {item.status === 'planned' && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => handleStartTrip(item._id)}
        >
          <Text style={styles.buttonText}>Start Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.refreshButton} onPress={refreshTrips}>
        <Text style={styles.buttonText}>Refresh Trips</Text>
      </TouchableOpacity>
      {trips.length > 0 ? (
        <FlatList
          data={trips}
          renderItem={renderTrip}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.noTripsText}>No trips found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
    padding: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  tripItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1A237E',
    marginBottom: 5,
  },
  tripDetails: {
    fontSize: 16,
    color: '#1A237E',
    marginBottom: 5,
  },
  startButton: {
    backgroundColor: '#1A237E',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  refreshButton: {
    backgroundColor: '#3F51B5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  noTripsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TripsPlanned;