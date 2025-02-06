import React, { Suspense, lazy, useState, useEffect } from "react";
import {
	View,
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loadInitialTasks } from "../Redux/actions/taskActions";
import { loadTeamProjects } from "../Redux/actions/projectActions";

// Lazy loaded components
const TaskHeader = lazy(() => import("../Components/TaskHeader"));
const TaskCalendar = lazy(() => import("../Components/TaskCalendar"));
const TaskItem = lazy(() => import("../Components/TaskItem"));
const TaskFilters = lazy(() => import("../Components/TaskFilters"));

// Loading fallback component
const LoadingFallback = () => (
	<View style={styles.loadingContainer}>
		<ActivityIndicator size="large" color="#fff" />
	</View>
);

const TaskScreen = () => {
	const dispatch = useDispatch();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [activeFilter, setActiveFilter] = useState("all");
	const [selectedProject, setSelectedProject] = useState(null);
	const [selectedMember, setSelectedMember] = useState(null);

	const { tasks, loading, projects, members, user } = useSelector((state) => {
		console.log("Current Redux State:", state);
		// Récupérer tous les projets de tous les teams
		const allProjects = Object.values(state.project?.projects || {}).flat();
		console.log("All Projects:", allProjects);
		
		return {
			tasks: state.task?.tasks || [],
			loading: state.task?.loading || false,
			projects: allProjects,
			members: state.project?.allMembers || [],
			user: state.auth?.user
		};
	});

	useEffect(() => {
		const loadData = async () => {
			await dispatch(loadInitialTasks());
			// Si l'utilisateur a une équipe active, charger ses projets
			if (user?.activeTeam) {
				await dispatch(loadTeamProjects(user.activeTeam));
			}
		};
		loadData();
	}, [dispatch, user?.activeTeam]);

	useEffect(() => {
		console.log("Projects:", projects);
		console.log("Members:", members);
	}, [projects, members]);

	const filteredTasks = React.useMemo(() => {
		return tasks.filter((task) => {
			// Filtrer par statut
			if (
				activeFilter !== "all" &&
				task.statut?.toLowerCase() !== activeFilter
			) {
				return false;
			}

			// Filtrer par projet
			if (selectedProject && task.projetId !== selectedProject.id) {
				return false;
			}

			// Filtrer par membre
			if (selectedMember && task.assignedToId !== selectedMember.id) {
				return false;
			}

			// Filtrer par date
			if (selectedDate) {
				const taskDate = new Date(task.endDate).toDateString();
				const filterDate = new Date(selectedDate).toDateString();
				return taskDate === filterDate;
			}

			return true;
		});
	}, [tasks, activeFilter, selectedDate, selectedProject, selectedMember]);

	const overallProgress = React.useMemo(() => {
		const completedTasks = tasks.filter(
			(task) => task.statut?.toLowerCase() === "terminé"
		).length;
		return tasks.length > 0
			? Math.round((completedTasks / tasks.length) * 100)
			: 0;
	}, [tasks]);

	// Fonction utilitaire pour trouver le projet et le membre en toute sécurité
	const getTaskDetails = (task) => {
		const project = projects.find(p => p.id === task.projetId);
		const member = members.find(m => m.id === task.assignedToId);
		
		return {
			id: task.id,
			title: task.nom,
			project: task.projetId,
			time: new Date(task.endDate).toLocaleDateString(),
			status: task.statut?.toLowerCase(),
			description: task.description,
			assignedTo: member?.username || 'Non assigné',
			projectName: project?.nom || 'Projet inconnu'
		};
	};

	if (loading) {
		return <LoadingFallback />;
	}

	return (
		<View style={styles.container}>
			<Suspense fallback={<LoadingFallback />}>
				<TaskHeader user={user} progress={overallProgress} />
			</Suspense>

			<Suspense fallback={<LoadingFallback />}>
				<TaskCalendar
					selectedDate={selectedDate}
					onDateSelect={setSelectedDate}
				/>
			</Suspense>

			<Suspense fallback={<LoadingFallback />}>
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
			</Suspense>

			<View style={styles.tasksContainer}>
				<Suspense fallback={<LoadingFallback />}>
					<FlatList
						data={filteredTasks}
						renderItem={({ item: task }) => (
							<TaskItem
								key={task.id}
								task={getTaskDetails(task)}
							/>
						)}
						keyExtractor={(item) => item.id?.toString()}
						contentContainerStyle={styles.tasksList}
						ListEmptyComponent={
							<View style={styles.emptyContainer}>
								<Text style={styles.emptyText}>
									Aucune tâche pour cette date
								</Text>
							</View>
						}
					/>
				</Suspense>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	loadingContainer: {
		padding: 20,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#4c669f"
	},
	tasksContainer: {
		flex: 1,
		paddingHorizontal: 16,
	},
	tasksList: {
		paddingVertical: 16,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 32,
	},
	emptyText: {
		fontSize: 16,
		color: "#666",
	},
});

export default TaskScreen;
