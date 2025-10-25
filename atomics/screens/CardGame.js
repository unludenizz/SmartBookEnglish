import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Animated,
  Modal
} from 'react-native';
import { getDarkMode, getDictionary } from '../../securestore/ExpoSecureStore';
import i18n from '../utils/I18n';
import { useFocusEffect } from '@react-navigation/native';

const CardGame = () => {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [originalWords, setOriginalWords] = useState([]);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOverVisible, setGameOverVisible] = useState(false);
  const [feedbackOpacity] = useState(new Animated.Value(0));

  const MINIMUM_WORDS = 10;
  const OPTIONS_COUNT = 3;

  const theme = {
    background: darkMode ? '#1a1a1a' : '#f5f5f5',
    card: darkMode ? '#2d2d2d' : '#ffffff',
    primary: darkMode ? '#4db6ac' : '#00796b',
    text: darkMode ? '#ffffff' : '#333333',
    secondaryText: darkMode ? '#bbbbbb' : '#666666',
    disabled: darkMode ? '#404040' : '#cccccc',
    error: darkMode ? '#ff8080' : '#ff6b6b',
    success: darkMode ? '#66bb6a' : '#4caf50',
    shadow: '#000000',
    scoreText: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.7)',
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchDarkMode = async () => {
        const isDarkMode = await getDarkMode();
        setDarkMode(isDarkMode);
      };
      fetchDarkMode();
      loadDictionary();
    }, [])
  );

  const showFeedback = (message, correct) => {
    setFeedbackText(message);
    setIsCorrect(correct);
    setFeedbackVisible(true);
    
    Animated.sequence([
      Animated.timing(feedbackOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setFeedbackVisible(false);
    });
  };

  const loadDictionary = async () => {
    try {
      setLoading(true);
      const dictionary = await getDictionary();
      const processedDictionary = dictionary.map((item, index) => ({ 
        ...item, 
        id: index.toString() 
      }));
      setWords(processedDictionary);
      setOriginalWords(processedDictionary);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dictionary:', error);
      showFeedback(i18n.t('gettingerrorwhileloaddictionary'), false);
      setLoading(false);
    }
  };

  const startGame = () => {
    if (originalWords.length < MINIMUM_WORDS) {
      showFeedback(i18n.t('aminimumoftenwordsarerequired'), false);
      return;
    }
    setScore(0);
    setWords([...originalWords]);
    setGameStarted(true);
    setGameOverVisible(false);
    generateQuestion();
  };

  const generateQuestion = () => {
    if (words.length === 0) {
      setGameOverVisible(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    setCurrentWord(selectedWord);

    const otherWords = originalWords.filter(word => word.id !== selectedWord.id);
    const wrongOptions = getRandomElements(otherWords, OPTIONS_COUNT - 1)
      .map(word => word.meaning);
    
    const allOptions = [...wrongOptions, selectedWord.meaning]
      .sort(() => Math.random() - 0.5);
    
    setOptions(allOptions);
  };

  const getRandomElements = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleOptionSelect = (selectedOption) => {
    const isCorrect = selectedOption === currentWord.meaning;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      showFeedback(i18n.t('youaredoinggreat'), true);
    } else {
      showFeedback(`${i18n.t('correctanswer')}: ${currentWord.meaning}`, false);
    }

    setWords(prev => prev.filter(word => word.id !== currentWord.id));
    setTimeout(generateQuestion, 1500);
  };

  const GameOverModal = () => (
    <Modal
      transparent={true}
      visible={gameOverVisible}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{i18n.t('gameover')}</Text>
          <Text style={styles.modalScore}>
            {i18n.t('finalscore')}: {score}
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.playAgainButton]}
              onPress={startGame}
            >
              <Text style={styles.modalButtonText}>{i18n.t('playagain')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.quitButton]}
              onPress={() => {
                setGameStarted(false);
                setGameOverVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>{i18n.t('quit')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const FeedbackOverlay = () => (
    <Animated.View 
      style={[
        styles.feedbackContainer,
        {
          opacity: feedbackOpacity,
          backgroundColor: isCorrect ? theme.success : theme.error,
        },
      ]}
    >
      <Text style={styles.feedbackText}>{feedbackText}</Text>
    </Animated.View>
  );

  useEffect(() => {
    loadDictionary();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.background,
    },
    welcomeContainer: {
      width: '90%',
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 25,
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: darkMode ? 0.5 : 0.2,
      shadowRadius: 6,
      elevation: 10,
      marginBottom: 20,
    },
    welcomeTitle: {
      fontSize: 36,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 20,
      textAlign: 'center',
      letterSpacing: 1.2,
    },
    welcomeText: {
      fontSize: 16,
      color: theme.secondaryText,
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 24,
    },
    startButton: {
      backgroundColor: theme.primary,
      borderRadius: 15,
      paddingVertical: 15,
      paddingHorizontal: 30,
      width: '80%',
      alignItems: 'center',
      marginTop: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 5,
      elevation: 6,
    },
    startButtonDisabled: {
      backgroundColor: theme.disabled,
      opacity: 0.6,
    },
    warningText: {
      color: theme.error,
      fontSize: 14,
      textAlign: 'center',
      marginTop: 10,
      paddingHorizontal: 20,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.secondaryText,
    },
    scoreContainer: {
      position: 'absolute',
      top: 40,
      right: 20,
      backgroundColor: theme.primary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 15,
      elevation: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    scoreText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.scoreText,
    },
    cardContainer: {
      width: '90%',
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: darkMode ? 0.4 : 0.25,
      shadowRadius: 6,
      elevation: 8,
      marginBottom: 20,
    },
    wordText: {
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      color: theme.text,
      letterSpacing: 1.5,
    },
    instructionText: {
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 20,
      color: theme.secondaryText,
    },
    optionButton: {
      backgroundColor: theme.primary,
      borderRadius: 15,
      paddingVertical: 15,
      paddingHorizontal: 20,
      marginVertical: 8,
      width: '100%',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    optionText: {
      color: theme.scoreText,
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    buttonText: {
      color: theme.scoreText,
      fontSize: 18,
      textAlign: 'center',
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    feedbackContainer: {
      position: 'absolute',
      top: '15%',
      left: '10%',
      right: '10%',
      backgroundColor: theme.success,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    feedbackText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 30,
      alignItems: 'center',
      width: '80%',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    modalTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 20,
    },
    modalScore: {
      fontSize: 24,
      color: theme.primary,
      marginBottom: 30,
      fontWeight: '600',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    modalButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      minWidth: '40%',
    },
    playAgainButton: {
      backgroundColor: theme.primary,
    },
    quitButton: {
      backgroundColor: theme.error,
    },
    modalButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>{i18n.t('loadingdictionary')}</Text>
      </View>
    );
  }

  if (!gameStarted) {
    const hasEnoughWords = originalWords.length >= MINIMUM_WORDS;
    
    return (
      <View style={styles.container}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>{i18n.t('wordgame')}</Text>
          <Text style={styles.welcomeText}>
            {i18n.t('earnpointbyguessingthemeaningofwords')}
          </Text>
          <TouchableOpacity 
            style={[
              styles.startButton,
              !hasEnoughWords && styles.startButtonDisabled
            ]} 
            onPress={startGame}
            disabled={!hasEnoughWords}
          >
            <Text style={styles.buttonText}>{i18n.t('startthegame')}</Text>
          </TouchableOpacity>
          {!hasEnoughWords && (
            <Text style={styles.warningText}>
              {i18n.t('aminimumoftenwordsarerequirednumberofavailable')} {originalWords.length}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{i18n.t('point')} {score}</Text>
      </View>
      
      {currentWord && (
        <View style={styles.cardContainer}>
          <Text style={styles.wordText}>{currentWord.word}</Text>
          <Text style={styles.instructionText}>{i18n.t('chooseofthemeaning')}</Text>
          
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleOptionSelect(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {feedbackVisible && <FeedbackOverlay />}
      <GameOverModal />
    </View>
  );
}


export default CardGame;