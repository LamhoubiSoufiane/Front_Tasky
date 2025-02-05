import React, { useState } from "react";
import MapView, { Marker } from 'react-native-maps';
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
	//const [dueDate, setDueDate] = useState(new Date());
	//const [showDatePicker, setShowDatePicker] = useState(false);

	const [startDate, setStartDate] = useState(new Date());
	const [endDate, setEndDate] = useState(null);
	const [showDatePicker, setShowDatePicker] = useState({ start: false, end: false });
	const [location, setLocation] = useState(null);
	const [showMap, setShowMap] = useState(false);

	const handleDateChange = (event, selectedDate, type) => {
		setShowDatePicker(prev => ({ ...prev, [type]: false }));
		if (selectedDate) {
			if (type === 'start') setStartDate(selectedDate);
			if (type === 'end') setEndDate(selectedDate);
		}
	};
	const handleMapPress = (e) => {
		setLocation(e.nativeEvent.coordinate);
		setShowMap(false);
	};

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

		const taskData = {
			titre: title,
			description,
			assignedToId: selectedMember?.id,
			startDate: startDate.toISOString(),
			endDate: endDate?.toISOString(),
			status: "EN_ATTENTE",
		};
		if (location) {
			taskData.location = {
				latitude: location.latitude,
				longitude: location.longitude,
			};
		}

		onSubmit(
			taskData
			// {
			// titre: title,
			// description,
			// assignedToId: selectedMember?.id,
			// dueDate: dueDate.toISOString().split("T")[0],
			// status: "EN_ATTENTE",
		// }
	);

		// Réinitialiser le formulaire
		setTitle("");
		setDescription("");
		setSelectedMember(null);
		setStartDate(new Date());
		setEndDate(null);
		setLocation(null);
		//setDueDate(new Date());
	};

	/*const handleDateChange = (event, selectedDate) => {
		setShowDatePicker(false);
		if (selectedDate) {
			setDueDate(selectedDate);
		}
	};*/

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

						<View style={styles.inputContainer}>
														<Text style={styles.label}>Date de début *</Text>
															<TouchableOpacity 
																style={styles.dateInput} 
																onPress={() => setShowDatePicker({ ...showDatePicker, start: true })}>
																<Text>{startDate.toLocaleDateString('fr-FR')}</Text>
															</TouchableOpacity>
															{showDatePicker.start && (
																<DateTimePicker
																	value={startDate}
																	mode="date"
																	display="default"
																	onChange={(e, d) => handleDateChange(e, d, 'start')}
																/>
															)}
													</View>
						{/* Date de fin */}
													<View style={styles.inputContainer}>
														<Text style={styles.label}>Date de fin prévue</Text>
														<TouchableOpacity 
															style={styles.dateInput} 
															onPress={() => setShowDatePicker({ ...showDatePicker, end: true })}>
																<Text>{endDate ? endDate.toLocaleDateString('fr-FR') : 'Sélectionner une date'}</Text>
														</TouchableOpacity>
														{showDatePicker.end && (
															<DateTimePicker
																value={endDate || new Date()}
																mode="date"
																display="default"
																onChange={(e, d) => handleDateChange(e, d, 'end')}
															/>
														)}
													</View>
						{/* Localisation */}
													<View style={styles.inputContainer}>
														<Text style={styles.label}>Localisation</Text>
														<TouchableOpacity style={styles.mapButton} onPress={() => setShowMap(true)}>
															<Icon name="map-marker" size={20} color={colors.primary} />
															<Text style={styles.mapButtonText}>
																{location ? 'Localisation sélectionnée' : 'Ajouter une localisation'}
															</Text>
														</TouchableOpacity>
														{location && (
															<View style={styles.mapPreview}>
																<MapView style={styles.miniMap}
																initialRegion={{
																	...location,
																	latitudeDelta: 0.0922,
																	longitudeDelta: 0.0421,
																}}
																scrollEnabled={false}>
																	<Marker coordinate={location} />
																</MapView>
															</View>
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
			{/* Modal pour la carte */}
			<Modal visible={showMap} animationType="slide">
        			<View style={styles.fullMapContainer}>
						<MapView style={styles.fullMap} onPress={handleMapPress}
            					initialRegion={{
              					latitude: 36.8065,
              					longitude: 10.1815,
              					latitudeDelta: 0.0922,
              					longitudeDelta: 0.0421,
            				}}>
            				{location && <Marker coordinate={location} />}
          				</MapView>
						<TouchableOpacity style={styles.closeMapButton} onPress={() => setShowMap(false)}>
							<Icon name="close" size={24} color="#fff" />
         	 			</TouchableOpacity>
        			</View>
      			</Modal>
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

	dateInput: {
		backgroundColor: '#f5f5f5',
		borderRadius: 8,
		padding: 12,
		justifyContent: 'center',
		height: 48,
	},
	mapButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f5f5f5',
		borderRadius: 8,
		padding: 12,
	},
	mapButtonText: {
		marginLeft: 8,
		color: colors.primary,
	},
	mapPreview: {
		marginTop: 10,
		height: 150,
		borderRadius: 8,
		overflow: 'hidden',
	},
	miniMap: {
		...StyleSheet.absoluteFillObject,
	},
	fullMapContainer: {
		flex: 1,
		position: 'relative',
	},
	fullMap: {
		flex: 1,
	},
	closeMapButton: {
		position: 'absolute',
		top: 40,
		right: 20,
		backgroundColor: 'rgba(0,0,0,0.5)',
		borderRadius: 20,
		padding: 10,
	},
});

export default AddTaskForm;
