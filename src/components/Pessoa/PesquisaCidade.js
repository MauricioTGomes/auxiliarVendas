import React, { Component } from 'react'
import FormInput from '../Form/Input'
import getRealm from '../../realm/realm';
import {
    Text,
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Modal,
    TouchableOpacity,
    ScrollView
} from 'react-native'
import { DataTable } from 'react-native-paper';
import BotaoPesquisar from '../Form/BotaoPesquisar'
import commonStyles from '../../commonStyles'
import Icon from 'react-native-vector-icons/FontAwesome'

const initialState = { nome: '', cidades: [], showModal: false}

export default class PesquisaCidade extends Component {
    state = {
        ...initialState
    }

    setaNome = async nome => {
        this.setState({ nome })
        if (this.state.nome.length >= 3) {
            let realm = (await getRealm())
            let cidades = realm.objects('Cidade').filtered(`nome CONTAINS[c] "${this.state.nome}"`)
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
                        <View style={ commonStyles.modalPesquisa.header }>
                            <Text style={ commonStyles.modalPesquisa.textoHader }>Detalhes pedido</Text>
                            
                            <TouchableOpacity  onPress={this.showModal}>
                                <Icon name="close" size={20} color='white'/>
                            </TouchableOpacity>
                        </View>

                        <FormInput
                            label="Digite 3 caracteres para buscar."
                            value={this.state.nome}
                            onChangeText={this.setaNome}
                        />

                        <ScrollView>
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
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
    },
    container: {
        backgroundColor: 'white'
    },
    cell: {
        height: 50,
        borderRadius: 20,
    }
})