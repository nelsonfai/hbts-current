import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, SafeAreaView ,StatusBar,Linking} from 'react-native';
import { useUser } from "../context/userContext";
import { useRefresh } from "../context/refreshContext";
import AsyncStorageService from "../services/asyncStorage";
import { router, Stack } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { useNotificationService } from "../services/notificationServices";
import { API_BASE_URL } from "../appConstants";
import NetworkStatus from "../components/NetworkStatus"; // Assuming NetworkStatus is a component
import NetInfo from "@react-native-community/netinfo";
import { SyncReminders} from "../services/syncReminder";
import { useGlassfy } from '../context/GlassfyContext';

const SplashScreen = ({ network, onRefresh }) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
<Stack.Screen
      options={{
        headerStyle: {},
        headerShadowVisible: false,
        headerTitle: '',
      }} />
    <View style={styles.splashContainer}>
      {network ? (
        <ActivityIndicator size="large" color="grey" />
      ) : (
        <NetworkStatus onRefresh={onRefresh} />
      )}
    </View>
  </SafeAreaView>
);

const IndexPage = () => {
  const { setUser } = useUser();
  const { setRefresh } = useRefresh();
  const [loading, setLoading] = useState(true);
  const expo_token = useNotificationService();
  const [network, setNetwork] = useState(true);
  const { connectUser } = useGlassfy();

  const networkCheck = () => {
    NetInfo.fetch().then((state) => {
      setNetwork(state.isConnected);
    });
  };

  useEffect(() => {
    const fetchInit = async () => {
      networkCheck();
    };
    fetchInit();
  }, []);

  const fetchData = async () => {
    networkCheck(); // Network check before making the fetch request
    if (!network) {
      return;
    }
    const connectCustomSubscriber = async (consumerid) =>{
      await connectUser(consumerid)
    }
    try {
      const token = await AsyncStorageService.getItem('token');
      const refreshHabits = false;
      const refreshList = false;
      const refreshSummary = false;
      const refreshNotes = false;

      if (token) {
        const response = await fetch(`${API_BASE_URL}/profile-info/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
        });

        if (!response.ok) {
          router.replace("/onboadpage");
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        const { id, email, name, profile_pic, team_invite_code, hasTeam, team_id, lang,isync,imageurl,premium,customerid,valid_till,subscription_type,subscription_code,productid,auto_renew_status,mypremium,tourStatusSharedListDone,tourStatusNotesDone,tourStatusHabitsDone} = data;

        setUser({ id, email, name: name || '', profile_pic, premium, team_invite_code, hasTeam, team_id, lang, notify: expo_token,isync,imageurl, customerid,valid_till,subscription_type,subscription_code,productid,auto_renew_status,mypremium,tourStatusSharedListDone,tourStatusNotesDone,tourStatusHabitsDone});
        setRefresh({ refreshHabits, refreshList, refreshSummary, refreshNotes });

        if (hasTeam && !isync){
          SyncReminders(token)
        }
        connectCustomSubscriber(customerid)

        router.replace("home");
      } else {
        router.replace("/onboadpage");
      }
      setLoading(false);
    } catch (error) {
      router.replace("/onboadpage");
      setLoading(false);
    }
  };

useFocusEffect(
    React.useCallback(() => {
    fetchData();
  }, [setUser])
  );
  return loading ? <SplashScreen network={network} onRefresh={fetchData} /> : null;
};
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});
export default IndexPage;
