import React, { memo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from "react-native";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { assignTaskToMember } from "../Redux/actions/taskActions";
import Toast from "react-native-toast-message";
import { createHelpRequest } from "../Redux/actions/helpRequestActions";

const TaskItem = memo(({ task, onPress, onStatusChange, projectMembers = [] }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.auth.user);
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
    const [helpDescription, setHelpDescription] = useState("");
    
    console.log("Task in TaskItem:", task);
    console.log("Project Members in TaskItem:", projectMembers);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "termine":
                return styles.statusDone;
            case "en_cours":
            case "en cours":
                return styles.statusInProgress;
            case "a_faire":
            case "a faire":
            default:
                return styles.statusTodo;
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case "termine":
                return "TERMINÉ";
            case "en_cours":
            case "en cours":
                return "EN COURS";
            case "a_faire":
            case "a faire":
            default:
                return "À FAIRE";
        }
    };

    const handleTaskPress = () => {
        navigation.navigate("TaskDetails", { taskId: task.id });
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

    const handleRequestHelp = async () => {
        try {
            // Vérifier si la tâche est assignée à l'utilisateur actuel
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
                text2: "Une erreur est survenue",
                position: "top",
                visibilityTime: 3000,
            });
        }
    };

    const actions = (
        <View style={styles.actions}>
            <TouchableOpacity 
                onPress={handleAssign}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Icon name="person-add" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={handleTaskPress}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Icon name="edit" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={handleRequestHelp}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Icon name="help" size={22} color={colors.warning} />
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            <TouchableOpacity 
                style={styles.container} 
                onPress={handleTaskPress}
                activeOpacity={0.7}
            >
                <View style={styles.leftBorder} />
                
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title} numberOfLines={1}>
                                {task.title}
                            </Text>
                            <View style={[styles.statusBadge, getStatusStyle(task.status)]}>
                                <Text style={styles.statusText}>
                                    {getStatusText(task.status)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.details}>
                        <View style={styles.detailRow}>
                            <Icon name="folder" size={16} color={colors.textGray} />
                            <Text style={styles.detailText} numberOfLines={1}>
                                {task.project}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Icon name="person" size={16} color={colors.textGray} />
                            <Text style={styles.detailText} numberOfLines={1}>
                                {task.assignedTo || "Non assigné"}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Icon name="event" size={16} color={colors.textGray} />
                            <Text style={styles.detailText}>
                                {task.time}
                            </Text>
                        </View>
                    </View>

                    {actions}
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
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        overflow: 'hidden',
        minHeight: 100,
    },
    leftBorder: {
        width: 4,
        backgroundColor: colors.primary,
    },
    content: {
        flex: 1,
        padding: 12,
    },
    header: {
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDone: {
        backgroundColor: `${colors.success}20`,
    },
    statusInProgress: {
        backgroundColor: `${colors.warning}20`,
    },
    statusTodo: {
        backgroundColor: `${colors.info}20`,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    details: {
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        marginLeft: 6,
        fontSize: 13,
        color: colors.textGray,
        flex: 1,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 8,
        gap: 12,
    },
    actionButton: {
        padding: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
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
    helpInput: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: colors.warning,
    },
    submitButton: {
        backgroundColor: colors.primary,
    },
    cancelButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default TaskItem;
