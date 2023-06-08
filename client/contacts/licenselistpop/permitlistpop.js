import { ReactiveVar } from "meteor/reactive-var";

import { LicenseService } from "./license-serivce";
import "../../lib/global/indexdbstorage.js";

import { Template } from "meteor/templating";
import "./permitlistpop.html";

import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { UtilityService } from "../../utility-service";
let licenseService = new LicenseService();
let utilityService = new UtilityService();
Template.permitlistpop.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.custfields = new ReactiveVar([]);
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
  templateObject.convertedStatus = new ReactiveVar();

  templateObject.getDataTableList = function (data) {
    // console.log("data: ", data);
    // if(data.Type == "License"){
      let linestatus = '';
      if(data.Active == true){
        linestatus = "";
      }
      else if(data.Active == false){
        linestatus = "In-Active";
      }
      const dataList = [
        data.Id || "",
        data.Title || "",
        linestatus
      ];
      return dataList;
    // } else return;
  };

  templateObject.getExData = function (data) {
    const dataList = [
      data.Id || "",
      data.Title || "",
      linestatus
    ];
    return dataList;
  };

  let headerStructure = [
    {
      index: 0,
      label: "ID",
      class: "colPermitId",
      active: false,
      display: true,
      width: "10",
    },
    {
      index: 1,
      label: "Permit Type",
      class: "colPermitType",
      active: true,
      display: true,
      width: "130",
    },
    {
      index: 2,
      label: "Status",
      class: "colStatus",
      active: true,
      display: true,
      width: "120",
    },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.permitlistpop.onRendered(function () {
  // $("#tblFixedAssetList tbody").on("click", "tr", function () {
  //   var assetID = parseInt($(this).find(".AssetRegisterId").html());
  //   FlowRouter.go("/fixedassetcard?assetId=" + assetID);
  // });
});

Template.permitlistpop.events({
  
});

Template.permitlistpop.helpers({
  datatablerecords: () => {
    return Template.instance().datatablerecords.get();
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "tblFixedAssetList",
    });
  },
  // custom fields displaysettings
  custfields: () => {
    return Template.instance().custfields.get();
  },

  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },

  convertedStatus: () => {
    return Template.instance().convertedStatus.get();
  },

  apiFunction: function () {
    // do not use arrow function
    return licenseService.getPermit;
  },

  searchAPI: function () {
    return licenseService.getPermit;
  },

  apiParams: function () {
    return ["limitCount", "limitFrom", "deleteFilter"];
  },

  service: () => {
    return licenseService;
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
      let dataReturn = templateObject.getExData(data);
      return dataReturn;
    };
  },

  tablename : function() {
    let templateObject = Template.instance();
    return 'tblPermitList' + templateObject.data.custid;
  }
});
