import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '../../store/main.store';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../hooks/useLanguage';

export default function Profile() {
  const { userRole, userName, userPhone, villageName, setUserName, setUserPhone } = useAppStore();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editPhone, setEditPhone] = useState(userPhone);
  const [saving, setSaving] = useState(false);

  // Sync state if store updates externally
  useEffect(() => {
    setEditName(userName);
    setEditPhone(userPhone);
  }, [userName, userPhone]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // 1. Update Auth Metadata
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: editName }
      });
      if (error) throw error;
      
      // 2. Update Database Profile (if applicable, using auth user id)
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        await supabase.from('users').update({
          name: editName,
          phone: editPhone
        }).eq('id', user.id);
      }

      // 3. Update Global Store
      setUserName(editName);
      setUserPhone(editPhone);
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    // Navigate back to login
    router.replace('/(onboarding)/login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('accountProfile')}</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editIconBtn}>
          <MaterialIcons name={isEditing ? "close" : "edit"} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, isTablet && { maxWidth: 600, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.card}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          {isEditing ? (
            <TextInput 
              style={styles.editInput} 
              value={editName} 
              onChangeText={setEditName} 
              placeholder="Full Name" 
              placeholderTextColor={colors.onSurfaceVariant}
            />
          ) : (
            <Text style={styles.userName}>{userName}</Text>
          )}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{userRole}</Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('contactDetails')}</Text>
          <View style={styles.detailBox}>
            <View style={styles.detailRow}>
              <MaterialIcons name="call" size={20} color={colors.onSurfaceVariant} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('registeredMobile')}</Text>
                {isEditing ? (
                  <TextInput 
                    style={styles.editInputSmall} 
                    value={editPhone} 
                    onChangeText={setEditPhone} 
                    placeholder="Phone/Email" 
                    placeholderTextColor={colors.onSurfaceVariant}
                    autoCapitalize="none"
                  />
                ) : (
                  <Text style={styles.detailValue}>{userPhone}</Text>
                )}
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={20} color={colors.onSurfaceVariant} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{t('assignedRegion')}</Text>
                <Text style={styles.detailValue}>{villageName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('accountActions')}</Text>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialIcons name="security" size={24} color={colors.primary} />
            <Text style={styles.actionBtnText}>{t('changePin')}</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(onboarding)/language')}>
            <MaterialIcons name="g-translate" size={24} color={colors.primary} />
            <Text style={styles.actionBtnText}>{t('changeLanguage')}</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
          </TouchableOpacity>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
            <MaterialIcons name="save" size={24} color={colors.onPrimary} />
            <Text style={styles.saveBtnText}>{saving ? t('saving') : t('saveChanges')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color={colors.error} />
          <Text style={styles.logoutBtnText}>{t('logOut')}</Text>
        </TouchableOpacity>
        
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
    paddingHorizontal: spacing.edgeMargin,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(22, 40, 57, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.primary,
  },
  scrollContent: {
    padding: spacing.edgeMargin,
    paddingBottom: 100, // accommodate tab bar
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 32,
    color: colors.onPrimaryContainer,
  },
  userName: {
    ...typography.h2,
    fontSize: 24,
    color: colors.onSurface,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: colors.tertiaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.tertiary,
  },
  roleText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: colors.onTertiaryContainer,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.primary,
    marginBottom: 16,
  },
  detailBox: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  detailValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.onSurface,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(22, 40, 57, 0.1)',
    marginVertical: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  actionBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.onSurface,
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorContainer,
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: 1,
    color: colors.error,
  },
  editIconBtn: {
    padding: 8,
  },
  editInput: {
    ...typography.h2,
    fontSize: 24,
    color: colors.onSurface,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    textAlign: 'center',
    minWidth: 200,
    paddingVertical: 4,
  },
  editInputSmall: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.onSurface,
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 4,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  saveBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    letterSpacing: 1,
    color: colors.onPrimary,
  }
});
