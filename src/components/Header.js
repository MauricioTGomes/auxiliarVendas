import React, { Component } from 'react'
import { Appbar, DefaultTheme, Button } from 'react-native-paper';

class Header extends Component {
    render() {
        const theme = {
            ...DefaultTheme,
            colors: {
                ...DefaultTheme.colors,
                primary: '#007d00',
                placeholder: 'black',
            }
        } 
        return (
            <Appbar.Header theme={ theme }>
                <Appbar.Content title="Auxiliar de vendas"/>
            </Appbar.Header>
        );
    }
};

export default Header