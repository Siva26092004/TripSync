import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileIcon = () => {
  const navigation = useNavigation();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const API_URL = 'http://192.168.43.32:5000'; // iOS Simulator or physical device

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) return;

        const response = await fetch(`${API_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${storedToken}` },
        });
        const data = await response.json();
        if (response.ok && data.user && data.user.profilePhoto) {
          setProfilePhoto(data.user.profilePhoto);
        }
      } catch (error) {
        console.error('Error fetching profile photo:', error);
      }
    };
    fetchProfilePhoto();
  }, []);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProfilePage')}
      style={styles.profileIconContainer}
    >
      {profilePhoto ? (
        <Image
          source={{ uri: profilePhoto }}
          style={styles.profileImage}
        />
      ) : (
        <Ionicons name="person-circle-outline" size={30} color="#003366" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  profileIconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 1,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#9FA8DA',
  },
});

export default ProfileIcon;