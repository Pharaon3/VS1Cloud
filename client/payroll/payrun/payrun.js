import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    CoreService
} from '../../js/core-service';
import {
    UtilityService
} from "../../utility-service";
import {
    ContactService
} from "../../contacts/contact-service";
import {
    ProductService
} from "../../product/product-service";
import {
    SideBarService
} from '../../js/sidebar-service';
import 'jquery-editable-select';
import {Template} from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './payrun.html';
let utilityService = new UtilityService();
let sideBarService = new SideBarService();
Template.payrun.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords1 = new ReactiveVar([]);
    templateObject.datatablerecords1 = new ReactiveVar([]);

    templateObject.getDataTableList = function(data){
        let dataList = [
            data.fields.ID || "",
            data.fields.Payperiod || "",
            moment(data.fields.payDate).format("DD/MM/YYYY") || "",
            moment(data.fields.DatePaid).format("DD/MM/YYYY") || "",
            data.fields.wages || "",
            data.fields.tax || "",
            data.fields.superAnnuation || "",
            data.fields.net || "",
            data.fields.Deleted == false ? '' : 'Deleted'
        ];
        return dataList;
    }

    templateObject.getDataTableList1 = function(data){
        let dataList = [
            data.fields.ID || "",
            data.fields.Payperiod || "",
            moment(data.fields.payDate).format("DD/MM/YYYY") || "",
            moment(data.fields.DatePaid).format("DD/MM/YYYY") || "",
            data.fields.wages || "",
            data.fields.tax || "",
            data.fields.superAnnuation || "",
            data.fields.net || "",
            data.fields.Deleted == false ? '' : 'Deleted'
        ];
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: 'ID', class: 'colDraftPayRunID', active: false, display: true, width: "10" },
        { index: 1, label: 'Calendar', class: 'colPayRunCalendar', active: true, display: true, width: "100" },
        { index: 2, label: 'Period', class: 'colPayRunPeriod', active: true, display: true, width: "100" },
        { index: 3, label: 'Payment Date', class: 'colPayRunPaymentDate', active: true, display: true, width: "150" },
        { index: 4, label: 'Wages', class: 'colPayRunWages', active: true, display: true, width: "150" },
        { index: 5, label: 'Tax', class: 'colPayRunTax', active: true, display: true, width: "100" },
        { index: 6, label: 'Super', class: 'colPayRunSuper', active: true, display: true, width: "100" },
        { index: 7, label: 'Net Pay', class: 'colPayRunNetPay', active: true, display: true, width: "100" },
        { index: 8, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    
    templateObject.tableheaderrecords.set(headerStructure);

    let headerStructure1 = [
        { index: 0, label: 'ID', class: 'colDraftPayRunID', active: false, display: true, width: "10" },
        { index: 1, label: 'Calendar', class: 'colPayRunCalendar', active: true, display: true, width: "100" },
        { index: 2, label: 'Period', class: 'colPayRunPeriod', active: true, display: true, width: "100" },
        { index: 3, label: 'Payment Date', class: 'colPayRunPaymentDate', active: true, display: true, width: "150" },
        { index: 4, label: 'Wages', class: 'colPayRunWages', active: true, display: true, width: "150" },
        { index: 5, label: 'Tax', class: 'colPayRunTax', active: true, display: true, width: "100" },
        { index: 6, label: 'Super', class: 'colPayRunSuper', active: true, display: true, width: "100" },
        { index: 7, label: 'Net Pay', class: 'colPayRunNetPay', active: true, display: true, width: "100" },
        { index: 8, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    
    templateObject.tableheaderrecords1.set(headerStructure1);
});

Template.payrun.onRendered(function() {

});

Template.payrun.events({
    'click .btnSingleTouchPayroll': function(event) {
        $('.modal-backdrop').css('display', 'none');
        FlowRouter.go('/singletouchpayroll');
    },
    'click #payrun100': function(event) {
        $('.modal-backdrop').css('display', 'none');
        FlowRouter.go('/singletouchpayroll');
    }

});

Template.payrun.helpers({
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    apiFunction:function() {
        return sideBarService.getAllPayRunDataVS1;
    },
    searchAPI: function() {
        return sideBarService.getOnePayrunByName;
    },
    service: ()=>{
        return sideBarService;
    },
    datahandler: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data);
            return dataReturn;
        }
    },
    exDataHandler: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data);
            return dataReturn;
        }
    },
    apiParams: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },

    tableheaderrecords1: () => {
        return Template.instance().tableheaderrecords1.get();
    },
    apiFunction1:function() {
        return sideBarService.getAllPayHistoryDataVS1;
    },
    searchAPI1: function() {
        return sideBarService.getOnePayrunHistoryByName;
    },
    service1: ()=>{
        return sideBarService;
    },
    datahandler1: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList1(data);
            return dataReturn;
        }
    },
    exDataHandler1: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList1(data);
            return dataReturn;
        }
    },
    apiParams1: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },
    tablename: () => {
        return 'tblPayRunHistory';
      },
});
