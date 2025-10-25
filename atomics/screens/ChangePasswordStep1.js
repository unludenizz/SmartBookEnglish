import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import CustomAlert from '../alert/CustomAlert';
import i18n from '../utils/I18n';
import { ResetPassword } from '../api/GlobalFunctions';

const ChangePasswordScreen = ({ navigation }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: '',
    buttonText: '',
  });

  useEffect(() => {
    loadDarkModePreference();
  }, []);

  const _ResetPassword = async(newPassword, resetCode) => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      const response = await ResetPassword(userId,"", newPassword, resetCode);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  const loadDarkModePreference = async () => {
    try {
      setAlertConfig({
        isVisible: true,
        title: i18n.t('success'),
        message: i18n.t('thepasswordresetlink'),
        type: 'success',
        buttonText: i18n.t('ok'),
      });

      const darkMode = await SecureStore.getItemAsync('darkMode');
      if (darkMode !== null) {
        setIsDarkMode(JSON.parse(darkMode));
      }
    } catch (error) {
      console.error('Darkmode error for getting', error);
    }
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,])[A-Za-z\d!@#$%^&*.,]{6,20}$/;
    return passwordRegex.test(password);
  };

  const handleChangePassword = async () => {
    if (!verificationCode) {
      setAlertConfig({
        isVisible: true,
        title: i18n.t('error'),
        message: i18n.t('pleaseenterverificationcode'),
        type: 'error',
        buttonText: i18n.t('ok'),
      });
      return;
    }

    if (!validatePassword(newPassword)) {
      setAlertConfig({
        isVisible: true,
        title: i18n.t('error'),
        message: i18n.t('passwordmustbesixtwenty'),
        type: 'error',
        buttonText: i18n.t('ok'),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertConfig({
        isVisible: true,
        title: i18n.t('error'),
        message: i18n.t('passwordsdonotmatch'),
        type: 'error',
        buttonText: i18n.t('ok'),
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await _ResetPassword(newPassword, verificationCode);
      
      if (response && response[0]?.result==1) {
        setAlertConfig({
          isVisible: true,
          title: i18n.t('success'),
          message: i18n.t('passwordchangesuccessful'),
          type: 'success',
          buttonText: i18n.t('ok'),
        });
        setVerificationCode('');
        setNewPassword('');
        setConfirmPassword('');
        navigation.goBack();
      } else {
        setAlertConfig({
          isVisible: true,
          title: i18n.t('error'),
          message: response?.message || i18n.t('somethingwentwrong'),
          type: 'error',
          buttonText: i18n.t('ok'),
        });
      }
    } catch (error) {
      setAlertConfig({
        isVisible: true,
        title: i18n.t('error'),
        message: i18n.t('somethingwentwrong'),
        type: 'error',
        buttonText: i18n.t('ok'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isVisible: false }));
  };

  const getStyles = (darkMode) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: darkMode ? '#121212' : '#F5F6F8',
      padding: 20,
    },
    backButton: {
      position: 'absolute',
      top: 40,
      left: 20,
      zIndex: 1,
      padding: 8,
      borderRadius: 20,
      backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF',
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    formContainer: {
      backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF',
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: darkMode ? '#FFFFFF' : '#333',
      marginVertical: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: darkMode ? '#2C2C2C' : '#F5F6F8',
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 15,
      width: '100%',
    },
    inputIcon: {
      marginRight: 10,
      color: darkMode ? '#B0B0B0' : '#666',
    },
    input: {
      flex: 1,
      height: 50,
      fontSize: 16,
      color: darkMode ? '#FFFFFF' : '#333',
    },
    requirements: {
      fontSize: 12,
      color: darkMode ? '#808080' : '#666',
      textAlign: 'left',
      width: '100%',
      marginBottom: 20,
    },
    button: {
      backgroundColor: '#4A90E2',
      borderRadius: 10,
      paddingVertical: 15,
      width: '100%',
      alignItems: 'center',
    },
    buttonDisabled: {
      backgroundColor: darkMode ? '#2A5280' : '#A5C9F2',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  const styles = getStyles(isDarkMode);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather 
          name="arrow-left"
          size={24}
          color={isDarkMode ? '#FFFFFF' : '#333'}
        />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.formContainer}>
          <Feather 
            name="lock" 
            size={60} 
            color="#4A90E2" 
          />
          
          <Text style={styles.title}>{i18n.t('resetpassword')}</Text>

          <View style={styles.inputContainer}>
            <Feather 
              name="key" 
              size={20} 
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={i18n.t('enterverificationcode')}
              placeholderTextColor={isDarkMode ? '#808080' : '#666'}
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather 
              name="lock" 
              size={20} 
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={i18n.t('enternewpassword')}
              placeholderTextColor={isDarkMode ? '#808080' : '#666'}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather 
              name="lock" 
              size={20} 
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={i18n.t('confirmnewpassword')}
              placeholderTextColor={isDarkMode ? '#808080' : '#666'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <Text style={styles.requirements}>
            {i18n.t('passwordmustcontain')}:
            {'\n'}- {i18n.t('minimumcharacters')} (6)
            {'\n'}- {i18n.t('oneuppercaseletter')}
            {'\n'}- {i18n.t('onespecialcharacter')}
          </Text>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? i18n.t('changing') : i18n.t('changepassword')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomAlert
        isVisible={alertConfig.isVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonText={alertConfig.buttonText}
        onClose={closeAlert}
      />
    </View>
  );
};

export default ChangePasswordScreen;
