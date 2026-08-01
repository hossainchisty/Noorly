import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { radius, spacing } from '@/theme';

type Props = PressableProps & {
  title?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  icon?: IconName;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

export function Button({
  title,
  variant = 'primary',
  icon,
  size = 'md',
  style,
  disabled,
  children,
  ...rest
}: Props) {
  const { colors } = useAppTheme();

  const background =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.danger
        : variant === 'outline' || variant === 'secondary'
          ? colors.surface
          : 'transparent';

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? colors.textOnPrimary
      : variant === 'secondary' || variant === 'outline'
        ? colors.primary
        : colors.text;

  const hasLabel = title != null || children != null;

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background,
          borderColor: variant === 'outline' ? colors.primary : colors.border,
        },
        variant !== 'ghost' && styles.bordered,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        pressed && { opacity: 0.8 },
        disabled && { opacity: 0.4 },
        style,
      ]}
      {...rest}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 20} color={textColor} /> : null}
      {hasLabel ? (
        <ThemedText
          variant={size === 'sm' ? 'caption' : 'body'}
          bold
          color={variant === 'primary' || variant === 'danger' ? 'onPrimary' : 'primary'}
          style={[icon ? styles.labelWithIcon : null, variant === 'ghost' && { color: colors.primary }]}>
          {title ?? (children as React.ReactNode)}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  bordered: {
    borderWidth: 1,
  },
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  labelWithIcon: {
    marginLeft: spacing.xs,
  },
});
