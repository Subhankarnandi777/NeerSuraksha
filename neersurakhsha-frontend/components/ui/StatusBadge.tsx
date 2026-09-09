import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, radius, spacing } from '../../theme';

type StatusType = 'safe' | 'warning' | 'danger' | 'info';

export interface StatusBadgeProps {
  status: StatusType;
  label: string;
  style?: ViewStyle;
}

export function StatusBadge({ status, label, style }: StatusBadgeProps) {
  const getColors = () => {
    switch (status) {
      case 'safe': return { bg: colors.status.safeBg, text: colors.status.safe };
      case 'warning': return { bg: colors.status.warningBg, text: colors.status.warning };
      case 'danger': return { bg: colors.status.dangerBg, text: colors.status.danger };
      case 'info':
      default: return { bg: colors.status.infoBg, text: colors.status.info };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text variant="small" style={{ color: text, fontWeight: '700' }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  }
});
