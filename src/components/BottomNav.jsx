import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Home, PlusSquare, MessageSquare, User, Activity } from 'lucide-react-native';

function BottomNav({ state, descriptors, navigation }) {
  const navItems = [
    { icon: Home, label: 'Home', route: 'home' },
    { icon: PlusSquare, label: 'MEDIC', route: 'medic' },
    { icon: Activity, label: '', route: 'emergency', isCenter: true },
    { icon: MessageSquare, label: 'Message', route: 'message' },
    { icon: User, label: 'Profile', route: 'profile' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => {
        const isFocused = state.index === index;
        const IconComponent = item.icon;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: item.route,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(item.route);
          }
        };

        if (item.isCenter) {
          return (
            <TouchableOpacity key={index} onPress={onPress} style={styles.centerButton}>
              <View style={styles.centerButtonRing}>
                <View style={styles.centerButtonInner}>
                  <IconComponent size={34} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.navItem}
          >
            <IconComponent
              size={24}
              color={isFocused ? '#f97316' : '#94a3b8'}
            />
            {item.label && (
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? '#f97316' : '#94a3b8' },
                  { fontWeight: isFocused ? '600' : '400' }
                ]}
              >
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? 90 : 80,
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
  },
  centerButton: {
    position: 'relative',
    top: -28,
    width: 84,
    height: 84,
    backgroundColor: 'transparent',
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 16,
  },
  centerButtonRing: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonInner: {
    width: 70,
    height: 70,
    backgroundColor: '#dc2626',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default BottomNav;
