import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { Avatar, BottomNavigation } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { defaultAvatarUri } from '../assets/default-avatar';

const MapScreen = () => {
    

    return (
        <View style={styles.container}>
            {/* Profile Button */}
            <TouchableOpacity style={styles.profileButton} onPress={() => {/* Navigation vers le profil */}}>
                <Avatar.Image 
                    size={40} 
                    source={{ uri: defaultAvatarUri }}
                    style={styles.avatar}
                />
            </TouchableOpacity>

            {/* Map */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 33.697904,
                    longitude: -7.4019606,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            />

            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    map: {
        flex: 1,
    },
    profileButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
        backgroundColor: 'white',
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    avatar: {
        backgroundColor: 'white',
    },
    bottomNav: {
        backgroundColor: 'white',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});

export default MapScreen;