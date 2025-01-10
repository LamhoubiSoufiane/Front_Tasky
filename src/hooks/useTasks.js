import { useState, useCallback, useMemo } from 'react';

export const useTasks = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Market Research',
      project: 'Grocery shopping app design',
      time: '10:00 AM',
      status: 'done',
    },
    {
      id: 2,
      title: 'Competitive analysis',
      project: 'Grocery shopping app design',
      time: '12:00 AM',
      status: 'in_progress',
    },
    {
      id: 3,
      title: 'Create wireframe',
      project: 'Redesign challenge',
      time: '07:00 PM',
      status: 'to_do',
    },
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (activeFilter === 'all') return true;
      return task.status === activeFilter;
    });
  }, [tasks, activeFilter]);

  const taskGroups = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const project = task.project;
      if (!acc[project]) {
        acc[project] = {
          name: project,
          tasks: [],
          progress: 0
        };
      }
      acc[project].tasks.push(task);
      acc[project].progress = (acc[project].tasks.filter(t => t.status === 'done').length / acc[project].tasks.length) * 100;
      return acc;
    }, {});
  }, [tasks]);

  const addTask = useCallback((newTask) => {
    setTasks(prev => [...prev, { ...newTask, id: Date.now() }]);
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const overallProgress = useMemo(() => {
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / tasks.length) * 100);
  }, [tasks]);

  return {
    tasks: filteredTasks,
    taskGroups,
    selectedDate,
    activeFilter,
    overallProgress,
    setSelectedDate,
    setActiveFilter,
    addTask,
    updateTask,
    deleteTask,
  };
};

export default useTasks; 