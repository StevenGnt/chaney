'use strict';

import { RECIEVE_CONFIG, SAVED_CONFIG } from 'src/actions/ConfigActions';

const initialState = {};

export default function ConfigReducer(state = initialState, action) {
    switch (action.type) {
        case RECIEVE_CONFIG:
        case SAVED_CONFIG:
            return action.config;

        default:
            return state;
    }
}