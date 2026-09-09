import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { typography, colors } from '../../theme';

export interface TextProps extends RNTextProps {
  variant?: keyof typeof typography;
  color?: keyof typeof colors;
}

export function Text({ style, variant = 'body', color = 'onBackground', ...props }: TextProps) {
  return (
    <RNText
      style={[
        typography[variant],
        { color: colors[color] as string },
        style,
      ]}
      {...props}
    />
  );
}
