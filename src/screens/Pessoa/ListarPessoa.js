import React, {Component} from 'react'
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { DataTable, Searchbar } from 'react-native-paper';
import OrientationLoadingOverlay from 'react-native-orientation-loading-overlay';
import Swipeable from 'react-native-gesture-handler/Swipeable'

import ModalDetalhes from '../../components/Pessoa/ModalDetalhes'
import commonStyles from '../../commonStyles'
import Header from '../../components/Header'
import getRealm from '../../realm/realm';

class ListarPessoa extends Component {
    state = {
        filtrarAtivos: true,
        pessoas: [],
        parametrosBuscar: '',
        loader: true,
        pagination: {
            page: 1,
            fim: 1,
            inicio: 1,
            totalItens: 0
        },
        detalhes: {
            pessoa: {},
            isVisible: false
        }
    }

    componentDidMount = async () => {
        const self = this
        setTimeout(function() {
            self.buscarPessoas('', 1)
        }, 500)
    }

    buscarPessoas = async (parametrosBuscar, page = 1) => {
        this.setState({ parametrosBuscar })
        let realm = (await getRealm())
        
        let pessoas = []
        if (this.state.parametrosBuscar.length >= 3) {
            this.setState({ loader: true })
            pessoas = await realm.objects('Pessoa').filtered(`ativo = "${(this.state.filtrarAtivos ? 1 : 0)}" AND (razao_social CONTAINS[c] "${this.state.parametrosBuscar}" OR fantasia CONTAINS[c] "${this.state.parametrosBuscar}" OR nome CONTAINS[c] "${this.state.parametrosBuscar}" OR cpf CONTAINS[c] "${this.state.parametrosBuscar}" OR cnpj CONTAINS[c] "${this.state.parametrosBuscar}")`)
        } else if (this.state.parametrosBuscar == '') {
            this.setState({ loader: true })
            pessoas = await realm.objects('Pessoa').filtered(`ativo = "${(this.state.filtrarAtivos ? 1 : 0)}"`)
        }

        if (this.state.parametrosBuscar.length >= 3 || this.state.parametrosBuscar == '') {
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
    }

    addPessoa = () => this.props.navigation.navigate('AddPessoa')

    editarPessoa = pessoaID => this.props.navigation.navigate('AddPessoa', {pessoaID})

    filtroAtivo = () => {
        this.setState({ filtrarAtivos: !this.state.filtrarAtivos })
        this.buscarPessoas('', 1)
    }

    getRightContent = (pessoaID) => {
        return (
            <TouchableOpacity style={ [commonStyles.swipeable, {backgroundColor: 'green'}] } onPress={() => this.editarPessoa(pessoaID)}>
                <Icon name='pencil' size={20} color='white' />
            </TouchableOpacity>
        )
    }

    getLeftContent = (pessoaId) => {
        return (
            <TouchableOpacity style={ [commonStyles.swipeable, {backgroundColor: 'blue'}] } onPress={() => this.abreModalDetalhes(pessoaId)}>
                <Icon name='info' size={20} color='white' />
            </TouchableOpacity>
        )
    }
    
    abreModalDetalhes = async pessoaId => {
        let pessoa = (await getRealm()).objects('Pessoa').filtered(`id = "${pessoaId}"`)[0]
        this.setState({ detalhes: { pessoa, isVisible: true } })
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <OrientationLoadingOverlay visible={this.state.loader} color="white" indicatorSize="large" messageFontSize={24} message="Buscando pessoas..."/>

                <ModalDetalhes { ...this.state.detalhes } onCancel={() => this.setState({ detalhes: { isVisible: false, pessoa: {} } })}/>

                <Header/>
                
                <View style={{flex: 7}}>
                    <Searchbar
                        placeholder="Digite 3 caracteres para buscar."
                        onChangeText={this.buscarPessoas}
                        value={this.state.parametrosBuscar}
                    />
                    
                    <ScrollView>
                        <DataTable>
                            <DataTable.Header style={ commonStyles.datatables.datatableHeader }>
                                <DataTable.Title>
                                    <View>
                                        <Text style={ styles.titleNome }>Nome / Razao Social</Text>
                                        <Text style={ styles.titleDocumento }>CPF / CNPJ</Text>
                                    </View>
                                </DataTable.Title>
                            </DataTable.Header>

                            {
                                this.state.pessoas.map((pessoa, index) => {
                                    return (
                                        <Swipeable renderRightActions={() => this.getRightContent(pessoa.id)} renderLeftActions={() => this.getLeftContent(pessoa.id)} key={index}>
                                            <DataTable.Row key={index} style={ styles.rowDatatable }>
                                                <DataTable.Cell>
                                                    <View>
                                                        <Text>{ pessoa.nomeRazaoSocial }</Text>
                                                        <Text>{ pessoa.cpfCnpj }</Text>
                                                    </View>
                                                </DataTable.Cell>
                                            </DataTable.Row>
                                        </Swipeable>
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
                        onPress={this.filtroAtivo}
                        style={ commonStyles.filtrarButton }
                        activeOpacity={0.7}
                    >
                        <Icon name={ this.state.filtrarAtivos ? 'eye' : 'eye-slash' } size={20} color='white' />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={this.addPessoa}
                        style={ commonStyles.addButton }
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
    titleDocumento: {
        fontSize: 10,
        textAlign: 'right',
    },
    titleNome: {
        fontSize: 15,
    },
    rowDatatable: {
        height: 60,
        margin: 5
    }
})

export default ListarPessoa