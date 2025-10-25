import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { openDatabase, getBooks, closeDatabase, deleteBook } from '../../src/SQLiteService';
import { removeFromFavorites, removeBookProgress, getDarkMode } from '../../securestore/ExpoSecureStore';
import i18n from '../utils/I18n';

const { width } = Dimensions.get('window');

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState(null);

  const loadBooks = useCallback(async () => {
    let db = null;
    try {
      setLoading(true);
      db = await openDatabase();
      const booksData = await getBooks(db);
      setBooks(booksData);
      setError(null);
    } catch (error) {
      console.error("Error loading books:", error);
      setError(i18n.t('errorLoadingBooks'));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDarkMode = useCallback(async () => {
    try {
      const isDarkMode = await getDarkMode();
      setDarkMode(isDarkMode);
    } catch (error) {
      console.error("Error loading dark mode:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const initialize = async () => {
        if (mounted) {
          await Promise.all([loadDarkMode(), loadBooks()]);
        }
      };

      initialize();

      return () => {
        mounted = false;
      };
    }, [loadDarkMode, loadBooks])
  );

  const handleDelete = useCallback(async (bookId, bookTitle) => {
    Alert.alert(
      i18n.t('deletebook'),
      `${i18n.t('areyousureyouwant')}"${bookTitle}"?`,
      [
        {
          text: i18n.t('cancel'),
          style: "cancel"
        },
        {
          text: i18n.t('delete'),
          onPress: async () => {
            let db = null;
            try {
              db = await openDatabase();
              await deleteBook(db, bookId);
              await Promise.all([
                removeBookProgress(bookTitle),
                removeFromFavorites(bookTitle)
              ]);
              setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
            } catch (error) {
              console.error("Error deleting book:", error);
              Alert.alert(i18n.t('error'), i18n.t('failedtodeletethebook'));
            }
          },
          style: "destructive"
        }
      ]
    );
  }, []);

  if (error) {
    return (
      <View style={[styles.container, darkMode ? styles.darkBackground : styles.lightBackground]}>
        <Text style={[styles.errorText, darkMode ? styles.darkText : styles.lightText]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadBooks}>
          <Text style={styles.retryButtonText}>{i18n.t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, darkMode ? styles.darkBackground : styles.lightBackground]}>
        <ActivityIndicator size="large" color={darkMode ? "#ffffff" : "#6200ee"} />
      </View>
    );
  }

  return (
    <View style={[styles.container, darkMode ? styles.darkBackground : styles.lightBackground]}>
      <Text style={[styles.header, darkMode ? styles.darkText : styles.lightText]}>{i18n.t('mybooks')}</Text>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {books.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, darkMode ? styles.darkText : styles.lightText]}>
              {i18n.t('nobooksfound')}
            </Text>
            <Text style={[styles.emptySubText, darkMode ? styles.darkText : styles.lightText]}>
              {i18n.t('yourlibraryisempty')}
            </Text>
          </View>
        ) : (
          books.map((book) => (
            <View key={book.id} style={[styles.bookCard, darkMode ? styles.darkCard : styles.lightCard]}>
              <View style={styles.bookHeader}>
                <Text 
                  style={[styles.bookTitle, darkMode ? styles.darkText : styles.lightText]}
                  numberOfLines={2}
                >
                  {book.title}
                </Text>
                <View style={styles.rightContainer}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{book.level}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(book.id, book.title)}
                  >
                    <Text style={styles.deleteButtonText}>{i18n.t('delete')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.authorText, darkMode ? styles.darkText : styles.lightText]}>
                {i18n.t('by')} {book.author}
              </Text>
              
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  bookCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: width - 32,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  authorText: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  lightBackground: {
    backgroundColor: '#f5f5f5',
  },
  darkBackground: {
    backgroundColor: '#333',
  },
  lightText: {
    color: '#333',
  },
  darkText: {
    color: '#f5f5f5',
  },
  lightCard: {
    backgroundColor: '#ffffff',
  },
  darkCard: {
    backgroundColor: '#444',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyBooks;