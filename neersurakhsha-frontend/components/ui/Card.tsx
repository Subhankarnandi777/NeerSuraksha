import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, radius, spacing, shadows } from '../../theme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'rugged' | 'alert';
}

export function Card({ children, style, variant = 'elevated', ...props }: CardProps) {
  return (
    <View style={[styles.base, styles[variant], style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
  },
  elevated: {
    ...shadows.level1,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  rugged: {
    // Replaced rugged with a standard elevated card with a subtle border
    ...shadows.level1,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  alert: {
    ...shadows.level1,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.errorContainer,
  }
});
