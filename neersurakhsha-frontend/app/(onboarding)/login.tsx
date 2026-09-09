import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, useWindowDimensions, Platform, StatusBar, Alert, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAppStore } from '../../store/main.store';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width > 768;
  const setUserRole = useAppStore(state => state.setUserRole);

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login fields
  const [loginRole, setLoginRole] = useState('ASHA Worker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordVisible, setSignupPasswordVisible] = useState(false);
  const [signupRole, setSignupRole] = useState('ASHA Worker');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [activeRoleField, setActiveRoleField] = useState<'login' | 'signup'>('signup');
  const rolesList = ['ASHA Worker', 'ANM', 'PHC/CHC Officer', 'PHED Officer', 'Admin'];

  const handleLoginSubmit = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      // Set the user in the global store
      setUserRole(data.user?.user_metadata?.role || 'ASHA Worker');
      router.replace('/(tabs)/home');
    }
  };

  const handleSignupSubmit = async () => {
    if (!signupEmail || !signupPassword || !signupName) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: signupName,
          role: signupRole
        }
      }
    });

    if (error) {
      Alert.alert('Signup Failed', error.message);
      setLoading(false);
      return;
    }

    // Insert into public.users table as well
    if (data.user) {
      const { error: dbError } = await supabase.from('users').insert({
        id: data.user.id,
        name: signupName,
        phone: signupEmail, // mapping email to phone field for simplicity based on your schema
        role: signupRole,
      });

      if (dbError) {
        Alert.alert('Auth Success, but DB Insert Failed', dbError.message + '\n\nMake sure the "users" table exists in your Supabase public schema and RLS policies allow inserts.');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    Alert.alert('Success', 'Account created! You can now log in.');
    setActiveTab('login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.splitLayout, !isDesktop && { flexDirection: 'column' }]}>
        {/* Left/Top Decor Image Area (Visible on larger screens or partially on mobile) */}
        {isDesktop && (
          <View style={styles.imageHalf}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClvyaCj9n2OpA8CQAlTJfVuVvf9lu4Z9nAhCXr1aANVS5rzc0qUjIVeaqLsBUfm3IeruN_U6wkLJQjKiQ0GNBygfC3QHXv-yEihG56Sr9_RbOmq3nYVyDTR1Tme0M3JBBezdR6wV4krqjMHh97eozwaXixQeXLcj2EdY_YKHS-JuX0WPlD6GkDgEWDDrgmAQZ3si0UNx2ToD6mBgXGnMDRuyZApIgY3H-LLD8zecIg3-26-A4_uXY' }}
              style={styles.bgImage}
              resizeMode="cover"
            />
            <View style={styles.bgOverlay} />
            <View style={styles.bgTextContainer}>
              <Text style={styles.bgTitle}>Community Stewardship{"\n"}Through Technology</Text>
              <Text style={styles.bgDesc}>Secure access to vital water management and health resources.</Text>
            </View>
          </View>
        )}

        {/* Right/Bottom Login Area */}
        <View style={styles.formHalf}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.formInner}>

              <View style={styles.brandHeader}>
                <MaterialIcons name="water-drop" size={40} color={colors.primary} />
                <Text style={styles.brandText}>JALJEEVAN</Text>
              </View>

              <View style={styles.cardBox}>
                {/* Segmented Toggle */}
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, activeTab === 'login' && styles.toggleBtnActive]}
                    onPress={() => setActiveTab('login')}
                  >
                    <Text style={[styles.toggleText, activeTab === 'login' && styles.toggleTextActive]}>LOGIN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, activeTab === 'signup' && styles.toggleBtnActive]}
                    onPress={() => setActiveTab('signup')}
                  >
                    <Text style={[styles.toggleText, activeTab === 'signup' && styles.toggleTextActive]}>SIGN UP</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Form */}
                {activeTab === 'login' && (
                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Role</Text>
                      <TouchableOpacity style={styles.inputWrapper} onPress={() => { setActiveRoleField('login'); setRoleModalVisible(true); }}>
                        <Text style={[styles.input, { textAlignVertical: 'center', paddingTop: 14 }]}>
                          {loginRole}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} style={styles.inputIconRight} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email</Text>
                      <View style={styles.inputWrapper}>
                        <MaterialIcons name="email" size={20} color={colors.onSurfaceVariant} style={styles.inputIconLeft} />
                        <TextInput
                          style={[styles.input, { paddingLeft: 40 }]}
                          placeholder="Enter your email"
                          placeholderTextColor="rgba(67, 71, 76, 0.5)"
                          autoCapitalize="none"
                          keyboardType="email-address"
                          value={email}
                          onChangeText={setEmail}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <View style={styles.labelRow}>
                        <Text style={styles.label}>Password</Text>
                      </View>
                      <View style={styles.inputWrapper}>
                        <MaterialIcons name="lock" size={20} color={colors.onSurfaceVariant} style={styles.inputIconLeft} />
                        <TextInput
                          style={[styles.input, { paddingLeft: 40 }]}
                          placeholder="Enter password"
                          placeholderTextColor="rgba(67, 71, 76, 0.5)"
                          secureTextEntry={!loginPasswordVisible}
                          value={password}
                          onChangeText={setPassword}
                        />
                        <TouchableOpacity
                          style={styles.inputIconRight}
                          onPress={() => setLoginPasswordVisible(!loginPasswordVisible)}
                        >
                          <MaterialIcons
                            name={loginPasswordVisible ? "visibility" : "visibility-off"}
                            size={20}
                            color={colors.onSurfaceVariant}
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.forgotText}>Forgot Password?</Text>
                    </View>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleLoginSubmit} disabled={loading}>
                      <Text style={styles.submitBtnText}>{loading ? 'LOGGING IN...' : 'LOGIN'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Sign Up Form */}
                {activeTab === 'signup' && (
                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Full Name</Text>
                      <View style={styles.inputWrapper}>
                        <MaterialIcons name="badge" size={20} color={colors.onSurfaceVariant} style={styles.inputIconLeft} />
                        <TextInput
                          style={[styles.input, { paddingLeft: 40 }]}
                          placeholder="Enter your name"
                          placeholderTextColor="rgba(67, 71, 76, 0.5)"
                          value={signupName}
                          onChangeText={setSignupName}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email</Text>
                      <View style={styles.inputWrapper}>
                        <MaterialIcons name="email" size={20} color={colors.onSurfaceVariant} style={styles.inputIconLeft} />
                        <TextInput
                          style={[styles.input, { paddingLeft: 40 }]}
                          placeholder="Enter your email"
                          placeholderTextColor="rgba(67, 71, 76, 0.5)"
                          autoCapitalize="none"
                          keyboardType="email-address"
                          value={signupEmail}
                          onChangeText={setSignupEmail}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Password</Text>
                      <View style={styles.inputWrapper}>
                        <MaterialIcons name="lock" size={20} color={colors.onSurfaceVariant} style={styles.inputIconLeft} />
                        <TextInput
                          style={[styles.input, { paddingLeft: 40 }]}
                          placeholder="Choose a password"
                          placeholderTextColor="rgba(67, 71, 76, 0.5)"
                          secureTextEntry={!signupPasswordVisible}
                          value={signupPassword}
                          onChangeText={setSignupPassword}
                        />
                        <TouchableOpacity
                          style={styles.inputIconRight}
                          onPress={() => setSignupPasswordVisible(!signupPasswordVisible)}
                        >
                          <MaterialIcons
                            name={signupPasswordVisible ? "visibility" : "visibility-off"}
                            size={20}
                            color={colors.onSurfaceVariant}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Role Request</Text>
                      <TouchableOpacity style={styles.inputWrapper} onPress={() => { setActiveRoleField('signup'); setRoleModalVisible(true); }}>
                        <Text style={[styles.input, { textAlignVertical: 'center', paddingTop: 14 }]}>
                          {signupRole}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} style={styles.inputIconRight} />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.submitBtnPrimary} onPress={handleSignupSubmit} disabled={loading}>
                      <Text style={styles.submitBtnText}>{loading ? 'CREATING...' : 'REGISTER'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {activeTab === 'login' && (
                  <View style={styles.registerPrompt}>
                    <Text style={styles.registerPromptText}>Don't have an account? <Text style={styles.registerPromptLink} onPress={() => setActiveTab('signup')}>Register as a New User</Text></Text>
                  </View>
                )}
              </View>

              {/* Emergency Contact */}
              <View style={styles.emergencyContainer}>
                <TouchableOpacity style={styles.emergencyBtn}>
                  <MaterialIcons name="emergency" size={16} color={colors.error} />
                  <Text style={styles.emergencyText}>Emergency Contact</Text>
                </TouchableOpacity>
                <Text style={styles.versionText}>v1.0.4 Civic Build</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Role Picker Modal */}
      <Modal visible={roleModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setRoleModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Role</Text>
            <FlatList
              data={rolesList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    if (activeRoleField === 'signup') {
                      setSignupRole(item);
                    } else {
                      setLoginRole(item);
                    }
                    setRoleModalVisible(false);
                    if (activeRoleField === 'signup' && item !== 'ASHA Worker') {
                      Alert.alert('Notice', `${item} registration requires Admin verification. You may not be able to log in immediately after signing up.`);
                    }
                  }}
                >
                  <Text style={[styles.modalItemText, (activeRoleField === 'signup' ? signupRole : loginRole) === item && styles.modalItemTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  splitLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  imageHalf: {
    flex: 1,
    display: 'flex', // On mobile we could hide this, but let's just make it split or stack
    position: 'relative',
    backgroundColor: colors.surfaceVariant,
  },
  bgImage: {
    ...StyleSheet.absoluteFill,
    opacity: 0.8,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(22, 40, 57, 0.4)', // Simplified gradient mix-blend
  },
  bgTextContainer: {
    position: 'absolute',
    bottom: 64,
    left: 40,
    right: 40,
  },
  bgTitle: {
    ...typography.h2,
    fontSize: 32,
    color: colors.onPrimary,
    marginBottom: 24,
  },
  bgDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: colors.onPrimary,
    opacity: 0.9,
  },
  formHalf: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  formInner: {
    flex: 1,
    paddingHorizontal: spacing.edgeMargin,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  brandText: {
    ...typography.h2,
    fontSize: 26,
    color: colors.primary,
    letterSpacing: 0,
  },
  cardBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: 'rgba(22, 40, 57, 0.1)',
    padding: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'rgba(22, 40, 57, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.primaryContainer,
  },
  toggleText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  toggleTextActive: {
    color: colors.onPrimaryContainer,
  },
  formContainer: {
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.onSurface,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: 'rgba(22, 40, 57, 0.2)',
    borderRadius: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurface,
  },
  inputIconLeft: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  inputIconRight: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  forgotText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  submitBtn: {
    height: 56,
    backgroundColor: colors.secondary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitBtnPrimary: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitBtnText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 24,
    color: colors.onSecondary,
    textTransform: 'uppercase',
  },
  registerPrompt: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: colors.surfaceContainerHigh,
    alignItems: 'center',
  },
  registerPromptText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  registerPromptLink: {
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
  emergencyContainer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(186, 26, 26, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
  },
  emergencyText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.error,
  },
  versionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 350,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 24,
  },
  modalTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18,
    color: colors.onSurface,
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
  },
  modalItemText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurface,
  },
  modalItemTextActive: {
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  }
});
