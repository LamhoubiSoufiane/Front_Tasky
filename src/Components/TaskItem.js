import React, { memo, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from "react-native";
import { colors } from "../assets/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { assignTaskToMember, notifyTaskStatusUpdated, notifyTaskAssigned, updateTaskStatus } from "../Redux/actions/taskActions";
import Toast from "react-native-toast-message";
import io from 'socket.io-client';
import { API_BASE_URL } from '../config';
import { createHelpRequest } from "../Redux/actions/helpRequestActions";

const TaskItem = memo(({ task: initialTask, onPress, onStatusChange, projectMembers = [] }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.auth.user);
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
    const [helpDescription, setHelpDescription] = useState("");
    
    const [task, setTask] = useState(initialTask);

    useEffect(() => {
        setTask(initialTask);
    }, [initialTask]);

    useEffect(() => {
        socket = io(API_BASE_URL, {
            path: '/websockets',
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
        });

        socket.on('taskStatusUpdated', (data) => {
            if (data.data.taskId === task.id) {
                setTask(prevTask => ({
                    ...prevTask,
                    statut: data.data.status
                }));
            }
        });

        socket.on('taskAssigned', (data) => {
            if (data.data.taskId === task.id) {
                const assignedMember = projectMembers.find(member => member.id === data.data.newAssignee);
                setTask(prevTask => ({
                    ...prevTask,
                    assignedTo: data.data.newAssignee,
                    member: assignedMember ? {
                        id: assignedMember.id,
                        username: assignedMember.username || assignedMember.name,
                        name: assignedMember.name || assignedMember.username
                    } : null
                }));
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [task.id, projectMembers]);

    const handleTaskPress = () => {
        navigation.navigate("TaskDetails", { taskId: task.id });
    };

    const handleAssign = async (memberId) => {
        try {
            const result = await dispatch(assignTaskToMember(task.id, memberId));
            if (result.success) {
                const assignedMember = projectMembers.find(member => member.id === memberId);
                setTask(prevTask => ({
                    ...prevTask,
                    assignedTo: memberId,
                    member: {
                        id: memberId,
                        username: assignedMember?.username || assignedMember?.name,
                        name: assignedMember?.name || assignedMember?.username
                    }
                }));
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
    };

    const handleStatusChange = async () => {
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

            console.log('Envoi de la mise à jour du statut:', { taskId: task.id, newStatus });
            const result = await dispatch(updateTaskStatus(task.id, newStatus));
            
            if (result.success) {
                console.log('Mise à jour du statut réussie:', result.data);
                // Mettre à jour l'état local avec les nouvelles données
                setTask(prevTask => ({
                    ...prevTask,
                    ...result.data,
                    statut: result.data.statut || result.data.status || newStatus
                }));

                Toast.show({
                    type: "success",
                    text1: "Succès",
                    text2: "Statut de la tâche mis à jour avec succès",
                    position: "top",
                    visibilityTime: 3000,
                });
            } else {
                console.error('Échec de la mise à jour du statut:', result.error);
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
    };

    const getMemberName = () => {
        if (task.member) {
            return task.member.username || task.member.name || 'Non assigné';
        }
        if (task.assignedTo) {
            const assignedMember = projectMembers.find(member => member.id === task.assignedTo);
            return assignedMember ? (assignedMember.username || assignedMember.name) : 'Non assigné';
        }
        return "Non assigné";
    };

    const getStatusStyle = (status) => {
        if (!status) return styles.statusTodo;
        switch (status.toLowerCase()) {
            case "terminee":
                return styles.statusDone;
            case "en cours":
                return styles.statusInProgress;
            case "a faire":
                return styles.statusTodo;
            case "annulee": 
            return { backgroundColor: '#FF0000' }; 
            default:
                return styles.statusTodo;
        }
    };

    const getStatusText = (status) => {
        if (!status) return "À FAIRE";
        switch (status.toLowerCase()) {
            case "terminee":
                return "TERMINÉ";
            case "en cours":
                return "EN COURS";
            case "a faire":
                return "À FAIRE";
            case "annulee": 
                return "ANNULEE"; 
            default:
                return "À FAIRE";
        }
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
                                        onPress={() => handleAssign(member.id)}>
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
