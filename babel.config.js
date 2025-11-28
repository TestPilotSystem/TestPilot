module.exports = {
    presets: [
        'next/babel',
        ['@babel/preset-react', {
            'runtime': 'automatic'
        }],
        '@babel/preset-typescript'
    ],
    plugins: [
        [
            'module-resolver',
            {
                alias: {
                    "^@/(.+)": "./src/\\1",
                },
            },
        ],
    ],
};