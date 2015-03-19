;'use strict';
angular
	.module('Chaney')
	.constant('ChaneyConfig', {
        dateFormat: 'DD/MM/YYYY',
        configPath: '/data/data.json',
        defaultDurationUnit: 'month'
    });