import { ReactiveVar } from "meteor/reactive-var";
import { FixedAssetService } from "../../fixedasset-service";
import { SideBarService } from "../../../js/sidebar-service";
import { UtilityService } from "../../../utility-service";
import "../../../lib/global/indexdbstorage.js";
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let fixedAssetService = new FixedAssetService();

Template.assetcostreport.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.getDataTableList = function (data) {

    let linestatus = '';
    if(data.fields.Active == true){
      linestatus = "";
    }
    else if(data.fields.Active == false){
      linestatus = "In-Active";
    }
    const dataList = [
      data.fields.ID || "",
      data.fields.AssetName || "",
      data.fields.AdminstrativeCosts || "",
      data.fields.Depreciation || "",
      data.fields.Fuel || "",
      data.fields.Insurance || "",
      data.fields.Loan || "",
      data.fields.Maintenance || "",
      data.fields.Registration || "",
      data.fields.Tolls || "",
      linestatus
    ];
    return dataList;
  };
  let headerStructure = [
    { "index": 0, "label": "ID", "class": "colID", "active": false, "display": true, "width": "30" },
    { "index": 1, "label": "Asset Name", "class": "colAssetName", "active": true, "display": true, "width": "200" },
    { "index": 2, "label": "Administrative Costs", "class": "colAdministrativeCosts", "active": true, "display": true, "width": "500" },
    { "index": 3, "label": "Depreciation", "class": "colDepreciation", "active": true, "display": true, "width": "500" },
    { "index": 4, "label": "Fuel", "class": "colFuel", "active": true, "display": true, "width": "500" },
    { "index": 5, "label": "Insurance", "class": "colInsurance", "active": true, "display": true, "width": "500" },
    { "index": 6, "label": "Loan/Lease", "class": "colLoan", "active": true, "display": true, "width": "500" },
    { "index": 7, "label": "Maintenance", "class": "colMaintenance", "active": true, "display": true, "width": "500" },
    { "index": 8, "label": "Registration", "class": "colRegistration", "active": true, "display": true, "width": "500" },
    { "index": 9, "label": "Tolls", "class": "colTolls", "active": true, "display": true, "width": "500" },
    { "index": 10, "label": "Status", "class": "colStatus", "active": true, "display": true, "width": "120" },
];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.assetcostreport.onRendered(function () {
  let templateObject = Template.instance();
});

Template.assetcostreport.events({

   "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    fixedAssetService.getCostTypeList().then(function (data) {
      addVS1Data("TCostType", JSON.stringify(data))
        .then(function (datareturn) {
          window.open("/assetcostreport", "_self");
        })
        .catch(function (err) {
          window.open("/assetcostreport", "_self");
        });
    }).catch(function (err) {
      window.open("/assetcostreport", "_self");
    });
  },

  'blur .divcolumn': function(event) {
    let columData = $(event.target).html();
    let columHeaderUpdate = $(event.target).attr("valueupdate");
    $("th." + columHeaderUpdate + "").html(columData);
  },

  'change .rngRange': function(event) {
      let range = $(event.target).val();
      let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
      var datable = $('#tblFixedAssetList th');
      $.each(datable, function(i, v) {
          if (v.innerText == columnDataValue) {
              let className = v.className;
              let replaceClass = className.replace(/ /g, ".");
              $("." + replaceClass + "").css('width', range + 'px');

          }
      });

  },
  'click .btnOpenSettings': function(event) {
      let templateObject = Template.instance();
      var columns = $('#tblFixedAssetList th');
      const tableHeaderList = [];
      let sTible = "";
      let sWidth = "";
      let sIndex = "";
      let sVisible = "";
      let columVisible = false;
      let sClass = "";
      $.each(columns, function(i, v) {
          if (v.hidden == false) {
              columVisible = true;
          }
          if ((v.className.includes("hiddenColumn"))) {
              columVisible = false;
          }
          sWidth = v.style.width.replace('px', "");

          let datatablerecordObj = {
              sTitle: v.innerText || '',
              sWidth: sWidth || '',
              sIndex: v.cellIndex || 0,
              sVisible: columVisible || false,
              sClass: v.className || ''
          };
          tableHeaderList.push(datatablerecordObj);
      });

      templateObject.tableheaderrecords.set(tableHeaderList);
  },

});

Template.assetcostreport.helpers({
  datatablerecords: () => {
    return Template.instance().datatablerecords.get();
  },
  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },

  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },

  apiFunction: function () {
    let fixedAssetService = new FixedAssetService();
    return fixedAssetService.getCostTypeList;
  },

  searchAPI: function () {
    return fixedAssetService.getCostTypeListDetail;
  },

  service: () => {
    let fixedAssetService = new FixedAssetService();
    return fixedAssetService;
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

  apiParams: function () {
    return ["limitCount", "limitFrom", "deleteFilter"];
  },
});
