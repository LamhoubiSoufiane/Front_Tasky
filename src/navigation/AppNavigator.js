import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../Screens/MapScreen';
import TaskScreen from '../Screens/TaskScreen';
import MessageScreen from '../Screens/MessageScreen';
import TeamScreen from '../Screens/TeamScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Map') {
                        iconName = 'map-marker';
                    } else if (route.name === 'Tasks') {
                        iconName = 'clipboard-list';
                    } else if (route.name === 'Messages') {
                        iconName = 'message-text';
                    } else if (route.name === 'Teams') {
                        iconName = 'account-group';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                headerShown: false,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 5,
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E5EA',
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                }
            })}
        >
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Tasks" component={TaskScreen} />
            <Tab.Screen name="Messages" component={MessageScreen} />
            <Tab.Screen name="Teams" component={TeamScreen} />
        </Tab.Navigator>
    );
};

export default AppNavigator;
