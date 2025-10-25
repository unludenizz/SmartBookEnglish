import * as SecureStore from 'expo-secure-store';

export const saveToken = async (username, userId) => {
  try {
    await SecureStore.setItemAsync('userName', username);
    await SecureStore.setItemAsync('userId', userId);
  } catch (error) {
    console.error('Token saklama hatası:', error);
  }
};

export const getToken = async () => {
  try {
    const username = await SecureStore.getItemAsync('userName');
    const token = await SecureStore.getItemAsync('userId');

    return { username, token };
  } catch (error) {
    console.error('Token alma hatası:', error);
    return null;
  }
};

export const deleteToken = async () => {
  try {
    await SecureStore.deleteItemAsync('userName');
    await SecureStore.deleteItemAsync('userToken');
  } catch (error) {
    console.error('Token silme hatası:', error);
  }
};

export const saveArrayToSecureStore = async (key, array) => {
  try {
    const jsonValue = JSON.stringify(array);
    await SecureStore.setItemAsync(key, jsonValue);
  } catch (error) {
    console.error('Dizi kaydedilemedi:', error);
  }
};

export const getArrayFromSecureStore = async (key) => {
  try {
    const jsonValue = await SecureStore.getItemAsync(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Dizi alınamadı:', error);
    return null;
  }
};

export const toggleBookInFavorites = async (book) => {
  let favorites = await getArrayFromSecureStore('favorites');

  if (!favorites) {
    favorites = [];
  }

  if (favorites.includes(book)) {
    favorites = favorites.filter(fav => fav !== book);
  } else {
    favorites.push(book);
  }

  await saveArrayToSecureStore('favorites', favorites);
};

export const addWordToDictionary = async (word, meaning) => {
  const dictionary = await getArrayFromSecureStore('dictionary') || [];

  const cleanedWord = word.replace(/[.,!?]$/, '');
  const cleanedMeaning = meaning.replace(/[.,!?]$/, '');
  dictionary.push({ word: cleanedWord, meaning: cleanedMeaning });
  await saveArrayToSecureStore('dictionary', dictionary);
};

export const getDictionary = async () => {
  const dictionary = await getArrayFromSecureStore('dictionary') || [];
  return dictionary;
};

export const deleteWordFromDictionary = async (word) => {
  let dictionary = await getArrayFromSecureStore('dictionary') || [];

  dictionary = dictionary.filter(entry => entry.word !== word);
  await saveArrayToSecureStore('dictionary', dictionary);
};
export const removeWordFromDictionary = async (word) => {
  try {
    const dictionary = await getDictionary();
    const updatedDictionary = dictionary.filter(entry => entry.word !== word);
    await SecureStore.setItemAsync('dictionary', JSON.stringify(updatedDictionary));
  } catch (error) {
    console.error('Error removing word from dictionary:', error);
  }
};

export const saveBookProgress = async (bookTitle, progress, pageNumber) => {
  try {
    const progressData = await getBookProgress();

    const updatedProgress = {
      ...progressData,
      [bookTitle]: { progress, pageNumber }
    };

    await SecureStore.setItemAsync('bookProgress', JSON.stringify(updatedProgress));
  } catch (error) {
    console.error('Kitap ilerlemesi kaydedilemedi:', error);
  }
};

export const getBookProgress = async () => {
  try {
    const jsonValue = await SecureStore.getItemAsync('bookProgress');
    return jsonValue ? JSON.parse(jsonValue) : {};
  } catch (error) {
    console.error('Error getting book progress:', error);
    return {};
  }
};

export const getSpecificBookProgress = async (bookTitle) => {
  try {
    const progressData = await getBookProgress();
    return progressData[bookTitle] || { progress: 0, pageNumber: 0 };
  } catch (error) {
    console.error('Belirli kitap ilerlemesi alınamadı:', error);
    return { progress: 0, pageNumber: 0 };
  }
};

export const initializeBookProgress = async (bookTitle) => {
  try {
    const { progress, pageNumber } = await getSpecificBookProgress(bookTitle);
    if (progress === 0 && pageNumber === 0) {
      await saveBookProgress(bookTitle, 0, 0);
    }
    return { progress, pageNumber };
  } catch (error) {
    console.error('Error initializing book progress:', error);
    return { progress: 0, pageNumber: 0 };
  }
};

export const removeFromFavorites = async (bookTitle) => {
  try {
    let favorites = await getArrayFromSecureStore('favorites') || [];
    favorites = favorites.filter(fav => fav !== bookTitle);
    await saveArrayToSecureStore('favorites', favorites);
  } catch (error) {
    console.error('Favorilerden silme hatası:', error);
  }
};

export const removeBookProgress = async (bookTitle) => {
  try {
    const progressData = await getBookProgress();
    if (progressData[bookTitle]) {
      delete progressData[bookTitle];
      await SecureStore.setItemAsync('bookProgress', JSON.stringify(progressData));
    }
  } catch (error) {
    console.error('İlerleme silme hatası:', error);
  }
};

export const saveNativeLanguage = async (language) => {
  try {
    await SecureStore.setItemAsync('nativeLanguage', language);
  } catch (error) {
    console.error('Native language saving error:', error);
  }
};

export const getNativeLanguage = async () => {
  try {
    const language = await SecureStore.getItemAsync('nativeLanguage');
    return language;
  } catch (error) {
    console.error('Error getting native language:', error);
    return null;
  }
};

export const saveDarkMode = async (mode) => {
  try {
    const darkmode = JSON.stringify(mode);
    await SecureStore.setItemAsync('darkMode', darkmode);
    return true;
  } catch (error) {
    console.error('Darkmode error for saving', error);
    return false;
  }
};

export const getDarkMode = async () => {
  try {
    const darkMode = await SecureStore.getItemAsync('darkMode');

    if (darkMode === null) {
      return false;
    }

    return JSON.parse(darkMode);
  } catch (error) {
    console.error('Darkmode error for getting', error);
    return false;
  }
};
