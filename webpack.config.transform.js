const path = require('path');
const merge = require('webpack-merge');

const SOURCE_PATH = path.resolve(__dirname, 'src');
const TYPINGS_PATH = path.resolve(__dirname, 'typings');
const TESTS_PATH = path.resolve(__dirname, 'typings');

const isProductionBuild = process.env.NODE_ENV === 'production';

const resolveOptions = () => ({
    resolve: {
        modules: [__dirname],
        extensions: ['.ts', '.tsx']
    }
});

const getBabelLoaderConfigForProduction = () => ({
    loader: 'babel-loader',
    options: {
        // .babelrc is just a hack to fix issues with create-mashup-app config
        babelrc: false,
        presets: [
            ['env', { modules: false }]
        ],
        plugins: [
            'transform-runtime'
        ]
    }
});

const typescriptLoader = () => ({
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: [
                    SOURCE_PATH,
                    TYPINGS_PATH,
                    TESTS_PATH
                ],
                use: [
                    isProductionBuild ? getBabelLoaderConfigForProduction() : null,
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

// NOTE: it's here to override namedModules options from create-mashup-app which is completely pointless and
// significantly increases bundle size
const minificationOptions = () => {
    if (!isProductionBuild) {
        return {};
    }

    return {
        optimization: {
            namedModules: false,
            minimize: true
        }
    };
};

module.exports = function(baseConfig) {
    return merge(
        baseConfig,
        resolveOptions(),
        typescriptLoader(),
        scssLoader(),
        minificationOptions()
    );
};
