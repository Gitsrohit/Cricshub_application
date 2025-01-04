import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
  const navigation = useNavigation();

  const sections = [
    {
      title: 'Want to start a match?',
      buttonText: 'Start',
      image: require('/Users/iceberg/score/Frontend/assets/images/image 1.jpg'),
      navigateTo: 'StartMatchScreen',
    },
    {
      title: 'Want to host Tournament?',
      buttonText: 'Host',
      image: require('/Users/iceberg/score/Frontend/assets/images/image.jpg'),
      navigateTo: 'CreateTournaments',
    },
    {
      title: 'Want to create team?',
      buttonText: 'Create',
      image: require('/Users/iceberg/score/Frontend/assets/images/image 2.jpg'),
      navigateTo: 'CreateTeam',
    },
    {
      title: 'Fantasy Cricket',
      buttonText: 'Explore',
      image: require('/Users/iceberg/score/Frontend/assets/images/image 2.jpg'),
      navigateTo: 'FantasyCricketScreen',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <MaterialIcons name="menu" size={30} color="#fff" />
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search for matches..."
            placeholderTextColor="#ccc"
            style={styles.searchInput}
          />
          <FontAwesome name="search" size={20} color="#ccc" />
        </View>
        <FontAwesome name="filter" size={24} color="#fff" />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {sections.map((section, index) => (
          <ImageBackground
            key={index}
            source={section.image} // Dynamically set the image source
            style={[styles.cardBackground, styles.shadow]} // Added shadow styling
            imageStyle={styles.cardImage}
          >
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <TouchableOpacity
                style={styles.cardButton}
                onPress={() => navigation.navigate(section.navigateTo)}
              >
                <Text style={styles.cardButtonText}>{section.buttonText}</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002B46',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#004466',
    paddingTop: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006080',
    paddingHorizontal: 15,
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 6,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 5,
    marginRight: 10,
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  cardBackground: {
    width: '100%',
    height: 120,
    marginBottom: 35, // Increased the gap between cards
    borderRadius: 10,
    borderColor: '#fff',
    borderWidth: 1,
  },
  cardImage: {
    resizeMode: 'cover',
    opacity: 0.5,
    borderRadius: 10, // Added border radius to the image
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  cardButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  cardButtonText: {
    color: '#004466',
    fontWeight: 'bold',
    fontSize: 14,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default Home;
