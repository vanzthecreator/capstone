import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './config/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { View, ActivityIndicator, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GetStarted from './pages/GetStarted';
import Emergency from './pages/Emergency';
import HospitalContact from './pages/HospitalContact';
import EmergencyDetail from './pages/EmergencyDetail';
import AuthChoice from './pages/AuthChoice';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Medic from './pages/Medic';
import Message from './pages/Message';
import Chat from './pages/Chat';
import AddFriend from './pages/AddFriend';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Location from './pages/Location';
import FirstAidDetail from './pages/FirstAidDetail';
import BottomNav from './components/BottomNav';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Create a context for authentication
export const AuthContext = React.createContext();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GetStarted" component={GetStarted} />
      <Stack.Screen name="AuthChoice" component={AuthChoice} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={Home} />
    </Stack.Navigator>
  );
}

function MedicStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MedicScreen" component={Medic} />
      <Stack.Screen name="FirstAidDetail" component={FirstAidDetail} />
    </Stack.Navigator>
  );
}

function MessageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessageList" component={Message} />
      <Stack.Screen name="AddFriend" component={AddFriend} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={Profile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  );
}

function EmergencyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmergencyScreen" component={Emergency} />
      <Stack.Screen name="HospitalContact" component={HospitalContact} />
      <Stack.Screen name="EmergencyDetail" component={EmergencyDetail} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="home" component={HomeStack} />
      <Tab.Screen name="medic" component={MedicStack} />
      <Tab.Screen name="emergency" component={EmergencyStack} />
      <Tab.Screen name="message" component={MessageStack} />
      <Tab.Screen name="profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Set online status
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            isOnline: true,
            lastSeen: serverTimestamp()
          });
        } catch (error) {
          console.error("Error setting online status:", error);
        }
      }
    });

    // App State Listener for Online/Offline
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        if (nextAppState === 'active') {
          updateDoc(userRef, { isOnline: true, lastSeen: serverTimestamp() });
        } else {
          updateDoc(userRef, { isOnline: false, lastSeen: serverTimestamp() });
        }
      }
    });

    return () => {
      unsubscribe();
      subscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const authContext = {
    user,
    isLoggedIn: !!user,
    reloadUser: async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        setUser({ ...auth.currentUser });
      }
    }
  };

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Auth" component={AuthStack} />
          ) : (
            <>
              <Stack.Screen name="Main" component={AppTabs} />
              <Stack.Screen name="Location" component={Location} />
              <Stack.Screen name="Chat" component={Chat} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
