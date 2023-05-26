import { ReactiveVar } from "meteor/reactive-var";
import { FixedAssetService } from "../../fixedasset-service";
import { SideBarService } from "../../../js/sidebar-service";
import { UtilityService } from "../../../utility-service";
import "../../../lib/global/indexdbstorage.js";
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let fixedAssetService = new FixedAssetService();

Template.assetcostlist.onCreated(function () {
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
      data.fields.TypeName || "",
      data.fields.Description || "",
      linestatus
    ];
    return dataList;
  };
  let headerStructure = [
    { "index": 0, "label": "ID", "class": "colID", "active": false, "display": true, "width": "30" },
    { "index": 1, "label": "Type Name", "class": "colTypeName", "active": true, "display": true, "width": "200" },
    { "index": 2, "label": "Description", "class": "colDescription", "active": true, "display": true, "width": "500" },
    { "index": 3, "label": "Status", "class": "colStatus", "active": true, "display": true, "width": "120" },
];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.assetcostlist.onRendered(function () {
  let templateObject = Template.instance();
});

Template.assetcostlist.events({

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

Template.assetcostlist.helpers({
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
