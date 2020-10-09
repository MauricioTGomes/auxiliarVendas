import React, { Component } from 'react'
import {
    Text,
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Modal,
    ScrollView
} from 'react-native'
import { DataTable } from 'react-native-paper';

import FormInput from '../Form/Input'
import getRealm from '../../realm/realm';
import BotaoPesquisar from '../Form/BotaoPesquisar'
import { formatMoney } from '../Functions'

const initialState = { produtos: [], showModal: false, parametrosBuscar: '', loader: false}

export default class PesquisaProduto extends Component {
    state = {
        ...initialState
    }

    buscaProduto = async (parametrosBuscar) => {
        this.setState({ parametrosBuscar, loader: true })
        let realm = (await getRealm())
        
        let produtos = []
        
        if (this.state.parametrosBuscar != '' && this.state.parametrosBuscar.length >= 3) {
            produtos = realm.objects('Produto').filtered(`nome CONTAINS[c] "${this.state.parametrosBuscar}"`)
        }
        this.setState({ 
            produtos: produtos,
            loader: false
        })
    }

    showModal = () => this.setState({ showModal: !this.state.showModal })

    setaProduto = produto => {
        this.props.input(produto)
        this.showModal()
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
                            onChangeText={this.buscaProduto}
                        />

                        <ScrollView>
                            <DataTable style={{flex: 4}}>
                                <DataTable.Header>
                                    <DataTable.Title style={{flex: 2}}>Nome</DataTable.Title>
                                    <DataTable.Title style={{justifyContent: 'flex-end'}}>Estoque</DataTable.Title>
                                    <DataTable.Title style={{justifyContent: 'flex-end'}}>Valor (R$)</DataTable.Title>
                                </DataTable.Header>

                                {
                                    this.state.produtos.map((produto, index) => {
                                        return (
                                            <DataTable.Row onPress={() => this.setaProduto(produto)} key={index}>
                                                <DataTable.Cell>{ produto.nome }</DataTable.Cell>
                                                <DataTable.Cell numeric>{ formatMoney(produto.qtd_estoque) }</DataTable.Cell>
                                                <DataTable.Cell numeric>{ formatMoney(produto.vlr_venda) }</DataTable.Cell>
                                            </DataTable.Row>
                                        )
                                    })
                                }
                            </DataTable>
                        </ScrollView>
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