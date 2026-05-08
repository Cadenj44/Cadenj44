import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle, View,
} from 'react-native';
import { Colors, Typography, Radius, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<Variant, { bg: string; border?: string; text: string; shadow?: string }> = {
  primary:   { bg: Colors.primary,    text: '#fff', shadow: Colors.primaryDark },
  secondary: { bg: Colors.secondary,  text: '#fff', shadow: Colors.secondaryDark },
  outline:   { bg: 'transparent', border: Colors.primary,   text: Colors.primary },
  ghost:     { bg: 'transparent', text: Colors.textSecondary },
  danger:    { bg: Colors.error,      text: '#fff', shadow: '#CC3333' },
};

const SIZE_STYLES: Record<Size, { px: number; py: number; fs: number; radius: number }> = {
  sm: { px: 16, py: 8,  fs: Typography.sizes.sm,   radius: Radius.md },
  md: { px: 24, py: 14, fs: Typography.sizes.base,  radius: Radius.lg },
  lg: { px: 32, py: 17, fs: Typography.sizes.md,    radius: Radius.xl },
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];

  return (
    <View style={[fullWidth && styles.fullWidth, style]}>
      {/* Shadow layer */}
      {v.shadow && (
        <View style={[
          styles.shadow,
          { backgroundColor: v.shadow, borderRadius: s.radius, bottom: -4 },
        ]} />
      )}
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[
          styles.button,
          {
            backgroundColor: v.bg,
            borderRadius: s.radius,
            paddingHorizontal: s.px,
            paddingVertical: s.py,
            borderWidth: v.border ? 2 : 0,
            borderColor: v.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.text} size="small" />
        ) : (
          <View style={styles.inner}>
            {icon && <Text style={{ fontSize: s.fs }}>{icon}</Text>}
            <Text style={[styles.label, { color: v.text, fontSize: s.fs }, textStyle]}>
              {label}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: {
    fontWeight: Typography.weights.extrabold,
    letterSpacing: 0.3,
  },
});
