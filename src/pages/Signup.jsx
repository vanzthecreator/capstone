import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Mail, User, Lock, CalendarDays, AtSign, ArrowRight, ArrowLeft, Check } from 'lucide-react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';

function Signup({ navigation }) {
  const [step, setStep] = useState(1);
  const [focused, setFocused] = useState(null);
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
      const userCredential = await createUserWithEmailAndPassword(auth, form1.email, form2.password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: `${form1.firstName} ${form1.lastName}`
      });

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
      } catch (firestoreError) {
        Alert.alert("Database Error", "Account created but failed to save profile data: " + firestoreError.message);
      }

      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK' }
      ]);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderInput = (icon, placeholder, value, onChange, keyboardType = 'default', secureText = false) => {
    const IconComponent = icon;
    const fieldKey = placeholder.toLowerCase().replace(/\s/g, '');
    return (
      <View style={[
        styles.inputWrapper,
        focused === fieldKey && styles.inputWrapperFocused
      ]}>
        <IconComponent size={18} color={focused === fieldKey ? '#10b981' : '#94a3b8'} />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(fieldKey)}
          onBlur={() => setFocused(null)}
          style={styles.input}
          keyboardType={keyboardType}
          secureTextEntry={secureText}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f0fdf4', '#ecfeff', '#f0f9ff']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../assets/2.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.appName}>LifeSignal</Text>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressStep}>
                <View style={[styles.progressDot, styles.progressDotActive]}>
                  {step > 1 ? <Check size={12} color="white" /> : <Text style={styles.progressNumber}>1</Text>}
                </View>
                <Text style={[styles.progressLabel, styles.progressLabelActive]}>Profile</Text>
              </View>
              <View style={[styles.progressLine, step === 2 && styles.progressLineActive]} />
              <View style={styles.progressStep}>
                <View style={[styles.progressDot, step === 2 && styles.progressDotActive]}>
                  <Text style={[styles.progressNumber, step === 2 && styles.progressNumberActive]}>2</Text>
                </View>
                <Text style={[styles.progressLabel, step === 2 && styles.progressLabelActive]}>Security</Text>
              </View>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              <Text style={styles.title}>
                {step === 1 ? 'Create Your Profile' : 'Secure Your Account'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 1 ? 'Tell us a bit about yourself' : 'Choose a strong password'}
              </Text>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {step === 1 ? (
                <View style={styles.formContainer}>
                  {renderInput(Mail, 'Email Address', form1.email, (e) => setForm1({ ...form1, email: e }), 'email-address')}
                  
                  <View style={styles.row}>
                    <View style={styles.halfInput}>
                      {renderInput(User, 'First Name', form1.firstName, (e) => setForm1({ ...form1, firstName: e }))}
                    </View>
                    <View style={styles.halfInput}>
                      {renderInput(User, 'Last Name', form1.lastName, (e) => setForm1({ ...form1, lastName: e }))}
                    </View>
                  </View>
                  
                  {renderInput(AtSign, 'Username', form1.username, (e) => setForm1({ ...form1, username: e }))}
                  {renderInput(User, 'Gender (Optional)', form1.gender, (e) => setForm1({ ...form1, gender: e }))}
                  {renderInput(CalendarDays, 'Birthday (Optional)', form1.birthday, (e) => setForm1({ ...form1, birthday: e }))}

                  <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Continue</Text>
                    <ArrowRight size={18} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  {renderInput(Lock, 'Password', form2.password, (e) => setForm2({ ...form2, password: e }), 'default', true)}
                  {renderInput(Lock, 'Confirm Password', form2.confirm, (e) => setForm2({ ...form2, confirm: e }), 'default', true)}

                  <View style={styles.passwordHints}>
                    <Text style={styles.hintText}>Password should be at least 6 characters</Text>
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)} activeOpacity={0.8}>
                      <ArrowLeft size={18} color="#64748b" />
                      <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.submitButton} onPress={handleSignup} activeOpacity={0.8}>
                      <Text style={styles.buttonText}>Create Account</Text>
                      <Check size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    minHeight: '100%',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressDotActive: {
    backgroundColor: '#10b981',
  },
  progressNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  progressNumberActive: {
    color: 'white',
  },
  progressLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  progressLabelActive: {
    color: '#10b981',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  progressLineActive: {
    backgroundColor: '#10b981',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 22,
    color: '#0f172a',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
    color: '#64748b',
  },
  formContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    gap: 12,
    marginBottom: 14,
  },
  inputWrapperFocused: {
    borderColor: '#10b981',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#0f172a',
    fontSize: 15,
  },
  passwordHints: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#64748b',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    marginTop: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 6,
  },
  backButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 15,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  loginLink: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default Signup;
