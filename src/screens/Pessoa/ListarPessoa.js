import React, {Component} from 'react'
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView
} from 'react-native'
import Header from '../../components/Header'
import Icon from 'react-native-vector-icons/FontAwesome'
import { DataTable, Searchbar } from 'react-native-paper';
import getRealm from '../../realm/realm';
import OrientationLoadingOverlay from 'react-native-orientation-loading-overlay';

class ListarPessoa extends Component {
    state = {
        pessoas: [],
        parametrosBuscar: '',
        loader: false,
        pagination: {
            page: 1,
            fim: 1,
            inicio: 1,
            totalItens: 0
        }
    }

    componentDidMount = async () => {
        this.buscarPessoas('', 1)
    }

    buscarPessoas = async (parametrosBuscar, page = 1) => {
        this.setState({ parametrosBuscar, loader: true })
        let realm = (await getRealm())
        
        let pessoas = []
        if (this.state.parametrosBuscar != '') {
            pessoas = realm.objects('Pessoa').filtered(`razao_social CONTAINS[c] "${this.state.parametrosBuscar}" OR fantasia CONTAINS[c] "${this.state.parametrosBuscar}" OR nome CONTAINS[c] "${this.state.parametrosBuscar}" OR cpf CONTAINS[c] "${this.state.parametrosBuscar}" OR cnpj CONTAINS[c] "${this.state.parametrosBuscar}"`)
        } else {
            pessoas = realm.objects('Pessoa')
        }

        let totalItens = pessoas.length
        let pageInicial = (page * 50) - 50
        
        let pagination = {
            totalItens ,
            page,
            inicio: pageInicial + 1,
            fim: totalItens < 50 ? totalItens : pageInicial + 50,
        }

        this.setState({ 
            pagination,
            pessoas: pessoas.slice(pageInicial, pageInicial + 50),
            loader: false
        })
    }

    addPessoa = () => this.props.navigation.navigate('AddPessoa')

    editarPessoa = pessoaID => this.props.navigation.navigate('AddPessoa', {pessoaID})

    render() {
        return (
            <View style={{flex: 1}}>
                <OrientationLoadingOverlay visible={this.state.loader} color="white" indicatorSize="large" messageFontSize={24} message="Buscando pessoas..."/>

                <Header/>
                
                <View style={{flex: 7}}>
                    <Searchbar
                        placeholder="Buscar pessoa"
                        onChangeText={this.buscarPessoas}
                        value={this.state.parametrosBuscar}
                    />
                    <ScrollView>
                        <DataTable style={{flex: 5}}>
                            <DataTable.Header>
                                <DataTable.Title numberOfLines={2} style={{flex: 2}}>Nome / Razao Social</DataTable.Title>
                                <DataTable.Title style={{flex: 2, justifyContent: 'center'}}>CPF / CNPJ</DataTable.Title>
                                <DataTable.Title style={{justifyContent: 'flex-end'}}>Ação</DataTable.Title>
                            </DataTable.Header>

                            {
                                this.state.pessoas.map((pessoa, index) => {
                                    return (
                                        <DataTable.Row key={index}>
                                            <DataTable.Cell style={{flex: 2}}>{pessoa.nomeRazaoSocial}</DataTable.Cell>
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

                            <DataTable.Pagination
                                page={this.state.pagination.page}
                                numberOfPages={Math.floor(this.state.pagination.totalItens / 50)}
                                onPageChange={page => this.buscaProduto(this.state.parametrosBuscar, page)}
                                label={`Mostrando de ${this.state.pagination.inicio} até ${this.state.pagination.fim} de ${this.state.pagination.totalItens} registros`}
                            />
                        </DataTable>
                    </ScrollView>

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


/** <View>
                                            <Text>{pessoa.nomeFantasia}</Text>
                                            {pessoa.tipo == 2 ? (<Text>{pessoa.razao_social}</Text>) : false}
                                        </View> */