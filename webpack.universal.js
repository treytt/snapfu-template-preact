const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const childProcess = require('child_process');
const branchName = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

module.exports = merge(common, {
	mode: 'production',
	entry: './src/universal.js',
	output: {
		filename: 'universal.bundle.js',
		chunkFilename: 'universal.bundle.chunk.[fullhash:8].[id].js',
		chunkLoadingGlobal: `${branchName}BundleChunks`,
	},
	target: 'browserslist:universal',
	plugins: [
		// single bundle for legacy browsers without document.currentScript
		new webpack.optimize.LimitChunkCountPlugin({
			maxChunks: 1,
		}),
	],
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				include: [/node_modules\/@searchspring/, path.resolve(__dirname, 'src')],
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@babel/preset-env',
								{
									browserslistEnv: 'universal',
								},
							],
						],
					},
				},
			},
		],
	},
	devServer: {
		client: false,
		server: 'https',
		port: 3333,
		hot: false,
		allowedHosts: 'all',
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		static: {
			directory: path.join(__dirname, 'public'),
			publicPath: ['/'],
			watch: false,
		},
		devMiddleware: {
			publicPath: '/dist/',
		},
	},
});
