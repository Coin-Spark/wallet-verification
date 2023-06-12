module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback, // include any existing fallbacks
    querystring: require.resolve("querystring-es3"),
  };

  return config;
};
