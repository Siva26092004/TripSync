import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ProfileIcon from '../components/ProfileIcon';

const TripPage = () => {
  const navigation = useNavigation();
  const [activeTrip, setActiveTrip] = useState(null);
  const [plannedTrips, setPlannedTrips] = useState([]);
  const [friends, setFriends] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [userId, setUserId] = useState('');
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const API_URL = 'http://192.168.43.32:5000';

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No authentication token found. Please log in.');
        navigation.navigate('AuthScreen');
        return;
      }
      console.log('Token:', token);

      // Fetch user profile
      const profileResponse = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileResponse.json();
      if (profileResponse.ok) {
        setUserId(profileData.user._id);
      } else {
        console.error('Profile fetch error:', profileData);
        throw new Error(profileData.error || 'Failed to fetch profile');
      }

      // Fetch trips
      const tripsResponse = await fetch(`${API_URL}/api/trips/mytrips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tripsData = await tripsResponse.json();
      if (tripsResponse.ok) {
        console.log('Fetched trips:', tripsData);
        const active = tripsData.find((trip) => trip.status === 'started');
        const planned = tripsData.filter((trip) => trip.status === 'planned');
        console.log('Active trip:', active);
        setActiveTrip((prev) => {
          console.log('Setting activeTrip:', active);
          return active || null;
        });
        setPlannedTrips(planned);
        if (active && active.destination) {
          try {
            const response = await Location.geocodeAsync(active.destination);
            if (response[0]) {
              setRegion({
                latitude: response[0].latitude,
                longitude: response[0].longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
            }
          } catch (error) {
            console.error('Geocode error:', error);
          }
        }
      } else {
        console.error('Trips fetch error:', tripsData);
        throw new Error(tripsData.error || 'Failed to fetch trips');
      }

      // Fetch friends
      const friendsResponse = await fetch(`${API_URL}/api/friend/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const friendsData = await friendsResponse.json();
      if (friendsResponse.ok) {
        console.log('Fetched friends:', friendsData);
        setFriends(friendsData);
      } else {
        console.error('Friends fetch error:', friendsData);
        throw new Error(friendsData.error || 'Failed to fetch friends');
      }

      // Fetch trip invitations
      const invitationsResponse = await fetch(`${API_URL}/api/trips/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const invitationsData = await invitationsResponse.json();
      if (invitationsResponse.ok) {
        console.log('Fetched invitations:', invitationsData);
        setInvitations(invitationsData);
      } else {
        console.error('Invitations fetch error:', invitationsData);
        throw new Error(invitationsData.error || 'Failed to fetch invitations');
      }
    } catch (error) {
      console.error('Fetch data exception:', error);
      Alert.alert('Error', error.message || 'Failed to load data');
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access.');
        return;
      }

      fetchData();

      // Periodic location update
      const locationInterval = setInterval(async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          const location = await Location.getCurrentPositionAsync({});
          const trip = activeTrip;
          if (trip) {
            await fetch(`${API_URL}/api/trips/${trip._id}/location`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }),
            });
          }
        } catch (error) {
          console.error('Location update error:', error);
        }
      }, 30000); // Update every 30 seconds

      return () => clearInterval(locationInterval);
    })();
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
        setActiveTrip(data);
        setPlannedTrips((prev) => prev.filter((trip) => trip._id !== tripId));
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

  const handleEndTrip = async (tripId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/trips/${tripId}/end`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Ended trip:', data);
        setActiveTrip(null);
        Alert.alert('Success', 'Trip ended!');
      } else {
        console.error('End trip error:', data);
        throw new Error(data.error || 'Failed to end trip');
      }
    } catch (error) {
      console.error('End trip exception:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleAcceptJoinRequest = async (tripId, userId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `${API_URL}/api/trips/${tripId}/join-request/${userId}/accept`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log('Accepted join request:', data);
        setActiveTrip(data);
        Alert.alert('Success', 'Join request accepted');
      } else {
        console.error('Accept join request error:', data);
        throw new Error(data.error || 'Failed to accept join request');
      }
    } catch (error) {
      console.error('Accept join request exception:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleDeclineJoinRequest = async (tripId, userId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `${API_URL}/api/trips/${tripId}/join-request/${userId}/decline`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        console.log('Declined join request:', data);
        setActiveTrip(data);
        Alert.alert('Success', 'Join request declined');
      } else {
        console.error('Decline join request error:', data);
        throw new Error(data.error || 'Failed to decline join request');
      }
    } catch (error) {
      console.error('Decline join request exception:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleSendInvitation = async (friendId) => {
    try {
      if (!activeTrip || !activeTrip._id) {
        Alert.alert('Error', 'No active trip found. Please start a trip first.');
        return;
      }
      if (!friendId) {
        Alert.alert('Error', 'Invalid friend selected.');
        return;
      }
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No authentication token found. Please log in.');
        navigation.navigate('AuthScreen');
        return;
      }
      console.log('Sending invitation:', { tripId: activeTrip._id, friendId, token });
      const response = await fetch(`${API_URL}/api/trips/${activeTrip._id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: friendId }),
      });
      const data = await response.json();
      console.log('Invite response:', { status: response.status, data });
      if (response.ok) {
        console.log('Invitation sent:', data);
        Alert.alert('Success', data.message || 'Invitation sent');
      } else {
        console.error('Send invitation error:', data);
        throw new Error(data.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Send invitation exception:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/trips/invitations/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invitationId }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Accepted invitation:', data);
        setActiveTrip(data.trip); // Set the joined trip as active
        setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));
        Alert.alert('Success', 'Trip invitation accepted');
      } else {
        console.error('Accept invitation error:', data);
        throw new Error(data.error || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Accept invitation exception:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/trips/invitations/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invitationId }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Rejected invitation:', data);
        setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));
        Alert.alert('Success', 'Trip invitation rejected');
      } else {
        console.error('Reject invitation error:', data);
        throw new Error(data.error || 'Failed to reject invitation');
      }
    } catch (error) {
      console.error('Reject invitation exception:', error);
      Alert.alert('Error', error.message);
    }
  };

  const copyGroupCode = () => {
    Alert.alert('Group Code', activeTrip?.groupCode || 'No active trip');
  };

  const handleCreateTrip = () => {
    navigation.navigate('CreateGroupPage');
  };

  const refreshData = () => {
    fetchData();
  };

  console.log('Render activeTrip:', activeTrip);

  if (activeTrip) {
    const isLeader = activeTrip.createdBy._id === userId;
    const data = [
      { type: 'header', id: 'header' },
      { type: 'settings', id: 'settings' },
      { type: 'friends', id: 'friends' },
      ...(isLeader ? [{ type: 'joinRequests', id: 'joinRequests' }] : []),
      { type: 'participants', id: 'participants' },
    ];

    return (
      <View style={styles.container}>
        <FlatList
          data={data}
          renderItem={renderActiveTripItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileIcon />
      <View style={styles.buttonContainer}>
        {invitations.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Trip Invitations</Text>
            {invitations.map((invitation) => (
              <View key={invitation._id} style={styles.invitationItem}>
                <Text style={styles.invitationText}>
                  {invitation.fromUser.name} invited you to "{invitation.trip.title}"
                </Text>
                <Text style={styles.invitationDetails}>
                  Destination: {invitation.trip.destination}
                </Text>
                <View style={styles.requestButtons}>
                  <TouchableOpacity
                    style={[styles.requestButton, styles.acceptButton]}
                    onPress={() => handleAcceptInvitation(invitation._id)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.requestButton, styles.declineButton]}
                    onPress={() => handleRejectInvitation(invitation._id)}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity onPress={handleCreateTrip}>
          <View style={[styles.button, styles.createButton]}>
            <Text style={styles.buttonText}>Create Trip</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TripsPlanned')}>
          <View style={[styles.button, styles.joinButton]}>
            <Text style={styles.buttonText}>Trips Planned</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  function renderActiveTripItem({ item }) {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.headerContainer}>
            <ProfileIcon />
            <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{activeTrip?.title || 'No Title'}</Text>
            <Text style={styles.sectionTitle}>Destination: {activeTrip?.destination || 'N/A'}</Text>
          </View>
        );
      case 'settings':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Trip Settings</Text>
            <View style={styles.settingsContainer}>
              <Text style={styles.groupCode}>Group Code: {activeTrip?.groupCode || 'N/A'}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={copyGroupCode}>
                <Text style={styles.buttonText}>Show Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'friends':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Invite Friends</Text>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <View key={friend._id} style={styles.friendItem}>
                  {friend.profilePhoto ? (
                    <Image source={{ uri: friend.profilePhoto }} style={styles.friendPhoto} />
                  ) : (
                    <View style={[styles.friendPhoto, styles.placeholder]} />
                  )}
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <TouchableOpacity
                    style={[styles.inviteButton, !activeTrip && styles.disabledButton]}
                    onPress={() => handleSendInvitation(friend._id)}
                    disabled={!activeTrip}
                  >
                    <Text style={styles.buttonText}>Invite</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noFriendsText}>No friends found</Text>
            )}
          </View>
        );
      case 'joinRequests':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Join Requests</Text>
            {activeTrip.joinRequests?.length > 0 ? (
              activeTrip.joinRequests.map((request) => (
                <View key={request._id} style={styles.requestItem}>
                  {request.profilePhoto ? (
                    <Image source={{ uri: request.profilePhoto }} style={styles.userPhoto} />
                  ) : (
                    <View style={[styles.userPhoto, styles.placeholder]} />
                  )}
                  <Text style={styles.userName}>{request.name}</Text>
                  <View style={styles.requestButtons}>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.acceptButton]}
                      onPress={() => handleAcceptJoinRequest(activeTrip._id, request._id)}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.requestButton, styles.declineButton]}
                      onPress={() => handleDeclineJoinRequest(activeTrip._id, request._id)}
                    >
                      <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noRequestsText}>No join requests</Text>
            )}
            <TouchableOpacity
              style={styles.endButton}
              onPress={() => handleEndTrip(activeTrip._id)}
            >
              <Text style={styles.buttonText}>End Trip</Text>
            </TouchableOpacity>
          </View>
        );
      case 'participants':
        return (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
              showsUserLocation={true}
            >
              {activeTrip.locationUpdates?.map((update, index) => (
                <Marker
                  key={index}
                  coordinate={update.coords}
                  title={activeTrip.participants.find((p) => p._id === update.user._id)?.name}
                >
                  <Image
                    source={{
                      uri:
                        activeTrip.participants.find((p) => p._id === update.user._id)
                          ?.profilePhoto || 'https://via.placeholder.com/40',
                    }}
                    style={styles.markerImage}
                  />
                </Marker>
              ))}
            </MapView>
          </View>
        );
      default:
        return null;
    }
  }
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#1A237E',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1A237E',
    marginBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 15,
    width: 250,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#1A237E',
  },
  joinButton: {
    backgroundColor: '#3F51B5',
  },
  endButton: {
    backgroundColor: '#D32F2F',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  inviteButton: {
    backgroundColor: '#1A237E',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#9FA8DA',
    opacity: 0.5,
  },
  refreshButton: {
    backgroundColor: '#3F51B5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
  groupCode: {
    fontSize: 16,
    color: '#1A237E',
    marginBottom: 10,
  },
  copyButton: {
    backgroundColor: '#9FA8DA',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
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
  friendPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
  friendName: {
    flex: 1,
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
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
  invitationItem: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
  invitationText: {
    fontSize: 16,
    color: '#1A237E',
    marginBottom: 5,
  },
  invitationDetails: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
  userName: {
    flex: 1,
    fontSize: 16,
    color: '#1A237E',
  },
  requestButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  requestButton: {
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: '#1A237E',
  },
  declineButton: {
    backgroundColor: '#9FA8DA',
  },
  noRequestsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 300,
    marginBottom: 10,
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
});

export default TripPage;