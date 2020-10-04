import React, {Component} from 'react'
import { View, Text, ImageBackground, StyleSheet, TextInput, Alert } from 'react-native'
import backgroundImage from '../../../assets/image/images.jpg'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Button} from 'react-native-paper'
import AsyncStorage from '@react-native-community/async-storage'

const initialState = {
    name: 'Mauricio Gomes',
    email: 'mauricio@gmail.com',
    password: '',
}

class Auth extends Component {   

    state = {...initialState}

    signin = async () => {
        let userData = this.state
        if (this.state.password == '123456') {
            userData.token = 'dsauidhasuihdiuashdiuhas'
            AsyncStorage.setItem('userData',  JSON.stringify(userData))
            this.props.navigation.navigate('Home')
        } else {
            Alert.alert('Atenção!', 'Dados do usuário estão incorretos')
        }
    }

    render() {
        const validations = []
        validations.push(this.state.email && this.state.email.includes("@"))
        validations.push(this.state.password && this.state.password.length >= 6)
        
        const validForm = validations.reduce((t, a) => t && a)

        return (
            <ImageBackground style={styles.backgroud} source={ backgroundImage }>
                <Text style={styles.title}>Pedidos</Text>

                <View style={styles.formContainer}>
                    <Text style={styles.subTitle}>Informe seus dados</Text>

                    <View style={styles.containerInput}>
                        <Icon name='pencil' size={20} style={ styles.iconInput } />
                        <TextInput 
                            placeholder='E-mail' value={this.state.email} 
                            style={ styles.input } onChangeText={email => this.setState({ email })}
                        />
                    </View>

                    <View style={styles.containerInput}>
                        <Icon name='lock' size={20} style={ styles.iconInput } />
                        <TextInput 
                            placeholder='Senha' value={this.state.password} secureTextEntry
                            style={ styles.input } onChangeText={password => this.setState({ password })}
                        />
                    </View>

                    <Button 
                        style={styles.button} mode="contained"
                        color='green' onPress={() => this.signin()} 
                        disabled={ !validForm }
                    >
                        Entrar
                    </Button>
                </View>
            </ImageBackground>
        )
    }
}

const styles = StyleSheet.create({
    backgroud: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        color: 'black',
        fontSize: 50,
        marginBottom: 10
    },
    input: {
        marginTop: 10,
        backgroundColor: 'white',
    },
    formContainer: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 20,
        width: '90%'
    },
    button: {
        //backgroundColor: '#080',
        marginTop: 10,
        padding: 10,
        alignItems: 'center',
        borderRadius: 7
    },
    buttonText: {
        color: 'white',
        fontSize: 20
    },
    subTitle: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
        marginBottom: 10
    },
    containerInput: {
        width: '100%',
        height: 40,
        backgroundColor: '#EEE',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    iconInput: {
        color: '#333',
        marginLeft: 20
    },
    input: {
        marginLeft: 20,
        width: '70%'
    }
})

export default Auth