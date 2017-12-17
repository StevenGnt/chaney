'use strict';

import React from 'react';

class FluxModelRow extends React.Component {

    render() {
        const { type, row } = this.props;
        switch (type) {
            case 'monthly':
                return this.renderMonthly(row);
            case 'weekly':
                return this.renderWeekly(row);
            case 'punctual':
                return this.renderPunctual(row);
            default:
                throw 'Unable to render provided FluxModelRow';
        }
    }

    renderMonthly(monthly) {
        return (<div>{JSON.stringify(monthly)}</div>);
    }

    renderWeekly(weekly) {
        return (<div>{JSON.stringify(weekly)}</div>);
    }

    renderPunctual(punctual) {
        return (<div>{JSON.stringify(punctual)}</div>);
    }
}

export default FluxModelRow;