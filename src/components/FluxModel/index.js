'use strict';

import React from 'react';

import FluxModelRow from './FluxModelRow';

/**
 * Render the rows of a flux model
 * @param {Object} fluxModel 
 * @param {String} type Type of rows to render
 * @returns {JSXTemplate}
 */
function renderFluxModelRows(rows, type) {
    // No data
    if (rows.length < 1) {
        return '';
    }

    // Sort data chronologically
    const sortField = type === 'punctual' ? 'date' : 'day';
    rows.sort((a, b) => a[sortField] - b[sortField]);

    const renderedRow = rows.map((row, index) =>
        <span key={index}>
            <FluxModelRow type={type} row={row} /><br />
        </span>);

    return <div>{renderedRow}</div>;
}
class FluxModel extends React.Component {

    render() {
        const expenses = {};

        // Render each section of the flux model per type
        const sections = [{
            name: 'Monthly',
            render: renderFluxModelRows(this.props.fluxModel.monthly || [], 'monthly')
        }, {
            name: 'Weekly',
            render: renderFluxModelRows(this.props.fluxModel.weekly || [], 'weekly')
        }, {
            name: 'Punctual',
            render: renderFluxModelRows(this.props.fluxModel.punctual || [], 'punctual')
        }];

        // Rewrap each rendered section
        const renderedSections = sections
            .filter(section => !!section.render) // Remove empty renders (= no info)
            .map((section, index) => (
                <div key={index} className="col-md-4">
                    <dl className="flux-model dl-horizontal">
                        <dt>{section.name}</dt>
                        <dd>{section.render}</dd>
                    </dl>
                </div>));

        if (renderedSections.length > 0) {
            return (
                <div>
                    <h3>{this.props.fluxModel.name}</h3>
                    <div className="well well-sm">
                        <div className="row">
                            {renderedSections}
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div>Nothing to show</div>
            );
        }
    }
}

export default FluxModel;