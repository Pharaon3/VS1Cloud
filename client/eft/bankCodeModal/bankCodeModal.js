import { ReactiveVar } from "meteor/reactive-var";
import { Template } from 'meteor/templating';
import './bankCodeModal.html';
import {SideBarService} from "../../js/sidebar-service.js";

let sideBarService = new SideBarService();

Template.bankCodeModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.eftOptionsList = new ReactiveVar([]);

  templateObject.tableheaderrecords = new ReactiveVar([]);

  templateObject.getDataTableList = function(data) {
    let linestatus = "";
    if (data.fields.Active == true) {
      linestatus = "";
    } else if (data.fields.Active == false) {
      linestatus = "In-Active";
    }
    let dataList = [
      data.fields.BankCode,
      data.fields.BankName,
      linestatus
    ];
    return dataList;
  }
  let headerStructure = [
    { index: 0, label: 'Code Name', class: 'colAccountName', active: true, display: true, width: "150" },
    { index: 1, label: 'Description', class: 'colDescription', active: true, display: true, width: "300" },
    { index: 2, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
  ];

  templateObject.tableheaderrecords.set(headerStructure);
});

Template.bankCodeModal.onRendered(function () {
});

Template.bankCodeModal.events({

});

Template.bankCodeModal.helpers({
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },

  apiFunction:function() {
    let sideBarService = new SideBarService();
    return sideBarService.getBankCode;
  },

  searchAPI: function() {
    return sideBarService.getBankCode;
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
    return ['limitCount'];
  },
});
