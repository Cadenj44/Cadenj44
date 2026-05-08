import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="lesson/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="puzzle/[id]" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="game/index"  options={{ animation: 'slide_from_bottom', contentStyle: { backgroundColor: '#080c18' } }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
