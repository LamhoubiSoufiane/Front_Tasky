import React, { useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { colors } from "../assets/colors";

const MemberCard = ({ member }) => (
	<View style={styles.memberCard}>
		<View style={styles.memberInfo}>
			<Text style={styles.memberName}>{member.username}</Text>
			<Text style={styles.memberEmail}>{member.email}</Text>
		</View>
		<View style={styles.memberRole}>
			<Text style={styles.roleText}>{member.role || "Membre"}</Text>
		</View>
	</View>
);

const ProjectMembersScreen = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const { project, members } = route.params;

	const handleBackPress = useCallback(() => {
		navigation.goBack();
	}, [navigation]);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
					<Icon name="arrow-left" size={24} color="#fff" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Membres du projet</Text>
			</View>

			<FlatList
				data={members}
				renderItem={({ item }) => <MemberCard member={item} />}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContainer}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>Aucun membre dans ce projet</Text>
					</View>
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#eef2f3",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		padding: 20,
		paddingTop: 60,
		backgroundColor: "#4c669f",
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	backButton: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	headerTitle: {
		fontSize: 32,
		fontWeight: "900",
		color: "#fff",
		flex: 1,
		marginLeft: 15,
		letterSpacing: 0.5,
	},
	listContainer: {
		padding: 16,
	},
	memberCard: {
		flexDirection: "row",
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
	},
	memberInfo: {
		flex: 1,
	},
	memberName: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.text,
		marginBottom: 4,
	},
	memberEmail: {
		fontSize: 14,
		color: colors.textGray,
	},
	memberRole: {
		backgroundColor: "#4c669f",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		justifyContent: "center",
	},
	roleText: {
		fontSize: 12,
		color: "#fff",
		fontWeight: "500",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 32,
	},
	emptyText: {
		fontSize: 16,
		color: colors.textGray,
		textAlign: "center",
	},
});

export default ProjectMembersScreen;
