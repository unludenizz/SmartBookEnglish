import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import i18n from '../utils/I18n';
import { 
  getArrayFromSecureStore, 
  toggleBookInFavorites, 
  getSpecificBookProgress,
  getDarkMode,
  getNativeLanguage
} from '../../securestore/ExpoSecureStore'; 

const BookFavorites = () => {
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const fetchFavoriteBooks = async () => {
    const favorites = await getArrayFromSecureStore('favorites');
    if(favorites?.length>0){
      const booksData = await Promise.all(
        favorites?.map(async (title, index) => {
          const { progress } = await getSpecificBookProgress(title);
          return {
            id: `${index}`,
            title,
            progress,
          };
        })
      );
      setFavoriteBooks(booksData);
    }else{
      setFavoriteBooks(0);
    }
    
  };

  const getDarkModeFromSecureStore = async () => {
    try {
      const darkModeValue = await getDarkMode();
      setDarkMode(darkModeValue);
    } catch (error) {
      console.error('Error getting dark mode from Secure Store:', error);
      setDarkMode(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFavoriteBooks();
      getNativeLanguage()
    }, [])
  );

  const handleToggleFavorite = async (book) => {
    await toggleBookInFavorites(book.title);
    fetchFavoriteBooks();
  };

  const renderBook = ({ item }) => (
    <View style={[styles.bookItem, { backgroundColor: darkMode ? '#333' : '#fff' }]}>
      <View style={styles.bookInfo}>
        <Text style={[styles.title, { color: darkMode ? '#fff' : '#333' }]}>{item.title}</Text>
        <Progress.Bar
          progress={item.progress / 100}
          width={150}
          height={10}
          color={darkMode ? '#81b0ff' : '#4caf50'}
          style={styles.progressBar}
        />
        <Text style={[styles.progressText, { color: darkMode ? '#aaa' : '#666' }]}>{Math.round(item.progress)}%</Text>
      </View>
      <TouchableOpacity onPress={() => handleToggleFavorite(item)}>
        <FontAwesome name="star" size={24} color={darkMode ? '#fff' : 'gold'} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#121212' : '#f5f5f5' }]}>
      <Text style={[styles.header, { color: darkMode ? '#fff' : '#333' }]}>{i18n.t('myfavoritebooks')}</Text>
      {favoriteBooks?.length > 0 ? (
        <FlatList
          data={favoriteBooks}
          renderItem={renderBook}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={[styles.noFavoritesText, { color: darkMode ? '#aaa' : '#666' }]}>{i18n.t('youhaventaddedanyfavoritebooksyet')}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  bookItem: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  bookInfo: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
  progressBar: {
    marginTop: 5,
    height: 10,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    marginTop: 5,
  },
  icon: {
    marginLeft: 10,
  },
  noFavoritesText: {
    textAlign: 'center',
    fontSize: 16,
  },
});

export default BookFavorites;