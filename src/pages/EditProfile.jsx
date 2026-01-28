import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, Dimensions } from 'react-native';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { AuthContext } from '../App';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { 
  ChevronLeft, 
  Camera, 
  MessageSquare, 
  Bell, 
  Settings,
  Pencil, 
  Lock,
  ChevronRight
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function EditProfile({ navigation }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');

  // Medical State
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  
  // Image State
  const [photoURL, setPhotoURL] = useState(null);
  const [newImageUri, setNewImageUri] = useState(null);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    if (user) {
      setEmail(user.email || '');
      setPhotoURL(user.photoURL);
      
      // Initial split of displayName if available
      if (user.displayName) {
        const names = user.displayName.split(' ');
        setFirstName(names[0] || '');
        setLastName(names.slice(1).join(' ') || '');
      }
      
      try {
        const docRef = doc(db, "users", user.uid);
        // Add timeout to fetch
        const fetchPromise = getDoc(docRef);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Fetch timeout")), 5000)
        );
        
        const docSnap = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Override with specific fields if they exist
          if (data.firstName) setFirstName(data.firstName);
          if (data.lastName) setLastName(data.lastName);
          if (data.username) setUsername(data.username);
          if (data.phoneNumber) setPhone(data.phoneNumber);
          if (data.birthday) setBirthday(data.birthday);
          if (data.gender) setGender(data.gender);
          
          // Medical Data
          if (data.bloodType) setBloodType(data.bloodType);
          if (data.allergies) setAllergies(data.allergies);
          if (data.conditions) setConditions(data.conditions);
          if (data.medications) setMedications(data.medications);
          if (data.emergencyContactName) setEmergencyContactName(data.emergencyContactName);
          if (data.emergencyContactPhone) setEmergencyContactPhone(data.emergencyContactPhone);
        }
      } catch (error) {
        console.log("Error loading user extra data:", error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    } else {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const uploadImage = async (uri) => {
    try {
      // Compress image with timeout and fallback
      let finalUri = uri;
      try {
        const compressionPromise = ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 800 } }], // Resize profile pic to 800px width
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Compression timeout')), 5000)
        );

        const manipResult = await Promise.race([compressionPromise, timeoutPromise]);
        finalUri = manipResult.uri;
      } catch (e) {
        console.log("Compression skipped:", e);
        // Fallback to original uri
      }

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", finalUri, true);
        xhr.send(null);
      });
      
      const filename = `profile_pictures/${user.uid}_${Date.now()}`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert("Error", "First Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      let currentPhotoURL = photoURL;

      // 1. Upload new image if selected
      if (newImageUri) {
        currentPhotoURL = await uploadImage(newImageUri);
      }

      const newDisplayName = `${firstName} ${lastName}`.trim();

      // 2. Update Firebase Auth Profile (Display Name & Photo URL)
      if (user.displayName !== newDisplayName || user.photoURL !== currentPhotoURL) {
        await updateProfile(auth.currentUser, {
          displayName: newDisplayName,
          photoURL: currentPhotoURL
        });
      }

      // 3. Update Firestore Data
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        firstName,
        lastName,
        displayName: newDisplayName,
        username,
        photoURL: currentPhotoURL,
        phoneNumber: phone,
        birthday,
        gender,
        bloodType,
        allergies,
        conditions,
        medications,
        emergencyContactName,
        emergencyContactPhone,
        email, // Keep email synced in Firestore too
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
      
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelection = async () => {
    Alert.alert(
      "Profile Photo",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert("Permission needed", "Camera permission is required.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled) setNewImageUri(result.assets[0].uri);
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled) setNewImageUri(result.assets[0].uri);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34d399" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Background */}
      <View style={styles.headerBackground}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={28} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Edit Profile</Text>
          
          <View style={{ width: 10}} /> 
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section - Overlapping Header */}
        <View style={styles.profileImageContainer}>
          <View style={styles.avatarWrapper}>
            {newImageUri ? (
              <Image source={{ uri: newImageUri }} style={styles.avatar} />
            ) : photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
            <TouchableOpacity style={styles.editIconContainer} onPress={handleImageSelection}>
              <Pencil size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.pageTitle}>Edit Profile</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
            />
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="@Username"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              editable={false} // Email usually not editable directly
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="0999955551"
              keyboardType="phone-pad"
            />
          </View>

          {/* Birthday */}
          <View style={styles.inputGroup}>
            <View style={styles.dropdownInput}>
              <Text style={birthday ? styles.inputText : styles.placeholderText}>
                {birthday || "BIRTHDAY"}
              </Text>
              <ChevronRight size={20} color="#000" style={{ transform: [{ rotate: '90deg' }] }} />
            </View>
            {/* Note: Real implementation would need a DatePicker here */}
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
             <View style={styles.dropdownInput}>
              <Text style={gender ? styles.inputText : styles.placeholderText}>
                {gender || "Gender"}
              </Text>
              <ChevronRight size={20} color="#000" style={{ transform: [{ rotate: '90deg' }] }} />
            </View>
            {/* Note: Real implementation would need a Picker/Modal here */}
          </View>

          {/* Medical Information Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
          </View>

          {/* Blood Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Blood Type</Text>
            <TextInput
              style={styles.input}
              value={bloodType}
              onChangeText={setBloodType}
              placeholder="e.g. A+, O-"
            />
          </View>

          {/* Allergies */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Allergies</Text>
            <TextInput
              style={styles.input}
              value={allergies}
              onChangeText={setAllergies}
              placeholder="List any allergies"
              multiline
            />
          </View>

          {/* Medical Conditions */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medical Conditions</Text>
            <TextInput
              style={styles.input}
              value={conditions}
              onChangeText={setConditions}
              placeholder="List any conditions"
              multiline
            />
          </View>

          {/* Medications */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medications</Text>
            <TextInput
              style={styles.input}
              value={medications}
              onChangeText={setMedications}
              placeholder="Current medications"
              multiline
            />
          </View>

          {/* Emergency Contact Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Contact Name</Text>
            <TextInput
              style={styles.input}
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
              placeholder="Contact Name"
            />
          </View>

          {/* Emergency Contact Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Contact Phone</Text>
            <TextInput
              style={styles.input}
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
              placeholder="Contact Phone"
              keyboardType="phone-pad"
            />
          </View>

          {/* Change Password Button */}
          <TouchableOpacity style={styles.changePasswordButton}>
            <Text style={styles.changePasswordText}>Change Password</Text>
            <Lock size={18} color="#fff" style={{marginLeft: 8}} />
          </TouchableOpacity>

           {/* Save Button (Added for functionality, though not explicitly in screenshot, needed to save) */}
           <TouchableOpacity 
              style={[styles.saveButton, saving && styles.disabledButton]} 
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d1d5db', // Grey background from screenshot
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackground: {
    backgroundColor: '#34d399', // Emerald/Green color
    height: 100,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 0, // Removed offset
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 250,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: -50, // Less overlap
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e2e8f0',
    borderWidth: 4,
    borderColor: '#fff', // Optional white border for separation
  },
  avatarPlaceholder: {
    backgroundColor: '#cbd5e1',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1e3a8a', // Dark blue
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  changePasswordButton: {
    backgroundColor: '#1e3a8a', // Dark blue
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  changePasswordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#34d399', // Match header green
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
