import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';

function LocationScreen({ navigation }) {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('Locating...');

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setCoords({
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });
        setError('');

        let addressList = await Location.reverseGeocodeAsync(location.coords);
        if (addressList && addressList.length > 0) {
          const { city, region, country, name, street } = addressList[0];
          setAddress(`${name || street || ''}, ${city || region}, ${country}`);
        }
      } catch (err) {
        setError('Failed to fetch location');
        console.log(err);
      }
    })();
  }, []);

  const openInMaps = () => {
    const lat = coords?.lat || 10.3773;
    const lng = coords?.lng || 123.6444;
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    });
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location Map</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.coordsContainer}>
          <MapPin size={18} color="#cbd5e1" />
          <Text style={styles.coordsText}>
            {coords ? `lat ${coords.lat.toFixed(4)}, lng ${coords.lng.toFixed(4)}` : 'Using city fallback'}
          </Text>
        </View>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.mapPlaceholder}>
          <MapPin size={48} color="#cbd5e1" />
          <Text style={styles.mapPlaceholderText}>
            Map View
          </Text>
          <Text style={styles.mapPlaceholderSubtext}>
            {coords ? address : 'Fetching location...'}
          </Text>
          <TouchableOpacity style={styles.openMapsButton} onPress={openInMaps}>
            <Text style={styles.openMapsButtonText}>Open in Maps</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Note:</Text>
          <Text style={styles.infoText}>
            To display an interactive map, install expo-location and react-native-maps packages.
          </Text>
          <Text style={styles.infoText}>
            For now, you can open the location in your device's native maps app.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  coordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  coordsText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
  },
  mapPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  mapPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 24,
  },
  openMapsButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  openMapsButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default LocationScreen;
