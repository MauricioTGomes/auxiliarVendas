import React from 'react'
import { Appbar, DefaultTheme } from 'react-native-paper';

export default props => {
    const _handleMore = () => console.log('Shown more');

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
            <Appbar.Action icon="dots-vertical" onPress={_handleMore} />
        </Appbar.Header>
    );
};