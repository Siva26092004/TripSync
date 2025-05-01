import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateGroupPage = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerLocation, setMarkerLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [markerLocationName, setMarkerLocationName] = useState('');
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [isStartDate, setIsStartDate] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to use this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const current = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setCurrentLocation(current);
      setRegion(current);
    })();
  }, []);

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
          address.country
        ].filter(Boolean).join(', ');
        
        setMarkerLocationName(locationName);
        setDestination(locationName);
      }
    } catch (error) {
      console.log('Error getting location name:', error);
      setMarkerLocationName('Location name unavailable');
      setDestination('Location name unavailable');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const formatDateTime = (date) => {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  const handleTimeChange = (hours, minutes) => {
    const newDate = new Date(tempDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setTempDate(newDate);
  };

  const handleDateChange = (date) => {
    const newDate = new Date(date);
    newDate.setHours(tempDate.getHours());
    newDate.setMinutes(tempDate.getMinutes());
    setTempDate(newDate);
  };

  const handleDateTimeConfirm = () => {
    if (isStartDate) {
      setStartDate(tempDate);
    } else {
      setEndDate(tempDate);
    }
    setShowDateTimeModal(false);
  };

  const handleCreateTrip = async () => {
    if (!title || !destination || !startDate || !endDate) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Invalid Dates', 'End date must be after start date');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log(token);
     /* if (!token) {
        Alert.alert('Authentication Error', 'No token found. Please log in.');
        navigation.navigate('Login'); // Redirect to login screen
        return;
      }*/

      const tripData = {
        title,
        destination,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const response = await fetch('http://192.168.58.32:5000/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
      });

      if (response.ok) {
        const newTrip = await response.json();
        console.log(newTrip);
       // navigation.navigate('TripsPlanned', { newTrip });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create trip');
      }
    } catch (error) {
      console.log('Error creating trip:', error);
      Alert.alert('Error', error.message || 'Could not create trip. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Trip</Text>

        <TextInput
          style={styles.input}
          placeholder="Trip Title"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateTimeText}>
            Start: {formatDateTime(startDate)}
          </Text>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => {
              setTempDate(new Date(startDate));
              setIsStartDate(true);
              setShowDateTimeModal(true);
            }}
          >
            <Text style={styles.buttonText}>Change Start Date</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateTimeText}>
            End: {formatDateTime(endDate)}
          </Text>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => {
              setTempDate(new Date(endDate));
              setIsStartDate(false);
              setShowDateTimeModal(true);
            }}
          >
            <Text style={styles.buttonText}>Change End Date</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showDateTimeModal}
          onRequestClose={() => setShowDateTimeModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select {isStartDate ? 'Start' : 'End'} Date and Time</Text>
              
              <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerLabel}>Date:</Text>
                <View style={styles.dateInputs}>
                  <TouchableOpacity 
                    style={styles.dateInput}
                    onPress={() => {
                      const date = new Date(tempDate);
                      date.setDate(date.getDate() + 1);
                      handleDateChange(date);
                    }}
                  >
                    <Text style={styles.inputText}>{tempDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.datePickerLabel}>Time:</Text>
                <View style={styles.timeInputs}>
                  <TouchableOpacity 
                    style={styles.timeInput}
                    onPress={() => {
                      const hours = (tempDate.getHours() + 1) % 24;
                      handleTimeChange(hours, tempDate.getMinutes());
                    }}
                  >
                    <Text style={styles.inputText}>
                      {tempDate.getHours().toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.timeSeparator}>:</Text>

                  <TouchableOpacity 
                    style={styles.timeInput}
                    onPress={() => {
                      const minutes = (tempDate.getMinutes() + 15) % 60;
                      handleTimeChange(tempDate.getHours(), minutes);
                    }}
                  >
                    <Text style={styles.inputText}>
                      {tempDate.getMinutes().toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowDateTimeModal(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleDateTimeConfirm}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Text style={styles.sectionTitle}>
          {isLoadingLocation ? 'Getting location name...' :
           markerLocation ? 
           `Selected: ${markerLocationName || 'Unnamed location'}` : 
           'Tap to mark location'}
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
              title={markerLocationName || "Selected Location"}
            />
          )}
        </MapView>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateTrip}>
          <Text style={styles.buttonText}>Create Trip</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
    fontSize: 16,
    color: '#1A237E',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    color: '#1A237E',
    marginBottom: 15,
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
  },
  createButton: {
    backgroundColor: '#1A237E',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  dateTimeContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1A237E',
    marginBottom: 10,
  },
  dateTimeButton: {
    backgroundColor: '#1A237E',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerContainer: {
    marginVertical: 20,
  },
  datePickerLabel: {
    fontSize: 16,
    color: '#1A237E',
    marginBottom: 8,
  },
  dateInputs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#E8EAF6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeInput: {
    width: 60,
    backgroundColor: '#E8EAF6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeSeparator: {
    fontSize: 24,
    marginHorizontal: 10,
    color: '#1A237E',
  },
  inputText: {
    fontSize: 16,
    color: '#1A237E',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#9FA8DA',
  },
  confirmButton: {
    backgroundColor: '#1A237E',
  },
});

export default CreateGroupPage;