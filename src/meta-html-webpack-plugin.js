const cheerio = require("cheerio");
const path = require("path");

class BasicPlugin {
    constructor(options) {
        // TODO
        this.filename = "index.html";
        this.rootPath = process.cwd();
        this.configPath = options.configPath || path.resolve(rootPath, "./meta.html.config.js");
    }

    /**
     * 创建单个meta标签
     * @param {Object} {key, value} 
     * @param {Enum} ["normal","ogp"] 
     */
    createMetaTag(obj, type = "normal") {
        var propStr = "";
        var ogpPrefix = "og:";

        var {
            key,
            value
        } = obj;

        // TODO
        switch (type) {
            case "normal":
                {
                    value = Array.isArray(value) ? value.join(",") : value;
                    propStr += ` name="${key}" content="${value}"`;
                    break;
                }
            case "ogp":
                {
                    propStr += ` property="${ogpPrefix+key}" content="${value}" `
                    break;
                }
            default:
                {}
        }

        return `<meta ${propStr} />`
    }
    /**
     * 根据配置输出meta标签集合
     * @param {Object} obj 
     * @param {String} meta 类型， 默认为normal 
     * @return {String} meta 标签集合 
     * 
     */
    loadMeta(obj, type = "normal") {
        var str = " ";
        obj && Object.keys(obj).forEach(key => {
            str += this.createMetaTag({
                key,
                value: obj[key]
            }, type)
        })
        return str;
    }
    main(compilation, callback) {
        console.log("监听到了emit");

        var html = compilation.assets[this.filename];
        var content = html.source()
        var metaStr = " ";
        var $ = cheerio.load(content, {
            // 防止出现中文乱码
            decodeEntities: false
        });

        // 获取SEOConfig
        const config = require(this.configPath);

        // 检查SEOConfig
        if (!config) {
            callback("未获取到meta.config");
            return;
        }

        const {
            normal,
            ogp,
            title
        } = config;

        // 修改title
        title || normal.title && $("title").text(title || normal.title);

        // 添加meta标签
        normal && (metaStr += this.loadMeta(normal));
        ogp && (metaStr += this.loadMeta(ogp, "ogp"));

        // 写入html
        $("head").append(metaStr);

        const htmlWithMeta = $.html();

        compilation.assets[this.filename].source = function () {
            return htmlWithMeta
        }

        callback(null)
    }

    apply(compiler) {
        compiler.plugin("emit", this.main.bind(this))
    }

}

module.exports = BasicPlugin;