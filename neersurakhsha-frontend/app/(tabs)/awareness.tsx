import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { colors, spacing, radius } from '../../theme';
import { useLanguage } from '../../hooks/useLanguage';

export default function AwarenessScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialIcons name="menu-book" size={24} color={colors.primary} />
          <Text variant="header" style={styles.headerTitleText}>{t('awareness')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.heroSection}>
          <Text variant="title" color="primary">Safe Water & Hygiene Guide</Text>
          <Text variant="body" color="onSurfaceVariant">
            Share these critical practices with the community to prevent waterborne diseases.
          </Text>
        </View>

        <Card style={styles.guideCard}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="clean-hands" size={28} color={colors.primary} />
          </View>
          <View style={styles.guideContent}>
            <Text variant="title" color="primary">Handwashing</Text>
            <Text variant="body" color="onSurfaceVariant">
              Wash hands with soap and water for at least 20 seconds before eating and after using the toilet.
            </Text>
          </View>
        </Card>

        <Card style={styles.guideCard}>
          <View style={[styles.iconCircle, { backgroundColor: colors.tertiaryContainer }]}>
            <MaterialIcons name="water-drop" size={28} color={colors.tertiary} />
          </View>
          <View style={styles.guideContent}>
            <Text variant="title" style={{ color: colors.tertiary }}>Boil Drinking Water</Text>
            <Text variant="body" color="onSurfaceVariant">
              Always boil water from open wells or ponds for at least 1 minute before drinking to kill harmful pathogens.
            </Text>
          </View>
        </Card>

        <Card style={styles.guideCard}>
          <View style={[styles.iconCircle, { backgroundColor: colors.errorContainer }]}>
            <MaterialIcons name="sanitizer" size={28} color={colors.error} />
          </View>
          <View style={styles.guideContent}>
            <Text variant="title" style={{ color: colors.error }}>Safe Storage</Text>
            <Text variant="body" color="onSurfaceVariant">
              Store drinking water in clean, covered containers. Use a long-handled dipper to take water out to prevent contamination from hands.
            </Text>
          </View>
        </Card>

        <Card style={styles.guideCard}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="healing" size={28} color={colors.primary} />
          </View>
          <View style={styles.guideContent}>
            <Text variant="title" color="primary">Diarrhea Management</Text>
            <Text variant="body" color="onSurfaceVariant">
              If someone has diarrhea, provide ORS (Oral Rehydration Solution) immediately and seek help at the nearest PHC.
            </Text>
          </View>
        </Card>

        <View style={styles.footerInfo}>
          <MaterialIcons name="info-outline" size={20} color={colors.onSurfaceVariant} />
          <Text variant="caption" style={{ flex: 1, marginLeft: 8 }} color="onSurfaceVariant">
            Use this information to educate households during your field visits.
          </Text>
        </View>

      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: spacing.edgeMargin,
    height: 56,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(22, 40, 57, 0.1)',
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  heroSection: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  guideCard: {
    flexDirection: 'row',
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  guideContent: {
    flex: 1,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  }
});
