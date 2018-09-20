const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
        filename: 'dist.js',
        library: 'cdav',
        libraryTarget: 'umd',
		umdNamedDefine: true
    }
};
