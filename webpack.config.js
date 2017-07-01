const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlMinifier = require('html-minifier').minify;
const jsonminify = require('jsonminify');

module.exports = {
    entry: {
        'chrome/js/background': path.join(__dirname, 'src/chrome/background.ts'),
        'chrome/js/inject': path.join(__dirname, 'src/chrome/inject.ts'),
        'chrome/settings/settings': path.join(__dirname, 'src/chrome/settings/settings.ctrl.ts')
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
        // minify
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: './chrome/js/vendor' // Specify the common bundle's name.
        }),
        new CopyWebpackPlugin([
            {
                from: 'src/chrome/manifest.json',
                to: './chrome',
                transform: function (content) {
                    return jsonminify(content.toString('utf8'));
                }
            },
            {
                from: 'src/icons',
                to: './chrome/icons'
            },
            {
                from: 'src/chrome/_locales',
                to: './chrome/_locales'
            },
            {
                from: 'src/chrome/settings/settings.html',
                to: './chrome/settings/settings.html',
                transform: function (content) {
                    return HtmlMinifier(content.toString('utf8'), {
                        collapseWhitespace: true,
                        collapseInlineTagWhitespace: true,
                        minifyCSS: true,
                        sortAttributes: true,
                        sortClassNames: true
                    });
                }
            }
        ])
    ]
};
