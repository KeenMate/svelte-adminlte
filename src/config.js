const defaultConfig = {
  ToastTimeOut: process.env.TOAST_TIME_OUT,
  ToastExtendedTimeOut: process.env.TOAST_EXTENDED_TIMEOUT,
  Foo: "Ahoj"
};

let currentConfig = defaultConfig

export function setConfig(config) {
  currentConfig = { ...currentConfig, ...config };
}

export function getConfig() {
  return currentConfig;
}