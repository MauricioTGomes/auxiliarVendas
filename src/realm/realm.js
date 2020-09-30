import Realm from 'realm';

import { CidadeSchema, PessoaSchema, ProdutoSchema, FormaPagamentoSchema, ParcelaSchema, PagamentoSchema, ItemSchema, PedidoSchema } from './schemas';

export default function getRealm() {
    return Realm.open(
        {
            schema: [CidadeSchema, PessoaSchema, ProdutoSchema, FormaPagamentoSchema, ParcelaSchema, PagamentoSchema, ItemSchema, PedidoSchema],
            schemaVersion: 11,
            migration: (oldRealm, newRealm) => {
                //if (oldRealm.schemaVersion < 2) {
                if(false) {
                    const oldObjects = oldRealm.objects('Pessoa');
                    const newObjects = newRealm.objects('Pessoa');
            
                    for (let i = 0; i < oldObjects.length; i++) {
                        newObjects[i].endereco_nro = oldObjects[i].endereco_nro.toString()
                    }
                }
                
                const oldObjectsCidades = oldRealm.objects('Cidade');
                if(oldObjectsCidades.length <= 0) {
                    newRealm.create('Cidade', {id: 3, nome: 'Sananduva3', uf: 'RS', codigo_ibge: 123456})
                    newRealm.create('Cidade', {id: 4, nome: 'Lagoa Vermelha', uf: 'RS', codigo_ibge: 123456})
                }
              }
        }
    );
}