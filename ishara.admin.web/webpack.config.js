const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: [
        'babel-polyfill',
        './src/index.jsx'
    ],

    output: {
        publicPath: '/',
        filename: './main.js'
    },

    resolve: {
        extensions: ['.js', '.jsx']
    },

    module: {
        rules: [{
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },

            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'public/image/[name].[ext]',
                        outputPath: 'dist/img/'
                    }
                }
            },

            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{ loader: 'css-loader', options: { minimize: true } }, 'sass-loader']
                })
            },

            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        minimize: true
                    }
                }
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin({ filename: 'style.css' }),
        new HtmlWebpackPlugin({
            template: './resources/index.html',
            filename: './index.html',
            hash: true
        })
    ],

    devServer: {
        historyApiFallback: true,
        publicPath: '/',
        contentBase: './dist'
    }
};