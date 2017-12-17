import ConfigService from 'src/services/ConfigService';

export const REQUEST_CONFIG = 'REQUEST_CONFIG';
export const RECIEVE_CONFIG = 'RECIEVE_CONFIG';
export const SAVE_CONFIG = 'SAVE_CONFIG';
export const SAVED_CONFIG = 'SAVED_CONFIG';

export function requestConfig() {
    return { type: REQUEST_CONFIG };
}

export function recieveConfig(config) {
    return { type: RECIEVE_CONFIG, config };
}

export function saveConfig(config) {
    return { type: SAVE_CONFIG, config };
}

export function savedConfig(config) {
    return { type: SAVED_CONFIG, config };
}

export function fetchConfig() {
    return dispatch => {
        dispatch(requestConfig());
        return ConfigService.fetchConfig()
            .then(config => dispatch(recieveConfig(config)));
    }
}

export function ______FINDMEANAME____saveConfig(config) {
    return dispatch => {
        dispatch(saveConfig(config));
        return ConfigService.saveConfig(config)
            .then(() => dispatch(savedConfig(config)));
    };
}