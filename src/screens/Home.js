import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Header from '../components/Header'
import { connect } from 'react-redux'
import { setaUser } from '../store/actions/auth'
import AsyncStorage from '@react-native-community/async-storage'
import getRealm from '../realm/realm'
import { baixarPedidos, baixarPessoas, baixarProdutos } from '../hocs/services/Functions'
import OrientationLoadingOverlay from 'react-native-orientation-loading-overlay';

class Home extends Component {
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

    sincronizar = async tipo => {
        this.setState({ loader: true })
        if (tipo == 'PESSOA') {
            await baixarPessoas()
        } else if(tipo == 'PRODUTO') {
            await baixarProdutos()
        } else {
            await baixarPedidos()
        }
        this.getDadosTela()
        this.setState({ loader: false })
    }

    render() {
        return (
            <View style={ styles.tela }>
                <OrientationLoadingOverlay visible={this.state.loader} color="white" indicatorSize="large" messageFontSize={24} message="Sincronizando..."/>
                
                <Header {...this.props}/>
                
                <View style={styles.container}>
                    <Text style={styles.texto}>{ this.props.auth.user.name }</Text>
                    <Text style={styles.texto}>{ this.props.auth.user.email }</Text>
                    <Text style={styles.texto}>Tem token: { this.props.auth.user.token != null && this.props.auth.user.token != '' ? 'Sim' : 'Não' }</Text>
                </View>
                    

                <View style={styles.container}>
                    <Text style={styles.texto}>Pessoa: { this.state.ultimaAttPessoa }</Text>
                    <Text style={styles.texto}>Produto: { this.state.ultimaAttProduto }</Text>
                    <Text style={styles.texto}>Pedido: { this.state.ultimaAttPedido }</Text>
                </View>

                <View style={styles.containerBotao}>
                    <TouchableOpacity onPress={() => this.sincronizar('PESSOA')}>
                        <View style={styles.botaoSync}>
                            <Text style={styles.botaoTexto}>Sincronizar pessoas</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.sincronizar('PRODUTO')}>
                        <View style={styles.botaoSync}>
                            <Text style={styles.botaoTexto}>Sincronizar Produto</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.containerBotao}>
                    <TouchableOpacity onPress={() => this.sincronizar('PEDIDO')}>
                        <View style={styles.botaoSync}>
                            <Text style={styles.botaoTexto}>Sincronizar pedidos</Text>
                        </View>
                    </TouchableOpacity>

                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    tela: {
        flex: 1
    },
    container: {
        alignItems: 'flex-start',
        marginBottom: 15
    },
    texto: {
        fontSize: 20
    },
    botaoSync: {
        margin: 10,
        width: 150,
        height: 150,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    botaoTexto: {
        marginLeft: 35,
        marginTop: 40,
        fontSize: 15
    },
    containerBotao: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})

const mapStateToProps = (state) => {
    return {
        auth: state.auth,
    }
}  

const mapDispatchToProps = { setaUser }

export default connect(mapStateToProps, mapDispatchToProps)(Home)