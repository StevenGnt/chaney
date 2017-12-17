import moment from 'moment';

import conf from 'src/conf';

// @todo Temporary
import mockConfig from 'src/mocks/config';

/**
 * Fetch the config from backend
 * @return {Promise}
 */
function fetchConfig() {
    // @todo Use backend
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockConfig);
        }, 500);
    })
}

/**
 * Save the config in the backend
 * @param {Object} config
 * @return {Promise}
 */
function saveConfig(config) {
    // @todo Use backend
    return new Promise(resolve => {
        setTimeout(() => {
            _mockAppConfig = config;
        }, 500);
    });
}

const ConfigService = { fetchConfig, saveConfig };

export default ConfigService;