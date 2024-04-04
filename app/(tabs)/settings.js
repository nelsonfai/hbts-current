import React, { useEffect ,useContext} from 'react';
import { View, Text,AppState, StyleSheet, Alert, Image, TouchableOpacity ,SafeAreaView,Switch,Modal,FlatList,ScrollView,Linking, Share} from 'react-native';
import { useUser } from '../../context/userContext';
import AsyncStorageService from '../../services/asyncStorage';
import { useRouter, Stack} from 'expo-router';
import { COLORS } from '../../constants';
import ProfileImage from '../../components/common/Image';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useState } from 'react';
import I18nContext from '../../context/i18nProvider';
import * as Notifications from 'expo-notifications';
import { API_BASE_URL } from '../../appConstants';
import {cancelAllNotifications} from "../../services/notificationServices"
import { useGlassfy } from '../../context/GlassfyContext';
import { color } from 'react-native-elements/dist/helpers';
import updateTourStatus from '../../services/updateTourStatus';
const Settings =  () => {
  const { user,setUser} = useUser();
  const {i18n} = useContext(I18nContext)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.locale);
  const [selectedLanguageLabel, setSelectedLanguageLabel] = useState('');

  const [subscription, setSubscription] = useState({
    expirationDate: null,
    isPremium: false
});
  const { locale, changeLocale } = useContext(I18nContext);
  const router = useRouter();
  const { restorePermission,connectUser } = useGlassfy();
  const openAppSettings = () => {
    Linking.openSettings();
  };
  const updateSubscription =  async () =>{
    await restorePermission()
  }

  const checkNotificationStatus =  async (update) =>{
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus  == 'granted'){
      setNotificationsEnabled(true)
      if (update){
        expotoken = (await Notifications.getExpoPushTokenAsync({ projectId: 'dbd43c58-ce80-45ff-a1f2-6d6c3b6bb569' })).data;
        updateTourStatus(expo_token,expotoken)
      }
    }
    else{
      setNotificationsEnabled(false)
      if (update){
        updateTourStatus(expo_token,null)
      }
    }
  }


function formatDate(dateString) {
  const date = new Date(dateString); // Parse the date string
  const formattedDate = date.toISOString().split('T')[0]; // Extract only the date part
  return formattedDate; // Return the formatted date
}

useEffect(() => {
  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      checkNotificationStatus();
    }
  };

  const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  return () => {
    appStateSubscription.remove();
  };
}, []);

