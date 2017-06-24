const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        background: path.join(__dirname, 'src/background.ts'),
        inject: path.join(__dirname, 'src/inject.ts'),
        'settings.ctrl': path.join(__dirname, 'src/settings/settings.ctrl.ts')
    },
    output: {
        path: path.join(__dirname, 'dist/js'),
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
            name: 'vendor', // Specify the common bundle's name.,
            minChunks: function(module) {
                // this assumes your vendor imports exist in the node_modules directory
                return module.context && module.context.indexOf('node_modules') !== -1;
            }
        })
    ]
};
