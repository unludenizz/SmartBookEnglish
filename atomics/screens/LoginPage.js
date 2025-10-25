import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import CustomAlert from '../alert/CustomAlert';
import { LoginTime } from '../api/GlobalFunctions';
import { getDarkMode, saveToken } from '../../securestore/ExpoSecureStore';
import i18n from '../utils/I18n';
import { useFocusEffect } from '@react-navigation/native';

const LoginPage = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [visiblePass, setVisiblePass] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [message, setMessage] = useState('');
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

  const _LoginTime = async() => {
    try {
      const response = await LoginTime(username,password);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const VisiblePass = () => {
    setVisiblePass(!visiblePass);
  };

  const showErrorAlert = () => {
    setAlertType('error');
    setUsername('');
    setPassword('');
    setModalVisible(true);
  };

  const handleLogin = async() => {
    if (!username || !password) {
      setUsername('');
      setPassword('');
      setVisiblePass(false);
      setMessage(i18n.t('pleasefillinallfields'));
      showErrorAlert();
      return;
    }
    
    const value = await _LoginTime();
    if(value[0].result==1){
      let userInfos = value[0]?.existingUser;
      await saveToken(username,userInfos._id);
      setUsername('');
      setPassword('');
      navigation.replace('MainApp');
    }else{
      setUsername('');
      setPassword('');
      setMessage(i18n.t('incorrectusernameorpassword'));
      showErrorAlert();
    }
  };

  const dynamicStyles = {
    container: {
      ...styles.container,
      backgroundColor: darkMode ? '#1a1a1a' : '#FFABAB',
    },
    input: {
      ...styles.input,
      backgroundColor: darkMode ? '#333333' : '#FFFFFF',
      borderColor: darkMode ? '#444444' : '#FFFFFF',
      color: darkMode ? '#FFFFFF' : '#000000',
    },
    inputContainer: {
      ...styles.inputcontainer,
      backgroundColor: darkMode ? '#333333' : '#FFFFFF',
      borderColor: darkMode ? '#444444' : '#FFFFFF',
    },
    title: {
      ...styles.title,
      color: darkMode ? '#E0E0E0' : '#FFFFFF',
    },
    loginButton: {
      ...styles.loginButton,
      backgroundColor: darkMode ? '#FF4B39' : '#FF6F61',
    },
    toggleText: {
      ...styles.toggleText,
      color: darkMode ? '#E0E0E0' : '#FFFFFF',
    },
    icon: {
      color: darkMode ? '#E0E0E0' : 'white',
    },
    showPassIcon: {
      color: darkMode ? '#E0E0E0' : 'gray',
    },
  };

  return (
    <View style={dynamicStyles.container}>
      <TouchableOpacity 
        style={styles.backbutton} 
        onPress={() => navigation.navigate('AuthenticationPage')}
      >
        <Ionicons 
          name='chevron-back' 
          size={32} 
          color={dynamicStyles.icon.color}
        />
      </TouchableOpacity>
      
      <Text style={dynamicStyles.title}>{i18n.t('login')}</Text>
      
      <TextInput
        placeholder={i18n.t('username')}
        value={username}
        onChangeText={setUsername}
        style={dynamicStyles.input}
        placeholderTextColor={darkMode ? '#808080' : '#666666'}
      />
      
      <View style={dynamicStyles.inputContainer}>
        <TextInput
          placeholder={i18n.t('password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!visiblePass}
          style={[dynamicStyles.input, { flex: 1, marginBottom: 0 }]}
          placeholderTextColor={darkMode ? '#808080' : '#666666'}
        />
        <TouchableOpacity onPress={VisiblePass}>
          <Ionicons
            style={styles.showpassicon}
            name={visiblePass ? "eye" : "eye-off"}
            size={28}
            color={dynamicStyles.showPassIcon.color}
          />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={dynamicStyles.loginButton} 
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>{i18n.t('login')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={() => navigation.navigate('SignUpPage')}
      >
        <Text style={dynamicStyles.toggleText}>
          {i18n.t('donthaveanaccountsignup')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={() => navigation.navigate('changingPassword')}
      >
        <Text style={dynamicStyles.toggleText}>
          {i18n.t('forgotyourpassword')}
        </Text>
      </TouchableOpacity>
      
      <CustomAlert
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title={alertType === 'success' ? i18n.t('loginsuccessful') : 'Login Failed'}
        message={message}
        buttonText={alertType === 'success' ? i18n.t('Proceed') : i18n.t('retry')}
        type={alertType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  inputcontainer: {
    height: 52,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loginButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleText: {
    fontSize: 16,
  },
  backbutton: {
    width: 40,
  },
  showpassicon: {
    paddingTop: 10,
    paddingRight: 10,
  },
});

export default LoginPage;
