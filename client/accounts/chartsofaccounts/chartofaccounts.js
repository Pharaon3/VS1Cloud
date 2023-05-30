import { ReactiveVar } from "meteor/reactive-var";
import { UtilityService } from "../../utility-service.js";
import { SideBarService } from "../../js/sidebar-service.js";
import "../../lib/global/indexdbstorage.js";
//Import
import { Template } from 'meteor/templating';
import './chartofaccounts.html';

let utilityService = new UtilityService();
let sideBarService = new SideBarService();
Template.chartofaccounts.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.tableheaderrecords = new ReactiveVar([]);

  templateObject.getDataTableList = function (data) {
    let linestatus = "";
    if (data.Active == true) {
      linestatus = "";
    } else if (data.Active == false) {
      linestatus = "In-Active";
    }
    var dataList = [
      data.AccountID || "",
      data.Taxcode || "",
      data.AccountName || "",
      data.AccountType || "",
      data.TaxCode || "",
      data.ExpiryDate || "",
      linestatus,
    ];
    // let dataList = [];
    return dataList;
  };

  let headerStructure = [
    {
      index: 0,
      label: "ID",
      class: "colAccountId",
      active: false,
      display: true,
      width: "10",
    },
    {
      index: 1,
      label: "Code",
      class: "colTaxCode",
      active: true,
      display: true,
      width: "200",
    },
    {
      index: 2,
      label: "Account Name",
      class: "colAccountName",
      active: true,
      display: true,
      width: "200",
    },
    {
      index: 3,
      label: "Type",
      class: "colType",
      active: true,
      display: true,
      width: "60",
    },
    {
      index: 4,
      label: "Tax Rate",
      class: "colTaxRate",
      active: true,
      display: true,
      width: "80",
    },
    {
      index: 5,
      label: "YTD",
      class: "colTaxRate",
      active: true,
      display: true,
      width: "80",
    },
    {
        index: 6,
        label: "Status",
        class: "colStatus",
        active: true,
        display: true,
        width: "120",
    },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.chartofaccounts.onRendered(function() {
});

Template.chartofaccounts.events({
});

Template.chartofaccounts.helpers({
    tableheaderrecords: () => {
        let templateObject = Template.instance();
        return templateObject.tableheaderrecords.get();
    },
    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getAllTAccountVS1List;
    },

    searchAPI: function() {
        return sideBarService.getAllAccountDataVS1ByName;
    },

    service: ()=>{
        let sideBarService = new SideBarService();
        return sideBarService;

    },

    datahandler: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    exDataHandler: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    apiParams: function() {
        return ["limitCount", "limitFrom", "deleteFilter", "typeFilter", "useReceiptClaim"];
    },
});
