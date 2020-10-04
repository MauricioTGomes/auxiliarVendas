import { SETA_LOGIN } from '../actions/auth'

let newState = {
    user: {}
}

export default function(state = newState, action) {
    switch(action.type) {
        case SETA_LOGIN:
            state.user = action.payload
            return state
        default:
            return state
    }
}