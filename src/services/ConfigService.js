import conf from 'src/conf';

const ENDPOINT_CONFIG = `${conf.backendUrl}/config`;

/**
 * Fetch the config from backend
 * @return {Promise}
 */
const fetchConfig = () => fetch(ENDPOINT_CONFIG).then(data => data.json());

/**
 * Save the config in the backend
 * @param {Object} config
 * @return {Promise}
 */
function saveConfig(config) {
    // @todo Use backend
    return new Promise(resolve => setTimeout(resolve, 3000));
}

const ConfigService = { fetchConfig, saveConfig };

export default ConfigService;