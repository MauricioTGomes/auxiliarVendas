import React, {Component} from 'react'
import { View, ScrollView, StyleSheet, Text, Dimensions, TouchableOpacity } from 'react-native' 
import Icon from 'react-native-vector-icons/FontAwesome'
import { DataTable, Searchbar } from 'react-native-paper';
import OrientationLoadingOverlay from 'react-native-orientation-loading-overlay';

import commonStyles from '../../commonStyles'
import Header from '../../components/Header'
import getRealm from '../../realm/realm';
import { formatMoney } from '../../components/Functions'

class ListarProduto extends Component {
    state = {
        filtrarAtivos: true,
        produtos: [],
        parametrosBuscar: '',
        loader: true,
        pagination: {
            page: 1,
            fim: 1,
            inicio: 1,
            totalItens: 0
        }
    }
    
    componentDidMount = async () => {
        const self = this
        setTimeout(function() {
            self.buscaProduto('', 1)
        }, 500)
    }

    filtroAtivo = () => {
        this.setState({ filtrarAtivos: !this.state.filtrarAtivos })
        this.buscaProduto('', 1)
    }

    buscaProduto = async (parametrosBuscar, page = 1) => {
        this.setState({ parametrosBuscar, loader: true })
        let realm = (await getRealm())
        
        let produtos = []
        if (this.state.parametrosBuscar != '') {
            produtos = await realm.objects('Produto').filtered(`ativo = "${(this.state.filtrarAtivos ? 1 : 0)}" AND nome CONTAINS[c] "${parametrosBuscar}"`)
        } else {
            produtos = await realm.objects('Produto').filtered(`ativo = "${(this.state.filtrarAtivos ? 1 : 0)}"`)
        }

        let totalItens = produtos.length
        let pageInicial = (page * 50) - 50
        
        let pagination = {
            totalItens ,
            page: page,
            inicio: pageInicial + 1,
            fim: pageInicial + 50,
        }

        this.setState({ 
            pagination,
            produtos: produtos.slice(pageInicial, pageInicial + 50),
            loader: false
        })
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <OrientationLoadingOverlay visible={this.state.loader} color="white" indicatorSize="large" messageFontSize={24} message="Buscando produtos..."/>
                
                <Header/>
                
                <View style={{flex: 7}}>
                    <Searchbar
                        placeholder="Buscar produto"
                        onChangeText={this.buscaProduto}
                        value={this.state.parametrosBuscar}
                    />

                    <ScrollView>
                        <DataTable>
                            <DataTable.Header style={ styles.datatableHeader }>
                                <View style={ styles.viewRow }>
                                    <Text style={ styles.titleNome }>Nome</Text>
                                    <View style={ styles.textoValorEstoque }>
                                        <Text style={ styles.titleEstVlr }>Estoque</Text>
                                        <Text style={ styles.titleEstVlr }>Valor (R$)</Text>
                                    </View>
                                </View>                                
                            </DataTable.Header>

                            {
                                this.state.produtos.map((produto, index) => {
                                    return (
                                        <DataTable.Row key={index} style={ styles.rowDatatable }>
                                            <DataTable.Cell>
                                                <View style={ styles.viewRow }>
                                                    <Text>{ produto.nome }</Text>
                                                    <View style={ styles.textoValorEstoque }>
                                                        <Text>{ formatMoney(produto.qtd_estoque) }</Text>
                                                        <Text>{ formatMoney(produto.vlr_venda) }</Text>
                                                    </View>
                                                </View>                                                  
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
                        onPress={this.filtroAtivo}
                        style={ commonStyles.filtrarButton }
                        activeOpacity={0.7}
                    >
                        <Icon name={ this.state.filtrarAtivos ? 'eye' : 'eye-slash' } size={20} color='white' />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    titleEstVlr: {
        fontSize: 10,
        textAlign: 'right',
    },
    titleNome: {
        fontSize: 15,
    },
    datatableHeader: {
        height: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },
    rowDatatable: {
        height: 60,
        margin: 5
    },
    textoValorEstoque: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    viewRow: {
        width: Dimensions.get('window').width - 50
    }
})

export default ListarProduto