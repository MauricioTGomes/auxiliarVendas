import moment from 'moment'
import 'moment/src/locale/pt-br'

class Pessoa {
    get nomeFantasia() {
        return this.tipo == 1 ? this.nome : this.fantasia;
    }
    
    get ultimaAlteracao() {
        return this.data_alteracao != null ? moment(this.data_alteracao, "YYYY-MM-DDTHH:MM:SS").utc(false).locale('pt-br').format("YYYY-MM-DD H:MM:s") : false
    }

    get nomeRazaoSocial() {
        return this.tipo == 1 ? this.nome : (this.razao_social);
    }

    get cpfCnpj() {
        return this.tipo == 1 ? this.cpf : this.cnpj
    }
}
  
Pessoa.schema = {
    name: 'Pessoa',
    primaryKey: 'id',
    properties: {
        id: { type: 'int', indexed: true },
        id_numerama: 'int?',
        ativo: 'int?',
        email: 'string?',
        cidade: {type: 'Cidade?'},
        nome: 'string?',
        cpf: 'string?',
        cnpj: 'string?',
        razao_social: 'string?',
        fantasia: 'string?',
        complemento: 'string?',
        bairro: 'string?',
        cep: 'string?',
        endereco: 'string?',
        endereco_nro: 'string?',
        limite_credito: 'double?',
        saldo_atrasado: 'double?',
        saldo_em_dia: 'double?',
        tipo: 'int',
        data_criacao: 'date?',
        data_alteracao: 'date?',
        ie: 'string?'
    },
};

export default Pessoa