import { BaseService } from "../js/base-service";

export class ManufacturingService extends BaseService {
    getAllProcessData = (limitCount, limitfrom, deleteFilter) => {
      let options = "";
      if(deleteFilter == false) {
        if(limitCount == "All") {
          options = {
            ListType: 'Detail',
            select: "[Active] = true",
          }
        }else{
          options = {
            ListType: 'Detail',
            select: "[Active] = true",
            LimitCount: parseInt(limitCount),
            LimitFrom: parseInt(limitfrom)
          }
        }
      } else {
        if(limitCount == "All") {
          options = {
            ListType: 'Detail',
          }
        }else{
          options = {
            ListType: 'Detail',
            // select: "[Active] = true",
            LimitCount: parseInt(limitCount),
            LimitFrom: parseInt(limitfrom)
          }
        }
      }
        return this.getList(this.ERPObjects.TProcessStep, options);
    }
    
    getProcessByName = (dataSearchName) => {
      let options = "";
      options = {
        ListType: 'Detail',
        select:'[KeyValue] f7like "' +dataSearchName +'" OR [ID] f7like "' +dataSearchName +'"'
      }
      return this.getList(this.ERPObjects.TProcessStep, options)
    }
    getOneProcessDataByID(id) {
      return this.getOneById(this.ERPObjects.TProcessStep, id);
    }

    saveProcessData(data) {
        return this.POST(this.ERPObjects.TProcessStep, data)
    }

    saveWorkOrder(data){
      return this.POST(this.ERPObjects.TVS1WorkOrder, data)
    }

    saveBuildCostReport(data){
      return this.POST(this.ERPObjects.TVS1BuildCostReport, data)
    }

