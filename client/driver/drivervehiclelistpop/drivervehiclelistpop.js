import {ContactService} from "../../contacts/contact-service";
import {ReactiveVar} from 'meteor/reactive-var';
import {UtilityService} from "../../utility-service";
import XLSX from 'xlsx';
import {SideBarService} from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js';

let sideBarService = new SideBarService();

import {Template} from 'meteor/templating';
import './drivervehiclelistpop.html';
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';

//Template.drivervehiclelist.inheritsHooksFrom('non_transactional_list');
Template.drivervehiclelistpop.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.setupFinished = new ReactiveVar();


    templateObject.employees = new ReactiveVar([]);


    templateObject.getDataTableList = function (data) {
        let linestatus = '';
        if (data.Active == true) {
            linestatus = "";
        } else if (data.Active == false) {
            linestatus = "In-Active";
        }
        ;
        // if(data.isDriver){
            var dataList = [
                data.EmployeeID || "",
                data.EmployeeName || "",
                data.FirstName || "",
                data.LastName || "",
                data.Type || "Employee",
                data.Phone || "",
                data.Street || "",
                data.State || "",
                data.ShiftTimes || "",
                data.StartLocations || "",
                data.Vehicle || "",
                linestatus,
            ];
            return dataList;
        // }
    }

    let headerStructure = [
        {index: 0, label: 'Emp', class: 'colEmployeeNo', active: false, display: true, width: "10"},
        {index: 1, label: 'Contact Name', class: 'colEmployeeName', active: true, display: true, width: "200"},
        {index: 2, label: 'First Name', class: 'colFirstName', active: true, display: true, width: "100"},
        {index: 3, label: 'Last Name', class: 'colLastName', active: true, display: true, width: "100"},
        {index: 4, label: 'Type', class: 'colType', active: true, display: true, width: "20"},
        {index: 5, label: 'Phone', class: 'colPhone', active: true, display: true, width: "110"},
        {index: 6, label: 'Address', class: 'colAddress', active: true, display: true, width: "300"},
        {index: 7, label: 'State', class: 'colState', active: true, display: true, width: "110"},
        {index: 5, label: 'Shift Times', class: 'colShiftTimes', active: true, display: true, width: "110"},
        {index: 6, label: 'Start Locations', class: 'colStartLocations', active: true, display: true, width: "300"},
        {index: 7, label: 'Vehicle', class: 'colVehicle', active: true, display: true, width: "110"},
        {index: 8, label: 'Status', class: 'colStatus', active: true, display: true, width: "120"},
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.drivervehiclelistpop.onRendered(function () {
    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }
    $('#tblEmployeelist tbody').on('click', 'tr', function () {
    });
    checkSetupFinished();
});

Template.drivervehiclelistpop.events({
  
});

Template.drivervehiclelistpop.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.employeename == 'NA') {
                return 1;
            } else if (b.employeename == 'NA') {
                return -1;
            }
            return (a.employeename.toUpperCase() > b.employeename.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid: localStorage.getItem('mycloudLogonID'), PrefName: 'tblEmployeelist'});
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    },
    isSetupFinished: () => {
        return Template.instance().setupFinished.get();
    },
    getSkippedSteps() {
        let setupUrl = localStorage.getItem("VS1Cloud_SETUP_SKIPPED_STEP") || JSON.stringify().split();
        return setupUrl[1];
    },
    // custom fields displaysettings
    displayfields: () => {
        return Template.instance().displayfields.get();
    },
    employees: () => Template.instance().employees.get(),

    apiFunction: function () {
        let sideBarService = new SideBarService();
        return sideBarService.getAllTEmployeeList;
    },

    searchAPI: function () {
        return sideBarService.getAllEmployeesDataVS1ByName;
    },

    service: () => {
        let sideBarService = new SideBarService();
        return sideBarService;

    },

    datahandler: function () {
        let templateObject = Template.instance();
        return function (data) {
            let dataReturn = templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    exDataHandler: function () {
        let templateObject = Template.instance();
        return function (data) {
            let dataReturn = templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    apiParams: function () {
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },
});
