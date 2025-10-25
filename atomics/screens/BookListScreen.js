import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { openDatabase, getBooks, downloadBook, checkAndCreateTable } from "../../src/SQLiteService";
import { Books, TakeBookText } from "../api/GlobalFunctions";
import { getDarkMode, getSpecificBookProgress } from "../../securestore/ExpoSecureStore";
import i18n from "../utils/I18n";
import { Ionicons } from "@expo/vector-icons";

const themes = {
  light: {
    background: "#f4f4f4",
    surface: "#ffffff",
    text: "#333333",
    textSecondary: "#555555",
    border: "#cccccc",
    primary: "#6200ea",
    progressBg: "#e0e0e0",
    progressFill: "#3b5998",
  },
  dark: {
    background: "#121212",
    surface: "#1e1e1e",
    text: "#ffffff",
    textSecondary: "#b0b0b0",
    border: "#2c2c2c",
    primary: "#bb86fc",
    progressBg: "#2c2c2c",
    progressFill: "#bb86fc",
  },
};

const normalizeBook = (book, source) => {
  const uniqueKey = `${book.title}-${book.author}`.toLowerCase().replace(/\s+/g, '-');
  return {
    id: book.id || book._id || `${source}-${Date.now()}`,
    title: book.title,
    author: book.author,
    level: book.level,
    text: book.text || null,
    imageUrl: book.imageUrl || null,
    source: source,
    uniqueKey
  };
};

