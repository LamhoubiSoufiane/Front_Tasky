import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingFallback = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
    </View>
);

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000
    }
});

export default LoadingFallback;
