import conf from 'src/conf';

// @todo Temporary
import mockFluxModels from 'src/mocks/fluxModels';

/**
 * @return {Promise}
 */
function getModels() {
    // @todo Use backend
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockFluxModels);
        }, 500);
    })
}

/**
 * @param {Object} fluxModel
 * @return {Promise}
 */
function save(fluxModel) {
    // @todo Use backend
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 3000);
    })
}

const FluxModelService = { getModels, save };

export default FluxModelService;