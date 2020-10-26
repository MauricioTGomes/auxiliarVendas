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

const initialState = { nome: '', pessoas: []}

export default class PesquisaPessoa extends Component {
    state = {
        ...initialState
    }

    setaNome = async nome => {
        this.setState({ nome })
        
        if (this.state.nome != '') {
            let pessoas = (await getRealm())
                .objects('Pessoa')
                .filtered(`nome like "*${this.state.nome}*" OR razao_social like "*${this.state.nome}*" OR fantasia like "*${this.state.nome}*"`)
    
            this.setState({ pessoas })
        }
    }

    render() {
        return (
            <Modal transparent={true} visible={this.props.isVisible} onRequestClose={this.props.onCancel} animationType='slide'>
                <TouchableWithoutFeedback onPress={this.props.onCancel}>
                    <View style={styles.background}></View>
                </TouchableWithoutFeedback>

                <View style={styles.container}>
                    <Text style={styles.header}>Pesquisar pessoas</Text>
                    <FormInput
                        label="Digite um parametro para pesquisa..."
                        value={this.state.nome}
                        onChangeText={this.setaNome}
                    />

                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title style={{flex: 2}}>Nome / Razao Social</DataTable.Title>
                            <DataTable.Title style={{flex: 2, justifyContent: 'center'}}>CPF / CNPJ</DataTable.Title>
                        </DataTable.Header>

                        {
                            this.state.pessoas.map((pessoa, index) => {
                                return (
                                    <DataTable.Row onPress={() => this.props.input(pessoa)} key={index}>
                                        <DataTable.Cell style={{flex: 2}}>
                                            <View>
                                                <Text>{pessoa.tipo == 1 ? pessoa.nome : pessoa.fantasia}</Text>
                                                {pessoa.tipo == 2 ? (<Text>{pessoa.razao_social}</Text>) : false}
                                            </View>
                                        </DataTable.Cell>
                                        <DataTable.Cell style={{flex: 2, justifyContent: 'center'}} numeric>{pessoa.tipo == 1 ? pessoa.cpf : pessoa.cnpj}</DataTable.Cell>
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
    }
})