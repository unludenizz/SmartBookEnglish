import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import CustomAlert from '../alert/CustomAlert';
import i18n from '../utils/I18n';
import { ResetPassword, ForgotYourPass } from '../api/GlobalFunctions';

const ChangingPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [step, setStep] = useState('email');
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

  const loadDarkModePreference = async () => {
    try {
      const darkMode = await SecureStore.getItemAsync('darkMode');
      if (darkMode !== null) {
        setIsDarkMode(JSON.parse(darkMode));
      }
    } catch (error) {
      console.error('Darkmode error for getting', error);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) 
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,])[A-Za-z\d!@#$%^&*.,]{6,20}$/;
    return passwordRegex.test(password);
  };

  const handleResetPassword = async () => {
    if (step === 'email') {
      if (!email) {
        setAlertConfig({
          isVisible: true,
          title: i18n.t('error'),
          message: i18n.t('pleaseenteryouremailaddress'),
          type: 'error',
          buttonText: i18n.t('ok'),
        });
        return;
      }

      if (!validateEmail(email)) {
        setAlertConfig({
          isVisible: true,
          title: i18n.t('error'),
          message: i18n.t('pleaseentervalidemailaddress'),
          type: 'error',
          buttonText: i18n.t('ok'),
        });
        return;
      }

      setIsLoading(true);
      const result = await ForgotYourPass("",email)
      if(result[0].result == 1){
        setIsLoading(false);
        setStep('verification');
      }else{
        setIsLoading(false);
        setAlertConfig({
          isVisible: true,
          title: i18n.t('error'),
          message: i18n.t('youremaildonthaveaccount'),
          type: 'error',
          buttonText: i18n.t('ok'),
        });
      }
    } else {
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
        const response = await ResetPassword("",email,newPassword, verificationCode);
        
        if (response && response[0]?.result === 1) {
          setAlertConfig({
            isVisible: true,
            title: i18n.t('success'),
            message: i18n.t('passwordchangesuccessful'),
            type: 'success',
            buttonText: i18n.t('ok'),
          });
          setEmail('');
          setVerificationCode('');
          setNewPassword('');
          setConfirmPassword('');
          setStep('email');
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
      shadowColor: darkMode ? '#000' : '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: darkMode ? 0.4 : 0.25,
      shadowRadius: 3.84,
      elevation: 5,
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
      shadowColor: darkMode ? '#000' : '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: darkMode ? 0.4 : 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: darkMode ? '#FFFFFF' : '#333',
      marginTop: 20,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: darkMode ? '#B0B0B0' : '#666',
      textAlign: 'center',
      marginBottom: 30,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: darkMode ? '#2C2C2C' : '#F5F6F8',
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 20,
      width: '100%',
      borderWidth: darkMode ? 1 : 0,
      borderColor: darkMode ? '#333' : 'transparent',
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
      paddingHorizontal: 30,
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
    helperText: {
      fontSize: 14,
      color: darkMode ? '#808080' : '#888',
      textAlign: 'center',
      marginTop: 20,
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
            color={isDarkMode ? '#4A90E2' : '#4A90E2'} 
          />
          
          <Text style={styles.title}>{i18n.t('passwordreset')}</Text>
          <Text style={styles.subtitle}>
            {step === 'email' 
              ? i18n.t('enteryouremailaddresstoresetyourpassword')
              : i18n.t('enterverificationcode')}
          </Text>

          {step === 'email' ? (
            <View style={styles.inputContainer}>
              <Feather 
                name="mail" 
                size={20} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={i18n.t('enteryouremailadress')}
                placeholderTextColor={isDarkMode ? '#808080' : '#666'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          ) : (
            <>
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
            </>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading 
                ? i18n.t('sending') 
                : step === 'email'
                  ? i18n.t('sendpasswordresetlink')
                  : i18n.t('changepassword')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            {step === 'email'
              ? i18n.t('passwordresetlinkwillbesentyour')
              : i18n.t('checkemailforverificationcode')}
          </Text>
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

export default ChangingPassword;