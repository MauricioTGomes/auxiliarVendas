import {
    createStore,
    combineReducers,
    compose,
    applyMiddleware
} from 'redux'
import thunk from 'redux-thunk'

import pedidoReducer from './reducers/pedido'
import authReducer from './reducers/auth'

const reducers = combineReducers({
    pedido: pedidoReducer,
    auth: authReducer
})

const storeConfig = () => {
    return createStore(reducers, compose(applyMiddleware(thunk)))
}

export default storeConfig