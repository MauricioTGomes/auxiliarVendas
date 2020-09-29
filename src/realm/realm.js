import Realm from 'realm';

import { CidadeSchema, PessoaSchema, ProdutoSchema } from './schemas';

export default function getRealm() {
    return Realm.open(
        {
            schema: [CidadeSchema, PessoaSchema, ProdutoSchema],
            schemaVersion: 0
        }
    );
}