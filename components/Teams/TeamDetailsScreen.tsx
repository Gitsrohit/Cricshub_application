import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  Animated,
  TouchableWithoutFeedback,
  StatusBar,
  RefreshControl,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from 'lottie-react-native';
import apiService from "../APIservices";
import CustomDialog from "../Customs/CustomDialog.js";
import { SvgUri } from 'react-native-svg';

const loaderAnimation = require('../../assets/animations/Search for Players.json');
const { width } = Dimensions.get('window');

interface Player {
  id: string;
  name: string;
  profilePic: string;
  role: string;
  phone: string;
}

interface PlayerCardProps {
  player: Player;
  index: number;
  canEdit: boolean;
  teamCaptain: Player | null;
  onRemove: (playerId: string, player: Player) => void;
}

const PlayerCard = memo<PlayerCardProps>(({ player, index, canEdit, teamCaptain, onRemove }) => {
  const isFirstDesign = index % 2 === 0;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const handleRemove = () => {
    Animated.timing(cardAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onRemove(player.id, player);
    });
  };

  const isSvg = player.profilePic && player.profilePic.endsWith('.svg');

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ translateX: cardAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={isFirstDesign ? ['#8FDFFF', '#104B62'] : ['#209FFF', '#00354A']}
        style={styles.playerCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.playerInfo}>
          {isSvg ? (
            <SvgUri
              width="40"
              height="40"
              uri={player.profilePic}
              style={styles.searchResultAvatar}
            />
          ) : (
            <Image
              source={player.profilePic ? { uri: player.profilePic } : require('../../assets/defaultLogo.png')}
              style={styles.searchResultAvatar}
              defaultSource={require('../../assets/defaultLogo.png')}
            />
          )}
          <View style={styles.playerDetails}>
            <Text style={styles.playerName}>{player?.name}</Text>
            <Text style={styles.playerStats}>
              {player.role} • {teamCaptain?.id === player.id && 'Captain'}
            </Text>
          </View>
        </View>
        {canEdit && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemove}
          >
            <MaterialIcons name="remove-circle" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );
});

