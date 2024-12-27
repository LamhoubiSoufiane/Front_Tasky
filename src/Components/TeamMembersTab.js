import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../Services/apiClient';
import { colors } from '../assets/colors';

const TeamMembersTab = ({ team, currentUser, onUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isAddMemberVisible, setIsAddMemberVisible] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (team?.id) {
      fetchTeamMembers();
    }
  }, [team?.id]);

  const fetchTeamMembers = async () => {
    try {
      const response = await apiClient.get(`/teams/${team.id}`);
      if (response.data && response.data.members) {
        setMembers(response.data.members);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await apiClient.get(`/users/search?q=${query}`);
      const filteredUsers = response.data.filter(
        user => !members.some(member => member.id === user.id)
      );
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const addMember = async (userId) => {
    try {
      await apiClient.post(`/teams/${team.id}/members/${userId}`);
      await fetchTeamMembers();
      onUpdate();
      setIsAddMemberVisible(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const removeMember = async (userId) => {
    try {
      await apiClient.delete(`/teams/${team.id}/members/${userId}`);
      await fetchTeamMembers();
      onUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.nom} {item.prenom}</Text>
        <Text style={styles.memberUsername}>@{item.username}</Text>
      </View>
      {currentUser && team.owner.id === currentUser.id && item.id !== team.owner.id && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeMember(item.id)}
        >
          <MaterialIcons name="remove-circle-outline" size={24} color="red" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => addMember(item.id)}
    >
      <Text style={styles.memberName}>{item.nom} {item.prenom}</Text>
      <Text style={styles.memberUsername}>@{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Membres de l'équipe</Text>
        {currentUser && team.owner.id === currentUser.id && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddMemberVisible(true)}
          >
            <MaterialIcons name="person-add" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={members}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucun membre dans cette équipe</Text>
          </View>
        )}
      />

      <Modal
        visible={isAddMemberVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsAddMemberVisible(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter un membre</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsAddMemberVisible(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchUsers(text);
              }}
            />

            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                style={styles.searchResults}
              />
            ) : searchQuery.length >= 2 && (
              <View style={styles.emptySearch}>
                <Text style={styles.emptySearchText}>Aucun utilisateur trouvé</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    color: '#333',
  },
  memberUsername: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  searchResults: {
    maxHeight: 300,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptySearch: {
    padding: 20,
    alignItems: 'center',
  },
  emptySearchText: {
    fontSize: 14,
    color: '#666',
  },
});

export default TeamMembersTab;
