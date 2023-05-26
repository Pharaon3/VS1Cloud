import { TaxRateService } from "../settings/settings-service";
import { ReactiveVar } from "meteor/reactive-var";
import { SideBarService } from "../js/sidebar-service";
import "../lib/global/indexdbstorage.js";

import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import "./volumeunitpopup.html";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";

let sideBarService = new SideBarService();
Template.volumeunitpopup.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.tableheaderrecords = new ReactiveVar([]);

  templateObject.getDataTableList = function (data) {
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
      label: "No",
      class: "colID",
      width: "50",
      active: true,
      display: true,
    },
    {
      index: 1,
      label: "Volume Unit",
      class: "colVolumeUnit",
      width: "600",
      active: true,
      display: true,
    },
    //   {index: 2, label: "Status", class: "colStatus", width: "120", active: true, display: true}
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.volumeunitpopup.onRendered(function () {

});

Template.volumeunitpopup.helpers({
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  apiFunction: function () {
    // do not use arrow function
    return sideBarService.getVolumeUnits;
  },
  searchAPI: function () {
    return sideBarService.getVolumeUnits;
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
