import React, {Component} from 'react'
import { View, ScrollView } from 'react-native' 
import Header from '../../components/Header'
import { DataTable, Searchbar } from 'react-native-paper';
import getRealm from '../../realm/realm';
import {formatMoney} from '../../components/Functions'
import OrientationLoadingOverlay from 'react-native-orientation-loading-overlay';

class ListarProduto extends Component {
    state = {
        produtos: [],
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
        this.buscaProduto('', 1)
    }

    buscaProduto = async (parametrosBuscar, page = 1) => {
        this.setState({ parametrosBuscar, loader: true })
        let realm = (await getRealm())
        
        let produtos = []
        if (this.state.parametrosBuscar != '') {
            produtos = realm.objects('Produto').filtered(`nome CONTAINS[c] "${parametrosBuscar}"`)
        } else {
            produtos = realm.objects('Produto')
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
                        <DataTable style={{flex: 4}}>
                            <DataTable.Header>
                                <DataTable.Title style={{flex: 2}}>Nome</DataTable.Title>
                                <DataTable.Title style={{justifyContent: 'flex-end'}}>Estoque</DataTable.Title>
                                <DataTable.Title style={{justifyContent: 'flex-end'}}>Valor (R$)</DataTable.Title>
                            </DataTable.Header>

                            {
                                this.state.produtos.map((produto, index) => {
                                    return (
                                        <DataTable.Row key={index}>
                                            <DataTable.Cell>{ produto.nome }</DataTable.Cell>
                                            <DataTable.Cell numeric>{ formatMoney(produto.qtd_estoque) }</DataTable.Cell>
                                            <DataTable.Cell numeric>{ formatMoney(produto.vlr_venda) }</DataTable.Cell>
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
                </View>
            </View>
        )
    }
}

export default ListarProduto