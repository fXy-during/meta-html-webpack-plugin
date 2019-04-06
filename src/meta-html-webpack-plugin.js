const cheerio = require("cheerio");
const path = require("path");

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
  normal: {
    viewport: "width=device-width, initial-scale=1"
  },
  httpEquiv: { "X-UA-Compatible": ["IE=edge", "chrome=1"] },
  ogp: {}
};

const type2key = {
  normal: { key: "name" },
  ogp: { key: "property", prefix: "og:" },
  httpEquiv: { key: "http-equiv" }
};
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
   * 创建单个meta标签
   * @param {Object} {key, value}
   * @param {Enum} ["normal","ogp"]
   */
  createMetaTag(obj, type = "normal") {
    let propStr = "";
    const key = obj.key;

    let value = obj.value;

    const { key: propName, prefix } = type2key[type];

    value = Array.isArray(value) ? value.join(",") : value;

    propStr += ` ${propName}="${
      !!prefix ? prefix + key : key
    }" content="${value}"`;

    return `<meta ${propStr} />`;
  }

  /**
   * 根据配置输出meta标签集合
   * @param {Object} obj
   * @param {String} meta 类型， 默认为normal
   * @return {Array} meta 标签集合
   *
   */
  loadMeta(obj, type = "normal") {
    const metaArr = [];
    if (obj) {
      Object.keys(obj).forEach(key => {
        metaArr.push(
          this.createMetaTag(
            {
              key,
              value: obj[key]
            },
            type
          )
        );
      });
    }
    return metaArr;
  }

  beTruety(bool, fn) {
    if (bool) {
      fn();
    }
  }

  main(compilation, callback) {
    const html = compilation.assets[this.filename];
    const content = html.source();
    let metaCollection = [];
    const $ = cheerio.load(content, {
      // 防止出现中文乱码
      decodeEntities: false
    });

    let config;

    try {
      const usrConfig = require(this.configPath);
      config = Object.assign({}, usrConfig, defaultConfig);
    } catch (e) {
      config = Object.assign({}, defaultConfig);
    }

    const { normal, httpEquiv, ogp, title } = config;

    // 修改title
    this.beTruety(title || normal.title, () => {
      $("title").text(title || normal.title);
    });

    // 添加meta标签
    this.beTruety(normal, () => {
      metaCollection = metaCollection.concat(this.loadMeta(normal));
    });

    this.beTruety(ogp, () => {
      metaCollection = metaCollection.concat(this.loadMeta(ogp, "ogp"));
    });

    this.beTruety(httpEquiv, () => {
      metaCollection = metaCollection.concat(
        this.loadMeta(httpEquiv, "httpEquiv")
      );
    });

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
}

module.exports = MetaHtmlWebpackPlugin;
