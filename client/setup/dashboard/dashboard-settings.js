import "./dashboard-settings.html";
import { ReactiveVar } from "meteor/reactive-var";
import "../../lib/global/indexdbstorage.js";
import { Template } from "meteor/templating";
import { SideBarService } from "../../js/sidebar-service";

let sideBarService = new SideBarService();

Template.wizard_dashboard.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.getDashboardOptions = async function () {
    let data;
    const initialData = require("../../popUps/dashboardoptions.json");
    try {
      const dataObject = await getVS1Data("TDashboardOptions");
      if (dataObject.length) {
        data = JSON.parse(dataObject[0].data);
      } else {
        data = initialData;
      }
    } catch (error) {
      data = initialData;
    }
    return data;
  };
  templateObject.getDataTableList = function (data) {
    const isShowDefaultCheckbox = `
    <span style="display:none;">${data.isshowdefault}</span>
    <div class="custom-control custom-switch text-center">
        <input 
            type="checkbox" 
            class="custom-control-input optradioDL" 
            name="showdefaultinput" 
            id="formShowP-${data.Id}" 
            value="${data.name}" 
            ${data.isshowdefault ? "checked" : ""}
        >
        <label 
            class="custom-control-label" 
            for="formShowP-${data.Id}">
        </label>
    </div>`;
    const isDefaultLoginCheckBox = `
    <span style="display:none;">${data.isdefaultlogin}</span>
    <div class="custom-control custom-switch text-center">
        <input 
            type="radio"
            class="custom-control-input optradioDL"
            name="optcheckboxDL"
            id="formCheckP-${data.Id}"
            value="${data.name}"
            ${data.isdefaultlogin ? "checked" : ""}
        >
        <label
            class="custom-control-label"
            for="formCheckP-${data.Id}">
        </label>
    </div>`;
    let dataList = [
      data.Id, data.name || "",
      isShowDefaultCheckbox,
      isDefaultLoginCheckBox,
    ];
    return dataList;
  };
  let headerStructure = [
    { index: 0, label: "ID", class: "colOptionsID", active: false, display: true, width: "20" },
    { index: 1, label: "Options Name", class: "colOptionsName", active: true, display: true, width: "1070" },
    { index: 2, label: "Show Dashboards", class: "colShowDef", active: true, display: true, width: "175" },
    { index: 3, label: "Dashboard load at login", class: "colLogginDef", active: true, display: true, width: "200" },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.wizard_dashboard.onRendered(function () {});

Template.wizard_dashboard.events({
  'change [name="optcheckboxDL"]': async function (event) {
    const value = $(event.target).val();
    const isChecked = event.target.checked;
    const templateObject = Template.instance();
    let data = await templateObject.getDashboardOptions();
    const updatedIndex = data.findIndex((d) => d.name == value);
    data[updatedIndex].isdefaultlogin = isChecked;
    addVS1Data("TDashboardOptions", JSON.stringify(data));
  },
  'change [name="showdefaultinput"]': async function (event) {
    const value = $(event.target).val();
    const isChecked = event.target.checked;
    const templateObject = Template.instance();
    let data = await templateObject.getDashboardOptions();
    const updatedIndex = data.findIndex((d) => d.name == value);
    if (isChecked) {
      for (let i = 0; i < data.length; i++) {
        data[i].isshowdefault = false;
      }
    }
    data[updatedIndex].isshowdefault = isChecked;
    addVS1Data("TDashboardOptions", JSON.stringify(data));
  },
  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    location.reload(true);
  },
});

Template.wizard_dashboard.helpers({
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  apiFunction: function () {
    // do not use arrow function
    let sideBarService = new SideBarService();
    return sideBarService.getDashboardOptions;
  },
  searchAPI: function () {
    return sideBarService.getDashboardOptionsByName;
  },
  service: () => {
    let sideBarService = new SideBarService();
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
  apiParams: function () {
    return ["limitCount", "limitFrom", "deleteFilter"];
  },
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});
