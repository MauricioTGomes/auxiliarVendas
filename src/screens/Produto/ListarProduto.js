import React, {Component} from 'react'
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native' 
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
            produtos = await realm.objects('Produto')
                        .filtered(`ativo = "${(this.state.filtrarAtivos ? 1 : 0)}" AND nome CONTAINS[c] "${parametrosBuscar}"`)
                        .sorted('nome', false)
        } else {
            produtos = await realm.objects('Produto')
                        .filtered(`ativo = "${(this.state.filtrarAtivos ? 1 : 0)}"`)
                        .sorted('nome', false)
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
                                        <DataTable.Row key={index}>
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
                        style={ styles.filtroButton }
                        activeOpacity={0.7}
                    >
                        <Icon name={ this.state.filtrarAtivos ? 'eye-slash' : 'eye' } size={20} color='white' />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    filtroButton: {
        position: 'absolute',
        right: 30,
        bottom: 50,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'blue'
    },
})

export default ListarProduto