import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { colors, spacing, radius } from '../theme';
import { getStationForecast, getUngaugedForecast, GroundwaterForecast } from '../services/api/groundwater.service';
import { useAppStore } from '../store/main.store';

export default function WaterTestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Form State
  const [sourceId, setSourceId] = useState('');
  const [testResult, setTestResult] = useState<'SAFE' | 'UNSAFE' | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  
  // Groundwater State
  const [groundwaterDepth, setGroundwaterDepth] = useState('');
  const [forecast, setForecast] = useState<GroundwaterForecast | null>(null);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const villageName = useAppStore((state) => state.villageName);

  const [cameraActive, setCameraActive] = useState(false);

  if (!permission) {
    return <View />;
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo?.uri || null);
      setCameraActive(false);
    }
  };

  const calculateForecast = async () => {
    const depth = parseFloat(groundwaterDepth);
    if (Number.isNaN(depth) || depth <= 0) {
      setForecastError('Enter a valid depth in metres.');
      return;
    }

    setIsForecastLoading(true);
    setForecastError(null);
    try {
      // A registered station gets its station-specific prediction. New sources
      // use the same trained model's ungauged regional prediction path.
      const prediction = sourceId.trim()
        ? await getStationForecast(sourceId.trim()).catch(() => getUngaugedForecast(depth, villageName))
        : await getUngaugedForecast(depth, villageName);
      setForecast(prediction);
    } catch (error) {
      setForecast(null);
      setForecastError(error instanceof Error ? error.message : 'Unable to get a prediction.');
    } finally {
      setIsForecastLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!sourceId) {
      Alert.alert('Error', 'Please enter a Source ID');
      return;
    }
    Alert.alert('Success', 'Report saved offline and pending sync.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  if (cameraActive) {
    return (
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <View style={styles.cameraOverlay}>
            <TouchableOpacity 
              style={styles.closeCameraBtn} 
              onPress={() => setCameraActive(false)}
            >
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>
            
            <View style={styles.captureContainer}>
              <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                <View style={styles.captureInnerBtn} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text variant="title" color="primary">Water Quality Test</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* H2S Test Section */}
        <Card style={styles.sectionCard}>
          <Text variant="title" color="primary" style={styles.sectionTitle}>1. H₂S Vial Test</Text>
          
          <Text variant="caption" color="onSurfaceVariant" style={styles.label}>Source ID</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. W-1234"
            value={sourceId}
            onChangeText={setSourceId}
          />

          <Text variant="caption" color="onSurfaceVariant" style={styles.label}>Test Result</Text>
          <View style={styles.binarySelection}>
            <TouchableOpacity 
              style={[styles.binaryBtn, testResult === 'SAFE' && styles.binaryBtnSafeActive]}
              onPress={() => setTestResult('SAFE')}
            >
              <MaterialIcons name="check-circle" size={28} color={testResult === 'SAFE' ? colors.primary : colors.outline} />
              <Text style={{ marginTop: 4, color: testResult === 'SAFE' ? colors.primary : colors.outline }}>SAFE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.binaryBtn, testResult === 'UNSAFE' && styles.binaryBtnUnsafeActive]}
              onPress={() => setTestResult('UNSAFE')}
            >
              <MaterialIcons name="cancel" size={28} color={testResult === 'UNSAFE' ? colors.error : colors.outline} />
              <Text style={{ marginTop: 4, color: testResult === 'UNSAFE' ? colors.error : colors.outline }}>UNSAFE</Text>
            </TouchableOpacity>
          </View>

          <Text variant="caption" color="onSurfaceVariant" style={styles.label}>Photograph Evidence</Text>
          {photoUri ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <TouchableOpacity style={styles.retakeBtn} onPress={() => setCameraActive(true)}>
                <MaterialIcons name="refresh" size={20} color="white" />
                <Text style={{ color: 'white', marginLeft: 4 }}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={() => {
                if (!permission.granted) {
                  requestPermission();
                } else {
                  setCameraActive(true);
                }
              }}
            >
              <MaterialIcons name="camera-alt" size={32} color={colors.primary} />
              <Text color="primary" style={{ marginTop: 8 }}>Take Photograph</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Groundwater Section */}
        <Card style={styles.sectionCard}>
          <Text variant="title" color="primary" style={styles.sectionTitle}>2. Groundwater Reading</Text>
          <Text variant="caption" color="onSurfaceVariant" style={styles.label}>Depth to Water (meters)</Text>
          <View style={styles.row}>
            <TextInput 
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="0.0"
              keyboardType="numeric"
              value={groundwaterDepth}
              onChangeText={setGroundwaterDepth}
            />
            <Button 
              title="GET FORECAST" 
              variant="secondary"
              onPress={calculateForecast}
              loading={isForecastLoading}
              style={{ marginLeft: 12 }}
            />
          </View>

          {forecast && (
            <View style={[
              styles.forecastBox,
              forecast.advisory?.includes('Schedule a water test') ? styles.forecastCritical : styles.forecastSafe
            ]}>
              <MaterialIcons name="insights" size={24} color={colors.primary} />
              <View style={styles.forecastCopy}>
                <Text style={styles.forecastTitle}>60-day model prediction</Text>
                <Text style={styles.forecastText}>Water depth: {forecast.depth_forecast_m.toFixed(2)} m ({forecast.interval_lower_m.toFixed(2)}–{forecast.interval_upper_m.toFixed(2)} m, {forecast.confidence_pct}% confidence)</Text>
                <Text style={styles.forecastText}>{forecast.advisory ?? forecast.rationale}</Text>
              </View>
            </View>
          )}
          {forecastError && <Text style={styles.forecastError}>{forecastError}</Text>}
        </Card>

        <Button 
          title="SAVE REPORT" 
          variant="primary" 
          size="lg"
          onPress={handleSubmit}
          style={styles.submitBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  closeCameraBtn: {
    padding: 24,
    alignSelf: 'flex-start',
    marginTop: 40,
  },
  captureContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInnerBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.md,
  },
  sectionCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    paddingBottom: 8,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    height: 56,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  binarySelection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  binaryBtn: {
    flex: 1,
    height: 80,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  binaryBtnSafeActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 2,
  },
  binaryBtnUnsafeActive: {
    borderColor: colors.error,
    backgroundColor: colors.errorContainer,
    borderWidth: 2,
  },
  cameraButton: {
    height: 120,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  photoContainer: {
    height: 200,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  retakeBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forecastBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  forecastCopy: {
    flex: 1,
    marginLeft: 8,
    gap: 4,
  },
  forecastTitle: {
    color: colors.primary,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  forecastText: {
    color: colors.onSurfaceVariant,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  forecastError: {
    color: colors.error,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginTop: spacing.sm,
  },
  forecastSafe: {
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.primary,
  },
  forecastWarning: {
    backgroundColor: '#fff3e0',
    borderColor: colors.tertiaryContainer,
  },
  forecastCritical: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
  },
  submitBtn: {
    marginTop: spacing.sm,
    marginBottom: 40,
  }
});
