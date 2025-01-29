import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { setUserLocation, loadInitialTasks } from '../Redux/actions/taskActions';
import { mockTasks } from '../data/mockTasks';

const MapScreen = () => {
  const dispatch = useDispatch();
  //const tasks = useSelector((state) => state.task?.tasks || []);
  const userLocation = useSelector((state) => state.task?.userLocation);
  const loading = useSelector((state) => state.task?.loading);
  const [mapReady, setMapReady] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const tasks = mockTasks;
  // {mapReady && userLocation && (
  //   <Marker
  //     coordinate={{
  //       latitude: userLocation.latitude,
  //       longitude: userLocation.longitude,
  //     }}
  //     title="Ma position"
  //     pinColor="blue"
  //   />
  // )}




  // Initial region centré sur Casablanca
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

        console.log('Getting user location...');
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        console.log('User location received:', location.coords);
        dispatch(setUserLocation(location.coords));
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    getUserLocation();
    dispatch(loadInitialTasks());
  }, [dispatch]);

  useEffect(() => {
    console.log('Tasks updated:', tasks);
    console.log('User location updated:', userLocation);
  }, [tasks, userLocation]);

  const handleMarkerPress = (task) => {
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

  const handleRouteToTask = (task) => {
    // Logique pour tracer le trajet
    console.log('Tracer le trajet vers :', task.nom);
    // Vous pouvez implémenter ici la logique pour tracer l'itinéraire
    // Par exemple, utiliser une API de directions comme Google Directions API
  };


  const onMapReady = () => {
    console.log('Map is ready');
    setMapReady(true);
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
        
        
        {mapReady && Array.isArray(tasks) && tasks.map(task => (
          <Marker
            key={task.id}
            coordinate={{
              latitude: task.location.latitude,
              longitude: task.location.longitude,
            }}
            title={task.nom}
            description={task.description}
            pinColor={task.priority === 'URGENT' ? 'red' : 'orange'}
            onPress={() => handleMarkerPress(task)}
          
          />
        ))}

{showRoute && selectedTask && userLocation && (
          <MapViewDirections
            origin={userLocation}
            destination={{
              latitude: selectedTask.location.latitude,
              longitude: selectedTask.location.longitude,
            }}
            apikey="AIzaSyABUZOH8do9TGV0AX-eQiSoFhUH2qzSZ-U" // Remplacez par votre clé API Google Maps
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
  }
});

export default React.memo(MapScreen);




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