import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { MaterialIcons } from '@expo/vector-icons';

export default function Welcome() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width > 768;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="emergency" size={24} color={colors.primary} />
          <Text style={styles.brandText}>JALJEEVAN</Text>
        </View>
        {isDesktop && (
          <TouchableOpacity style={[styles.actionBtn, { paddingVertical: 8, paddingHorizontal: 16, marginTop: 0 }]}>
            <Text style={styles.actionBtnText}>CALL FOR HELP</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[styles.heroSection, isDesktop && styles.heroSectionDesktop]}>
          <View style={[styles.heroTextContainer, isDesktop && styles.heroTextContainerDesktop]}>
            <Text style={[styles.heroTitle, isDesktop && { fontSize: 32 }]}>Protecting Communities through Smart Water Monitoring.</Text>
            <Text style={styles.heroDesc}>
              A rugged, reliable platform bridging advanced health technology with the landscapes of North East India to safeguard vital water resources.
            </Text>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/(onboarding)/language')}
            >
              <Text style={styles.actionBtnText}>GET STARTED</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnOutline]}
              activeOpacity={0.8}
              onPress={() => router.push('/(onboarding)/login')}
            >
              <Text style={[styles.actionBtnText, styles.actionBtnTextOutline]}>LOG IN</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Image / Graphic */}
          <View style={[styles.imageContainer, isDesktop && styles.imageContainerDesktop]}>
            <View style={styles.imagePlaceholder}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDasDk_SkK8a0NwM2-SI_o2MwD9CyouEIH9Yvn4bHcZuWjtDVaMlg-IRsZ1vUOTjPh5IZufd23ymqyLzQo-78lsvWTnw5jo1HEHdsOSSKPUJOKbzPB5NXrMh3FzhDcsmzU1zV_LToS-HFhB5Pq6s-DLnK9Tw1Sgc3txK5bT8gbG5pURvqDVRooCpjRXSg2M6rKBSV7U1IgBBzXJGob5qn28rYXDHf-j2AOTK7G8DTCUqTWDMzE-jBA' }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              {/* Decorative overlay for rugged feel */}
              <View style={styles.decorativeBorder} />
              <View style={styles.liveStatusBadge}>
                <MaterialIcons name="sensors" size={16} color={colors.onSecondary} />
                <Text style={styles.liveStatusText}>LIVE STATUS</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Core Functions Bento Grid */}
        <View style={styles.functionsSection}>
          <Text style={styles.sectionTitle}>Core Functions</Text>

          <View style={[styles.gridContainer, isDesktop && styles.gridContainerDesktop]}>
            <View style={[styles.functionCard, isDesktop && styles.functionCardDesktop]}>
              <View style={styles.functionHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}>
                  <MaterialIcons name="edit-document" size={24} color={colors.onPrimaryContainer} />
                </View>
                <Text style={styles.functionTitle}>Field Reporting</Text>
              </View>
              <Text style={styles.functionDesc}>
                Submit standardized observations and data directly from the field, ensuring consistency and immediate availability for analysis.
              </Text>
            </View>

            <View style={[styles.functionCard, isDesktop && styles.functionCardDesktop]}>
              <View style={styles.functionHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.secondaryContainer }]}>
                  <MaterialIcons name="water-drop" size={24} color={colors.onSecondaryContainer} />
                </View>
                <Text style={styles.functionTitle}>Groundwater Monitoring</Text>
              </View>
              <Text style={styles.functionDesc}>
                Track levels, quality metrics, and usage patterns of crucial groundwater sources over time to ensure sustainability.
              </Text>
            </View>

            <View style={[styles.functionCard, isDesktop && styles.functionCardDesktop]}>
              <View style={styles.functionHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.errorContainer }]}>
                  <MaterialIcons name="campaign" size={24} color={colors.onErrorContainer} />
                </View>
                <Text style={styles.functionTitle}>Early Warning</Text>
              </View>
              <Text style={styles.functionDesc}>
                Automated alert systems notify communities and authorities of critical changes in water safety or supply parameters.
              </Text>
            </View>
          </View>
        </View>

        {/* Partnerships */}
        <View style={styles.partnershipsSection}>
          <Text style={styles.partnersTitle}>IN PARTNERSHIP WITH</Text>
          <View style={styles.partnersList}>
            <View style={styles.partnerItem}>
              <View style={styles.partnerIcon}>
                <MaterialIcons name="account-balance" size={24} color={colors.outline} />
              </View>
              <Text style={styles.partnerName}>Ministry of DoNER</Text>
            </View>
            <View style={styles.partnerItem}>
              <View style={styles.partnerIcon}>
                <MaterialIcons name="waves" size={24} color={colors.outline} />
              </View>
              <Text style={styles.partnerName}>Jal Shakti</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.edgeMargin,
    height: 56,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(22, 40, 57, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    ...typography.h2,
    fontSize: 20,
    color: colors.primary,
    letterSpacing: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    padding: spacing.edgeMargin,
    paddingTop: 32,
    gap: 16,
    alignItems: 'center',
  },
  heroSectionDesktop: {
    flexDirection: 'row',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingVertical: 64,
    gap: 48,
  },
  heroTextContainer: {
    gap: 16,
    width: '100%',
  },
  heroTextContainerDesktop: {
    flex: 1,
  },
  heroTitle: {
    ...typography.h2,
    fontSize: 28,
    color: colors.primary,
    lineHeight: 36,
  },
  heroDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: 8,
  },
  actionBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.primary,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  actionBtnText: {
    ...typography.caption,
    fontSize: 16,
    color: colors.onPrimary,
  },
  actionBtnTextOutline: {
    color: colors.primary,
  },
  imageContainer: {
    width: '100%',
    padding: spacing.edgeMargin,
  },
  imageContainerDesktop: {
    flex: 1,
    padding: 0,
  },
  imagePlaceholder: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 2,
    borderColor: 'rgba(22, 40, 57, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  decorativeBorder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderWidth: 4,
    borderColor: colors.primary,
    opacity: 0.2,
    pointerEvents: 'none',
  },
  liveStatusBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  liveStatusText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: colors.onSecondary,
    letterSpacing: 0.5,
  },
  functionsSection: {
    backgroundColor: colors.surfaceContainer,
    padding: spacing.edgeMargin,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  gridContainer: {
    width: '100%',
    gap: 24,
  },
  gridContainerDesktop: {
    flexDirection: 'row',
    maxWidth: 1200,
    justifyContent: 'space-between',
  },
  functionCard: {
    backgroundColor: colors.surface,
    padding: 24,
  },
  functionCardDesktop: {
    flex: 1,
  },
  functionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(22, 40, 57, 0.1)',
    paddingBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  functionTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.primary,
  },
  functionDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  partnershipsSection: {
    backgroundColor: colors.surface,
    padding: spacing.edgeMargin,
    paddingTop: 32,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(22, 40, 57, 0.1)',
  },
  partnersTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: colors.outline,
    letterSpacing: 2,
    marginBottom: 24,
  },
  partnersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 32,
    opacity: 0.8,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  partnerIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerName: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: colors.primary,
    maxWidth: 100,
  }
});
