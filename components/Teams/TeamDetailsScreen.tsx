import React, { useState, useEffect, useRef, useCallback } from "react";
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
  ImageBackground,
  RefreshControl,
  Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import LottieView from 'lottie-react-native';
import apiService from "../APIservices";
import CustomDialog from "../Customs/CustomDialog.js";


const background = require('../../assets/images/cricsLogo.png');
const loaderAnimation =  require('../../assets/animations/loader.json');

const { width } = Dimensions.get('window');

const TeamDetailsScreen = ({ route, navigation }) => {
  const { teamId } = route.params;
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [addingPlayerId, setAddingPlayerId] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('success');
  const slideAnim = useRef(new Animated.Value(500)).current;
  const [canEdit, setCanEdit] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const showDialog = (title, message, type = 'success') => {
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
  }, []);

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
  }, [modalVisible]);

  const roleCheck = async () => {
    const userId = await AsyncStorage.getItem('userUUID');
    setCanEdit(userId === team?.creator?.id || userId === team?.captain?.id);
    console.log(team?.creator?.id);
    console.log(team?.captain?.id);
    console.log(userId);
  };

  useEffect(() => {
    fetchTeamDetails();
    // roleCheck();
  }, []);

  const fetchTeamDetails = async () => {
    try {
      setRefreshing(true);
      const response = await apiService({
        endpoint: `teams/${teamId}`,
        method: "GET",
      });

      if (response.success && response.data?.data) {
        setPlayers(response.data.data.players || []);
        setTeam(response.data?.data);
        const userId = await AsyncStorage.getItem('userUUID');
        setCanEdit(userId === response.data?.data?.creator?.id || userId === response.data?.data?.captain?.id);
        setDataLoaded(true);
        console.log(response.data);

      }
    } catch (err) {
      console.error("Error fetching team details:", err);
      showDialog('Error', 'Failed to fetch team details', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const debouncedFetchPlayers = useCallback(
    debounce(async (query) => {
      if (!query.trim()) return;
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

        const merged = [...nameData, ...phoneData];
        const uniquePlayers = Array.from(
          new Map(merged.map(player => [player.id, player])).values()
        );

        setSearchResults(uniquePlayers);
      } catch (err) {
        console.error('Error fetching players:', err);
        showDialog('Error', 'Failed to fetch players', 'error');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  const handleInputChange = (value) => {
    debouncedFetchPlayers(value);
  };

  const addPlayer = async (player) => {
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

  const removePlayer = async (playerId) => {
    try {
      const response = await apiService({
        endpoint: `teams/${team.id}/${playerId}`,
        method: 'PUT',
        body: { playerId: playerId, action: 'Remove' },
      });

      if (response.success) {
        setPlayers(players.filter(p => p.id !== playerId));
        showDialog('Success', 'Player removed successfully!');
      } else {
        showDialog('Error', response.error?.message || 'Failed to remove player.', 'error');
      }
    } catch (err) {
      showDialog('Error', 'Failed to remove player.', 'error');
    }
  };

  const renderPlayerCard = ({ item, index }) => {
    const isFirstDesign = index % 2 === 0;

    return (
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={isFirstDesign ?
            ['#8FDFFF', '#104B62'] :
            ['#209FFF', '#00354A']
          }
          style={styles.playerCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.playerInfo}>
            <Image
              source={item.profilePic ? { uri: item.profilePic } : require('../../assets/defaultLogo.png')}
              style={styles.searchResultAvatar}
              defaultSource={require('../../assets/defaultLogo.png')}
            />
            <View style={styles.playerDetails}>
              <Text style={styles.playerName}>{item?.name}</Text>
              <Text style={styles.playerStats}>
                {item.role} • {team.captain?.id === item.id && 'Captain'}
              </Text>
            </View>
          </View>
          {canEdit && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePlayer(item.id)}
            >
              <MaterialIcons name="remove-circle" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderSearchResultItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => addPlayer(item)}
      disabled={addingPlayerId === item.id}
    >
      <Image
        source={item.profilePic ? { uri: item.profilePic } : require('../../assets/defaultLogo.png')}
        style={styles.searchResultAvatar}
        defaultSource={require('../../assets/defaultLogo.png')}
      />
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
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#34B8FF"
        translucent={true}
      />
      <LinearGradient colors={['rgba(0, 0, 0, 0.2)', 'rgba(54, 176, 303, 0.1)']} style={styles.gradientOverlay}>
        <ImageBackground source={background} style={styles.background} resizeMode="cover" imageStyle={styles.backgroundImage}>
          <BlurView intensity={50} tint="light" style={styles.container}>
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
              renderItem={renderPlayerCard}
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
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
              >
                <LinearGradient
                  colors={["#0866AA", "#34B8FF"]}
                  style={styles.addButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name="add" size={24} color="#FFF" />
                  <Text style={styles.addButtonText}>Add Player</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <Modal visible={modalVisible} transparent animationType="none">
              <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                  <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.searchContainer}>
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search player by name or phone..."
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={(text) => {
                          setSearchQuery(text);
                          handleInputChange(text);
                        }}
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
          </BlurView>
        </ImageBackground>
      </LinearGradient>
    </>
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
  gradientOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    opacity: 0.5,
  },
  container: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 20,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    overflow: 'hidden',
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
  addButton: {
    marginTop: 12,
    borderRadius: 25,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
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