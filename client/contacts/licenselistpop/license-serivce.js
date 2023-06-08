import { BaseService } from "../../js/base-service.js";
export class LicenseService extends BaseService {
    getLicense(limitCount, limitFrom, deleteFilter) {
        return new Promise(function(resolve, reject) {
          const licenselist = require("./license.json");
          if (!deleteFilter) {
            let active_dashboardOptions = [];
            for (let i = 0; i < licenselist.length; i++) {
              if (licenselist[i].Type == "License") {
                active_dashboardOptions.push(licenselist[i]);
              }
            }
            resolve({"tlicenselist" : active_dashboardOptions,
            Params: {
              Search: "Active = true"
            }
          });
          } else {
            resolve({
              "tlicenselist" : licenselist,
              Params: {
                Search: ""
              }
            });
          }
        });
    }
    getPermit(limitCount, limitFrom, deleteFilter) {
        return new Promise(function(resolve, reject) {
          const licenselist = require("./license.json");
          if (!deleteFilter) {
            let active_dashboardOptions = [];
            for (let i = 0; i < licenselist.length; i++) {
              if (licenselist[i].Type == "Permit") {
                active_dashboardOptions.push(licenselist[i]);
              }
            }
            resolve({"tpermitlist" : active_dashboardOptions,
            Params: {
              Search: "Active = true"
            }
          });
          } else {
            resolve({
              "tpermitlist" : licenselist,
              Params: {
                Search: ""
              }
            });
          }
        });
    }
}
