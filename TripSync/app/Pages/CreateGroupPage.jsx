import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Platform, Alert, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import tripsData from '../utils/tripsData.js';

const CreateGroupPage = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [travelMode, setTravelMode] = useState(null);
  const [destination, setDestination] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [startDate, setStartDate] = useState(new Date());
  const [destinationName, setDestinationName] = useState('');
  const [markerLocation, setMarkerLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [markerLocationName, setMarkerLocationName] = useState('');
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

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
      }
    } catch (error) {
      console.log('Error getting location name:', error);
      setMarkerLocationName('Location name unavailable');
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

  const membersList = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Bob Johnson' },
  ];

  const handleMemberSelect = (member) => {
    setSelectedMembers(prev => 
      prev.includes(member.id) 
        ? prev.filter(id => id !== member.id)
        : [...prev, member.id]
    );
  };

  const renderMemberItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleMemberSelect(item)}
      style={[
        styles.memberItem,
        selectedMembers.includes(item.id) && styles.selectedMemberItem
      ]}
    >
      <Text style={styles.memberText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleCreateTrip = async () => {
    if (!markerLocation || !travelMode || selectedMembers.length === 0) {
      Alert.alert('Missing Information', 'Please fill in all the required fields');
      return;
    }

    try {
      const response = await Location.reverseGeocodeAsync({
        latitude: markerLocation.latitude,
        longitude: markerLocation.longitude,
      });
      if (response[0]) {
        const address = response[0];
        const locationName = `${address.street || ''} ${address.city || ''}`;
        
        const newTrip = {
          id: Date.now().toString(),
          destination: markerLocation,
          destinationName: locationName,
          members: selectedMembers.map(id => 
            membersList.find(m => m.id === id).name
          ),
          travelMode,
          startDate,
          date: formatDateTime(startDate)
        };

        tripsData.push(newTrip);
        console.log('New trip:', newTrip);
        navigation.navigate('TripsPlanned', { newTrip });
      }
    } catch (error) {
      console.log('Error getting location name:', error);
      Alert.alert('Error', 'Could not get location details. Please try again.');
    }
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
    setStartDate(tempDate);
    setShowDateTimeModal(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Trip</Text>

        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateTimeText}>
            Trip Start: {formatDateTime(startDate)}
          </Text>
          <TouchableOpacity 
            style={styles.dateTimeButton}
            onPress={() => {
              setTempDate(new Date(startDate));
              setShowDateTimeModal(true);
            }}
          >
            <Text style={styles.buttonText}>Change Date & Time</Text>
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
              <Text style={styles.modalTitle}>Select Date and Time</Text>
              
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

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        >
          <Text style={styles.buttonText}>Add Members</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Members</Text>
              <FlatList
                data={membersList}
                renderItem={renderMemberItem}
                keyExtractor={item => item.id}
              />
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.travelModeContainer}>
          <TouchableOpacity
            onPress={() => setTravelMode('Cycle')}
            style={[styles.modeButton, travelMode === 'Cycle' && styles.selectedMode]}
          >
            <Text style={styles.buttonText}>Cycle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTravelMode('Motorbike')}
            style={[styles.modeButton, travelMode === 'Motorbike' && styles.selectedMode]}
          >
            <Text style={styles.buttonText}>Motorbike</Text>
          </TouchableOpacity>
        </View>

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

        <TouchableOpacity style={styles.createButton} onPress={handleCreateTrip}></TouchableOpacity>
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
  addButton: {
    backgroundColor: '#1A237E',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
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
  memberItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedMemberItem: {
    backgroundColor: '#E8EAF6',
  },
  memberText: {
    fontSize: 16,
    color: '#1A237E',
  },
  closeButton: {
    backgroundColor: '#1A237E',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  travelModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  modeButton: {
    backgroundColor: '#4C5B99',
    padding: 15,
    borderRadius: 12,
    width: 120,
    alignItems: 'center',
  },
  selectedMode: {
    backgroundColor: '#1A237E',
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
