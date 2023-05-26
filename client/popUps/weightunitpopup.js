import { TaxRateService } from "../settings/settings-service";
import { ReactiveVar } from "meteor/reactive-var";
import { SideBarService } from "../js/sidebar-service";
import "../lib/global/indexdbstorage.js";

import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import "./weightunitpopup.html";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";

let sideBarService = new SideBarService();
Template.weightunitpopup.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.tableheaderrecords = new ReactiveVar([]);

  templateObject.getDataTableList = function (data) {
    //   let linestatus = '';
    // if (data.length == 2) {
    //   if (data[2] == true) {
    //     linestatus = "";
    //   } else if (data[2] == false) {
    //     linestatus = "In-Active";
    //   }
    // }
    let dataList = [
      data[0],
      data[1],
      // linestatus
    ];
    return dataList;
  };

  let headerStructure = [
    {
      index: 0,
      label: "ID",
      class: "colID",
      width: "50",
      active: true,
      display: true,
    },
    {
      index: 1,
      label: "Weight Unit",
      class: "colWeightUnit",
      width: "600",
      active: true,
      display: true,
    },
    //   {index: 2, label: "Status", class: "colStatus", width: "120", active: true, display: true}
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.weightunitpopup.onRendered(function () {

});

Template.weightunitpopup.events({

});

Template.weightunitpopup.helpers({
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  apiFunction: function () {
    // do not use arrow function
    return sideBarService.getWeightUnits;
  },
  searchAPI: function () {
    return sideBarService.getWeightUnits;
  },
  apiParams: function () {
    return [];
  },
  service: () => {
    return sideBarService;
  },
  datahandler: function () {
    let templateObject = Template.instance();
    return function (data) {
      let dataReturn = templateObject.getDataTableList(data);
      return dataReturn;
    };
  },
  exDataHandler: function () {
    let templateObject = Template.instance();
    return function (data) {
      let dataReturn = templateObject.getDataTableList(data);
      return dataReturn;
    };
  },
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});
