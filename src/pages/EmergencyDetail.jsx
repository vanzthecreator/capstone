import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { ChevronLeft, Flame, Baby, Ambulance, ShieldAlert, LifeBuoy } from 'lucide-react-native';
import Header from '../components/Header';

const iconMap = {
  Flame: Flame,
  Baby: Baby,
  Ambulance: Ambulance,
  ShieldAlert: ShieldAlert,
  LifeBuoy: LifeBuoy,
};

function EmergencyDetail({ route, navigation }) {
  const { title, name, number, color, iconName } = route.params;
  const IconComponent = iconMap[iconName] || ShieldAlert;

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
            style={[styles.card, { backgroundColor: color, borderColor: color }]}
            onPress={() => Linking.openURL(`tel:${number}`)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <IconComponent size={24} color={color} />
              </View>
              <Text style={styles.cardLabel}>{title}</Text>
            </View>
            <Text style={styles.cardNumber}>{number}</Text>
            <Text style={styles.cardName}>{name}</Text>
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
  card: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  iconContainer: {
    backgroundColor: 'white',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  cardNumber: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
  cardName: {
    color: 'rgba(255,255,255,0.95)',
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

export default EmergencyDetail;
