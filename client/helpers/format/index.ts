export const getFormattedTableDate = (date: Date) => {
  date = new Date(date);
  var year = String(date.getFullYear()).slice(2);

  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : "0" + month;

  var day = date.getDate().toString();
  day = day.length > 1 ? day : "0" + day;
  const formattedDate = month + "-" + day + "-" + year;

  return formattedDate;
};

export const getFormattedTableDateWithTime = (date: Date) => {
  date = new Date(date);
  var year = String(date.getFullYear()).slice(2);

  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : "0" + month;

  var day = date.getDate().toString();
  day = day.length > 1 ? day : "0" + day;
  const formattedDate = month + "-" + day + "-" + year;

  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutesStr + " " + ampm;
  return formattedDate + " " + strTime;
};

export const formatPath = (path: string) => {
  return encodeURIComponent(path)
    .replace(/%20/g, "-")
    .replace(/%2B/g, "and")
    .toLowerCase();
};

export const isValidUrl = (url: string): boolean => {
  const urlRegex = /^(http|https):\/\/[^\s/$.?#].[^\s]*$/;
  return urlRegex.test(url);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const bytesToSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const convertedSize = (bytes / Math.pow(1024, i)).toFixed(2);

  if (i < 2) {
    return `${convertedSize} ${sizes[i]}`;
  } else {
    return `${convertedSize} ${sizes[i]}`;
  }
};
