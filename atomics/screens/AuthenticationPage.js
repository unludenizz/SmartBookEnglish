import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  getDarkMode,
  getNativeLanguage,
  getToken,
} from "../../securestore/ExpoSecureStore";
import i18n from "../utils/I18n";
import { useFocusEffect } from "@react-navigation/native";
import { openDatabase, createTables } from "../../src/SQLiteService";

export default function AuthScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [locale, setLocale] = useState("en");
  const initializeDatabase = async () => {
    try {
      const db = await openDatabase();
      await createTables(db);
      return db;
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchDarkMode = async () => {
        const isDarkMode = await getDarkMode();
        setDarkMode(isDarkMode);
      };

      fetchDarkMode();

      const fetchNativeLanguage = async () => {
        try {
          const nativeLanguage = await getNativeLanguage();
          console.log("Native Language:", nativeLanguage);
          if (nativeLanguage) {
            i18n.locale = nativeLanguage;
            setLocale(nativeLanguage);
          } else {
            i18n.locale = "en";
            setLocale("en");
          }
        } catch (error) {
          console.error("Error fetching native language:", error);
        }
      };

      fetchNativeLanguage();
    }, [])
  );

  const _isAuth = async () => {
    try {
      const authInfo = await getToken();
      if (authInfo?.token && authInfo?.username) {
        navigation.replace("MainApp");
        return;
      }

      const nativeLanguage = await getNativeLanguage();
      if (!nativeLanguage) {
        navigation.navigate("LanguageSelection");
      } else {
        i18n.locale = nativeLanguage;
        setLocale(nativeLanguage);
      }
    } catch (error) {
      console.error("Authentication Error:", error);
    }
  };

  useEffect(() => {
    _isAuth();
  }, []);

  const dynamicStyles = {
    container: {
      ...styles.container,
      backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
    },
    gradient: {
      ...styles.gradient,
    },
    title: {
      ...styles.title,
      color: darkMode ? "#E0E0E0" : "#fff",
    },
    button: {
      ...styles.button,
      backgroundColor: darkMode ? "#333333" : "#fff",
      shadowColor: darkMode ? "#000" : "#000",
      shadowOpacity: darkMode ? 0.2 : 0.1,
    },
    buttonText: {
      ...styles.buttonText,
      color: darkMode ? "#E0E0E0" : "#333",
    },
    googleButton: {
      ...styles.googleButton,
      backgroundColor: darkMode ? "#C93325" : "#EA4335",
    },
    googleButtonText: {
      ...styles.googleButtonText,
      color: darkMode ? "#E0E0E0" : "#fff",
    },
  };

  return (
    <View style={dynamicStyles.container}>
      <LinearGradient
        colors={darkMode ? ["#2d3436", "#636e72"] : ["#ffecd2", "#fcb69f"]}
        style={dynamicStyles.gradient}
      >
        <Text style={dynamicStyles.title}>Smart Book English</Text>
        <View>
    </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("LoginPage")}
          style={dynamicStyles.button}
        >
          <Text style={dynamicStyles.buttonText}>{i18n.t("login")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("SignUpPage")}
          style={dynamicStyles.button}
        >
          <Text style={dynamicStyles.buttonText}>{i18n.t("signin")}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 60,
    marginVertical: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 60,
    marginTop: 20,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
