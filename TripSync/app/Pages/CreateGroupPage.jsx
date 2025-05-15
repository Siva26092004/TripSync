import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileIcon from '../components/ProfileIcon';

const CreateGroupPage = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerLocation, setMarkerLocation] = useState(null);
  const [markerLocationName, setMarkerLocationName] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const API_URL = 'http://192.168.43.32:5000'; // Local server

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to use this feature.');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        const current = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setCurrentLocation(current);
        setRegion(current);
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Failed to get current location');
      }
    })();

    // Fetch friends
    const fetchFriends = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Error', 'No authentication token found. Please log in.');
          navigation.navigate('AuthScreen');
          return;
        }

        const response = await fetch(`${API_URL}/api/friend/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setFriends(data);
        } else {
          console.error('Fetch friends error:', data);
          Alert.alert('Error', data.error || 'Failed to fetch friends');
        }
      } catch (error) {
        console.error('Fetch friends exception:', error);
        Alert.alert('Error', 'Network error while fetching friends');
      }
    };
    fetchFriends();
  }, [navigation]);

  const handleMapPress = async (e) => {
    const newLocation = e.nativeEvent.coordinate;
    setMarkerLocation(newLocation);
    setIsLoadingLocation(true);
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
      });
      if (response[0]) {
        const address = response[0];
        const locationName = [
          address.street,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');
        setMarkerLocationName(locationName);
        setDestination(locationName);
      } else {
        setMarkerLocationName('Location name unavailable');
        setDestination('Location name unavailable');
      }
    } catch (error) {
      console.error('Geocode error:', error);
      setMarkerLocationName('Location name unavailable');
      setDestination('Location name unavailable');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSaveTrip = async (start = false) => {
    if (!title || !destination) {
      Alert.alert('Missing Information', 'Please fill in title and destination');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No authentication token found. Please log in.');
        navigation.navigate('AuthScreen');
        return;
      }

      const tripData = { title, destination };

      // Create trip
      console.log('Creating trip with data:', tripData);
      const response = await fetch(`${API_URL}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Create trip error:', errorData);
        throw new Error(errorData.error || 'Failed to create trip');
      }

      const newTrip = await response.json();
      console.log('Trip created:', newTrip);

      // Add selected friends as participants
      for (const friendId of selectedFriends) {
        console.log(`Adding participant: ${friendId}`);
        const participantResponse = await fetch(
          `${API_URL}/api/trips/${newTrip._id}/participants`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: friendId }),
          }
        );

        if (!participantResponse.ok) {
          const errorData = await participantResponse.json();
          console.error('Add participant error:', errorData);
          throw new Error(errorData.error || `Failed to add participant ${friendId}`);
        }
      }

      // Start trip if requested
      if (start) {
        console.log('Starting trip:', newTrip._id);
        const startResponse = await fetch(`${API_URL}/api/trips/${newTrip._id}/start`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!startResponse.ok) {
          const errorData = await startResponse.json();
          console.error('Start trip error:', errorData);
          throw new Error(errorData.error || 'Failed to start trip');
        }
      }

      Alert.alert('Success', start ? 'Trip started!' : 'Trip saved!');
      navigation.navigate('MainTabs', { screen: 'TripPage' });
    } catch (error) {
      console.error('Save trip exception:', error);
      Alert.alert('Error', error.message || 'Could not create trip');
    }
  };

  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={[styles.friendItem, selectedFriends.includes(item._id) && styles.selectedFriend]}
      onPress={() => toggleFriendSelection(item._id)}
    >
      {item.profilePhoto ? (
        <Image source={{ uri: item.profilePhoto }} style={styles.friendPhoto} />
      ) : (
        <View style={[styles.friendPhoto, styles.placeholder]} />
      )}
      <Text style={styles.friendName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.content}>
            <ProfileIcon />
            <Text style={styles.title}>Create New Trip</Text>
          </View>
        );
      case 'titleInput':
        return (
          <TextInput
            style={styles.input}
            placeholder="Trip Title"
            value={title}
            onChangeText={setTitle}
          />
        );
      case 'map':
        return (
          <>
            <Text style={styles.sectionTitle}>
              {isLoadingLocation
                ? 'Getting location name...'
                : markerLocation
                ? `Selected: ${markerLocationName || 'Unnamed location'}`
                : 'Tap to mark location'}
            </Text>
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {markerLocation && (
                <Marker
                  coordinate={markerLocation}
                  pinColor="#1A237E"
                  title={markerLocationName || 'Selected Location'}
                />
              )}
            </MapView>
          </>
        );
      case 'friends':
        return (
          <>
            <Text style={styles.sectionTitle}>Add Friends</Text>
            <FlatList
              data={friends}
              renderItem={renderFriend}
              keyExtractor={(item) => item._id}
              style={styles.friendsList}
              ListEmptyComponent={<Text style={styles.noFriendsText}>No friends found</Text>}
            />
          </>
        );
      case 'buttons':
        return (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.createButton, styles.saveButton]}
              onPress={() => handleSaveTrip(false)}
            >
              <Text style={styles.buttonText}>Save Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => handleSaveTrip(true)}
            >
              <Text style={styles.buttonText}>Start Trip</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const data = [
    { type: 'header', id: 'header' },
    { type: 'titleInput', id: 'titleInput' },
    { type: 'map', id: 'map' },
    { type: 'friends', id: 'friends' },
    { type: 'buttons', id: 'buttons' },
  ];

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1A237E',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 20,
    fontSize: 16,
    color: '#1A237E',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1A237E',
    marginBottom: 10,
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  friendsList: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
  selectedFriend: {
    backgroundColor: '#C5CAE9',
  },
  friendPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
  friendName: {
    fontSize: 16,
    color: '#1A237E',
  },
  placeholder: {
    backgroundColor: '#ccc',
  },
  noFriendsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  createButton: {
    backgroundColor: '#1A237E',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#3F51B5',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CreateGroupPage;