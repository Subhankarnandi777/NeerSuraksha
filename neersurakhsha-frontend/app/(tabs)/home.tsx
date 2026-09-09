import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../../theme';
import { useAppStore } from '../../store/main.store';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../hooks/useLanguage';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sources, healthCases, fetchSources } = useAppStore();
  const { t } = useLanguage();
  const [sourceId, setSourceId] = useState('');

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Matches the field-map safety rule. Pending ASHA reports are included before
  // sync so the dashboard never understates a developing cluster.
  const criticalSources = useMemo(() => sources.filter((source) => {
    const pendingCases = healthCases.filter((report) => !report.synced && report.sourceId === source.id).length;
    const linkedCaseCount = source.healthCasesCount + pendingCases;
    return source.status === 'HIGH_RISK' || source.lastTestResult === 'Positive' || linkedCaseCount >= 3;
  }), [healthCases, sources]);

  useEffect(() => {
    fetchSources();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialIcons name="emergency" size={24} color={colors.primary} />
          <Text variant="header" style={styles.headerTitleText}>JALJEEVAN</Text>
        </View>
        <TouchableOpacity style={styles.callHelpBtn} activeOpacity={0.8}>
          <Text variant="caption" style={styles.callHelpText}>{t('callForHelp')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text variant="header" color="primary">{t('fieldDashboard')}</Text>
          <Text variant="body" color="onSurfaceVariant">{t('fieldDashboard')}</Text>
        </View>

        {/* Primary Action Button */}
        <View style={styles.primaryActionSection}>
          <Button
            variant="secondary"
            size="lg"
            title={t('reportNewCase')}
            icon={<MaterialIcons name="add-alert" size={32} color={colors.onSecondary} />}
            onPress={() => router.push('/health-report')}
          />
          <Text variant="body" color="onSurfaceVariant" style={styles.primaryActionSub}>
            {t('reportNewCase')}
          </Text>
        </View>

        {/* Visual Summary Grid */}
        <View style={styles.grid}>
          {/* Card 1: New Cases */}
          <Card variant="rugged" style={[styles.gridCard, isTablet && { width: '31%' }]}>
            <View style={styles.cardHeader}>
              <Text variant="caption" color="onSurfaceVariant">{t('newCases')}</Text>
              <MaterialIcons name="medical-services" size={20} color="rgba(22, 40, 57, 0.5)" />
            </View>
            <View style={styles.cardMetrics}>
              <Text style={styles.metricBig} color="primary">12</Text>
              <Text variant="body" color="onSurfaceVariant">{t('thisWeek')}</Text>
            </View>
          </Card>

          {/* Card 2: Wells Tested */}
          <Card variant="rugged" style={[styles.gridCard, isTablet && { width: '31%' }]}>
            <View style={styles.cardHeader}>
              <Text variant="caption" color="onSurfaceVariant">{t('wellsTested')}</Text>
              <MaterialIcons name="water-drop" size={20} color="rgba(22, 40, 57, 0.5)" />
            </View>
            <View style={styles.cardMetrics}>
              <Text style={styles.metricBig} color="primary">48</Text>
              <Text variant="body" color="onSurfaceVariant">{t('thisMonth')}</Text>
            </View>
          </Card>

          {/* Card 3: Critical Sources */}
          <Card style={[styles.gridCard, isTablet && { width: '31%' }, { borderColor: colors.secondary, borderWidth: 2 }]}>
            <View style={styles.cardHeader}>
              <Text variant="caption" style={{ color: colors.secondary }}>{t('criticalSources')}</Text>
              <MaterialIcons name="warning" size={20} color={colors.secondary} />
            </View>
            <View style={styles.cardMetrics}>
              <Text style={[styles.metricBig, { color: colors.secondary }]}>{criticalSources.length}</Text>
              <Text variant="body" color="onSurfaceVariant">{criticalSources.length === 1 ? t('requiresAction') : t('requireAction')}</Text>
            </View>
          </Card>
        </View>

        {/* Water Quality Test Button */}
        <View style={styles.testEntrySection}>
          <View style={styles.testEntryHeader}>
            <Text variant="title" color="primary" style={styles.testEntryTitle}>{t('waterQualityTest')}</Text>
            <Text variant="body" color="onSurfaceVariant">{t('waterQualityTest')}</Text>
          </View>

          <Card variant="rugged" style={[styles.testEntryCard, isTablet && { maxWidth: 600, alignSelf: 'center', width: '100%' }]}>
            <Text variant="body" color="onSurfaceVariant" style={{ marginBottom: 16 }}>
              Record H₂S vial tests with photographic evidence and enter manual groundwater readings.
            </Text>
            <Button
              title={t('startWaterTest')}
              variant="secondary"
              icon={<MaterialIcons name="science" size={24} color={colors.onSecondary} />}
              onPress={() => router.push('/water-test')}
            />
          </Card>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Voice Trigger FAB */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.voiceFab} activeOpacity={0.8}>
          <MaterialIcons name="mic" size={32} color={colors.onSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.edgeMargin,
    height: 56,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(22, 40, 57, 0.1)',
    backgroundColor: colors.surface,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitleText: {
    fontSize: 22,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  callHelpBtn: {
    backgroundColor: colors.errorContainer,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  callHelpText: {
    color: colors.onErrorContainer,
  },
  scrollContent: {
    paddingHorizontal: spacing.edgeMargin,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  titleSection: {
    gap: 4,
    marginBottom: spacing.lg,
  },
  primaryActionSection: {
    marginBottom: spacing.xl,
  },
  primaryActionSub: {
    textAlign: 'center',
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  gridCard: {
    width: '100%',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardMetrics: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  metricBig: {
    fontFamily: 'Montserrat',
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 52,
  },
  testEntrySection: {
    marginBottom: spacing.lg,
  },
  testEntryHeader: {
    marginBottom: spacing.md,
    gap: 4,
  },
  testEntryTitle: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(22, 40, 57, 0.1)',
    paddingBottom: 8,
  },
  testEntryCard: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  inputGroup: {
    flexDirection: 'column',
  },
  textInput: {
    height: 56,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    fontFamily: 'Inter',
    fontSize: 18,
    color: colors.onSurface,
  },
  binarySelection: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  binaryBtn: {
    flex: 1,
    height: 72,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  binaryBtnSafeActive: {
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  binaryBtnUnsafeActive: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
    borderWidth: 2,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
  },
  voiceFab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  }
});
