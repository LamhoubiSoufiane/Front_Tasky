import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  const mockTasks = [
    {
      id: 1,
      nom: "Tâche 1",
      description: "Description tâche 1",
      location: { latitude: 33.5731, longitude: -7.5898 } // Exemple Casablanca
    }
  ];

  useEffect(() => {
    const getLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('Permission requise', 'L\'application a besoin de votre localisation');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        });

      } catch (error) {
        Alert.alert('Erreur', 'Impossible de récupérer la position');
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  // Calcul d'itinéraire
  const getRoute = async (start, end) => {
    try {
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );
  
      console.log('Geometry reçue:', response.data.routes[0].geometry);
      
      // Conversion des coordonnées GeoJSON [lon,lat] vers [lat,lon]
      const coordinates = response.data.routes[0].geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));
  
      console.log('Coordonnées converties:', coordinates.slice(0, 5)); // Affiche les 5 premiers points
      
      if (coordinates.length === 0) {
        throw new Error('Aucune coordonnée valide');
      }
  
      setRouteCoordinates(coordinates);
      
      // Ajustement de la région de la carte
      const newRegion = {
        latitude: (start.latitude + end.latitude) / 2,
        longitude: (start.longitude + end.longitude) / 2,
        latitudeDelta: Math.abs(start.latitude - end.latitude) * 2,
        longitudeDelta: Math.abs(start.longitude - end.longitude) * 2
      };
      mapRef.current.animateToRegion(newRegion, 1000);
  
    } catch (error) {
      console.error('Erreur de tracé:', {
        error: error.message,
        response: error.response?.data
      });
      Alert.alert('Erreur', `Détails : ${error.message || 'Format de réponse inattendu'}`);
    }
  };

  if (loading) {
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
        region={userLocation}
      >
        <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
        />

        {/* Marqueur utilisateur */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Votre position"
            pinColor="#2196F3"
          />
        )}

        {/* Marqueurs des tâches */}
        {mockTasks.map(task => (
          <Marker
            key={task.id}
            coordinate={task.location}
            title={task.nom}
            description={task.description}
            pinColor="red"
            onPress={() => setSelectedTask(task)}
          />
        ))}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={5}
            strokeColor="#FF0000"
            lineDashPattern={[10, 10]}
            key={JSON.stringify(routeCoordinates)} // Force le re-render
          />
        )}
      </MapView>

      {/* Confirmation d'itinéraire */}
      {selectedTask && (
        <Modal transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedTask.nom}</Text>
              <Text style={styles.modalDescription}>{selectedTask.description}</Text>
              
              <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                  if (userLocation) {
                    getRoute(userLocation, selectedTask.location);
                  }
                  setSelectedTask(null);
                }}
              >
                <Text style={styles.buttonText}>Tracer l'itinéraire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// Styles identiques à la version précédente
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MapScreen;
/*
import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { setUserLocation, loadInitialTasks } from '../Redux/actions/taskActions';
import { mockTasks } from '../data/mockTasks';
import MapViewDirections from 'react-native-maps-directions';

const MapScreen = () => {
  const dispatch = useDispatch();
  const userLocation = useSelector((state) => state.task?.userLocation);
  const loading = useSelector((state) => state.task?.loading);
  const [mapReady, setMapReady] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const tasks = mockTasks;

  const initialRegion = {
    latitude: 33.5731104,
    longitude: -7.5898434,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        dispatch(setUserLocation(location.coords));
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    getUserLocation();
    dispatch(loadInitialTasks());
  }, [dispatch]);

  const onMapReady = () => {
    setMapReady(true);
  };

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    Alert.alert(
      `Tâche: ${task.nom}`,
      `${task.description}\n\nVoulez-vous tracer le trajet jusqu'à cette tâche ?`,
      [
        { text: 'Non', onPress: () => setShowRoute(false), style: 'cancel' },
        { text: 'Oui', onPress: () => setShowRoute(true) },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onMapReady={onMapReady}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {mapReady && Array.isArray(tasks) && tasks.map((task) => (
          <Marker
            key={task.id}
            coordinate={{
              latitude: task.location.latitude,
              longitude: task.location.longitude,
            }}
            title={task.nom}
            description={task.description}
            pinColor={task.priority === 'URGENT' ? 'red' : 'orange'}
            onPress={() => handleTaskPress(task)}
          />
        ))}

        {showRoute && selectedTask && userLocation && (
          <MapViewDirections
            origin={userLocation}
            destination={{
              latitude: selectedTask.location.latitude,
              longitude: selectedTask.location.longitude,
            }}
            apikey="VOTRE_CLE_API_GOOGLE_MAPS" // Remplacez par votre clé API Google Maps
            strokeWidth={3}
            strokeColor="blue"
            onReady={(result) => {
              console.log('Distance:', result.distance, 'km');
              console.log('Durée:', result.duration, 'min');
            }}
            onError={(errorMessage) => {
              console.error('Erreur de traçage:', errorMessage);
            }}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(MapScreen);



*/ 