import React, {Component} from 'react'
import { View, ScrollView } from 'react-native' 
import Header from '../../components/Header'
import { DataTable, Searchbar } from 'react-native-paper';
import getRealm from '../../realm/realm';
import {formatMoney} from '../../components/Functions'

class ListarProduto extends Component {
    state = {
        produtos: [],
        sorting: 'descending',
        parametrosBuscar: ''
    }

    componentDidMount = async () => {
        let produtos = (await getRealm()).objects('Produto')
        this.setState({ produtos })
    }

    buscaProduto = async parametrosBuscar => {
        this.setState({ parametrosBuscar })
        let realm = (await getRealm())
        
        let produtos = []
        if (this.state.parametrosBuscar != '') {
            produtos = realm.objects('Produto').filtered(`nome like "*${this.state.parametrosBuscar}*"`)
        } else {
            produtos = realm.objects('Produto')
        }
        this.setState({ produtos })
    }

    controlaSortTable = () => this.setState({ sorting: this.state.sorting == 'descending' ? 'ascending' : 'descending' })

    render() {
        return (
            <View style={{flex: 1}}>
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
                                <DataTable.Title style={{flex: 2}} sortDirection={this.state.sorting} onPress={this.controlaSortTable}>Nome</DataTable.Title>
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
                        </DataTable>
                    </ScrollView>
                </View>
            </View>
        )
    }
}

export default ListarProduto