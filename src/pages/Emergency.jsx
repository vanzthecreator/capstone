import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, useWindowDimensions } from 'react-native';
import Header from '../components/Header';
import { Stethoscope, Flame, Baby, Ambulance, ShieldAlert, LifeBuoy } from 'lucide-react-native';

function Emergency({ navigation }) {
  const { width } = useWindowDimensions();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Calculate grid item width
  // (Screen Width - Horizontal Padding (32) - Gaps (2 * 12)) / 3
  const PADDING = 32;
  const GAP = 12;
  const availableWidth = width - PADDING;
  const itemWidth = (availableWidth - (GAP * 2)) / 3;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const safetyNumbers = [
    { icon: Stethoscope, label: 'Medical' },
    { 
      icon: Flame, 
      label: 'Fire', 
      params: {
        title: 'Fire Emergency',
        name: 'BFP TOLEDO CITY',
        number: '09662165466',
        color: '#ea580c', // Orange-600
        iconName: 'Flame'
      }
    },
    { 
      icon: Baby, 
      label: 'Child protection',
      params: {
        title: 'Child Protection',
        name: 'TOLEDO CITY WCPD',
        number: '09156426842',
        color: '#db2777', // Pink-600
        iconName: 'Baby'
      }
    },
    { 
      icon: Ambulance, 
      label: 'Accident',
      params: {
        title: 'Accident Response',
        name: 'TOLEDO CITY CDRRMO',
        number: '09610546250',
        color: '#dc2626', // Red-600
        iconName: 'Ambulance'
      }
    },
    { 
      icon: ShieldAlert, 
      label: 'Violence',
      params: {
        title: 'Violence Report',
        name: 'TOLEDO CITY PNP',
        number: '09156426842',
        color: '#7c3aed', // Violet-600
        iconName: 'ShieldAlert'
      }
    },
    { 
      icon: LifeBuoy, 
      label: 'Rescue',
      params: {
        title: 'Disaster Rescue',
        name: 'TOLEDO CITY RESCUE',
        number: '09568174215',
        color: '#0891b2', // Cyan-600
        iconName: 'LifeBuoy'
      }
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Header theme="dark" enableLocationNav />

      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Are you in an {'\n'}emergency?
          </Text>
          <Text style={styles.heroText}>
            You may send a message directly to the emergency department through this app for immediate assistance.
          </Text>
        </View>

        <View style={styles.pulseContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.centerButton}>
              <ShieldAlert size={32} color="white" />
              <Text style={styles.centerButtonText}>LifeSignal</Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.safetySection}>
          <Text style={styles.safetyTitle}>Public Safety Numbers</Text>
          <View style={styles.safetyGrid}>
            {safetyNumbers.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.safetyButton, { width: itemWidth }]}
                  onPress={() => {
                    if (item.label === 'Medical') {
                      navigation.navigate('HospitalContact');
                    } else if (item.params) {
                      navigation.navigate('EmergencyDetail', item.params);
                    }
                  }}
                >
                  {IconComponent ? <IconComponent size={14} color="#000" /> : null}
                  <Text style={styles.safetyLabel}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 16,
    position: 'relative',
    zIndex: 1,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  heroText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 21,
    maxWidth: '60%',
  },
  pulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 48,
  },
  pulseRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  centerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
  },
  safetySection: {
    marginTop: 32,
  },
  safetyTitle: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 16,
  },
  safetyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  safetyButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  safetyLabel: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Emergency;
