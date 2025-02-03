import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export interface PushNotificationState {
	expoPushToken?: Notifications.ExpoPushToken;
	notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState => {
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldPlaySound: true,
			shouldShowAlert: true,
			shouldSetBadge: true,
		}),
	});

	const [expoPushToken, setExpoPushToken] = useState<
		Notifications.ExpoPushToken | undefined
	>();

	const [notification, setNotification] = useState<
		Notifications.Notification | undefined
	>();

	const notificationListener = useRef<Notifications.Subscription>();
	const responseListener = useRef<Notifications.Subscription>();

	async function registerForPushNotificationsAsync() {
		let token;

		if (Device.isDevice) {
			const { status: existingStatus } =
				await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;

			if (existingStatus !== "granted") {
				const { status } = await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}

			if (finalStatus !== "granted") {
				alert("Échec de l'obtention du token pour les notifications push");
				return;
			}

			token = await Notifications.getExpoPushTokenAsync({
				projectId: Constants.expoConfig?.extra?.eas.projectId,
			});

			// Configuration du canal de notification pour Android
			if (Platform.OS === "android") {
				await Notifications.setNotificationChannelAsync("default", {
					name: "default",
					importance: Notifications.AndroidImportance.MAX,
					vibrationPattern: [0, 250, 250, 250],
					lightColor: "#FF231F7C",
				});
			}
		} else {
			alert("Les notifications push nécessitent un appareil physique");
		}

		return token;
	}

	useEffect(() => {
		registerForPushNotificationsAsync().then((token) => {
			setExpoPushToken(token);
			console.log("Token Expo Push:", token?.data);
		});

		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				setNotification(notification);
			});

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener((response) => {
				console.log("Réponse à la notification:", response);
			});

		return () => {
			if (notificationListener.current) {
				Notifications.removeNotificationSubscription(
					notificationListener.current
				);
			}
			if (responseListener.current) {
				Notifications.removeNotificationSubscription(responseListener.current);
			}
		};
	}, []);

	return {
		expoPushToken,
		notification,
	};
};
