import React, { Component } from 'react'
import {View, ScrollView, StyleSheet} from 'react-native'
import commonStyles from '../../commonStyles'
import { TextInput, Button } from 'react-native-paper'
import { TextInputMask } from 'react-native-masked-text'
import { validateCnpj } from 'react-native-masked-text/dist/lib/masks/cnpj.mask'
import { validateCPF } from 'react-native-masked-text/dist/lib/masks/cpf.mask'

import getRealm from '../../realm/realm';
import FormInput from '../../components/Form/Input'
import PesquisaCidade from '../../components/Pessoa/PesquisaCidade'

const pessoaInicial = {ativa: '1', nome: '', tipo: 1, cpf: '', cnpj: '', razao_social: '', fantasia: '', cidade: '', cep: '', endereco: '', endereco_nro: '', bairro: '', complemento: '',}
export default class AddPessoa extends Component {
    state = {
        showModalCidade: false,
        pessoa: {...pessoaInicial},
        modoEditar: false,
        controlaCpfCnpj: {
            type: 'cpf',
            valor: ''
        }
    }

    getFormTipo = () => {
        if (this.state.pessoa.tipo == 1) {
            return (
                <View>
                    <FormInput
                        label="Nome"
                        value={this.state.pessoa.nome}
                        onChangeText={nome => this.setState({ pessoa: {...this.state.pessoa, nome} })}
                    />
                </View>
            )
        } else {
            return (
                <View>
                    <FormInput
                        label="Razão Social"
                        value={this.state.pessoa.razao_social}
                        onChangeText={razao_social => this.setState({ pessoa: {...this.state.pessoa, razao_social} })}
                    />

                    <FormInput
                        label="Fantasia"
                        value={this.state.pessoa.fantasia}
                        onChangeText={fantasia => this.setState({ pessoa: {...this.state.pessoa, fantasia} })}
                    />
                </View>
            )
        }
    }

    setCpfCnpj = cpfCnpj => {
        let pessoa = {...this.state.pessoa}
        let controlaCpfCnpj = {
            valor: cpfCnpj,
            type: 'cpf'
        }

        if (cpfCnpj.length <= 14) {
            pessoa.cpf = cpfCnpj
            pessoa.cnpj = ''
            pessoa.tipo = 1
            pessoa.razao_social = ''
            pessoa.fantasia = ''
        } else {
            controlaCpfCnpj.type = 'cnpj'
            pessoa.cnpj = cpfCnpj
            pessoa.cpf = ''
            pessoa.tipo = 2
            pessoa.nome = ''
        }

        this.setState({ controlaCpfCnpj, pessoa })
    }
    
    formInvalido = () => {
        if (this.state.pessoa.cidade == '' || this.state.pessoa.endereco == '' || this.state.pessoa.endereco_nro == '' || this.state.pessoa.cep == '' || this.state.pessoa.bairro == '') return true
        if (this.state.tipo == 1 && (this.state.pessoa.nome == '' || this.state.pessoa.cpf == '')) return true
        if (this.state.tipo == 2 && (this.state.pessoa.razao_social == '' || this.state.pessoa.cnpj == '' || this.state.pessoa.fantasia == '')) return true
        return false
    }

    salvar = async () => {
        let realm = (await getRealm())
        let pessoa = this.state.pessoa
        
        if (!this.state.modoEditar) {
            const lastPessoa = realm.objects('Pessoa').sorted('id', true)
            const lastId = lastPessoa.length > 0 ? lastPessoa[0].id : 0
            
            pessoa.id = lastId + 1
            pessoa.endereco_nro = parseInt(pessoa.endereco_nro)
            delete pessoa.cidade
        }
        
        realm.write(() => {
            realm.create('Pessoa', pessoa, 'modified')
        })

        this.props.navigation.navigate('ListarPessoa')
    }

    async componentDidMount() {
        if (this.props.route.params !== undefined && this.props.route.params.id !== undefined) {
            let realm = (await getRealm())
            let pessoa = realm.objects('Pessoa').filtered(`id = "${this.props.route.params.id}"`)[0]
            pessoa.cidade = realm.objects('Cidade')[0]
            this.setState({ modoEditar: true, pessoa: {...pessoa, cidade: {}} })
        } else {
            console.log("State: ", this.state.pessoa.nome)
        }
    }

    render() {
        return (
            <View style={commonStyles.containerForm}>
                <ScrollView>
                    <PesquisaCidade
                        input={cidade => {
                            this.setState({ showModalCidade: false, pessoa: {...this.state.pessoa, cidade: cidade} })
                        }}
                        onCancel={() => this.setState({ showModalCidade: false })}
                        isVisible={this.state.showModalCidade}
                    />
                    
                    <FormInput 
                        checkbox
                        label="Ativo"
                        status={this.state.pessoa.ativo ? 'checked' : 'unchecked'}
                        onPress={() => {
                            this.setState({ pessoa: {...this.state.pessoa, ativo: !this.state.pessoa.ativo} })
                        }}
                    />

                    <FormInput
                        label="CPF / CNPJ"
                        value={this.state.controlaCpfCnpj.valor}
                        render={props =>
                            <TextInputMask
                                {...props}
                                type="custom"
                                options={{
                                    mask: this.state.controlaCpfCnpj.type === 'cpf' ? '999.999.999-99*' : '99.999.999/9999-99',
                                    validator: value => {
                                        return validateCnpj(value) || validateCPF(value)
                                    },
                                }}
                                value={this.state.controlaCpfCnpj.valor}
                                onChangeText={this.setCpfCnpj}
                            />
                        }
                    />

                    { this.getFormTipo() }

                    <FormInput
                        label="Cidade"
                        left={
                            <TextInput.Icon 
                                name="account"
                                onPress={() => this.setState({ showModalCidade: true })}
                            />
                        }
                        disabled
                        value={ this.state.pessoa.cidade.nome !== undefined ? `${this.state.pessoa.cidade.nome} - ${this.state.pessoa.cidade.uf}` : '' }
                    />

                    <FormInput
                        label="CEP"
                        value={this.state.pessoa.cep}
                        keyboardType='number-pad'
                        render={props =>
                            <TextInputMask
                                {...props}
                                type="custom"
                                options={{mask: '99.840-999'}}
                                value={this.state.pessoa.cep}
                                onChangeText={cep => this.setState({ pessoa: {...this.state.pessoa, cep} })}
                            />
                        }
                    />

                    <FormInput
                        label="Endereço"
                        value={this.state.pessoa.endereco}
                        onChangeText={endereco => this.setState({ pessoa: {...this.state.pessoa, endereco} })}
                    /> 

                    <FormInput
                        value={this.state.pessoa.endereco_nro}
                        keyboardType='number-pad'
                        label="Número endereço"
                        onChangeText={endereco_nro => this.setState({ pessoa: {...this.state.pessoa, endereco_nro} })}
                    />
                    
                    <FormInput
                        value={this.state.pessoa.bairro}
                        label="Bairro"
                        onChangeText={bairro => this.setState({ pessoa: {...this.state.pessoa, bairro} })}
                    />

                    <FormInput
                        value={this.state.pessoa.complemento}
                        label="Complemento"
                        onChangeText={complemento => this.setState({ pessoa: {...this.state.pessoa, complemento} })}
                    />
                    
                    <View style={commonStyles.buttons}>
                        <Button disabled={this.formInvalido()} mode="contained" color="green" onPress={() => this.salvar()}>
                            Salvar
                        </Button>
                    </View>
                </ScrollView>
            </View>
        )
    }
}