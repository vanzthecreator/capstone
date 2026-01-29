import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, useWindowDimensions, Image } from 'react-native';
import Header from '../components/Header';
import { Stethoscope, Flame, Baby, Ambulance, ShieldAlert, LifeBuoy, Phone, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

function Emergency({ navigation }) {
  const { width } = useWindowDimensions();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const breatheAnim = useRef(new Animated.Value(0.3)).current;

  // Calculate grid item width for 3 columns
  const PADDING = 40;
  const GAP = 16;
  const availableWidth = width - PADDING;
  const itemWidth = (availableWidth - (GAP * 2)) / 3;

  useEffect(() => {
    // Slower, calming pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Breathing glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 0.6,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0.3,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, breatheAnim]);

  const safetyNumbers = [
    { 
      icon: Stethoscope, 
      label: 'Medical',
      color: '#10b981',
      bgColor: '#ecfdf5'
    },
    { 
      icon: Flame, 
      label: 'Fire', 
      color: '#f59e0b',
      bgColor: '#fffbeb',
      params: {
        title: 'Fire Emergency',
        name: 'BFP TOLEDO CITY',
        number: '09662165466',
        color: '#f59e0b',
        iconName: 'Flame'
      }
    },
    { 
      icon: Baby, 
      label: 'Child Care',
      color: '#ec4899',
      bgColor: '#fdf2f8',
      params: {
        title: 'Child Protection',
        name: 'TOLEDO CITY WCPD',
        number: '09156426842',
        color: '#ec4899',
        iconName: 'Baby'
      }
    },
    { 
      icon: Ambulance, 
      label: 'Accident',
      color: '#ef4444',
      bgColor: '#fef2f2',
      params: {
        title: 'Accident Response',
        name: 'TOLEDO CITY CDRRMO',
        number: '09610546250',
        color: '#ef4444',
        iconName: 'Ambulance'
      }
    },
    { 
      icon: ShieldAlert, 
      label: 'Violence',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      params: {
        title: 'Violence Report',
        name: 'TOLEDO CITY PNP',
        number: '09156426842',
        color: '#8b5cf6',
        iconName: 'ShieldAlert'
      }
    },
    { 
      icon: LifeBuoy, 
      label: 'Rescue',
      color: '#06b6d4',
      bgColor: '#ecfeff',
      params: {
        title: 'Disaster Rescue',
        name: 'TOLEDO CITY RESCUE',
        number: '09568174215',
        color: '#06b6d4',
        iconName: 'LifeBuoy'
      }
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3a5f', '#0f172a', '#1a1a2e']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header theme="dark" enableLocationNav />

        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>
                Stay Calm.{'\n'}We're Here to Help.
              </Text>
              <Text style={styles.heroText}>
                Press the button below to send an emergency alert. Help is on the way.
              </Text>
            </View>
            
            {/* Logo/Asset Display */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/2.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Main Emergency Button */}
          <View style={styles.pulseContainer}>
            {/* Outer glow rings */}
            <Animated.View style={[styles.glowRing3, { opacity: breatheAnim }]} />
            <Animated.View style={[styles.glowRing2, { opacity: breatheAnim }]} />
            <Animated.View style={[styles.glowRing1, { opacity: breatheAnim }]} />
            
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <TouchableOpacity style={styles.centerButton} activeOpacity={0.8}>
                <View style={styles.buttonInner}>
                  <Heart size={36} color="white" fill="white" />
                  <Text style={styles.centerButtonText}>SOS</Text>
                  <Text style={styles.centerButtonSubtext}>Tap for Help</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Reassurance Message */}
          <View style={styles.reassuranceContainer}>
            <Text style={styles.reassuranceText}>
              Take a deep breath. You are not alone.
            </Text>
          </View>

          {/* Safety Numbers Section */}
          <View style={styles.safetySection}>
            <View style={styles.sectionHeader}>
              <Phone size={18} color="#94a3b8" />
              <Text style={styles.safetyTitle}>Emergency Contacts</Text>
            </View>
            
            <View style={styles.safetyGrid}>
              {safetyNumbers.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.safetyButton, { width: itemWidth }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (item.label === 'Medical') {
                        navigation.navigate('HospitalContact');
                      } else if (item.params) {
                        navigation.navigate('EmergencyDetail', item.params);
                      }
                    }}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                      <IconComponent size={20} color={item.color} />
                    </View>
                    <Text style={styles.safetyLabel}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bottom Tip */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>
              Your location will be shared automatically with responders
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
  heroSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  heroText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  pulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    height: 220,
  },
  glowRing3: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  glowRing2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  glowRing1: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
  },
  pulseRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: 'hidden',
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  centerButtonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 22,
    marginTop: 4,
    letterSpacing: 2,
  },
  centerButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  reassuranceContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  reassuranceText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  safetySection: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  safetyTitle: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  safetyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  safetyButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyLabel: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tipContainer: {
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  tipText: {
    fontSize: 12,
    color: '#6ee7b7',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default Emergency;
