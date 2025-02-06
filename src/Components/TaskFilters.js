import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

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
        { id: 'en cours', label: 'En cours' },
        { id: 'terminé', label: 'Terminé' },
    ];

    return (
        <View style={styles.container}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
            >
                {filters.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
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
                >
                    <TouchableOpacity
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
                            key={project.id}
                            style={[
                                styles.filterButton,
                                selectedProject?.id === project.id && styles.activeFilterButton,
                            ]}
                            onPress={() => onProjectChange(project)}
                        >
                            <Icon name="folder" size={16} color={selectedProject?.id === project.id ? "#fff" : "#4c669f"} />
                            <Text style={[
                                styles.filterText,
                                selectedProject?.id === project.id && styles.activeFilterText
                            ]}>
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
                    style={styles.filtersContainer}
                >
                    <TouchableOpacity
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
                            key={member.id}
                            style={[
                                styles.filterButton,
                                selectedMember?.id === member.id && styles.activeFilterButton,
                            ]}
                            onPress={() => onMemberChange(member)}
                        >
                            <Icon name="account" size={16} color={selectedMember?.id === member.id ? "#fff" : "#4c669f"} />
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
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    activeFilterButton: {
        backgroundColor: '#4c669f',
    },
    filterText: {
        color: '#4c669f',
        marginLeft: 4,
    },
    activeFilterText: {
        color: '#fff',
    },
});

export default TaskFilters;
