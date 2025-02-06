import React, { memo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { assignTaskToMember } from "../Redux/actions/taskActions";
import Toast from "react-native-toast-message";

const TaskItem = memo(({ task, onPress, onStatusChange, projectMembers = [] }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    
    console.log("Task in TaskItem:", task);
    console.log("Project Members in TaskItem:", projectMembers);

    const getStatusStyle = (status) => {
        if (!status) return styles.statusTodo;
        switch (status.toLowerCase()) {
            case "termine":
                return styles.statusDone;
            case "en_cours":
                return styles.statusInProgress;
            case "a_faire":
                return styles.statusTodo;
            default:
                return styles.statusTodo;
        }
    };

    const getStatusText = (status) => {
        if (!status) return "À FAIRE";
        switch (status.toLowerCase()) {
            case "termine":
                return "TERMINÉ";
            case "en_cours":
                return "EN COURS";
            case "a_faire":
                return "À FAIRE";
            default:
                return "À FAIRE";
        }
    };

    const handleEdit = () => {
        navigation.navigate("TaskDetails", { 
            taskId: task.id,
            isEditMode: true 
        });
    };

    const handleAssign = () => {
        setIsAssignModalVisible(true);
    };

    const handleAssignTask = async (memberId) => {
        try {
            console.log('Assigning task:', task.id, 'to member:', memberId);
            console.log('Available project members:', projectMembers);
            
            const result = await dispatch(assignTaskToMember(task.id, memberId));
            if (result.success) {
                Toast.show({
                    type: "success",
                    text1: "Succès",
                    text2: "Tâche assignée avec succès",
                    position: "top",
                    visibilityTime: 3000,
                });
                setIsAssignModalVisible(false);
            } else {
                Toast.show({
                    type: "error",
                    text1: "Erreur",
                    text2: result.error || "Impossible d'assigner la tâche",
                    position: "top",
                    visibilityTime: 3000,
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'assignation:", error);
            Toast.show({
                type: "error",
                text1: "Erreur",
                text2: "Impossible d'assigner la tâche",
                position: "top",
                visibilityTime: 3000,
            });
        }
    };

    const getMemberName = () => {
        // Si nous avons un membre avec un nom
        if (task.member?.username) {
            return task.member.username;
        }
        return "Non assigné";
    };

    return (
        <>
            <TouchableOpacity 
                style={styles.container} 
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.leftContent}>
                    <Text style={styles.title} numberOfLines={1}>
                        {task.title || task.nom || task.name}
                    </Text>
                    <View style={styles.infoRow}>
                        <View style={styles.assignSection}>
                            <TouchableOpacity 
                                onPress={handleAssign}
                                style={styles.assignButton}
                            >
                                <Icon name="person-add" size={20} color={colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.assignedTo}>
                                {getMemberName()}
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.status, getStatusStyle(task.statut || task.status)]}
                            onPress={onStatusChange}
                        >
                            <Text style={styles.statusText}>
                                {getStatusText(task.statut || task.status)}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.actions}>
                    <TouchableOpacity 
                        onPress={handleEdit}
                        style={styles.iconButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon name="edit" size={22} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            <Modal
                visible={isAssignModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAssignModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Assigner la tâche à</Text>
                        <ScrollView>
                            {projectMembers.length > 0 ? (
                                projectMembers.map((member) => (
                                    <TouchableOpacity
                                        key={member.id}
                                        style={styles.memberItem}
                                        onPress={() => handleAssignTask(member.id)}>
                                        <Text style={styles.memberName}>
                                            {member.name || member.username}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.noMembersText}>
                                    Aucun membre disponible
                                </Text>
                            )}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsAssignModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    leftContent: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    assignSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    assignButton: {
        marginRight: 8,
        padding: 4,
    },
    assignedTo: {
        fontSize: 14,
        color: "#7f8c8d",
    },
    status: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDone: {
        backgroundColor: colors.success + "20",
    },
    statusInProgress: {
        backgroundColor: colors.warning + "20",
    },
    statusTodo: {
        backgroundColor: colors.info + "20",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#2c3e50",
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconButton: {
        padding: 4,
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        maxHeight: "70%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    memberItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    memberName: {
        fontSize: 16,
        color: "#333",
    },
    closeButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    noMembersText: {
        textAlign: "center",
        color: "#666",
        fontSize: 16,
        marginVertical: 20,
    },
});

export default TaskItem;
