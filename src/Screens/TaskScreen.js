import React, { Suspense, lazy, useState } from 'react';
import { View, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../assets/colors';
import useTasks from '../hooks/useTasks';

// Lazy loaded components
const TaskHeader = lazy(() => import('../Components/TaskHeader'));
const TaskCalendar = lazy(() => import('../Components/TaskCalendar'));
const TaskItem = lazy(() => import('../Components/TaskItem'));

// Loading fallback component
const LoadingFallback = () => (
	<View style={styles.loadingContainer}>
		<ActivityIndicator size="large" color={colors.primary} />
	</View>
);

const TaskScreen = () => {
	const {
		tasks,
		taskGroups,
		selectedDate,
		activeFilter,
		overallProgress,
		setSelectedDate,
		setActiveFilter,
	} = useTasks();

	const [user] = useState({
		name: 'Dean Lewis',
		avatar: 'https://example.com/avatar.jpg'
	});

	return (
		<ScrollView style={styles.container}>
			<Suspense fallback={<LoadingFallback />}>
				<TaskHeader 
					user={user}
					progress={overallProgress}
				/>
			</Suspense>

			<Suspense fallback={<LoadingFallback />}>
				<TaskCalendar
					selectedDate={selectedDate}
					onDateSelect={setSelectedDate}
				/>
			</Suspense>

			<View style={styles.tasksContainer}>
				<Suspense fallback={<LoadingFallback />}>
					{tasks.map(task => (
						<TaskItem
							key={task.id}
							task={task}
						/>
					))}
				</Suspense>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	loadingContainer: {
		padding: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	tasksContainer: {
		paddingVertical: 16,
	},
});

export default TaskScreen;
