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
        { id: 'all', label: 'Tous', icon: 'format-list-bulleted' },
        { id: 'a faire', label: 'À faire', icon: 'clock-outline' },
        { id: 'en cours', label: 'En cours', icon: 'progress-clock' },
        { id: 'terminee', label: 'Terminé', icon: 'check-circle-outline' },
        { id: 'annulee', label: 'Annulé', icon: 'close-circle-outline' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Statut</Text>
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
                            <Icon 
                                name={filter.icon} 
                                size={20} 
                                color={activeFilter === filter.id ? "#fff" : "#4c669f"} 
                                style={styles.filterIcon}
                            />
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter.id && styles.activeFilterText
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {projects && projects.length > 0 && (
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Projets</Text>
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
                            <Icon 
                                name="folder-multiple" 
                                size={20} 
                                color={!selectedProject ? "#fff" : "#4c669f"} 
                                style={styles.filterIcon}
                            />
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
                                <Icon 
                                    name="folder" 
                                    size={20} 
                                    color={selectedProject?.id === project.id ? "#fff" : "#4c669f"} 
                                    style={styles.filterIcon}
                                />
                                <Text style={[
                                    styles.filterText,
                                    selectedProject?.id === project.id && styles.activeFilterText
                                ]}>
                                    {project.nom}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {members && members.length > 0 && (
                <View style={styles.filterSection}>
                    <Text style={styles.sectionTitle}>Membres</Text>
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
                            <Icon 
                                name="account-group" 
                                size={20} 
                                color={!selectedMember ? "#fff" : "#4c669f"} 
                                style={styles.filterIcon}
                            />
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
                                <Icon 
                                    name="account" 
                                    size={20} 
                                    color={selectedMember?.id === member.id ? "#fff" : "#4c669f"} 
                                    style={styles.filterIcon}
                                />
                                <Text style={[
                                    styles.filterText,
                                    selectedMember?.id === member.id && styles.activeFilterText
                                ]}>
                                    {member.username}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingVertical: 8,
    },
    filterSection: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 16,
        marginBottom: 8,
    },
    filtersContainer: {
        paddingHorizontal: 12,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
        marginVertical: 4,
        elevation: 1,
    },
    activeFilterButton: {
        backgroundColor: '#4c669f',
    },
    filterIcon: {
        marginRight: 6,
    },
    filterText: {
        color: '#4c669f',
        fontSize: 14,
        fontWeight: '500',
    },
    activeFilterText: {
        color: '#fff',
    },
});

export default TaskFilters;
