import React, { useEffect, useState,useContext } from "react";
import {
  Text,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  TextInput,
  View,
  Alert,
} from "react-native";
import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { Stack, router, useLocalSearchParams } from "expo-router";
import AsyncStorageService from "../../services/asyncStorage";
import { API_BASE_URL } from "../../appConstants";
import { useRefresh } from "../../context/refreshContext";
import { COLORS } from "../../constants";
import richTextStyle from "../../styles/richtextStyle";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Clipboard from 'expo-clipboard';
import NetworkStatus from "../../components/NetworkStatus";
import NetInfo from '@react-native-community/netinfo';
import I18nContext from "../../context/i18nProvider";


const handleHead = ({ tintColor }) => (
  <Text style={{ color: tintColor }}>Hh</Text>
);
const handleHead2 = ({ tintColor }) => (
  <Text style={{ color: tintColor }}>H2</Text>
);

const App = () => {
  const richText = React.useRef();
  const scrollViewRef = React.useRef();
  const params = useLocalSearchParams();
  const [change, setChange] = useState(false);
  const [initialText, setInitialText] = useState("");
  const [title, setTitle] = useState(params.title || ''); 
  const [color, setColor] = useState(params.color || 'black');
  const {refresh,setRefresh} = useRefresh();
  const [scroll,setScroll] = useState(0)
  const [network,setNetWork] = useState(true)
  const {i18n} = useContext(I18nContext)


  const networkCheck =() => {
    NetInfo.fetch().then(state => {
      setNetWork(state.isConnected)
    });
  };
  const setCursor = (cursorPosition) =>{

    if (scrollViewRef.current && cursorPosition && cursorPosition !== scroll) {
      scrollViewRef.current.scrollTo({ y: cursorPosition, animated: true });
    }
    setScroll(cursorPosition)
  }
  const setHtml = () => {
    networkCheck()
    if (params.id){
      fetchInitialText()
    }
   }

   const fetchInitialText = async () => {
    if(network){ try {
       const token = await AsyncStorageService.getItem("token");
       const apiUrl = `${API_BASE_URL}/notes/${params.id}/`;
 
       const requestOptions = {
         method: "GET",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Token ${token}`,
         },
       };
       const response = await fetch(apiUrl, requestOptions);
       if (response.ok) {
         const data = await response.json();
         setInitialText(data.body);
         setTitle(data.title)
         setColor(data.color)
         richText.current.setContentHTML(data.body);
         setChange(false); // Set change to false initially
       } else {
         const errorData = await response.json();
         //("Error fetching initial text:", errorData);
       }
     } catch (error) {
      ////("Error fetching initial text:", error.message);
    }}
 }



  const handleLinkPress =async (url) => {
      await Clipboard.setStringAsync(url);
  };
  const handleDonePress = async (richText, initialText) => {
    try {
      NetInfo.fetch().then(state => {
        if(!state.isConnected){
          return Alert.alert(i18n.t('notes.write.networkError'))
        }
      });

      const token = await AsyncStorageService.getItem("token");
      const newBody = await richText.current.getContentHtml();
      const apiUrl = params.id
        ? `${API_BASE_URL}/notes/${params.id}/`
        : `${API_BASE_URL}/notes/`;

      const requestOptions = {
        method: params.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({title:title, body: newBody,color:color }),
      };

      const response = await fetch(apiUrl, requestOptions);

      if (response.ok) {
    		setChange(false)
        richText.current.blurContentEditor();
		    setRefresh({ refreshHabits: false, refreshList: false, refreshSummary: false,refreshNotes:true });

      } else {
        const errorData = await response.json();
        //("Error updating/add text:", errorData);
      }
    } catch (error) {
      ////("Error updating/add text:", error.message);
    }
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <Stack.Screen
        options={{
          headerStyle: {},
          headerShadowVisible: true,
                    headerRight: () => (
            <TouchableOpacity onPress={() => handleDonePress(richText, initialText)}>
              {change ? (
              <Text style={{marginRight: 5,marginBottom:7, fontSize: 18, fontWeight: '600' }}>
                      {i18n.t('notes.write.header.save')}
              </Text>
              ) : null}
            </TouchableOpacity>
          ),
          headerTitle: '',
          headerTintColor: "black",
        }}
      />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1}}> 
        {network && (
        <View style={styles.toolbarContainer}>
          <RichToolbar
            style={{ flex: 1,backgroundColor: 'whitesmoke' }}
            editor={richText}
            iconTint="grey"
            selectedIconTint="#312921"
            actions={[
              actions.undo,
              actions.setBold,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.insertLink,
              actions.setItalic,
              actions.checkboxList,
              actions.setUnderline,
            ]}
          />
        </View>
      )}
        <ScrollView contentContainerStyle={{flexGrow:1,padding:7,paddingBottom:100,paddingTop:40}}
        showsVerticalScrollIndicator={false}
          ref={scrollViewRef}>
              <View style={{ padding: 15, gap: 5 ,flexDirection:'row',alignItems:'flex-start',backgroundColor:'whitesmoke',marginVertical:10,borderRadius:10,}}>
                  <TouchableOpacity onPress={ () => setColor('red')}>
                    <View style={{paddingTop:5}}><Icon name="bookmark" size={23} color={color} /></View>
                  </TouchableOpacity>
                    <TextInput
                      multiline={true}
                      style={[styles.titleInput]}
                      placeholder={i18n.t('notes.write.placeholder')}
                      value={title}
                      onChangeText={(text) => {
                        setChange(true);
                        setTitle(text);
                      }}
                    />
              </View>
          {  network ? ( 
                    <RichEditor
                      editorInitializedCallback={setHtml}
                      onCursorPosition={setCursor}
                      style={{flex:1}}
                        editorStyle={{
                        color: 'black',
                        caretColor: 'black',
                        backgroundColor: COLORS.lightWhite,
                        cssText: richTextStyle(color),
                      }}
                      contentCSSText={true}
                      ref={richText}
                      onLink={handleLinkPress}
                      onChange={(descriptionText) => {
                        setChange(true);
                      }}
                      placeholder={i18n.t('notes.write.richTextPlaceholder')}
                      
                    />
                    ):(<NetworkStatus onRefresh={setHtml} />)}
          </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  toolbarContainer: {
    width:'100%',
    zIndex:1,
    position:'absolute',
  },
  titleInput:{
	fontSize:22,
	fontWeight:'500', 
  flex:1,
  borderRadius:5
  }

});

export default App;

