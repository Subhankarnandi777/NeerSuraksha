import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '../../store/main.store';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useNetwork } from '../../hooks/useNetwork';
import { WaterSource } from '../../types/source';

const { width } = Dimensions.get('window');

export default function SafeWaterMap() {
  const { sources, healthCases, fetchSources } = useAppStore();
  const router = useRouter();
  const isOnline = useNetwork();
  
  const [selectedSource, setSelectedSource] = useState<WaterSource | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);

  // Pending field reports are included before server sync, so no unsafe source
  // is shown as safe while an ASHA worker is offline.
  const effectiveSources = useMemo(() => sources.map((source) => {
    const pendingCases = healthCases.filter((report) => !report.synced && report.sourceId === source.id).length;
    const healthCasesCount = source.healthCasesCount + pendingCases;
    if (source.lastTestResult === 'Positive' || healthCasesCount >= 3 || source.status === 'HIGH_RISK') {
      return { ...source, healthCasesCount, status: 'HIGH_RISK' as const };
    }
    if (healthCasesCount > 0 || source.status === 'CONTAMINATION_RISK') {
      return { ...source, healthCasesCount, status: 'CONTAMINATION_RISK' as const };
    }
    return { ...source, healthCasesCount };
  }), [healthCases, sources]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  // Update the card whenever the matching source receives new ASHA data.
  useEffect(() => {
    setSelectedSource((current) => effectiveSources.find((source) => source.id === current?.id) ?? effectiveSources[0] ?? null);
  }, [effectiveSources]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
  }, []);

  const userLat = location?.coords.latitude || 25.8883;
  const userLng = location?.coords.longitude || 90.4932;

  // Simple Haversine distance
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const dynamicDistance = location && selectedSource ? getDistance(userLat, userLng, selectedSource.lat, selectedSource.lng) : '1.2';
  const dynamicTime = location && selectedSource ? `EST. ${Math.round(parseFloat(dynamicDistance) * 12)} MIN WALK` : 'EST. 15 MIN WALK';

  const findSafeAlternative = () => {
    if (!selectedSource) return;
    const safeSources = effectiveSources.filter(s => s.status === 'SAFE');
    if (safeSources.length === 0) return;

    let nearest = safeSources[0];
    let minDistance = parseFloat(getDistance(selectedSource.lat, selectedSource.lng, nearest.lat, nearest.lng));

    for (let i = 1; i < safeSources.length; i++) {
      const d = parseFloat(getDistance(selectedSource.lat, selectedSource.lng, safeSources[i].lat, safeSources[i].lng));
      if (d < minDistance) {
        minDistance = d;
        nearest = safeSources[i];
      }
    }
    setSelectedSource(nearest);
    setDetailsExpanded(false);
  };
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100vw; }
        .custom-marker {
          background-color: white;
          border: 2px solid #fc7127;
          border-radius: 50%;
          text-align: center;
          line-height: 24px;
          font-weight: bold;
          font-family: sans-serif;
          color: white;
        }
        .marker-safe { background-color: #2e7d32; border-color: #1b5e20; }
        .marker-alert { background-color: #d32f2f; border-color: #b71c1c; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map', { zoomControl: false }).setView([${userLat}, ${userLng}], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);

        // User location
        L.circleMarker([${userLat}, ${userLng}], {
          color: '#fc7127',
          fillColor: '#fc7127',
          fillOpacity: 0.8,
          radius: 8
        }).addTo(map);

        const sources = ${JSON.stringify(effectiveSources)};
        
        sources.forEach(source => {
          const isSafe = source.status === 'SAFE';
          const className = isSafe ? 'custom-marker marker-safe' : 'custom-marker marker-alert';
          
          const icon = L.divIcon({
            className: className,
            iconSize: [24, 24],
            html: isSafe ? '✓' : '!'
          });
          
          const marker = L.marker([source.lat, source.lng], { icon }).addTo(map);
          
          marker.on('click', () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerClick', sourceId: source.id }));
          });
        });
        
        if (sources.length > 0) {
          const group = new L.featureGroup(sources.map(s => L.marker([s.lat, s.lng])));
          map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="emergency" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>JALJEEVAN</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>CALL FOR HELP</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          ref={webviewRef}
          source={{ html: leafletHTML }}
          style={StyleSheet.absoluteFill}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'markerClick') {
                const src = effectiveSources.find(s => s.id === data.sourceId);
                if (src) setSelectedSource(src);
              }
            } catch (e) {}
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
        />

        {/* Legend & Quick Info */}
        <View style={styles.legendContainer}>
          <View style={[styles.legendBox, styles.hcBorder]}>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDotSafe, styles.hcBorder]} />
                <Text style={styles.legendText}>Safe</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendDotAlert} />
                <Text style={styles.legendText}>Contaminated</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.fabContainer}>
          <TouchableOpacity style={[styles.fab, styles.hcBorder, styles.hcShadow]}>
            <MaterialIcons name="mic" size={32} color={colors.onSecondary} />
          </TouchableOpacity>
        </View>

        {/* Active Routing Card */}
        {selectedSource && (
          <View style={styles.routingCardContainer}>
            <View style={[styles.routingCard, styles.hcBorder, styles.hcShadow]}>
              <View style={styles.routingHeader}>
                <View>
                  <Text style={styles.routingTitle}>{selectedSource.name}</Text>
                  <Text style={styles.routingSubtitle}>{selectedSource.type?.replace('_', ' ') || 'WATER SOURCE'}</Text>
                </View>
                {selectedSource.status === 'SAFE' ? (
                  <View style={[styles.statusBadgeSafe, styles.hcBorder]}>
                    <MaterialIcons name="check-circle" size={16} color={colors.onTertiary} />
                    <Text style={styles.statusBadgeSafeText}>SAFE</Text>
                  </View>
                ) : selectedSource.status === 'CONTAMINATION_RISK' ? (
                  <View style={[styles.statusBadgeMonitor, { borderColor: colors.secondary }]}>
                    <MaterialIcons name="visibility" size={16} color={colors.onSecondaryFixedVariant} />
                    <Text style={styles.statusBadgeMonitorText}>MONITOR</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadgeAlert, { borderColor: colors.error }]}>
                    <MaterialIcons name="warning" size={16} color={colors.error} />
                    <Text style={styles.statusBadgeAlertText}>ALERT</Text>
                  </View>
                )}
              </View>

              {detailsExpanded && (
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Groundwater trend</Text>
                    <Text style={styles.detailValue}>{selectedSource.groundwaterTrend ?? 'Not recorded'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Linked ASHA reports</Text>
                    <Text style={styles.detailValue}>{selectedSource.healthCasesCount}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Water test</Text>
                    <Text style={[styles.detailValue, selectedSource.status !== 'SAFE' && { color: colors.error }]}>
                      {selectedSource.lastTestResult ?? 'Not recorded'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Health signal</Text>
                    <Text style={[styles.detailValue, selectedSource.status !== 'SAFE' && { color: colors.error }]}>
                      {selectedSource.healthCasesCount === 0 ? 'Clear' : `${selectedSource.healthCasesCount} report${selectedSource.healthCasesCount === 1 ? '' : 's'}`}
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.routingBody}>
                <View style={styles.routingStats}>
                  <Text style={styles.distanceText}>{dynamicDistance}<Text style={styles.distanceUnit}>km</Text></Text>
                  <Text style={styles.timeText}>{dynamicTime}</Text>
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <TouchableOpacity 
                    style={[styles.routeButton, styles.hcBorder, styles.hcShadow]}
                    onPress={() => {
                      if (!isOnline) {
                        alert("Routing is unavailable while offline. Please use the straight-line distance estimate.");
                      } else {
                        const url = "https://www.google.com/maps/dir/?api=1&destination=" + selectedSource.lat + "," + selectedSource.lng;
                        const { Linking } = require('react-native');
                        Linking.openURL(url);
                      }
                    }}
                  >
                    <MaterialIcons name="directions-walk" size={24} color={colors.onSecondary} />
                    <Text style={styles.routeButtonText}>START ROUTE</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => setDetailsExpanded(!detailsExpanded)}
                  >
                    <Text style={styles.detailsButtonText}>{detailsExpanded ? 'HIDE DETAILS' : 'VIEW DETAILS'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {selectedSource.status !== 'SAFE' && (
                <TouchableOpacity 
                  style={[styles.alternativeButton, styles.hcBorder]}
                  onPress={findSafeAlternative}
                >
                  <MaterialIcons name="search" size={20} color={colors.primary} />
                  <Text style={styles.alternativeButtonText}>FIND SAFE ALTERNATIVE</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
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
    borderWidth: 2,
    borderColor: 'rgba(22, 40, 57, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  helpButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.primary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  hcBorder: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  hcShadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  legendBox: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendItems: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDotSafe: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.tertiary,
  },
  legendDotAlert: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: colors.onError,
  },
  legendText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  fabContainer: {
    position: 'absolute',
    // Keep voice input above the map content, never over the source details card.
    top: 88,
    right: 16,
    zIndex: 30,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routingCardContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  routingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  routingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: colors.surfaceVariant,
    paddingBottom: 8,
    marginBottom: 8,
  },
  routingTitle: {
    ...typography.h3,
    color: colors.primary,
    fontSize: 24,
  },
  routingSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurfaceVariant,
  },
  statusBadgeSafe: {
    backgroundColor: colors.tertiary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 2,
  },
  statusBadgeSafeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.onTertiary,
  },
  statusBadgeAlert: {
    backgroundColor: colors.errorContainer,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 2,
  },
  statusBadgeAlertText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.error,
  },
  statusBadgeMonitor: {
    backgroundColor: colors.secondaryFixed,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 2,
  },
  statusBadgeMonitorText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.onSecondaryFixedVariant,
  },
  routingBody: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  routingStats: {
    flex: 1,
    justifyContent: 'center',
  },
  distanceText: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 48,
    lineHeight: 52,
    color: colors.primary,
    letterSpacing: -1,
  },
  distanceUnit: {
    fontSize: 24,
  },
  timeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  routeButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  routeButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.onSecondary,
    marginTop: 4,
    letterSpacing: 1,
  },
  detailsButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.primary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
  },
  detailItem: {
    width: '45%',
  },
  detailLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  detailValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.onSurface,
    marginTop: 2,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  alternativeButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.primary,
    letterSpacing: 1,
  }
});
