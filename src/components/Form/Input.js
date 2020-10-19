import React from 'react'
import commonStyles from '../../commonStyles'
import { TextInput, Checkbox, DefaultTheme } from 'react-native-paper';

export default props => {
    const layout = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: 'blue',
            placeholder: 'black',
        },
    }

    if (props.checkbox) {
        return (
            <Checkbox.Item
                theme={ layout }
                {...props}
            />
        )
    } else {
        return (
            <TextInput
                theme={ layout }
                style={commonStyles.input}
                mode='outlined'
                {...props}
            />
        )
    }
}