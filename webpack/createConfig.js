const path = require('path');
const webpack = require('webpack');

const pkg = require('../package.json');
const TargetprocessMashupPlugin = require('targetprocess-mashup-webpack-plugin');
const CombineAssetsPlugin = require('combine-assets-plugin');

function createConfig(opts_) {
    const opts = Object.assign({
        production: false,
        mashupManager: false
    }, opts_);

    // mashup unique name
    const mashupName = pkg.name;

    // you should use format <something>.config.js to allow Mashup Manager autodiscover
    // config file
    const outputConfigFileName = './mashup.config.js';

    const config = {};

    config.entry = {
        // process config js module from JSON file
        configData: [
            'targetprocess-mashup-config-loader' +
            `?libraryTarget=${mashupName}&outputFile=${outputConfigFileName}!./src/config.json`
        ],
        // main entry point
        index: ['./src/index.ts']
    };

    config.resolve = {
        modules: [path.resolve(__dirname, '..'), 'node_modules'],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    };

    if (!opts.mashupManager) {
        // produce system configs from JSON file
        config.entry.manifestData = ['targetprocess-mashup-manifest-loader!./src/manifest.json'];
    }

    config.output = {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    };

    config.module = {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {loader: 'babel-loader'},
                    {loader: 'ts-loader'}
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'},
                    {
                        loader: 'postcss-loader',
                        options: {
                            parser: 'postcss-scss',
                            plugins: [
                                require('postcss-nested'),
                                require('autoprefixer')({browsers: ['last 2 version']})
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.html$/,
                use: [
                    {loader: 'underscore-template-loader'}
                ]
            }
        ]
    };

    config.devServer = {
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        inline: false,
        hot: false
    };

    if (!opts.production) {
        config.devtool = 'eval-source-map';
    }

    config.plugins = [
        new TargetprocessMashupPlugin(mashupName, {
            useConfig: true
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),

        new webpack.BannerPlugin(`v${pkg.version} Build ${new Date()}`)
    ];

    let toConcat = {};
    const toExclude = [
        'configData.js',
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
        'react-dom',
        'tau-intl',
        /^libs\//,
        {jquery: 'jQuery'},
        'Underscore',
        {underscore: 'Underscore'},
        /^tp3\//,
        /^tau\//,
        /^tp\//
    ];

    return config;
}

module.exports = createConfig;
