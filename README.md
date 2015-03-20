# Chaney

### Chart your money !

## Introduction
This little app allows you to foresee your money speendings, considering
your recurring incomes and spendings, etc ...
You can also simulate any spending to compare with a "regular" timeline.

## Make it work
1. Create app/data/data.json file and fill it with your own use
   cases (see example.json in the app/data directory).
2. Run "npm install && bower install" to install Chaney's
   dependencies
3. Run "gulp" in the top-level directory (you might want to
   adjust some settings in the tasks/config.json file to fit your
   server's IP / port for instance) and access to the app via your server.

## Evolutions
A component such as ngGrid could be used to build lists and benefit
features such as sorting, etc ...

A server side component could be used to allow the user to save his
configuration at every moment (instead of browsing the menu and
manually export his configuration with the displayed JSON).

Find a more flexible charting library. Searched features :
 - Custom tooltips on hovering points on the chart (display the date,
   its value(s), every occuring expense on that day ...)
 - Correct handling of labels on every axis (keep only 1 of 5
   labels for instance to avoid overcrowded areas)