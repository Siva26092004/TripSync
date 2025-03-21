import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import tripsData from '../utils/tripsData';
const TripsPlanned = () => {
  const trips = tripsData;

  const renderTripItem = ({ item }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <MaterialIcons name="location-on" size={24} color="#1A237E" />
        <Text style={styles.destinationText}>
          {item.destinationName}
        </Text>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="directions-bike" size={20} color="#1A237E" />
          <Text style={styles.detailText}>{item.travelMode}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="group" size={20} color="#1A237E" />
          <Text style={styles.detailText}>{item.members.join(', ')}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={20} color="#1A237E" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Planned Trips</Text>
      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
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
});

export default TripsPlanned;
