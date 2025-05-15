import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Alert, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileIcon from '../components/ProfileIcon';

const CommunityPage = () => {
  const [users, setUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [token, setToken] = useState('');

  // Base URL (update for environment)
  const API_URL = 'http://192.168.43.32:5000'; // iOS Simulator or physical device
  // const API_URL = 'http://10.0.2.2:5000'; // Android Emulator
  // const API_URL = 'https://trip-sync-xi.vercel.app'; // Vercel

  // Fetch users and friend requests on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          Alert.alert('Error', 'Please log in');
          return;
        }
        setToken(storedToken);

        // Fetch all users
        const usersResponse = await fetch(`${API_URL}/api/friend/users`, {
          headers: { 'Authorization': `Bearer ${storedToken}` },
        });
        const usersData = await usersResponse.json();
        if (usersResponse.ok) {
          setUsers(usersData);
        } else {
          Alert.alert('Error', usersData.error || 'Failed to fetch users');
        }

        // Fetch pending friend requests
        const requestsResponse = await fetch(`${API_URL}/api/friend/friend-requests`, {
          headers: { 'Authorization': `Bearer ${storedToken}` },
        });
        const requestsData = await requestsResponse.json();
        if (requestsResponse.ok) {
          setFriendRequests(requestsData);
        } else {
          Alert.alert('Error', requestsData.error || 'Failed to fetch friend requests');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        Alert.alert('Error', 'Failed to load community data');
      }
    };
    fetchData();
  }, []);

  // Send friend request
  const sendFriendRequest = async (toUserId) => {
    try {
      const response = await fetch(`${API_URL}/api/friend/friend-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toUserId }),
      });
      const data = await response.json();
      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === toUserId ? { ...user, isPending: true } : user
          )
        );
        Alert.alert('Success', data.message);
      } else {
        Alert.alert('Error', data.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Send friend request error:', error);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId) => {
    try {
      const response = await fetch(`${API_URL}/api/friend/friend-request/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });
      const data = await response.json();
      if (response.ok) {
        setFriendRequests((prevRequests) =>
          prevRequests.filter((req) => req._id !== requestId)
        );
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === data.fromUserId ? { ...user, isFriend: true } : user
          )
        );
        Alert.alert('Success', data.message);
      } else {
        Alert.alert('Error', data.error || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Accept friend request error:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  // Reject friend request
  const rejectFriendRequest = async (requestId) => {
    try {
      const response = await fetch(`${API_URL}/api/friend/friend-request/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });
      const data = await response.json();
      if (response.ok) {
        setFriendRequests((prevRequests) =>
          prevRequests.filter((req) => req._id !== requestId)
        );
        Alert.alert('Success', data.message);
      } else {
        Alert.alert('Error', data.error || 'Failed to reject friend request');
      }
    } catch (error) {
      console.error('Reject friend request error:', error);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  // Render user item
  const renderUser = ({ item }) => (
    <View style={styles.userItem}>
      {item.profilePhoto ? (
        <Image source={{ uri: item.profilePhoto }} style={styles.userPhoto} />
      ) : (
        <View style={[styles.userPhoto, styles.placeholder]} />
      )}
      <Text style={styles.userName}>{item.name}</Text>
      <View style={styles.button}>
        <Button
          title={item.isFriend ? 'Friend' : item.isPending ? 'Pending' : 'Add Friend'}
          onPress={() => !item.isFriend && !item.isPending && sendFriendRequest(item._id)}
          color="#003366"
          disabled={item.isFriend || item.isPending}
        />
      </View>
    </View>
  );

  // Render friend request item
  const renderFriendRequest = ({ item }) => (
    <View style={styles.requestItem}>
      {item.fromUser.profilePhoto ? (
        <Image source={{ uri: item.fromUser.profilePhoto }} style={styles.userPhoto} />
      ) : (
        <View style={[styles.userPhoto, styles.placeholder]} />
      )}
      <Text style={styles.userName}>{item.fromUser.name}</Text>
      <View style={styles.requestButtons}>
        <View style={[styles.button, { marginRight: 5 }]}>
          <Button
            title="Accept"
            onPress={() => acceptFriendRequest(item._id)}
            color="#003366"
          />
        </View>
        <View style={[styles.button, { backgroundColor: '#9FA8DA' }]}>
          <Button
            title="Reject"
            onPress={() => rejectFriendRequest(item._id)}
            color="#9FA8DA"
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
        <ProfileIcon/>
      <Text style={styles.header}>Community</Text>

      {/* Notifications Section */}
      <Text style={styles.subHeader}>Notifications</Text>
      <FlatList
        data={friendRequests}
        renderItem={renderFriendRequest}
        keyExtractor={(item) => item._id}
        style={styles.requestsList}
        ListEmptyComponent={<Text style={styles.noTripsText}>No pending friend requests</Text>}
      />

      {/* All Users Section */}
      <Text style={styles.subHeader}>All Users</Text>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        style={styles.usersList}
        ListEmptyComponent={<Text style={styles.noTripsText}>No users found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5', // Light gray background
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366', // Dark blue
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
    marginTop: 20,
    marginBottom: 10,
  },
  usersList: {
    flexGrow: 0,
  },
  requestsList: {
    flexGrow: 0,
    marginBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA', // Light indigo
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  button: {
    backgroundColor: '#fff',
    padding: 2,
    borderRadius: 8,
    marginVertical: 5,
    width: '30%',
    alignItems: 'center',
  },
  requestButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  placeholder: {
    backgroundColor: '#ccc',
  },
  noTripsText: {
    fontSize: 16,
    color: '#555', // Medium gray
    textAlign: 'center',
  },
});

export default CommunityPage;