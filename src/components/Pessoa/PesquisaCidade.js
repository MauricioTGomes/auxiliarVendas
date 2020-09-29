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

const initialState = { nome: '', cidades: []}

export default class PesquisaCidade extends Component {
    state = {
        ...initialState
    }

    setaNome = async nome => {
        this.setState({ nome })
        
        if (this.state.nome != '') {
            let cidades = (await getRealm()).objects('Cidade').filtered(`nome like "*${this.state.nome}*"`)
    
            this.setState({ cidades })
        }
    }
    
    render() {
        return (
            <Modal transparent={true} visible={this.props.isVisible} onRequestClose={this.props.onCancel} animationType='slide'>
                <TouchableWithoutFeedback onPress={this.props.onCancel}>
                    <View style={styles.background}></View>
                </TouchableWithoutFeedback>

                <View style={styles.container}>
                    <Text style={styles.header}>Pesquisar cidades</Text>
                    <FormInput
                        label="Nome"
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
                                    <DataTable.Row onPress={() => this.props.input(cidade)} key={index}>
                                        <DataTable.Cell style={styles.cell}>{`${cidade.nome} - ${cidade.uf}`}</DataTable.Cell>
                                    </DataTable.Row>
                                )
                            })
                        }
                    </DataTable>
                </View>

                <TouchableWithoutFeedback onPress={this.props.onCancel}>
                    <View style={styles.background}></View>
                </TouchableWithoutFeedback>
            </Modal>
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