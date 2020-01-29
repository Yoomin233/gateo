module.exports = {
  cacheDirectory: true,
  babelrc: false,
  presets: [
    ['@babel/preset-env'],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    'react-hot-loader/babel'
  ]
};
