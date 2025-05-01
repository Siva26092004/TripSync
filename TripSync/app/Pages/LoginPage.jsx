import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { AuthContext } from '../utils/AuthContext';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} />
      <Text>Password</Text>
      <TextInput value={password} secureTextEntry onChangeText={setPassword} />
      <Button title="Login" onPress={() => login(email, password)} />
    </View>
  );
}
