import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import apiClient from '../Services/apiClient';
import { getUserInfo, saveUserInfo } from '../Services/authService';
import TeamMembersTab from '../Components/TeamMembersTab';
import TeamProjectsTab from '../Components/TeamProjectsTab';
import CreateTeamDialog from '../Components/CreateTeamDialog';
import { colors } from '../assets/colors';

const TeamScreen = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('members');
  const [isCreateTeamVisible, setIsCreateTeamVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const initialize = async () => {
      const userInfo = await getUserInfo();
      if (userInfo) {
        // Fetch complete user info including teams
        try {
          const response = await apiClient.get(`/users/search?q=${userInfo.email}`);
          if (response.data && response.data.length > 0) {
            const completeUserInfo = response.data.find(user => user.id === userInfo.id);
            if (completeUserInfo) {
              setCurrentUser(completeUserInfo);
              await saveUserInfo(completeUserInfo); // Update stored user info with teams
              setTeams(completeUserInfo.teams || []);
            }
          }
        } catch (error) {
          console.error('Error fetching user teams:', error);
        }
      }
    };
    initialize();
  }, []);

  const handleCreateTeam = async (teamData) => {
    try {
      const response = await apiClient.post('/teams', teamData);
      // After creating a team, refresh user info to get updated teams list
      const userResponse = await apiClient.get(`/users/search?q=${currentUser.email}`);
      if (userResponse.data && userResponse.data.length > 0) {
        const updatedUserInfo = userResponse.data.find(user => user.id === currentUser.id);
        if (updatedUserInfo) {
          setCurrentUser(updatedUserInfo);
          await saveUserInfo(updatedUserInfo);
          setTeams(updatedUserInfo.teams || []);
        }
      }
      setSelectedTeam(response.data);
      setIsCreateTeamVisible(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await apiClient.delete(`/teams/${teamId}`);
      // After deleting a team, refresh user info to get updated teams list
      const userResponse = await apiClient.get(`/users/search?q=${currentUser.email}`);
      if (userResponse.data && userResponse.data.length > 0) {
        const updatedUserInfo = userResponse.data.find(user => user.id === currentUser.id);
        if (updatedUserInfo) {
          setCurrentUser(updatedUserInfo);
          await saveUserInfo(updatedUserInfo);
          setTeams(updatedUserInfo.teams || []);
        }
      }
      setSelectedTeam(null);
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const refreshTeams = async () => {
    try {
      const response = await apiClient.get(`/users/search?q=${currentUser.email}`);
      if (response.data && response.data.length > 0) {
        const updatedUserInfo = response.data.find(user => user.id === currentUser.id);
        if (updatedUserInfo) {
          setCurrentUser(updatedUserInfo);
          await saveUserInfo(updatedUserInfo);
          setTeams(updatedUserInfo.teams || []);
          // Update selected team if it exists
          if (selectedTeam) {
            const updatedSelectedTeam = updatedUserInfo.teams.find(team => team.id === selectedTeam.id);
            setSelectedTeam(updatedSelectedTeam || null);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing teams:', error);
    }
  };

  const renderTeamItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.teamItem,
        selectedTeam?.id === item.id && styles.selectedTeam
      ]}
      onPress={() => setSelectedTeam(item)}
    >
      <Text style={styles.teamName}>{item.nom}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Équipes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsCreateTeamVisible(true)}
        >
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.teamsList}>
          <FlatList
            data={teams}
            renderItem={renderTeamItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {selectedTeam && (
          <View style={styles.teamDetails}>
            <View style={styles.teamHeader}>
              <Text style={styles.selectedTeamName}>{selectedTeam.nom}</Text>
              {currentUser && selectedTeam.owner.id === currentUser.id && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTeam(selectedTeam.id)}
                >
                  <MaterialIcons name="delete" size={24} color="red" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'members' && styles.activeTab]}
                onPress={() => setActiveTab('members')}
              >
                <Text style={styles.tabText}>Membres</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'projects' && styles.activeTab]}
                onPress={() => setActiveTab('projects')}
              >
                <Text style={styles.tabText}>Projets</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'members' ? (
              <TeamMembersTab team={selectedTeam} currentUser={currentUser} onUpdate={refreshTeams} />
            ) : (
              <TeamProjectsTab team={selectedTeam} />
            )}
          </View>
        )}
      </View>

      <CreateTeamDialog
        visible={isCreateTeamVisible}
        onClose={() => setIsCreateTeamVisible(false)}
        onCreate={handleCreateTeam}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  teamsList: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    padding: 16,
  },
  teamItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedTeam: {
    backgroundColor: colors.primary + '20',
  },
  teamName: {
    fontSize: 16,
    color: '#333',
  },
  teamDetails: {
    flex: 1,
    padding: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedTeamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  deleteButton: {
    padding: 8,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
});

export default TeamScreen;
