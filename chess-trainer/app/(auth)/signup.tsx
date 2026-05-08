import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  async function handleSignup() {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await signUp(email.trim(), password, username.trim());
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      router.replace('/onboarding');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.logo}>♟️</Text>
          <Text style={styles.appName}>ChessMaster</Text>
          <Text style={styles.tagline}>Start your chess journey today</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Create your account</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="GrandMaster42"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="CREATE ACCOUNT" onPress={handleSignup} loading={loading} size="lg" />

          <View style={styles.terms}>
            <Text style={styles.termsText}>
              By creating an account you agree to our{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </View>

          <TouchableOpacity style={styles.switchRow} onPress={() => router.back()}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <Text style={[styles.switchText, styles.link]}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: 60,
    paddingBottom: 40,
    gap: Spacing['2xl'],
  },
  hero: { alignItems: 'center', gap: Spacing.sm },
  logo: { fontSize: 64, lineHeight: 72 },
  appName: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  form: { gap: Spacing.base },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  field: { gap: 6 },
  label: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: Typography.weights.semibold },
  input: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    borderWidth: 1.5,
    borderColor: Colors.bgBorder,
  },
  error: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    backgroundColor: Colors.error + '20',
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  terms: { paddingHorizontal: 8 },
  termsText: { fontSize: Typography.sizes.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  switchText: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  link: { color: Colors.secondary, fontWeight: Typography.weights.bold },
});
