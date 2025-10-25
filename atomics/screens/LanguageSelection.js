import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { saveNativeLanguage, getDarkMode } from '../../securestore/ExpoSecureStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import i18n from '../utils/I18n';

const LanguageSelection = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [animation] = useState(new Animated.Value(0));
  const [darkMode, setDarkMode] = useState(false);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', icon: '🇬🇧' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', icon: '🇹🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', icon: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', icon: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', icon: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', icon: '🇮🇹' },
  ];

  React.useEffect(() => {
    Animated.spring(animation, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();

    getDarkModeFromSecureStore();
  }, []);

  const getDarkModeFromSecureStore = async () => {
    try {
      const darkModeValue = await getDarkMode();
      setDarkMode(darkModeValue);
    } catch (error) {
      console.error('Error getting dark mode from Secure Store:', error);
      setDarkMode(false);
    }
  };

  const handleLanguageSelect = async (language) => {
    setSelectedLanguage(language);
    try {
      await saveNativeLanguage(language.code);
      i18n.locale = language.code;
      Animated.timing(animation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        navigation.goBack();
      });
    } catch (error) {
      console.error('Language selection error:', error);
    }
  };

  const animatedStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [500, 0],
        }),
      },
    ],
    opacity: animation,
  };

  return (
    <LinearGradient
      colors={darkMode ? ['#333', '#555'] : ['#4158D0', '#C850C0', '#FFCC70']}
      style={[styles.container, { backgroundColor: darkMode ? '#121212' : undefined }]}
    >
      <Animated.View style={[styles.contentContainer, animatedStyle, { backgroundColor: darkMode ? '#333' : 'rgba(255, 255, 255, 0.95)' }]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.welcomeText, { color: darkMode ? '#aaa' : '#666' }]}>{i18n.t('welcome')}</Text>
          <Text style={[styles.appTitle, { color: darkMode ? '#fff' : '#333' }]}>Smart Book English</Text>
          <Text style={[styles.subtitle, { color: darkMode ? '#ccc' : '#666' }]}>{i18n.t('chooseyournativelanguage')}</Text>
        </View>

        <ScrollView style={styles.languageContainer}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageButton,
                selectedLanguage?.code === language.code && styles.selectedLanguage,
                { backgroundColor: darkMode ? '#444' : 'white' },
              ]}
              onPress={() => handleLanguageSelect(language)}
            >
              <Text style={[styles.languageIcon, { color: darkMode ? '#fff' : '#333' }]}>{language.icon}</Text>
              <View style={styles.languageTextContainer}>
                <Text style={[styles.languageName, { color: darkMode ? '#fff' : '#333' }]}>{language.nativeName}</Text>
                <Text style={[styles.languageNameEnglish, { color: darkMode ? '#ccc' : '#666' }]}>{language.name}</Text>
              </View>
              {selectedLanguage?.code === language.code && (
                <MaterialIcons name="check-circle" size={24} color={darkMode ? '#81b0ff' : '#4CAF50'} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: darkMode ? '#aaa' : '#666' }]}>
            {i18n.t('youcanchangethelanguagelaterinsettings')}
          </Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    paddingTop: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  languageContainer: {
    paddingHorizontal: 20,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginVertical: 8,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedLanguage: {
    borderColor: '#4158D0',
    borderWidth: 2,
  },
  languageIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  languageNameEnglish: {
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});

export default LanguageSelection;