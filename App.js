import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppContent from './src/App.jsx';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppContent />
    </GestureHandlerRootView>
  );
}
