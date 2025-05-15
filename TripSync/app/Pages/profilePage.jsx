import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ProfilePage = () => {
  const [user, setUser] = useState({ name: '', email: '', phone_number: '', profilePhoto: '' });
  const [friends, setFriends] = useState([]);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [token, setToken] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const navigation = useNavigation();

  // Base URL (update for environment)
  const API_URL = 'http://192.168.43.32:5000'; // iOS Simulator or physical device
  // const API_URL = 'http://10.0.2.2:5000'; // Android Emulator
  // const API_URL = 'https://trip-sync-xi.vercel.app'; // Vercel

  // Fetch user data and friends on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        console.log('Stored token:', storedToken);
        if (!storedToken) {
          Alert.alert('Error', 'Please log in');
          navigation.navigate('AuthScreen');
          return;
        }
        setToken(storedToken);

        // Fetch user profile
        console.log('Fetching profile from:', `${API_URL}/api/auth/profile`);
        const profileResponse = await fetch(`${API_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${storedToken}` },
        });
        console.log('Profile response status:', profileResponse.status);
        const profileDataText = await profileResponse.text();
        console.log('Profile raw response:', profileDataText);

        let profileData;
        try {
          profileData = JSON.parse(profileDataText);
        } catch (error) {
          console.error('Profile JSON parse error:', error);
          Alert.alert('Error', 'Invalid profile response from server');
          return;
        }

        if (profileResponse.ok) {
          if (profileData.user) {
            setUser(profileData.user);
            setName(profileData.user.name || '');
            setPhoneNumber(profileData.user.phone_number || '');
          } else {
            console.error('Profile data missing user:', profileData);
            Alert.alert('Error', 'Profile data incomplete');
          }
        } else {
          console.error('Profile fetch error:', profileData.error);
          Alert.alert('Error', profileData.error || 'Failed to fetch profile');
        }

        // Fetch friends
        console.log('Fetching friends from:', `${API_URL}/api/friend/friends`);
        const friendsResponse = await fetch(`${API_URL}/api/friend/friends`, {
          headers: { 'Authorization': `Bearer ${storedToken}` },
        });
        console.log('Friends response status:', friendsResponse.status);
        const friendsData = await friendsResponse.json();
        if (friendsResponse.ok) {
          setFriends(friendsData);
        } else {
          console.error('Friends fetch error:', friendsData.error);
          Alert.alert('Error', friendsData.error || 'Failed to fetch friends');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        Alert.alert('Error', 'Failed to load profile or friends');
      }
    };
    fetchData();
  }, [navigation]);

  // Upload profile photo
  const uploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permission to access media library denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled) {
        console.log('Image picker canceled');
        return;
      }

      const formData = new FormData();
      formData.append('profilePhoto', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'profilePhoto.jpg',
      });

      console.log('Uploading photo to:', `${API_URL}/api/auth/profile-photo`);
      console.log('With token:', token);

      const response = await fetch(`${API_URL}/api/auth/profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);
      const text = await response.text();
      console.log('Upload raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error('JSON parse error:', error, 'Raw:', text);
        throw new Error('Invalid server response');
      }

      if (response.ok) {
        setUser({ ...user, profilePhoto: data.profilePhoto });
        Alert.alert('Success', 'Profile photo uploaded');
      } else {
        console.error('Upload error:', data.error);
        Alert.alert('Error', data.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Upload fetch error:', error);
      Alert.alert('Error', error.message || 'Failed to upload photo');
    }
  };

  // Update profile data
  const updateProfile = async () => {
    try {
      if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
        Alert.alert('Error', 'Phone number must be 10 digits');
        return;
      }
      console.log('Updating profile at:', `${API_URL}/api/auth/profile`);
      console.log('With token:', token);
      console.log('Payload:', { name, phone_number: phoneNumber });

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone_number: phoneNumber }),
      });

      console.log('Update response status:', response.status);
      const text = await response.text();
      console.log('Update raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error('Update JSON parse error:', error, 'Raw:', text);
        throw new Error('Invalid server response');
      }

      if (response.ok) {
        setUser(data.user);
        setIsEditing(false); // Exit editing mode
        Alert.alert('Success', 'Profile updated');
      } else {
        console.error('Update error:', data.error);
        Alert.alert('Error', data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update fetch error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setIsSettingsVisible(false);
      navigation.navigate('AuthScreen');
      Alert.alert('Success', 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  // Toggle editing mode
  const handleUpdateProfile = () => {
    setIsEditing(true);
    setIsSettingsVisible(false);
  };

  // Render friend item
  const renderFriend = ({ item }) => (
    <View style={styles.friendItem}>
      {item.profilePhoto ? (
        <Image source={{ uri: item.profilePhoto }} style={styles.friendPhoto} />
      ) : (
        <View style={[styles.friendPhoto, styles.placeholder]} />
      )}
      <Text style={styles.friendName}>{item.name}</Text>
      <Text>  </Text>
      <Text style={styles.friendEmail}>{item.email}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>My Profile</Text>
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={24} color="#003366" />
        </TouchableOpacity>
      </View>

      {/* Profile Photo */}
      <View style={styles.photoContainer}>
        {user.profilePhoto ? (
          <Image source={{ uri: user.profilePhoto }} style={styles.profilePhoto} />
        ) : (
          <View style={[styles.profilePhoto, styles.placeholder]} />
        )}
        {isEditing && (
          <View style={styles.button}>
            <Button
              title="Change Photo"
              onPress={uploadPhoto}
              color="#003366"
            />
          </View>
        )}
      </View>

      {/* Profile Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email || 'Loading...'}</Text>
        <Text style={styles.label}>Name:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor="#555"
          />
        ) : (
          <Text style={styles.value}>{user.name || 'Not set'}</Text>
        )}
        <Text style={styles.label}>Phone Number:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            placeholderTextColor="#555"
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{user.phone_number || 'Not set'}</Text>
        )}
        {isEditing && (
          <View style={styles.button}>
            <Button
              title="Update Profile"
              onPress={updateProfile}
              color="#003366"
            />
          </View>
        )}
      </View>

      {/* Friends List */}
      <Text style={styles.subHeader}>My Friends</Text>
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item._id}
        style={styles.friendsList}
        ListEmptyComponent={<Text style={styles.noTripsText}>No friends yet</Text>}
      />

      {/* Settings Modal */}
      <Modal
        isVisible={isSettingsVisible}
        onBackdropPress={() => setIsSettingsVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Settings</Text>
          <View style={styles.button}>
            <Button
              title="Update Profile"
              onPress={handleUpdateProfile}
              color="#003366"
            />
          </View>
          <View style={styles.modalButtonSpacer} />
          <View style={styles.button}>
            <Button
              title="Logout"
              onPress={handleLogout}
              color="#003366"
            />
          </View>
          <View style={styles.modalButtonSpacer} />
          <View style={[styles.button, styles.cancelButton]}>
            <Button
              title="Cancel"
              onPress={() => setIsSettingsVisible(false)}
              color="#9FA8DA"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5', // Light gray background
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366', // Dark blue
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
    marginTop: 20,
    marginBottom: 10,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA', // Light indigo
  },
  detailsContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003366',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#555', // Medium gray
    marginBottom: 10,
  },
  input: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    color: '#003366',
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
  button: {
    backgroundColor: '#fff',
    padding: 2,
    borderRadius: 8,
    marginVertical: 5,
    width: '60%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#9FA8DA', // Light indigo for cancel button
  },
  friendsList: {
    flexGrow: 0,
  },
  friendItem: {
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
  friendPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  friendEmail: {
    fontSize: 14,
    color: '#555',
  },
  placeholder: {
    backgroundColor: '#ccc',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderColor: '#9FA8DA',
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 15,
  },
  modalButtonSpacer: {
    height: 15, // Increased for better separation
  },
  noTripsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default ProfilePage;