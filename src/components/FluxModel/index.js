'use strict';

import React from 'react';

import FluxModelRow from './FluxModelRow';

class FluxModel extends React.Component {

    renderFluxModelRows(rows, type, title) {
        const renderedRow = rows.map((row, index) => <FluxModelRow key={index} type={type} row={row} />);
        return (
            <div className="{type}">
                <span className="title">{title}</span>
                <div>{renderedRow}</div>
            </div>
        );
    }

    render() {
        const expenses = {};

        if (this.props.fluxModel.monthly) {
            expenses.monthly = this.renderFluxModelRows(this.props.fluxModel.monthly, 'monthly', 'Monthly');
        }

        if (this.props.fluxModel.weekly) {
            expenses.weekly = this.renderFluxModelRows(this.props.fluxModel.weekly, 'weekly', 'Weekly');
        }

        if (this.props.fluxModel.punctual) {
            expenses.punctual = this.renderFluxModelRows(this.props.fluxModel.punctual, 'punctual', 'Punctual');
        }

        if (expenses.monthly || expenses.weekly || expenses.punctual) {
            return (
                <div className="flux-model">
                    {expenses.monthly}
                    {expenses.weekly}
                    {expenses.punctual}
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