import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState, type ComponentProps } from 'react';
import { useAppStore } from '../../store/main.store';
import { HealthCase } from '../../types/health';

const SYMPTOMS = ['Diarrhoea', 'Vomiting', 'Fever', 'Stomach pain', 'Jaundice', 'Other'];

export default function HealthReport() {
  const router = useRouter();
  const { villageName, addHealthCase, sources, syncData, selectedHealthSourceId, setSelectedHealthSourceId } = useAppStore();
  const [householdId, setHouseholdId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!selectedHealthSourceId && sources[0]) setSelectedHealthSourceId(sources[0].id);
  }, [selectedHealthSourceId, setSelectedHealthSourceId, sources]);

  const selectedSource = sources.find((source) => source.id === selectedHealthSourceId);
  const hasRequiredFields = householdId.trim().length > 0 && Boolean(selectedSource);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((current) => current.includes(symptom)
      ? current.filter((item) => item !== symptom)
      : [...current, symptom]);
  };

  const handleSubmit = () => {
    setShowErrors(true);
    if (!hasRequiredFields) return;

    const newCase: HealthCase = {
      id: Math.random().toString(36).slice(2, 11), householdId: householdId.trim(), patientName: patientName.trim(),
      age: 25, gender: 'Other', village: villageName, date: new Date().toISOString(), symptoms: selectedSymptoms,
      severity: 'Moderate', sourceId: selectedHealthSourceId, notes: '', synced: false,
    };
    addHealthCase(newCase);
    syncData().catch((error) => console.error('Auto-sync failed:', error));
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Go back">
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Report Health Case</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.card}>
              <SectionTitle icon="person" title="Patient details" />
              <TextInput style={[styles.input, showErrors && !householdId.trim() && styles.inputError]} placeholder="Household ID (e.g. H-102)" placeholderTextColor={colors.onSurfaceVariant} value={householdId} onChangeText={setHouseholdId} autoCapitalize="characters" returnKeyType="next" accessibilityLabel="Household ID" />
              {showErrors && !householdId.trim() && <Text style={styles.errorText}>Enter the household ID to continue.</Text>}
              <TextInput style={styles.input} placeholder="Patient name (optional)" placeholderTextColor={colors.onSurfaceVariant} value={patientName} onChangeText={setPatientName} autoCapitalize="words" accessibilityLabel="Patient name" />
            </View>

            <View style={styles.card}>
              <SectionTitle icon="coronavirus" title="Symptoms" />
              <Text style={styles.helperText}>Select all symptoms that apply.</Text>
              <View style={styles.symptomsGrid}>
                {SYMPTOMS.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom);
                  return <TouchableOpacity key={symptom} style={[styles.symptomChip, isSelected && styles.symptomChipActive]} onPress={() => toggleSymptom(symptom)} accessibilityRole="checkbox" accessibilityState={{ checked: isSelected }}>
                    {isSelected && <MaterialIcons name="check" size={16} color={colors.onPrimary} />}
                    <Text style={[styles.symptomText, isSelected && styles.symptomTextActive]}>{symptom}</Text>
                  </TouchableOpacity>;
                })}
              </View>
            </View>

            <View style={styles.card}>
              <SectionTitle icon="water-drop" title="Primary water source" />
              <View style={styles.notice}><MaterialIcons name="info-outline" size={18} color={colors.onErrorContainer} /><Text style={styles.noticeText}>A water source is required for every health report.</Text></View>
              <TouchableOpacity style={[styles.sourceSelector, showErrors && !selectedSource && styles.sourceError]} onPress={() => router.push('/health-report/select-source')} accessibilityRole="button" accessibilityLabel="Select primary water source">
                <View style={styles.sourceIcon}><MaterialIcons name="water" size={22} color={colors.primary} /></View>
                <View style={styles.sourceCopy}><Text style={styles.sourceLabel}>Linked source</Text><Text style={styles.sourceName} numberOfLines={1}>{selectedSource?.name ?? 'Select a water source'}</Text></View>
                <MaterialIcons name="chevron-right" size={26} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
              {showErrors && !selectedSource && <Text style={styles.errorText}>Select a water source to continue.</Text>}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}><TouchableOpacity style={[styles.submitBtn, !hasRequiredFields && styles.submitBtnDisabled]} onPress={handleSubmit} accessibilityRole="button"><Text style={styles.submitBtnText}>Submit health report</Text><MaterialIcons name="arrow-forward" size={20} color={colors.onPrimary} /></TouchableOpacity></View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SectionTitle({ icon, title }: { icon: ComponentProps<typeof MaterialIcons>['name']; title: string }) {
  return <View style={styles.sectionHeader}><View style={styles.sectionIcon}><MaterialIcons name={icon} size={21} color={colors.primary} /></View><Text style={styles.sectionTitle}>{title}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, container: { flex: 1 },
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  iconButton: { width: 44, height: 44, marginRight: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 22 }, headerTitle: { ...typography.subtitle, flex: 1, color: colors.onSurface },
  content: { flexGrow: 1, padding: spacing.md, paddingBottom: spacing.xl }, form: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.md },
  card: { padding: spacing.md, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.outlineVariant }, sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }, sectionIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainer }, sectionTitle: { ...typography.subtitle, color: colors.onSurface },
  input: { minHeight: 52, paddingHorizontal: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, backgroundColor: colors.surfaceContainerLow, color: colors.onSurface, fontFamily: 'Inter_400Regular', fontSize: 16 }, inputError: { borderColor: colors.error, borderWidth: 2 }, errorText: { marginTop: -4, marginBottom: 10, color: colors.error, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  helperText: { marginTop: -4, marginBottom: 12, color: colors.onSurfaceVariant, fontFamily: 'Inter_400Regular', fontSize: 14 }, symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, symptomChip: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow }, symptomChipActive: { backgroundColor: colors.primary, borderColor: colors.primary }, symptomText: { color: colors.onSurfaceVariant, fontFamily: 'Inter_600SemiBold', fontSize: 14 }, symptomTextActive: { color: colors.onPrimary },
  notice: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 12, padding: 10, borderRadius: 10, backgroundColor: colors.errorContainer }, noticeText: { flex: 1, color: colors.onErrorContainer, fontFamily: 'Inter_600SemiBold', fontSize: 13, lineHeight: 19 }, sourceSelector: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, borderColor: colors.outline, borderRadius: 12, backgroundColor: colors.surfaceContainerLow }, sourceError: { borderColor: colors.error, borderWidth: 2 }, sourceIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryFixed }, sourceCopy: { flex: 1, minWidth: 0 }, sourceLabel: { color: colors.onSurfaceVariant, fontFamily: 'Inter_400Regular', fontSize: 12 }, sourceName: { marginTop: 2, color: colors.onSurface, fontFamily: 'Inter_700Bold', fontSize: 16 },
  footer: { paddingHorizontal: spacing.md, paddingVertical: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant }, submitBtn: { minHeight: 52, maxWidth: 720, width: '100%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderRadius: 12, backgroundColor: colors.primary }, submitBtnDisabled: { opacity: 0.6 }, submitBtnText: { color: colors.onPrimary, fontFamily: 'Inter_700Bold', fontSize: 16 },
});
