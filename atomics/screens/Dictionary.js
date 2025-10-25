import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getDictionary, removeWordFromDictionary, getDarkMode } from '../../securestore/ExpoSecureStore';
import i18n from '../utils/I18n';
import * as Speech from 'expo-speech';

const Dictionary = () => {
  const [words, setWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [speakingWord, setSpeakingWord] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const initializeScreen = async () => {
        await loadDictionary();
        const isDarkMode = await getDarkMode();
        setDarkMode(isDarkMode);
      };

      initializeScreen();
      return () => {
        if (speakingWord) {
          Speech.stop();
          setSpeakingWord(null);
        }
      };
    }, [speakingWord])
  );

  const loadDictionary = async () => {
    try {
      const dictionary = await getDictionary();
      setWords(dictionary.map((item, index) => ({ ...item, id: index.toString() })));
    } catch (error) {
      console.error('Error loading dictionary:', error);
    }
  };

  const handleRemoveWord = async (word) => {
    try {
      await removeWordFromDictionary(word);
      await loadDictionary();
    } catch (error) {
      console.error('Error removing word:', error);
    }
  };

  const handleWordSpeech = (word) => {
    try {
      if (word) {
        if (speakingWord === word) {
          Speech.stop();
          setSpeakingWord(null);
        } else {
          if (speakingWord) {
            Speech.stop();
          }
          Speech.speak(word, {
            language: i18n.t('speech'),
            rate: 1.0,
            pitch: 1.0,
            onDone: () => {
              setSpeakingWord(null);
            },
            onError: () => {
              setSpeakingWord(null);
            },
          });
          setSpeakingWord(word);
        }
      }
    } catch (error) {
      console.error('Error speaking word:', error);
      setSpeakingWord(null);
    }
  };

  const filteredWords = words.filter(item =>
    (item.word && typeof item.word === 'string' && item.word.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.meaning && typeof item.meaning === 'string' && item.meaning.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const dynamicStyles = {
    container: {
      ...styles.container,
      backgroundColor: darkMode ? '#121212' : '#f0f0f5',
    },
    header: {
      ...styles.header,
      color: darkMode ? '#E0E0E0' : '#333',
    },
    input: {
      ...styles.input,
      backgroundColor: darkMode ? '#333333' : '#fff',
      borderColor: darkMode ? '#E0E0E0' : '#6200ee',
      color: darkMode ? '#E0E0E0' : '#000',
    },
    wordItem: {
      ...styles.wordItem,
      backgroundColor: darkMode ? '#242424' : '#fff',
      shadowColor: darkMode ? '#000' : '#000',
      shadowOpacity: darkMode ? 0.3 : 0.1,
    },
    word: {
      ...styles.word,
      color: darkMode ? '#E0E0E0' : '#6200ee',
    },
    meaning: {
      ...styles.meaning,
      color: darkMode ? '#B0B0B0' : '#666',
    },
    icon: {
      color: darkMode ? '#E0E0E0' : '#6200ee',
    },
  };

  const renderWord = ({ item }) => (
    <View style={dynamicStyles.wordItem}>
      <View style={styles.wordContent}>
        <View style={styles.wordTextContainer}>
          <Text style={dynamicStyles.word}>{item.word}</Text>
          <TouchableOpacity
            onPress={() => handleWordSpeech(item.word)}
            style={styles.speakButton}
          >
            <FontAwesome
              name={speakingWord === item.word ? "volume-up" : "volume-off"}
              size={20}
              color={dynamicStyles.icon.color}
            />
          </TouchableOpacity>
        </View>
        <Text style={dynamicStyles.meaning}>{item.meaning}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveWord(item.word)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome
          name="trash-o"
          size={24}
          color={dynamicStyles.icon.color}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.header}>{i18n.t('mydictionary')}</Text>
      <TextInput
        style={dynamicStyles.input}
        placeholder={i18n.t('searchforawordor')}
        placeholderTextColor={darkMode ? '#808080' : '#888'}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredWords}
        renderItem={renderWord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  wordItem: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordContent: {
    flex: 1,
    marginRight: 10,
  },
  wordTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  word: {
    fontSize: 20,
    fontWeight: '600',
  },
  meaning: {
    fontSize: 14,
    marginTop: 5,
  },
  speakButton: {
    marginLeft: 10,
    padding: 5,
  },
});

export default Dictionary;
