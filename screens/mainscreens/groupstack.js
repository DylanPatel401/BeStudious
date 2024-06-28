import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SeeGroupScreen from '../subscreens/see_group';
import GroupsScreen from './groups';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function GroupStackScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Group1" component={SeeGroupScreen}
          options={{
            title: 'Manage Group',
            tabBarIcon: ({color}) => (
                <MaterialCommunityIcons name="home" color={color} size={25} />
            ), 
                headerShown: false,
                tabBarActiveTintColor:'red'
            }}
        />
        <Tab.Screen name="Group2" component={GroupsScreen} 
            options={{
              title: 'See Groups',
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