export default function BookListScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("📚");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isServerError, setIsServerError] = useState(false);

  const theme = darkMode ? themes.dark : themes.light;
  const levels = ["📚", "A1", "A2", "B1", "B2", "C1", "C2"];

  const handleDownload = async(book) => {
    try {
      const db = await openDatabase();
      const takeText = await TakeBookText(book.id)
      if(takeText.source.text!=null){
        const result = await downloadBook(db,book,takeText.source.text)
        if (result) {
          navigation.replace(navigation.getState().routes[0].name);
        }
      }


    } catch (error) {
      console.error(error)
    }
  }

  const loadBooks = async () => {
    try {
        setIsLoading(true);
        setError(null);
        setIsServerError(false);
        const db = await openDatabase();
        await checkAndCreateTable(db);
        const localBooks = await getBooks(db);
        const normalizedLocalBooks = localBooks.map(book => ({
            ...normalizeBook(book, 'local'),
            isDownloaded: true
        }));
        let combinedBooks = [];

        try {
            const serverBooks = await Books();
            const normalizedServerBooks = serverBooks.map(book => {
                const isDownloaded = normalizedLocalBooks.some(localBook => localBook.title === book.title);
                return {
                    ...normalizeBook(book, 'server'),
                    isDownloaded
                };
            });
            combinedBooks = [
                ...normalizedLocalBooks.filter(localBook =>
                    !normalizedServerBooks.some(serverBook => serverBook.title === localBook.title)
                ),
                ...normalizedServerBooks
            ];

        } catch (serverError) {
            console.warn("Sunucu kitaplarına erişilemedi:", serverError);
            setIsServerError(true);
            combinedBooks = normalizedLocalBooks;
        }
        const progressObj = {};
        for (const book of combinedBooks) {
            try {
                const progress = await getSpecificBookProgress(book.title);
                progressObj[book.uniqueKey] = progress;
            } catch (progressError) {
                console.warn(`${book.title} için ilerleme yüklenemedi:`, progressError);
                progressObj[book.uniqueKey] = { progress: 0 };
            }
        }
        setBooks(combinedBooks);
        setProgressData(progressObj);

    } catch (err) {
        console.error("Kitaplar yüklenirken hata:", err);
        setError(i18n.t('errorLoadingBooks'));
    } finally {
        setIsLoading(false);
    }
};
  useFocusEffect(
    useCallback(() => {
      const initialize = async () => {
        try {
          const isDarkMode = await getDarkMode();
          setDarkMode(isDarkMode);
          await loadBooks();
        } catch (err) {
          console.error("Başlatma hatası:", err);
          setError(i18n.t('initializationError'));
        }
      };

      initialize();
    }, [])
  );

  const filteredBooks = books.filter((book) => {
    const matchesLevel = selectedLevel === '📚' || book.level === selectedLevel;
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const renderItem = ({ item }) => {
    const progress = progressData[item.uniqueKey]?.progress || 0;
    const downloaded = item.isDownloaded;

    return (
      <View>
        {downloaded?
        <TouchableOpacity
        style={[styles.itemContainer, { backgroundColor: theme.surface }]}
        onPress={() => navigation.navigate("BookDetail", { book: item })}
      >
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.bookImage}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("../../assets/bookimage.jpeg")}
              style={styles.bookImage}
              resizeMode="cover"
            />
          )}
          {item.source === 'local' ? (
            <View style={styles.sourceIndicator}>
              <Text style={styles.sourceText}>{i18n.t('local')}</Text>
            </View>
          ):<View style={styles.sourceIndicator}>
          <Text style={styles.sourceText}>{i18n.t('server')}</Text>
        </View>}
        </View>

        <View style={styles.detailsContainer}>
          <Text style={[styles.level, { color: theme.text }]}>{item.level}</Text>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>
            {i18n.t('by')} {item.author}
          </Text>

          {downloaded ? (
            <>
              <View style={[styles.progressContainer, { backgroundColor: theme.progressBg }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${progress}%`,
                      backgroundColor: theme.progressFill
                    }
                  ]}
                ></View>
              </View>
              <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                {progress}% {i18n.t('completed')}
              </Text>
            </>
          ) : null}
        </View>

        {/* İndirme Butonu */}
        {item.source==='local' ? null : <TouchableOpacity
          style={[
            styles.downloadButton,
            { backgroundColor: downloaded ? theme.progressFill : theme.primary }
          ]}
          onPress={() => handleDownload(item)}
        >
          {downloaded ? (
            <Ionicons name="checkmark" size={25} color={darkMode ? "black" : "white"} />
          ) : (
            <Ionicons name="arrow-down" size={25} color={darkMode ? "black" : "white"} />
          )}
        </TouchableOpacity>}
      </TouchableOpacity>
      :<View
      style={[styles.itemContainer, { backgroundColor: theme.surface }]}
      onPress={() => navigation.navigate("BookDetail", { book: item })}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.bookImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={require("../../assets/bookimage.jpeg")}
            style={styles.bookImage}
            resizeMode="cover"
          />
        )}
        {item.source === 'local' ? (
          <View style={styles.sourceIndicator}>
            <Text style={styles.sourceText}>{i18n.t('local')}</Text>
            </View>
          ):<View style={styles.sourceIndicator}>
          <Text style={styles.sourceText}>{i18n.t('server')}</Text>
        </View>}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={[styles.level, { color: theme.text }]}>{item.level}</Text>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>
          {i18n.t('by')} {item.author}
        </Text>

        {downloaded ? (
          <>
            <View style={[styles.progressContainer, { backgroundColor: theme.progressBg }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${progress}%`,
                    backgroundColor: theme.progressFill
                  }
                ]}
              ></View>
            </View>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              {progress}% {i18n.t('completed')}
            </Text>
          </>
        ) : null}
      </View>

      {/* İndirme Butonu */}
      {item.source==='local' ? null : <TouchableOpacity
        style={[
          styles.downloadButton,
          { backgroundColor: downloaded ? theme.progressFill : theme.primary }
        ]}
        onPress={() => handleDownload(item)}
      >
        {downloaded ? (
          <Ionicons name="checkmark" size={25} color={darkMode ? "black" : "white"} />
        ) : (
          <Ionicons name="arrow-down" size={25} color={darkMode ? "black" : "white"} />
        )}
      </TouchableOpacity>}
    </View>
      }
      </View>
    );
  };

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={loadBooks}
        >
          <Text style={styles.retryButtonText}>{i18n.t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topBar, { backgroundColor: theme.surface }]}>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>
          {i18n.t('listofbooks')}
        </Text>
        {isServerError && (
          <Text style={[styles.serverErrorText, { color: theme.textSecondary }]}>
            {i18n.t('offlineMode')}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate("AddBook")}
      >
        <Text style={styles.addButtonText}>{i18n.t('addbook')}</Text>
      </TouchableOpacity>

      <TextInput
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text
          }
        ]}
        placeholder={i18n.t('searchbooksorauthors')}
        placeholderTextColor={theme.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.levelContainer}>
        <Text style={[styles.levelLabel, { color: theme.text }]}>
          {i18n.t('chooseyourlevel')}
        </Text>
        <View style={[styles.pickerWrapper, { borderColor: theme.border }]}>
          <Picker
            selectedValue={selectedLevel}
            style={[styles.picker, { color: theme.text }]}
            onValueChange={setSelectedLevel}
            dropdownIconColor={theme.text}
          >
            {levels.map((level, index) => (
              <Picker.Item
                label={level}
                value={level}
                key={index}
                color={darkMode ? theme.text : undefined}
              />
            ))}
          </Picker>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredBooks}
          renderItem={renderItem}
          keyExtractor={(item) => item.uniqueKey}
          contentContainerStyle={styles.list}
          onRefresh={loadBooks}
          refreshing={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  topBar: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 4,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  serverErrorText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  picker: {
    height: 40,
    width: "100%",
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    paddingRight: 60
  },
  imageContainer: {
    position: 'relative',
  },
  bookImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  sourceIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsContainer: {
    paddingLeft: 15,
    flex: 1,
  },
  level: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginVertical: 8,
  },
  progressBar: {
    height: "100%",
  },
  progressText: {
    fontSize: 12,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  retryButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
});
