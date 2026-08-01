import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/ui/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { DEFAULT_TASBEEH_PHRASES, useTasbeehStore } from '@/store/tasbeeh-store';
import { radius, spacing } from '@/theme';

const TARGETS = [33, 99, 100];

export default function TasbeehScreen() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const currentPhrase = useTasbeehStore((s) => s.currentPhrase);
  const count = useTasbeehStore((s) => s.count);
  const target = useTasbeehStore((s) => s.target);
  const history = useTasbeehStore((s) => s.history);
  const customPhrases = useTasbeehStore((s) => s.customPhrases);
  const { setPhrase, setTarget, increment, reset, completeAndLog, addCustomPhrase, clearHistory } =
    useTasbeehStore();

  const [customInput, setCustomInput] = useState('');

  const phrases = [...DEFAULT_TASBEEH_PHRASES, ...customPhrases];

  const onIncrement = () => {
    Haptics.selectionAsync();
    increment();
  };

  const onReset = () => {
    if (count > 0) completeAndLog();
    reset();
  };

  const onAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    addCustomPhrase(trimmed);
    setPhrase(trimmed);
    setCustomInput('');
  };

  const progress = Math.min(count / target, 1);

  return (
    <Screen>
      <ThemedText variant="subtitle" bold style={styles.phrase}>
        {currentPhrase}
      </ThemedText>

      <Card style={styles.counterCard}>
        <Pressable
          onPress={onIncrement}
          onLongPress={onReset}
          style={({ pressed }) => [
            styles.counter,
            { backgroundColor: colors.primarySoft },
            pressed && { backgroundColor: colors.primary },
          ]}>
          <ThemedText variant="display" bold color="primary" style={styles.count}>
            {count}
          </ThemedText>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${progress * 100}%` },
              ]}
            />
          </View>
          <ThemedText variant="caption" color="muted">
            {t('tasbeeh.target')}: {target} · {t('tasbeeh.count')}
          </ThemedText>
        </Pressable>
      </Card>

      <View style={styles.targetRow}>
        {TARGETS.map((value) => (
          <Pressable
            key={value}
            onPress={() => setTarget(value)}
            style={[
              styles.targetPill,
              {
                backgroundColor: target === value ? colors.primary : colors.surface,
                borderColor: target === value ? colors.primary : colors.border,
              },
            ]}>
            <ThemedText bold color={target === value ? 'onPrimary' : 'text'}>
              {value}
            </ThemedText>
          </Pressable>
        ))}
        <Button variant="ghost" title={t('tasbeeh.reset')} icon="refresh-outline" size="sm" onPress={onReset} />
      </View>

      <ThemedText variant="label" color="muted" style={styles.sectionTitle}>
        {t('tasbeeh.presets')}
      </ThemedText>
      <View style={styles.phraseRow}>
        {phrases.map((phrase) => (
          <Pressable
            key={phrase}
            onPress={() => setPhrase(phrase)}
            style={[
              styles.phrasePill,
              {
                backgroundColor: currentPhrase === phrase ? colors.primary : colors.surface,
                borderColor: currentPhrase === phrase ? colors.primary : colors.border,
              },
            ]}>
            <ThemedText variant="caption" bold color={currentPhrase === phrase ? 'onPrimary' : 'text'}>
              {phrase}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.customRow}>
        <TextInput
          value={customInput}
          onChangeText={setCustomInput}
          placeholder={t('tasbeeh.custom')}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
          ]}
        />
        <Button variant="primary" icon="add" onPress={onAddCustom} />
      </View>

      {history.length > 0 ? (
        <>
          <ThemedText variant="label" color="muted" style={styles.sectionTitle}>
            {t('tasbeeh.history')}
          </ThemedText>
          <Card padded={false}>
            {history.slice(0, 6).map((entry) => (
              <View
                key={entry.id}
                style={[
                  styles.historyRow,
                  { borderBottomColor: colors.border },
                ]}>
                <ThemedText variant="caption" bold style={{ flex: 1 }}>
                  {entry.phrase}
                </ThemedText>
                <ThemedText variant="caption" color="muted">
                  {entry.count} / {entry.target}
                </ThemedText>
              </View>
            ))}
          </Card>
          <Button
            variant="ghost"
            title={t('tasbeeh.clearHistory')}
            size="sm"
            onPress={() => {
              Alert.alert(t('settings.resetConfirm'), undefined, [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.ok'), style: 'destructive', onPress: clearHistory },
              ]);
            }}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  phrase: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  counterCard: {
    marginBottom: spacing.lg,
  },
  counter: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  count: {
    fontSize: 64,
  },
  progressTrack: {
    height: 6,
    width: '70%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  targetPill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  phraseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  phrasePill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  customRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
});
