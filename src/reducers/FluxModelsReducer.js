'use strict';

import { RECIEVE_FLUX_MODELS, SAVED_FLUX_MODEL } from 'src/actions/FluxModelsActions';

const initialState = [];

export default function FluxModelsReducer(state = initialState, action) {
    switch (action.type) {
        case RECIEVE_FLUX_MODELS:
            return action.fluxModels;

        case SAVED_FLUX_MODEL:
            return [action.fluxModel, ...state.filter(fluxModel => fluxModel.id === action.fluxModel)];

        default:
            return state;
    }
}