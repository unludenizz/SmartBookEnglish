import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import CustomAlert from "../alert/CustomAlert";
import { Register } from "../api/GlobalFunctions";
import i18n from "../utils/I18n";
import { getDarkMode } from "../../securestore/ExpoSecureStore"; 
import { useFocusEffect } from "@react-navigation/native";

const SignUpPage = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [visiblePass, setVisiblePass] = useState(false);
  const [visiblePassRepeat, setVisiblePassRepeat] = useState(false);
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

  const _Register = async () => {
    try {
      const response = await Register(username, email, password);
      
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const showSuccessAlert = () => {
    setAlertType("success");
    setModalVisible(true);
  };

  const showErrorAlert = () => {
    setAlertType("error");
    setModalVisible(true);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[a-z0-9]+$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,])[A-Za-z\d!@#$%^&*.,]{6,20}$/;
    return passwordRegex.test(password);
  };

  const VisiblePass = () => {
    setVisiblePass(!visiblePass);
  };

  const VisiblePassRepeat = () => {
    setVisiblePassRepeat(!visiblePassRepeat);
  };

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setAlertMessage(i18n.t("pleasefillinallfields"));
      showErrorAlert();
      return;
    }
    if (!validateUsername(username)) {
      setAlertMessage(i18n.t("usernamemustcontainonlylowercase"));
      showErrorAlert();
      return;
    }
    if (!validateEmail(email)) {
      setAlertMessage(i18n.t("invalidemail"));
      showErrorAlert();
      return;
    }

    if (password !== confirmPassword) {
      setAlertMessage(i18n.t("passwordsdontmatch"));
      showErrorAlert();
      return;
    }
    if (!validatePassword(password)) {
      setAlertMessage(i18n.t("passwordmustbesixtwenty"));
      showErrorAlert();
      return;
    }

    let response = await _Register();
    console.log(response=="E-posta zaten kullanılıyor.")
    if (response[0].result === 0) {
      setAlertMessage(response[1].error);
      showErrorAlert();
    }
    else if(response == "E-posta zaten kullanılıyor."){
      setAlertMessage(i18n.t('emailisalreadyinuse'));
      showErrorAlert();
    }
    else if(response == "Kullanıcı adı zaten kullanılıyor."){
      setAlertMessage(i18n.t('usernameisalreadyinuse'));
      showErrorAlert();
    }
    else {
      setAlertMessage(i18n.t("registersuccessful"));
      showSuccessAlert();
      navigation.navigate("LoginPage");
    }
  };

  return (
    <View style={[styles.container, darkMode ? styles.darkContainer : null]}>
      <TouchableOpacity
        style={styles.backbutton}
        onPress={() => navigation.navigate("AuthenticationPage")}
      >
        <Ionicons name="chevron-back" size={32} color="gray" />
      </TouchableOpacity>
      <Text style={[styles.title, darkMode ? styles.darkText : null]}>
        {i18n.t("signup")}
      </Text>
      <TextInput
        placeholder={i18n.t("username")}
        value={username}
        onChangeText={setUsername}
        placeholderTextColor={!darkMode ? "gray":"gray"}
        style={[styles.input, darkMode ? styles.darkInput : null]}
      />
      <TextInput
        placeholder={i18n.t("email")}
        placeholderTextColor={!darkMode ? "gray":"gray"}
        value={email}
        onChangeText={setEmail}
        style={[styles.input, darkMode ? styles.darkInput : null]}
      />
      <View style={[styles.inputContainer, { backgroundColor: darkMode ? "#333333":"white",borderColor: darkMode ? "#333333":"#FFFFFF", }]}>
        <TextInput
          placeholder={i18n.t("password")}
          placeholderTextColor={!darkMode ? "gray":"gray"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!visiblePass}
          style={[styles.passInput, darkMode ? styles.darkInput : null]}
        />
        <TouchableOpacity onPress={() => VisiblePass()}>
          <Ionicons
            style={styles.showpassicon}
            name={visiblePass == false ? "eye-off" : "eye"}
            size={28}
            color="gray"
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.inputContainer, { backgroundColor: darkMode ? "#333333":"white",borderColor: darkMode ? "#333333":"#FFFFFF", }]}>
        <TextInput
          placeholder={i18n.t("confirmpassword")}
          placeholderTextColor={!darkMode ? "gray":"gray"}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!visiblePassRepeat}
          style={[styles.passInput, darkMode ? styles.darkInput : null]}
        />
        <TouchableOpacity onPress={() => VisiblePassRepeat()}>
          <Ionicons
            style={styles.showpassicon}
            name={visiblePassRepeat == false ? "eye-off" : "eye"}
            size={28}
            color="gray"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.buttonText}>{i18n.t("signup")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => navigation.navigate("LoginPage")}
      >
        <Text style={styles.toggleText}>{i18n.t("alreadyhaveanaccount")}</Text>
      </TouchableOpacity>
      <CustomAlert
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        title={alertType === "success" ? i18n.t("registersuccessful") : i18n.t("registerfailed")}
        message={alertMessage}
        buttonText={alertType === "success" ? "Proceed" : "Retry"}
        type={alertType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#FFABAB",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 36,
    textAlign: "center",
    marginBottom: 40,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  darkText: {
    color: "#DDD",
  },
  input: {
    height: 50,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
  },
  passInput: {
    height: 48,
    width:310,
    marginBottom: 16,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },
  darkInput: {
    backgroundColor: "#333333",
    color: "#DDD",
    borderColor: "#444",
  },
  inputContainer: {
    height: 52,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signUpButton: {
    backgroundColor: "#FF6F61",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  toggleButton: {
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  backbutton: {
    width: 40,
  },
  showpassicon: {
    paddingTop: 10,
  },
});

export default SignUpPage;