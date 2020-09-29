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

const initialState = { nome: '', formas: [], showModal: false}

export default class PesquisaFormaPagamento extends Component {
    state = {
        ...initialState
    }

    setaNome = async nome => {
        this.setState({ nome })
        
        if (this.state.nome != '') {
            //let formas = (await getRealm()).objects('Produto').filtered(`nome like "*${this.state.nome}*"`)
            let formas = [{nome: 'Á vista', tipo: 'VISTA', id: 1}, {nome: 'Á prazo', tipo: 'PRAZO', id: 2}]
            this.setState({ formas })
        }
    }

    showModal = () => this.setState({ showModal: !this.state.showModal })

    setaForma = forma => {
        this.props.input(forma)
        this.showModal()
    }

    async componentDidMount() {
        //let formas = (await getRealm()).objects('Produto')
        let formas = [{nome: 'Á vista', tipo: 'VISTA', id: 1}, {nome: 'Á prazo', tipo: 'PRAZO', id: 2}]
        this.setState({ formas })
    }
    
    render() {
        return (
            <View>
                <BotaoPesquisar disabled={this.props.disabled} abreModal={ this.showModal } label={ this.props.value } />

                <Modal transparent={true} visible={this.state.showModal} onRequestClose={this.showModal} animationType='slide'>
                    <TouchableWithoutFeedback onPress={this.showModal}>
                        <View style={styles.background}></View>
                    </TouchableWithoutFeedback>

                    <View style={styles.container}>
                        <Text style={styles.header}>Pesquisar formas</Text>
                        <FormInput
                            label="Digite um parametro para pesquisa..."
                            value={this.state.nome}
                            onChangeText={this.setaNome}
                        />

                        <DataTable>
                            <DataTable.Header>
                                <DataTable.Title style={ styles.colunaUm }>Nome</DataTable.Title>
                            </DataTable.Header>

                            {
                                this.state.formas.map((forma, index) => {
                                    return (
                                        <DataTable.Row onPress={() => this.setaForma(forma)} key={index}>
                                            <DataTable.Cell style={ styles.colunaUm }>{ forma.nome }</DataTable.Cell>
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