import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { 
  addWordToDictionary, 
  getDictionary, 
  removeWordFromDictionary,
  saveBookProgress,
  getSpecificBookProgress,
  initializeBookProgress,
  getDarkMode,
  getNativeLanguage
} from '../../securestore/ExpoSecureStore';
import i18n from '../utils/I18n';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const BookUserViewerScreen = ({ route }) => {
  const DEEPL_API_KEY = "5ad7f451-71f6-4fdd-af40-fa9d235068d3:fx";
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordLibrary, setWordLibrary] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isProgressLoaded, setIsProgressLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { book } = route.params;
  const LINES_PER_PAGE = 15;
  const [expandedLines, setExpandedLines] = useState(new Set());
  const [lineTranslations, setLineTranslations] = useState({});
  const [speakingText, setSpeakingText] = useState(null);
  const [nativeLanguage,setNativeLanguage] = useState(null)
  const scrollViewRef = useRef(null)

  useFocusEffect(
    useCallback(() => {
      const fetchDarkMode = async () => {
        const isDarkMode = await getDarkMode();
        const nativeL = await getNativeLanguage()
        console.log(nativeL)
        setDarkMode(isDarkMode);
        setNativeLanguage(nativeL)
      };
      fetchDarkMode();

      return () => {
        if (speakingText) {
          Speech.stop();
          setSpeakingText(null);
        }
      };
    }, [speakingText])
  );

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { progress, pageNumber } = await getSpecificBookProgress(book.title);

        if (progress > 0 || pageNumber > 0) {
          setCurrentPage(pageNumber);
        } else {
          await initializeBookProgress(book.title);
          setCurrentPage(0);
        }

        const dictionary = await getDictionary();
        setWordLibrary(dictionary);
        setIsProgressLoaded(true);
      } catch (error) {
        console.error('Error:', error);
        setIsProgressLoaded(true);
      }
    };

    loadInitialData();
  }, []);

  const getTotalPages = useCallback(() => {
    return Math.ceil(book.text?.split('\n').length / LINES_PER_PAGE);
  }, [book]);

  const updateProgress = async (newPage) => {
    const totalPages = getTotalPages();
    if (totalPages === 0) return;

    const newProgress = Math.round((newPage / totalPages) * 100);
    await saveBookProgress(book.title, newProgress, newPage);
  };

  const handleWordPress = async (word) => {
    const existingWord = wordLibrary.find(entry => entry.word === word);
    if (existingWord) {
      setSelectedWord({ word, translation: existingWord.meaning, inLibrary: true });
    } else {
      setSelectedWord({ word, inLibrary: false });
      await handleTranslate(word);
    }
  };

  const handleSentencePress = async (line, lineIndex) => {
    try {
      const currentKey = `${currentPage}-${lineIndex}`;

      if (expandedLines.has(currentKey)) {
        const newExpandedLines = new Set(expandedLines);
        newExpandedLines.delete(currentKey);
        setExpandedLines(newExpandedLines);
      } else {
        setIsLoading(true);
        const response = await axios.post('https://api-free.deepl.com/v2/translate', null, {
          params: {
            auth_key: DEEPL_API_KEY,
            text: line,
            target_lang: nativeLanguage,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        console.log(response.data);


        if (response.data && response.data.translations.length > 0) {
          setLineTranslations(prev => ({
            ...prev,
            [currentKey]: response.data.translations[0].text,
          }));

          const newExpandedLines = new Set(expandedLines);
          newExpandedLines.add(currentKey);
          setExpandedLines(newExpandedLines);
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', i18n.t('therewasanerrorduringtranslation'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (word) => {
    if (word.trim() === '') {
      Alert.alert('Error', i18n.t('youhavetoselectawordfortranslation'));
      return;
    }

    setIsLoading(true);
    setTranslatedText('');

    try {
      const response = await axios.post('https://api-free.deepl.com/v2/translate', null, {
        params: {
          auth_key: DEEPL_API_KEY,
          text: word,
          target_lang: nativeLanguage,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data && response.data.translations.length > 0) {
        setTranslatedText(response.data.translations[0].text);
      } else {
        setTranslatedText(i18n.t('translationwasntfind'));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', i18n.t('therewasanerrorduringtranslation'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordSpeech = (word) => {
    try {
      if (word) {
        if (speakingText === word) {
          Speech.stop();
          setSpeakingText(null);
        } else {
          if (speakingText) {
            Speech.stop();
          }
          Speech.speak(word, {
            language: "en-US",
            rate: 1.0,
            pitch: 1.0,
            onDone: () => {
              setSpeakingText(null);
            },
            onError: () => {
              setSpeakingText(null);
            },
          });
          setSpeakingText(word);
        }
      } else {
        Alert.alert('Error', 'No text to speak');
      }
    } catch (error) {
      console.error(error);
      setSpeakingText(null);
    }
  };

  const addToLibrary = async (word, translation) => {
    const cleanedWord = word.replace(/[.,!?]$/, '');
    const cleanedTranslation = translation.replace(/[.,!?]$/, '');
    const newWord = { word: cleanedWord, translation: cleanedTranslation };
    setWordLibrary(prevLibrary => [...prevLibrary, newWord]);
    await addWordToDictionary(cleanedWord, cleanedTranslation);
    setSelectedWord({ ...newWord, inLibrary: true });
  };

  const removeFromLibrary = async (word) => {
    setWordLibrary(prevLibrary => prevLibrary.filter(entry => entry.word !== word));
    await removeWordFromDictionary(word);
    setSelectedWord(null);
  };

  const renderPage = useCallback(() => {
    if (!book || !book.text) {
      return <Text style={[styles.text, { color: darkMode ? '#fff' : '#000' }]}>{i18n.t('nocontentavailable')}</Text>;
    }

    const startIndex = currentPage * LINES_PER_PAGE;
    const endIndex = startIndex + LINES_PER_PAGE;
    const lines = book.text?.split('\n').slice(startIndex, endIndex);

    return (
      <View style={styles.pageContainer}>
        {lines.map((line, index) => {
          const lineKey = `${currentPage}-${index}`;
          const isExpanded = expandedLines.has(lineKey);

          return (
            <View key={`line-${lineKey}`}>
              <View style={styles.lineContainer}>
                {line.length > 1 && (
                  <TouchableOpacity
                    style={styles.sentenceButton}
                    onPress={() => handleSentencePress(line, index)}
                  >
                    <Text style={styles.sentenceButtonText}>
                      <FontAwesome
                        name={isExpanded ? "angle-down" : "play"}
                        size={18}
                        color={darkMode ? "gray" : "#000"}
                      />
                    </Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.text}>
                  {line?.split(' ').map((word, wordIndex) => {
                    const wordExists = wordLibrary.some(entry => entry.word === word);
                    return (
                      <TouchableOpacity
                        key={`word-${currentPage}-${index}-${wordIndex}`}
                        onPress={() => handleWordPress(word)}
                      >
                        <Text
                          style={[
                            styles.word,
                            {
                              color: wordExists ? 'gray' : darkMode ? 'white' : 'black',
                            },
                          ]}
                        >
                          {word}{' '}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </Text>
                {line.length > 1 && (
                  <TouchableOpacity
                    style={styles.sentenceButton}
                    onPress={() => handleWordSpeech(line)}
                  >
                    <Text style={styles.sentenceButtonText}>
                      <FontAwesome
                        name={speakingText === line ? "volume-up" : "volume-off"}
                        size={24}
                        color={darkMode ? "gray" : "#000"}
                      />
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {isExpanded && lineTranslations[lineKey] && (
                <Text style={styles.translationText}>
                  {lineTranslations[lineKey]}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  }, [book, currentPage, wordLibrary, darkMode, expandedLines, lineTranslations, speakingText]);

  const handlePageChange = async (direction) => {
    if (direction === 'prev' && currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      await updateProgress(newPage);
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } else if (direction === 'next') {
      const totalPages = Math.floor((book.text?.split('\n').length - 1) / LINES_PER_PAGE);
      if (currentPage < totalPages) {
        const newPage = currentPage + 1;
        setCurrentPage(newPage);
        await updateProgress(newPage);
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      }
    } else if (direction === 'finish') {
      await saveBookProgress(book.title, 100, getTotalPages());
      Alert.alert(i18n.t('congratulations'), i18n.t('youfinishedthebook'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#181818' : '#f2f2f2' }]}>
      <ScrollView ref={scrollViewRef}>
        {!isProgressLoaded || !book ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={darkMode ? '#fff' : '#333'} />
          </View>
        ) : (
          renderPage()
        )}
      </ScrollView>
      {selectedWord && (
        <View style={[styles.popup, { backgroundColor: darkMode ? '#333' : '#fff' }]}>
          <View style={styles.popupHeaderContainer}>
            <Text style={[styles.popupWord, { color: darkMode ? '#fff' : '#000' }]}>
              {selectedWord.word}
            </Text>
            <TouchableOpacity
              style={styles.speakButton}
              onPress={() => handleWordSpeech(selectedWord.word)}
            >
              <FontAwesome
                name={speakingText === selectedWord.word ? "volume-up" : "volume-off"}
                size={24}
                color={darkMode ? "gray" : "#000"}
              />
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color={darkMode ? '#fff' : '#333'} />
          ) : (
            <>
              <Text style={[styles.popupMeaning, { color: darkMode ? '#ddd' : '#333' }]}>
                {selectedWord.translation || translatedText}
              </Text>
              {selectedWord.inLibrary ? (
                <TouchableOpacity
                  onPress={() => removeFromLibrary(selectedWord.word)}
                  style={[styles.addButton, { backgroundColor: '#dc3545' }]}
                >
                  <Text style={styles.addButtonText}>{i18n.t('removewordfromlibrary')}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => addToLibrary(selectedWord.word, translatedText)}
                  style={styles.addButton}
                >
                  <Text style={styles.addButtonText}>{i18n.t('addwordtolibrary')}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          <TouchableOpacity onPress={() => setSelectedWord(null)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>{i18n.t('close')}</Text>
          </TouchableOpacity>
        </View>
      )}
      {!selectedWord && (
        <View style={styles.navigationContainer}>
          <TouchableOpacity onPress={() => handlePageChange('prev')} style={styles.navigationButton}>
            <Text style={styles.navigationText}>{i18n.t('previouspage')}</Text>
          </TouchableOpacity>
          {currentPage === Math.floor((book.text?.split('\n').length - 1) / LINES_PER_PAGE) ? (
            <TouchableOpacity onPress={() => handlePageChange('finish')} style={styles.navigationButton}>
              <Text style={styles.navigationText}>{i18n.t('finishthebook')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => handlePageChange('next')} style={styles.navigationButton}>
              <Text style={styles.navigationText}>{i18n.t('nextpage')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  pageContainer: {
    marginVertical: 12,
    paddingBottom: 80,
  },
  text: {
    fontSize: 20,
    lineHeight: 32,
    color: "#333",
    marginVertical: 6,
    flex: 1,
  },
  word: {
    fontSize: 20,
    lineHeight: 32,
  },
  popup: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  popupWord: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  popupMeaning: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 8,
  },
  addButton: {
    marginTop: 16,
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: "#333",
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 24,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  navigationButton: {
    backgroundColor: "#333",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  navigationText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  lineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    paddingRight: 10,
  },
  sentenceButton: {
    marginRight: 12,
    padding: 6,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  sentenceButtonText: {
    fontSize: 18,
  },
  translationText: {
    fontSize: 18,
    color: "#666",
    paddingLeft: 48,
    marginBottom: 12,
    fontStyle: "italic",
    lineHeight: 26,
  },
  popupHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  speakButton: {
    padding: 8,
    borderRadius: 20,
  },
});

export default BookUserViewerScreen;
