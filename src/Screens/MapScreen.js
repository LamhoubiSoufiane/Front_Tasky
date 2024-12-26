import React from'react';
import { View, StyleSheet} from'react-native';
import MapView from'react-native-maps'; // MapViewde react-native-maps
 // Définition du composant fonctionnel Mapview
    const MapScreen= () => {
        return (
            <View style={styles.container}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                    latitude: 33.697904, // Latitude de la position initiale de la carte
                    longitude: -7.4019606, // Longitude de la position initiale de la carte
                    latitudeDelta: 0.0922, // Plage de variation de la latitude (zoom sur la carte)
                    longitudeDelta: 0.0421, // Plage de variation de la longitude (zoom sur la carte)
                    }}   />
            </View> 
            );
        }

    const styles = StyleSheet.create({
        container: {
            flex: 1, // Permet à la vue de prendre toute la hauteur disponible
            width: '100%', // La largeur de la vue est de 100% de l'écran
            height: '100%', // La hauteur de la vue est de 100% de l'écran
        },
        map: {
            flex: 1, // Permet à la carte de remplir toute la vue },
        }
    });
export default MapScreen;