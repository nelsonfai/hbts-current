import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, StyleSheet, RefreshControl,View ,Button} from "react-native";
import { Stack, useRouter } from "expo-router";
import { COLORS, SIZES } from "../../constants";
import { useUser } from "../../context/userContext";
import ProfileImage from "../../components/common/Image";
import { Welcome } from "../../components";
import SharedLists from "../../components/home/popular/SharedList";
import I18nContext from "../../context/i18nProvider";
 import SubscriptionModal from "../../components/subscription/SubcritionModal";
import Icon from 'react-native-vector-icons/FontAwesome';
import NetInfo from '@react-native-community/netinfo';
import NetworkStatus from "../../components/NetworkStatus";
import { useGlassfy } from '../../context/GlassfyContext';
import fetchPermission from "../../services/userinfo";

const Home = () => {
  const { user, setUser } = useUser();
  const router = useRouter();
  const { i18n } = useContext(I18nContext);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [network, setNetwork] = useState(true);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const goToSettings = () => {
    router.push('settings');
  };

  const onPressSubscribe = async () => {
    try {
      const permission = await fetchPermission(setUser);
      if (!permission){
        setShowSubscriptionModal(true);
      }
    } catch (error) {

      console.error('Error fetching permission:', error);
      // Handle the error, e.g., show an error message to the user
    }
  };
  
  const networkStateListener = NetInfo.addEventListener(networkState => {
    NetInfo.fetch().then(state => {
      setNetwork(state.isConnected);
    });
  });

  useEffect(() => {
    return () => {
      networkStateListener();
    };
  }, [networkStateListener]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          headerShown: false,
          headerShadowVisible: true,
          headerTitle: '',
        }}
      />
      {network ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.container}>
            <Welcome user={user} />
            {!user.premium ? (
              <View style={styles.subscriptionContainer}>
                <Text style={styles.subscriptionText}>
                  {i18n.t('home.premiumText')}
                </Text>
                <TouchableOpacity
                  onPress={onPressSubscribe}
                  style={styles.subscribeButton}>
                  <Icon name="star" size={25} color={'#ffdb83'} />
                  <Text style={styles.subscribeButtonText}>
                    {i18n.t('home.premiumButton')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <SharedLists
              key={refreshing ? 'refreshed' : 'not-refreshed'}
              user_id={user.id}
            />
          </View>
        </ScrollView>
      ) : (
        <NetworkStatus />

      )}
        <SubscriptionModal
        isVisible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.medium,
    backgroundColor: 'white'
  },
  subscriptionContainer: {
    marginTop: 16,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f4fd'
  },
  subscriptionText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  subscribeButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  subscribeButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default Home;