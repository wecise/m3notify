const webpack = require('webpack')
const WebpackZipPlugin = require('webpack-zip-plugin')
const path = require('path')
const IS_PROD = process.env.NODE_ENV === 'production'

function resolve(dir) {
    return path.join(__dirname, dir)
}

module.exports = {
    devServer: {
        open: process.platform === 'darwin',
        host: '0.0.0.0',
        port: 8080,
        https: false,
        hotOnly: false,
    },

    outputDir: 'app/matrix/' + process.env.VUE_APP_M3_APP,
    productionSourceMap: false,

    configureWebpack: config => {
        // 生产环境
        if (IS_PROD) {
            
            // 开启分离js
            /* config.optimization = {
                runtimeChunk: 'single',
                splitChunks: {
                    chunks: 'all',
                    maxInitialRequests: Infinity,
                    minSize: 20000,
                    cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name (module) {
                        // get the name. E.g. node_modules/packageName/not/this/part.js
                        // or node_modules/packageName
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
                        // npm package names are URL-safe, but some servers don't like @ symbols
                        return `npm.${packageName.replace('@', '')}`
                        }
                    }
                    }
                }
            } */

            return {
                
                plugins: [
                    new webpack.ProvidePlugin({
        
                    }),
                    new WebpackZipPlugin({
                        initialFile: 'app',
                        endPath: './',
                        zipName: process.env.VUE_APP_M3_APP+'.zip',
                        //frontShell: 'sed -i \'\' \'s/src="/src="\\/static\\/app\\/matrix\\/m3event/g\; s/href="/href="\\/static\\/app\\/matrix\\/m3event/g\' ./app/matrix/m3event/index.html',
                        //frontShell: 'sed -i \'\' \'s/src="/src="\\/static\\/app\\/matrix\\/m3event/g\; s/href="/href="\\/static\\/app\\/matrix\\/m3event/g\' ./app/matrix/m3event/index.html',
                        behindShell: './deploy.sh ' + process.env.VUE_APP_M3_HOST + ' ' + process.env.VUE_APP_M3_COMPANY + ' ' + process.env.VUE_APP_M3_USERNAME + ' "' + process.env.VUE_APP_M3_PASSWORD + '" ' + process.env.VUE_APP_M3_APP
                    })
                ]
            }
        }
      },

      chainWebpack(config) {

        // set svg-sprite-loader
        config.module
          .rule('svg')
          .exclude.add(resolve('src/icons'))
          .end()
        config.module
          .rule('icons')
          .test(/\.svg$/)
          .include.add(resolve('src/icons'))
          .end()
          .use('svg-sprite-loader')
          .loader('svg-sprite-loader')
          .options({
            symbolId: 'icon-[name]'
          })
      
          .end()
    },

    publicPath: process.env.NODE_ENV === 'production'?'/static/app/matrix/'+process.env.VUE_APP_M3_APP:''
}