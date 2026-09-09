import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { colors, spacing, radius, shadows } from '../../theme';

export interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'terracotta' | 'ghost';
  size?: 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

export function Button({ title, variant = 'primary', size = 'md', icon, loading, style, disabled, children, ...props }: ButtonProps) {
  const isOutline = variant === 'outline';
  
  let backgroundColor = colors.primary;
  let textColor = colors.onPrimary;
  let borderColor = 'transparent';

  switch (variant) {
    case 'secondary':
      backgroundColor = colors.secondary;
      textColor = colors.onSecondary;
      break;
    case 'terracotta':
      backgroundColor = colors.status.warning;
      textColor = '#ffffff';
      break;
    case 'danger':
      backgroundColor = colors.error;
      textColor = colors.onError;
      break;
    case 'outline':
      backgroundColor = 'transparent';
      textColor = colors.primary;
      borderColor = colors.outlineVariant;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      textColor = colors.primary;
      break;
    case 'primary':
    default:
      backgroundColor = colors.primary;
      textColor = colors.onPrimary;
      break;
  }

  const minHeight = size === 'lg' ? 56 : size === 'icon' ? 48 : 48;

  return (
    <View style={style}>
      <TouchableOpacity
        style={[
          styles.container,
          !isOutline && variant !== 'ghost' && !disabled && shadows.level1,
          {
            backgroundColor: disabled ? colors.surfaceVariant : backgroundColor,
            borderColor: disabled ? colors.outlineVariant : borderColor,
            borderWidth: isOutline ? 1 : 0,
            minHeight,
            width: size === 'icon' ? minHeight : undefined,
            paddingHorizontal: size === 'icon' ? 0 : spacing.lg,
            borderRadius: size === 'icon' ? 9999 : radius.md,
          },
        ]}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <View style={styles.content}>
            {icon && <View style={title || children ? styles.iconContainer : undefined}>{icon}</View>}
            {title && (
              <Text 
                variant="title" 
                style={[
                  styles.text, 
                  { 
                    color: disabled ? colors.onSurfaceVariant : textColor, 
                    fontSize: size === 'lg' ? 16 : 14,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }
                ]}
              >
                {title}
              </Text>
            )}
            {children}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  text: {
    fontWeight: '700',
  }
});
