import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { AlertTriangle, ChevronLeft } from 'lucide-react-native';
import Header from '../components/Header';

function HospitalContact({ navigation }) {
  return (
    <View style={styles.container}>
      <Header theme="dark" enableLocationNav />
      
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={styles.hospitalCard}
            onPress={() => Linking.openURL('tel:09586535443')}
          >
            <View style={styles.hospitalHeader}>
              <View style={styles.warningIcon}>
                <AlertTriangle size={20} color="#dc2626" />
              </View>
              <Text style={styles.hospitalLabel}>Emergency Contact</Text>
            </View>
            <Text style={styles.hospitalNumber}>09586535443</Text>
            <Text style={styles.hospitalName}>TOLEDO GENERAL HOSPITAL</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Tap the card to call immediately
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 4,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
  },
  hospitalCard: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  warningIcon: {
    backgroundColor: 'white',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  hospitalNumber: {
    color: 'white',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
  hospitalName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  hint: {
    color: '#94a3b8',
    marginTop: 24,
    fontSize: 14,
  },
});

export default HospitalContact;
