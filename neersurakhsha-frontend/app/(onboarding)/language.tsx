import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { LANGUAGE_OPTIONS, resolveLanguageCode } from '../../constants/languages';
import { useAppStore } from '../../store/main.store';
import { useLanguage } from '../../hooks/useLanguage';

export default function LanguageSelect() {
  const router = useRouter();
  const language = useAppStore((state) => state.language);
  const [selectedLang, setSelectedLang] = useState<string | null>(language);
  const { setLanguage } = useAppStore();
  const { t } = useLanguage();

  useEffect(() => {
    setSelectedLang(language);
  }, [language]);

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="emergency" size={24} color={colors.primary} />
          <Text style={styles.brandText}>JALJEEVAN</Text>
        </View>
        <TouchableOpacity style={styles.callBtn}>
          <MaterialIcons name="call" size={16} color={colors.primary} />
          <Text style={styles.callBtnText}>{t('callForHelp')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.textCenter}>
          <Text style={styles.title}>{t('selectLanguage')}</Text>
          <Text style={styles.subtitle}>{t('chooseLanguage')}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.grid}>
          {LANGUAGE_OPTIONS.map((lang) => {
            const isSelected = selectedLang === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.card,
                  isSelected ? styles.cardSelected : styles.cardDefault
                ]}
                onPress={() => {
                  setSelectedLang(lang.id);
                  void setLanguage(lang.id);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.langNative}>{lang.native}</Text>
                <Text style={styles.langEnglish}>{lang.english}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueBtn,
              !selectedLang && styles.continueBtnDisabled
            ]}
            disabled={!selectedLang}
            onPress={async () => {
              if (selectedLang) {
                await setLanguage(resolveLanguageCode(selectedLang));
              }

              if (router.canGoBack()) {
                router.back();
                return;
              }

              router.push('/(onboarding)/login');
            }}
          >
            <Text style={styles.continueText}>{t('continue')}</Text>
            <MaterialIcons name="arrow-forward" size={24} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
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
    ...typography.h3,
    fontSize: 16,
    color: colors.primary,
    letterSpacing: 1,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  callBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: colors.primary,
  },
  container: {
    flex: 1,
    paddingTop: 32,
  },
  textCenter: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: spacing.edgeMargin,
  },
  title: {
    ...typography.h2,
    fontSize: 24,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.h3,
    fontSize: 20,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.edgeMargin,
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    width: '47%',
    aspectRatio: 1.2,
    borderRadius: 8,
    padding: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  cardDefault: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  cardSelected: {
    backgroundColor: colors.primaryContainer,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  langNative: {
    ...typography.h3,
    fontSize: 20,
    color: colors.primary,
    marginBottom: 4,
  },
  langEnglish: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  footer: {
    padding: spacing.edgeMargin,
    paddingBottom: 32,
    marginTop: 'auto',
  },
  continueBtn: {
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 12,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
    color: colors.onPrimary,
    letterSpacing: 1,
  }
});
