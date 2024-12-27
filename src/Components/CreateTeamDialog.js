import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../Services/apiClient';
import { colors } from '../assets/colors';

const CreateTeamDialog = ({ visible, onClose, onCreate }) => {
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await apiClient.get(`/users/search?q=${query}`);
      const filteredUsers = response.data.filter(
        user => !selectedMembers.some(member => member.id === user.id)
      );
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleSelectMember = (user) => {
    setSelectedMembers([...selectedMembers, user]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(member => member.id !== userId));
  };

  const handleCreate = () => {
    if (!teamName.trim()) {
      return;
    }
    onCreate({
      nom: teamName.trim(),
      memberIds: selectedMembers.map(member => member.id)
    });
    // Reset the form
    setTeamName('');
    setSelectedMembers([]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const renderSelectedMember = ({ item }) => (
    <View style={styles.selectedMemberItem}>
      <Text style={styles.memberName}>{item.nom} {item.prenom}</Text>
      <TouchableOpacity
        onPress={() => handleRemoveMember(item.id)}
        style={styles.removeMemberButton}
      >
        <MaterialIcons name="close" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleSelectMember(item)}
    >
      <Text style={styles.memberName}>{item.nom} {item.prenom}</Text>
      <Text style={styles.memberUsername}>@{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Créer une nouvelle équipe</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nom de l'équipe"
            value={teamName}
            onChangeText={setTeamName}
          />

          <Text style={styles.label}>Ajouter des membres</Text>
          <TextInput
            style={styles.input}
            placeholder="Rechercher des utilisateurs..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              searchUsers(text);
            }}
          />

          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id.toString()}
                style={styles.searchResults}
              />
            </View>
          )}

          {selectedMembers.length > 0 && (
            <View style={styles.selectedMembersContainer}>
              <Text style={styles.label}>Membres sélectionnés</Text>
              <FlatList
                data={selectedMembers}
                renderItem={renderSelectedMember}
                keyExtractor={(item) => item.id.toString()}
                style={styles.selectedMembers}
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.createButton,
              !teamName.trim() && styles.disabledButton
            ]}
            onPress={handleCreate}
            disabled={!teamName.trim()}
          >
            <Text style={styles.createButtonText}>Créer l'équipe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
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
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  searchResultsContainer: {
    maxHeight: 200,
    marginBottom: 16,
  },
  searchResults: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedMembersContainer: {
    marginBottom: 16,
  },
  selectedMembers: {
    maxHeight: 120,
  },
  selectedMemberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    color: '#333',
  },
  memberUsername: {
    fontSize: 14,
    color: '#666',
  },
  removeMemberButton: {
    padding: 4,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateTeamDialog;
