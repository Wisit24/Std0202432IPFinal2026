import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  onLoginSuccess: (token: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to backend server');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.badge}>EXECUTIVE SUITE</Text>
        <Text style={styles.title}>HR Portal Analytics</Text>
        <Text style={styles.subtitle}>Enter credentials to access dashboard</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>USERNAME</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="admin"
          placeholderTextColor="#4b5563"
          autoCapitalize="none"
        />

        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#4b5563"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>AUTHENTICATE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#111827', padding: 30, borderRadius: 16, borderWidth: 1, borderColor: '#1f2937' },
  badge: { color: '#d97706', fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#9ca3af', fontSize: 13, marginBottom: 24 },
  errorText: { color: '#ef4444', marginBottom: 16, fontSize: 13 },
  label: { color: '#d1d5db', fontSize: 11, fontWeight: '600', marginBottom: 6, letterSpacing: 1 },
  input: { backgroundColor: '#1f2937', color: '#ffffff', borderRadius: 8, padding: 12, marginBottom: 18, borderWidth: 1, borderColor: '#374151' },
  button: { backgroundColor: '#d97706', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', letterSpacing: 1 },
});