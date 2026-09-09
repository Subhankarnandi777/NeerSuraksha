import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '../../store/main.store';
import { useLanguage } from '../../hooks/useLanguage';
import { useState } from 'react';

export default function SyncCenter() {
  const { pendingSyncCount, syncData, healthCases } = useAppStore();
  const { t } = useLanguage();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncData();
    setIsSyncing(false);
  };

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('syncCenter')}</Text>
        </View>

        <View style={[styles.content, isTablet && { maxWidth: 600, alignSelf: 'center', width: '100%' }]}>
          <View style={styles.networkCard}>
            <Text style={styles.networkLabel}>{t('networkStatus')}</Text>
            <View style={styles.networkStatus}>
              <View style={styles.offlineDot} />
              <Text style={styles.networkText}>{t('offlineStorage')}</Text>
            </View>
          </View>

          <View style={styles.queueCard}>
            <Text style={styles.queueTitle}>{t('pendingData')}</Text>
            
            <View style={styles.queueItem}>
              <MaterialIcons name="medical-services" size={24} color={colors.onSurfaceVariant} />
              <Text style={styles.queueItemText}>{t('healthReports')}</Text>
              <Text style={styles.queueItemCount}>{healthCases.length + 3}</Text>
            </View>

            <View style={styles.queueItem}>
              <MaterialIcons name="science" size={24} color={colors.onSurfaceVariant} />
              <Text style={styles.queueItemText}>{t('waterTests')}</Text>
              <Text style={styles.queueItemCount}>2</Text>
            </View>

            <View style={styles.queueItem}>
              <MaterialIcons name="water-drop" size={24} color={colors.onSurfaceVariant} />
              <Text style={styles.queueItemText}>{t('groundwaterReadings')}</Text>
              <Text style={styles.queueItemCount}>1</Text>
            </View>

            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>{t('totalPending')}</Text>
              <Text style={styles.totalCount}>{pendingSyncCount}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
            onPress={handleSync}
            disabled={isSyncing || pendingSyncCount === 0}
          >
            {isSyncing ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <>
                <MaterialIcons name="sync" size={24} color={colors.surface} />
                <Text style={styles.syncBtnText}>{t('syncNow')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.edgeMargin,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(22, 40, 57, 0.1)',
  },
  title: {
    ...typography.h2,
    color: colors.primary,
  },
  content: {
    padding: spacing.edgeMargin,
  },
  networkCard: {
    backgroundColor: colors.errorContainer,
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.error,
  },
  networkLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    color: colors.error,
    marginBottom: 8,
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  networkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.error,
  },
  queueCard: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: 20,
    borderRadius: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  queueTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 16,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  queueItemText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurface,
    flex: 1,
  },
  queueItemCount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: colors.onSurfaceVariant,
  },
  divider: {
    height: 2,
    backgroundColor: 'rgba(22, 40, 57, 0.1)',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: colors.onSurface,
  },
  totalCount: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24,
    color: colors.primary,
  },
  syncBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  syncBtnDisabled: {
    opacity: 0.7,
  },
  syncBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: 1,
    color: colors.onPrimary,
  }
});
