import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';
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
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const mapRef = useRef(null);
  
  // États locaux
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  // Sélecteurs Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const authToken = useSelector(selectAuthToken);
  const tasks = useSelector(selectTasks);
  const tasksLoading = useSelector(selectTasksLoading);

  // Effet pour l'initialisation
  useEffect(() => {
    const initialize = async () => {
      try {
        if (!isAuthenticated || !user?.id || !authToken) {
          console.log('Non authentifié');
          return;
        }

        // Position utilisateur
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission requise', 'L\'application a besoin de votre localisation');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        });

        // Charger les tâches
        await dispatch(fetchUserTasks({ token: authToken, userId: user.id }));
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        Alert.alert('Erreur', 'Impossible d\'initialiser la carte');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [isAuthenticated, user?.id, authToken]);

  // Effet pour la connexion socket
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    console.log('Initialisation de la connexion socket...');
    const newSocket = io(API_BASE_URL, {
      path: '/websockets',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000
    });

    newSocket.on('connect', () => {
      console.log('Socket connecté - Rejoindre les tâches');
      newSocket.emit('joinUserTasks', { userId: user.id });
    });

    newSocket.on('joinedUserTasks', (response) => {
      console.log('Abonnement aux tâches confirmé:', response);
      dispatch(fetchUserTasks({ token: authToken, userId: user.id }));
    });

    const handleTaskUpdate = async (message) => {
      console.log('Mise à jour de tâche reçue:', message);
      if (message?.task?.userId === user.id) {
        console.log('Rechargement des tâches après mise à jour');
        await dispatch(fetchUserTasks({ token: authToken, userId: user.id }));
      }
    };

    newSocket.on('taskCreated', handleTaskUpdate);
    newSocket.on('taskUpdated', handleTaskUpdate);
    newSocket.on('taskDeleted', handleTaskUpdate);

    newSocket.on('connect_error', (error) => {
      console.error('Erreur de connexion socket:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket déconnecté:', reason);
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        return;
      }
      // Tentative de reconnexion
      setTimeout(() => {
        console.log('Tentative de reconnexion...');
        newSocket.connect();
      }, 3000);
    });

    setSocket(newSocket);

    return () => {
      console.log('Nettoyage de la connexion socket');
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user?.id, authToken]);

  // Filtrer les tâches avec localisation valide
  const validMarkers = useMemo(() => {
    console.log('Calcul des marqueurs valides. Nombre de tâches:', tasks.length);
    return tasks.filter(task => {
      if (!task?.location?.latitude || !task?.location?.longitude) {
        console.log('Tâche sans localisation:', task?.id);
        return false;
      }

      const latitude = parseFloat(task.location.latitude);
      const longitude = parseFloat(task.location.longitude);

      if (isNaN(latitude) || isNaN(longitude)) {
        console.log('Tâche avec coordonnées invalides:', task.id);
        return false;
      }

      return true;
    }).map(task => ({
      id: task.id,
      coordinate: {
        latitude: parseFloat(task.location.latitude),
        longitude: parseFloat(task.location.longitude)
      },
      title: task.nom || 'Sans nom',
      description: task.description || 'Sans description',
      task: task
    }));
  }, [tasks]);

  // Calcul d'itinéraire
  const getRoute = async (start, end) => {
    setCalculatingRoute(true);
    try {
      if (!start || !end || !start.latitude || !start.longitude || !end.latitude || !end.longitude) {
        throw new Error('Coordonnées invalides');
      }

      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );

      if (!response.data || !response.data.routes || !response.data.routes[0]) {
        throw new Error('Format de réponse invalide');
      }

      const coordinates = response.data.routes[0].geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));

      const distance = (response.data.routes[0].distance / 1000).toFixed(1);
      const duration = Math.round(response.data.routes[0].duration / 60);

      // Mettre à jour les coordonnées avant de changer l'état de la tâche
      setRouteCoordinates(coordinates);

      // Attendre que les coordonnées soient mises à jour
      await new Promise(resolve => setTimeout(resolve, 100));

      // Mettre à jour la tâche avec les infos de route
      setSelectedTask(prev => ({
        ...prev,
        routeInfo: { distance, duration }
      }));

      // Ajuster la vue de la carte
      if (mapRef.current) {
        const region = {
          latitude: (start.latitude + end.latitude) / 2,
          longitude: (start.longitude + end.longitude) / 2,
          latitudeDelta: Math.abs(start.latitude - end.latitude) * 1.5,
          longitudeDelta: Math.abs(start.longitude - end.longitude) * 1.5
        };

        mapRef.current.animateToRegion(region, 1000);

        setTimeout(() => {
          mapRef.current.fitToCoordinates(
            [start, end, ...coordinates],
            {
              edgePadding: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
              },
              animated: true
            }
          );
        }, 1500);
      }

      // Afficher les détails après que tout soit mis à jour
      setTimeout(() => {
        setShowRouteDetails(true);
      }, 500);

    } catch (error) {
      console.error('Erreur de calcul d\'itinéraire:', error);
      Alert.alert('Erreur', 'Impossible de calculer l\'itinéraire');
      setRouteCoordinates([]);
      setShowRouteDetails(false);
    } finally {
      setCalculatingRoute(false);
    }
  };

  // Fonction pour fermer les détails
  const handleCloseDetails = () => {
    setShowRouteDetails(false);
    setSelectedTask(null);
    // Attendre que le modal soit fermé avant d'effacer l'itinéraire
    setTimeout(() => {
      setRouteCoordinates([]);
    }, 300);
  };

  // Rendu du composant de chargement
  if (loading || tasksLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  // Rendu principal
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={userLocation}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
        />
        {validMarkers.map(marker => (
          <Marker
            key={`task-${marker.id}`}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor="red"
            onPress={() => {
              setRouteCoordinates([]);
              setShowRouteDetails(false);
              setSelectedTask(marker.task);
            }}
          />
        ))}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={3}
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
                onPress={handleCloseDetails}
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
              onPress={handleCloseDetails}
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
