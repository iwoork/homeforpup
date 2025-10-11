import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../contexts/AuthContext';
import { theme } from '../utils/theme';
import Logo from '../components/Logo';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';

// Main Screens - Breeder
import DashboardScreen from '../screens/main/DashboardScreen';
import LittersScreen from '../screens/main/LittersScreen';
import DogsScreen from '../screens/main/DogsScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Main Screens - Dog Parent
import DogParentDashboardScreen from '../screens/main/DogParentDashboardScreen';
import SearchPuppiesScreen from '../screens/dog-parent/SearchPuppiesScreen';
import MatchedPuppiesScreen from '../screens/dog-parent/MatchedPuppiesScreen';
import FavoritePuppiesScreen from '../screens/dog-parent/FavoritePuppiesScreen';
import DogParentPreferencesScreen from '../screens/dog-parent/DogParentPreferencesScreen';
import ContactBreederScreen from '../screens/dog-parent/ContactBreederScreen';

// Detail Screens
import KennelDetailScreen from '../screens/details/KennelDetailScreen';
import LitterDetailScreen from '../screens/details/LitterDetailScreen';
import DogDetailScreen from '../screens/details/DogDetailScreen';
import MessageDetailScreen from '../screens/details/MessageDetailScreen';

// Form Screens
import ManageKennelsScreen from '../screens/forms/ManageKennelsScreen';
import CreateKennelScreen from '../screens/forms/CreateKennelScreen';
import CreateLitterScreen from '../screens/forms/CreateLitterScreen';
import EditLitterScreen from '../screens/forms/EditLitterScreen';
import CreateDogScreen from '../screens/forms/CreateDogScreen';
import EditDogScreen from '../screens/forms/EditDogScreen';
import EditProfileScreen from '../screens/forms/EditProfileScreen';
import ManageContractsScreen from '../screens/main/ManageContractsScreen';
import ManageWaitlistScreen from '../screens/forms/ManageWaitlistScreen';

import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
// const Drawer = createDrawerNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen 
      name="VerifyEmail" 
      component={VerifyEmailScreen}
      options={{ title: 'Verify Email' }}
    />
  </Stack.Navigator>
);

const BreederTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            break;
          case 'Litters':
            iconName = focused ? 'albums' : 'albums-outline';
            break;
          case 'Dogs':
            iconName = focused ? 'paw' : 'paw-outline';
            break;
          case 'Messages':
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'ellipse';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
        ...theme.shadows.lg,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
      headerStyle: {
        backgroundColor: theme.colors.surface,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      },
      headerTintColor: theme.colors.text,
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 20,
      },
      headerLeft: () => (
        <View style={{ marginLeft: 16 }}>
          <Logo size={32} />
        </View>
      ),
      headerTitle: 'Home for Pup',
    })}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        title: 'Dashboard',
        tabBarLabel: 'Home',
      }}
    />
    <Tab.Screen
      name="Litters"
      component={LittersScreen}
      options={{
        title: 'Litters',
        tabBarLabel: 'Litters',
      }}
    />
    <Tab.Screen
      name="Dogs"
      component={DogsScreen}
      options={{
        title: 'Dogs',
        tabBarLabel: 'Dogs',
      }}
    />
    <Tab.Screen
      name="Messages"
      component={MessagesScreen}
      options={{
        title: 'Messages',
        tabBarLabel: 'Messages',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Profile',
        tabBarLabel: 'Profile',
      }}
    />
  </Tab.Navigator>
);

const DogParentTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'DogParentDashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'SearchPuppies':
            iconName = focused ? 'search' : 'search-outline';
            break;
          case 'Favorites':
            iconName = focused ? 'heart' : 'heart-outline';
            break;
          case 'Messages':
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'ellipse';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
        ...theme.shadows.lg,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
      headerStyle: {
        backgroundColor: theme.colors.surface,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      },
      headerTintColor: theme.colors.text,
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 20,
      },
      headerLeft: () => (
        <View style={{ marginLeft: 16 }}>
          <Logo size={32} />
        </View>
      ),
      headerTitle: 'Home for Pup',
    })}
  >
    <Tab.Screen
      name="DogParentDashboard"
      component={DogParentDashboardScreen}
      options={{
        title: 'Home',
        tabBarLabel: 'Home',
      }}
    />
    <Tab.Screen
      name="SearchPuppies"
      component={SearchPuppiesScreen}
      options={{
        title: 'Search',
        tabBarLabel: 'Search',
      }}
    />
    <Tab.Screen
      name="Favorites"
      component={FavoritePuppiesScreen}
      options={{
        title: 'Favorites',
        tabBarLabel: 'Favorites',
      }}
    />
    <Tab.Screen
      name="Messages"
      component={MessagesScreen}
      options={{
        title: 'Messages',
        tabBarLabel: 'Messages',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Profile',
        tabBarLabel: 'Profile',
      }}
    />
  </Tab.Navigator>
);

const MainStack = () => {
  const { user } = useAuth();
  const isDogParent = user?.userType === 'dog-parent';

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: theme.colors.text,
        },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={isDogParent ? DogParentTabs : BreederTabs}
        options={{ headerShown: false }}
      />

    {/* Kennel Screens */}
    <Stack.Screen
      name="ManageKennels"
      component={ManageKennelsScreen}
      options={{ title: 'Manage Kennels' }}
    />

    {/* Contract Screens */}
    <Stack.Screen
      name="ManageContracts"
      component={ManageContractsScreen}
      options={{ title: 'Contract Management' }}
    />
    <Stack.Screen
      name="KennelDetail"
      component={KennelDetailScreen}
      options={{ title: 'Kennel Details' }}
    />
    <Stack.Screen
      name="CreateKennel"
      component={CreateKennelScreen}
      options={{ title: 'Create Kennel' }}
    />

    {/* Litter Screens */}
    <Stack.Screen
      name="LitterDetail"
      component={LitterDetailScreen}
      options={{ title: 'Litter Details' }}
    />
    <Stack.Screen
      name="CreateLitter"
      component={CreateLitterScreen}
      options={{ title: 'Create Litter' }}
    />
    <Stack.Screen
      name="EditLitter"
      component={EditLitterScreen}
      options={{ title: 'Edit Litter' }}
    />
    <Stack.Screen
      name="ManageWaitlist"
      component={ManageWaitlistScreen}
      options={{ 
        title: 'Waitlist Management',
        headerRight: () => null, // Will be handled by screen component
      }}
    />

    {/* Dog Screens */}
    <Stack.Screen
      name="DogDetail"
      component={DogDetailScreen}
      options={{ title: 'Dog Details' }}
    />
    <Stack.Screen
      name="CreateDog"
      component={CreateDogScreen}
      options={{ title: 'Add Dog' }}
    />
    <Stack.Screen
      name="EditDog"
      component={EditDogScreen}
      options={{ title: 'Edit Dog' }}
    />

    {/* Message Screens */}
    <Stack.Screen
      name="MessageDetail"
      component={MessageDetailScreen}
      options={{ title: 'Message' }}
    />

    {/* Profile Screens */}
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />

    {/* Dog Parent-specific Screens */}
    <Stack.Screen
      name="MatchedPuppies"
      component={MatchedPuppiesScreen}
      options={{ title: 'Matched Puppies' }}
    />
    <Stack.Screen
      name="DogParentPreferences"
      component={DogParentPreferencesScreen}
      options={{ title: 'My Preferences' }}
    />
    <Stack.Screen
      name="ContactBreeder"
      component={ContactBreederScreen}
      options={{ title: 'Send Message' }}
    />
  </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