useEffect(() => {
  checkNotificationStatus();

}, []);


  const handleLogout = async () => {
    try {
      const token = await AsyncStorageService.getItem('token');
      const response = await fetch(`${API_BASE_URL}/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
 
      await AsyncStorageService.removeItem('token');
      await AsyncStorageService.removeItem('expo_token');
      setUser({
        id: null,
        email: '',
        name: '',
        profile_pic:'',
        imageurl: '',
        team_invite_code: '',
        hasTeam: false,
        team_id: null,
        lang: '',
        premium: false,
        notify: '',
        expo_token:null,
        isync:false,
        imageurl:null,
        customerid:null,
        valid_till :null,
        subscription_type :null,
        subscription_code :null,
        productid:null,
        auto_renew_status:false,
        tourStatusSharedListDone:false,
        tourStatusNotesDone:false,
        tourStatusHabitsDone:false
      });

      await cancelAllNotifications()
      await connectUser()
  
      router.replace('/onboadpage');
    } catch (error) {
    }
  };
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français'}
  ];
 
  useEffect(() => {
    AsyncStorageService.getItem('lang').then(lang => {
  
      const langOption = languageOptions.find(option => option.code === lang);
      const language = langOption ? langOption.label : 'Unknown';
      setSelectedLanguageLabel(language);
    }).catch(error => {
      //('Error retrieving language:', error);
    });
  }, [selectedLanguage]);
  

  const handleLanguageChange = async (language) => {
    await changeLocale(language);
    setSelectedLanguage(language);
    setShowLanguageModal(false);
    updateTourStatus('lang',language)

  };

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleLanguageChange(item.code)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#f2f2f2' }}>
        <Text>{item.label}</Text>
      </View>
    </TouchableOpacity>
  );

  const shareApp = async () => {
    try {
      const appName = 'Habts Us'; // Replace 'Your App Name' with the actual name of your app
      const appDescription = i18n.t('settings.appDescription'); // Fetch translated app description
      const storeUrl = 'https://bit.ly/get-habtsUs'; // Replace with your Android app's Play Store URL
      const storeText = i18n.t('settings.storeText');
      await Share.share({
        message: `${appName}: ${appDescription}\n\n${storeText} :${storeUrl }\n`,
      });
    } catch (error) {
      //(error.message);
    }
  };
  const openReview = async () => {
    try {
      const reviewUrl = 'https://bit.ly/habtsus-review';  
      await Linking.openURL(reviewUrl);
    } catch (error) {
      //(error.message);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor:COLORS.lightWhite,borderBottomWidth:0.3},
          headerShadowVisible: true,
          headerTitle: i18n.t('settings.title'),
          headerTitleStyle: {
            alignSelf: 'center', 
          },
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ flex: 1, backgroundColor: COLORS.lightWhite, paddingHorizontal: 5 }}>
        <View style={{ paddingVertical: 10, gap: 10, alignItems: 'center' }}>
          <ProfileImage width={100} height={100} name={user.name} mainImageUri={user.imageurl} fontSize={25} />
          <TouchableOpacity onPress={() => router.push('profile')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1, padding: 10,gap:10 }}>
                <Text style={styles.name}>{user.name}</Text>
                <Icon name="edit" size={20} color="black" />
              </View>
          </TouchableOpacity>
        </View>
        {/* Account Section */}
        <View style={{ marginTop: 20, paddingHorizontal: 10 ,fontSize:14}}>
          <Text style={styles.sectionTitle}>{i18n.t('settings.accounts.sectionTitle')}</Text>
          <TouchableOpacity onPress={() => setShowLanguageModal(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:'space-between', marginBottom: 1, padding: 15, borderBottomWidth: 1, borderColor: '#f2f2f2' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center',}}> 
              <Icon name="language" size={20} color="black" />
              <Text style={styles.linkText}>{i18n.t('settings.accounts.language')}</Text>
              </View>
              <Text style={{color:'grey'}}> {selectedLanguageLabel}</Text>

            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('changeEmail')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1, padding: 15, borderBottomWidth: 1, borderColor: '#f2f2f2' }}>
              <Icon name="envelope" size={20} color="black" />
              <Text style={styles.linkText}>{i18n.t('settings.accounts.changeEmail')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('changepassword')}>
            <View style={styles.linkContainer}>
              <Icon name="lock" size={20} color="black" />
              <Text style={styles.linkText}>{i18n.t('settings.accounts.changePassword')}</Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* Notifications Section */}
        <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
          <Text style={styles.sectionTitle}>{i18n.t('settings.notifications.sectionTitle')} </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={styles.linkContainer}>
            <Icon name="bell" size={20} color="black" />
            <Text style={styles.linkText}>{i18n.t('settings.notifications.enableNotifications')}</Text>
            </View>
            <Switch
                  trackColor={{ false: 'grey', true: 'black' }}
                  thumbColor={Platform.OS === 'android' ? 'white' : undefined}
                  value={notificationsEnabled}
                  onValueChange={(value) => openAppSettings()}
                />
          </View>
          {!notificationsEnabled && <Text style ={{color: 'grey', marginTop: 5, fontSize: 14 }}>{i18n.t('editHabit.turnNotification')} </Text>}
        </View>
     {/* Subscription Section */}
    <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
      <Text style={styles.sectionTitle}>{i18n.t('settings.subscription.sectionTitle')}</Text>

      <View style={styles.subscriptionContainer}>
        <Text style={styles.linkText}>{i18n.t('settings.subscription.currentPlan')} {user.premium ? i18n.t('settings.subscription.premium') : i18n.t('settings.subscription.freePlan')}</Text>
        {user.mypremium && (
          <>
            {user.premium && user.subscription_type && (
              <Text style={styles.linkText}>
                {i18n.t('settings.subscription.subscriptionType')}: {user.subscription_type === 'Monthly' ? i18n.t('settings.subscription.monthly') : i18n.t('settings.subscription.yearly')}
              </Text>
            )}

            {user.premium && user.valid_till && (
              <Text style={styles.linkText}>{i18n.t('settings.subscription.validTill')}: {formatDate(user.valid_till)}</Text>
            )}
            
            {user.premium && user.auto_renew_status && (
              <Text style={styles.linkText}>{i18n.t('settings.subscription.autoRenews')}: {user.auto_renew_status}</Text>
            )}

            {!user.premium && (
              <TouchableOpacity onPress={updateSubscription} style={styles.subscriptionButton}>
                <Text style={[styles.linkText, { textDecorationLine: 'underline' }]}>{i18n.t('settings.subscription.reactivateSubscription')}</Text>
              </TouchableOpacity>
            )}

            {user.premium && (
              <TouchableOpacity style={styles.subscriptionButton}>
                <Text style={[styles.linkText, { marginTop: 10 }]}>{i18n.t('settings.subscription.manageSubscription')}</Text>
              </TouchableOpacity>
            )}

            {user.premium && (
              <Text style={[styles.linkText, { color: 'grey', marginTop: 5, fontSize: 14 }]}>
                {Platform.OS === 'ios' ? i18n.t('settings.subscription.manageSubscriptionsInfo') : i18n.t('settings.subscription.manageAndroidSubscriptionsInfo')}
              </Text>
            )}
          </>
        )} 
          {!user.mypremium && user.premium && (
            <Text style={styles.linkText}>    
            {i18n.t('settings.subscription.partnerManagement')}
            </Text>

          )}
      </View>
    </View>

        {/* Legal Section */}
        <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
          <Text style={styles.sectionTitle}>{i18n.t('settings.legal.sectionTitle')}</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://habts.us/terms')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1, padding: 15, borderBottomWidth: 1, borderColor: '#f2f2f2' }}>
              <Icon name="file-text" size={20} color="black" />
              <Text style={styles.linkText}>{i18n.t('settings.legal.termsAndConditions')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://habts.us/privacy')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1, padding: 15, borderBottomWidth: 1, borderColor: '#f2f2f2' }}>
              <Icon name="shield" size={20} color="black" />
              <Text style={styles.linkText}>{i18n.t('settings.legal.privacy')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Links Section */}
        <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
        <Text style={styles.sectionTitle}>{i18n.t('settings.subscription.others')}</Text>
            <TouchableOpacity onPress={openReview}>
              <View style={styles.linkContainer}>
                <Icon name="star" size={20} color="black" />
                <Text style={styles.linkText}>{i18n.t('settings.subscription.review')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://habts.us/contact')}>
              <View style={styles.linkContainer}>
                <Icon name="phone" size={20} color="black" />
                <Text style={styles.linkText}>{i18n.t('settings.subscription.contact')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/habts_us/')}>
              <View style={styles.linkContainer}>
                <Icon name="instagram" size={20} color="black" />
                <Text style={styles.linkText}>Instagram</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={shareApp}>
              <View style={styles.linkContainer}>
                <Icon name="share" size={20} color="black" />
                <Text style={styles.linkText}>{i18n.t('settings.subscription.share')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://habts.us')}>
              <View style={styles.linkContainer}>
                <Icon name="info-circle" size={20} color="black" />
                <Text style={styles.linkText}>{i18n.t('settings.subscription.about')}</Text>
              </View>
            </TouchableOpacity>

          </View>

          <TouchableOpacity onPress={handleLogout}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 1, padding: 15, borderBottomWidth: 1, borderColor: '#f2f2f2' }}>
              <Icon name="sign-out" size={20} color="black" />
              <Text style={styles.linkText}>{i18n.t('settings.logout')}</Text>
            </View>
          </TouchableOpacity>
      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        style={{flex:1}}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' ,backgroundColor: 'rgba(0, 0, 0, 0.5)',padding:20 }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 5 ,width:'100%'}}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{i18n.t('settings.selectLanguage')}</Text>
            <FlatList
              data={languageOptions}
              keyExtractor={(item) => item.code}
              renderItem={renderLanguageItem}
            /> 
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={{ color: 'white', marginTop: 10 ,backgroundColor:'black',padding:15,textAlign:'center',borderRadius:10}}>{i18n.t('settings.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white',
    paddingHorizontal:5

  },
  section: {
    marginTop: 20,
    paddingHorizontal:10,

  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color:'grey',   
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
    padding: 15,
borderBottomWidth:1,
    borderColor:'#f2f2f2'

  },
  link: {
    marginLeft: 10,
  },
  notificationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profilebox: {
    paddingVertical: 10,
    gap: 10,
    alignItems: 'center',

  },
  name:{
    fontSize:18,
    fontWeight:'500'
  },
  linkText:{
    fontSize:16,
    marginLeft: 10
  }
});

export default Settings;
