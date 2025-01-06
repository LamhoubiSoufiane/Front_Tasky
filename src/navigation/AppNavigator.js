import React, { lazy, Suspense } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

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

const LazyMapScreen = () => (
	<Suspense fallback={<LoadingComponent />}>
		<MapScreen />
	</Suspense>
);

const LazyTaskScreen = () => (
	<Suspense fallback={<LoadingComponent />}>
		<TaskScreen />
	</Suspense>
);

const LazyMessageScreen = () => (
	<Suspense fallback={<LoadingComponent />}>
		<MessageScreen />
	</Suspense>
);

const LazyTeamScreen = () => (
	<Suspense fallback={<LoadingComponent />}>
		<TeamScreen />
	</Suspense>
);

const LazySettingsScreen = () => (
	<Suspense fallback={<LoadingComponent />}>
		<SettingsScreen />
	</Suspense>
);

const LazyTeamDetailsScreen = () => (
	<Suspense fallback={<LoadingComponent />}>
		<TeamDetailsScreen />
	</Suspense>
);

const LazyCreateTeamScreen = () => (
	<Suspense fallback={<LoadingComponent />}>
		<CreateTeamScreen />
	</Suspense>
);

const LazyAddMemberScreen = () => (
	<Suspense fallback={<LoadingComponent />}>
		<AddMemberScreen />
	</Suspense>
);

const Tab = createBottomTabNavigator();
const TeamStack = createStackNavigator();

const TeamStackNavigator = () => {
	return (
		<TeamStack.Navigator screenOptions={{ headerShown: false }}>
			<TeamStack.Screen
				name="TeamsList"
				component={LazyTeamScreen}
				options={{ lazy: true }}
			/>
			<TeamStack.Screen
				name="TeamDetails"
				component={LazyTeamDetailsScreen}
				options={{ lazy: true }}
			/>
			<TeamStack.Screen
				name="CreateTeam"
				component={LazyCreateTeamScreen}
				options={{ lazy: true }}
			/>
			<TeamStack.Screen
				name="AddMember"
				component={LazyAddMemberScreen}
				options={{ lazy: true }}
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
				component={LazyMapScreen}
				options={{ lazy: true }}
			/>
			<Tab.Screen
				name="Tasks"
				component={LazyTaskScreen}
				options={{ lazy: true }}
			/>
			<Tab.Screen
				name="Messages"
				component={LazyMessageScreen}
				options={{ lazy: true }}
			/>
			<Tab.Screen
				name="Teams"
				component={TeamStackNavigator}
				options={{ lazy: true }}
			/>
			<Tab.Screen
				name="Settings"
				component={LazySettingsScreen}
				options={{ lazy: true }}
			/>
		</Tab.Navigator>
	);
};

export default AppNavigator;
