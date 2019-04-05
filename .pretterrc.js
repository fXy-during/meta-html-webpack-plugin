const prettier = {
    semi: true,
    tabWidth: 4,
    singleQuote: false,
    trailingComma: 'all',
    arrowParens: 'always',
    overrides: [{
            files: ['*.js', '.*.js'],
            excludeFiles: ['*/**', '*/.**'],
            options: {
                trailingComma: 'es5',
            },
        },
        {
            files: ['dev-utils/**/*.js', 'dev-utils/**/.*.js'],
            options: {
                trailingComma: 'es5',
            },
        },
    ],
};

module.exports = prettier;