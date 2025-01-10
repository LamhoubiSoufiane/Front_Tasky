import React, { lazy, Suspense } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { NavigationContainer } from "@react-navigation/native";
import CreateProjectScreen from "../Screens/CreateProjectScreen";

const MapScreen = lazy(() => import("../Screens/MapScreen"));
const TaskScreen = lazy(() => import("../Screens/TaskScreen"));
const MessageScreen = lazy(() => import("../Screens/MessageScreen"));
const TeamScreen = lazy(() => import("../Screens/TeamScreen"));
const SettingsScreen = lazy(() => import("../Screens/SettingsScreen"));
const TeamDetailsScreen = lazy(() => import("../Screens/TeamDetailsScreen"));
const CreateTeamScreen = lazy(() => import("../Screens/CreateTeamScreen"));
const AddMemberScreen = lazy(() => import("../Screens/AddMemberScreen"));

const LoadingComponent = () => (
	<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
		<ActivityIndicator size="large" color="#007AFF" />
	</View>
);

// Modifier la façon dont nous créons les composants lazy
const withSuspense = (WrappedComponent) => {
	return function WithSuspenseWrapper(props) {
		return (
			<Suspense fallback={<LoadingComponent />}>
				<WrappedComponent {...props} />
			</Suspense>
		);
	};
};

const Tab = createBottomTabNavigator();
const TeamStack = createStackNavigator();

const TeamStackNavigator = () => {
	return (
		<TeamStack.Navigator 
			screenOptions={{ 
				headerShown: false
			}}>
			<TeamStack.Screen
				name="TeamsList"
				component={withSuspense(TeamScreen)}
			/>
			<TeamStack.Screen
				name="TeamDetails"
				component={withSuspense(TeamDetailsScreen)}
			/>
			<TeamStack.Screen
				name="CreateTeam"
				component={withSuspense(CreateTeamScreen)}
			/>
			<TeamStack.Screen
				name="AddMember"
				component={withSuspense(AddMemberScreen)}
			/>
			<TeamStack.Screen
				name="CreateProject"
				component={withSuspense(CreateProjectScreen)}
			/>
		</TeamStack.Navigator>
	);
};

const AppNavigator = () => {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => {
					const iconMapping = {
						Map: "map-marker",
						Tasks: "clipboard-list",
						Messages: "message-text",
						Teams: "account-group",
						Settings: "cogs",
					};

					const iconName = iconMapping[route.name];
					return <Icon name={iconName} size={size} color={color} />;
				},
				tabBarActiveTintColor: "#007AFF",
				tabBarInactiveTintColor: "#8E8E93",
				headerShown: false,
				tabBarStyle: {
					height: 60,
					paddingBottom: 5,
					backgroundColor: "white",
					borderTopWidth: 1,
					borderTopColor: "#E5E5EA",
					elevation: 8,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: 0.1,
					shadowRadius: 2,
				},
			})}>
			<Tab.Screen
				name="Map"
				component={withSuspense(MapScreen)}
			/>
			<Tab.Screen
				name="Tasks"
				component={withSuspense(TaskScreen)}
			/>
			<Tab.Screen
				name="Messages"
				component={withSuspense(MessageScreen)}
			/>
			<Tab.Screen
				name="Teams"
				component={TeamStackNavigator}
			/>
			<Tab.Screen
				name="Settings"
				component={withSuspense(SettingsScreen)}
			/>
		</Tab.Navigator>
	);
};

export default AppNavigator;
