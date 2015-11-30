module.exports = function(config) {

    var webpackConfig = {
        devtool: '#cheap-module-inline-source-map',
        module: {
            loaders: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel'
            }]
        }
    };

    config.set({

        browsers: ['Chrome'],
        frameworks: ['mocha'],

        files: [
            'tests.bundle.js'
        ],

        preprocessors: {
            'tests.bundle.js': ['webpack', 'sourcemap']
        },

        reporters: ['mocha-own'],

        mochaOwnReporter: {
            reporter: 'spec'
        },

        webpack: webpackConfig,
        webpackServer: {
            noInfo: true
        },

        client: {
            captureConsole: true
        }

    });

};
