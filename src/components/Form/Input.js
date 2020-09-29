import React from 'react'
import commonStyles from '../../commonStyles'
import { TextInput, Checkbox, DefaultTheme } from 'react-native-paper';

export default props => {
    if (props.checkbox) {
        return (
            <Checkbox.Item
                theme={{
                    ...DefaultTheme,
                    colors: {
                        ...DefaultTheme.colors,
                        primary: 'blue',
                        placeholder: 'black',
                    },
                }}
                {...props}
            />
        )
    } else {
        return (
            <TextInput
                theme={{
                    ...DefaultTheme,
                    colors: {
                        ...DefaultTheme.colors,
                        primary: 'blue',
                        placeholder: 'black',
                    },
                }}
                style={commonStyles.input}
                mode='outlined'
                {...props}
            />
        )
    }
}