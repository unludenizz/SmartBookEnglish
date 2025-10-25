import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { deleteToken, getDarkMode, getNativeLanguage, getToken, saveDarkMode } from '../../securestore/ExpoSecureStore';
import i18n from '../utils/I18n';
import { useFocusEffect } from '@react-navigation/native';
import { DeleteAccount } from '../api/GlobalFunctions';

const Settings = ({ navigation }) => {
  const [userName, setUserName] = useState("User");
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useFocusEffect(
    React.useCallback(() => {
      const initializeScreen = async () => {
        loadUserSettings()
      };
      initializeScreen();
    }, [])
  );
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const valueOfMode = await getDarkMode()
      setDarkMode(valueOfMode)
      const authInfo = await getToken();
      if (authInfo?.username) {
        setUserName(authInfo.username);
      }
      const language = await getNativeLanguage();
      if (language) {
        setSelectedLanguage(language);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setIsLoading(false);
    }
  };

  const handleLanguageChange = () => {
    navigation.navigate('LanguageSelection');
  };

  const handleLogout = async () => {
    try {
      await deleteToken();
      navigation.replace('LoginPage');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleMyBooks = () => {
    navigation.navigate('MyBooks');
  };
  const _DeleteAccount = async(username) => {
    try {
      const response = await DeleteAccount(username)
      if(response.result==1){
        await deleteToken();
        navigation.replace('LoginPage');
      }
    } catch (error) {
      console.error(error)
    }
  }
  const ChangeMode = async () => {
    try {
      const newMode = !darkMode;
      const saveResult = await saveDarkMode(newMode);
      
      if (saveResult) {
        setDarkMode(newMode);
      } else {
        console.log('Failed to save dark mode');
      }
    } catch (error) {
      console.error('Error in ChangeMode:', error);
    }
  };

  const SettingItem = ({ icon, title, onPress, value, isSwitch, test }) => (
    <>
      {isSwitch ? (
        <View style={[styles.settingItem, { backgroundColor: darkMode ? '#333' : '#fff' }]}>
          <View style={styles.settingItemLeft}>
            <MaterialIcons name={icon} size={24} color={darkMode ? '#fff' : '#555'} />
            <Text style={[styles.settingItemText, { color: darkMode ? '#fff' : '#333' }]}>{title}</Text>
          </View>
          <Switch
            value={value}
            onValueChange={onPress}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={value ? 'black' : "#f4f3f4"}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: darkMode ? '#333' : '#fff' }]}
          onPress={onPress}
        >
          <View style={styles.settingItemLeft}>
            <MaterialIcons name={icon} size={24} color={darkMode ? '#fff' : '#555'} />
            <Text style={[styles.settingItemText, { color: darkMode ? '#fff' : '#333' }]}>{title}</Text>
          </View>
          {test?null:<MaterialIcons name="chevron-right" size={24} color={darkMode ? '#fff' : '#555'} />}
        </TouchableOpacity>
      )}
    </>
  );
  

  return (
    <ScrollView style={[styles.container, { backgroundColor: darkMode ? '#121212' : '#f5f5f5' }]}>
      {isLoading ? (
        <View style={[styles.loadingContainer, { backgroundColor: darkMode ? '#121212' : '#f5f5f5' }]}>
          <ActivityIndicator size="large" color={darkMode ? '#fff' : '#333'} />
        </View>
      ) : (
        <>
          <LinearGradient colors={darkMode ? ['#333', '#555'] : ['#6200ee', '#9c27b0']} style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{userName[0]?.toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.settingsContainer}>
            <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#333' }]}>{i18n.t('accountsettings')}</Text>
            <SettingItem icon="delete" title={i18n.t('deleteaccount')} onPress={() => _DeleteAccount(userName)} test={true}/>
            <SettingItem icon="lock" title={i18n.t('changepassword')} onPress={handleChangePassword} />
            <SettingItem icon="language" title={i18n.t('changelanguage')} onPress={handleLanguageChange} />

            {/*
            <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#333' }]}>{i18n.t('appsettings')}</Text>
            <SettingItem icon="brightness-6" title={i18n.t('darkmode')} onPress={() => ChangeMode()} value={darkMode} isSwitch={true}/>*/}

            <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#333' }]}>{i18n.t('content')}</Text>
            <SettingItem icon="book" title={i18n.t('mybooks')} onPress={handleMyBooks} />
            <SettingItem icon="favorite" title={i18n.t('myfavorites')} onPress={() => navigation.navigate('Favorites')} />

            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: darkMode ? '#555' : '#e53935' }]} onPress={handleLogout}>
              <MaterialIcons name="logout" size={24} color="#fff" />
              <Text style={styles.logoutText}>{i18n.t('logout')}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: darkMode ? '#888' : '#666' }]}>Smart Book English</Text>
              <Text style={[styles.versionText, { color: darkMode ? '#aaa' : '#888' }]}>{i18n.t('version')} 1.0.0</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
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
    marginTop:300,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    marginLeft: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 14,
  },
});

export default Settings;
