import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Modal,
} from "react-native";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";

const AddTaskForm = ({ visible, onClose, onSubmit, members = [] }) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [selectedMember, setSelectedMember] = useState(null);
	const [dueDate, setDueDate] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);

	const handleSubmit = () => {
		if (!title.trim() || !description.trim()) {
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Le titre et la description sont obligatoires",
				position: "top",
				visibilityTime: 3000,
			});
			return;
		}

		onSubmit({
			titre: title,
			description,
			assignedToId: selectedMember?.id,
			dueDate: dueDate.toISOString().split("T")[0],
			status: "EN_ATTENTE",
		});

		// Réinitialiser le formulaire
		setTitle("");
		setDescription("");
		setSelectedMember(null);
		setDueDate(new Date());
	};

	const handleDateChange = (event, selectedDate) => {
		setShowDatePicker(false);
		if (selectedDate) {
			setDueDate(selectedDate);
		}
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={true}
			onRequestClose={onClose}>
			<View style={styles.modalContainer}>
				<View style={styles.modalContent}>
					<View style={styles.header}>
						<Text style={styles.title}>Nouvelle tâche</Text>
						<TouchableOpacity onPress={onClose} style={styles.closeButton}>
							<Icon name="close" size={24} color={colors.text} />
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.form}>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Titre *</Text>
							<TextInput
								style={styles.input}
								value={title}
								onChangeText={setTitle}
								placeholder="Titre de la tâche"
								placeholderTextColor={colors.textLight}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Description *</Text>
							<TextInput
								style={[styles.input, styles.textArea]}
								value={description}
								onChangeText={setDescription}
								placeholder="Description détaillée de la tâche"
								placeholderTextColor={colors.textLight}
								multiline
								numberOfLines={4}
							/>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Date d'échéance</Text>
							<TouchableOpacity
								style={styles.dateButton}
								onPress={() => setShowDatePicker(true)}>
								<Text style={styles.dateButtonText}>
									{dueDate.toLocaleDateString()}
								</Text>
								<Icon name="calendar" size={24} color={colors.primary} />
							</TouchableOpacity>
							{showDatePicker && (
								<DateTimePicker
									value={dueDate}
									mode="date"
									display="default"
									onChange={handleDateChange}
									minimumDate={new Date()}
								/>
							)}
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Assigner à</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								style={styles.membersContainer}>
								{members.map((member) => (
									<TouchableOpacity
										key={member.id}
										style={[
											styles.memberChip,
											selectedMember?.id === member.id &&
												styles.selectedMemberChip,
										]}
										onPress={() => setSelectedMember(member)}>
										<Text
											style={[
												styles.memberChipText,
												selectedMember?.id === member.id &&
													styles.selectedMemberChipText,
											]}>
											{member.username}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>

						<TouchableOpacity
							style={styles.submitButton}
							onPress={handleSubmit}>
							<Text style={styles.submitButtonText}>Créer la tâche</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingVertical: 20,
		paddingHorizontal: 16,
		maxHeight: "90%",
		minHeight: "70%",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
		paddingBottom: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		color: colors.text,
	},
	closeButton: {
		padding: 8,
		backgroundColor: colors.backgroundLight,
		borderRadius: 20,
	},
	form: {
		flex: 1,
		paddingBottom: 20,
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.text,
		marginBottom: 8,
	},
	input: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		color: colors.text,
		minHeight: 45,
	},
	textArea: {
		height: 100,
		textAlignVertical: "top",
		minHeight: 100,
	},
	dateButton: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 12,
		minHeight: 45,
	},
	dateButtonText: {
		fontSize: 16,
		color: colors.text,
	},
	membersContainer: {
		flexDirection: "row",
		marginBottom: 8,
		minHeight: 40,
	},
	memberChip: {
		backgroundColor: colors.backgroundLight,
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 8,
		marginRight: 8,
		borderWidth: 1,
		borderColor: "#ddd",
		minHeight: 36,
	},
	selectedMemberChip: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	memberChipText: {
		color: colors.text,
		fontSize: 14,
	},
	selectedMemberChipText: {
		color: "#fff",
	},
	submitButton: {
		backgroundColor: colors.primary,
		borderRadius: 8,
		padding: 16,
		alignItems: "center",
		marginTop: 20,
		minHeight: 50,
	},
	submitButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default AddTaskForm;
