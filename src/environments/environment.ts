// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  name: 'dev',
  url: "https://customer_dev.ridequdos.com/",//"http://18.211.241.237:6503/",
  urlV: "https://partner_dev.ridequdos.com/vendor/",//"http://18.211.241.237:6509/vendor/",
  // urlWC: "https://corp_dev.ridequdos.com/",//"http://18.211.241.237:6501/",
  urlWC: "https://cd.ridequdos.com/",//"http://18.211.241.237:6501/",
  urlC: "https://cd.ridequdos.com/corporate/",//"http://18.211.241.237:6501/corporate/",
  stripeKey: "pk_test_x0nIalqvXaliqoYO9Qdcb94Q",
  SocketURL: "https://sockets_dev.ridequdos.com",//"18.211.241.237:6508",
  mapKey: "AIzaSyDVxUnImtx75BtZS3yQJKhh_XgKFbWcKaE",
  vendorBaseURL: "https://qudos.dev/",//"http://qudos.tech/",
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
