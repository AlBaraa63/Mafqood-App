import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from '../hooks';
import {
  MainTabParamList,
  HomeStackParamList,
  ReportStackParamList,
  MatchesStackParamList,
  NotificationsStackParamList,
  ProfileStackParamList,
} from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/Home/HomeScreen';
import {
  ReportTypeSelectScreen,
  ReportPhotoScreen,
  ReportDetailsScreen,
  ReportWhenWhereScreen,
  ReportContactScreen,
  ReportReviewScreen,
  ReportSuccessScreen,
} from '../screens/Report';
import { MatchesListScreen } from '../screens/Matches/MatchesListScreen';
import { MatchDetailScreen } from '../screens/Matches/MatchDetailScreen';
import { NotificationsScreen } from '../screens/Notifications';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { EditProfileScreen } from '../screens/Profile/EditProfileScreen';
import { MyReportsScreen } from '../screens/Profile/MyReportsScreen';
import { ReportDetailScreen } from '../screens/Profile/ReportDetailScreen';
import { AboutScreen } from '../screens/Profile/AboutScreen';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ReportStack = createNativeStackNavigator<ReportStackParamList>();
const MatchesStack = createNativeStackNavigator<MatchesStackParamList>();
const NotificationsStack = createNativeStackNavigator<NotificationsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const TabIcon: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <Text
    style={{
      fontSize: 16,
      color: active ? colors.primary[500] : colors.text.secondary,
      fontWeight: active ? typography.fontWeight.semibold : typography.fontWeight.regular,
    }}
  >
    {label}
  </Text>
);

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home" component={HomeScreen} />
  </HomeStack.Navigator>
);

const ReportStackNavigator = () => (
  <ReportStack.Navigator screenOptions={{ headerShown: false }}>
    <ReportStack.Screen name="ReportTypeSelect" component={ReportTypeSelectScreen} />
    <ReportStack.Screen name="ReportPhoto" component={ReportPhotoScreen} />
    <ReportStack.Screen name="ReportDetails" component={ReportDetailsScreen} />
    <ReportStack.Screen name="ReportWhenWhere" component={ReportWhenWhereScreen} />
    <ReportStack.Screen name="ReportContact" component={ReportContactScreen} />
    <ReportStack.Screen name="ReportReview" component={ReportReviewScreen} />
    <ReportStack.Screen name="ReportSuccess" component={ReportSuccessScreen} />
  </ReportStack.Navigator>
);

const MatchesStackNavigator = () => (
  <MatchesStack.Navigator screenOptions={{ headerShown: false }}>
    <MatchesStack.Screen name="MatchesList" component={MatchesListScreen} />
    <MatchesStack.Screen name="MatchDetail" component={MatchDetailScreen} />
  </MatchesStack.Navigator>
);

const NotificationsStackNavigator = () => (
  <NotificationsStack.Navigator screenOptions={{ headerShown: false }}>
    <NotificationsStack.Screen name="Notifications" component={NotificationsScreen} />
  </NotificationsStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="MyReports" component={MyReportsScreen} />
    <ProfileStack.Screen name="ReportDetail" component={ReportDetailScreen} />
    <ProfileStack.Screen name="About" component={AboutScreen} />
  </ProfileStack.Navigator>
);

export const MainNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent[500],
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: colors.neutral.white,
          borderTopColor: colors.neutral[200],
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
            HomeTab: 'home-variant-outline',
            ReportTab: 'clipboard-text-outline',
            MatchesTab: 'sparkles',
            NotificationsTab: 'bell-outline',
            ProfileTab: 'account-circle-outline',
          };
          const name = iconMap[route.name] || 'circle-outline';
          return (
            <MaterialCommunityIcons
              name={focused && name === 'home-variant-outline' ? 'home-variant' : name}
              size={size}
              color={color}
            />
          );
        },
        tabBarLabel: ({ focused }) => {
          const labels: Record<string, string> = {
            HomeTab: t('nav_home'),
            ReportTab: t('nav_report'),
            MatchesTab: t('nav_matches'),
            NotificationsTab: t('nav_notifications'),
            ProfileTab: t('nav_profile'),
          };
          return <TabIcon label={labels[route.name]} active={focused} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
      <Tab.Screen name="ReportTab" component={ReportStackNavigator} />
      <Tab.Screen name="MatchesTab" component={MatchesStackNavigator} />
      <Tab.Screen name="NotificationsTab" component={NotificationsStackNavigator} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
