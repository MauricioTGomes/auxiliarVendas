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
import Inicial from './screens/Inicial'
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

const Navigator = (props) => {
    const store = storeConfig()

    const stylesTab = {
        inactiveBackgroundColor: '#007d00',
        activeBackgroundColor: '#005000',
        style: {
            height: 55,
        },
        labelStyle: {
            fontSize: 15
        },
    }

    const optionsInicital = {
        tabBarLabel: 'Inicial',
        tabBarIcon: ({ color, size }) => (
        <Icon name="home" color={color} size={size} />
        ),
    }

    const optionsPessoa = {
        tabBarLabel: 'Pessoa',
        tabBarIcon: ({ color, size }) => (
        <Icon name="user" color={color} size={size} />
        ),
    }
    
    const optionsProduto = {
        tabBarLabel: 'Produto',
        tabBarIcon: ({ color, size }) => (
        <Icon name="archive" color={color} size={size} />
        ),
    }

    const optionsPedido = {
        tabBarLabel: 'Pedido',
        tabBarIcon: ({ color, size }) => (
        <Icon name="file" color={color} size={size} />
        ),
    }
    
    return (
        <Provider store={store}>
            <NavigationContainer>
                <Tab.Navigator initialRouteName='Inicial' tabBarOptions={ stylesTab }>
                    <Tab.Screen 
                        name="Inicial" children={() => <Inicial {...props}/>}
                        options={ optionsInicital }
                    />
                    <Tab.Screen
                        name="Pessoa" children={() => <StackPessoa {...props}/>}
                        options={ optionsPessoa }
                    />
                    <Tab.Screen
                        name="Pedido" children={() => <StackPedido {...props}/>}
                        options={ optionsPedido }
                    />

                    <Tab.Screen
                        name="Produto" children={() => <ListarProduto {...props}/>}
                        options={ optionsProduto }
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
export default createAppContainer(mainNavigator);