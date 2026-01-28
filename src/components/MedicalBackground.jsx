import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Stethoscope, Syringe, Pill, Heart, Activity, Thermometer, Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

function MedicalBackground({ children }) {
  return (
    <View style={styles.container}>
      {/* Background Decor */}
      <View style={styles.decorContainer}>
        {/* Top Left Cluster */}
        <Syringe size={48} color="white" style={[styles.icon, { top: 40, left: 20, transform: [{ rotate: '45deg' }] }]} />
        <Pill size={32} color="white" style={[styles.icon, { top: 90, left: 60, transform: [{ rotate: '-15deg' }] }]} />
        <Plus size={24} color="white" style={[styles.icon, { top: 30, left: 80, opacity: 0.6 }]} />
        
        {/* Top Center Cluster */}
        <Heart size={56} color="white" fill="rgba(255,255,255,0.3)" style={[styles.icon, { top: 50, left: width / 2 - 28 }]} />
        <Activity size={32} color="white" style={[styles.icon, { top: 110, left: width / 2 + 20, transform: [{ rotate: '15deg' }] }]} />

        {/* Top Right Cluster */}
        <Stethoscope size={64} color="white" style={[styles.icon, { top: 20, right: -10, transform: [{ rotate: '-30deg' }] }]} />
        <Thermometer size={40} color="white" style={[styles.icon, { top: 100, right: 50, transform: [{ rotate: '20deg' }] }]} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CCFBF1', // Teal-100 equivalent, nice minty/cyan color
  },
  decorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300, // Cover top portion
    overflow: 'hidden',
    zIndex: 0,
  },
  icon: {
    position: 'absolute',
    opacity: 0.8,
    shadowColor: '#2dd4bf',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default MedicalBackground;
