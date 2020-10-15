import React, { Component } from 'react'
import { Appbar, DefaultTheme, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage'
import axios from 'axios'

export default class Header extends Component {
    logout = () => {
        //axios.defaults.headers.common['Authorization'] = null
        //AsyncStorage.removeItem('userData')
        console.log(this.props.navigation)
//        this.props.navigation.navigate('Auth')
    }

    componentDidMount() {
        console.log(this.props)
    }

    render() {
        return (
            <Appbar.Header theme={{
                ...DefaultTheme,
                colors: {
                    ...DefaultTheme.colors,
                    primary: '#7c2bff',
                    placeholder: 'black',
                }
            }}>
                <Appbar.Content title="Auxiliar de vendas" subtitle="Pessoas" />
                <Appbar.Action icon="dots-vertical" onPress={this.logout} />
            </Appbar.Header>
        );
    }
};