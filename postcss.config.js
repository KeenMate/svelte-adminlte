const production = process.env.NODE_ENV === "prod"

module.exports = {
  plugins: [
    require("postcss-import"),
    require("autoprefixer"),
    production ? require("cssnano") : false
  ],
};