import React from 'react';
import moment from 'moment';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'Recharts';

const dateLabelFormat = 'DD/MM/YY';
const linesColors = ['rebeccapurple', '#82ca9d'];

/**
 * Generate a random color that does not belong to the initial
 * set of strokes color
 * @return {String}
 */
function getRandomColor() {
    let i = 0;

    // Attempt (100 times max) to generate a non-used random color
    while (i < 100) {
        i++;
        const color = '#' + Math.random().toString(16).substr(-6);
        if (!linesColors.includes(color)) {
            return color;
        }
    }

    return 'black';
}

/**
 * Check wether a transaction should be considered as active or not according
 * to its start and end date
 * @param {Object} transaction
 * @param {Object} date 
 * @return {Boolean}
 */
function isTransactionActiveAtGivenDate(transaction, date) {
    const hasStarted = 'start' in transaction ? moment(transaction.start) <= date : true;
    const hasNotFinished = 'end' in transaction ? moment(transaction.end) >= date : true;

    return hasStarted && hasNotFinished;
};

class Graph extends React.Component {

    /**
     * Prepare the data for the graph
     * @param {Object} config
     * @param {Object} baseFluxModel
     * @param {Array<Object>} fluxModels
     * @return <Object>
     */
    prepareData(config, baseFluxModel, fluxModels) {
        const graphData = [];

        const usedFluxModels = fluxModels.filter(fluxModel => fluxModel.id !== baseFluxModel.id); // @todo handle only enabled flux
        // For each flux models, we need to merge the base flux transactions
        // to compute every value by using the base flux as a base
        usedFluxModels.forEach(fluxModel => {
            ['monthly', 'weekly', 'punctual'].forEach(prop => {
                fluxModel[prop] = [
                    ...(fluxModel[prop] || []),
                    ...(baseFluxModel[prop] || [])
                ];
            });
        });

        usedFluxModels.push(baseFluxModel);

        const metadata = {
            usedFluxModelsNames: usedFluxModels.map(fluxModel => fluxModel.name),
            perDayTransactions: {}
        };

        const addToPerDayUsed = (day, fluxModel, transactions) => {
            if (!(day in metadata.perDayTransactions)) {
                metadata.perDayTransactions[day] = {};
            }

            metadata.perDayTransactions[day][fluxModel.name] = transactions.map(transaction => `${transaction.label} (${transaction.amount})`);
        };

        const cursorDate = moment(config.startingDate);
        const endDate = cursorDate.clone();
        endDate.add(config.duration, 'months');

        while (cursorDate <= endDate) {
            const dateName = cursorDate.format(dateLabelFormat);

            /**
             * Compute the amount at the end of a given day by performing
             * every transaction of the flux model for the current day
             * @param {Object} fluxModel
             * @param {Float} amount Base amount
             */
            const computeDayValue = (fluxModel, amount) => {
                let transactions = [];

                // Gather used transactions for the day
                if ('monthly' in fluxModel && fluxModel.monthly.length > 0) {
                    const currentMonthDay = parseInt(cursorDate.format('D'));
                    const monthlyUsed = fluxModel.monthly.filter(row => row.day === currentMonthDay);
                    transactions.push(monthlyUsed);
                }

                if ('weekly' in fluxModel && fluxModel.weekly.length > 0) {
                    const currentWeekDay = parseInt(cursorDate.format('d'));
                    const weeklyUsed = fluxModel.weekly.filter(row => row.day === currentWeekDay);
                    transactions.push(weeklyUsed);
                }

                if ('punctual' in fluxModel && fluxModel.punctual.length > 0) {
                    const currentDate = cursorDate.format('YYYY-MM-DD');
                    const punctualUsed = fluxModel.punctual.filter(row => row.date === currentDate);
                    transactions.push(punctualUsed);
                }

                transactions = [].concat(...transactions);

                // Remove inactive transactions for the current date
                transactions = transactions.filter(transaction => isTransactionActiveAtGivenDate(transaction, cursorDate));

                if (transactions.length > 0) {
                    addToPerDayUsed(dateName, fluxModel, transactions);
                    amount += transactions.reduce((total, used) => total + used.amount, 0);
                }

                // Round to the 2nd decimal
                amount = Math.round(amount * 100) / 100;

                return amount;
            };

            const row = { dateName };

            // Compute other flux models day values based on current day value with base flux model
            usedFluxModels.forEach(fluxModel => {
                const amount = graphData.length === 0 ? config.initialAmount : graphData[graphData.length - 1][fluxModel.name];
                row[`${fluxModel.name}`] = computeDayValue(fluxModel, amount);
            });

            graphData.push(row);

            cursorDate.add(1, 'day');
        }

        return { graphData, metadata };
    }

    render() {
        const { config, baseFluxModel, fluxModels } = this.props;
        const { graphData, metadata } = this.prepareData(config, baseFluxModel, fluxModels);

        const availableColors = [...linesColors];
        const getLineColor = () => availableColors.length > 0 ? availableColors.shift() : getRandomColor();

        // Build every line of the graph
        const graphLines = [];
        metadata.usedFluxModelsNames.forEach((fluxModelName, i) => {
            graphLines.push(<Line unit="€" type="monotone" key={i} dot={false} dataKey={fluxModelName} stroke={getLineColor()} />);
        });

        return (
            <ResponsiveContainer width={"100%"} height={600}>
                <LineChart data={graphData}>
                    <XAxis dataKey="dateName" />
                    <YAxis />
                    {graphLines}
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                </LineChart>
            </ResponsiveContainer>
        );
    }
}

export default Graph;