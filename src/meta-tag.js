function metaTagMap(metaNodeArr) {
  if (!Array.isArray(metaNodeArr)) {
    metaNodeArr = Array.prototype.slice.call(metaNodeArr);
  }

  return metaNodeArr.map(meta => {
    // const prop = Object.create(null);
    const prop = {};
    const attributes = meta.attribs;
    const keys = Object.keys(attributes);

    prop.single = keys.length === 1;

    keys.forEach(key => {
      prop[key] = attributes[key];
    });

    prop.key = prop.single
      ? "charset"
      : attributes.name || attributes["http-equiv"];

    return prop;
  });
}

module.exports = metaTagMap;
