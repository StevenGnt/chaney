import FluxModelService from 'src/services/FluxModelService';

export const REQUEST_FLUX_MODELS = 'REQUEST_FLUX_MODELS';
export const RECIEVE_FLUX_MODELS = 'RECIEVE_FLUX_MODELS';
export const SAVE_FLUX_MODEL = 'SAVE_FLUX_MODEL';
export const SAVED_FLUX_MODEL = 'SAVED_FLUX_MODEL';

export function requestFluxModels() {
    return { type: REQUEST_FLUX_MODELS };
}

export function recieveFluxModels(fluxModels) {
    return { type: RECIEVE_FLUX_MODELS, fluxModels };
}

export function saveFluxModel(fluxModel) {
    return { type: SAVE_FLUX_MODEL, fluxModel };
}

export function savedFluxModel(fluxModel) {
    return { type: SAVED_FLUX_MODEL, fluxModel };
}

export function fetchFluxModels() {
    return dispatch => {
        dispatch(requestFluxModels());
        return FluxModelService.getModels()
            .then(fluxModels => dispatch(recieveFluxModels(fluxModels)));
    }
}

export function ______FINDMEANAME____saveFluxModel(fluxModel) {
    return dispatch => {
        dispatch(saveFluxModel(fluxModel));
        return FluxModelService.save(fluxModel)
            .then(() => dispatch(savedFluxModel(fluxModel)));
    };
}