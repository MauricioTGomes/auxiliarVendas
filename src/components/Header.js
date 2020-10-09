import React from 'react'
import { Appbar, DefaultTheme, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage'

export default props => {
    const _handleMore = () => {
        return (
            <Button 
                mode="contained"
                color='blue'
                onPress={() => logout()}
            > Logout
            </Button>
        )
    }

    const logout = () => {
    }

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
            <Appbar.Action icon="dots-vertical" onPress={logout} />
        </Appbar.Header>
    );
};