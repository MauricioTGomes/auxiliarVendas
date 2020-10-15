import React, { Component } from 'react'
import FormInput from '../Form/Input'
import getRealm from '../../realm/realm';
import {
    Text,
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Modal,
} from 'react-native'
import { DataTable } from 'react-native-paper';
import BotaoPesquisar from '../Form/BotaoPesquisar'

const initialState = { nome: '', cidades: [], showModal: false}

export default class PesquisaCidade extends Component {
    state = {
        ...initialState
    }

    setaNome = async nome => {
        this.setState({ nome })
        console.log(this.state.nome.length)
        if (this.state.nome.length >= 3) {
            let realm = (await getRealm())
            let cidades = realm.objects('Cidade').filtered(`nome like "*${this.state.nome}*"`)
            console.log(cidades.length)
            this.setState({ cidades })
        }
    }

    showModal = () => this.setState({ showModal: !this.state.showModal })

    setaCidade = cidade => {
        this.props.input(cidade)
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
                        <Text style={styles.header}>Pesquisar cidade</Text>
                        <FormInput
                            label="Digite um parametro para pesquisa..."
                            value={this.state.nome}
                            onChangeText={this.setaNome}
                        />

                        <DataTable>
                            <DataTable.Header>
                            <DataTable.Title sortDirection='descending'>Nome</DataTable.Title>
                            </DataTable.Header>

                            {
                                this.state.cidades.map((cidade, index) => {
                                    return (
                                        <DataTable.Row onPress={() => this.setaCidade(cidade)} key={index}>
                                            <DataTable.Cell style={styles.cell}>{ cidade.nomeEstado }</DataTable.Cell>
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
        flex: 1,
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
    }
})