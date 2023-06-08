import { BaseService } from "../js/base-service.js";
export class DeliveryService extends BaseService {
    getOperatingCostReport() {
        var options = {
            ListType: "Detail",
            select: ""
        };
        return this.getList(this.ERPObjects.Tdeliverychart, options);
    }
    getOperatingCostReport1(limitCount, limitFrom, deleteFilter) {
      return new Promise(function(resolve, reject) {
        const defaultDashboardOptions = require("./operatingCostReport.json");
        if (!deleteFilter) {
          let active_dashboardOptions = [];
          for (let i = 0; i < defaultDashboardOptions.length; i++) {
            if (defaultDashboardOptions[i].Active) {
              active_dashboardOptions.push(defaultDashboardOptions[i]);
            }
          }
          resolve({"tdeliverychart" : active_dashboardOptions,
          Params: {
            Search: "Active = true"
          }
        });
        } else {
          resolve({
            "tdeliverychart" : defaultDashboardOptions,
            Params: {
              Search: ""
            }
          });
        }
      });
    }
}
