import { View, Text, StyleSheet, ScrollView, TouchableOpacity, DimensionValue, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function AlertsDashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Chlorinate Well 12', subtitle: 'Critical Response Protocol', assignee: 'PHC Officer Sharma', loc: 'Ward 4', due: '2 Hrs Overdue', completed: false, critical: true },
    { id: 2, title: 'Distribute ORS Packets', subtitle: 'Target: 500 households in affected zone', assignee: 'ASHA Worker Team A', loc: 'Riverside Settlement', due: 'Today, 17:00', completed: false, critical: false },
    { id: 3, title: 'Broadcast SMS Warning', subtitle: 'Sent to 4,200 registered numbers', assignee: 'System Automated', loc: 'District Wide', due: 'Done 09:15', completed: true, critical: false }
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id && !t.completed && id !== 3 ? { ...t, completed: !t.completed } : t));
  };

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* Header matching Map / Home */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="emergency" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>JALJEEVAN</Text>
          <TouchableOpacity style={styles.helpButton}>
            <MaterialIcons name="call" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Title & Status */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Early Warning Center</Text>
            <Text style={styles.pageSubtitle}>Authority View • Active Monitoring</Text>
          </View>
          <View style={styles.syncBadge}>
            <MaterialIcons name="sync" size={16} color={colors.secondary} />
            <Text style={styles.syncText}>Last Updated: Just Now</Text>
          </View>
        </View>

        {/* Critical Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="priority-high" size={24} color={colors.error} />
            <Text style={styles.sectionTitle}>Critical Alerts</Text>
          </View>

          <View style={[styles.alertsGrid, isTablet && { flexDirection: 'row', flexWrap: 'wrap' }]}>
            {/* Alert 1 */}
            <View style={[styles.alertCard, styles.alertCardCritical, isTablet && { width: '48%' }]}>
              <View style={styles.alertCardHeader}>
                <View style={styles.alertTypeBadge}>
                  <MaterialIcons name="warning" size={16} color={colors.onErrorContainer} />
                  <Text style={styles.alertTypeText}>PREDICTED OUTBREAK</Text>
                </View>
                <View style={styles.timeBadgeCritical}>
                  <Text style={styles.timeBadgeTextCritical}>T-48h</Text>
                </View>
              </View>
              <Text style={styles.alertHeadline}>Diarrhoea Cluster Detected</Text>
              <Text style={styles.alertLocation}>
                <MaterialIcons name="location-on" size={16} color={colors.onErrorContainer} /> Ward 4, Riverside
              </Text>
              <View style={styles.alertActions}>
                <TouchableOpacity style={[styles.actionButtonPrimary, { backgroundColor: colors.error, borderColor: colors.error }]}>
                  <Text style={styles.actionButtonPrimaryText}>Initiate Response</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Alert 2 */}
            <View style={[styles.alertCard, styles.alertCardWarning, isTablet && { width: '48%' }]}>
              <View style={styles.alertCardHeader}>
                <View style={styles.alertTypeBadge}>
                  <MaterialIcons name="water-drop" size={16} color={colors.secondary} />
                  <Text style={[styles.alertTypeText, { color: colors.secondary }]}>QUALITY DROP</Text>
                </View>
              </View>
              <Text style={[styles.alertHeadline, { color: colors.secondary }]}>Turbidity Spike</Text>
              <Text style={[styles.alertLocation, { color: colors.secondary }]}>
                <MaterialIcons name="location-on" size={16} color={colors.secondary} /> Borewell #12, Market Square
              </Text>
              <View style={styles.alertActions}>
                <TouchableOpacity style={[styles.actionButtonSecondary, { borderColor: colors.secondary }]}>
                  <Text style={[styles.actionButtonSecondaryText, { color: colors.secondary }]}>Dispatch Technician</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* DWLR Network Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="sensors" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>DWLR Network Status</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.networkHeader}>
              <View>
                <Text style={styles.networkPercent}>94%</Text>
                <Text style={styles.networkSubtitle}>NETWORK INTEGRITY</Text>
              </View>
              <View style={styles.networkIcon}>
                <MaterialIcons name="check-circle" size={32} color={colors.tertiary} />
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Active Sensors</Text>
                <Text style={styles.progressValue}>142 / 150</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '94%' }]} />
              </View>
            </View>

            <View style={styles.sensorIssues}>
              <View style={styles.sensorIssueOffline}>
                <MaterialIcons name="wifi-off" size={18} color={colors.error} />
                <Text style={styles.sensorIssueText}>Sensor #42 Offline</Text>
                <Text style={styles.sensorIssueTime}>2h</Text>
              </View>
              <View style={styles.sensorIssueLowBat}>
                <MaterialIcons name="battery-alert" size={18} color={colors.secondary} />
                <Text style={styles.sensorIssueText}>Sensor #88 Low Bat</Text>
                <Text style={styles.sensorIssueBatValue}>12%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Timeline Correlation */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="analytics" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Rainfall vs. Disease Reports (7-Day)</Text>
          </View>

          <View style={[styles.card, styles.chartCard]}>
            <View style={styles.chartArea}>
              <View style={styles.yAxis}>
                <Text style={styles.axisLabel}>High</Text>
                <Text style={styles.axisLabel}>Med</Text>
                <Text style={styles.axisLabel}>Low</Text>
              </View>
              <View style={styles.chartBars}>
                {/* Simulated Chart Data */}
                {[
                  { day: 'Mon', rain: '20%', disease: '10%' },
                  { day: 'Tue', rain: '40%', disease: '25%' },
                  { day: 'Wed', rain: '80%', disease: '60%', alert: true },
                  { day: 'Thu', rain: '95%', disease: '70%', alert: true, highlight: true },
                  { day: 'Fri', rain: '60%', disease: '65%' },
                  { day: 'Sat', rain: '30%', disease: '45%' },
                  { day: 'Sun', rain: '20%', disease: '30%' },
                ].map((col, i) => (
                  <View key={i} style={[styles.chartCol, col.highlight && styles.chartColHighlight]}>
                    <View style={[styles.rainBar, { height: col.rain as DimensionValue }]} />
                    <View style={[styles.diseaseDot, { bottom: col.disease as DimensionValue }, col.alert && styles.diseaseDotAlert]} />
                    <Text style={[styles.chartDayLabel, col.highlight && styles.chartDayLabelHighlight]}>{col.day}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={styles.legendRain} />
                <Text style={styles.legendItemText}>Rainfall (mm)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendDisease} />
                <Text style={styles.legendItemText}>Disease Reports</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Protocol Checklist */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="task-alt" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Action Protocol Checklist</Text>
          </View>

          <View style={[styles.card, { padding: 0 }]}>
            {tasks.map((task, index) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskRow,
                  index !== tasks.length - 1 && styles.taskRowBorder,
                  task.critical && !task.completed && styles.taskRowCritical,
                  task.completed && styles.taskRowCompleted
                ]}
                onPress={() => toggleTask(task.id)}
                disabled={task.id === 3} // Simulate system automated
              >
                <View style={styles.checkboxContainer}>
                  <View style={[
                    styles.checkbox,
                    task.completed ? styles.checkboxChecked : styles.checkboxUnchecked,
                    task.critical && !task.completed && styles.checkboxCritical
                  ]}>
                    {task.completed && <MaterialIcons name="check" size={16} color={colors.onTertiaryContainer} />}
                  </View>
                </View>
                <View style={styles.taskContent}>
                  <Text style={[
                    styles.taskTitle,
                    task.completed && styles.taskTitleCompleted
                  ]}>{task.title}</Text>
                  <Text style={[
                    styles.taskSubtitle,
                    task.critical && !task.completed && { color: colors.error }
                  ]}>{task.subtitle}</Text>
                </View>
                <View style={styles.taskMeta}>
                  <Text style={[
                    styles.taskDue,
                    task.critical && !task.completed && styles.taskDueCritical,
                    task.completed && styles.taskDueCompleted
                  ]}>{task.due}</Text>
                  <Text style={styles.taskAssignee}>{task.loc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(22, 40, 57, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.edgeMargin,
    height: 56,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.primary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  helpButton: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scrollContent: {
    padding: spacing.edgeMargin,
    paddingBottom: 100, // For tab bar
  },
  container: {
    flex: 1,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
    paddingBottom: spacing.base,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(44, 62, 80, 0.1)',
  },
  pageTitle: {
    ...typography.h2,
    fontSize: 26,
    color: colors.primary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderColor: colors.outlineVariant,
    borderWidth: 1,
    gap: 4,
  },
  syncText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: colors.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primary,
    fontSize: 20,
  },
  alertsGrid: {
    gap: spacing.md,
  },
  alertCard: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  alertCardCritical: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
  },
  alertCardWarning: {
    backgroundColor: colors.secondaryContainer, // Light Orange
    borderColor: colors.secondary, // Orange
  },
  alertCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 8,
  },
  alertTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertTypeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    color: colors.onErrorContainer,
  },
  timeBadgeCritical: {
    backgroundColor: 'rgba(186, 26, 26, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeBadgeTextCritical: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: colors.error,
  },
  alertHeadline: {
    ...typography.h3,
    fontSize: 22,
    color: colors.onErrorContainer,
    marginBottom: 8,
  },
  alertLocation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(147, 0, 10, 0.8)',
    marginBottom: 16,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonPrimary: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    fontFamily: 'Inter_700Bold',
    color: colors.onError,
    fontSize: 14,
  },
  actionButtonSecondary: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  actionButtonSecondaryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 198, 205, 0.3)',
    paddingBottom: 16,
    marginBottom: 16,
  },
  networkPercent: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 48,
    color: colors.tertiary,
    lineHeight: 52,
  },
  networkSubtitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  networkIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.tertiary,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurface,
  },
  progressValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.tertiary,
  },
  sensorIssues: {
    gap: 8,
  },
  sensorIssueOffline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(186, 26, 26, 0.05)',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.2)',
  },
  sensorIssueLowBat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 113, 39, 0.05)',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(252, 113, 39, 0.2)',
  },
  sensorIssueText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    flex: 1,
    marginLeft: 8,
  },
  sensorIssueTime: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.error,
  },
  sensorIssueBatValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.secondary,
  },
  chartCard: {
    height: 320,
    flexDirection: 'column',
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.outline,
    paddingBottom: 8,
    position: 'relative',
  },
  yAxis: {
    position: 'absolute',
    left: -32,
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  axisLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: colors.outline,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  chartCol: {
    width: '12%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  chartColHighlight: {
    backgroundColor: 'rgba(186, 26, 26, 0.05)',
  },
  rainBar: {
    width: '100%',
    backgroundColor: colors.primaryFixed,
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 80, 0.2)',
  },
  diseaseDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 10,
  },
  diseaseDotAlert: {
    backgroundColor: colors.error,
  },
  chartDayLabel: {
    position: 'absolute',
    bottom: -24,
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  chartDayLabelHighlight: {
    color: colors.error,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 36,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendRain: {
    width: 16,
    height: 16,
    backgroundColor: colors.primaryFixed,
    borderWidth: 1,
    borderColor: 'rgba(44, 62, 80, 0.2)',
  },
  legendDisease: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
  legendItemText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  taskRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  taskRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(196, 198, 205, 0.2)',
  },
  taskRowCritical: {
    backgroundColor: 'rgba(186, 26, 26, 0.05)',
  },
  taskRowCompleted: {
    backgroundColor: 'rgba(241, 244, 243, 0.7)',
    opacity: 0.7,
  },
  checkboxContainer: {
    marginRight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxUnchecked: {
    borderColor: colors.outline,
  },
  checkboxCritical: {
    borderColor: colors.error,
  },
  checkboxChecked: {
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiaryContainer,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    color: colors.onSurface,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.onSurfaceVariant,
  },
  taskSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  taskMeta: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  taskDue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  taskDueCritical: {
    color: colors.error,
    backgroundColor: 'rgba(186, 26, 26, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskDueCompleted: {
    color: colors.tertiary,
  },
  taskAssignee: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  }
});
