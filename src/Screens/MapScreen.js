import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  fetchMyTasks,
} from "../Redux/actions/taskActions";
import {
  selectTasks,
  selectTasksLoading,
  selectTaskError,
  selectUser,
  selectAuthToken,
  selectValidTasks,
  selectIsAuthenticated
} from "../Redux/selectors/taskSelectors";

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const MapScreen = () => {
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const mapRef = useRef(null);

  // Utiliser les sélecteurs mémorisés
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const tasks = useSelector(selectTasks);
  const tasksLoading = useSelector(selectTasksLoading);
  const error = useSelector(selectTaskError);
  const user = useSelector(selectUser);
  const authToken = useSelector(selectAuthToken);
  const validTasks = useSelector(selectValidTasks);
  
  const dispatch = useDispatch();

  // Vérifier l'authentification
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Non connecté',
        'Vous devez être connecté pour accéder à vos tâches',
        [
          {
            text: 'Se connecter',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    }
  }, [isAuthenticated, navigation]);

  const fetchInitialData = useCallback(async () => {
    try {
      // Vérifier l'authentification d'abord
      if (!isAuthenticated || !user?.id || !authToken) {
        console.log('Auth state:', { isAuthenticated, userId: user?.id, hasToken: !!authToken });
        return;
      }

      // Permission de localisation
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'L\'application a besoin de votre localisation');
        return;
      }

      // Position utilisateur
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      });

      // Récupération des tâches depuis Redux
      dispatch(fetchMyTasks());

    } catch (error) {
      console.error('Error in fetchInitialData:', error);
      Alert.alert('Erreur', error.message || 'Erreur initialisation');
    } finally {
      setLoading(false);
    }
  }, [dispatch, authToken, user, isAuthenticated]);

  // Effet pour charger les données initiales
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Effet pour recharger les tâches quand l'authentification change
  useEffect(() => {
    if (isAuthenticated && user?.id && authToken) {
      dispatch(fetchMyTasks());
    }
  }, [isAuthenticated, user?.id, authToken]);

  // Calcul d'itinéraire
  const getRoute = async (start, end) => {
    setCalculatingRoute(true);
    try {
      console.log('Calculating route from:', start, 'to:', end);
      
      // Vérifier les coordonnées
      if (!start || !end || !start.latitude || !start.longitude || !end.latitude || !end.longitude) {
        throw new Error('Coordonnées invalides');
      }

      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );

      if (!response.data || !response.data.routes || !response.data.routes[0]) {
        throw new Error('Format de réponse invalide');
      }

      console.log('Route received:', response.data);
      
      // Conversion des coordonnées GeoJSON [lon,lat] vers [lat,lon]
      const coordinates = response.data.routes[0].geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));
      
      if (coordinates.length === 0) {
        throw new Error('Aucune coordonnée dans l\'itinéraire');
      }

      // Calculer la distance et la durée
      const distance = (response.data.routes[0].distance / 1000).toFixed(1); // km
      const duration = Math.round(response.data.routes[0].duration / 60); // minutes

      console.log('Route coordinates:', coordinates.length, 'points');
      
      // Mettre à jour les coordonnées et ajuster la vue de la carte
      setRouteCoordinates(coordinates);
      
      // Ajuster la vue de la carte pour montrer tout l'itinéraire
      const padding = 50;
      setTimeout(() => {
        mapRef.current.fitToCoordinates(
          [
            { latitude: start.latitude, longitude: start.longitude },
            { latitude: end.latitude, longitude: end.longitude },
            ...coordinates
          ],
          {
            edgePadding: {
              top: padding,
              right: padding,
              bottom: padding,
              left: padding
            },
            animated: true
          }
        );
      }, 100);

      // Mettre à jour les détails de l'itinéraire
      setSelectedTask(prev => ({
        ...prev,
        routeInfo: {
          distance,
          duration
        }
      }));

      // Attendre un peu pour s'assurer que les coordonnées sont bien mises à jour
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowRouteDetails(true);

    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error);
      Alert.alert(
        'Erreur',
        'Impossible de calculer l\'itinéraire. Veuillez réessayer.'
      );
      setShowRouteDetails(false);
      setRouteCoordinates([]);
    } finally {
      setCalculatingRoute(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Veuillez vous connecter pour voir vos tâches</Text>
      </View>
    );
  }

  if (loading || tasksLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={userLocation || {
          latitude: 33.5731,
          longitude: -7.5898,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }}
      >
        <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
        />

        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Votre position"
            pinColor="#2196F3"
          />
        )}

        {validTasks && validTasks.length > 0 ? (
          validTasks.map(task => {
            const latitude = parseFloat(task.location.latitude);
            const longitude = parseFloat(task.location.longitude);
            
            if (isNaN(latitude) || isNaN(longitude)) {
              console.warn('Invalid coordinates for task:', task.id);
              return null;
            }

            return (
              <Marker
                key={task.id}
                coordinate={{
                  latitude,
                  longitude
                }}
                title={task.nom || 'Tâche sans nom'}
                description={task.description || 'Aucune description'}
                pinColor="red"
                onPress={() => {
                  setShowRouteDetails(false);
                  setRouteCoordinates([]);
                  setSelectedTask(task);
                }}
              />
            );
          })
        ) : (
          console.log('No valid tasks to display', { validTasks })
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="#2196F3"
          />
        )}
      </MapView>

      {/* Modal de calcul d'itinéraire */}
      {calculatingRoute && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Calcul de l'itinéraire...</Text>
        </View>
      )}

      {/* Modal des détails de la tâche */}
      {selectedTask && !showRouteDetails && (
        <Modal transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedTask.nom}</Text>
              <Text style={styles.modalDescription}>{selectedTask.description}</Text>
              
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  if (userLocation && selectedTask.location) {
                    const taskLocation = {
                      latitude: parseFloat(selectedTask.location.latitude),
                      longitude: parseFloat(selectedTask.location.longitude)
                    };
                    getRoute(userLocation, taskLocation);
                  }
                }}
              >
                <Text style={styles.buttonText}>Tracer l'itinéraire</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.closeButton]}
                onPress={() => {
                  setSelectedTask(null);
                  setRouteCoordinates([]);
                  setShowRouteDetails(false);
                }}
              >
                <Text style={styles.buttonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal des détails de l'itinéraire */}
      {showRouteDetails && selectedTask && (
        <View style={styles.routeDetailsContainer}>
          <View style={styles.routeDetailsContent}>
            <Text style={styles.routeDetailsTitle}>Détails de l'itinéraire</Text>
            {selectedTask.routeInfo && (
              <>
                <Text style={styles.routeDetailsText}>
                  Distance : {selectedTask.routeInfo.distance} km
                </Text>
                <Text style={styles.routeDetailsText}>
                  Durée estimée : {selectedTask.routeInfo.duration} min
                </Text>
              </>
            )}
            <TouchableOpacity 
              style={[styles.button, styles.closeButton]}
              onPress={() => {
                setSelectedTask(null);
                setShowRouteDetails(false);
                // Attendre un peu avant d'effacer les coordonnées
                setTimeout(() => {
                  setRouteCoordinates([]);
                }, 100);
              }}
            >
              <Text style={styles.buttonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2196F3',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    marginBottom: 20,
  },
  routeDetailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  routeDetailsContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2196F3',
  },
  routeDetailsText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  closeButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MapScreen;
