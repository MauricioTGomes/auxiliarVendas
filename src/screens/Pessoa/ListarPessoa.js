import React, {Component} from 'react'
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import Header from '../../components/Header'
import Icon from 'react-native-vector-icons/FontAwesome'
import { DataTable } from 'react-native-paper';
import getRealm from '../../realm/realm';

class ListarPessoa extends Component {
    state = {
        pessoas: [],
        sorting: 'descending'
    }

    componentDidMount = async () => {
        let pessoas = (await getRealm()).objects('Pessoa')
        this.setState({ pessoas })
    }

    addPessoa = () => this.props.navigation.navigate('AddPessoa')

    editarPessoa = pessoaID => {
        this.props.navigation.navigate('AddPessoa', {pessoaID})
    }

    controlaSortTable = () => this.setState({ sorting: this.state.sorting == 'descending' ? 'ascending' : 'descending' })

    render() {
        return (
            <View style={{flex: 1}}>
                <Header/>
                <View style={{flex: 7}}>
                <DataTable style={{flex: 5}}>
                    <DataTable.Header>
                        <DataTable.Title style={{flex: 2}} sortDirection={this.state.sorting} onPress={this.controlaSortTable}>Nome / Razao Social</DataTable.Title>
                        <DataTable.Title style={{flex: 2, justifyContent: 'center'}}>CPF / CNPJ</DataTable.Title>
                        <DataTable.Title style={{justifyContent: 'flex-end'}}>Ação</DataTable.Title>
                    </DataTable.Header>

                    {
                        this.state.pessoas.map((pessoa, index) => {
                            return (
                                <DataTable.Row key={index}>
                                    <DataTable.Cell style={{flex: 2}}>
                                        <View>
                                            <Text>{pessoa.nomeFantasia}</Text>
                                            {pessoa.tipo == 2 ? (<Text>{pessoa.razao_social}</Text>) : false}
                                        </View>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={{flex: 2, justifyContent: 'center'}} numeric>{ pessoa.cpfCnpj }</DataTable.Cell>
                                    <DataTable.Cell style={{justifyContent: 'flex-end'}}>
                                        <TouchableOpacity onPress={this.editarPessoa}>
                                            <Icon size={20} name='pencil' color='green' onPress={() => this.editarPessoa(pessoa.id)}/>
                                        </TouchableOpacity>
                                    </DataTable.Cell>
                                </DataTable.Row>
                            )
                        })
                    }
                </DataTable>

                    <TouchableOpacity
                        onPress={this.addPessoa}
                        style={styles.addButton}
                        activeOpacity={0.7}
                    >
                        <Icon name="plus" size={20} color='white'/>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'blue'
    }
})


export default ListarPessoa