import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Mail, User, Lock, CalendarDays, User2 } from 'lucide-react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import MedicalBackground from '../components/MedicalBackground';

function Signup({ navigation }) {
  const [step, setStep] = useState(1);
  const [form1, setForm1] = useState({
    email: '',
    firstName: '',
    lastName: '',
    username: '',
    gender: '',
    birthday: ''
  });
  const [form2, setForm2] = useState({
    username: '',
    password: '',
    confirm: ''
  });
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!form1.email || !form1.firstName || !form1.lastName || !form1.username) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setStep(2);
    setForm2((prev) => ({ ...prev, username: form1.username }));
  };

  const handleSignup = async () => {
    if (!form2.password || form2.password !== form2.confirm) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      console.log("Starting signup process...");
      const userCredential = await createUserWithEmailAndPassword(auth, form1.email, form2.password);
      const user = userCredential.user;
      console.log("User created in Auth:", user.uid);
      
      // Update profile with username/display name
      await updateProfile(user, {
        displayName: `${form1.firstName} ${form1.lastName}`
      });

      // SAVE TO FIRESTORE
      console.log("Attempting to save to Firestore...");
      try {
        await setDoc(doc(db, "users", user.uid), {
          email: form1.email,
          firstName: form1.firstName,
          lastName: form1.lastName,
          username: form1.username,
          gender: form1.gender || 'Not Specified',
          birthday: form1.birthday || 'Not Specified',
          createdAt: new Date().toISOString()
        });
        console.log("Firestore save successful!");
      } catch (firestoreError) {
        console.error("Firestore Save Error:", firestoreError);
        Alert.alert("Database Error", "Account created but failed to save profile data: " + firestoreError.message);
      }

      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK' }
      ]);
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message);
    }
  };

  return (
    <MedicalBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.title}>
              {step === 1 ? 'CREATE ACCOUNT' : 'SET PASSWORD'}
            </Text>

            {step === 1 ? (
            <View>
              <View style={styles.inputGroup}>
                <Mail size={18} color="#0f172a" />
                <TextInput
                  placeholder="Email"
                  value={form1.email}
                  onChangeText={(e) => setForm1({ ...form1, email: e })}
                  style={styles.input}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <User size={18} color="#0f172a" />
                <TextInput
                  placeholder="First Name"
                  value={form1.firstName}
                  onChangeText={(e) => setForm1({ ...form1, firstName: e })}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <User size={18} color="#0f172a" />
                <TextInput
                  placeholder="Last Name"
                  value={form1.lastName}
                  onChangeText={(e) => setForm1({ ...form1, lastName: e })}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <User2 size={18} color="#0f172a" />
                <TextInput
                  placeholder="Username"
                  value={form1.username}
                  onChangeText={(e) => setForm1({ ...form1, username: e })}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <User size={18} color="#0f172a" />
                <TextInput
                  placeholder="Gender"
                  value={form1.gender}
                  onChangeText={(e) => setForm1({ ...form1, gender: e })}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <CalendarDays size={18} color="#0f172a" />
                <TextInput
                  placeholder="Birthday (YYYY-MM-DD)"
                  value={form1.birthday}
                  onChangeText={(e) => setForm1({ ...form1, birthday: e })}
                  style={styles.input}
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>NEXT</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.inputGroup}>
                <Lock size={18} color="#0f172a" />
                <TextInput
                  placeholder="Password"
                  value={form2.password}
                  onChangeText={(e) => setForm2({ ...form2, password: e })}
                  style={styles.input}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Lock size={18} color="#0f172a" />
                <TextInput
                  placeholder="Confirm Password"
                  value={form2.confirm}
                  onChangeText={(e) => setForm2({ ...form2, confirm: e })}
                  style={styles.input}
                  secureTextEntry
                />
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity style={styles.submitButton} onPress={handleSignup}>
                <Text style={styles.buttonText}>SIGN UP</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={{ color: '#0f172a' }}>Have an account already? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log in now</Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </ScrollView>
    </MedicalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '700',
    fontSize: 20,
    color: '#0f172a',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#7dd3fc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    width: '100%',
    backgroundColor: '#a7f3d0',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    marginTop: 20,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#67e8f9',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    marginTop: 20,
  },
  buttonText: {
    textAlign: 'center',
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 14,
  },
  error: {
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 4,
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
    color: '#2563eb',
    fontWeight: '700',
  },
});

export default Signup;
