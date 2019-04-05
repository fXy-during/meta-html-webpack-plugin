const lintStaged = {
    '*.{js,mjs,jsx,ts,tsx,json,scss,less,css,md,yml,yaml}': [
        'prettier --fix',
        'git add',
    ],
};

module.exports = lintStaged