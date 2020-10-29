import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import OrientationLoadingOverlay from 'react-native-orientation-loading-overlay';
import axios from 'axios'
import { connect } from 'react-redux'
import Header from '../components/Header'
import { setaUser } from '../store/actions/auth'
import getRealm from '../realm/realm'
import Icon from 'react-native-vector-icons/FontAwesome'
import { iniciaSincronismo } from '../services/Functions'
import BackgroundTimer from 'react-native-background-timer';
import moment from 'moment'
import 'moment/src/locale/pt-br'

BackgroundTimer.runBackgroundTimer(() => { 
    iniciaSincronismo()
}, 900000);// 3600000

class Inicial extends Component {
    state = {
        loader: false,
        ultimaAttPessoa: '',
        ultimaAttProduto: '',
        ultimaAttPedido: '',
    }
    
    async componentDidMount() {
        const self = this
        setTimeout(function () {
            self.getDadosTela()
        }, 200)
    }

    getDadosTela = async () => {
        const userDataJson = await AsyncStorage.getItem('userData')
        let userData = JSON.parse(userDataJson)
        this.props.setaUser(userData)

        let configuracao = (await getRealm()).objects('Configuracao')[0]
        this.setState({
            ultimaAttPedido: configuracao.ultima_sincronizacao_pedido,
            ultimaAttPessoa: configuracao.ultima_sincronizacao_pessoa,
            ultimaAttProduto: configuracao.ultima_sincronizacao_produto,
        })
    }

    logout = () => {
        AsyncStorage.removeItem('userData')
        axios.defaults.headers.common['Authorization'] = null
        this.props.navigation.navigate('AuthOrApp')
    }

    sincronizar = async () => {
        this.setState({ loader: true })
        let retorno = await iniciaSincronismo()

        if (retorno) {
            Alert.alert('Sucesso!', `Os dados foram atualizados.`)
        } else {
            Alert.alert('Erro!', 'Erro ao sincronizar, verifique sua conexão.')
        }

        this.getDadosTela()
        this.setState({ loader: false })
    }

    render() {
        return (
            <View style={ styles.tela }>
                <OrientationLoadingOverlay visible={this.state.loader} color="white" indicatorSize="large" messageFontSize={24} message="Sincronizando..."/>

                <Header {...this.props}/>
                
                <View style={styles.containerBemVindo}>
                    <View>
                        <Text style={styles.textoBemVindo}>Bem-vindo,</Text>
                        <Text style={styles.textoNome}>{ this.props.auth.user.name }</Text>
                    </View>

                    <TouchableOpacity style={styles.botaoSair} activeOpacity={0.7} onPress={() => this.logout()}>
                        <Icon name='sign-out' size={30} color='white' />
                    </TouchableOpacity>
                </View>

                <View style={styles.container}>
                    <Text style={styles.textoUltimaAtt}>Atualizações</Text>

                    <TouchableOpacity style={ styles.botaoSync } onPress={() => this.sincronizar()}>
                        <View style={ styles.containerBotao }>
                            <Text style={styles.botaoTexto}>Atualizar dados</Text>
                            <Icon name='refresh' size={30} color='white' />
                        </View>
                    </TouchableOpacity>
                    
                    <View style={ styles.containerData }>
                        <Text style={styles.textoData}>Pessoa: { moment(this.state.ultimaAttPessoa, "YYYY-MM-DD H:m:s").locale('pt-br').format("DD/MM/YYYY H:m:s") }</Text>
                        <Text style={styles.textoData}>Produto: { moment(this.state.ultimaAttProduto, "YYYY-MM-DD H:m:s").locale('pt-br').format("DD/MM/YYYY H:m:s") }</Text>
                        <Text style={styles.textoData}>Pedido: { moment(this.state.ultimaAttPedido, "YYYY-MM-DD H:m:s").locale('pt-br').format("DD/MM/YYYY H:m:s") }</Text>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        margin: 20
    },
    botaoSair: {
        width: 50,
        height: 70,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'red'
    },
    containerBemVindo: {
        margin: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    textoBemVindo: {
        fontSize: 30
    },
    textoNome: {
        fontSize: 30,
        marginLeft: 25
    },
    botaoSync: {
        marginTop: 10,
        marginBottom: 10,
        height: 50,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    containerBotao: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 10
    },
    botaoTexto: {
        fontSize: 20,
    },
    tela: {
        flex: 1
    },
    containerData: {
        margin: 20
    },
    textoUltimaAtt: {
        fontSize: 20,
        marginBottom: 5,
        textAlign: 'center'
    },
    textoData: {
        marginLeft: 5,
        fontSize: 20
    },
})

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
    }
}  

const mapDispatchToProps = { setaUser }

export default connect(mapStateToProps, mapDispatchToProps)(Inicial)