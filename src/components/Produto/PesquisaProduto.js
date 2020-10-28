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

import commonStyles from '../../commonStyles'
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
            produtos = realm.objects('Produto').filtered(`nome CONTAINS[c] "${this.state.parametrosBuscar}" AND ativo = '1'`)
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
                            label="Digite 3 caracteres para buscar."
                            value={this.state.nome}
                            onChangeText={this.buscaProduto}
                        />

                        <ScrollView>
                            <DataTable>
                                <DataTable.Header style={ commonStyles.datatables.datatableHeader }>
                                    <View style={ commonStyles.datatables.produtos.viewRow }>
                                        <Text style={ commonStyles.datatables.produtos.titleNome }>Nome</Text>
                                        <View style={ commonStyles.datatables.produtos.textoValorEstoque }>
                                            <Text style={ commonStyles.datatables.produtos.titleEstVlr }>Estoque</Text>
                                            <Text style={ commonStyles.datatables.produtos.titleEstVlr }>Valor (R$)</Text>
                                        </View>
                                    </View>                                
                                </DataTable.Header>

                                {
                                    this.state.produtos.map((produto, index) => {
                                        return (
                                            <DataTable.Row key={index} onPress={() => this.setaProduto(produto)}>
                                                <DataTable.Cell>
                                                    <View style={ commonStyles.datatables.produtos.viewRow }>
                                                        <Text style={ commonStyles.datatables.produtos.titleNome }>{ produto.nome }</Text>
                                                        <View style={ commonStyles.datatables.produtos.textoValorEstoque }>
                                                            <Text style={ commonStyles.datatables.produtos.titleEstVlr }>{ formatMoney(produto.qtd_estoque) }</Text>
                                                            <Text style={ commonStyles.datatables.produtos.titleEstVlr }>{ formatMoney(produto.vlr_venda) }</Text>
                                                        </View>
                                                    </View>                                                  
                                                </DataTable.Cell>
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
        backgroundColor: '#005000',
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