    getWorkOrderList() {

       const now = new Date();
       const isoStr = now.toISOString();     
       const cur_date = moment().format('DD/MM/YYYY');       
        let workorders = [
          {
              "type": "TVS1Workorder",
              "fields": {
                  "LID": "1000",
                  "Customer": "Workshop",
                  "OrderTo": "Workshop\n \n\n ",
                  "PONumber": "",
                  "SaleDate": cur_date,
                  "DueDate": cur_date,
                  "BOMStructure": "{\"Id\":8077,\"MsTimeStamp\":\"2023-02-23 13:10:21\",\"MsUpdateSiteCode\":\"DEF\",\"GlobalRef\":\"DEF8077\",\"Caption\":\"Wagon\",\"CustomInputClass\":\"\",\"Description\":\"Childs Red Wagon\",\"Details\":\"[{\\\"productName\\\":\\\"Handle\\\",\\\"qty\\\":\\\"1\\\",\\\"changed_qty\\\":\\\"0\\\",\\\"process\\\":\\\"\\\",\\\"processNote\\\":\\\"\\\",\\\"attachments\\\":[],\\\"subs\\\":[],\\\"ClockedTime\\\": 0,\\\"StartedTime\\\":[],\\\"StoppedTime\\\":[],\\\"Status\\\":\\\"\\\"},{\\\"productName\\\":\\\"Tray\\\",\\\"qty\\\":\\\"1\\\",\\\"changed_qty\\\":\\\"0\\\",\\\"process\\\":\\\"Welding\\\",\\\"processNote\\\":\\\"\\\",\\\"attachments\\\":[],\\\"subs\\\":[],\\\"ClockedTime\\\": 0},{\\\"productName\\\":\\\"Hub\\\",\\\"qty\\\":\\\"1\\\",\\\"changed_qty\\\":\\\"0\\\",\\\"process\\\":\\\"\\\",\\\"processNote\\\":\\\"\\\",\\\"attachments\\\":[],\\\"subs\\\":[],\\\"ClockedTime\\\": 0 ,\\\"StartedTime\\\":[],\\\"StoppedTime\\\":[],\\\"Status\\\":\\\"\\\"},{\\\"productName\\\":\\\"Purple\\\",\\\"qty\\\":\\\"1\\\",\\\"changed_qty\\\":\\\"0\\\",\\\"process\\\":\\\"Painting\\\",\\\"processNote\\\":\\\"\\\",\\\"attachments\\\":[],\\\"subs\\\":[],\\\"ClockedTime\\\": 0,\\\"StartedTime\\\":[],\\\"StoppedTime\\\":[],\\\"Status\\\":\\\"\\\"},{\\\"productName\\\":\\\"Wheel Assembly\\\",\\\"qty\\\":\\\"4\\\",\\\"changed_qty\\\":\\\"0\\\",\\\"process\\\":\\\"Assembly\\\",\\\"processNote\\\":\\\"\\\",\\\"attachments\\\":[],\\\"subs\\\":[],\\\"ClockedTime\\\": 0 ,\\\"StartedTime\\\":[],\\\"StoppedTime\\\":[],\\\"Status\\\":\\\"\\\"}]\",\"Info\":\"Assembly\",\"ProcStepItemRef\":\"vs1BOM\",\"QtyVariation\":5,\"TotalQtyOriginal\":636,\"TotalChangeQty\":0,\"Value\":\"\"}",
                  "OrderDate": isoStr,
                  "StartTime": "",
                  "ProductName": "Asus Screen",
                  "ShipDate": cur_date,
                  "Quantity": 1,
                  "ID": "1000",
                  "UpdateFromPO": false,
                  "POStatus": "not created",
                  "Status": "unscheduled",
                  "TrackedTime": 0,
                  "StartedTimes": [],
                  "PausedTimes": [],
                  "StoppedTimes": [],
                  "EmployeeId"  : "",
                  "EmployeeName" : "Dene Test",
              }
          },
          {
              "type": "TVS1Workorder",
              "fields": {
                  "LID": "1001",
                  "Customer": "Workshop",
                  "OrderTo": "Workshop\n \n\n ",
                  "PONumber": "",
                  "SaleDate": cur_date,
                  "DueDate": cur_date,
                  "BOMStructure": "{\"Id\":8076,\"MsTimeStamp\":\"2023-02-23 13:05:06\",\"MsUpdateSiteCode\":\"DEF\",\"GlobalRef\":\"DEF8076\",\"Caption\":\"Wheel Assembly\",\"CustomInputClass\":\"\",\"Description\":\"\",\"Details\":\"[{\\\"productName\\\":\\\"Bridgestone Wheels\\\",\\\"qty\\\":\\\"1\\\",\\\"changed_qty\\\":\\\"0\\\",\\\"process\\\":\\\"\\\",\\\"processNote\\\":\\\"\\\",\\\"attachments\\\":[],\\\"subs\\\":[],\\\"ClockedTime\\\": 0 ,\\\"StartedTime\\\":[],\\\"StoppedTime\\\":[],\\\"Status\\\":\\\"\\\"}]\",\"Info\":\"Assembly\",\"ProcStepItemRef\":\"vs1BOM\",\"QtyVariation\":1,\"TotalQtyOriginal\":34,\"TotalChangeQty\":0,\"Value\":\"\"}",
                  "OrderDate": isoStr,
                  "StartTime": "",
                  "ProductName": "New Bom Prod 2023",
                  "ShipDate": cur_date,
                  "Quantity": 1,
                  "ID": "1001",
                  "UpdateFromPO": false,
                  "POStatus": "not created",
                  "Status": "unscheduled",
                  "TrackedTime": 0,
                  "StartedTimes": [],
                  "PausedTimes": [],
                  "StoppedTimes": [],
                  "EmployeeId"  : "",
                  "EmployeeName" : "Wilee Coyote"
              }
          },

          {
            "type": "TVS1Workorder",
            "fields": {
                "LID": "1002",
                "Customer": "Workshop",
                "OrderTo": "Workshop\n \n\n ",
                "PONumber": "",
                "SaleDate": cur_date,
                "DueDate": cur_date,
                "BOMStructure": "{\"Id\":8076,\"MsTimeStamp\":\"2023-02-23 13:05:06\",\"MsUpdateSiteCode\":\"DEF\",\"GlobalRef\":\"DEF8076\",\"Caption\":\"Wheel Assembly\",\"CustomInputClass\":\"\",\"Description\":\"\",\"Details\":\"[{\\\"productName\\\":\\\"Bridgestone Wheels\\\",\\\"qty\\\":\\\"1\\\",\\\"changed_qty\\\":\\\"0\\\",\\\"process\\\":\\\"\\\",\\\"processNote\\\":\\\"\\\",\\\"attachments\\\":[],\\\"subs\\\":[],\\\"ClockedTime\\\": 0 ,\\\"StartedTime\\\":[],\\\"StoppedTime\\\":[],\\\"Status\\\":\\\"\\\"}]\",\"Info\":\"Assembly\",\"ProcStepItemRef\":\"vs1BOM\",\"QtyVariation\":1,\"TotalQtyOriginal\":34,\"TotalChangeQty\":0,\"Value\":\"\"}",
                "OrderDate": isoStr,
                "StartTime": "",
                "ProductName": "Room Booking",
                "ShipDate": cur_date,
                "Quantity": 1,
                "ID": "1002",
                "UpdateFromPO": false,
                "POStatus": "not created",
                "Status": "unscheduled",
                "TrackedTime": 0,
                "StartedTimes": [],
                "PausedTimes": [],
                "StoppedTimes": [],
                "EmployeeId"  : "",
                "EmployeeName" : "Jolly Rodger"
            }
        }
        ];

        return workorders;
    }

    getWorkOrder() {
      let options = "";
      options = {
          ListType: 'Detail',
      }
      return this.getList(this.ERPObjects.TVS1WorkOrder, options)
    }  

    getOneWorkOrderByCustomer(dataSearchName) {
      let options={
        ListType:'Detail',
        select: '[Customer] f7like "' + dataSearchName +'" OR [ID] f7like "' + dataSearchName +'"',
      }
      return this.getList(this.ERPObjects.TVS1WorkOrder, options);
    }

    getOneWorkOrderByID(id) {
      return this.getOneById(this.ERPObjects.TVS1WorkOrder)
    }
}