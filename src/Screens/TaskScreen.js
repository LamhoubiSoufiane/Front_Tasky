import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTasks } from '../Redux/actions/taskActions';
import { loadTeamProjects } from '../Redux/actions/projectActions';
import TaskCalendar from '../Components/TaskCalendar';
import TaskFilters from '../Components/TaskFilters';
import TaskItem from '../Components/TaskItem';
import { colors } from '../assets/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.3; // 30% de la hauteur de l'écran

const TaskScreen = () => {
    const dispatch = useDispatch();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Memoized selectors
    const tasks = useSelector((state) => state.task?.tasks || []);
    const loading = useSelector((state) => state.task?.loading || false);
    const projects = useSelector((state) => {
        const projectsObj = state.project?.projects || {};
        return Object.values(projectsObj).flat();
    });
    const members = useSelector((state) => state.project?.allMembers || []);
    const user = useSelector((state) => state.auth?.user);

    // Optimized filtered tasks
    const filteredTasks = useMemo(() => {
        if (!Array.isArray(tasks)) return [];

        return tasks.filter((task) => {
            if (!task) return false;

            const taskDate = task.endDate ? new Date(task.endDate).toDateString() : null;
            const filterDate = selectedDate ? selectedDate.toDateString() : null;

            const dateMatch = !selectedDate || (taskDate === filterDate);
            const memberMatch = !selectedMember || task.assignedToId === selectedMember.id;
            const projectMatch = !selectedProject || task.projetId === selectedProject.id;

            let statusMatch = true;
            if (activeFilter !== 'all') {
                const taskStatus = task.statut?.toLowerCase() || '';
                const statusMap = {
                    'a-faire': 'a faire',
                    'en-cours': 'en cours',
                    'terminees': 'termine'
                };
                statusMatch = taskStatus === statusMap[activeFilter];
            }

            return dateMatch && memberMatch && projectMatch && statusMatch;
        });
    }, [tasks, selectedDate, selectedMember, selectedProject, activeFilter]);

    // Initial data loading
    useEffect(() => {
        const loadData = async () => {
            try {
                setError(null);
                setIsLoading(true);
                const result = await dispatch(fetchMyTasks());
                
                if (!result.success) {
                    setError(result.error || 'Erreur lors du chargement des tâches');
                    return;
                }

                if (user?.activeTeam) {
                    const projectResult = await dispatch(loadTeamProjects(user.activeTeam));
                    if (!projectResult.success) {
                        setError(projectResult.error || 'Erreur lors du chargement des projets');
                    }
                }
            } catch (error) {
                setError('Erreur lors du chargement des données');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [dispatch, user?.activeTeam]);

    // Progress calculation
    const overallProgress = useMemo(() => {
        if (!Array.isArray(tasks) || tasks.length === 0) return 0;
        const completedTasks = tasks.filter(task => task?.statut?.toLowerCase() === "termine").length;
        return Math.round((completedTasks / tasks.length) * 100);
    }, [tasks]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Chargement des tâches...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                        setError(null);
                        setIsLoading(true);
                        dispatch(fetchMyTasks());
                    }}>
                    <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerSection}>
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeText}>
                        Hello {user?.username || user?.name || 'User'}!
                    </Text>
                    <View style={styles.progressCard}>
                        <Text style={styles.progressText}>Progression des tâches</Text>
                        <View style={styles.progressCircle}>
                            <Text style={styles.progressPercentage}>{overallProgress}%</Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.calendarContainer}>
                    <TaskCalendar
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                    />
                </View>
            </View>

            <View style={styles.filtersContainer}>
                <TaskFilters
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    projects={projects}
                    selectedProject={selectedProject}
                    onProjectChange={setSelectedProject}
                    members={members}
                    selectedMember={selectedMember}
                    onMemberChange={setSelectedMember}
                />
            </View>

            <View style={styles.tasksContainer}>
                <FlatList
                    data={filteredTasks}
                    renderItem={({ item }) => (
                        <TaskItem
                            task={{
                                id: item.id,
                                title: item.nom || 'Tâche sans titre',
                                project: item.projet?.nom || 'Projet inconnu',
                                time: item.endDate ? new Date(item.endDate).toLocaleDateString() : 'Pas de date',
                                status: item.statut?.toLowerCase() || 'en_attente',
                                assignedTo: user.username || user.name || 'Moi',
                                memberId: item.memberId
                            }}
                        />
                    )}
                    keyExtractor={(item) => `task-${item.id}`}
                    contentContainerStyle={styles.taskList}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucune tâche trouvée</Text>
                        </View>
                    }
                    refreshing={loading}
                    onRefresh={() => {
                        setError(null);
                        setIsLoading(true);
                        dispatch(fetchMyTasks());
                    }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    headerSection: {
        height: HEADER_HEIGHT,
        backgroundColor: '#fff',
        paddingTop: 40,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    welcomeContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 10,
    },
    progressCard: {
        backgroundColor: '#4c669f',
        padding: 15,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    progressCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressPercentage: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    calendarContainer: {
        paddingVertical: 10,
    },
    filtersContainer: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tasksContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    taskList: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#ff0000',
        textAlign: 'center',
        marginHorizontal: 20,
    },
    retryButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 5,
        marginTop: 20,
    },
    retryButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default TaskScreen;
