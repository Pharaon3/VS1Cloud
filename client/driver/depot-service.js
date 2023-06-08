import { BaseService } from "../js/base-service";
import { Session } from 'meteor/session';
export class DepotService extends BaseService {
    getAllDepot() {
        let options = {
        };
        return this.getList(this.ERPObjects.TDepotList, options);
    }
    getAllDepot1(limitCount, limitFrom, deleteFilter) {
        return new Promise(function(resolve, reject) {
          const sampleDepotList = require("./depotlist.json");
          if (!deleteFilter) {
            let active_dashboardOptions = [];
            for (let i = 0; i < sampleDepotList.length; i++) {
              if (sampleDepotList[i].Active) {
                active_dashboardOptions.push(sampleDepotList[i]);
              }
            }
            resolve({"tdepotlist" : active_dashboardOptions,
            Params: {
              Search: "Active = true"
            }
          });
          } else {
            resolve({
              "tdepotlist" : sampleDepotList,
              Params: {
                Search: ""
              }
            });
          }
        });
      }

}
