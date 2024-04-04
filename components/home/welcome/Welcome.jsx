import { useState ,useEffect} from "react";
import {
  View,
  Text,

} from "react-native";
import { useRouter } from "expo-router";

import { useContext } from "react";
import YourCarouselComponent from "../../carousel/carousel";
import I18nContext from "../../../context/i18nProvider";
const Welcome = ({user,summary}) => {
  const router = useRouter();
  const {i18n} = useContext(I18nContext)
 
  return (

    <View style={{flex:1}}>
      <View style={{marginTop:20}}>
        <Text style={{fontSize:20}} >{i18n.t('home.hello')} {user.name} ! </Text>
        <Text style={{fontSize:24,fontWeight:'500'}} >{i18n.t('home.greetings')} </Text>
      </View>
      <YourCarouselComponent user={user} summary={summary}  />

    </View>


  );
};

export default Welcome;