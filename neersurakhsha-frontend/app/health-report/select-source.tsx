import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '../../store/main.store';
import { SourceStatus } from '../../types/source';

export default function SelectSource() {
  const router = useRouter();
  const { sources, selectedHealthSourceId, setSelectedHealthSourceId } = useAppStore();

  const getStatusColor = (status: SourceStatus) => {
    switch(status) {
      case 'SAFE': return colors.status.safe;
      case 'CONTAMINATION_RISK': return colors.status.warning;
      case 'AVAILABILITY_RISK': return colors.status.warning;
      case 'HIGH_RISK': return colors.status.danger;
      default: return colors.onSurface;
    }
  };

  const getStatusBgColor = (status: SourceStatus) => {
    switch(status) {
      case 'SAFE': return colors.status.safeBg;
      case 'CONTAMINATION_RISK': return colors.status.warningBg;
      case 'AVAILABILITY_RISK': return colors.status.warningBg;
      case 'HIGH_RISK': return colors.status.dangerBg;
      default: return colors.background;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Water Source</Text>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={colors.primary} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by ID or name..."
            placeholderTextColor={colors.outline}
          />
        </View>

        <FlatList
          data={sources}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.card,
                styles.hcBorder,
                selectedHealthSourceId === item.id && styles.cardSelected,
              ]}
              onPress={() => {
                setSelectedHealthSourceId(item.id);
                router.back();
              }}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.name}`}
            >
              <View style={styles.cardHeader}>
                <View style={styles.idContainer}>
                  <MaterialIcons name="water-drop" size={20} color={colors.primary} />
                  <Text style={styles.sourceId}>{item.id}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status), borderColor: getStatusColor(item.status) }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              
              <View style={styles.nameRow}>
                <Text style={styles.sourceName}>{item.name}</Text>
                {selectedHealthSourceId === item.id && (
                  <MaterialIcons name="check-circle" size={22} color={colors.tertiary} />
                )}
              </View>
              
              <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
                  <Text style={styles.detailText}>{item.distance}m away</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="people" size={16} color={colors.onSurfaceVariant} />
                  <Text style={styles.detailText}>{item.householdsUsing} HH</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.edgeMargin,
    height: 56,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(22, 40, 57, 0.1)',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.primary,
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurface,
  },
  list: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: 8,
  },
  hcBorder: {
    borderWidth: 2,
    borderColor: colors.outlineVariant,
  },
  cardSelected: {
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiaryContainer,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceId: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18,
    color: colors.primary,
  },
  sourceName: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginBottom: 12,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(22, 40, 57, 0.1)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  }
});
