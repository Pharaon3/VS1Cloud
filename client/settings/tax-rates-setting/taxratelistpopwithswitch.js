import {
    TaxRateService
} from "../settings-service";
import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    SideBarService
} from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js';

import { Template } from 'meteor/templating';
import './taxratelistpopwithswitch.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import moment from "moment";

let taxRateService = new TaxRateService();
let sideBarService = new SideBarService();

Template.taxratelistpopwithswitch.onCreated(function () {
    let templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.getDataTableList = function(data) {
        if(data && data.fields) data = data.fields;

        let taxRate = (data.Rate * 100).toFixed(2);

        let pan = templateObject.data.custId;

        let chkBoxId = "t-" + pan + "-" + data.ID

        let chkBox = '<div class="custom-control custom-switch chkBox pointer text-center">' +
            '<input name="pointer" class="custom-control-input chkBox notevent pointer" type="checkbox" id="' + chkBoxId + '" name="' + chkBoxId + '">' +
            '<label class="custom-control-label chkBox pointer" for="' + chkBoxId + '"></label></div>';

        var dataList = [
            chkBox,
            data.ID || '',
            data.CodeName || '',
            data.Description || '-',
            taxRate || 0,
            data.Active ? "" : "In-Active",
        ];
        return dataList;
    }

    let checkBoxHeader = `<div class="custom-control custom-switch colChkBoxAll pointer text-center">
        <input name="pointer" class="custom-control-input colChkBoxAll pointer" type="checkbox" id="colChkBoxAll" value="0">
        <label class="custom-control-label colChkBoxAll" for="colChkBoxAll"></label>
        </div>`;

    let headerStructure = [
        { index: 0, label: checkBoxHeader, class: 'colCheckBox', active: true, display: false, width: "40" },
        { index: 1, label: "ID", class: "colID", width: "10", active: false, display: true },
        { index: 2, label: "Name", class: "colName taxName", width: "80", active: true, display: true },
        { index: 3, label: "Description", class: "colDescription", width: "500", active: true, display: true },
        { index: 4, label: "Rate", class: "colRate taxRate", width: "110", active: true, display: true },
        { index: 5, label: "Status", class: "colStatus", width: "120", active: true, display: true },
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.taxratelistpopwithswitch.onRendered(function () {
    let templateObject = Template.instance();

    let prefix = templateObject.data.custid ? templateObject.data.custid : '';
    $(`#taxRateListModal${prefix}`).on('shown.bs.modal', function(){
        setTimeout(function() {
            $(`#tblTaxRate${prefix}_filter .form-control-sm`).get(0).focus()
        }, 500);
    });
});

Template.taxratelistpopwithswitch.events({
    'click .btnRefreshTax': function (event) {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        const customerList = [];
        const clientList = [];
        let salesOrderTable;
        var splashArray = new Array();
        var splashArrayTaxRateList = new Array();
        const dataTableList = [];
        const tableHeaderList = [];

        let dataSearchName = $('#tblTaxRate_filter input').val();
        var currentLoc = FlowRouter.current().route.path;
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getTaxRateVS1ByName(dataSearchName).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                if (data.ttaxcodevs1.length > 0) {
                    for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                        let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                        var dataList = [
                            data.ttaxcodevs1[i].Id || '',
                            data.ttaxcodevs1[i].CodeName || '',
                            data.ttaxcodevs1[i].Description || '-',
                            taxRate || 0,
                        ];

                        let taxcoderecordObj = {
                            codename: data.ttaxcodevs1[i].CodeName || ' ',
                            coderate: taxRate || ' ',
                        };

                        // taxCodesList.push(taxcoderecordObj);

                        splashArrayTaxRateList.push(dataList);
                    }

                    var datatable = $('#tblTaxRate').DataTable();
                    datatable.clear();
                    datatable.rows.add(splashArrayTaxRateList);
                    datatable.draw(false);

                    $('.fullScreenSpin').css('display', 'none');
                } else {

                    $('.fullScreenSpin').css('display', 'none');
                    $('#taxRateListModal').modal('toggle');
                    swal({
                        title: 'Question',
                        text: "Tax Code does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            $('#newTaxRateModal').modal('toggle');
                            $('#edtTaxNamePop').val(dataSearchName);
                        } else if (result.dismiss === 'cancel') {
                            $('#newTaxRateModal').modal('toggle');
                        }
                    });

                }

            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            sideBarService.getTaxRateVS1().then(function (data) {

                let records = [];
                let inventoryData = [];
                for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                    let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                    var dataList = [
                        data.ttaxcodevs1[i].Id || '',
                        data.ttaxcodevs1[i].CodeName || '',
                        data.ttaxcodevs1[i].Description || '-',
                        taxRate || 0,
                    ];

                    let taxcoderecordObj = {
                        codename: data.ttaxcodevs1[i].CodeName || ' ',
                        coderate: taxRate || ' ',
                    };

                    // taxCodesList.push(taxcoderecordObj);

                    splashArrayTaxRateList.push(dataList);
                }
                var datatable = $('#tblTaxRate').DataTable();
                datatable.clear();
                datatable.rows.add(splashArrayTaxRateList);
                datatable.draw(false);

                $('.fullScreenSpin').css('display', 'none');
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        }
    },
    'keyup #tblTaxRate_filter input': function (event) {
        if (event.keyCode == 13) {
            $(".btnRefreshTax").trigger("click");
        }
    }
});

Template.taxratelistpopwithswitch.helpers({
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getTaxRateVS1List;
    },

    searchAPI: function() {
        return sideBarService.getTaxRateVS1ByName;
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
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },
    tablename: () => {
        let templateObject = Template.instance();
        return 'tblTaxRate'+templateObject.data.custid;
      },
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
