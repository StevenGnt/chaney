import { combineReducers } from 'redux';

import config from 'src/reducers/ConfigReducer';
import fluxModels from 'src/reducers/FluxModelsReducer';

const appReducer = combineReducers({ config, fluxModels });

export default appReducer;