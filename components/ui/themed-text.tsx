import { StyleSheet, Text, type TextProps } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import { fontFamily, fontSize, lineHeight } from '@/theme';

type Props = TextProps & {
  variant?: 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';
  color?: 'text' | 'muted' | 'primary' | 'accent' | 'onPrimary' | 'danger' | 'success';
  bold?: boolean;
};

export function ThemedText({
  variant = 'body',
  color = 'text',
  bold = false,
  style,
  ...rest
}: Props) {
  const { colors } = useAppTheme();

  const resolvedColor =
    color === 'text'
      ? colors.text
      : color === 'muted'
        ? colors.textMuted
        : color === 'primary'
          ? colors.primary
          : color === 'accent'
            ? colors.accent
            : color === 'danger'
              ? colors.danger
              : color === 'success'
                ? colors.success
                : colors.textOnPrimary;

  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        { color: resolvedColor },
        bold && styles.bold,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fontFamily.sans,
  },
  bold: {
    fontWeight: '700',
  },
  display: {
    fontSize: fontSize.display,
    lineHeight: fontSize.display * lineHeight.tight,
  },
  title: {
    fontSize: fontSize.xxl,
    lineHeight: fontSize.xxl * lineHeight.tight,
  },
  subtitle: {
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  body: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  caption: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  label: {
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
