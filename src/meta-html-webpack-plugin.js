const cheerio = require("cheerio");
const path = require("path");
const metaTagMap = require("./meta-tag");

const configDefaultPath = "./meta.html.config.js";

// 默认配置
const defaultConfig = {
  // 默认模式
  // 只开启normal和httpEquiv的部分参数
  // TODO
  default: true,
  // 是否压缩
  // TODO
  minify: false,
  // 是否配置优先
  privilege: false,
  normal: {
    viewport: "width=device-width, initial-scale=1",
    charset: "utf-8"
  },
  httpEquiv: { "X-UA-Compatible": ["IE=edge", "chrome=1"] },
  ogp: {}
};

const type2key = {
  normal: { key: "name" },
  ogp: { key: "property", prefix: "og:" },
  httpEquiv: { key: "http-equiv" }
};

const singleMetaProp = ["charset"];
// 支持更多类型的meta标签

class MetaHtmlWebpackPlugin {
  constructor(options) {
    if (arguments.length > 1) {
      throw new Error(
        "MetaHtmlWebpack only takes one argument (pass an options object)"
      );
    }

    // 利用JSON-Schema验证options

    // TODO
    this.filename = "index.html";

    this.rootPath = process.cwd();

    this.configPath =
      (options && options.configPath) ||
      path.resolve(this.rootPath, configDefaultPath);
  }

  /**
   *
   *
   * 创建单个meta标签
   *
   *
   * @param {Object} {key, value}
   *
   */
  createMetaTag(obj) {
    let propStr = "";
    const { single } = obj;
    delete obj.single;
    delete obj.key;

    const keys = Object.keys(obj);

    if (single) {
      const key = keys[0];
      propStr += `${key}=${obj[key]}`;
    } else {
      keys.forEach(key => {
        let value = obj[key];
        value = Array.isArray(value) ? value.join(",") : value;
        // TODO
        if (key === "property") {
          value = [].concat("og:", value).join("");
        }
        propStr += `${key}="${value}"`;
      });
    }

    return `<meta ${propStr} />`;
  }

  /**
   *
   *
   * 根据配置输出meta标签集合
   *
   *
   * @param {Object} obj
   * @param {String} meta 类型， 默认为normal
   * @return {Array} meta 标签集合
   *
   */
  loadMeta(metaCollectionMap) {
    const metaArr = [];
    if (metaCollectionMap) {
      metaCollectionMap.forEach(metaMap => {
        metaArr.push(this.createMetaTag(metaMap));
      });
    }
    return metaArr;
  }

  main(compilation, callback) {
    const htmlSource = compilation.assets[this.filename];
    const content = htmlSource.source();
    const $ = cheerio.load(content, {
      // 防止出现中文乱码
      decodeEntities: false
    });
    let metaCollection = [];
    let metaCollectionMap = [];
    let htmlTemplateMetaMap = [];

    // 获取html文件原有的meta标签
    htmlTemplateMetaMap = [].concat(metaTagMap($("head meta")));

    let config;

    try {
      const usrConfig = require(this.configPath);
      config = Object.assign({}, usrConfig, defaultConfig);
    } catch (e) {
      config = Object.assign({}, defaultConfig);
    }

    // 格式化用户配置
    const usrMetaMap = this.getMetaInfoFromConfig(config);

    // 合并原有标签和用户配置
    metaCollectionMap = [].concat([], htmlTemplateMetaMap, usrMetaMap);

    // 去重
    metaCollectionMap = this.removeRepetitionByKey(metaCollectionMap);

    // 转换为meta集合
    metaCollection = this.loadMeta(metaCollectionMap);

    // 先去除模板中的meta
    $("head meta").remove();

    // 写入html
    $("head").append(metaCollection.join(" "));

    const htmlWithMeta = $.html();

    compilation.assets[this.filename].source = function source() {
      return htmlWithMeta;
    };

    callback(null);
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      "MetaHtmlWebpackPlugin",
      (compilation, callback) => {
        this.main(compilation, callback);
      }
    );
  }

  /**
   *
   * 接收一个对象数组，根据对象指定key去重
   *
   *
   * @param {Array} 对象数组
   * @return {Array} 去重后的数组
   */
  removeRepetitionByKey(arr) {
    const singleArr = [];

    return arr.filter(elm => {
      const { key } = elm;

      if (singleArr.indexOf(key) < 0) {
        singleArr.push(key);
        return true;
      }

      return false;
    });
  }

  /**
   *
   * 从用户配置中提取meta信息，
   * 并格式化
   *
   *
   * @param {Object} usrConfig 用户配置
   * @return {Array} 格式化后的meta信息
   *
   */
  getMetaInfoFromConfig(usrConfig) {
    const keyProp = ["normal", "httpEquiv", "ogp"];
    const subMetaCollectionMap = [];

    for (const key of Object.keys(usrConfig)) {
      if (!keyProp.includes(key)) {
        continue;
      }
      const keyPropValue = usrConfig[key];
      const propKeys = Object.keys(keyPropValue);

      propKeys.forEach(propName => {
        let metaMap = {};
        // 是否是单属性
        if (!singleMetaProp.includes(propName)) {
          metaMap = {
            [type2key[key].key]: propName,
            content: keyPropValue[propName],
            key: propName
          };
        } else {
          // 形如charset="utf-8"
          metaMap = {
            [propName]: keyPropValue[propName],
            key: propName
          };
        }
        subMetaCollectionMap.push(metaMap);
      });
    }
    return subMetaCollectionMap;
  }
}

module.exports = MetaHtmlWebpackPlugin;
