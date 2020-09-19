
const { override, fixBabelImports, addLessLoader } = require('customize-cra');
 
module.exports = override(
    // antd按需加载，不需要每个页面都引入“antd/dist/antd.css”了。
    //根据import来打包(使用babel-plugin-import)
    fixBabelImports('import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true  //自动打包相关的样式
    }),
    //使用less-loader对源码中的less变量进行重新指定
    addLessLoader({
        lessOptions: { // If you are using less-loader@5 please spread the lessOptions to options directly
            javascriptEnabled: true,
            modifyVars: { "@primary-color": "#1DA57A"}
        }
      })
)
