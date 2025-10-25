import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';
import CustomAlert from '../alert/CustomAlert';
import i18n from '../utils/I18n';
import { ChangePassword, ForgotYourPass } from '../api/GlobalFunctions';
const ChangePasswordScreen = ({navigation}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userId,setUserId] = useState('')
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'success',
    buttonText: i18n.t('Ok')
  });

  useEffect(() => {
    checkDarkMode();
  }, []);

  const _ChangePassword = async() => {
    try {
      const response = await ChangePassword(userId,currentPassword,newPassword)
      return response;
    } catch (error) {
      console.error(error)
    }
  }
  const _ForgotYourPass = async(userId) => {
    try {
      const response = await ForgotYourPass(userId,"")
      return response
    } catch (error) {
      console.error(error)
    }
  }
  const checkDarkMode = async () => {
    try {
      const darkMode = await SecureStore.getItemAsync('darkMode');
      const token = await SecureStore.getItemAsync('userId');
      setUserId(token)
      if (darkMode === null) {
        setIsDarkMode(false);
      } else {
        setIsDarkMode(JSON.parse(darkMode));
      }
    } catch (error) {
      console.error('Darkmode error for getting', error);
      setIsDarkMode(false);
    }
  };

  const showAlert = (title, message, type = 'success') => {
    setAlertConfig({
      title,
      message,
      type,
      buttonText: i18n.t('ok')
    });
    setAlertVisible(true);
  };
  const handleChangePassword = async() => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert(i18n.t('error'), i18n.t('pleasefillinallfields'), 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert(i18n.t('error'), i18n.t('passwordsdontmatch'), 'error');
      return;
    }

    if (newPassword.length < 6) {
      showAlert(i18n.t('error'), i18n.t('passwordmustbesixtwenty'), 'error');
      return;
    }
    const response = await _ChangePassword()
    if(response[0]?.result == 1){
      showAlert(i18n.t('success'), i18n.t('yourpasswordischanged'), 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }else{
      showAlert(i18n.t('error'), i18n.t('notyourpasswordischanged'), 'error');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleForgotPassword = async() => {
    const userId = await SecureStore.getItemAsync('userId');

    const response = await _ForgotYourPass(userId)
    if(response[0]?.result == 1){
      navigation.navigate('ChangePasswordStep1')
    }else{

    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#fff',
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
      marginTop: 20,
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
      marginTop: 10,
    },
    form: {
      marginBottom: 20,
    },
    inputContainer: {
      marginBottom: 20,
      position: 'relative',
    },
    input: {
      borderWidth: 1,
      borderColor: isDarkMode ? '#333' : '#ddd',
      borderRadius: 8,
      padding: 15,
      fontSize: 16,
      backgroundColor: isDarkMode ? '#333' : '#f8f9fa',
      color: isDarkMode ? '#fff' : '#000',
    },
    eyeIcon: {
      position: 'absolute',
      right: 12,
      top: 12,
      padding: 5,
    },
    button: {
      backgroundColor: '#6200ee',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    infoText: {
      color: isDarkMode ? '#aaa' : '#666',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 10,
    },
    forgotPasswordContainer: {
      alignItems: 'center',
      marginTop: 20,
    },
    forgotPasswordText: {
      color: '#6200ee',
      fontSize: 14,
      textDecorationLine: 'underline',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="lock" size={40} color="#6200ee" />
        <Text style={styles.headerText}>{i18n.t('changepassword')}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('currentpassword')}
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            secureTextEntry={!showCurrentPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
          >
            <Icon
              name={showCurrentPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color={isDarkMode ? '#888' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('newpassword')}
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Icon
              name={showNewPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color={isDarkMode ? '#888' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={i18n.t('newpasswordagain')}
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Icon
              name={showConfirmPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color={isDarkMode ? '#888' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleChangePassword}
        >
          <Text style={styles.buttonText}>{i18n.t('changepassword')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.infoText}>
        * {i18n.t('passwordmustbesixtwenty')}.
      </Text>

      <TouchableOpacity
        onPress={handleForgotPassword}
        style={styles.forgotPasswordContainer}
      >
        <Text style={styles.forgotPasswordText}>
          {i18n.t('forgotyourpassword')}
        </Text>
      </TouchableOpacity>

      <CustomAlert
        isVisible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        type={alertConfig.type}
      />
    </View>
  );
};

export default ChangePasswordScreen;
