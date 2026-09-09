import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AlertDetails() {
  const { alertId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Alert Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.hero}>
          <Ionicons name="warning" size={48} color={colors.error} />
          <Text style={styles.heroTitle}>HIGH RISK ALERT</Text>
          <Text style={styles.heroSubtitle}>Water Source: HP-007</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>WHY?</Text>
          <View style={styles.reasonList}>
            <View style={styles.reasonItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.error} />
              <Text style={styles.reasonText}>8 diarrhoea cases reported today</Text>
            </View>
            <View style={styles.reasonItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.error} />
              <Text style={styles.reasonText}>H₂S contamination tested positive</Text>
            </View>
            <View style={styles.reasonItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.error} />
              <Text style={styles.reasonText}>Rapid groundwater rise detected</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>RECOMMENDED ACTION</Text>
          <View style={styles.actionList}>
            <Text style={styles.actionItem}>1. Avoid using this source immediately</Text>
            <Text style={styles.actionItem}>2. Direct households to use School Tubewell (450m)</Text>
            <Text style={styles.actionItem}>3. Retest within 48 hours</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ackBtn} onPress={() => router.back()}>
          <Ionicons name="checkmark-done" size={24} color={colors.surface} />
          <Text style={styles.ackBtnText}>ACKNOWLEDGE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  title: {
    ...typography.title,
    color: colors.onSurface,
  },
  content: {
    padding: 20,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  heroTitle: {
    ...typography.header,
    color: colors.error,
    marginTop: 12,
  },
  heroSubtitle: {
    ...typography.subtitle,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.onSurfaceVariant,
    marginBottom: 16,
  },
  reasonList: {
    gap: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reasonText: {
    ...typography.body,
    color: colors.onSurface,
  },
  actionList: {
    gap: 12,
  },
  actionItem: {
    ...typography.body,
    color: colors.onSurface,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  ackBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  ackBtnText: {
    ...typography.subtitle,
    color: colors.surface,
  }
});
