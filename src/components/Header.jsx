import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Camera, MessageSquare, Bell } from 'lucide-react-native';
import * as Location from 'expo-location';

function Header({ theme = 'light', enableLocationNav = false }) {
  const navigation = useNavigation();
  const isDark = theme === 'dark';
  const textColor = isDark ? 'white' : '#1e293b';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';

  const [locationName, setLocationName] = useState('Locating...');

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationName('Location denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        let address = await Location.reverseGeocodeAsync(location.coords);
        
        if (address && address.length > 0) {
          const { city, region, country, name } = address[0];
          // Prefer City > Region > Name
          setLocationName(`${city || name || region}, ${country}`);
        }
      } catch (error) {
        console.log('Error fetching location:', error);
        setLocationName('Location unavailable');
      }
    })();
  }, []);

  return (
    <View style={[styles.headerContainer, { backgroundColor: isDark ? '#0f172a' : 'white' }]}>
      <View style={styles.headerContent}>
        <View style={styles.leftContainer}>
          <View style={styles.profileImage}>
            <Image
              source={require('../assets/2.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => enableLocationNav && navigation?.navigate('Location')}
            style={styles.locationContainer}
          >
            <Text style={[styles.locationLabel, { color: subTextColor }]}>Current location</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color="#f59e0b" />
              <Text style={[styles.locationText, { color: textColor }]} numberOfLines={1}>
                {locationName}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.iconContainer}>
          <Camera size={20} color={textColor} />
          <MessageSquare size={20} color={textColor} />
          <Bell size={20} color={textColor} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1100,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
  },
  locationContainer: {
    // cursor is not a valid React Native style property
  },
  locationLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontWeight: '600',
    fontSize: 14,
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
});

export default Header;
