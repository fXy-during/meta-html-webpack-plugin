import cheerio from "cheerio";
import path from "path";

class BasicPlugin {
    constructor(options) {
        // TODO
        this.filename = "index.html";
        this.rootPath = process.cwd();
        this.configPath = options.configPath || path.resolve(this.rootPath, "./meta.html.config.js");
    }

    /**
     * 创建单个meta标签
     * @param {Object} {key, value} 
     * @param {Enum} ["normal","ogp"] 
     */
    createMetaTag(obj, type = "normal") {
        let propStr = "";
        const ogpPrefix = "og:";

        const key = obj.key;
        let value = obj.value;

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
                {
                    break;
                }
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
        let str = " ";
        if (obj) {
            Object.keys(obj).forEach(key => {
                str += this.createMetaTag({
                    key,
                    value: obj[key]
                }, type)
            })
        }
        return str;
    }

    beTruety(bool, fn) {
        if (bool) {
            fn()
        }
    }

    main(compilation, callback) {
        const html = compilation.assets[this.filename];
        const content = html.source()
        let metaStr = " ";
        const $ = cheerio.load(content, {
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
        this.beTruety(title || normal.title, () => {
            $("title").text(title || normal.title);
        })

        // 添加meta标签
        this.beTruety(normal, () => {
            (metaStr += this.loadMeta(normal));
        })

        this.beTruety(ogp, () => {
            (metaStr += this.loadMeta(ogp, "ogp"));
        })

        // 写入html
        $("head").append(metaStr);

        const htmlWithMeta = $.html();

        compilation.assets[this.filename].source = function source() {
            return htmlWithMeta
        }

        callback(null)
    }

    apply(compiler) {
        compiler.plugin("emit", this.main.bind(this))
    }

}

export default BasicPlugin;