import Realm from 'realm';

import ConfiguracaoSchema from './schemas/Configuracao'
import PessoaSchema from './schemas/Pessoa'
import CidadeSchema from './schemas/Cidade'
import ProdutoSchema from './schemas/Produto'
import FormaPagamentoSchema from './schemas/FormaPagamento'
import ParcelaSchema from './schemas/Parcela'
import PagamentoSchema from './schemas/Pagamento'
import ItemSchema from './schemas/Item'
import PedidoSchema from './schemas/Pedido'

export default function getRealm() {
    return Realm.open(
        {
            schema: [ConfiguracaoSchema, CidadeSchema, PessoaSchema, ProdutoSchema, FormaPagamentoSchema, ParcelaSchema, PagamentoSchema, ItemSchema, PedidoSchema],
            schemaVersion: 20,
            migration: (oldRealm, newRealm) => {
                if (oldRealm.schemaVersion == 20) {
                    newRealm.deleteAll()
                }

                if (oldRealm.schemaVersion < 2) {
                    const oldObjects = oldRealm.objects('Pessoa');
                    const newObjects = newRealm.objects('Pessoa');
            
                    for (let i = 0; i < oldObjects.length; i++) {
                        newObjects[i].endereco_nro = oldObjects[i].endereco_nro.toString()
                    }
                }
            }
        }
    );
}