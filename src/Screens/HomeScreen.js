import React, { useEffect } from 'react';
import { ScrollView, View, Image, Text, TouchableOpacity, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const HomeScreen = ({ navigation }) => {
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(50);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#ffffff'}}>
            <StatusBar barStyle="dark-content"  />
            <LinearGradient
                colors={['#ffffff', '#f8f9fa', '#e9ecef']}
                style={{ flex: 1, minHeight: Dimensions.get('window').height , top:80}}
            >
                <Animatable.View 
                    animation="fadeIn" 
                    duration={1000} 
                    style={{ padding: 32, alignItems: 'center' }}
                >
                    <Image 
                        source={require('../../assets/logo.jpeg')}
                        style={{
                            width: 120,
                            height: 120,
                            marginBottom: 20,
                            borderRadius: 60,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 4,
                            },
                            shadowOpacity: 0.15,
                            shadowRadius: 5,
                            elevation: 5,
                            
                        }}
                        resizeMode="cover"
                    />

                    <Animated.View style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }}>
                        <Text style={{
                            fontSize: 42,
                            fontWeight: 'bold',
                            color: '#1a1a1a',
                            textAlign: 'center',
                            marginBottom: 16,
                            letterSpacing: 1,
                        }}>
                            Tasky
                        </Text>

                        <Text style={{
                            fontSize: 22,
                            color: '#4c669f',
                            textAlign: 'center',
                            marginBottom: 24,
                            fontWeight: '500',
                        }}>
                            Gérez vos tâches efficacement
                        </Text>

                        <Text style={{
                            fontSize: 16,
                            color: '#4a4a4a',
                            textAlign: 'center',
                            marginBottom: 40,
                            lineHeight: 24,
                            paddingHorizontal: 20,
                        }}>
                            Tasky est votre solution complète pour la gestion de projets et de tâches.
                            Organisez, collaborez et suivez vos progrès en temps réel.
                        </Text>

                        <TouchableOpacity
                            style={{
                                backgroundColor: '#4c669f',
                                paddingVertical: 16,
                                paddingHorizontal: 32,
                                borderRadius: 12,
                                marginBottom: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: "#93441A",
                                shadowOffset: {
                                    width: 0,
                                    height: 4,
                                },
                                shadowOpacity: 0.2,
                                shadowRadius: 5,
                                elevation: 4,
                            }}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Ionicons name="log-in-outline" size={24} color="white" style={{ marginRight: 8 }} />
                            <Text style={{ 
                                color: 'white', 
                                fontSize: 18, 
                                fontWeight: '600' 
                            }}>
                                Se connecter
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                backgroundColor: '#1E0F1C',
                                paddingVertical: 16,
                                paddingHorizontal: 32,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: "#1E0F1C",
                                shadowOffset: {
                                    width: 0,
                                    height: 4,
                                },
                                shadowOpacity: 0.2,
                                shadowRadius: 5,
                                elevation: 4,
                            }}
                            onPress={() => navigation.navigate('Register')}
                        >
                            <Ionicons name="person-add-outline" size={24} color="white" style={{ marginRight: 8 }} />
                            <Text style={{ 
                                color: 'white', 
                                fontSize: 18, 
                                fontWeight: '600' 
                            }}>
                                Créer un compte
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animatable.View>
            </LinearGradient>
        </ScrollView>
    );
};

export default HomeScreen;
