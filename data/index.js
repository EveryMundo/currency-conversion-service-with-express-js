/* eslint-disable quotes, quote-props */
const logr = require('em-logr').create('DATA');

const clone = v => JSON.parse(JSON.stringify(v));

const data = {
  "_id": "15039893239733380.479415146",
  "__v": 1,
  "__createdAt": "2017-08-29T06:48:43.973Z",
  "timestamp": "2017-08-29T06:24:26.000Z",
  "source": "USD",
  "date": "2017-08-29T00:00:00.000Z",
  "rates": {
    "AED": 3.672302,
    "AFN": 68.330002,
    "ALL": 110.699997,
    "AMD": 478.48999,
    "ANG": 1.769695,
    "AOA": 165.095001,
    "ARS": 17.224001,
    "AUD": 1.259962,
    "AWG": 1.78,
    "AZN": 1.700399,
    "BAM": 1.634897,
    "BBD": 2,
    "BDT": 80.910004,
    "BGN": 1.640096,
    "BHD": 0.376995,
    "BIF": 1728.73999,
    "BMD": 1,
    "BND": 1.352602,
    "BOB": 6.896392,
    "BRL": 3.1672,
    "BSD": 1,
    "BTC": 0.000226,
    "BTN": 64.025002,
    "BWP": 10.116501,
    "BYN": 1.919686,
    "BYR": 20020,
    "BZD": 1.997904,
    "CAD": 1.24922,
    "CDF": 1545.449951,
    "CHF": 0.95283,
    "CLF": 0.02337,
    "CLP": 628.150024,
    "CNY": 6.6072,
    "COP": 2945.100098,
    "CRC": 570.380005,
    "CUC": 1,
    "CUP": 26.5,
    "CVE": 91.989998,
    "CZK": 21.767297,
    "DJF": 178.000298,
    "DKK": 6.20583,
    "DOP": 46.919998,
    "DZD": 109.515999,
    "EGP": 17.629999,
    "ERN": 15.270252,
    "ETB": 23.095264,
    "EUR": 0.833701,
    "FJD": 2.035979,
    "FKP": 0.772299,
    "GBP": 0.77225,
    "GEL": 2.405797,
    "GGP": 0.772102,
    "GHS": 4.4035,
    "GIP": 0.772502,
    "GMD": 44.900002,
    "GNF": 8837.999891,
    "GTQ": 7.282025,
    "GYD": 202.720001,
    "HKD": 7.82424,
    "HNL": 23.325001,
    "HRK": 6.180097,
    "HTG": 62.069928,
    "HUF": 253.779999,
    "IDR": 13338,
    "ILS": 3.577202,
    "IMP": 0.772102,
    "INR": 63.992992,
    "IQD": 1166,
    "IRR": 33159.999917,
    "ISK": 103.999838,
    "JEP": 0.772102,
    "JMD": 127.029999,
    "JOD": 0.707499,
    "JPY": 108.901001,
    "KES": 102.900002,
    "KGS": 68.648003,
    "KHR": 4039.999853,
    "KMF": 416.000023,
    "KPW": 899.999712,
    "KRW": 1125.699951,
    "KWD": 0.300949,
    "KYD": 0.820008,
    "KZT": 334.519989,
    "LAK": 8275.000383,
    "LBP": 1505.493369,
    "LKR": 152.800003,
    "LRD": 114.400002,
    "LSL": 13.009674,
    "LTL": 3.048698,
    "LVL": 0.62055,
    "LYD": 1.360018,
    "MAD": 9.316502,
    "MDL": 17.78502,
    "MGA": 3184.999818,
    "MKD": 51.619999,
    "MMK": 1361.999553,
    "MNT": 2426.000274,
    "MOP": 8.058699,
    "MRO": 360.999705,
    "MUR": 34.349998,
    "MVR": 15.349871,
    "MWK": 716.330017,
    "MXN": 17.939301,
    "MYR": 4.256304,
    "MZN": 60.700001,
    "NAD": 13.101027,
    "NGN": 365.000139,
    "NIO": 30.2843,
    "NOK": 7.75838,
    "NPR": 101.949997,
    "NZD": 1.381804,
    "OMR": 0.384802,
    "PAB": 1,
    "PEN": 3.236499,
    "PGK": 3.179701,
    "PHP": 51.130001,
    "PKR": 105.400002,
    "PLN": 3.545401,
    "PYG": 5633.000223,
    "QAR": 3.641303,
    "RON": 3.831702,
    "RSD": 99.711197,
    "RUB": 58.566002,
    "RWF": 826.099976,
    "SAR": 3.749902,
    "SBD": 7.764503,
    "SCR": 13.238011,
    "SDG": 6.659898,
    "SEK": 7.953103,
    "SGD": 1.35316,
    "SHP": 0.772499,
    "SLL": 7499.999662,
    "SOS": 557.000073,
    "SRD": 7.3798,
    "STD": 20438.800781,
    "SVC": 8.749852,
    "SYP": 514.97998,
    "SZL": 13.101976,
    "THB": 33.150002,
    "TJS": 8.8058,
    "TMT": 3.6,
    "TND": 2.40903,
    "TOP": 2.190174,
    "TRY": 3.453399,
    "TTD": 6.742196,
    "TWD": 30.124001,
    "TZS": 2233.999899,
    "UAH": 25.474976,
    "UGX": 3592.000048,
    "USD": 1,
    "UYU": 28.760084,
    "UZS": 4165.000288,
    "VEF": 9.975023,
    "VND": 22728,
    "VUV": 103.269997,
    "WST": 2.483195,
    "XAF": 547.080017,
    "XAG": 0.057228,
    "XAU": 0.000759,
    "XCD": 2.701114,
    "XDR": 0.705414,
    "XOF": 549.999915,
    "XPF": 99.675974,
    "YER": 249.899994,
    "ZAR": 13.103996,
    "ZMK": 9001.202443,
    "ZMW": 8.989884,
    "ZWL": 322.355011,
  },
};

const dataKeys = Object.keys(data);

const rp = require('request-promise-native');

const calculateSleepTime = (o) => {
  const createdAt = new Date(o.__createdAt).getTime();
  const now       = Date.now();
  //                     min * sec * millis
  return (createdAt +  60 *  60 * 1000) - now + 1000;
};

const update = () => {
  const {datacore} = require('../config').config;
  const options = {
    json: true,
    uri: datacore.URI,
    headers: {
      Authorization: datacore.AUTHORIZATION,
    },
  };

  rp(options)
    .then((result) => {
      const o = result.data[0];
      data._id         = o._id;
      data.__v         = o.__v;
      data.__createdAt = o.__createdAt;
      data.timestamp   = o.timestamp;
      data.source      = o.source;
      data.date        = o.date;
      data.rates       = clone(o.rates);

      dataKeys.forEach(key => data[key] = clone(o[key]));
      const sleepMs = calculateSleepTime(o);
      setTimeout(update, sleepMs);
    })
    .catch((err) => {
      logr.error(err);
      setTimeout(update, 30000);
    });

  return data;
};


module.exports = {
  get data() { return data; },
  update,
};
