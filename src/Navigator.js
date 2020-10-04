import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { Provider } from 'react-redux'

import storeConfig from './store/storeConfig'

import Auth from './screens/Auth/Auth'
import AuthOrApp from './screens/Auth/AuthOrApp'
import ListarProduto from './screens/Produto/ListarProduto'
import Home from './screens/Home'
import sincronismo from './hocs/Sincroniza'
import ListarPedido from './screens/Pedido/ListarPedido'
import AddPedido from './screens/Pedido/AddPedido'
import Faturamento from './screens/Pedido/Faturamento'
import ListarPessoa from './screens/Pessoa/ListarPessoa'
import AddPessoa from './screens/Pessoa/AddPessoa'

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function StackPessoa() {
  return (
    <Stack.Navigator initialRouteName='ListarPessoa'>
      <Stack.Screen options={{ headerShown: false }} name="ListarPessoa" component={ListarPessoa} />
      <Stack.Screen options={{ title: 'Adicionar pessoa' }} name="AddPessoa" component={AddPessoa} />
    </Stack.Navigator>
  );
}

function StackPedido() {
    return (
        <Stack.Navigator initialRouteName='ListarPedido'>
            <Stack.Screen options={{ headerShown: false }} name="ListarPedido" component={ListarPedido} />
            <Stack.Screen options={{ title: 'Adicionar pedido' }} name="AddPedido" component={AddPedido} />
            <Stack.Screen options={{ title: 'Faturar pedido' }} name="Faturamento" component={Faturamento} />
        </Stack.Navigator>
    );
}

const Navigator = () => {
    const store = storeConfig()
    
    return (
        <Provider store={store}>
            <NavigationContainer>
                <Tab.Navigator initialRouteName='Home' tabBarOptions={
                        {
                            inactiveBackgroundColor: '#7c2bff', 
                            activeBackgroundColor: '#7c2bff',
                            style: {height: 55},
                            labelStyle: {fontSize: 15},
                        }
                    }>
                    <Tab.Screen 
                        name="Home" component={Home} 
                        options={{
                            tabBarLabel: 'Home',
                            tabBarIcon: ({ color, size }) => (
                            <Icon name="home" color={color} size={size} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Pessoa" component={StackPessoa}
                        options={{
                            tabBarLabel: 'Pessoa',
                            tabBarIcon: ({ color, size }) => (
                            <Icon name="user" color={color} size={size} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Pedido" component={StackPedido}
                        options={{
                            tabBarLabel: 'Pedido',
                            tabBarIcon: ({ color, size }) => (
                            <Icon name="file" color={color} size={size} />
                            ),
                        }}
                    />

                    <Tab.Screen
                        name="Produto" component={ListarProduto}
                        options={{
                            tabBarLabel: 'Produto',
                            tabBarIcon: ({ color, size }) => (
                            <Icon name="archive" color={color} size={size} />
                            ),
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </Provider>
    );
}


const mainRoutes = {
    AuthOrApp: {
        name: 'AuthOrApp',
        screen: AuthOrApp
    },
    Auth: {
        name: 'Auth',
        screen: Auth
    },
    Home: {
        name: 'Navigator',
        screen: Navigator
    }
}

const mainNavigator = createSwitchNavigator(mainRoutes, { initialRouteName: 'AuthOrApp' })
export default sincronismo(createAppContainer(mainNavigator));