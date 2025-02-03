import React, { Suspense, lazy, useState, useEffect } from "react";
import {
	View,
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../assets/colors";
import { loadInitialTasks } from "../Redux/actions/taskActions";

// Lazy loaded components
const TaskHeader = lazy(() => import("../Components/TaskHeader"));
const TaskCalendar = lazy(() => import("../Components/TaskCalendar"));
const TaskItem = lazy(() => import("../Components/TaskItem"));

// Loading fallback component
const LoadingFallback = () => (
	<View style={styles.loadingContainer}>
		<ActivityIndicator size="large" color={colors.primary} />
	</View>
);

const TaskScreen = () => {
	const dispatch = useDispatch();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [activeFilter, setActiveFilter] = useState("all");

	const { tasks, loading } = useSelector((state) => ({
		tasks: state.task?.tasks || [],
		loading: state.task?.loading || false,
	}));

	useEffect(() => {
		dispatch(loadInitialTasks());
	}, [dispatch]);

	const filteredTasks = React.useMemo(() => {
		return tasks.filter((task) => {
			// Filtrer par statut
			if (
				activeFilter !== "all" &&
				task.statut?.toLowerCase() !== activeFilter
			) {
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
	}, [tasks, activeFilter, selectedDate]);

	const overallProgress = React.useMemo(() => {
		const completedTasks = tasks.filter(
			(task) => task.statut?.toLowerCase() === "terminé"
		).length;
		return tasks.length > 0
			? Math.round((completedTasks / tasks.length) * 100)
			: 0;
	}, [tasks]);

	const user = useSelector((state) => state.auth.user);

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

			<View style={styles.tasksContainer}>
				<Suspense fallback={<LoadingFallback />}>
					<FlatList
						data={filteredTasks}
						renderItem={({ item: task }) => (
							<TaskItem
								key={task.id}
								task={{
									id: task.id,
									title: task.nom,
									project: task.projetId,
									time: new Date(task.endDate).toLocaleDateString(),
									status: task.statut?.toLowerCase(),
									description: task.description,
								}}
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
		color: colors.textGray,
	},
});

export default TaskScreen;
