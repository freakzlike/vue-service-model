const config = {};

export function setConfig (_config) {
  Object.assign(config, _config);
}

export function getConfig () {
  return config;
}
