import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const TripsPlanned = () => {
  const navigation = useNavigation();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setErrorMsg('Please log in to view planned trips');
          setIsLoading(false);
          navigation.navigate('Login');
          return;
        }

        const response = await fetch('https://trip-sync-xi.vercel.app/api/trips/mytrips', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const fetchedTrips = await response.json();
          setTrips(fetchedTrips);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch trips');
        }
      } catch (error) {
        console.log('Error fetching trips:', error);
        setErrorMsg(error.message || 'Could not fetch planned trips');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [navigation]);

  const renderTripItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => navigation.navigate('TripDetails', { trip: item })}
    >
      <View style={styles.tripHeader}>
        <MaterialIcons name="location-on" size={24} color="#1A237E" />
        <Text style={styles.destinationText}>
          {item.destination || 'Unknown Destination'}
        </Text>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={20} color="#1A237E" />
          <Text style={styles.detailText}>
            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="group" size={20} color="#1A237E" />
          <Text style={styles.detailText}>
            {item.participants.map(p => p.name).join(', ') || 'No participants'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Planned Trips</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#1A237E" />
      ) : errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : trips.length === 0 ? (
        <Text style={styles.noTripsText}>No planned trips found</Text>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTripItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
        />
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
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1A237E',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  destinationText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1A237E',
    marginLeft: 10,
  },
  tripDetails: {
    marginLeft: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#3F51B5',
    marginLeft: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
  },
  noTripsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default TripsPlanned;