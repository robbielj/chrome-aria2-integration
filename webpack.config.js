var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        'chrome/js/background': path.join(__dirname, 'src/chrome/background.ts'),
        'chrome/js/inject': path.join(__dirname, 'src/chrome/inject.ts'),
        'chrome/settings/settings': path.join(__dirname, 'src/chrome/settings/settings.ctrl.ts'),
        'safari.safariextension/js/context': path.join(__dirname, 'src/safari/context.ts')
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: ['ts-loader']
            },
            {
                test: /\.s?css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.CommonsChunkPlugin('vendor'),
        new webpack.ProvidePlugin({
            '$': 'jquery',
            'jQuery': 'jquery'
        })
    ]
};
