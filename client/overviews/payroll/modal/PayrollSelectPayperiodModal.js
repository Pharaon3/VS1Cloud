import { ReactiveVar } from 'meteor/reactive-var';
import { TaxRateService } from '../../../settings/settings-service';
import { SideBarService } from '../../../js/sidebar-service';
import '../../../lib/global/indexdbstorage.js';
import { Template } from 'meteor/templating';
import moment from "moment";

import './PayrollSelectPayperiodModal.html';

let sideBarService = new SideBarService();

Template.PayrollSelectPayperiodModal.onCreated(function () {

    const templateObject = Template.instance();
    templateObject.tableheaderrecords = new ReactiveVar();
    templateObject.datatablerecords = new ReactiveVar([]);

    templateObject.getDataTableList = function(data){
        let dataList = [
            data.fields.ID || "",
            data.fields.PayrollCalendarName || "",
            data.fields.PayrollCalendarPayPeriod || "",
            moment(data.fields.PayrollCalendarStartDate).format('DD/MM/YYYY') || "",
            moment(data.fields.PayrollCalendarFirstPaymentDate).format('DD/MM/YYYY') || "",
            data.fields.PayrollCalendarActive == true ? '' : 'In-Active',
        ];
        return dataList;
    }
    let headerStructure  = [
        { index: 0, label: 'ID', class: 'colCalenderID', active: false, display: true, width: "10" },
        { index: 1, label: 'Name', class: 'colPayCalendarName', active: true, display: true, width: "250" },
        { index: 2, label: 'Pay Period', class: 'colPayPeriod', active: true, display: true, width: "150" },
        { index: 3, label: 'Next Pay Period', class: 'colNextPayPeriod', active: true, display: true, width: "200" },
        { index: 4, label: 'Next Payment Date', class: 'colNextPaymentDate', active: true, display: true, width: "300" },
        { index: 5, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.PayrollSelectPayperiodModal.onRendered(function (){

});

Template.PayrollSelectPayperiodModal.events({
    'click .btnAddNewPayCalender':function(){
        if( !$(".updateCalendarInActive").hasClass("d-none") || !$('.updateCalendarActive').hasClass('d-none')) {
            if(!$(".updateCalendarInActive").hasClass("d-none"))
                $(".updateCalendarInActive").addClass('d-none');
            else 
                $(".updateCalendarActive").addClass('d-none');
        }
        if(!$('.body-panel').hasClass('d-none')) {
            $('.body-panel').addClass('d-none');
        }
        let id = $('#paycalendarId').val();
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = dd+'/'+mm+'/'+ yyyy;
        $('#edtStartDate').val(today);
        $('#paycalendarId').val(0);
        $('#calender_name').val('');
        $('#newPayCalendarLabel').text('Add New Pay Calender');
        $('#payperiod').val('');
    },

    'click .updateCalendarInActive': function () {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        let taxRateService = new TaxRateService();
        let oldpaycalenderid  = $('#paycalendarId').val() || 0;
        let payperiod = $('#payperiod').val() || '';
        let calender_name = $('.calender_name').val() || '';
        let startdate = $('#edtStartDate').val() || '';
        let FirstPaymentDate = $('#edtFirstPaymentDate').val() || '';

         if (payperiod === '') {
            LoadingOverlay.hide();
            swal('Pay period has not been selected!', '', 'warning');
            e.preventDefault();
         }
         else if(calender_name === '')
         {
             LoadingOverlay.hide();
             swal('Calender Name Can not blank!', '', 'warning');
             e.preventDefault();

         }
         else if(startdate === '')
         {
             LoadingOverlay.hide();
             swal('Start Date Has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else if(FirstPaymentDate === '')
         {
             LoadingOverlay.hide();
             swal('First Payment Date Has not been selected!', '', 'warning');
             e.preventDefault();

         }
         else
         {
                LoadingOverlay.show();
                objDetails = {
                    type: "TPayrollCalendars",
                    fields: {
                        ID: parseInt(oldpaycalenderid),
                        PayrollCalendarPayPeriod:payperiod,
                        PayrollCalendarName:calender_name,
                        PayrollCalendarStartDate:moment(startdate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                        PayrollCalendarFirstPaymentDate:moment(FirstPaymentDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                        PayrollCalendarActive : false,
                    }
                };

                taxRateService.saveCalender(objDetails).then(function (objDetails) {
                    LoadingOverlay.hide();
                    swal({
                        title: 'Success',
                        text: 'Pay Calendar In Active successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'

                    }).then((result) => {
                        if (result.value) {
                            sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                                addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                                        $('#closemodel').trigger('click');
                                        LoadingOverlay.show();
                                        $("#tblPayCalendars").DataTable().ajax.reload();
                                    }).catch(function (err) {
                                        $('#closemodel').trigger('click');
                                        LoadingOverlay.show();

                                        $("#tblPayCalendars").DataTable().ajax.reload();
                                    });
                                }).catch(function (err) {
                                    $('#closemodel').trigger('click');
                                    LoadingOverlay.show();

                                    $("#tblPayCalendars").DataTable().ajax.reload();
                                });
                        }else if (result.dismiss === 'cancel') {

                        }
                    });

                }).catch(function (err) {

                    LoadingOverlay.hide();
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'ok'
                        }).then((result) => {
                        if (result.value) {
                        } else if (result.dismiss === 'cancel') {
                        }
                    });


                });
            }
    },

    'click .updateCalendarActive': function () {
        let templateObject = Template.instance();
        LoadingOverlay.show();
        let taxRateService = new TaxRateService();
        let oldpaycalenderid  = $('#paycalendarId').val() || 0;
        let payperiod = $('#payperiod').val() || '';
        let calender_name = $('.calender_name').val() || '';
        let startdate = $('#edtStartDate').val() || '';
        let FirstPaymentDate = $('#edtFirstPaymentDate').val() || '';

        if (payperiod === '') {
        LoadingOverlay.hide();
        swal('Pay period has not been selected!', '', 'warning');
        e.preventDefault();
        }
        else if(calender_name === '')
        {
            LoadingOverlay.hide();
            swal('Calender Name Can not blank!', '', 'warning');
            e.preventDefault();

        }
        else if(startdate === '')
        {
            LoadingOverlay.hide();
            swal('Start Date Has not been selected!', '', 'warning');
            e.preventDefault();

        }
        else if(FirstPaymentDate === '')
        {
            LoadingOverlay.hide();
            swal('First Payment Date Has not been selected!', '', 'warning');
            e.preventDefault();

        }
        else
        {
            LoadingOverlay.show();
            objDetails = {
                type: "TPayrollCalendars",
                fields: {
                    ID: parseInt(oldpaycalenderid),
                    PayrollCalendarPayPeriod:payperiod,
                    PayrollCalendarName:calender_name,
                    PayrollCalendarStartDate:moment(startdate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                    PayrollCalendarFirstPaymentDate:moment(FirstPaymentDate,'DD/MM/YYYY').format('YYYY-MM-DD'),
                    PayrollCalendarActive : true,
                }
            };

            taxRateService.saveCalender(objDetails).then(function (objDetails) {
                LoadingOverlay.hide();
                swal({
                    title: 'Success',
                    text: 'Pay Calendar Active successfully.',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'

                }).then((result) => {
                    if (result.value) {
                        sideBarService.getCalender(initialBaseDataLoad, 0).then(function (dataReload) {
                            addVS1Data("TPayrollCalendars", JSON.stringify(dataReload)).then(function (datareturn) {
                                $('#closemodel').trigger('click');
                                LoadingOverlay.show();
                                    window.open('/payrollrules?active_key=calender','_self');
                            }).catch(function (err) {
                                $('#closemodel').trigger('click');
                                LoadingOverlay.show();

                                window.open('/payrollrules?active_key=calender','_self');
                            });
                            }).catch(function (err) {
                                $('#closemodel').trigger('click');
                                LoadingOverlay.show();

                                window.open('/payrollrules?active_key=calender','_self');
                            });
                    }else if (result.dismiss === 'cancel') {

                    }
                });

            }).catch(function (err) {
                LoadingOverlay.hide();
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'ok'
                }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === 'cancel') {
                    }
                });
            });
        }
    },

    'click .tblPayCaledars tbody tr': function (event) {
        let targetId = $(this).closest('tr').attr('id');
        $('#selectLineID').val(targetId);
    },
});


Template.PayrollSelectPayperiodModal.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.code == 'NA') {
                return 1;
            } else if (b.code == 'NA') {
                return -1;
            }
            return (a.code.toUpperCase() > b.code.toUpperCase()) ? 1 : -1;
        });
    },

    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    apiFunction:function() {
        return sideBarService.getCalender;
    },
    searchAPI: function() {
        return sideBarService.getNewCalenderByNameOrPayPeriod;
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
    tablename: () => {
        let templateObject = Template.instance();
        let accCustID = templateObject.data.custid ? templateObject.data.custid : '';
        return 'tblPayCalendars'+ accCustID;
    },
});
