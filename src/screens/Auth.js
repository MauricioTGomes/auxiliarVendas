import React, {Component} from 'react'
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import backgroundImage from '../../assets/imgs/login.jpg'
import commonStyle from '../commonStyles'
import { server, showError, showSuccess } from '../common'
import AuthInput from '../components/AuthInput'
import axios from 'axios'
import AsyncStorage from '@react-native-community/async-storage'

const initialState = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '' ,
    stageNew: false,
    loading: false
}

export default class Auth extends Component {   

    state = {...initialState}

    signinOrSignup = () => {
        this.setState({ loading: true })
        if (this.state.stageNew) {
            this.signup()
        } else {
            this.signin()
        }
    }

    signup = async () => {
        try {
            await axios.post(`${server}/signup`, {
                name: this.state.name,
                email: this.state.email,
                password: this.state.password,
                confirmPassword: this.state.confirmPassword
            })
            showSuccess("Usuário cadastrado")
            this.setState({...initialState})
        } catch (e) {
            showError(e)
        }
    }

    signin = async () => {
        try {
            const resp = await axios.post(`${server}/signin`, {
                email: this.state.email,
                password: this.state.password,
            })
            
            AsyncStorage.setItem('userData', JSON.stringify(resp.data))
            axios.defaults.headers.common['Authorization'] = `bearer ${resp.data.token}`
            this.props.navigation.navigate('Home', resp.data)
        } catch (e) {
            showError(e)
        }

        this.setState({ loading: false })
    }

    render() {
        const validations = []
        validations.push(this.state.email && this.state.email.includes("@"))
        validations.push(this.state.password && this.state.password.length >= 6)
        
        if (this.state.stageNew) { 
            validations.push(this.state.name && this.state.name.trim().length >= 3)
            validations.push(this.state.confirmPassword == this.state.password)
        }
        
        const validForm = validations.reduce((t, a) => t && a)

        return (
            <ImageBackground style={styles.backgroud} source={ backgroundImage }>
                <Text style={styles.title}>Tasks</Text>

                <View style={styles.formContainer}>
                    <View style={styles.loading}>
                        <ActivityIndicator animating={this.state.loading}/>
                    </View>
                    
                    <Text style={styles.subTitle}>{ this.state.stageNew ? 'Crie a sua conta' : 'Informe seus dados' }</Text>
                    {this.state.stageNew && <AuthInput icon='user' placeholder='Nome' value={this.state.name} style={styles.input} onChangeText={name => this.setState({ name })}/>}
                    <AuthInput icon='at' placeholder='E-mail' value={this.state.email} style={styles.input} onChangeText={email => this.setState({ email })}/>
                    <AuthInput icon='lock' placeholder='Senha' value={this.state.password} style={styles.input} onChangeText={password => this.setState({ password })} secureTextEntry={true}/>
                    {this.state.stageNew && <AuthInput icon='asterisk' placeholder='Confirme a senha' value={this.state.confirmPassword} style={styles.input} onChangeText={confirmPassword => this.setState({ confirmPassword })} secureTextEntry={true}/>}
                    
                    <TouchableOpacity disabled={!validForm || this.state.loading} onPress={this.signinOrSignup}>
                        <View style={[styles.button, validForm ? {} : {backgroundColor: '#AAA'}]}>
                            <Text style={styles.buttonText}>{ this.state.stageNew ? 'Registrar' : 'Entrar' }</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity disabled={this.state.loading} style={{ padding: 10 }} onPress={() => this.setState({ stageNew: !this.state.stageNew })}>
                    <Text style={styles.buttonText}>{ this.state.stageNew ? 'Já possui conta?' : 'Ainda não possui conta?' }</Text>
                </TouchableOpacity>

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
        fontFamily: commonStyle.fontFamily,
        color: commonStyle.colors.secondary,
        fontSize: 70,
        marginBottom: 10
    },
    input: {
        marginTop: 10,
        backgroundColor: 'white',
    },
    formContainer: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 20,
        width: '90%'
    },
    button: {
        backgroundColor: '#080',
        marginTop: 10,
        padding: 10,
        alignItems: 'center',
        borderRadius: 7
    },
    buttonText: {
        fontFamily: commonStyle.fontFamily,
        color: 'white',
        fontSize: 20
    },
    subTitle: {
        fontFamily: commonStyle.fontFamily,
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
        marginBottom: 10
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})