const TeamDetailsScreen = ({ route, navigation }) => {
  const { teamId } = route.params;
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [addingPlayerId, setAddingPlayerId] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('success');
  const slideAnim = useRef(new Animated.Value(500)).current;
  const [canEdit, setCanEdit] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const showDialog = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogType(type);
    setDialogVisible(true);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible, slideAnim]);

  useEffect(() => {
    fetchTeamDetails();
  }, []);

  const fetchTeamDetails = async () => {
    try {
      setRefreshing(true);
      const response = await apiService({
        endpoint: `teams/${teamId}`,
        method: "GET",
      });
  
      if (response.success && response.data?.data) {
        const allPlayers = response.data.data.players || [];
        const uniquePlayers = allPlayers.filter((player: Player, index: number, self: Player[]) => 
          index === self.findIndex(p => p.id === player.id)
        );
        setPlayers(uniquePlayers);
        setTeam(response.data?.data);
        const userId = await AsyncStorage.getItem('userUUID');
        setCanEdit(userId === response.data?.data?.creator?.id || userId === response.data?.data?.captain?.id);
        setDataLoaded(true);
      }
    } catch (err) {
      console.error("Error fetching team details:", err);
      showDialog('Error', 'Failed to fetch team details', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const debouncedFetchPlayers = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      try {
        const [nameRes, phoneRes] = await Promise.all([
          apiService({
            endpoint: 'teams/players/search/name',
            method: 'GET',
            params: { query },
          }),
          apiService({
            endpoint: 'teams/players/search/phone',
            method: 'GET',
            params: { query },
          }),
        ]);
        const nameData = nameRes.success ? nameRes.data.data || [] : [];
        const phoneData = phoneRes.success ? phoneRes.data.data || [] : [];
        const allPlayers = [...nameData, ...phoneData];
        const uniquePlayers = allPlayers.filter((player: Player, index: number, self: Player[]) =>
          index === self.findIndex((p) => p.id === player.id)
        );
        setSearchResults(uniquePlayers);
      } catch (err) {
        console.error('Error fetching players:', err);
        showDialog('Error', 'Failed to fetch players', 'error');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  function debounce(func: Function, delay: number) {
    let timer: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    debouncedFetchPlayers(value);
  };

  const addPlayer = async (player: Player) => {
    setAddingPlayerId(player.id);
    try {
      const response = await apiService({
        endpoint: `teams/${team.id}/${player.id}`,
        method: 'PUT',
        body: { playerId: player.id, action: 'Add' },
      });
      if (response.success) {
        setPlayers((prev) => [...prev, player]);
        setModalVisible(false);
        setSearchQuery('');
        setSearchResults([]);
        showDialog('Success', 'Player added successfully!');
      } else {
        showDialog('Error', response.error?.message || 'Failed to add player.', 'error');
      }
    } catch (err) {
      showDialog('Error', 'Failed to add player.', 'error');
    } finally {
      setAddingPlayerId(null);
    }
  };


  const removePlayerFromBackend = async (playerId: string, player: Player) => {
    setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== playerId));

    try {
      const response = await apiService({
        endpoint: `teams/${team.id}/${playerId}`,
        method: 'PUT',
        body: { playerId: playerId, action: 'Remove' },
      });

      if (response.success) {
        // showDialog('Success', 'Player removed successfully!');
      } else {
        setPlayers(prevPlayers => [...prevPlayers, player].sort((a, b) => a.id.localeCompare(b.id)));
        showDialog('Error', response.error?.message || 'Failed to remove player.', 'error');
      }
    } catch (err) {
      setPlayers(prevPlayers => [...prevPlayers, player].sort((a, b) => a.id.localeCompare(b.id)));
      showDialog('Error', 'Failed to remove player.', 'error');
    }
  };

  const renderSearchResultItem = ({ item }: { item: Player }) => {
    const isSvg = item.profilePic && item.profilePic.endsWith('.svg');

    return (
      <TouchableOpacity
        style={styles.searchResultItem}
        onPress={() => addPlayer(item)}
        disabled={addingPlayerId === item.id}
      >
        {isSvg ? (
          <SvgUri
            width="40"
            height="40"
            uri={item.profilePic}
            style={styles.searchResultAvatar}
          />
        ) : (
          <Image
            source={item.profilePic ? { uri: item.profilePic } : require('../../assets/defaultLogo.png')}
            style={styles.searchResultAvatar}
            defaultSource={require('../../assets/defaultLogo.png')}
          />
        )}
        <View style={styles.searchResultTextContainer}>
          <Text style={styles.searchResultName}>{item.name}</Text>
          <Text style={styles.searchResultPhone}>{item.phone}</Text>
        </View>
        {addingPlayerId === item.id ? (
          <ActivityIndicator size="small" color="#34B8FF" />
        ) : (
          <AntDesign name="pluscircleo" size={20} color="#34B8FF" />
        )}
      </TouchableOpacity>
    );
  };

  if (!dataLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView
          source={loaderAnimation}
          autoPlay
          loop
          style={styles.loader}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#34B8FF"
        translucent={true}
      />
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#34B8FF', '#0866AA']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {team?.name}
            </Text>
            <Text style={styles.headerSubtitle}>
              {players.length} {players.length === 1 ? 'Member' : 'Members'} • Captain: {team?.captain?.name}
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </LinearGradient>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <PlayerCard
            player={item}
            index={index}
            canEdit={canEdit}
            teamCaptain={team?.captain}
            onRemove={removePlayerFromBackend}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchTeamDetails}
            colors={['#34B8FF']}
            tintColor="#34B8FF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>No players in this team yet</Text>
          </View>
        }
      />

      {canEdit && (
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} transparent animationType="none">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1, justifyContent: 'flex-end' }}
            >
              <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search player by name or phone..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={handleInputChange}
                  />
                  <AntDesign name="search1" size={20} color="#005a7f" style={styles.searchIcon} />
                </View>

                {loading ? (
                  <View style={styles.modalLoader}>
                    <ActivityIndicator size="large" color="#34B8FF" />
                  </View>
                ) : searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderSearchResultItem}
                    contentContainerStyle={styles.searchResultsContainer}
                  />
                ) : (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>
                      {searchQuery ? 'No players found' : 'Search for players to add'}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </Animated.View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <CustomDialog
        visible={dialogVisible}
        title={dialogTitle}
        message={dialogMessage}
        type={dialogType}
        onClose={() => setDialogVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loader: {
    width: 200,
    height: 200,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#34B8FF',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
  cardContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playerCard: {
    padding: 16,
    borderRadius: 12,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  playerStats: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  removeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34B8FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#003b5c',
  },
  searchIcon: {
    marginLeft: 8,
  },
  modalLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  searchResultsContainer: {
    paddingBottom: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    color: '#003b5c',
    fontWeight: '500',
  },
  searchResultPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noResults: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
  },
  closeButton: {
    backgroundColor: '#34B8FF',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TeamDetailsScreen;