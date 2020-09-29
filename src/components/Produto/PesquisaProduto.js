import React, { Component } from 'react'
import {
    Text,
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Modal,
} from 'react-native'
import { DataTable } from 'react-native-paper';

import FormInput from '../Form/Input'
import getRealm from '../../realm/realm';
import BotaoPesquisar from '../Form/BotaoPesquisar'
import { formatMoney } from '../Functions'

const initialState = { nome: '', produtos: [], showModal: false}

export default class PesquisaProduto extends Component {
    state = {
        ...initialState
    }

    setaNome = async nome => {
        this.setState({ nome })
        
        if (this.state.nome != '') {
            let produtos = (await getRealm())
                .objects('Produto')
                .filtered(`nome like "*${this.state.nome}*"`)
    
            this.setState({ produtos })
        }
    }

    showModal = () => this.setState({ showModal: !this.state.showModal })

    setaProduto = produto => {
        this.props.input(produto)
        this.showModal()
    }

    async componentDidMount() {
        let produtos = (await getRealm()).objects('Produto')
        this.setState({ produtos })
    }
    
    render() {
        return (
            <View>
                <BotaoPesquisar abreModal={ this.showModal } label={ this.props.value } />

                <Modal transparent={true} visible={this.state.showModal} onRequestClose={this.showModal} animationType='slide'>
                    <TouchableWithoutFeedback onPress={this.showModal}>
                        <View style={styles.background}></View>
                    </TouchableWithoutFeedback>

                    <View style={styles.container}>
                        <Text style={styles.header}>Pesquisar produtos</Text>
                        <FormInput
                            label="Digite um parametro para pesquisa..."
                            value={this.state.nome}
                            onChangeText={this.setaNome}
                        />

                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title style={ styles.colunaUm }>Nome</DataTable.Title>
                                <DataTable.Title style={ styles.colunaDois }>Valor (R$)</DataTable.Title>
                            </DataTable.Header>

                            {
                                this.state.produtos.map((produto, index) => {
                                    return (
                                        <DataTable.Row onPress={() => this.setaProduto(produto)} key={index}>
                                            <DataTable.Cell style={ styles.colunaUm }>{ produto.nome }</DataTable.Cell>
                                            <DataTable.Cell style={ styles.colunaDois }>{ formatMoney(produto.vlr_venda) }</DataTable.Cell>
                                        </DataTable.Row>
                                    )
                                })
                            }
                        </DataTable>
                    </View>

                    <TouchableWithoutFeedback onPress={this.showModal}>
                        <View style={styles.background}></View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    background: {
        flex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },
    container: {
        backgroundColor: 'white'
    },
    header: {
        backgroundColor: '#7c2bff',
        color: 'black',
        textAlign: 'center',
        padding: 15,
        fontSize: 18,
    },
    cell: {
        height: 50,
        borderRadius: 20,
    },
    colunaDois: {
        flex: 2,
        justifyContent: 'center'
    },
    colunaUm:{
        flex: 2
    }
})