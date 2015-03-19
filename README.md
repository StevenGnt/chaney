# Chaney

## Chart your money !

## Introduction
This little app allows you to foresee your money speendings, considering your recurring incomes and spendings, etc ...
You can also simulate any spending to compare with a "regular" timeline.x

## Make it work
1. Create app/data/data.json file and fill it with your own use cases (see example.json in the app/data directory).
2. Run gulp in the top-level directory (you might want to adjust some settings in the tasks/config.json file)and access to the app via your server.

## TODOS
- Allow user to add a new recurring
- Allow user to create simulations
- Improve chart rendering (labels, points)
- Make base parameters editable (start value, date ...)
- Master the chart size (height increases when disabling / enabling any simulation)
- Display per day spending instead of the day's value on the point label
- Validation on modals