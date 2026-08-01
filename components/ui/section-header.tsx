import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { spacing } from '@/theme';

type Props = {
  title: string;
  right?: React.ReactNode;
};

export function SectionHeader({ title, right }: Props) {
  return (
    <View style={styles.row}>
      <ThemedText variant="subtitle" bold>
        {title}
      </ThemedText>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
});
