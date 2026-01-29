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
    borderTopWidth: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? 90 : 80,
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  centerButton: {
    position: 'relative',
    top: -30,
    width: 80,
    height: 80,
    backgroundColor: 'transparent',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
  centerButtonRing: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonInner: {
    width: 66,
    height: 66,
    backgroundColor: '#dc2626',
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
});

export default BottomNav;
