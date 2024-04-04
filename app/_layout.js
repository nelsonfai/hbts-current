import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { UserProvider } from "../context/userContext";
import { RefreshProvider } from "../context/refreshContext";
import { I18nProvider } from "../context/i18nProvider";
import { SummaryProvider } from "../context/summaryContext";
import {GlassfyProvider} from "../context/GlassfyContext"
import { SwipeableProvider } from "../context/swipeableContext";
import {
  TourGuideProvider,
} from 'rn-tourguide';
import CustomTooltip from '../components/common/CustomTooltip'

const Layout = () => {
  const [fontsLoaded] = useFonts({
    DMBold: require("../assets/fonts/DMSans-Bold.ttf"),
    DMMedium: require("../assets/fonts/DMSans-Medium.ttf"),
    DMRegular: require("../assets/fonts/DMSans-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GlassfyProvider>
    <UserProvider>
        <I18nProvider>
          <RefreshProvider>
            <SummaryProvider>
            <TourGuideProvider preventOutsideInteraction tooltipComponent={CustomTooltip} {...{ androidStatusBarVisible: true }}>
              <SwipeableProvider>
                <Stack initialRouteName="home">
                <Stack.Screen
                    options={{
                      headerShadowVisible: true,
                      headerShown: false,
                      headerTitle: ''
                    }}
                    name="(tabs)"
                  />
                </Stack>
              </SwipeableProvider>
              </TourGuideProvider>
            </SummaryProvider>
          </RefreshProvider>
        </I18nProvider>
        </UserProvider>
      </GlassfyProvider>
  );
};

export default Layout;
