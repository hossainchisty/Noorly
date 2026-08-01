import { useRef } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ui/themed-view';
import { useAppTheme } from '@/hooks/use-app-theme';
import { layout, spacing } from '@/theme';

type Props = {
  children: React.ReactNode;
  padded?: boolean;
  scrollable?: boolean;
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
};

export function Screen({
  children,
  padded = true,
  scrollable = true,
  onRefresh,
  refreshing = false,
  style,
  contentContainerStyle,
}: Props) {
  const { colors } = useAppTheme();
  const refreshRef = useRef(onRefresh);

  if (!scrollable) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }, style]} edges={['top', 'bottom']}>
        <ThemedView style={[styles.static, padded && styles.padding, contentContainerStyle]}>
          {children}
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }, style]} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[padded && styles.padding, contentContainerStyle]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refreshRef.current?.()}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function LoadingScreen({ label }: { label?: string }) {
  const { colors } = useAppTheme();
  return (
    <ThemedView style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  static: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
