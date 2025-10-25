import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";
import { View, Image, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import BookListScreen from "./atomics/screens/BookListScreen";
import BookDetailScreen from "./atomics/screens/BookDetailScreen";
import BookFavorites from "./atomics/screens/BookFavorites";
import Dictionary from "./atomics/screens/Dictionary";
import Translator from "./atomics/screens/Translator";
import CardGame from "./atomics/screens/CardGame";
import Settings from "./atomics/screens/Settings";
import AuthenticationPage from "./atomics/screens/AuthenticationPage";
import LoginPage from "./atomics/screens/LoginPage";
import Signup from "./atomics/screens/Signup";
import AddBookScreen from "./atomics/screens/AddBookScreen";
import BookUserViewerScreen from "./atomics/screens/BookUserViewerScreen";
import MyBooks from "./atomics/screens/MyBooks";
import LanguageSelection from "./atomics/screens/LanguageSelection";
import ChangePasswordScreen from "./atomics/screens/ChangePasswordScreen";
import ChangingPassword from "./atomics/screens/changingPassword";
import ChangePasswordStep1 from "./atomics/screens/ChangePasswordStep1";
import i18n from "./atomics/utils/I18n";

SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BookStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BookList"
        component={BookListScreen}
        options={{ title: i18n.t("listofbooks"), headerShown: false }}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ title: i18n.t("bookdetail"), headerShown: false }}
      />
      <Stack.Screen
        name="BookUserViewer"
        component={BookUserViewerScreen}
        options={{ title: i18n.t("bookuserviewer"), headerShown: false }}
      />
      <Stack.Screen
        name="BookFavorites"
        component={BookFavorites}
        options={{ title: i18n.t("myfavorites"), headerShown: false }}
      />
      <Stack.Screen
        name="AddBook"
        component={AddBookScreen}
        options={{ title: i18n.t("addyourbook"), headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: i18n.t("changeyourpassword"), headerShown: false }}
      />
      <Stack.Screen
        name="ChangePasswordStep1"
        component={ChangePasswordStep1}
        options={{
          title: i18n.t("changepasswordstep1"),
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

function Setting() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Setting"
        component={Settings}
        options={{ title: i18n.t("settings"), headerShown: false }}
      />
      <Stack.Screen
        name="MyBooks"
        component={MyBooks}
        options={{ title: i18n.t("mybooks"), headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Dictionary") {
            iconName = "book";
          } else if (route.name === "Card Game") {
            iconName = "gamepad";
          } else if (route.name === "Translator") {
            iconName = "exchange";
          } else if (route.name === "Favorites") {
            iconName = "star";
          } else if (route.name === "Settings") {
            iconName = "cog";
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Home"
        component={BookStack}
        options={{ title: i18n.t("main"), headerShown: false }}
      />
      <Tab.Screen
        name="Dictionary"
        component={Dictionary}
        options={{ title: i18n.t("dictionary"), headerShown: false }}
      />
      <Tab.Screen
        name="Card Game"
        component={CardGame}
        options={{ title: i18n.t("cardgame"), headerShown: false }}
      />
      <Tab.Screen
        name="Translator"
        component={Translator}
        options={{ title: i18n.t("translator"), headerShown: false }}
      />
      <Tab.Screen
        name="Favorites"
        component={BookFavorites}
        options={{ title: i18n.t("favorites"), headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={Setting}
        options={{ title: i18n.t("settings"), headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));  
        setIsAppReady(true);
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require("./assets/icon.png")}
          style={styles.logo}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthenticationPage" component={AuthenticationPage} />
        <Stack.Screen name="LoginPage" component={LoginPage} />
        <Stack.Screen name="SignUpPage" component={Signup} />
        <Stack.Screen name="LanguageSelection" component={LanguageSelection} />
        <Stack.Screen name="changingPassword" component={ChangingPassword} />
        <Stack.Screen name="MainApp" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingLeft:20,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});

