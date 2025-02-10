import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTasks } from '../Redux/actions/taskActions';
import { loadTeamProjects } from '../Redux/actions/projectActions';
import TaskCalendar from '../Components/TaskCalendar';
import TaskFilters from '../Components/TaskFilters';
import TaskItem from '../Components/TaskItem';
import TaskHeader from '../Components/TaskHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../assets/colors';

const LoadingComponent = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
    </View>
);

const EmptyTaskList = () => (
    <View style={styles.emptyState}>
        <Icon name="clipboard-text-outline" size={50} color="#999" />
        <Text style={styles.emptyStateText}>Aucune tâche trouvée</Text>
    </View>
);

const ErrorComponent = ({ error, onRetry }) => (
    <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
            style={styles.retryButton}
            onPress={onRetry}
        >
            <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
    </View>
);

const TaskScreen = () => {
    const dispatch = useDispatch();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const tasks = useSelector(state => state.task?.tasks || []);
    const projectsObj = useSelector(state => state.project?.projects || {});
    const members = useSelector(state => state.project?.allMembers || []);
    const user = useSelector(state => state.auth?.user);
    const teams = useSelector(state => state.team?.teams || []);

    const projects = useMemo(() => {
        return Object.values(projectsObj).flat();
    }, [projectsObj]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const taskDate = task.endDate ? new Date(task.endDate).toDateString() : null;
            const filterDate = selectedDate ? selectedDate.toDateString() : null;
            const dateMatch = !selectedDate || (taskDate === filterDate);
            const memberMatch = !selectedMember || task.assignedToId === selectedMember.id;
            const projectMatch = !selectedProject || task.projetId === selectedProject.id;
            let statusMatch = true;
            if (activeFilter !== 'all') {
                const taskStatus = task.statut?.toLowerCase() || '';
                statusMatch = taskStatus === activeFilter;
            }
            return dateMatch && memberMatch && projectMatch && statusMatch;
        });
    }, [tasks, selectedDate, selectedMember, selectedProject, activeFilter]);

    const loadAllTeamProjects = useCallback(async () => {
        try {
            const loadPromises = teams.map(team => dispatch(loadTeamProjects(team.id)));
            await Promise.all(loadPromises);
        } catch (error) {
            console.error('Error loading team projects:', error);
            setError('Erreur lors du chargement des projets');
        }
    }, [teams, dispatch]);

    const loadData = useCallback(async () => {
        try {
            setError(null);
            const result = await dispatch(fetchMyTasks());
            if (!result.success) {
                setError(result.error || 'Erreur lors du chargement des tâches');
                return;
            }
            await loadAllTeamProjects();
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [dispatch, loadAllTeamProjects]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const renderTaskItem = useCallback(({ item }) => (
        <TaskItem 
            task={item}
            projectMembers={members}
            onStatusChange={loadData}
        />
    ), [members, loadData]);

    const keyExtractor = useCallback((item) => item.id.toString(), []);

    if (isLoading) {
        return <LoadingComponent />;
    }

    if (error) {
        return <ErrorComponent error={error} onRetry={loadData} />;
    }

    return (
        <View style={styles.container}>
            <TaskHeader user={user} />
            
            <View style={styles.mainContent}>
                <TaskCalendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    tasks={tasks}
                />

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

                <View style={styles.tasksContainer}>
                    <Text style={styles.sectionTitle}>
                        Tâches ({filteredTasks.length})
                    </Text>
                    {filteredTasks.length === 0 ? (
                        <EmptyTaskList />
                    ) : (
                        <FlatList
                            data={filteredTasks}
                            renderItem={renderTaskItem}
                            keyExtractor={keyExtractor}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.tasksList}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={[colors.primary]}
                                />
                            }
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    mainContent: {
        flex: 1,
        padding: 16,
    },
    tasksContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    tasksList: {
        paddingBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#999',
        marginTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#ff4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default TaskScreen;