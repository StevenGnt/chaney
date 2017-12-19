'use strict';

const path = require('path');

const config = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'chaney.bundle.js'
    },
    resolve: {
        alias: {
            src: path.resolve(__dirname, 'src')
        }
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['env', 'react']
                }
            }
        }, {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }]
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist')
    }
};

module.exports = config;