'use strict';

import React from 'react';
import moment from 'moment';

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
        return (<li>{monthly.label}, {monthly.amount}€ (le {monthly.day})</li>);
    }

    renderWeekly(weekly) {
        const dayNamesMap = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

        return (<li>{weekly.label}, {weekly.amount}€ (les {dayNamesMap[weekly.day]})</li>);
    }

    renderPunctual(punctual) {
        return (<li>{punctual.label}, {punctual.amount}€, (le {moment(punctual.date).format('DD/MM/YYYY')})</li>);
    }
}

export default FluxModelRow;