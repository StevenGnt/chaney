'use strict';

import React from 'react';
import moment from 'moment';

/**
 * Get the ending string of a day's number name
 * @param {number} day 
 * @returns {string}
 */
function getDayEndingName(day) {
    if (day === 1) {
        return 'st';
    } else if (day === 2) {
        return 'nd';
    } else if (day === 3) {
        return 'rd';
    }
    return 'th';
}

/**
 * Render the amount of a transaction
 * @param {number} amount Transaction amount
 * @returns {JSXTemplate}
 */
function renderAmount(amount) {
    return <span className={amount > 0 ? 'label label-success' : 'label label-danger'}>{amount}€</span>;
}

/**
 * Render a monthly transaction row
 * @param {Object} monthly
 * @returns {JSXTemplate}
 */
function renderMonthly(monthly) {
    const dayEnd = getDayEndingName(monthly.day);
    return <span>{renderAmount(monthly.amount)} <b>{monthly.label}</b> every {monthly.day}{dayEnd}</span>;
}

/**
 * Render a weekly transaction row
 * @param {Object} weekly
 * @returns {JSXTemplate}
 */
function renderWeekly(weekly) {
    const dayNamesMap = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return (<span>{renderAmount(weekly.amount)} <b>{weekly.label}</b> every {dayNamesMap[weekly.day]}</span>);
}

/**
 * Render a punctual transaction row
 * @param {Object} punctual
 * @returns {JSXTemplate}
 */
function renderPunctual(punctual) {
    return (<span>{renderAmount(punctual.amount)} <b>{punctual.label}</b> on {moment(punctual.date).format('DD/MM/YYYY')}</span>);
}

class FluxModelRow extends React.Component {

    render() {
        const { type, row } = this.props;
        switch (type) {
            case 'monthly':
                return renderMonthly(row);
            case 'weekly':
                return renderWeekly(row);
            case 'punctual':
                return renderPunctual(row);
            default:
                throw 'Unable to render provided FluxModelRow';
        }
    }
}

export default FluxModelRow;