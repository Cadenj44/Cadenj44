import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

export default function IndexRedirect() {
  const { session, loading } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Hard fallback: if still loading after 4s, go to login anyway
    timeoutRef.current = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 4000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (session) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [session, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text style={{ fontSize: 56 }}>♟️</Text>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={{ color: Colors.textMuted, fontSize: Typography.sizes.sm }}>Loading ChessMaster…</Text>
    </View>
  );
}
