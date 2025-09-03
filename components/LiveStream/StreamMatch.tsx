import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../APIservices';
import { AppColors } from '../../assets/constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StreamMatch = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getLiveMatches();
  }, []);

  const getLiveMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const id = await AsyncStorage.getItem('userUUID');
      setUserId(id);
      console.log(id);

      if (!token || !id) {
        navigation.navigate('Login');
        return;
      }
      setLoading(true);

      const response = await apiService({
        endpoint: 'matches/status',
        method: 'GET',
        params: { status: 'Live' },
      });

      if (response.success) {
        const uid = await AsyncStorage.getItem('userUUID');
        setMatches(response.data.data.filter(m => m.creatorName.id == uid));
      } else {
        setError('Failed to fetch live matches');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getLiveMatches();
  };

  const streamMatchClickHandler = (matchId) => {
    console.log(matchId);
    navigation.navigate('ConnectLiveStream', { matchId });
  }

  const renderMatchItem = ({ item }) => {
    const matchDate = item?.matchDate ? `${item?.matchDate[2]}-${item?.matchDate[1]}-${item?.matchDate[0]}` : 'N/A';
    const uid = AsyncStorage.getItem('userUUID');

    return (
      <View style={styles.matchCard}>
        <View style={styles.matchCardHeader}>
          <Text style={styles.tournamentName} numberOfLines={1}>
            {item?.tournamentResponse?.name || 'Individual Match'}
          </Text>
        </View>

        {/* Match Content */}
        <View style={styles.matchCardContent}>
          <View style={styles.teamRow}>
            {/* Team 1 */}
            <View style={styles.teamContainer}>
              <Image source={{ uri: item?.team1?.logoPath }} style={styles.teamLogo} />
              <Text style={styles.teamName} numberOfLines={1}>{item?.team1?.name}</Text>

              <View style={styles.scoreBadge}>
                <Text style={styles.teamScore}>{item?.team1Score || '0'}</Text>
              </View>

            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {/* Team 2 */}
            <View style={styles.teamContainer}>
              <Image source={{ uri: item?.team2?.logoPath }} style={styles.teamLogo} />
              <Text style={styles.teamName} numberOfLines={1}>{item?.team2?.name}</Text>
              <View style={styles.scoreBadge}>
                <Text style={styles.teamScore}>{item?.team2Score || '0'}</Text>
              </View>
            </View>
          </View>

          {/* Match Details */}
          <View style={styles.matchDetails}>
            {/* <View style={styles.detailRow}>
              <Icon name="calendar-month" size={16} color={AppColors.primaryBlue} />
              <Text style={styles.detailText}>{matchDate}</Text>
            </View> */}

            {item?.matchTime && (
              <View style={styles.detailRow}>
                <Icon name="access-time" size={16} color={AppColors.primaryBlue} />
                <Text style={styles.detailText}>{item.matchTime[0]}:{item.matchTime[1]}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={AppColors.primaryBlue} />
              <Text style={styles.detailText} numberOfLines={1}>
                {item?.venue || 'Venue not specified'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => streamMatchClickHandler(item.id)} style={styles.goLiveButtonContainer}>
          <Text style={styles.goLiveButtonText}>Go Live</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={AppColors.primaryBlue} />
        <Text style={styles.loaderText}>Loading Matches</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" />
      <SafeAreaView style={styles.safeContainer}>
        {error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && matches?.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="sports-cricket" size={60} color={AppColors.infoGrey} />
            <Text style={styles.emptyText}>No live matches right now</Text>
          </View>
        )}

        {!loading && matches?.length > 0 && (
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            renderItem={renderMatchItem}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

export default StreamMatch;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeContainer: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { fontSize: 18, marginTop: 12, color: AppColors.mediumText },
  errorText: { color: AppColors.errorRed, textAlign: 'center', margin: 20, fontSize: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: AppColors.infoGrey, marginTop: 12 },
  listContainer: { padding: 15 },
  matchCard: {
    backgroundColor: AppColors.white,
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: { color: AppColors.white, fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  matchCardHeader: { padding: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20, alignItems: 'center' },
  tournamentName: { fontSize: 17, fontWeight: '700', color: AppColors.secondaryBlue },
  matchCardContent: { padding: 20 },
  teamRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  teamContainer: { alignItems: 'center', flex: 1 },
  teamLogo: { width: 70, height: 70, borderRadius: 35, marginBottom: 6, borderWidth: 2, borderColor: AppColors.primaryBlue },
  teamName: { fontSize: 14, fontWeight: '600', color: AppColors.darkText, textAlign: 'center', marginBottom: 5 },
  teamScore: { fontSize: 18, fontWeight: 'bold', color: AppColors.primaryBlue },
  vsContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  vsText: { fontSize: 16, fontWeight: 'bold', color: AppColors.mediumText },
  matchDetails: { borderTopWidth: 1, borderTopColor: AppColors.cardBorder, paddingTop: 15 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  detailText: { marginLeft: 10, fontSize: 14, color: AppColors.mediumText, flex: 1 },
  matchCardFooter: { padding: 15, backgroundColor: AppColors.lightBackground, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, alignItems: 'center' },
  winnerText: { color: AppColors.successGreen, fontSize: 16, fontWeight: '600' },
  footerText: { color: AppColors.mediumText, fontSize: 14 },
  scoreBadge: { backgroundColor: AppColors.lightBackground, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  goLiveButtonContainer: {
    // width: "100%",
    backgroundColor: AppColors.secondaryBlue,
    borderRadius: 20,
    margin: 10,
    paddingVertical: 8,
  },
  goLiveButtonText: {
    color: AppColors.white,
    textAlign: 'center',
    fontSize: 18,
  }
});
