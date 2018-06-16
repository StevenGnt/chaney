import conf from 'src/conf';

const ENDPOINT_FLUX_MODELS = `${conf.backendUrl}/flux-models`;

/**
 * @return {Promise}
 */
const getModels = () => fetch(ENDPOINT_FLUX_MODELS).then(data => data.json());

/**
 * @param {Object} fluxModel
 * @return {Promise}
 */
function save(fluxModel) {
    // @todo Use backend
    return new Promise(resolve => setTimeout(resolve, 3000));
}

const FluxModelService = { getModels, save };

export default FluxModelService;