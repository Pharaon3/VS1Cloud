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
import CachedHttp from '../../lib/global/CachedHttp';
import erpObject from '../../lib/global/erp-objects';
// import index from "magento-api-rest";
import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';
import './singletouch.html';
let utilityService = new UtilityService();
let sideBarService = new SideBarService();

Template.singletouch.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.custfields = new ReactiveVar([]);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);

    templateObject.getDataTableList = function (data) {
        let dataList = [
            data.fields.ID || '',
            moment(data.fields.MsTimeStamp).format("DD/MM/YYYY"),
            data.fields.earnings || '',
            data.fields.payg || '',
            data.fields.supperannuation || '',
            data.fields.netpay || '',
            data.fields.PayrollCalendarActive == true ? '' : 'In-Active'
        ];
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: "ID", class: "ID", active: false, display: true, width: "10" },
        { index: 1, label: "Date", class: "Date", active: true, display: true, width: "150" },
        { index: 2, label: "Earnings", class: "Earnings", active: true, display: true, width: "100" },
        { index: 3, label: "PAYG", class: "PAYG", active: true, display: true, width: "100" },
        { index: 4, label: "Superannuation", class: "Superannuation", active: true, display: true, width: "150" },
        { index: 5, label: "Net Pay", class: "NetPay", active: true, display: true, width: "150" },
        { index: 6, label: "Status", class: "Status", active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.singletouch.onRendered(function() {
    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();
    let contactService = new ContactService();
    const dataTableList = [];
    const tableHeaderList = [];
    var splashArraySTPList = new Array();

    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }
    $('#tblSingleTouchPayroll tbody').on( 'click', 'tr', function () {
        const listData = $(this).closest('tr').attr('id');
        if(listData){
            FlowRouter.go('/singletouchpayroll?id=' + listData);
        }
    });
    checkSetupFinished();
    $('.fullScreenSpin').css('display', 'none');
});

Template.singletouch.events({
    'click .btnPayRunNext': function(event) {
        $('.modal-backdrop').css('display', 'none');
        FlowRouter.go('/payrundetails');
    },
    'click .btnSingleTouchPayroll': function(event) {
        $('.modal-backdrop').css('display', 'none');
        FlowRouter.go('/singletouchpayroll');
    },
    'click #100': function(event) {
        $('.modal-backdrop').css('display', 'none');
        FlowRouter.go('/singletouchpayroll');
    }

});

Template.singletouch.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.company == 'NA') {
                return 1;
            } else if (b.company == 'NA'){
                return -1;
            }
            return (a.company.toUpperCase() > b.company.toUpperCase()) ? 1 : -1;
        })
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    displayfields: () => {
        return Template.instance().displayfields.get();
    },
    apiFunction:function() {
        return sideBarService.getAllCustomersDataVS1;
    },
    searchAPI: function() {
        return sideBarService.getAllCustomersDataVS1ByName;
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
});
