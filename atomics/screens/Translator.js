import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import i18n from '../utils/I18n';
import { getDarkMode } from '../../securestore/ExpoSecureStore';
import { useFocusEffect } from '@react-navigation/native';

const Translator = () => {
  const DEEPL_API_KEY = "5ad7f451-71f6-4fdd-af40-fa9d235068d3:fx"
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLang, setSourceLang] = useState('EN');
  const [targetLang, setTargetLang] = useState('ES');
  const [darkMode, setDarkMode] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchDarkMode = async () => {
        const isDarkMode = await getDarkMode();
        setDarkMode(isDarkMode);
      };
      fetchDarkMode();
    }, [])
  );

  const languages = [
    { label: 'Bulgarian', value: 'BG' },
    { label: 'Chinese (Simplified)', value: 'ZH' },
    { label: 'Czech', value: 'CS' },
    { label: 'Danish', value: 'DA' },
    { label: 'Dutch', value: 'NL' },
    { label: 'English', value: 'EN' },
    { label: 'Estonian', value: 'ET' },
    { label: 'Finnish', value: 'FI' },
    { label: 'French', value: 'FR' },
    { label: 'German', value: 'DE' },
    { label: 'Greek', value: 'EL' },
    { label: 'Hungarian', value: 'HU' },
    { label: 'Indonesian', value: 'ID' },
    { label: 'Italian', value: 'IT' },
    { label: 'Japanese', value: 'JA' },
    { label: 'Korean', value: 'KO' },
    { label: 'Latvian', value: 'LV' },
    { label: 'Lithuanian', value: 'LT' },
    { label: 'Norwegian (Bokmål)', value: 'NB' },
    { label: 'Polish', value: 'PL' },
    { label: 'Portuguese', value: 'PT' },
    { label: 'Romanian', value: 'RO' },
    { label: 'Russian', value: 'RU' },
    { label: 'Slovak', value: 'SK' },
    { label: 'Slovenian', value: 'SL' },
    { label: 'Spanish', value: 'ES' },
    { label: 'Swedish', value: 'SV' },
    { label: 'Turkish', value: 'TR' },
    { label: 'Ukrainian', value: 'UK' }
  ];

  const ChangeLanguage = () => {
    setTargetLang(sourceLang);
    setSourceLang(targetLang);
  };

  const handleTranslate = async () => {
    if (text.trim() === '') {
      Alert.alert('Error', i18n.t('youhavetoputsomewordtranslate'));
      return;
    }

    setIsLoading(true);
    setTranslatedText('');

    try {
      const response = await axios.post('https://api-free.deepl.com/v2/translate', null, {
        params: {
          auth_key: DEEPL_API_KEY,
          text: text,
          target_lang: targetLang,
          source_lang: sourceLang,
        },
      });

      if (response.data && response.data.translations.length > 0) {
        setTranslatedText(response.data.translations[0].text);
      } else {
        setTranslatedText(i18n.t('notranslationfound'));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', i18n.t('thereisanerrorduringtranslation'));
    } finally {
      setIsLoading(false);
    }
  };

  const dynamicStyles = darkMode ? darkStyles : lightStyles;

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.header}>{i18n.t('translator')}</Text>
      <View style={dynamicStyles.languageSelector}>
        <Picker 
          selectedValue={sourceLang} 
          style={dynamicStyles.picker} 
          dropdownIconColor={darkMode ? '#ffffff' : '#00796b'} 
          onValueChange={(itemValue) => setSourceLang(itemValue)}
        >
          {languages.map((lang) => (
            <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
          ))}
        </Picker>
        <TouchableOpacity onPress={ChangeLanguage}>
          <FontAwesome name="exchange" size={24} color={darkMode ? '#ffffff' : '#00796b'} />
        </TouchableOpacity>
        <Picker 
          selectedValue={targetLang} 
          style={dynamicStyles.picker} 
          dropdownIconColor={darkMode ? '#ffffff' : '#00796b'} 
          onValueChange={(itemValue) => setTargetLang(itemValue)}
        >
          {languages.map((lang) => (
            <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
          ))}
        </Picker>
      </View>
      <TextInput 
        style={dynamicStyles.input} 
        multiline 
        value={text} 
        onChangeText={setText} 
        placeholderTextColor={darkMode ? '#888888' : '#666666'}
      />
      <TouchableOpacity style={dynamicStyles.button} onPress={handleTranslate} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={dynamicStyles.buttonText}>{i18n.t('translate')}</Text>
        )}
      </TouchableOpacity>
      <ScrollView style={dynamicStyles.resultContainer}>
        <Text style={dynamicStyles.resultLabel}>{i18n.t('translation')}:</Text>
        <Text style={dynamicStyles.resultText}>{translatedText}</Text>
      </ScrollView>
    </View>
  );
};

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7fa',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  picker: {
    height: 50,
    width: 137,
  },
  input: {
    height: 100,
    borderColor: '#004d40',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#00796b',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#333333',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  picker: {
    height: 50,
    width: 137,
    color: 'white'
  },
  input: {
    height: 100,
    borderColor: '#444444',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#333333',
    marginBottom: 20,
    textAlignVertical: 'top',
    color: 'white'
  },
  button: {
    backgroundColor: '#444444',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gray',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#ffffff',
  },
});

export default Translator;