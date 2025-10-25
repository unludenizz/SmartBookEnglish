import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomAlert = ({ isVisible, onClose, title, message, buttonText, type }) => {
  const isSuccess = type === 'success';

  return (
    <Modal isVisible={isVisible} animationIn="zoomIn" animationOut="zoomOut">
      <View style={[styles.modalContent, { borderColor: isSuccess ? '#4CAF50' : '#F44336' }]}>
        <View style={styles.iconContainer}>
          <Icon name={isSuccess ? 'check-circle' : 'error'} size={80} color={isSuccess ? '#4CAF50' : '#F44336'} />
        </View>

        <Text style={[styles.modalTitle, { color: isSuccess ? '#4CAF50' : '#F44336' }]}>{title}</Text>

        <Text style={styles.modalMessage}>{message}</Text>

        <TouchableOpacity style={[styles.button, { backgroundColor: isSuccess ? '#4CAF50' : '#F44336' }]} onPress={onClose}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 2,
  },
  iconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;
