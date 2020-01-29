console.log(process.env.NODE_ENV);
const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const config = require('./build/webpack/webpack.config');
const compiler = webpack(config());
const express = require('express');
const app = express();

app.use(
  middleware(compiler, {
    // webpack-dev-middleware options
  })
);

app.listen(8080, () => console.log('Example app listening on port 3000!'));
