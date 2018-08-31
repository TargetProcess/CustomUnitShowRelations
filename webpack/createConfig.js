const path = require('path');
const webpack = require('webpack');

const pkg = require('../package.json');
const TargetprocessMashupPlugin = require('targetprocess-mashup-webpack-plugin');
const CombineAssetsPlugin = require('combine-assets-plugin');

function createConfig (opts_) {
    const opts = Object.assign({
        mashupName: pkg.name,
        production: false,
        mashupManager: false
    }, opts_);


    // mashup unique name
    const mashupName = opts.mashupName || __dirname.split(path.sep).pop();

    // you should use format <something>.config.js to allow Mashup Manager autodiscover
    // config file
    const outputConfigFileName = './mashup.config.js';

    const config = {};

    config.entry = {
        // process config js module from JSON file
        configData: [
            `targetprocess-mashup-config` +
            `?libraryTarget=${mashupName}&outputFile=${outputConfigFileName}!./src/config.json`
        ],
        // main entry point
        index: ['./src/index.js']

    };

    if (!opts.mashupManager) {
        // produce system configs from JSON file
        config.entry.manifestData = ['targetprocess-mashup-manifest!./src/manifest.json'];
        // prevent automatically load data from `chunks` folder, use for async load by demand
        config.entry.ignoreData = ['file?name=chunks/mashup.ignore!./src/mashup.ignore'];
    }

    config.output = {
        filename: '[name].js',
        path: 'dist',
        chunkFilename: 'chunks/[id].[name].js',
        pathinfo: !opts.production,
        // should be unique to prevent collision with main webpack instance
        jsonpFunction: `webpackJsonp_mashup_${mashupName}`
    };

    config.module = {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loader: 'style!css!postcss?parser=postcss-scss'
            },
            {
                test: /\.html$/,
                loader: 'underscore-template'
            },
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }]
    };

    if (!opts.production) {
        config.debug = true;
        config.devtool = 'eval-source-map';
    }

    config.plugins = [
        new TargetprocessMashupPlugin(mashupName, {
            useConfig: true
        }),
        new webpack.DefinePlugin({
            '__DEV__': process.env.NODE_ENV !== 'production',
            '__PRODUCTION__': process.env.NODE_ENV === 'production',
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),

        new webpack.BannerPlugin(`v${pkg.version} Build ${String(new Date())}`, {
            entryOnly: true
        })
    ];

    let toConcat = {};
    const toExclude = [
        'configData.js',
        'ignoreData.js',
        'manifestData.js'
    ];

    if (opts.mashupManager) {
        toConcat = {
            'index.js': [outputConfigFileName, 'index.js']
        };
    }

    config.plugins = config.plugins.concat(new CombineAssetsPlugin({
        toConcat: toConcat,
        toExclude: toExclude
    }));

    if (opts.mashupManager) {
        // produce single file index.js despite async chunks
        config.plugins = config.plugins.concat(new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        }));
    }

    if (opts.production) {
        config.plugins = config.plugins.concat(new webpack.optimize.UglifyJsPlugin({
            compress: {
                properties: false,
                warnings: false
            },
            output: {
                keep_quoted_props: true // eslint-disable-line camelcase
            }
        }));
    }

    config.externals = [
        'jQuery',
        'react',
        'tau-intl',
        /^libs\//,
        {jquery: 'jQuery'},
        'Underscore',
        {underscore: 'Underscore'},
        /^tp3\//,
        /^tau\//,
        /^tp\//
    ];

    config.postcss = [
        require('postcss-nested'),
        require('autoprefixer')({browsers: ['last 2 version']})
    ];

    return config;
}

module.exports = createConfig;
