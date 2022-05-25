module.exports = {
    extends: [
        'eslint-typescript/typescript.js',
        'eslint-typescript/typescript-import.js',
        'eslint-typescript/typescript-react.js',
        'eslint-typescript/typescript-requiring-type-checking.js',
        'eslint-typescript/jest.js'
    ],
    parserOptions: {
        project: './tsconfig.json'
    }
}
