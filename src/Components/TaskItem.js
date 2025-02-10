import React, { memo, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { assignTaskToMember, updateTaskStatus } from "../Redux/actions/taskActions";
import { createHelpRequest } from '../Redux/actions/helpRequestActions';
import Toast from "react-native-toast-message";

const TaskItem = memo(({ task, projectMembers = [], onStatusChange }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const currentUser = useSelector(state => state.auth.user);

    const handleEdit = useCallback(() => {
        navigation.navigate("TaskDetails", { 
            taskId: task.id,
            isEditMode: true 
        });
    }, [navigation, task.id]);

    const handleAssign = useCallback(async (memberId) => {
        try {
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
                if (onStatusChange) onStatusChange();
            } else {
                Toast.show({
                    type: "error",
                    text1: "Erreur",
                    text2: "Impossible d'assigner la tâche",
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
    }, [dispatch, task.id, onStatusChange]);

    const handleStatusChange = useCallback(async () => {
        try {
            const currentStatus = task.statut || task.status;
            let newStatus;
            switch (currentStatus.toLowerCase()) {
                case "a faire":
                    newStatus = "en cours";
                    break;
                case "en cours":
                    newStatus = "terminee";
                    break;
                case "terminee":
                    newStatus = "annulee";
                    break;
                case "annulee":
                    newStatus = "a faire";
                    break;
                default:
                    newStatus = "a faire";
            }

            const result = await dispatch(updateTaskStatus(task.id, newStatus));
            
            if (result.success) {
                Toast.show({
                    type: "success",
                    text1: "Succès",
                    text2: "Statut de la tâche mis à jour avec succès",
                    position: "top",
                    visibilityTime: 3000,
                });
                if (onStatusChange) onStatusChange();
            } else {
                Toast.show({
                    type: "error",
                    text1: "Erreur",
                    text2: result.error || "Impossible de mettre à jour le statut",
                    position: "top",
                    visibilityTime: 3000,
                });
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut:", error);
            Toast.show({
                type: "error",
                text1: "Erreur",
                text2: "Impossible de mettre à jour le statut de la tâche",
                position: "top",
                visibilityTime: 3000,
            });
        }
    }, [dispatch, task.id, task.statut, task.status, onStatusChange]);

    const handleRequestHelp = useCallback(async () => {
        try {
            if (!task.member || task.member.id !== currentUser?.id) {
                Toast.show({
                    type: "error",
                    text1: "Erreur",
                    text2: "Vous ne pouvez demander de l'aide que pour les tâches qui vous sont assignées",
                    position: "top",
                    visibilityTime: 3000,
                });
                return;
            }

            const result = await dispatch(createHelpRequest(task.id));
            if (result.success) {
                Toast.show({
                    type: "success",
                    text1: "Succès",
                    text2: "Demande d'aide créée avec succès",
                    position: "top",
                    visibilityTime: 3000,
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: "Erreur",
                    text2: result.error || "Impossible de créer la demande d'aide",
                    position: "top",
                    visibilityTime: 3000,
                });
            }
        } catch (error) {
            console.error("Erreur lors de la création de la demande d'aide:", error);
            Toast.show({
                type: "error",
                text1: "Erreur",
                text2: "Impossible de créer la demande d'aide",
                position: "top",
                visibilityTime: 3000,
            });
        }
    }, [dispatch, task.id, task.member, currentUser]);

    const getMemberName = useCallback(() => {
        if (!task.member) return "Non assigné";
        return task.member.name || task.member.username || "Non assigné";
    }, [task.member]);

    const getStatusStyle = useCallback((status) => {
        switch (status?.toLowerCase()) {
            case "terminee":
                return styles.statusCompleted;
            case "en cours":
                return styles.statusInProgress;
            case "annulee":
                return styles.statusCancelled;
            default:
                return styles.statusTodo;
        }
    }, []);

    const getStatusText = useCallback((status) => {
        switch (status?.toLowerCase()) {
            case "terminee":
                return "TERMINÉ";
            case "en cours":
                return "EN COURS";
            case "a faire":
                return "À FAIRE";
            case "annulee": 
                return "ANNULÉ"; 
            default:
                return "À FAIRE";
        }
    }, []);

    return (
        <>
            <TouchableOpacity 
                style={styles.container} 
                activeOpacity={0.7}
            >
                <View style={styles.leftContent}>
                    <Text style={styles.title} numberOfLines={1}>
                        {task.title || task.nom || task.name}
                    </Text>
                    <View style={styles.infoRow}>
                        <View style={styles.assignSection}>
                            <TouchableOpacity 
                                onPress={() => setIsAssignModalVisible(true)}
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
                            onPress={handleStatusChange}
                        >
                            <Text style={styles.statusText}>
                                {getStatusText(task.statut || task.status)}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleRequestHelp}
                            style={styles.iconButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Icon name="help" size={22} color={colors.warning} />
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
                onRequestClose={() => setIsAssignModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Assigner la tâche à</Text>
                        <ScrollView>
                            {projectMembers.length > 0 ? (
                                projectMembers.map((member) => (
                                    <TouchableOpacity
                                        key={member.id}
                                        style={styles.memberItem}
                                        onPress={() => handleAssign(member.id)}
                                    >
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
                            onPress={() => setIsAssignModalVisible(false)}
                        >
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
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    leftContent: {
        flex: 1,
        marginRight: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    assignSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    assignButton: {
        padding: 4,
    },
    assignedTo: {
        marginLeft: 8,
        fontSize: 14,
        color: "#666",
    },
    status: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginLeft: 12,
    },
    statusTodo: {
        backgroundColor: "#e9ecef",
    },
    statusInProgress: {
        backgroundColor: "#cce5ff",
    },
    statusCompleted: {
        backgroundColor: "#d4edda",
    },
    statusCancelled: {
        backgroundColor: "#f8d7da",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconButton: {
        padding: 4,
        marginLeft: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        width: "80%",
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
        color: "#2c3e50",
    },
    memberItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    memberName: {
        fontSize: 16,
        color: "#2c3e50",
    },
    noMembersText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginTop: 20,
    },
    closeButton: {
        marginTop: 16,
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default TaskItem;