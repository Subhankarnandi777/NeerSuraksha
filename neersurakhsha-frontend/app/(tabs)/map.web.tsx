import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '../../store/main.store';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function SafeWaterMap() {
  const { sources } = useAppStore();
  const router = useRouter();

  // Selected source for the routing card
  const [selectedSource, setSelectedSource] = useState<any>(sources.length > 0 ? sources[0] : null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const mapRef = useRef<any>(null);

  const insets = useSafeAreaInsets();

  // Update selected source when sources arrive if it's null
  useEffect(() => {
    if (sources.length > 0 && !selectedSource) {
      setSelectedSource(sources[0]);

      // Also fit the map to show all these new sources so they aren't off-screen!
      if (mapRef.current && mapRef.current.fitToCoordinates) {
        mapRef.current.fitToCoordinates(
          sources.map((s: any) => ({ latitude: s.lat, longitude: s.lng })),
          { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true }
        );
      }
    }
  }, [sources]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Only animate to user if we don't have sources yet, 
      // otherwise the sources useEffect will handle bounding the map
      if (mapRef.current && sources.length === 0) {
        mapRef.current.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }
    })();
  }, []);

  const userLat = location?.coords.latitude || 25.8883;
  const userLng = location?.coords.longitude || 90.4932;

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
        <iframe 
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLng-0.1},${userLat-0.1},${userLng+0.1},${userLat+0.1}&layer=mapnik&marker=${userLat},${userLng}`}
          style={{ width: '100%', height: '100%', border: 0 }}
          title="Safe Water Map"
        />
      </View>

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
                <Text style={styles.legendText}>Alert</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.locationButton, styles.hcBorder]}
              onPress={() => {
                if (mapRef.current && location) {
                  mapRef.current.animateToRegion({
                    latitude: userLat,
                    longitude: userLng,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }, 500);
                }
              }}
            >
              <MaterialIcons name="my-location" size={24} color={colors.primary} />
            </TouchableOpacity>
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
                ) : (
                  <View style={[styles.statusBadgeAlert, { borderColor: colors.error }]}>
                    <MaterialIcons name="warning" size={16} color={colors.error} />
                    <Text style={styles.statusBadgeAlertText}>ALERT</Text>
                  </View>
                )}
              </View>

              <View style={styles.routingBody}>
                <View style={styles.routingStats}>
                  <Text style={styles.distanceText}>{dynamicDistance}<Text style={styles.distanceUnit}>km</Text></Text>
                  <Text style={styles.timeText}>{dynamicTime}</Text>
                </View>
                <TouchableOpacity style={[styles.routeButton, styles.hcBorder, styles.hcShadow]}>
                  <MaterialIcons name="directions-walk" size={24} color={colors.onSecondary} />
                  <Text style={styles.routeButtonText}>START ROUTE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
  map: {
    width: '100%',
    height: '100%',
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
  markerContainer: {
    alignItems: 'center',
  },
  markerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  markerSafe: {
    backgroundColor: colors.tertiary,
  },
  markerAlert: {
    backgroundColor: colors.error,
  },
  markerAlertBorder: {
    borderWidth: 2,
    borderColor: colors.errorContainer,
    shadowColor: colors.error,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 5,
  },
  markerLabel: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  markerAlertLabelBorder: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  markerLabelText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  userLocationOuter: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(252, 113, 39, 0.3)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  userLocationInner: {
    width: 8,
    height: 8,
    backgroundColor: colors.secondary,
    borderRadius: 4,
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
  locationButton: {
    backgroundColor: colors.surfaceContainer,
    padding: 8,
    borderRadius: 6,
  },
  fabContainer: {
    position: 'absolute',
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
});

// A slightly muted map style for civic clarity
const mapStyle = [
  {
    "featureType": "all",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "weight": "2.00"
      }
    ]
  },
  {
    "featureType": "all",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#9c9c9c"
      }
    ]
  },
  {
    "featureType": "all",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [
      {
        "color": "#f2f2f2"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "all",
    "stylers": [
      {
        "saturation": -100
      },
      {
        "lightness": 45
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#7b7b7b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [
      {
        "color": "#46bcec"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#c8d7d4"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#070707"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  }
];
