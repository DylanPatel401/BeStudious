import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SignUpScreen from './signup';
import SignInScreen from './signin';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function AuthScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="SignUp" component={SignUpScreen}
          options={{
            title: 'Sign Up',
            tabBarIcon: ({color}) => (
                <MaterialCommunityIcons name="home" color={color} size={25} />
            ), 
            headerShown: false,
            tabBarActiveTintColor:'red'
          }}
        />
      <Tab.Screen name="Sign In" component={SignInScreen} 
                options={{
                  title: 'Sign In',
                  tabBarIcon: ({color}) => (
                      <MaterialCommunityIcons name="home" color={color} size={25} />
                  ), 
                  headerShown: false,
                  tabBarActiveTintColor:'red'
                }}
              />
    </Tab.Navigator>
  );
}