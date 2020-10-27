import React from 'react'
import { TouchableWithoutFeedback, View, Text, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

export default props => {
    return (
        <TouchableWithoutFeedback disabled={props.disabled} onPress={() => props.abreModal()}>
            <View style={styles.container}>
                <Icon style={styles.icon} name="search" size={30} color='white'/>
                <Text style={styles.text}>{props.label}</Text>
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    icon: {
        marginTop: 10,
        marginLeft: 10,
        marginRight: 20
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(0, 0, 0, 0.07)',
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.4)',
        height: 60,
        borderRadius: 5,
        marginBottom: 15,
        marginTop: 20,
        width: '100%',
    },
    text: {
        textAlign: 'center',
        marginTop: 15,
        fontSize: 18,
        color: 'black'
    },

})