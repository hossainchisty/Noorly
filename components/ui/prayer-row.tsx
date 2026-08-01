import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { spacing } from '@/theme';

type Props = {
  label: string;
  time?: string;
  isNext?: boolean;
  isCurrent?: boolean;
  right?: React.ReactNode;
};

export function PrayerRow({ label, time, isNext = false, isCurrent = false, right }: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.row,
        isNext && { backgroundColor: colors.primarySoft, borderColor: colors.primary },
        isCurrent && { borderColor: colors.accent },
      ]}>
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: isNext ? colors.primary : colors.border }]} />
        <ThemedText variant="body" bold={isNext}>
          {label}
        </ThemedText>
      </View>
      {right ?? (
        <ThemedText variant="body" color={isNext ? 'primary' : 'text'} bold={isNext}>
          {time}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
