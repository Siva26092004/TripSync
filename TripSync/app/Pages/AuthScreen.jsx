import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {ToastAndroid, Button, StatusBar} from 'react-native';

const AuthScreen = () => {
  const navigation = useNavigation();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    password: '',
  });

  
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // const showToastWithGravityAndOffset = () => {
  //   ToastAndroid.showWithGravityAndOffset(
  //     'A wild toast appeared!',
  //     ToastAndroid.LONG,
  //     ToastAndroid.BOTTOM,
  //     25,
  //     50,
  //   );
  // };


  const handleSignup = async () => {
    try {
      setIsLoading(true);
      // console.log('Form Data:', formData);
      const response = await fetch('https://trip-sync-xi.vercel.app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      // console.log(data);
      if (response.ok) {
        ToastAndroid.showWithGravityAndOffset(
          'Account Created Successfully!',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
        setIsLogin(true);
      } else {
        ToastAndroid.showWithGravityAndOffset(
          '' + (data.message || 'Signup failed'),
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
      }
    } catch (error) {
      ToastAndroid.showWithGravityAndOffset(
        'Network error occurred',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('https://trip-sync-xi.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      // console.log(response);
      const data = await response.json();
      if (response.ok) {
        ToastAndroid.showWithGravityAndOffset(
          'Login Successful!',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
        console.log("HIIII");
        navigation.navigate('MainTabs');
      } else {
        console.log("Else");
        ToastAndroid.showWithGravityAndOffset(
          ""+ (data.message || 'Login failed'),
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
      }
    } catch (error) {
      ToastAndroid.showWithGravityAndOffset(
        'Network error occurred',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
      console.log("Catch");
    } finally {
      setIsLoading(false);
      console.log("Finally");
    }
  };

  // Update the form inputs and button
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animated.View
        key={isLogin ? 'login' : 'signup'}
        entering={FadeIn.duration(500)}
        exiting={FadeOut.duration(500)}
        layout={Layout.springify()}
        style={styles.formContainer}
      >
        <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>

        {!isLogin && (
          <TextInput
            placeholder="Username"
            placeholderTextColor="#9FA8DA"
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
          />
        )}

        {!isLogin && (
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#9FA8DA"
            style={styles.input}
            value={formData.phone_number}
            onChangeText={(text) => handleInputChange('phone_number', text)}
            keyboardType="phone-pad"
          />
        )}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#9FA8DA"
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9FA8DA"
          style={styles.input}
          value={formData.password}
          onChangeText={(text) => handleInputChange('password', text)}
          secureTextEntry
        />

        {isLogin && (
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          onPress={isLogin ? handleLogin : handleSignup}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#1A237E', '#3F51B5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, isLoading && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>


        <TouchableOpacity onPress={toggleForm} style={styles.switchContainer}>
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Text style={styles.switchLink}>{isLogin ? "Sign Up" : "Login"}</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    color: '#1A237E',
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#C5CAE9',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    color: '#1A237E',
    marginBottom: 15,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotText: {
    color: '#3F51B5',
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  switchContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  switchText: {
    fontSize: 14,
    color: '#1A237E',
  },
  switchLink: {
    color: '#3F51B5',
    fontWeight: 'bold',
  },
});

export default AuthScreen;
