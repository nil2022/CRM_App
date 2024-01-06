module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: 'standard',
  overrides: [
    {
      env: {
        node: true,
        jest: true
      },
      files: [
        '.eslintrc.{js,cjs}',
        '**/*.{test,spec}.{js,cjs,mjs,ts,mts,cts,jsx,tsx}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
  }
}
