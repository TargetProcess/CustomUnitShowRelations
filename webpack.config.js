const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const TargetprocessMashupPlugin = require('targetprocess-mashup-webpack-plugin');
const CombineAssetsPlugin = require('combine-assets-plugin');

const SOURCE_PATH = path.resolve(__dirname, 'src');
const DIST_PATH = path.resolve(__dirname, 'dist');

const { version: MASHUP_VERSION } = require('./package.json');
const MASHUP_NAME = 'CustomUnitShowRelations';

const isProductionBuild = process.env.NODE_ENV === 'production';

const entries = () => ({
    entry: {
        // produce system configs from JSON file
        manifestData: 'targetprocess-mashup-manifest-loader!./manifest.json',
        // main entry point
        index: path.resolve(SOURCE_PATH, 'index.ts')
    }
});

const resolveOptions = () => ({
    resolve: {
        modules: [__dirname, 'node_modules'],
        extensions: ['.js', '.ts', '.tsx']
    }
});

const output = () => ({
    output: {
        filename: '[name].js',
        path: DIST_PATH
    }
});

const sourcemaps = () => {
    if (isProductionBuild) {
        return {};
    }

    return {
        devtool: 'eval-source-map'
    };
};

const devServer = () => ({
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        inline: false,
        hot: false
    }
});

const typescriptLoader = () => ({
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    isProductionBuild && { loader: 'babel-loader' },
                    { loader: 'ts-loader' }
                ].filter((loaderConfig) => !!loaderConfig)
            }
        ]
    }
});

const scssLoader = () => ({
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    {
                        loader: 'postcss-loader',
                        options: {
                            parser: 'postcss-scss',
                            plugins: [
                                require('cssnano')(),
                                require('postcss-nested'),
                                require('autoprefixer')({ browsers: ['last 2 version'] })
                            ]
                        }
                    }
                ]
            }
        ]
    }
});

const plugins = () => ({
    plugins: [
        new TargetprocessMashupPlugin(MASHUP_NAME),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),

        new webpack.BannerPlugin(`v${MASHUP_VERSION} Build ${new Date()}`),
        new CombineAssetsPlugin({ toExclude: ['manifestData.js'] })
    ]
});

const externals = () => ({
    externals: [
        'react',
        'react-dom',
        'react-dom/server',
        'combokeys',
        { jquery: 'jQuery' },
        { underscore: 'Underscore' },
        'tau-intl',
        /^libs\//,
        /^tau\//,
        /^tp\//
    ]
});

const minification = () => {
    if (!isProductionBuild) {
        return {};
    }

    return {
        plugins: [
            new webpack.optimize.UglifyJsPlugin()
        ]
    };
};

module.exports = merge(
    entries(),
    resolveOptions(),
    output(),
    sourcemaps(),
    devServer(),
    typescriptLoader(),
    scssLoader(),
    plugins(),
    externals(),
    minification()
);
