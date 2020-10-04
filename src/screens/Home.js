import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Header from '../components/Header'
import { connect } from 'react-redux'
import { setaUser } from '../store/actions/auth'
import AsyncStorage from '@react-native-community/async-storage'

class Home extends Component {
    async componentDidMount() {
        const userDataJson = await AsyncStorage.getItem('userData')
        let userData = JSON.parse(userDataJson)
        this.props.setaUser(userData)
    }

    render() {
        return (
            <View style={ styles.tela }>
                <Header/>
                
                <Text>Entrou Home Page</Text>
                <Text>Name: { this.props.auth.user.name }</Text>
                <Text>Email: { this.props.auth.user.email }</Text>
                <Text>Token: { this.props.auth.user.token }</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    tela: {
        flex: 1
    }
})

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
    }
}  

const mapDispatchToProps = { setaUser }

export default connect(mapStateToProps, mapDispatchToProps)(Home)