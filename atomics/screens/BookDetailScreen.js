import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import i18n from '../utils/I18n';
import { useFocusEffect } from '@react-navigation/native';
import { getDarkMode } from '../../securestore/ExpoSecureStore';
import { openDatabase, isBookInDatabase, getBookByTitle } from '../../src/SQLiteService';

const saveArrayToSecureStore = async (key, array) => {
  try {
    const jsonValue = JSON.stringify(array);
    await SecureStore.setItemAsync(key, jsonValue);
  } catch (error) {
    console.error('Dizi kaydedilemedi:', error);
  }
};

const getArrayFromSecureStore = async (key) => {
  try {
    const jsonValue = await SecureStore.getItemAsync(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Dizi alınamadı:', error);
    return null;
  }
};

const toggleBookInFavorites = async (book) => {
  let favorites = await getArrayFromSecureStore('favorites');
  if (!favorites) {
    favorites = [];
  }

  if (favorites.includes(book.title)) {
    favorites = favorites.filter(fav => fav !== book.title);
    await saveArrayToSecureStore('favorites', favorites);
    return false;
  } else {
    favorites.push(book.title);
    await saveArrayToSecureStore('favorites', favorites);
    return true;
  }
};

const isBookFavorited = async (bookTitle) => {
  const favorites = await getArrayFromSecureStore('favorites');
  return favorites ? favorites.includes(bookTitle) : false;
};

export default function BookDetailScreen({ navigation, route }) {
  const { book } = route.params;
  const [isFavorited, setIsFavorited] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isInDatabase, setIsInDatabase] = useState(false);
  const [bookText,setBookText] = useState([])
  useFocusEffect(
    React.useCallback(() => {
      const fetchDarkMode = async () => {
        const isDarkMode = await getDarkMode();
        setDarkMode(isDarkMode);
      };
      fetchDarkMode();
    }, [])
  );
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const favorited = await isBookFavorited(book.title);
      setIsFavorited(favorited);
    };

    const checkDatabaseStatus = async () => {
      const db = await openDatabase();
      const exists = await isBookInDatabase(db, book.title);
      setIsInDatabase(exists);
      const takeBookInfos = await getBookByTitle(db,book.title)
      setBookText(takeBookInfos)
      db.close();
    };

    checkFavoriteStatus();
    checkDatabaseStatus();
  }, []);

  const handleToggleFavorite = async () => {
    const newStatus = await toggleBookInFavorites(book);
    setIsFavorited(newStatus);
  };

  const styles = darkMode ? darkModeStyles : lightModeStyles;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {book.imageUrl ? (
        <Image
          source={{ uri: book.imageUrl }}
          style={styles.coverImage}
          resizeMode='contain'
        />
      ) : (
        <Image
          source={require('../../assets/bookimage.jpeg')}
          style={styles.coverImage}
          resizeMode='contain'
        />
      )}

      <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
        <AntDesign
          name={isFavorited ? 'heart' : 'hearto'}
          size={28}
          color={isFavorited ? 'red' : 'gray'}
        />
      </TouchableOpacity>
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{i18n.t('by')} {book.author}</Text>
      <Text style={styles.category}>{i18n.t('level')} {book.level}</Text>
      <Text style={styles.description}>{book.description}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('BookUserViewer', { book:bookText })}>
        <Text style={styles.buttonText}>{i18n.t('viewbook')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const darkModeStyles = StyleSheet.create({
  container: {
    padding: 73,
    alignItems: 'center',
    backgroundColor: '#333',
  },
  coverImage: {
    width: 220,
    height: 330,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#444',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#fff',
  },
  author: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  category: {
    fontSize: 16,
    color: '#777',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    textAlign: 'justify',
    marginBottom: 20,
    lineHeight: 22,
    color: '#ccc',
  },
  button: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const lightModeStyles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  coverImage: {
    width: 220,
    height: 330,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  author: {
    fontSize: 18,
    color: '#888',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  category: {
    fontSize: 16,
    color: '#777',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    textAlign: 'justify',
    marginBottom: 20,
    lineHeight: 22,
    color: '#555',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
