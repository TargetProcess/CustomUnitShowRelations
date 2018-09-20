const path = require('path');
const webpack = require('webpack');

const pkg = require('../package.json');
const TargetprocessMashupPlugin = require('targetprocess-mashup-webpack-plugin');
const CombineAssetsPlugin = require('combine-assets-plugin');

function createConfig(opts_) {
    const opts = Object.assign({
        production: false
    }, opts_);

    // mashup unique name
    const mashupName = pkg.name;

    const config = {};

    config.entry = {
        // produce system configs from JSON file
        manifestData: ['targetprocess-mashup-manifest-loader!./assets/manifest.json'],
        // main entry point
        index: ['./src/index.ts']
    };

    config.resolve = {
        modules: [path.resolve(__dirname, '..'), 'node_modules'],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    };

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
                    opts.production && {loader: 'babel-loader'},
                    {loader: 'ts-loader'}
                ].filter((loaderConfig) => !!loaderConfig)
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
        new TargetprocessMashupPlugin(mashupName),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),

        new webpack.BannerPlugin(`v${pkg.version} Build ${new Date()}`)
    ];

    config.plugins = config.plugins.concat(new CombineAssetsPlugin({
        toExclude: ['manifestData.js']
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
