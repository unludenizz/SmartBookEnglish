import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { ConvertEpubToText, ConvertPdfToText } from "../api/GlobalFunctions";
import { openDatabase, createTables, insertBook, isBookInDatabase } from "../../src/SQLiteService";
import i18n from "../utils/I18n";
import { useFocusEffect } from "@react-navigation/native";
import { getDarkMode } from "../../securestore/ExpoSecureStore";

export default function AddBookScreen() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [level, setLevel] = useState("");
  const [pdf, setPdf] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [db, setDb] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

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
    const initializeDb = async () => {
      const database = await openDatabase();
      await createTables(database);
      setDb(database);
    };
    initializeDb();
  }, []);

  const _ConvertPdfToText = async () => {
    try {
      if(pdf.mimeType=="application/epub+zip"){
        const response = await ConvertEpubToText(pdf);
        return response;
      }else{
        const response = await ConvertPdfToText(pdf);
        return response;
      }
      
    } catch (error) {
      console.log("PDF conversion error:", error);
    }
  };

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/epub', 'application/epub+zip'],
      });
  
      if (result.assets && result.assets.length > 0) {
        setPdf(result.assets[0]);
      }
    } catch (err) {
      console.log("PDF/EPUB selection error:", err);
    }
  };
  const handleAddBook = async () => {
    if (!title || !pdf || !level) {
      Alert.alert(i18n.t('error'), i18n.t('pleaseincludebooktitlelevelandpdffile'));
      return;
    }

    setIsLoading(true);
    
    try {
      const bookExists = await isBookInDatabase(db, title.trim());
      
      if (bookExists) {
        Alert.alert(
          i18n.t('error'),
          i18n.t('bookexists'),
          [
            {
              text: i18n.t('ok'),
              onPress: () => setIsLoading(false)
            }
          ]
        );
        return;
      }

      const result = await _ConvertPdfToText();
      if (result?.result === true) {
        await insertBook(db, title.trim(), author.trim() || i18n.t('unknown'), level.trim(), result.text);
        Alert.alert(i18n.t('bookadded'), i18n.t('bookaddedsuccessfully'));
        setTitle("");
        setAuthor("");
        setLevel("");
        setPdf(null);
      } else {
        Alert.alert(i18n.t('error'), i18n.t('thepdfcouldnotbeconvertedtotext'));
      }
    } catch (error) {
      console.log("Book addition error:", error);
      Alert.alert(i18n.t('error'), i18n.t('thebookcouldnotbeadded'));
    } finally {
      setIsLoading(false);
    }
  };

  const styles = darkMode ? darkModeStyles : lightModeStyles;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>{i18n.t('booktitle')}</Text>
      <TextInput
        style={styles.input}
        placeholder={i18n.t('enterbooktitle')}
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>{i18n.t('bookauthoroptional')}</Text>
      <TextInput
        style={styles.input}
        placeholder={i18n.t('enterbookauthor')}
        value={author}
        onChangeText={setAuthor}
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>{i18n.t('booklevel')}</Text>
      <View style={styles.levelContainer}>
        {levels.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.levelButton,
              level === item && styles.selectedLevelButton,
            ]}
            onPress={() => setLevel(item)}
          >
            <Text
              style={[
                styles.levelButtonText,
                level === item && styles.selectedLevelButtonText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{i18n.t('bookpdf')}</Text>
      <TouchableOpacity style={styles.pdfButton} onPress={pickPdf}>
        <Text style={styles.buttonText}>{i18n.t('selectpdffile')}</Text>
      </TouchableOpacity>
      {pdf && <Text style={styles.fileName}>{pdf.name}</Text>}

      <TouchableOpacity style={styles.addButton} onPress={handleAddBook}>
        {isLoading ? (
          <ActivityIndicator color={"white"} size={"small"} />
        ) : (
          <Text style={styles.addButtonText}>{i18n.t('addbook')}</Text>
        )}
      </TouchableOpacity>
      <Text>*{i18n.t('pdfcrashpossibility')}</Text>
      <Text>*{i18n.t('onlypdfandepub')}</Text>
    </ScrollView>
  );
}

const darkModeStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#444',
    color: '#fff',
    fontSize: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  levelButton: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#444',
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedLevelButton: {
    backgroundColor: '#666',
    borderWidth: 2,
    borderColor: '#888',
  },
  levelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedLevelButtonText: {
    color: '#fff',
  },
  pdfButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: "600",
  },
  fileName: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: '#999',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: "700",
  },
});

const lightModeStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    color: '#333',
    fontSize: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  levelButton: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedLevelButton: {
    backgroundColor: '#20b2aa',
    borderWidth: 2,
    borderColor: '#1a9089',
  },
  levelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedLevelButtonText: {
    color: '#fff',
  },
  pdfButton: {
    backgroundColor: '#20b2aa',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: "600",
  },
  fileName: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: '#4682b4',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: "700",
  },
});