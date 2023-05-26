import { ReactiveVar } from 'meteor/reactive-var';
import { TaxRateService } from "../../settings/settings-service.js";
import { SideBarService } from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js';
import { Template } from 'meteor/templating';
import moment from "moment";

import './PayrollOverviewPayrun.html';

let sideBarService = new SideBarService();

Template.PayrollOverviewPayrun.onCreated(function () {

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
        { index: 5, label: 'Super', class: 'colPayRunSuper', active: true, display: true, width: "100" },
        { index: 6, label: 'Net Pay', class: 'colPayRunNetPay', active: true, display: true, width: "100" },
        { index: 7, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    
    templateObject.tableheaderrecords.set(headerStructure);

    let headerStructure1 = [
        { index: 0, label: 'ID', class: 'colDraftPayRunID', active: false, display: true, width: "10" },
        { index: 1, label: 'Calendar', class: 'colPayRunCalendar', active: true, display: true, width: "100" },
        { index: 2, label: 'Period', class: 'colPayRunPeriod', active: true, display: true, width: "100" },
        { index: 3, label: 'Payment Date', class: 'colPayRunPaymentDate', active: true, display: true, width: "150" },
        { index: 4, label: 'Wages', class: 'colPayRunWages', active: true, display: true, width: "150" },
        { index: 5, label: 'Tax', class: 'colPayRunTax', active: true, display: true, width: "100" },
        { index: 5, label: 'Super', class: 'colPayRunSuper', active: true, display: true, width: "100" },
        { index: 6, label: 'Net Pay', class: 'colPayRunNetPay', active: true, display: true, width: "100" },
        { index: 7, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    
    templateObject.tableheaderrecords1.set(headerStructure1);
});

Template.PayrollOverviewPayrun.onRendered(function (){
    const templateObject = Template.instance();
    templateObject.getDraftPayRunData = function(){
        let refresh = false;
        getVS1Data('TPayRunHistory').then(async function (dataObject) {
            if (dataObject.length == 0) {
                let data = await CachedHttp.get(erpObject.TPayRunHistory, async () => {
                    return await payRunHandler.loadFromLocal();
                  }, {
                    forceOverride: refresh,
                    validate: (cachedResponse) => {
                      return true;
                    }
                  });

                data = data.response;
                const payRuns = PayRun.fromList(data);
                await addVS1Data('TPayRunHistory', JSON.stringify(payRuns));
                templateObject.displayDraftPayRun(payRuns);
            } else {
                let data = JSON.parse(dataObject[0].data);
                templateObject.displayDraftPayRun(data);
            }
        }).catch(async function (err) {
            let data = await CachedHttp.get(erpObject.TPayRunHistory, async () => {
                return await payRunHandler.loadFromLocal();
              }, {
                forceOverride: refresh,
                validate: (cachedResponse) => {
                  return true;
                }
              });

            data = data.response;
            const payRuns = PayRun.fromList(data);
            await addVS1Data('TPayRunHistory', JSON.stringify(payRuns));
            templateObject.displayDraftPayRun(payRuns);
        });
    }

});

Template.PayrollOverviewPayrun.events({

});


Template.PayrollOverviewPayrun.helpers({
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
            let dataReturn =  templateObject.getDataTableList(data);
            return dataReturn;
        }
    },
    exDataHandler1: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data);
            return dataReturn;
        }
    },
    apiParams1: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },
});
