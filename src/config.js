

const defaultConfig = {
  ToastTimeOut: process.env.TOAST_TIME_OUT,
  ToastExtendedTimeOut: process.env.TOAST_EXTENDED_TIMEOUT,
  DateFormat: "D",
  DateTimeFormat: "f",
  TimeFormat: "t" ,
  ReverseDateFormat: "yyyy-LL-dd",
  ReverseDateTimeFormat: "yyyy-LL-dd_HH-mm-ss",
};

let currentConfig = defaultConfig

export function setConfig(config) {
  currentConfig = { ...currentConfig, ...config };
}

export function getConfig() {
  return currentConfig;
}