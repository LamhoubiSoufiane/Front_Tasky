import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { colors } from '../assets/colors';

const TaskFilters = ({ 
    activeFilter, 
    onFilterChange, 
    projects = [], 
    selectedProject,
    onProjectChange,
    members = [],
    selectedMember,
    onMemberChange 
}) => {
    const filters = [
        { id: 'all', label: 'Tous' },
        { id: 'en-cours', label: 'En cours' },
        { id: 'terminees', label: 'Terminées' },
        { id: 'a-faire', label: 'À faire' }
    ];

    return (
        <View style={styles.container}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                {filters.map((filter) => (
                    <TouchableOpacity
                        key={`status-filter-${filter.id}`}
                        style={[
                            styles.filterButton,
                            activeFilter === filter.id && styles.activeFilterButton,
                        ]}
                        onPress={() => onFilterChange(filter.id)}
                    >
                        <Text style={[
                            styles.filterText,
                            activeFilter === filter.id && styles.activeFilterText
                        ]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {projects && projects.length > 0 && (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersContainer}
                    contentContainerStyle={[styles.filtersContent, styles.projectsContainer]}
                >
                    <TouchableOpacity
                        key="all-projects"
                        style={[
                            styles.filterButton,
                            !selectedProject && styles.activeFilterButton,
                        ]}
                        onPress={() => onProjectChange(null)}
                    >
                        <Text style={[
                            styles.filterText,
                            !selectedProject && styles.activeFilterText
                        ]}>
                            Tous les projets
                        </Text>
                    </TouchableOpacity>
                    {projects.map((project) => (
                        <TouchableOpacity
                            key={`project-filter-${project.id}`}
                            style={[
                                styles.filterButton,
                                selectedProject?.id === project.id && styles.activeFilterButton,
                            ]}
                            onPress={() => onProjectChange(project)}
                        >
                            <Icon name="folder" size={16} color={selectedProject?.id === project.id ? "#fff" : colors.primary} />
                            <Text style={[
                                styles.filterText,
                                selectedProject?.id === project.id && styles.activeFilterText
                            ]} numberOfLines={1}>
                                {project.nom}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {members && members.length > 0 && (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={[styles.filtersContainer, styles.membersContainer]}
                >
                    <TouchableOpacity
                        key="all-members"
                        style={[
                            styles.filterButton,
                            !selectedMember && styles.activeFilterButton,
                        ]}
                        onPress={() => onMemberChange(null)}
                    >
                        <Text style={[
                            styles.filterText,
                            !selectedMember && styles.activeFilterText
                        ]}>
                            Tous les membres
                        </Text>
                    </TouchableOpacity>
                    {members.map((member) => (
                        <TouchableOpacity
                            key={`member-filter-${member.id}`}
                            style={[
                                styles.filterButton,
                                selectedMember?.id === member.id && styles.activeFilterButton,
                            ]}
                            onPress={() => onMemberChange(member)}
                        >
                            <Icon name="account" size={16} color={selectedMember?.id === member.id ? "#fff" : colors.primary} />
                            <Text style={[
                                styles.filterText,
                                selectedMember?.id === member.id && styles.activeFilterText
                            ]}>
                                {member.username}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingVertical: 8,
    },
    filtersContainer: {
        marginBottom: 4,
    },
    filtersContent: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    projectsContainer: {
        marginTop: 8,
    },
    membersContainer: {
        marginTop: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minWidth: 80,
        height: 36,
    },
    activeFilterButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,
    },
    filterText: {
        color: colors.primary,
        marginLeft: 4,
        fontWeight: '600',
        fontSize: 13,
        textAlign: 'center',
    },
    activeFilterText: {
        color: '#fff',
    },
});

export default TaskFilters;
