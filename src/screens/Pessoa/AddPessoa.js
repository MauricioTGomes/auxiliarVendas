import React, { Component } from 'react'
import {View, ScrollView, Alert} from 'react-native'
import commonStyles from '../../commonStyles'
import { Button } from 'react-native-paper'
import { TextInputMask } from 'react-native-masked-text'
import NetInfo from "@react-native-community/netinfo";
import { enviaPessoa } from '../../services/Functions'
import moment from 'moment'
import 'moment/locale/pt-br'

import getRealm from '../../realm/realm';
import FormInput from '../../components/Form/Input'
import PesquisaCidade from '../../components/Pessoa/PesquisaCidade'
import { formatForCalc } from '../../components/Functions'

const pessoaInicial = {ativo_checkbox: 'checked', ativo: 1, nome: '', tipo: 1, cpf: '', cnpj: '', razao_social: '', fantasia: '', cidade: '', cep: '', endereco: '', endereco_nro: '', bairro: '', complemento: '', limite_credito: '0,00'}
export default class AddPessoa extends Component {
    state = {
        showModalCidade: false,
        pessoa: {},
        modoEditar: false,
        controlaCpfCnpj: {
            type: 'cpf',
            valor: ''
        }
    }

    verificaCidades = async () => {
        let realm = (await getRealm())
        if (realm.objects('Cidade').length <= 0) {
            realm.write(() => {
                realm.create('Cidade', {id: 3, nome: 'Sananduva3', uf: 'RS', codigo_ibge: 123456})
            })
        }
    }

    getFormTipo = () => {
        let tipo = this.state.pessoa.tipo
        if (parseInt(tipo) == 1) {
            return (
                <View>
                    <FormInput
                        label="Nome"
                        value={this.state.pessoa.nome}
                        onChangeText={nome => this.setState({ pessoa: { ...this.state.pessoa, nome: nome} })}
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

    controlaCheckBox = () => {
        let pessoa = this.state.pessoa
        let ativoAtual = pessoa.ativo != undefined ? this.state.pessoa.ativo : 0
        pessoa.ativo = ativoAtual == 1 ? 0 : 1,
        pessoa.ativo_checkbox = ativoAtual == 1 ? 'unchecked' : 'checked'
        
        this.setState({ pessoa })
    }

    salvar = async () => {
        try {
            let realm = (await getRealm())
            let pessoa = this.state.pessoa
            
            if (!this.state.modoEditar) {
                const lastPessoa = realm.objects('Pessoa').sorted('id', true)
                const lastId = lastPessoa.length > 0 ? lastPessoa[0].id : 0
                
                pessoa.id = lastId + 1
                pessoa.data_criacao = moment().locale('pt-br').format('YYYY-MM-DD')
            } else {
                pessoa.data_alteracao = moment().locale('pt-br').format('YYYY-MM-DDTHH:MM:SS')
            }
            
            let pessoaBanco = null
            pessoa.limite_credito = formatForCalc(pessoa.limite_credito)
            realm.write(() => {
                pessoaBanco = realm.create('Pessoa', pessoa, 'modified')
            })

            let netInfo = null
            await NetInfo.fetch().then(state => netInfo = state)
            if (netInfo && netInfo.isConnected) {
                enviaPessoa(pessoaBanco, realm)
            }
    
            Alert.alert('Sucesso!', 'Pessoa cadastrada com sucesso.', [{
                text: 'OK',
                onPress: this.props.navigation.navigate('ListarPessoa'),
            }])
        } catch (e) {
            Alert.alert('Atenção!', `Erro ao cadastrar pessoa. ${e}`)
        }
    }

    setaDadosPessoa = ({ id, ativo, nome, tipo, cpf, cnpj, razao_social, fantasia, cidade, cep, endereco, endereco_nro, bairro, complemento, data_criacao }) => {
        let ativo_checkbox = ativo == 0 ? 'unchecked' : 'checked'
        this.setState({
            pessoa: { ...this.state.pessoa, id, ativo, ativo_checkbox, nome, tipo, cpf, cnpj, razao_social, fantasia, cidade, cep, endereco, endereco_nro, bairro, complemento, data_criacao }
        })
    }

    async componentDidMount() {
        this.verificaCidades()
        
        if (this.props.route.params !== undefined && this.props.route.params.pessoaID !== undefined) {
            let pessoaBanco = (await getRealm()).objects("Pessoa").filtered(`id = ${this.props.route.params.pessoaID}`)[0]
            
            this.setState({
                modoEditar: true,
                controlaCpfCnpj: {
                    valor: pessoaBanco.tipo == 2 ? pessoaBanco.cnpj : pessoaBanco.cpf,
                    type: pessoaBanco.tipo == 2 ? 'cnpj' : 'cpf'
                }
            })
            this.setaDadosPessoa(pessoaBanco)
        } else {
            this.setState({pessoa: pessoaInicial})
        }
    }

    render() {
        const mascaraCpfCnpj = {
            mask: this.state.controlaCpfCnpj.type === 'cpf' ? '999.999.999-99*' : '99.999.999/9999-99'
        }

        return (
            <View style={commonStyles.containerForm}>
                <ScrollView>
                    <FormInput 
                        checkbox
                        label="Ativo"
                        status={this.state.pessoa.ativo_checkbox}
                        onPress={this.controlaCheckBox}
                    />

                    <FormInput
                        label="CPF / CNPJ"
                        value={this.state.controlaCpfCnpj.valor}
                        render={props =>
                            <TextInputMask
                                {...props}
                                type="custom"
                                options={ mascaraCpfCnpj }
                                value={this.state.controlaCpfCnpj.valor}
                                onChangeText={this.setCpfCnpj}
                            />
                        }
                    />

                    { this.getFormTipo() }

                    <PesquisaCidade
                        input={cidade => this.setState({ showModalCidade: false, pessoa: {...this.state.pessoa, cidade: cidade} })}
                        value={ this.state.pessoa.cidade != undefined && this.state.pessoa.cidade.nome !== undefined ? this.state.pessoa.cidade.nomeEstado : 'Cidade' }
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
                        label="Inscrição estadual"
                        value={this.state.pessoa.ie}
                        keyboardType='number-pad'
                        onChangeText={ie => this.setState({ pessoa: {...this.state.pessoa, ie} })}
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
                    
                    <FormInput
                        label='Limite de crédito'
                        value={ this.state.pessoa.limite_credito }
                        render={props => 
                            <TextInputMask
                                {...props}
                                type='money'
                                options={commonStyles.optionsInputMoney}
                                onChangeText={(limite_credito) => this.setState({ pessoa: {...this.state.pessoa, limite_credito} })}
                            />
                        }
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