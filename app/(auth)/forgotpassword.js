import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Text } from 'react-native';
import { Input, Button } from 'react-native-elements';
import AsyncStorageService from '../../services/asyncStorage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context'; // Changed import
import { Stack } from 'expo-router';
import { COLORS } from '../../constants'; // Removed unused import
import I18nContext from '../../context/i18nProvider';
import { API_BASE_URL } from '../../appConstants';

const ForgotPassword = () => { // Changed function name to PascalCase
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { i18n } = useContext(I18nContext);

  const validateFields = () => {
    if (!email.trim()) {
      setEmailError(i18n.t('changeEmail.emailRequired'));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(i18n.t('changeEmail.emailnotvalid'));
      return false;
    }

    setEmailError('');
    return true;
  };
  const sendResetEmail = async () => {
    if (validateFields()) {
      try {
        const token = await AsyncStorageService.getItem('token');
        const code = 'your_secret_code'; // Ensure this matches the secret code expected by the backend
        const url = `${API_BASE_URL}/request-password-reset/`;
        const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email }),

    };
        const response = await fetch(url, requestOptions);
        const responseData = await response.json();
  
        if (!response.ok) {
        throw new Error(responseData.detail || 'Unknown error');
      }
  
        Alert.alert(i18n.t('forgotPassword.EmailSendSuccess'));
        //router.replace('/');
      } catch (error) {
        Alert.alert(i18n.t('forgotPassword.EmailSendFail'));
      }
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Stack.Screen
          options={{
            headerStyle: { backgroundColor: COLORS.lightWhite },
            headerShadowVisible: false,
            headerTitle: 'Reset Password',
            headerTintColor: 'grey',
          }}
        />
        <View style={styles.container}>
        <Text style={{fontSize:18}}>{i18n.t('forgotPassword.instructions')}</Text>
          <Input
            leftIcon={{ type: 'font-awesome', name: 'envelope' }}
            onChangeText={(text) => setEmail(text)}
        value={email}
            placeholder="email@mail.com"
            autoCapitalize={'none'}
            inputContainerStyle={{
              borderBottomWidth: 0,
              backgroundColor: '#f6f6f5',
              paddingVertical: 5,
              paddingHorizontal: 12,
              marginTop: 8,
              borderRadius: 10,
            }}
          />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <Button
        title={i18n.t('forgotPassword.sendEmailButton')}
        onPress={sendResetEmail} // Changed from savePassword
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
      />
    </View>
  </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 30,
    backgroundColor: 'white',
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -40,
    paddingHorizontal: 20,
  },
});

export default ForgotPassword;
