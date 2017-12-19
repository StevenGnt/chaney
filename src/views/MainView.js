'use strict';

import React from 'react';
import { connect } from 'react-redux';

import AppHeader from 'src/components/AppHeader';
import Toolbar from 'src/components/Toolbar';
import Graph from 'src/components/Graph';
import FluxModel from 'src/components/FluxModel';

import { fetchConfig } from 'src/actions/ConfigActions';
import { fetchFluxModels } from 'src/actions/FluxModelsActions';

class MainView extends React.Component {

    componentDidMount() {
        this.props.dispatch(fetchConfig());
        this.props.dispatch(fetchFluxModels());
    }

    getBaseFluxModel() {
        return 'baseFluxModel' in this.props.config && this.props.fluxModels.length > 0 ?
            this.props.fluxModels.find(fluxModel => fluxModel.id === this.props.config.baseFluxModel) :
            undefined;
    }

    render() {
        const { config, fluxModels } = this.props;
        const baseFluxModel = this.getBaseFluxModel();

        let content;

        if (baseFluxModel) {
            content = (
                <div>
                    <Graph baseFluxModel={baseFluxModel} fluxModels={fluxModels} config={config} />
                    <FluxModel fluxModel={baseFluxModel} />
                </div>
            );
        } else {
            content = (<div>Empty</div>);
        }

        return (
            <div>
                <AppHeader />
                <div className="container">
                    <div><Toolbar config={config} /></div>
                    {content}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { config, fluxModels } = state;

    return { config, fluxModels };
}

export default connect(mapStateToProps)(MainView);