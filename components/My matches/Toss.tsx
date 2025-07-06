import { ImageBackground, StyleSheet, Text, View, Pressable, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import stadiumBG from '../../assets/images/cricsLogo.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons'; // Import icons
import apiService from '../APIservices';

const Toss = ({ route }) => {
  const [matchDetails, setMatchDetails] = useState(null);
  const [tossWinner, setTossWinner] = useState('');
  const [choice, setChoice] = useState('');
  const [isTossWinnerModalVisible, setTossWinnerModalVisible] = useState(false);
  const [isChoiceModalVisible, setChoiceModalVisible] = useState(false);

  const { matchId } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    setMatchDetails(route.params.matchDetails);
  }, []);

  const handleTossSubmit = async () => {
    if (!tossWinner || !choice) {
      Alert.alert('Error', 'Please select both the toss winner and their choice.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');

      const response = await apiService({
        endpoint: `matches/${route.params.matchId}/toss`,
        method: 'POST',
        body: { tossWinner, choice },
      });

      if (response.success) {
        navigation.navigate('SelectRoles', { matchId, isFirstInnings: true });
      } else {
        Alert.alert('Error', 'Failed to submit toss decision. Please try again.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit toss decision. Please try again.');
    }
  };

  const renderTossWinnerOptions = () => {
    return (
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Select Toss Winner</Text>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            setTossWinner(matchDetails?.team1Name);
            setTossWinnerModalVisible(false);
          }}
        >
          <MaterialIcons name="groups" size={20} color="#333" style={styles.optionIcon} />
          <Text style={styles.optionText}>{matchDetails?.team1Name}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            setTossWinner(matchDetails?.team2Name);
            setTossWinnerModalVisible(false);
          }}
        >
          <MaterialIcons name="groups" size={20} color="#333" style={styles.optionIcon} />
          <Text style={styles.optionText}>{matchDetails?.team2Name}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setTossWinnerModalVisible(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderChoiceOptions = () => {
    return (
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Choose Bat or Bowl</Text>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            setChoice('bat');
            setChoiceModalVisible(false);
          }}
        >
          {/* Cricket Bat Icon */}
          <MaterialIcons name="sports-cricket" size={20} color="#333" style={styles.optionIcon} />
          <Text style={styles.optionText}>Bat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            setChoice('bowl');
            setChoiceModalVisible(false);
          }}
        >
          {/* Cricket Ball Icon */}
          <MaterialIcons name="sports-baseball" size={20} color="#333" style={styles.optionIcon} />
          <Text style={styles.optionText}>Bowl</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setChoiceModalVisible(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#0A303B', '#36B0D5']} style={styles.gradient}>
        <ImageBackground source={stadiumBG} resizeMode="cover" style={styles.background}>
          <View style={styles.card}>
            <Text style={styles.heading}>Toss Decision</Text>

            {/* Toss Winner Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Select Toss Winner:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setTossWinnerModalVisible(true)}
              >
                <MaterialIcons name="groups" size={20} color="#333" style={styles.dropdownIcon} />
                <Text style={styles.dropdownButtonText}>
                  {tossWinner || 'Select Team'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Choice Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Choose Bat or Bowl:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setChoiceModalVisible(true)}
              >
                {/* Use the cricket bat or ball icon based on the selected choice */}
                {choice === 'bat' ? (
                  <MaterialIcons name="sports-cricket" size={20} color="#333" style={styles.dropdownIcon} />
                ) : (
                  <MaterialIcons name="sports-baseball" size={20} color="#333" style={styles.dropdownIcon} />
                )}
                <Text style={styles.dropdownButtonText}>
                  {choice ? (choice === 'bat' ? 'Bat' : 'Bowl') : 'Select Choice'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <Pressable style={styles.button} onPress={handleTossSubmit}>
              <Ionicons name="checkmark-done" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Submit Toss</Text>
            </Pressable>
          </View>
        </ImageBackground>
      </LinearGradient>

      {/* Toss Winner Modal */}
      <Modal
        isVisible={isTossWinnerModalVisible}
        onBackdropPress={() => setTossWinnerModalVisible(false)}
        backdropOpacity={0.5}
        animationIn="fadeInUp"
        animationOut="fadeOutDown"
      >
        {renderTossWinnerOptions()}
      </Modal>

      {/* Choice Modal */}
      <Modal
        isVisible={isChoiceModalVisible}
        onBackdropPress={() => setChoiceModalVisible(false)}
        backdropOpacity={0.5}
        animationIn="fadeInUp"
        animationOut="fadeOutDown"
      >
        {renderChoiceOptions()}
      </Modal>
    </View>
  );
};

export default Toss;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
  card: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    fontWeight: '500',
  },
  dropdownButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  dropdownIcon: {
    marginRight: 10,
  },
  button: {
    backgroundColor: '#6BB9F0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    flexDirection: 'row',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  optionButton: {
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  optionIcon: {
    marginRight: 10,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FF4757',
    fontWeight: 'bold',
  },
});