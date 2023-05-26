import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../../js/core-service';
import { UtilityService } from "../../utility-service";
import { ContactService } from "../../contacts/contact-service";
import { ProductService } from "../../product/product-service";
import { SideBarService } from '../../js/sidebar-service';
import 'jquery-editable-select';
import CachedHttp from '../../lib/global/CachedHttp';
import erpObject from '../../lib/global/erp-objects';
import LoadingOverlay from '../../LoadingOverlay';
import TableHandler from '../../js/Table/TableHandler';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import "./timesheet.html";

let utilityService = new UtilityService();
let sideBarService = new SideBarService();
Template.timesheet.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.datatablerecords1 = new ReactiveVar([]);
    templateObject.productsdatatablerecords = new ReactiveVar([]);
    templateObject.employeerecords = new ReactiveVar([]);
    templateObject.jobsrecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedTimesheet = new ReactiveVar([]);
    templateObject.timesheetrecords = new ReactiveVar([]);
    templateObject.selectedTimesheetID = new ReactiveVar();
    templateObject.selectedFile = new ReactiveVar();

    templateObject.includeAllProducts = new ReactiveVar();
    templateObject.includeAllProducts.set(true);

    templateObject.useProductCostaspayRate = new ReactiveVar();
    templateObject.useProductCostaspayRate.set(false);

    templateObject.allnoninvproducts = new ReactiveVar([]);

    templateObject.selectedConvertTimesheet = new ReactiveVar([]);
    templateObject.isAccessLevels = new ReactiveVar();

    templateObject.timesheets = new ReactiveVar([]);
    templateObject.employees = new ReactiveVar([]);
    templateObject.payPeriods = new ReactiveVar([]);

    templateObject.getDataTableList = function (data) {
        templateObject.timeFormat = function(hours) {
            var decimalTime = parseFloat(hours).toFixed(2);
            decimalTime = decimalTime * 60 * 60;
            var hours = Math.floor((decimalTime / (60 * 60)));
            decimalTime = decimalTime - (hours * 60 * 60);
            var minutes = Math.abs(decimalTime / 60);
            decimalTime = decimalTime - (minutes * 60);
            hours = ("0" + hours).slice(-2);
            minutes = ("0" + Math.round(minutes)).slice(-2);
            let time = hours + ":" + minutes;
            return time;
        }
        let sortdate = data.fields.TimeSheetDate != '' ? moment(data.fields.TimeSheetDate).format("YYYY/MM/DD") : data.fields.TimeSheetDate;
        let timesheetdate = data.fields.TimeSheetDate != '' ? moment(data.fields.TimeSheetDate).format("DD/MM/YYYY") : data.fields.TimeSheetDate;
        let hoursFormatted = templateObject.timeFormat(data.fields.Hours) || '';
        let description = '';
        let lineEmpID = '';
        if (data.fields.Logs) {
            if (Array.isArray(data.fields.Logs)) {
                // It is array
                lineEmpID = data.fields.Logs[0].fields.EmployeeID || '';
                description = data.fields.Logs[data.fields.Logs.length - 1].fields.Description || '';
            } else {
                lineEmpID = data.fields.Logs.fields.EmployeeID || '';
                description = data.fields.Logs.fields.Description || '';
            }
        }
        let checkStatus = data.fields.Status || 'Unprocessed';
        let chkBox = '<div class="custom-control custom-switch chkBox pointer text-center"><input name="pointer" class="custom-control-input chkBox notevent pointer" type="checkbox" id="f-' + data.EmpId + '" name="' + data.EmpId + '"><label class="custom-control-label chkBox pointer" for="f--' + data.EmpId +
        '"></label></div>';

        let dataList = [
            chkBox,
            data.fields.ID || '',
            data.fields.EmployeeName || '',
            '<span style="display:none;">' + sortdate + '</span> ' + timesheetdate || '',
            data.fields.Job || '',
            data.fields.ServiceName || '',
            data.fields.Hours || '',
            '<input class="colRegHours highlightInput" type="number" value="' + data.fields.Hours + '"><span class="colRegHours" style="display: none;">' + data.fields.Hours + '</span>' || '',
            '<input class="colRegHoursOne highlightInput" type="text" value="' + hoursFormatted + '" autocomplete="off">' || '',
            '<input class="colOvertime highlightInput" type="number" value="0"><span class="colOvertime" style="display: none;">0</span>' || '',
            '<input class="colDouble highlightInput" type="number" value="0"><span class="colDouble" style="display: none;">0</span>' || '',
            '<input class="colAdditional highlightInput cashamount" type="text" value="' + Currency + '0.00' + '"><span class="colAdditional" style="display: none;">' + Currency + '0.00' + '</span>' || '',
            '<input class="colPaycheckTips highlightInput cashamount" type="text" value="' + Currency + '0.00' + '"><span class="colPaycheckTips" style="display: none;">' + Currency + '0.00' + '</span>' || '',

            data.fields.Notes || '',
            description || '',
            checkStatus || '',
           ];
        return dataList;
    }
    let checkBoxHeader = `<div class="custom-control custom-switch colChkBoxAll pointer" style="width:15px;">
    <input name="pointer" class="custom-control-input colChkBoxAll pointer" type="checkbox" id="colChkBoxAll" value="0">
    <label class="custom-control-label colChkBoxAll" for="colChkBoxAll"></label>
    </div>`;
    let headerStructure = [
        { index: 0, label: checkBoxHeader, class: 'colCheckBox', active: true, display: false, width: "25" },
        { index: 1, label: 'ID', class: 'colID', active: false, display: true, width: "10" },
        { index: 2, label: 'Employee', class: 'colName', active: true, display: true, width: "100" },
        { index: 3, label: 'Date', class: 'colDate', active: true, display: true, width: "80" },
        { index: 4, label: 'Job', class: 'colJob', active: true, display: true, width: "150" },
        { index: 5, label: 'Product', class: 'colRate', active: true, display: true, width: "100" },
        { index: 6, label: 'HiddenHours', class: 'colRegHours hiddenColumn', active: false, display: true, width: "100" },
        { index: 7, label: 'Clocked Hours', class: 'colClockHours', active: true, display: true, width: "70" },
        { index: 8, label: 'Hours', class: 'colRegHoursOne', active: true, display: true, width: "70" },
        { index: 9, label: 'Overtime', class: 'colOvertime', active: true, display: true, width: "70" },
        { index: 10, label: 'Double', class: 'colDouble', active: true, display: true, width: "70" },
        { index: 11, label: 'Additional', class: 'colAdditional', active: true, display: true, width: "80" },
        { index: 12, label: 'Tips', class: 'colPaycheckTips', active: true, display: true, width: "70" },
        { index: 13, label: 'Technical Notes', class: 'colNotes', active: true, display: true, width: "100" },
        { index: 14, label: 'Break', class: 'colDescription', active: true, display: true, width: "100" },
        { index: 15, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" }
    ];

    templateObject.tableheaderrecords.set(headerStructure);
});

Template.timesheet.onRendered(function() {
    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    var today = moment().format('DD/MM/YYYY');
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if ((currentDate.getMonth() + 1) < 10) {
        fromDateMonth = "0" + (currentDate.getMonth() + 1);
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();
    
    $("#date-input,#dateTo,#dtSODate,#dateFrom").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
    });

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    templateObject.resetData = function (dataVal) {
        if(FlowRouter.current().queryParams.converted){
          if(FlowRouter.current().queryParams.converted === true) {
            location.reload();
          }else{
            location.reload();
          }
        }else {
          location.reload();
        }
      }
});

Template.timesheet.events({
    'click .isPaused': function(event) {
        const templateObject = Template.instance();
        let timesheetID = $("#updateID").val() || '';

        let clockList = templateObject.timesheetrecords.get();
        clockList = clockList.filter(clkList => {
            return clkList.id == timesheetID;
        });
        if (clockList.length > 0) {
            let checkPause = clockList[0].isPaused;
            if ($('#btnHoldOne').prop('disabled') && checkPause == "paused") {
                swal({
                    title: 'Continue Timesheet',
                    text: 'This Timesheet is currently "On Hold" do you want to "Continue" it',
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes'
                }).then((result) => {
                    if (result.value) {
                        $("#btnClockOn").trigger("click");
                    }

                });

            } else if ($('#btnHoldOne').prop('disabled') && checkPause == "completed") {
                swal({
                    title: 'New Timesheet',
                    text: 'This Timesheet has been completed, do you want to "Clock On" to start a new Timesheet?',
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes'
                }).then((result) => {
                    if (result.value) {
                        $('#btnClockOn').prop('disabled', false);
                        $('#startTime').prop('disabled', false);
                        $('#endTime').prop('disabled', false);
                        var currentDate = new Date();
                        var begunDate = moment(currentDate).format("DD/MM/YYYY");
                        let fromDateMonth = currentDate.getMonth();
                        let fromDateDay = currentDate.getDate();
                        if ((currentDate.getMonth() + 1) < 10) {
                            fromDateMonth = "0" + (currentDate.getMonth() + 1);
                        }

                        if (currentDate.getDate() < 10) {
                            fromDateDay = "0" + currentDate.getDate();
                        }
                        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();

                        $('#dtSODate').val(fromDate);
                        $('#txtBookedHoursSpent').val("");
                        $('#txtBookedHoursSpent1').val("");
                        $('#updateID').val("");
                        $('#startTime').val("");
                        $('#endTime').val("");
                        $("#btnClockOn").trigger("click");
                    }

                });

            }
        }

    },
    'click isDisabled': function(event) {
        if (localStorage.getItem('CloudAppointmentStartStopAccessLevel') == true) {
            swal({
                title: 'Oooops',
                text: 'You dont have access to put Clock On / Off "On Hold"',
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'OK'
            }).then((results) => {
                if (results.value) {} else if (results.dismiss === 'cancel') {}
            });
        }
    },
    'change #startTime': function() {
        const templateObject = Template.instance();

        var date1Time = new Date($("#dtSODate").datepicker("getDate"));

        let date1 = date1Time.getFullYear() + "/" + (date1Time.getMonth() + 1) + "/" + date1Time.getDate();

        var endtime24Hours = getHour24($("#endTime").val()) || '';
        var starttime24Hours = getHour24($("#startTime").val()) || '';

        var endTime = new Date(date1 + ' ' + endtime24Hours);
        var startTime = new Date(date1 + ' ' + starttime24Hours);

        if (endTime > startTime) {
            let hours = parseFloat(templateObject.diff_hours(endTime, startTime)).toFixed(2);
            document.getElementById('txtBookedHoursSpent').value = templateObject.timeFormat(hours);
        } else {
            document.getElementById('txtBookedHoursSpent').value = '00:00';
        }
    },
    'change #endTime': function() {
        const templateObject = Template.instance();

        var date1Time = new Date($("#dtSODate").datepicker("getDate"));

        let date1 = date1Time.getFullYear() + "/" + (date1Time.getMonth() + 1) + "/" + date1Time.getDate();

        var endtime24Hours = getHour24($("#endTime").val()) || '';
        var starttime24Hours = getHour24($("#startTime").val()) || '';

        var endTime = new Date(date1 + ' ' + endtime24Hours);
        var startTime = new Date(date1 + ' ' + starttime24Hours);

        if (endTime > startTime) {
            let hours = parseFloat(templateObject.diff_hours(endTime, startTime)).toFixed(2);
            document.getElementById('txtBookedHoursSpent').value = templateObject.timeFormat(hours);
        } else {
            document.getElementById('txtBookedHoursSpent').value = '00:00';
        }
    },
    'blur #endTime': function() {
        const templateObject = Template.instance();
        if ($("#endTime").val() != "") {
            setTimeout(function() {
                templateObject.endTimePopUp();
            }, 10);
        }
    },
    'click .clockOff': function(event) {
        const templateObject = Template.instance();
        let timesheetID = $("#updateID").val() || '';

        let clockList = templateObject.timesheetrecords.get();
        clockList = clockList.filter(clkList => {
            return clkList.id == timesheetID;
        });
        if (clockList.length > 0) {
            let checkPause = clockList[0].isPaused;
            if ($('#btnHoldOne').prop('disabled') && checkPause == "completed") {
                swal({
                    title: 'New Timesheet',
                    text: 'This Timesheet has been completed, do you want to "Clock On" to start a new Timesheet?',
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes'
                }).then((result) => {
                    if (result.value) {
                        $('#btnClockOn').prop('disabled', false);
                        $('#startTime').prop('disabled', false);
                        $('#endTime').prop('disabled', false);
                        var currentDate = new Date();
                        var begunDate = moment(currentDate).format("DD/MM/YYYY");
                        let fromDateMonth = currentDate.getMonth();
                        let fromDateDay = currentDate.getDate();
                        if ((currentDate.getMonth() + 1) < 10) {
                            fromDateMonth = "0" + (currentDate.getMonth() + 1);
                        }

                        if (currentDate.getDate() < 10) {
                            fromDateDay = "0" + currentDate.getDate();
                        }
                        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();

                        $('#dtSODate').val(fromDate);
                        $('#txtBookedHoursSpent').val("");
                        $('#txtBookedHoursSpent1').val("");
                        $('#updateID').val("");
                        $('#startTime').val("");
                        $('#endTime').val("");
                        $("#btnClockOn").trigger("click");
                    }

                });

            }
        }

    },
    'click .clockOn': function(event) {
        if ($('#btnClockOn').prop('disabled')) {
            swal({
                title: 'New Timesheet',
                text: 'This Timesheet has been completed, do you want to "Clock On" to start a new Timesheet?',
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes'
            }).then((result) => {
                if (result.value) {
                    $('#btnClockOn').prop('disabled', false);
                    $('#startTime').prop('disabled', false);
                    $('#endTime').prop('disabled', false);
                    var currentDate = new Date();
                    var begunDate = moment(currentDate).format("DD/MM/YYYY");
                    let fromDateMonth = currentDate.getMonth();
                    let fromDateDay = currentDate.getDate();
                    if ((currentDate.getMonth() + 1) < 10) {
                        fromDateMonth = "0" + (currentDate.getMonth() + 1);
                    }

                    if (currentDate.getDate() < 10) {
                        fromDateDay = "0" + currentDate.getDate();
                    }
                    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();

                    $('#dtSODate').val(fromDate);
                    $('#updateID').val("");
                    $('#startTime').val("");
                    $('#endTime').val("");
                    $('#txtBookedHoursSpent').val("");
                    $('#txtBookedHoursSpent1').val("");
                    $("#btnClockOn").trigger("click");
                }

            });

        }
    },
    'click .btnDesktopSearch': function(e) {
        const templateObject = Template.instance();
        let contactService = new ContactService();
        let barcodeData = $('#barcodeScanInput').val();
        let empNo = barcodeData.replace(/^\D+/g, '');
        $('.fullScreenSpin').css('display', 'inline-block');
        if (barcodeData === '') {
            swal('Please enter the employee number', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            e.preventDefault();
            return false;
        } else {

            contactService.getOneEmployeeDataEx(empNo).then(function(data) {
                $('.fullScreenSpin').css('display', 'none');
                if (Object.keys(data).length > 0) {
                    $('#employee_name').val(data.fields.EmployeeName || '');
                    $('#barcodeScanInput').val("");
                    $('#sltJobOne').val("");
                    $('#product-listone').val("");
                    $('#edtProductCost').val(0);
                    $('#updateID').val("");
                    $('#startTime').val("");
                    $('#endTime').val("");
                    $('#txtBookedHoursSpent').val("");
                    $('#txtBookedHoursSpent1').val("");
                    $('#startTime').prop('disabled', false);
                    $('#endTime').prop('disabled', false);
                    $('#btnClockOn').prop('disabled', false);
                    $('#btnHoldOne').prop('disabled', false);
                    $('#btnClockOff').prop('disabled', false);
                    $('.processTimesheet').prop('disabled', false);
                    $('#txtBookedHoursSpent').prop('disabled', false);
                    var curretDate = moment().format('DD/MM/YYYY');
                    let clockList = templateObject.timesheetrecords.get();
                    clockList = clockList.filter(clkList => {
                        return clkList.employee == $('#employee_name').val();
                    });
                    if (clockList.length > 0) {

                        if (clockList[clockList.length - 1].isPaused == "paused") {
                            $('.btnHoldOne').prop('disabled', true);
                        } else {
                            $('.btnHoldOne').prop('disabled', false);
                        }

                        if (clockList[clockList.length - 1].isPaused == "paused") {
                            $(".paused").show();
                            $("#btnHoldOne").prop("disabled", true);
                            $("#btnHoldOne").addClass("mt-32");
                        } else {
                            $(".paused").hide();
                            $("#btnHoldOne").prop("disabled", false);
                            $("#btnHoldOne").removeClass("mt-32");
                        }

                        if (Array.isArray(clockList[clockList.length - 1].timelog) && clockList[clockList.length - 1].isPaused != "completed") {
                            let startTime = clockList[clockList.length - 1].timelog[0].fields.StartDatetime || '';
                            let date = clockList[clockList.length - 1].timesheetdate;
                            if (startTime != "") {
                                $('#startTime').val(clockList[clockList.length - 1].startTime.split(' ')[1] || startTime.split(' ')[1]);
                                $('#dtSODate').val(date);
                                $('#txtBookedHoursSpent').val(clockList[clockList.length - 1].hourFormat);
                                $('#txtBookedHoursSpent1').val(clockList[clockList.length - 1].hours);
                                $('#updateID').val(clockList[clockList.length - 1].id);
                                $('#timesheetID').text(clockList[clockList.length - 1].id);
                                $('#txtNotesOne').val(clockList[clockList.length - 1].notes);
                                $('#sltJobOne').val(clockList[clockList.length - 1].job);
                                $('#product-listone').val(clockList[clockList.length - 1].product);
                                $('#edtProductCost').val(clockList[clockList.length - 1].hourlyrate.replace(/[^0-9.-]+/g, ""));
                                setTimeout(function() {
                                    $('#product-listone').val(clockList[clockList.length - 1].product);
                                }, 2000)
                                $('#hourly_rate').val(clockList[clockList.length - 1].hourlyrate.replace(/[^0-9.-]+/g, ""));
                                if (templateObject.isAccessLevels.get() == false) {
                                    $('#startTime').prop('disabled', true);
                                }
                                if (clockList[clockList.length - 1].isPaused == "completed") {
                                    $('#endTime').val(clockList[clockList.length - 1].endTime.split(' ')[1] || endTime);
                                    if (templateObject.isAccessLevels.get() == false) {
                                        $('#endTime').prop('disabled', true);
                                    }
                                    $('#btnClockOn').prop('disabled', true);
                                    $('#btnHoldOne').prop('disabled', true);
                                    $('#btnClockOff').prop('disabled', true);
                                    $('#txtBookedHoursSpent').prop('disabled', true);
                                }
                            }
                        } else if (clockList[clockList.length - 1].isPaused != "completed") {
                            if (clockList[clockList.length - 1].timelog.fields.EndDatetime == "") {
                                let startTime = clockList[clockList.length - 1].timelog.fields.StartDatetime.split(' ')[1];
                                let date = clockList[clockList.length - 1].timesheetdate;
                                if (startTime != "") {
                                    $('#startTime').val(clockList[clockList.length - 1].startTime.split(' ')[1] || startTime);
                                    $('#dtSODate').val(date);
                                    $('#txtBookedHoursSpent').val(clockList[clockList.length - 1].hourFormat);
                                    $('#txtBookedHoursSpent1').val(clockList[clockList.length - 1].hours);
                                    $('#updateID').val(clockList[clockList.length - 1].id);
                                    $('#timesheetID').text(clockList[clockList.length - 1].id);
                                    $('#txtNotesOne').val(clockList[clockList.length - 1].notes);
                                    $('#sltJobOne').val(clockList[clockList.length - 1].job);
                                    $('#product-listone').val(clockList[clockList.length - 1].product);
                                    $('#edtProductCost').val(clockList[clockList.length - 1].hourlyrate.replace(/[^0-9.-]+/g, ""));
                                    setTimeout(function() {
                                        $('#product-listone').val(clockList[clockList.length - 1].product);
                                    }, 2000)
                                    $('#hourly_rate').val(clockList[clockList.length - 1].hourlyrate.replace(/[^0-9.-]+/g, ""));
                                    if (templateObject.isAccessLevels.get() == false) {
                                        $('#startTime').prop('disabled', true);
                                    }
                                    if (clockList[clockList.length - 1].isPaused == "completed") {
                                        $('#endTime').val(clockList[clockList.length - 1].endTime.split(' ')[1] || endTime);
                                        if (templateObject.isAccessLevels.get() == false) {
                                            $('#endTime').prop('disabled', true);
                                        }
                                        $('#btnClockOn').prop('disabled', true);
                                        $('#btnHoldOne').prop('disabled', true);
                                        $('#btnClockOff').prop('disabled', true);
                                        $('#txtBookedHoursSpent').prop('disabled', true);
                                    }
                                }
                            }
                        }
                    } else {
                        $(".paused").hide();
                        $("#btnHoldOne").prop("disabled", false);
                    }
                    if (data.fields.CustFld8 == "false") {
                        templateObject.getAllSelectedProducts(data.fields.ID);
                    } else {
                        templateObject.getAllProductData();
                    }

                } else {
                    swal('Employee Not Found', '', 'warning');
                }

            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: "Employee Not Found",
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
            });

        }
    },

    'blur .divcolumn': function(event) {
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');

        var datable = $('#tblTimeSheet').DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);

    },
    'change .rngRange': function(event) {
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblTimeSheet th');
        $.each(datable, function(i, v) {

            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');

            }
        });

    },
    'click #check-all': function(event) {
        if ($(event.target).is(':checked')) {
            $(".chkBox").prop("checked", true);
        } else {
            $(".chkBox").prop("checked", false);
        }
    },
    'click .chkBox': function() {
        var listData = $(this).closest('tr').find(".colID").text() || 0;
        const templateObject = Template.instance();
        const selectedTimesheetList = [];
        const selectedTimesheetToConvertList = [];
        const selectedTimesheetCheck = [];
        let ids = [];
        let JsonIn = {};
        let JsonIn1 = {};
        let myStringJSON = '';
        $('.chkBox:checkbox:checked').each(function() {
            var chkIdLine = $(this).closest('tr').find(".colID").text() || 0;
            let obj = {
                TimesheetID: parseInt(chkIdLine)
            }

            selectedTimesheetList.push(obj);
            selectedTimesheetToConvertList.push(parseInt(chkIdLine));
            templateObject.selectedTimesheetID.set(chkIdLine);
            // selectedAppointmentCheck.push(JsonIn1);
            // }
        });
        templateObject.selectedTimesheet.set(selectedTimesheetList);
        JsonIn = {
            Name: "VS1_InvoiceTimesheet",
            Params: {
                TimesheetIDs: selectedTimesheetToConvertList
            }
        };
        templateObject.selectedConvertTimesheet.set(JsonIn);
    },
    'click #btnInvoice': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        const templateObject = Template.instance();
        let selectClient = templateObject.selectedConvertTimesheet.get();
        let selectTimesheetID = templateObject.selectedTimesheetID.get();

        let selectTimeSheet = templateObject.selectedTimesheet.get();
        if (selectTimeSheet.length === 0) {
            swal('Please select Timesheet to generate Invoice for!', '', 'info');
            $('.fullScreenSpin').css('display', 'none');
        } else {
            let contactService = new ContactService();
            var erpGet = erpDb();
            var oPost = new XMLHttpRequest();
            oPost.open("POST", URLRequest + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + 'erpapi/VS1_Cloud_Task/Method', true);
            oPost.setRequestHeader("database", erpGet.ERPDatabase);
            oPost.setRequestHeader("username", erpGet.ERPUsername);
            oPost.setRequestHeader("password", erpGet.ERPPassword);
            oPost.setRequestHeader("Accept", "application/json");
            oPost.setRequestHeader("Accept", "application/html");
            oPost.setRequestHeader("Content-type", "application/json");

            // let objDetailsTimeSheet = {
            //     Name: "VS1_InvoiceTimesheet",
            //     Params: {
            //       selectClient
            //   }
            // };
            let objDataSave = '"JsonIn"' + ':' + JSON.stringify(selectClient);
            oPost.send(objDataSave);

            oPost.onreadystatechange = function() {
                if (oPost.readyState == 4 && oPost.status == 200) {
                    $('.fullScreenSpin').css('display', 'none');
                    var myArrResponse = JSON.parse(oPost.responseText);
                    // if (myArrResponse.ProcessLog.ResponseStatus.includes("OK")) {
                    let objectDataConverted = {
                        type: "TTimeSheet",
                        fields: {
                            Id: parseInt(selectTimesheetID),
                            Status: "Converted"
                        }
                    };
                    contactService.saveTimeSheetUpdate(objectDataConverted).then(function(data) {
                        FlowRouter.go('/invoicelist?success=true');
                    }).catch(function(err) {
                        $('.fullScreenSpin').css('display', 'none');
                    });

                    //templateObject.getAllAppointmentDataOnConvert();



                    // } else {
                    // swal({
                    //     title: 'Oooops...',
                    //     text: myArrResponse.ProcessLog.ResponseStatus,
                    //     type: 'warning',
                    //     showCancelButton: false,
                    //     confirmButtonText: 'Try Again'
                    // }).then((result) => {
                    //     if (result.value) {
                    //
                    //     } else if (result.dismiss === 'cancel') {
                    //
                    //     }
                    // });
                    // }

                } else if (oPost.readyState == 4 && oPost.status == 403) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: oPost.getResponseHeader('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {} else if (result.dismiss === 'cancel') {

                        }
                    });
                } else if (oPost.readyState == 4 && oPost.status == 406) {
                    $('.fullScreenSpin').css('display', 'none');
                    var ErrorResponse = oPost.getResponseHeader('errormessage');
                    var segError = ErrorResponse.split(':');

                    if ((segError[1]) == ' "Unable to lock object') {

                        swal({
                            title: 'Oooops...',
                            text: oPost.getResponseHeader('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {} else if (result.dismiss === 'cancel') {

                            }
                        });
                    } else {
                        swal({
                            title: 'Oooops...',
                            text: oPost.getResponseHeader('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {} else if (result.dismiss === 'cancel') {

                            }
                        });
                    }

                } else if (oPost.readyState == '') {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: oPost.getResponseHeader('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {} else if (result.dismiss === 'cancel') {

                        }
                    });
                }

            }

        }

    },
    'click #btnInvoiceDisabled': function() {
        swal({
            title: 'Oops...',
            text: "You don't have access to create Invoice",
            type: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK'
        }).then((result) => {
            if (result.value) {} else if (result.dismiss === 'cancel') {}
        });
    },
    'click .btnOpenSettings': function(event) {
        let templateObject = Template.instance();
        var columns = $('#tblTimeSheet th');

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
                sIndex: v.cellIndex || '',
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    // 'click .exportbtn': function () {
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     jQuery('#tblTimeSheet_wrapper .dt-buttons .btntabletocsv').click();
    //     $('.fullScreenSpin').css('display', 'none');
    // },
    // 'click .exportbtnExcel': function () {
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     jQuery('#tblTimeSheet_wrapper .dt-buttons .btntabletoexcel').click();
    //     $('.fullScreenSpin').css('display', 'none');
    // },
    'click .btnRefreshOne': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        sideBarService.getAllTimeSheetList().then(function(data) {
            addVS1Data('TTimeSheet', JSON.stringify(data));
            setTimeout(function() {
                window.open('/timesheet', '_self');
            }, 500);
        }).catch(function(err) {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                    // Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {}
            });
        });
    },
    'click #btnClockOnOff': async function(event) {
        const templateObject = Template.instance();
        let checkIncludeAllProducts = templateObject.includeAllProducts.get();
        $("#employee_name").val(localStorage.getItem('mySessionEmployee'));
        let getEmployeeID = localStorage.getItem('mySessionEmployeeLoggedID') || '';
        $('#sltJobOne').val("");
        $('#product-listone').val("");
        $('#edtProductCost').val(0);
        $('#updateID').val("");
        $('#startTime').val("");
        $('#endTime').val("");
        $('#txtBookedHoursSpent').val("");
        $('#txtBookedHoursSpent1').val("");
        $('#startTime').prop('disabled', false);
        $('#endTime').prop('disabled', false);
        $('#btnClockOn').prop('disabled', false);
        $('#btnHoldOne').prop('disabled', false);
        $('#btnClockOff').prop('disabled', false);
        $('.processTimesheet').prop('disabled', false);
        $('#txtBookedHoursSpent').prop('disabled', false);
        var curretDate = moment().format('DD/MM/YYYY');
        if (checkIncludeAllProducts == true) {
            templateObject.getAllProductData();
        } else {
            if (getEmployeeID != '') {
                templateObject.getAllSelectedProducts(getEmployeeID);
            } else {
                templateObject.getAllProductData();
            }

        }

        let clockList = templateObject.timesheetrecords.get();
        clockList = clockList.filter(clkList => {
            return clkList.employee == $('#employee_name').val();
        });

        if (clockList.length > 0) {

            if (clockList[clockList.length - 1].isPaused == "paused") {
                $('.btnHoldOne').prop('disabled', true);
            } else {
                $('.btnHoldOne').prop('disabled', false);
            }

            if (clockList[clockList.length - 1].isPaused == "paused") {
                $(".paused").show();
                $("#btnHoldOne").prop("disabled", true);
                $("#btnHoldOne").addClass("mt-32");
            } else {
                $(".paused").hide();
                $("#btnHoldOne").prop("disabled", false);
                $("#btnHoldOne").removeClass("mt-32");
            }

            if (Array.isArray(clockList[clockList.length - 1].timelog) && clockList[clockList.length - 1].isPaused != "completed") {
                let startTime = clockList[clockList.length - 1].timelog[0].fields.StartDatetime || '';
                let date = clockList[clockList.length - 1].timesheetdate;
                if (startTime != "") {
                    $('#startTime').val(clockList[clockList.length - 1].startTime.split(' ')[1] || startTime.split(' ')[1]);
                    $('#dtSODate').val(date);
                    $('#txtBookedHoursSpent').val(clockList[clockList.length - 1].hourFormat);
                    $('#txtBookedHoursSpent1').val(clockList[clockList.length - 1].hours);
                    $('#updateID').val(clockList[clockList.length - 1].id);
                    $('#timesheetID').text(clockList[clockList.length - 1].id);
                    $('#txtNotesOne').val(clockList[clockList.length - 1].notes);
                    $('#sltJobOne').val(clockList[clockList.length - 1].job);
                    $('#product-listone').val(clockList[clockList.length - 1].product);
                    $('#edtProductCost').val(clockList[clockList.length - 1].hourlyrate.replace(/[^0-9.-]+/g, ""));
                    setTimeout(function() {
                        $('#product-listone').val(clockList[clockList.length - 1].product);
                    }, 1000);
                    $('#hourly_rate').val(clockList[clockList.length - 1].hourlyrate.replace(/[^0-9.-]+/g, ""));
                    if (templateObject.isAccessLevels.get() == false) {
                        $('#startTime').prop('disabled', true);
                    }
                    if (clockList[clockList.length - 1].isPaused == "completed") {
                        $('#endTime').val(clockList[clockList.length - 1].endTime.split(' ')[1] || endTime);
                        if (templateObject.isAccessLevels.get() == false) {
                            $('#endTime').prop('disabled', true);
                        }
                        $('#btnClockOn').prop('disabled', true);
                        $('#btnHoldOne').prop('disabled', true);
                        $('#btnClockOff').prop('disabled', true);
                        $('#txtBookedHoursSpent').prop('disabled', true);
                    }
                }
            } else if (clockList[clockList.length - 1].isPaused != "completed") {
                if (clockList[clockList.length - 1].timelog.fields.EndDatetime == "") {
                    let startTime = clockList[clockList.length - 1].timelog.fields.StartDatetime.split(' ')[1];
                    let date = clockList[clockList.length - 1].timesheetdate;
                    if (startTime != "") {
                        $('#startTime').val(clockList[clockList.length - 1].startTime.split(' ')[1] || startTime);
                        $('#dtSODate').val(date);
                        $('#txtBookedHoursSpent').val(clockList[clockList.length - 1].hourFormat);
                        $('#txtBookedHoursSpent1').val(clockList[clockList.length - 1].hours);
                        $('#updateID').val(clockList[clockList.length - 1].id);
                        $('#timesheetID').text(clockList[clockList.length - 1].id);
                        $('#txtNotesOne').val(clockList[clockList.length - 1].notes);
                        $('#sltJobOne').val(clockList[clockList.length - 1].job);
                        $('#product-listone').val(clockList[clockList.length - 1].product);
                        $('#edtProductCost').val(clockList[clockList.length - 1].hourlyrate.replace(/[^0-9.-]+/g, ""));
                        setTimeout(function() {
                            $('#product-listone').val(clockList[clockList.length - 1].product);
                        }, 1000);
                        $('#hourly_rate').val(clockList[clockList.length - 1].hourlyrate.replace(/[^0-9.-]+/g, ""));
                        if (templateObject.isAccessLevels.get() == false) {
                            $('#startTime').prop('disabled', true);
                        }
                        if (clockList[clockList.length - 1].isPaused == "completed") {
                            $('#endTime').val(clockList[clockList.length - 1].endTime.split(' ')[1] || endTime);
                            if (templateObject.isAccessLevels.get() == false) {
                                $('#endTime').prop('disabled', true);
                            }
                            $('#btnClockOn').prop('disabled', true);
                            $('#btnHoldOne').prop('disabled', true);
                            $('#btnClockOff').prop('disabled', true);
                            $('#txtBookedHoursSpent').prop('disabled', true);
                        }
                    }
                }
            }
        } else {
            $(".paused").hide();
            $("#btnHoldOne").prop("disabled", false);
        }
        $('#settingsModal').modal('show');
    },
    'click #btnClockOn': function() {
        const templateObject = Template.instance();
        let clockList = templateObject.timesheetrecords.get();
        var product = $('#product-listone').val() || '';
        clockList = clockList.filter(clkList => {
            return clkList.employee == $('#employee_name').val() && clkList.id == $('#updateID').val();
        });
        let contactService = new ContactService();
        let updateID = $("#updateID").val() || "";
        let checkStatus = "";
        let checkStartTime = "";
        let checkEndTime = "";
        let latestTimeLogId = "";
        let toUpdate = {};
        let newEntry = {};
        let date = new Date();
        let initialDate = new Date($("#dtSODate").datepicker("getDate"));
        //new Date(moment($('dtSODate').val()).format("YYYY-MM-DD"));
        if (clockList.length > 0) {

            if (Array.isArray(clockList[clockList.length - 1].timelog)) {
                checkStatus = clockList[clockList.length - 1].isPaused || "";
                latestTimeLogId = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.ID || "";
                checkStartTime = clockList[clockList.length - 1].timelog[0].fields.StartDatetime || "";
                checkEndTime = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.EndDatetime || "";
            } else {
                checkStatus = clockList[clockList.length - 1].isPaused || "";
                latestTimeLogId = clockList[clockList.length - 1].timelog.fields.ID || "";
                checkStartTime = clockList[clockList.length - 1].timelog.fields.StartDatetime || "";
                checkEndTime = clockList[clockList.length - 1].timelog.fields.EndDatetime || "";
            }
        }
        // if (checkStatus == "paused") {
        //     return false;
        // }
        if (checkStatus == "completed") {
            $("#updateID").val("");
            $("#startTime").val(moment().startOf('hour').format('HH') + ":" + moment().startOf('minute').format('mm'));
            let startDate = initialDate.getFullYear() + "-" + ("0" + (initialDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (initialDate.getDate())).slice(-2);
            let endDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + (date.getDate())).slice(-2);
            var endTime = new Date(endDate + ' ' + document.getElementById("endTime").value);
            var startTime = new Date(startDate + ' ' + document.getElementById("startTime").value);
            if (endTime > startTime) {
                let hours = parseFloat(templateObject.diff_hours(endTime, startTime)).toFixed(2);
                document.getElementById('txtBookedHoursSpent').value = templateObject.timeFormat(hours);

            } else if (document.getElementById("endTime").value == "") {
                endTime = "";
            }
            $("#btnSaveTimeSheetOne").trigger("click");
        } else {
            $('.fullScreenSpin').css('display', 'inline-block');
            if (checkStartTime != "" && checkEndTime == "" && $('#btnHoldOne').prop('disabled') == true) {
                let startDate = initialDate.getFullYear() + "-" + ("0" + (initialDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (initialDate.getDate())).slice(-2);
                let endDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + (date.getDate())).slice(-2);
                let endTime = $('#endTime').val() || ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2);
                let startTime = ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2);
                toUpdate = {
                    type: "TTimeLog",
                    fields: {
                        ID: latestTimeLogId,
                        EndDatetime: endDate + ' ' + endTime
                    }
                }

                newEntry = {
                    type: "TTimeLog",
                    fields: {
                        TimeSheetID: updateID,
                        StartDatetime: endDate + ' ' + startTime,
                        Product: product,
                        Description: "Job Continued"
                    }
                }

                let updateTimeSheet = {
                    type: "TTimeSheet",
                    fields: {
                        ID: updateID,
                        InvoiceNotes: "Clocked On"
                    }
                }

                contactService.saveTimeSheetLog(newEntry).then(function(savedData) {
                    contactService.saveTimeSheetLog(toUpdate).then(function(savedData1) {
                        contactService.saveClockTimeSheet(updateTimeSheet).then(function(savedTimesheetData) {
                            sideBarService.getAllTimeSheetList().then(function(data) {
                                addVS1Data('TTimeSheet', JSON.stringify(data));
                                setTimeout(function() {
                                    window.open('/timesheet', '_self');
                                }, 500);
                            })
                        }).catch(function(err) {
                            swal({
                                title: 'Oooops...',
                                text: err,
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {
                                    // Meteor._reload.reload();
                                } else if (result.dismiss === 'cancel') {}
                            });
                            $('.fullScreenSpin').css('display', 'none');
                        }).catch(function(err) {});
                        // contactService.saveClockonClockOff(toUpdate).then(function (data) {

                        // })
                    }).catch(function(err) {
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                // Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {}
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }).catch(function(err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            // Meteor._reload.reload();
                        } else if (result.dismiss === 'cancel') {}
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (clockList.length < 1) {
                $("#startTime").val(moment().startOf('hour').format('HH') + ":" + moment().startOf('minute').format('mm'));
                $("#btnSaveTimeSheetOne").trigger("click");
            } else {
                $('.fullScreenSpin').css('display', 'none');
                return false;
                // $("#startTime").val(moment().startOf('hour').format('HH') + ":" + moment().startOf('minute').format('mm'));
                // let date1 = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + (date.getDate())).slice(-2);
                // var endTime = new Date(date1 + ' ' + document.getElementById("endTime").value);
                // var startTime = new Date(date1 + ' ' + document.getElementById("startTime").value);
                // if (endTime > startTime) {
                //     document.getElementById('txtBookedHoursSpent').value = parseFloat(templateObject.diff_hours(endTime, startTime)).toFixed(2);
                // } else if (document.getElementById("endTime").value == "") {
                //     endTime = "";
                // }
                // $("#btnSaveTimeSheetOne").trigger("click");

            }
        }
    },
    'click #btnClockOff': function() {
        let templateObject = Template.instance();
        let clockList = templateObject.timesheetrecords.get();
        let clockListStandBy = templateObject.timesheetrecords.get();
        let index = clockList.map(function(e) {
            return e.id;
        }).indexOf(parseInt($("#updateID").val()));
        clockList = clockList.filter(clkList => {
            return clkList.employee == $('#employee_name').val() && clkList.id == $('#updateID').val();
        });
        let contactService = new ContactService();
        let updateID = $("#updateID").val() || "";
        let startTime = $("#startTime").val() || "";
        let checkStatus = "";
        let checkStartTime = "";
        let checkEndTime = "";
        let latestTimeLogId = "";
        var product = $('#product-listone').val() || '';
        let toUpdate = {};
        let date = new Date();
        let initialDate = new Date($("#dtSODate").datepicker("getDate"));
        // new Date(moment($("#dtSODate").datepicker("getDate")).format("YYYY-MM-DD"));
        if (clockList.length > 0) {
            let getstartDatedata = clockList[clockList.length - 1].startTime.split(' ')[0] || '';
            let dateInnitialDate = new Date(getstartDatedata);
            initialDate = new Date(getstartDatedata) || initialDate;
            if (Array.isArray(clockList[clockList.length - 1].timelog)) {
                checkStatus = clockList[clockList.length - 1].isPaused || "";
                latestTimeLogId = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.ID || "";
                checkStartTime = clockList[clockList.length - 1].timelog[0].fields.StartDatetime || "";
                checkEndTime = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.EndDatetime || "";
            } else {
                checkStatus = clockList[clockList.length - 1].isPaused || "";
                latestTimeLogId = clockList[clockList.length - 1].timelog.fields.ID || "";
                checkStartTime = clockList[clockList.length - 1].timelog.fields.StartDatetime || "";
                checkEndTime = clockList[clockList.length - 1].timelog.fields.EndDatetime || "";
            }
        }
        if (startTime == "") {
            swal({
                title: 'Oooops...',
                text: "Please Clock In before you can Clock Off",
                type: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                    // Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {}
            });
            $('.fullScreenSpin').css('display', 'none');
        } else if (checkStatus == "paused") {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'End Timesheet',
                text: 'This Timesheet is Currently "On Hold", Do you want to "Clock Off"? ',
                type: 'question',
                showCancelButton: true,
                denyButtonText: 'Continue',
                confirmButtonText: 'Yes'
            }).then((result) => {
                if (result.value) {
                    $('.fullScreenSpin').css('display', 'inline-block');
                    document.getElementById("endTime").value = moment().startOf('hour').format('HH') + ":" + moment().startOf('minute').format('mm');
                    let startDate = initialDate.getFullYear() + "-" + ("0" + (initialDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (initialDate.getDate())).slice(-2);
                    let endDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + (date.getDate())).slice(-2);

                    let startTime = ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2);
                    let endTime = $('endTime').val();
                    toUpdate = {
                        type: "TTimeLog",
                        fields: {
                            ID: latestTimeLogId,
                            EndDatetime: endDate + ' ' + endTime
                        }
                    }

                    let newEntry = {
                        type: "TTimeLog",
                        fields: {
                            TimeSheetID: updateID,
                            StartDatetime: endDate + ' ' + startTime,
                            Product: product,
                            Description: "Job Continued"
                        }
                    }

                    let updateTimeSheet = {
                        type: "TTimeSheet",
                        fields: {
                            ID: updateID,
                            InvoiceNotes: "Clocked On"
                        }
                    }

                    contactService.saveTimeSheetLog(newEntry).then(function(savedData) {
                        contactService.saveTimeSheetLog(toUpdate).then(function(savedData1) {
                            contactService.saveClockTimeSheet(updateTimeSheet).then(function(savedTimesheetData) {
                                clockListStandBy[index].isPaused = "";
                                templateObject.timesheetrecords.set(clockListStandBy);
                                $('.paused').hide();
                                $("#btnHoldOne").removeClass("mt-32");
                                //document.getElementById("endTime").value = moment().startOf('hour').format('HH') + ":" + moment().startOf('minute').format('mm');
                                var endTime = new Date(endDate + ' ' + document.getElementById("endTime").value);
                                var startTime = new Date(startDate + ' ' + document.getElementById("startTime").value);
                                if (endTime > startTime) {
                                    let hours = parseFloat(templateObject.diff_hours(endTime, startTime)).toFixed(2);
                                    document.getElementById('txtBookedHoursSpent').value = templateObject.timeFormat(hours);
                                    $("#btnSaveTimeSheetOne").trigger("click");
                                } else {
                                    swal({
                                        title: 'Oooops...',
                                        text: "Start Time can't be greater than End Time",
                                        type: 'error',
                                        showCancelButton: true,
                                        confirmButtonText: 'Ok'
                                    })
                                }
                            }).catch(function(err) {
                                swal({
                                    title: 'Oooops...',
                                    text: err,
                                    type: 'error',
                                    showCancelButton: false,
                                    confirmButtonText: 'Try Again'
                                }).then((result) => {
                                    if (result.value) {
                                        // Meteor._reload.reload();
                                    } else if (result.dismiss === 'cancel') {}
                                });
                                $('.fullScreenSpin').css('display', 'none');
                            }).catch(function(err) {});
                            // contactService.saveClockonClockOff(toUpdate).then(function (data) {

                            // })
                        }).catch(function(err) {
                            swal({
                                title: 'Oooops...',
                                text: err,
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {
                                    // Meteor._reload.reload();
                                } else if (result.dismiss === 'cancel') {}
                            });
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    }).catch(function(err) {
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                // Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {}
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });

                    //$("#btnClockOn").trigger("click");
                }

            });
        } else {
            swal({
                title: 'End Timesheet',
                text: "Are you sure you want to Clock Off",
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes'
            }).then((result) => {
                if (result.value) {
                    document.getElementById("endTime").value = moment().startOf('hour').format('HH') + ":" + moment().startOf('minute').format('mm');
                    let startDate = initialDate.getFullYear() + "-" + ("0" + (initialDate.getMonth() + 1)).slice(-2) + "-" + ("0" + (initialDate.getDate())).slice(-2);
                    let endDate = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + (date.getDate())).slice(-2);

                    let startDateFormat = initialDate.getFullYear() + "/" + ("0" + (initialDate.getMonth() + 1)).slice(-2) + "/" + ("0" + (initialDate.getDate())).slice(-2);
                    let endDateFormat = date.getFullYear() + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + ("0" + (date.getDate())).slice(-2);

                    var startTime = new Date(startDateFormat + ' ' + document.getElementById("startTime").value);
                    var endTime = new Date(endDateFormat + ' ' + document.getElementById("endTime").value);

                    if (endTime > startTime) {
                        let hours = parseFloat(templateObject.diff_hours(endTime, startTime)).toFixed(2);
                        document.getElementById('txtBookedHoursSpent').value = templateObject.timeFormat(hours);
                        $("#btnSaveTimeSheetOne").trigger("click");
                    } else {
                        swal({
                            title: 'Oooops...',
                            text: "Start Time can't be greater than End Time",
                            type: 'error',
                            showCancelButton: true,
                            confirmButtonText: 'Ok'
                        })
                    }
                }

            });

        }
    },
    'click #btnHoldOne': function(event) {
        $('#frmOnHoldModal').modal('show');
    },
    'click .btnSaveTimeSheetForm': function() {
        playSaveAudio();
        let templateObject = Template.instance();
        let contactService = new ContactService();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            let timesheetID = $('#edtTimesheetID').val();
            var employeeName = $('#sltEmployee').val();
            var jobName = $('#sltJob').val();
            // var edthourlyRate = $('.lineEditHourlyRate').val() || 0;
            var edthour = $('.lineEditHour').val() || 0;
            var techNotes = $('.lineEditTechNotes').val() || '';
            var product = $('#product-list').children("option:selected").text() || '';
            // var taxcode = $('#sltTaxCode').val();
            // var accountdesc = $('#txaAccountDescription').val();
            // var bankaccountname = $('#edtBankAccountName').val();
            // var bankbsb = $('#edtBSB').val();
            // var bankacountno = $('#edtBankAccountNo').val();
            // let isBankAccount = templateObject.isBankAccount.get();
            let data = '';
            if (timesheetID == "") {
                data = {
                    type: "TTimeSheetEntry",
                    fields: {
                        // "EntryDate":"2020-10-12 12:39:14",
                        TimeSheet: [{
                            type: "TTimeSheet",
                            fields: {
                                EmployeeName: employeeName || '',
                                // HourlyRate:50,
                                ServiceName: product,
                                Allowedit: true,
                                // ChargeRate: 100,
                                Hours: parseInt(edthour) || 0,
                                // OverheadRate: 90,
                                Job: jobName || '',
                                // ServiceName: "Test"|| '',
                                TimeSheetClassName: "Default" || '',
                                Notes: techNotes || ''
                                    // EntryDate: accountdesc|| ''
                            }
                        }],
                        "TypeName": "Payroll",
                        "WhoEntered": localStorage.getItem('mySessionEmployee') || ""
                    }
                };

                contactService.saveTimeSheet(data).then(function(data) {
                    sideBarService.getAllTimeSheetList().then(function(data) {
                        addVS1Data('TTimeSheet', JSON.stringify(data));
                        setTimeout(function() {
                            window.open('/timesheet', '_self');
                        }, 500);
                    });
                }).catch(function(err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            // Meteor._reload.reload();
                        } else if (result.dismiss === 'cancel') {}
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });

            } else {
                data = {
                    type: "TTimeSheet",
                    //fields:{
                    // "EntryDate":"2020-10-12 12:39:14",
                    // TimeSheet:[{
                    // type: "TTimeSheet",
                    fields: {
                        ID: timesheetID,
                        EmployeeName: employeeName || '',
                        // HourlyRate:50,
                        ServiceName: product,
                        Allowedit: true,
                        // ChargeRate: 100,
                        Hours: parseInt(edthour) || 0,
                        // OverheadRate: 90,
                        Job: jobName || '',
                        // ServiceName: "Test"|| '',
                        TimeSheetClassName: "Default" || '',
                        Notes: techNotes || ''
                            // EntryDate: accountdesc|| ''
                    }
                    //  }],
                    // "TypeName":"Payroll",
                    // "WhoEntered":localStorage.getItem('mySessionEmployee')||""
                    //}
                };

                contactService.saveTimeSheetUpdate(data).then(function(data) {
                    window.open('/timesheet', '_self');
                }).catch(function(err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            // Meteor._reload.reload();
                        } else if (result.dismiss === 'cancel') {}
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });

            }
        }, delayTimeAfterSound);
    },
    'click #btnSaveTimeSheetOne': async function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();
        let checkStatus = "";
        let checkStartTime = "";
        let checkEndTime = "";
        let TimeSheetHours = 0;
        let updateID = $("#updateID").val() || "";
        let contactService = new ContactService();


    var currentBeginDate = new Date();
    var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentBeginDate.getMonth() + 1);
    let fromDateDay = currentBeginDate.getDate();
    if ((currentBeginDate.getMonth() + 1) < 10) {
        fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
    } else {
        fromDateMonth = (currentBeginDate.getMonth() + 1);
    }

    if (currentBeginDate.getDate() < 10) {
        fromDateDay = "0" + currentBeginDate.getDate();
    }

    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();

    let prevMonthToDate = (moment().subtract(reportsloadMonths, 'months')).format("DD/MM/YYYY");



        var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");


        /* Filter to check Date Set */

        let clockList = templateObject.timesheetrecords.get();

        let getEmpIDFromLine = $('.employee_name').val() || '';
        if (getEmpIDFromLine != '') {
            let checkEmpTimeSettings = await contactService.getCheckTimeEmployeeSettingByName(getEmpIDFromLine) || '';
            if (checkEmpTimeSettings != '') {
                if (checkEmpTimeSettings.temployee[0].CustFld8 == 'false') {
                    var productcost = parseFloat($('#edtProductCost').val()) || 0;
                } else {
                    var productcost = 0;
                }
            }
        } else {
            var productcost = 0;
        }
        clockList = clockList.filter(clkList => {
            return clkList.employee == $('#employee_name').val() && clkList.id == $('#updateID').val();
        });

        if (clockList.length > 0) {
            if (Array.isArray(clockList[clockList.length - 1].timelog)) {
                checkStatus = clockList[clockList.length - 1].isPaused || "";
                TimeSheetHours: clockList[clockList.length - 1].hours || "";
                latestTimeLogId = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.ID || "";
                checkStartTime = clockList[clockList.length - 1].timelog[0].fields.StartDatetime || "";
                checkEndTime = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.EndDatetime || "";
            } else {
                checkStatus = clockList[clockList.length - 1].isPaused || "";
                TimeSheetHours: clockList[clockList.length - 1].hours || "";
                latestTimeLogId = clockList[clockList.length - 1].timelog.fields.ID || "";
                checkStartTime = clockList[clockList.length - 1].timelog.fields.StartDatetime || "";
                checkEndTime = clockList[clockList.length - 1].timelog.fields.EndDatetime || "";
            }
        }

        var employeeName = $('.employee_name').val();
        var startdateGet = new Date($("#dtSODate").datepicker("getDate"));
        var endDateGet = new Date();
        let date = startdateGet.getFullYear() + "-" + ("0" + (startdateGet.getMonth() + 1)).slice(-2) + "-" + ("0" + startdateGet.getDate()).slice(-2);
        let endDate = endDateGet.getFullYear() + "-" + ("0" + (endDateGet.getMonth() + 1)).slice(-2) + "-" + ("0" + endDateGet.getDate()).slice(-2);
        var startTime = $('#startTime').val() || '';
        var endTime = $('#endTime').val() || '';
        var edthour = $('#txtBookedHoursSpent').val() || '00:01';
        let hours = templateObject.timeToDecimal(edthour);
        var techNotes = $('#txtNotesOne').val() || '';
        var product = $('#product-listone').val() || '';
        var productcost = parseFloat($('#edtProductCost').val()) || 0;
        var jobName = $('#sltJobOne').val() || '';
        let isPaused = checkStatus;
        let toUpdate = {};
        let obj = {};
        let data = '';

        if (startTime != "") {
            startTime = date + ' ' + startTime;
        }

        if (endTime != "") {
            endTime = endDate + ' ' + endTime;
        }

        if (hours != 0) {
            edthour = hours + parseFloat($('#txtBookedHoursSpent1').val());
        }

        if (hours != 0) {
            obj = {
                type: "TTimeLog",
                fields: {
                    TimeSheetID: updateID,
                    EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
                    StartDatetime: checkStartTime,
                    EndDatetime: endTime,
                    Product: product,
                    Description: 'Timesheet Completed',
                    EnteredBy: localStorage.getItem('mySessionEmployeeLoggedID')
                }
            };
            isPaused = "completed";
        }

        // if (checkStartTime == "" && endTime != "") {
        //     $('.fullScreenSpin').css('display', 'none');
        //     swal({
        //         title: 'Oooops...',
        //         text: "You can't clock off, because you haven't clocked in",
        //         type: 'warning',
        //         showCancelButton: false,
        //         confirmButtonText: 'Try Again'
        //     }).then((result) => {
        //         if (result.value) {
        //             // Meteor._reload.reload();
        //         } else if (result.dismiss === 'cancel') {}
        //     });
        //     return false;
        // }

        if (checkStartTime == "" && startTime == "") {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: "You can't save this entry with no start time",
                type: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                    // Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {}
            });
            return false;
        }

        if (updateID != "") {
            result = clockList.filter(Timesheet => {
                return Timesheet.id == updateID
            });

            if (result.length > 0) {
                if (result[0].timelog == null) {
                    obj = {
                        type: "TTimeLog",
                        fields: {
                            TimeSheetID: updateID,
                            EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
                            StartDatetime: startTime,
                            EndDatetime: endTime,
                            Product: product,
                            Description: 'Timesheet Started',
                            EnteredBy: localStorage.getItem('mySessionEmployeeLoggedID')
                        }
                    };
                } else if ($('#startTime').val() != "" && $('#endTime').val() != "" && checkStatus != "completed") {
                    let startTime1 = startdateGet.getFullYear() + "-" + ("0" + (startdateGet.getMonth() + 1)).slice(-2) + "-" + ("0" + (startdateGet.getDate())).slice(-2) + ' ' + ("0" + startdateGet.getHours()).slice(-2) + ":" + ("0" + startdateGet.getMinutes()).slice(-2);
                    obj = {
                        type: "TTimeLog",
                        fields: {
                            TimeSheetID: updateID,
                            EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
                            StartDatetime: checkStartTime,
                            EndDatetime: endTime,
                            Product: product,
                            Description: 'Timesheet Completed',
                            EnteredBy: localStorage.getItem('mySessionEmployeeLoggedID')
                        }
                    };
                    isPaused = "completed";
                } else if (checkEndTime != "") {
                    aEndDate = moment().format("YYYY-MM-DD") + ' ' + endTime;
                }
            } else {
                obj = {
                    type: "TTimeLog",
                    fields: {
                        TimeSheetID: updateID,
                        EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
                        StartDatetime: startTime,
                        EndDatetime: endTime,
                        Product: product,
                        Description: 'Timesheet Started',
                        EnteredBy: localStorage.getItem('mySessionEmployeeLoggedID')
                    }
                };
            }
        }
        if (updateID == "") {
            if ($('#startTime').val() != "" && $('#endTime').val() != "") {
                obj = {
                    type: "TTimeLog",
                    fields: {
                        EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
                        StartDatetime: startTime,
                        EndDatetime: endTime,
                        Product: product,
                        Description: 'Timesheet Started & Completed',
                        EnteredBy: localStorage.getItem('mySessionEmployeeLoggedID')
                    }
                };
                isPaused = "completed";
            } else if ($('#startTime').val() != "" && $('#endTime').val() == "") {
                obj = {
                    type: "TTimeLog",
                    fields: {
                        EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
                        StartDatetime: startTime,
                        EndDatetime: endTime,
                        Product: product,
                        Description: 'Timesheet Started',
                        EnteredBy: localStorage.getItem('mySessionEmployeeLoggedID')
                    }
                };
                isPaused = "";
            }

            data = {
                type: "TTimeSheetEntry",
                fields: {
                    // "EntryDate":"2020-10-12 12:39:14",
                    TimeSheet: [{
                        type: "TTimeSheet",
                        fields: {
                            EmployeeName: employeeName || '',
                            ServiceName: product || '',
                            HourlyRate: productcost || 0,
                            LabourCost: 1,
                            Allowedit: true,
                            Logs: obj,
                            TimeSheetDate: date,
                            StartTime: startTime,
                            EndTime: endTime,
                            Hours: hours || 0.016666666666666666,
                            // OverheadRate: 90,
                            Job: jobName || '',
                            // ServiceName: "Test"|| '',
                            TimeSheetClassName: "Default" || '',
                            Notes: techNotes || '',
                            InvoiceNotes: "Clocked On" || ""
                                // EntryDate: accountdesc|| ''
                        }
                    }],
                    "TypeName": "Payroll",
                    "WhoEntered": localStorage.getItem('mySessionEmployee') || ""
                }
            };
            contactService.saveTimeSheet(data).then(function(dataReturnRes) {
                sideBarService.getAllTimeSheetList().then(function(data) {
                    addVS1Data('TTimeSheet', JSON.stringify(data));
                    Bert.alert($('#employee_name').val() + ' you are now Clocked On', 'now-success');
                    $('#employeeStatusField').removeClass('statusOnHold');
                    $('#employeeStatusField').removeClass('statusClockedOff');
                    $('#employeeStatusField').addClass('statusClockedOn').text('Clocked On');
                    if (templateObject.isAccessLevels.get() == false) {
                        $('#startTime').prop('disabled', true);
                    }
                    templateObject.datatablerecords.set([]);
                    templateObject.datatablerecords1.set([]);

                    //Newly added

                    //templateObject.getAllTimeSheetData();
                    templateObject.getAllTimeSheetDataClock();

                    if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {
                        templateObject.getAllFilterTimeSheetData('', '', true);
                    } else {
                        templateObject.getAllFilterTimeSheetData(prevMonth11Date, toDate, false);
                    }
                    $('#settingsModal').modal('hide');
                    // setTimeout(function(){
                    // let getTimesheetRecords = templateObject.timesheetrecords.get();
                    //  let getLatestTimesheet = getTimesheetRecords.filter(clkList => {
                    //     return clkList.employee == employeeName;
                    // });
                    //  $('#updateID').val(getLatestTimesheet[getLatestTimesheet.length - 1].id || '');
                    $('.fullScreenSpin').css('display', 'none');
                    // },1500);

                })
            }).catch(function(err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });

        } else {
            data = {
                type: "TTimeSheet",
                fields: {
                    ID: updateID,
                    EmployeeName: employeeName || '',
                    ServiceName: product || '',
                    HourlyRate: productcost || 0,
                    LabourCost: 1,
                    Allowedit: true,
                    Hours: hours || 0.016666666666666666,
                    TimeSheetDate: date,
                    StartTime: startTime,
                    EndTime: endTime,
                    // OverheadRate: 90,
                    Job: jobName || '',
                    // ServiceName: "Test"|| '',
                    TimeSheetClassName: "Default" || '',
                    Notes: techNotes || '',
                    InvoiceNotes: isPaused
                        // EntryDate: accountdesc|| ''
                }

            };
            contactService.saveClockTimeSheet(data).then(function(data) {
                if (Object.keys(obj).length > 0) {
                    if (obj.fields.Description == "Timesheet Completed") {
                        let endTime1 = endTime;
                        if (Array.isArray(clockList[clockList.length - 1].timelog)) {
                            toUpdateID = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.ID;
                        } else {
                            toUpdateID = clockList[clockList.length - 1].timelog.fields.ID;
                        }

                        if (toUpdateID != "") {
                            updateData = {
                                type: "TTimeLog",
                                fields: {
                                    ID: toUpdateID,
                                    EndDatetime: endTime1,
                                }
                            }
                        }
                        contactService.saveTimeSheetLog(obj).then(function(data) {
                            contactService.saveTimeSheetLog(updateData).then(function(data) {
                                sideBarService.getAllTimeSheetList().then(function(data) {
                                    addVS1Data('TTimeSheet', JSON.stringify(data));
                                    setTimeout(function() {
                                        window.open('/timesheet', '_self');
                                    }, 500);
                                })
                            }).catch(function(err) {})
                        }).catch(function(err) {})
                    } else if (obj.fields.Description == "Timesheet Started") {
                        contactService.saveTimeSheetLog(obj).then(function(data) {
                            sideBarService.getAllTimeSheetList().then(function(data) {
                                addVS1Data('TTimeSheet', JSON.stringify(data));
                                setTimeout(function() {
                                    window.open('/timesheet', '_self');
                                }, 500);
                            })
                        }).catch(function(err) {})
                    }
                } else {
                    sideBarService.getAllTimeSheetList().then(function(data) {
                        addVS1Data('TTimeSheet', JSON.stringify(data));
                        setTimeout(function() {
                            window.open('/timesheet', '_self');
                        }, 500);
                    })
                }

            }).catch(function(err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }

    },
    'click #processTimesheet': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        const templateObject = Template.instance();
        let selectClient = templateObject.selectedTimesheet.get();
        let contactService = new ContactService();
        if (selectClient.length === 0) {
            swal('Please select Timesheet to Process', '', 'info');
            $('.fullScreenSpin').css('display', 'none');
        } else {
            for (let x = 0; x < selectClient.length; x++) {

                let data = {
                    type: "TTimeSheet",
                    fields: {
                        ID: selectClient[x].TimesheetID,
                        Status: "Processed"
                    }

                };
                contactService.saveClockTimeSheet(data).then(function(data) {
                    if ((x + 1) == selectClient.length) {
                        sideBarService.getAllTimeSheetList().then(function(data) {
                            addVS1Data('TTimeSheet', JSON.stringify(data));
                            setTimeout(function() {
                                window.open('/timesheet', '_self');
                            }, 200);
                        })
                    }
                }).catch(function(err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            // Meteor._reload.reload();
                        } else if (result.dismiss === 'cancel') {}
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
            }

            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .processTimesheet': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();
        let checkStatus = "";
        let checkStartTime = "";
        let checkEndTime = "";
        let TimeSheetHours = 0;
        let updateID = $("#updateID").val() || "";
        let contactService = new ContactService();
        var startTime = $('#startTime').val() || '';
        var endTime = $('#endTime').val() || '';
        if (startTime == "" || endTime == "") {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: "Please enter Start and End Time to process this TimeSheet",
                type: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                    // Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {}
            });
            return false;
        }

        let clockList = templateObject.timesheetrecords.get();
        clockList = clockList.filter(clkList => {
            return clkList.employee == $('#employee_name').val() && clkList.id == $('#updateID').val();
        });

        if (clockList.length > 0) {
            if (Array.isArray(clockList[clockList.length - 1].timelog)) {
                checkStatus = clockList[clockList.length - 1].isPaused || "";
                TimeSheetHours: clockList[clockList.length - 1].hours || "";
                latestTimeLogId = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.ID || "";
                checkStartTime = clockList[clockList.length - 1].timelog[0].fields.StartDatetime || "";
                checkEndTime = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.EndDatetime || "";
            } else {
                checkStatus = clockList[clockList.length - 1].isPaused || "";
                TimeSheetHours: clockList[clockList.length - 1].hours || "";
                latestTimeLogId = clockList[clockList.length - 1].timelog.fields.ID || "";
                checkStartTime = clockList[clockList.length - 1].timelog.fields.StartDatetime || "";
                checkEndTime = clockList[clockList.length - 1].timelog.fields.EndDatetime || "";
            }
        }

        var employeeName = $('.employee_name').val();
        var startdateGet = new Date($("#dtSODate").datepicker("getDate"));
        let date = startdateGet.getFullYear() + "-" + ("0" + (startdateGet.getMonth() + 1)).slice(-2) + "-" + ("0" + startdateGet.getDate()).slice(-2);
        var edthour = $('#txtBookedHoursSpent').val() || 0.01;
        let hours = templateObject.timeToDecimal(edthour);
        var techNotes = $('#txtNotesOne').val() || '';
        var product = $('#product-listone').val() || '';
        var jobName = $('#sltJobOne').val() || '';
        var status = "Processed"
        let isPaused = checkStatus;
        let toUpdate = {};
        let obj = {};
        let data = '';
        if (startTime != "") {
            startTime = date + ' ' + startTime;
        }

        if (endTime != "") {
            endTime = date + ' ' + endTime;
        }

        if ($('#txtBookedHoursSpent1').val() != 0.01) {
            edthour = parseFloat(edthour) + parseFloat($('#txtBookedHoursSpent1').val());
        }

        if (checkStartTime == "" && startTime == "") {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: "You can't save this entry with no start time",
                type: 'warning',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                    // Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {}
            });
            return false;
        }

        if (updateID != "") {
            result = clockList.filter(Timesheet => {
                return Timesheet.id == updateID
            });

            if (result.length > 0) {
                if (result[0].timelog == null) {
                    obj = {
                        type: "TTimeLog",
                        fields: {
                            TimeSheetID: updateID,
                            EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
                            StartDatetime: startTime,
                            EndDatetime: endTime,
                            Product: product,
                            Description: 'Timesheet Processed',
                            EnteredBy: localStorage.getItem('mySessionEmployeeLoggedID')
                        }
                    };
                    isPaused = "completed";
                } else if ($('#startTime').val() != "" && $('#endTime').val() != "" && checkStatus != "completed") {
                    let startTime1 = startdateGet.getFullYear() + "-" + ("0" + (startdateGet.getMonth() + 1)).slice(-2) + "-" + ("0" + (startdateGet.getDate())).slice(-2) + ' ' + ("0" + startdateGet.getHours()).slice(-2) + ":" + ("0" + startdateGet.getMinutes()).slice(-2);
                    obj = {
                        type: "TTimeLog",
                        fields: {
                            TimeSheetID: updateID,
                            EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
                            StartDatetime: checkStartTime,
                            EndDatetime: endTime,
                            Product: product,
                            Description: 'Timesheet Processed',
                            EnteredBy: localStorage.getItem('mySessionEmployeeLoggedID')
                        }
                    };
                    isPaused = "completed";
                } else if (checkEndTime != "") {
                    aEndDate = moment().format("YYYY-MM-DD") + ' ' + endTime;
                }
            } else {
                obj = {
                    type: "TTimeLog",
                    fields: {
                        TimeSheetID: updateID,
                        EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
                        StartDatetime: startTime,
                        EndDatetime: endTime,
                        Product: product,
                        Description: 'Timesheet Processed',
                        EnteredBy: localStorage.getItem('mySessionEmployeeLoggedID')
                    }
                };
                isPaused = "completed";
            }
        }
        if (updateID == "") {
            if ($('#tActualStartTime').val() != "") {
                obj = {
                    type: "TTimeLog",
                    fields: {
                        EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
                        StartDatetime: startTime,
                        EndDatetime: endTime,
                        Product: product,
                        Description: 'Timesheet Processed',
                        EnteredBy: localStorage.getItem('mySessionEmployeeLoggedID')
                    }
                };
                isPaused = "completed";
            } else if ($('#tActualStartTime').val() != "" && $('#tActualEndTime').val() != "") {
                obj = {
                    type: "TTimeLog",
                    fields: {
                        EmployeeID: localStorage.getItem('mySessionEmployeeLoggedID'),
                        StartDatetime: startTime,
                        EndDatetime: endTime,
                        Product: product,
                        Description: 'Timesheet Processed',
                        EnteredBy: localStorage.getItem('mySessionEmployeeLoggedID')
                    }
                };

                isPaused = "completed";
            }
            data = {
                type: "TTimeSheetEntry",
                fields: {
                    // "EntryDate":"2020-10-12 12:39:14",
                    TimeSheet: [{
                        type: "TTimeSheet",
                        fields: {
                            EmployeeName: employeeName || '',
                            ServiceName: product || '',
                            LabourCost: 1,
                            Allowedit: true,
                            Logs: obj,
                            Hours: hours || 0.01,
                            Status: status,
                            // OverheadRate: 90,
                            Job: jobName || '',
                            // ServiceName: "Test"|| '',
                            TimeSheetClassName: "Default" || '',
                            Notes: techNotes || '',
                            Status: status,
                            InvoiceNotes: "completed"
                                // EntryDate: accountdesc|| ''
                        }
                    }],
                    "TypeName": "Payroll",
                    "WhoEntered": localStorage.getItem('mySessionEmployee') || ""
                }
            };
            contactService.saveTimeSheet(data).then(function(data) {
                sideBarService.getAllTimeSheetList().then(function(data) {
                    addVS1Data('TTimeSheet', JSON.stringify(data));
                    setTimeout(function() {
                        window.open('/timesheet', '_self');
                    }, 500);
                })
            }).catch(function(err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });

        } else {
            data = {
                type: "TTimeSheet",
                fields: {
                    ID: updateID,
                    EmployeeName: employeeName || '',
                    ServiceName: product || '',
                    LabourCost: 1,
                    Allowedit: true,
                    Hours: hours || 0.01,
                    Status: status,
                    // OverheadRate: 90,
                    Job: jobName || '',
                    // ServiceName: "Test"|| '',
                    TimeSheetClassName: "Default" || '',
                    Notes: techNotes || '',
                    InvoiceNotes: "completed"
                        // EntryDate: accountdesc|| ''
                }

            };

            contactService.saveClockTimeSheet(data).then(function(data) {
                if (Object.keys(obj).length > 0) {
                    if (obj.fields.Description == "Timesheet Processed") {
                        let endTime1 = endTime;
                        if (Array.isArray(clockList[clockList.length - 1].timelog)) {
                            toUpdateID = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.ID;
                        } else {
                            toUpdateID = clockList[clockList.length - 1].timelog.fields.ID;
                        }

                        if (toUpdateID != "") {
                            updateData = {
                                type: "TTimeLog",
                                fields: {
                                    ID: toUpdateID,
                                    EndDatetime: endTime1,
                                }
                            }
                        }
                        contactService.saveTimeSheetLog(obj).then(function(data) {
                            contactService.saveTimeSheetLog(updateData).then(function(data) {
                                sideBarService.getAllTimeSheetList().then(function(data) {
                                    addVS1Data('TTimeSheet', JSON.stringify(data));
                                    setTimeout(function() {
                                        window.open('/timesheet', '_self');
                                    }, 500);
                                })
                            }).catch(function(err) {})
                        }).catch(function(err) {})
                    } else if (obj.fields.Description == "Timesheet Processed") {
                        contactService.saveTimeSheetLog(obj).then(function(data) {
                            sideBarService.getAllTimeSheetList().then(function(data) {
                                addVS1Data('TTimeSheet', JSON.stringify(data));
                                setTimeout(function() {
                                    window.open('/timesheet', '_self');
                                }, 500);
                            })
                        }).catch(function(err) {})
                    }
                } else {
                    sideBarService.getAllTimeSheetList().then(function(data) {
                        addVS1Data('TTimeSheet', JSON.stringify(data));
                        setTimeout(function() {
                            window.open('/timesheet', '_self');
                        }, 500);
                    })
                }

            }).catch(function(err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }

    },
    'click .btnAddNewAccounts': function() {

        $('#add-account-title').text('Add New Account');
        $('#edtAccountID').val('');
        $('#sltAccountType').val('');
        $('#sltAccountType').removeAttr('readonly', true);
        $('#sltAccountType').removeAttr('disabled', 'disabled');
        $('#edtAccountName').val('');
        $('#edtAccountName').attr('readonly', false);
        $('#edtAccountNo').val('');
        $('#sltTaxCode').val(loggedTaxCodePurchaseInc || '');
        $('#txaAccountDescription').val('');
        $('#edtBankAccountName').val('');
        $('#edtBSB').val('');
        $('#edtBankAccountNo').val('');
    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        setTimeout(function() {
            jQuery('#tblTimeSheet_wrapper .dt-buttons .btntabletopdf').click();
        }, delayTimeAfterSound);
    },
    'click #btnHoldOne': function(event) {
        $('#frmOnHoldModal').modal('show');
    },
    'click .btnTimesheetListOne': function(event) {
        $('.modal-backdrop').css('display', 'none');
        let id = $('#updateID').val();
        if (id) {
            FlowRouter.go('/timesheettimelog?id=' + id);
        } else {
            FlowRouter.go('/timesheettimelog');
        }
    },
    'click #btnHold': function(event) {
        $('#frmOnHoldModal').modal('show');
    },
    'click .btnPauseJobOne': function(event) {

        $('.fullScreenSpin').css('display', 'inline-block');
        templateObject = Template.instance();
        let contactService = new ContactService();
        let checkStatus = "";
        let checkStartTime = "";
        let checkEndTime = "";
        let updateID = $("#updateID").val() || "";
        let notes = $("#txtpause-notes").val() || "";
        let latestTimeLogId = '';
        var product = $('#product-listone').val() || '';
        let type = "Break";
        if ($('#break').is(":checked")) {
            type = $('#break').val();
        } else if ($('#lunch').is(":checked")) {
            type = $('#lunch').val();
        } else if ($('#purchase').is(":checked")) {
            type = $('#purchase').val();
        } else {
            swal({
                title: 'Please Select Option',
                text: 'Please select Break, Lunch or Purchase Option',
                type: 'info',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((results) => {
                if (results.value) {} else if (results.dismiss === 'cancel') {}
            });
            $('.fullScreenSpin').css('display', 'none');
            return false;
        }

        if (updateID == "") {
            swal({
                title: 'Oooops...',
                text: 'Please save this entry before Pausing it',
                type: 'info',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((results) => {
                if (results.value) {} else if (results.dismiss === 'cancel') {}
            });
            $('.fullScreenSpin').css('display', 'none');
            return false;
        }

        let clockList = templateObject.timesheetrecords.get();
        clockList = clockList.filter(clkList => {
            return clkList.employee == $('#employee_name').val() && clkList.id == $('#updateID').val();
        });
        if (clockList.length > 0) {
            if (Array.isArray(clockList[clockList.length - 1].timelog)) {
                checkStatus = clockList[clockList.length - 1].isPaused || "";
                latestTimeLogId = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.ID || "";
                checkStartTime = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.StartDatetime || "";
                checkEndTime = clockList[clockList.length - 1].timelog[clockList[clockList.length - 1].timelog.length - 1].fields.EndDatetime || "";
            } else {
                checkStatus = clockList[clockList.length - 1].isPaused || "";
                latestTimeLogId = clockList[clockList.length - 1].timelog.fields.ID || "";
                checkStartTime = clockList[clockList.length - 1].timelog.fields.StartDatetime || "";
                checkEndTime = clockList[clockList.length - 1].timelog.fields.EndDatetime || "";
            }
        }

        var employeeName = $('.employee_name').val();
        var startdateGet = new Date();
        let date = startdateGet.getFullYear() + "-" + ("0" + (startdateGet.getMonth() + 1)).slice(-2) + "-" + ("0" + startdateGet.getDate()).slice(-2);
        var startTime = ("0" + startdateGet.getHours()).slice(-2) + ':' + ("0" + startdateGet.getMinutes()).slice(-2);
        var endTime = ("0" + startdateGet.getHours()).slice(-2) + ':' + ("0" + startdateGet.getMinutes()).slice(-2);
        let toUpdate = {};
        let data = '';
        if (startTime != "") {
            startTime = date + ' ' + startTime;
        }

        // if (checkStatus == "paused") {
        //     swal({
        //         title: 'Oooops...',
        //         text: 'You cant Pause entry that has been completed',
        //         type: 'info',
        //         showCancelButton: false,
        //         confirmButtonText: 'Try Again'
        //     }).then((results) => {
        //         if (results.value) {}
        //         else if (results.dismiss === 'cancel') {}
        //     });
        //     $('.fullScreenSpin').css('display', 'none');
        //     return false;
        // }

        toUpdate = {
            type: "TTimeLog",
            fields: {
                ID: latestTimeLogId,
                EndDatetime: date + ' ' + endTime
            }
        }

        data = {
            type: "TTimeLog",
            fields: {
                TimeSheetID: updateID,
                Description: type + ": " + notes || '',
                EmployeeName: employeeName,
                StartDatetime: startTime,
                Product: product
            }
        }

        contactService.saveTimeSheetLog(data).then(function(savedData) {
            let updateTimeSheet = {
                type: "TTimeSheet",
                fields: {
                    ID: updateID,
                    InvoiceNotes: "paused",
                    EmployeeName: employeeName,
                }
            }
            contactService.saveClockTimeSheet(updateTimeSheet).then(function(savedTimesheetData) {

                contactService.saveTimeSheetLog(toUpdate).then(function(data) {
                    sideBarService.getAllTimeSheetList().then(function(data) {
                        addVS1Data('TTimeSheet', JSON.stringify(data));
                        setTimeout(function() {
                            window.open('/timesheet', '_self');
                        }, 500);
                    })
                }).catch(function(err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            // Meteor._reload.reload();
                        } else if (result.dismiss === 'cancel') {}
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
            }).catch(function(err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });

            // contactService.saveClockonClockOff(toUpdate).then(function (data) {
            //     FlowRouter.go('/employeetimeclock');
            // })
        }).catch(function(err) {
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                    // Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {}
            });
            $('.fullScreenSpin').css('display', 'none');
        });

    },
    'change #lunch': function(event) {
        $('#break').prop('checked', false);
        $('#purchase').prop('checked', false);
    },
    'change #break': function(event) {
        $('#lunch').prop('checked', false);
        $('#purchase').prop('checked', false);
    },
    'change #purchase': function(event) {
        $('#break').prop('checked', false);
        $('#lunch').prop('checked', false);
    },
    'click .btnDeleteTimeSheetOne': function() {
        playDeleteAudio();
        let templateObject = Template.instance();
        let contactService = new ContactService();
        setTimeout(function() {
            // $('.fullScreenSpin').css('display', 'inline-block');

            swal({
                title: 'Delete TimeSheet',
                text: "Are you sure you want to Delete this TimeSheet?",
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes'
            }).then((result) => {
                if (result.value) {
                    $('.fullScreenSpin').css('display', 'inline-block');
                    let timesheetID = $('#updateID').val();
                    if (timesheetID == "") {
                        $('.fullScreenSpin').css('display', 'none');
                    } else {
                        data = {
                            type: "TTimeSheet",
                            fields: {
                                ID: timesheetID,
                                Active: false,
                            }
                        };

                        contactService.saveTimeSheetUpdate(data).then(function(data) {
                            sideBarService.getAllTimeSheetList().then(function(data) {
                                addVS1Data('TTimeSheet', JSON.stringify(data));
                                setTimeout(function() {
                                    window.open('/timesheet', '_self');
                                }, 500);
                            })
                        }).catch(function(err) {
                            swal({
                                title: 'Oooops...',
                                text: err,
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {
                                    //Meteor._reload.reload();
                                } else if (result.dismiss === 'cancel') {}
                            });
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    }

                } else {
                    $('.fullScreenSpin').css('display', 'none');
                }
            });
        }, delayTimeAfterSound);
    },
    'blur .cashamount': function(event) {
        let inputUnitPrice = parseFloat($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        if (!isNaN($(event.target).val())) {
            $(event.target).val(Currency + '' + inputUnitPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2
            }));
        } else {
            let inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));
            //parseFloat(parseFloat($.trim($(event.target).text().substring(Currency.length).replace(",", ""))) || 0);
            $(event.target).val(Currency + '' + inputUnitPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2
            }) || 0);
            //$('.lineUnitPrice').text();

        }
    },
    'blur .colRate, keyup .colRate, change .colRate': function(event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseFloat($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;
        let totalGrossPay = 0;
        let totalRegular = 0;
        let totalOvertime = 0;
        let totalDouble = 0;
        $(event.target).closest("tr").find("span.colRateSpan").text($(event.target).val());
        // .closest('span').find('.colRateSpan').html($(event.target).val());
        $('.colRate').each(function() {
            var chkbidwithLine = Number($(this).val().replace(/[^0-9.-]+/g, "")) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function() {
            var rateValue = Number($(this).find(".colRate").val().replace(/[^0-9.-]+/g, "")) || 0;
            var regHourValue = Number($(this).find(".colRegHours").val()) || 0;
            var overtimeValue = Number($(this).find(".olOvertime").val()) || 0;
            var doubleeValue = Number($(this).find(".colDouble").val()) || 0;
            var additionalValue = Number($(this).find(".colAdditional").val().replace(/[^0-9.-]+/g, "")) || 0;
            var paytipsValue = Number($(this).find(".colPaycheckTips").val().replace(/[^0-9.-]+/g, "")) || 0;
            // var cashtipsValue = Number($(this).find(".colCashTips").val().replace(/[^0-9.-]+/g,""))||0;

            totalRegular = (rateValue * regHourValue) || 0;
            totalOvertime = ((rateValue * 1.5) * overtimeValue) || 0;
            totalDouble = ((rateValue * 2) * doubleeValue) || 0;
            totalGrossPay = (totalRegular + totalRegular + totalDouble + additionalValue + paytipsValue) || 0;
            $(this).find(".colGrossPay").val(utilityService.modifynegativeCurrencyFormat(totalGrossPay) || 0);
        });
        $('.lblSumHourlyRate').text(utilityService.modifynegativeCurrencyFormat(totalvalue) || 0);

    },
    'keyup .colRegHoursOne': function(event) {
        let templateObject = Template.instance();
        let contactService = new ContactService();
        let id = $(event.target).closest("tr").find(".colID").text() || 0;
        let edthour = $(event.target).val() || '00:00';
        let hours = templateObject.timeToDecimal(edthour);
        data = {
            type: "TTimeSheet",
            fields: {
                ID: id,
                Hours: hours || 0.01
            }

        };

        contactService.saveTimeSheetUpdate(data).then(function(data) {
            sideBarService.getAllTimeSheetList().then(function(data) {
                addVS1Data('TTimeSheet', JSON.stringify(data));
            })
        }).catch(function(err) {});
    },
    'blur .colRegHours, keyup .colRegHours, change .colRegHours': function(event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseInt($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colRegHours').each(function() {
            var chkbidwithLine = Number($(this).val()) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function() {
            var rateValue = Number($(this).find(".colRate").val().replace(/[^0-9.-]+/g, "")) || 0;
            var regHourValue = Number($(this).find(".colRegHours").val()) || 0;
            var overtimeValue = Number($(this).find(".olOvertime").val()) || 0;
            var doubleeValue = Number($(this).find(".colDouble").val()) || 0;
            var additionalValue = Number($(this).find(".colAdditional").val().replace(/[^0-9.-]+/g, "")) || 0;
            var paytipsValue = Number($(this).find(".colPaycheckTips").val().replace(/[^0-9.-]+/g, "")) || 0;
            //var cashtipsValue = Number($(this).find(".colCashTips").val().replace(/[^0-9.-]+/g,""))||0;

            totalRegular = (rateValue * regHourValue) || 0;
            totalOvertime = ((rateValue * 1.5) * overtimeValue) || 0;
            totalDouble = ((rateValue * 2) * doubleeValue) || 0;
            totalGrossPay = (totalRegular + totalRegular + totalDouble + additionalValue + paytipsValue) || 0;
            $(this).find(".colGrossPay").val(utilityService.modifynegativeCurrencyFormat(totalGrossPay) || 0);
        });
        $('.lblSumHour').text(totalvalue || 0);

    },
    'blur .colOvertime, keyup .colOvertime, change .colOvertime': function(event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseInt($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colOvertime').each(function() {
            var chkbidwithLine = Number($(this).val()) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function() {
            var rateValue = Number($(this).find(".colRate").val().replace(/[^0-9.-]+/g, "")) || 0;
            var regHourValue = Number($(this).find(".colRegHours").val()) || 0;
            var overtimeValue = Number($(this).find(".olOvertime").val()) || 0;
            var doubleeValue = Number($(this).find(".colDouble").val()) || 0;
            var additionalValue = Number($(this).find(".colAdditional").val().replace(/[^0-9.-]+/g, "")) || 0;
            var paytipsValue = Number($(this).find(".colPaycheckTips").val().replace(/[^0-9.-]+/g, "")) || 0;
            //var cashtipsValue = Number($(this).find(".colCashTips").val().replace(/[^0-9.-]+/g,""))||0;

            totalRegular = (rateValue * regHourValue) || 0;
            totalOvertime = ((rateValue * 1.5) * overtimeValue) || 0;
            totalDouble = ((rateValue * 2) * doubleeValue) || 0;
            totalGrossPay = (totalRegular + totalRegular + totalDouble + additionalValue + paytipsValue) || 0;
            $(this).find(".colGrossPay").val(utilityService.modifynegativeCurrencyFormat(totalGrossPay) || 0);
        });
        $('.lblSumOvertime').text(totalvalue || 0);

    },
    'blur .colDouble, keyup .colDouble, change .colDouble': function(event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseInt($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colDouble').each(function() {
            var chkbidwithLine = Number($(this).val()) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function() {
            var rateValue = Number($(this).find(".colRate").val().replace(/[^0-9.-]+/g, "")) || 0;
            var regHourValue = Number($(this).find(".colRegHours").val()) || 0;
            var overtimeValue = Number($(this).find(".olOvertime").val()) || 0;
            var doubleeValue = Number($(this).find(".colDouble").val()) || 0;
            var additionalValue = Number($(this).find(".colAdditional").val().replace(/[^0-9.-]+/g, "")) || 0;
            var paytipsValue = Number($(this).find(".colPaycheckTips").val().replace(/[^0-9.-]+/g, "")) || 0;
            //var cashtipsValue = Number($(this).find(".colCashTips").val().replace(/[^0-9.-]+/g,""))||0;

            totalRegular = (rateValue * regHourValue) || 0;
            totalOvertime = ((rateValue * 1.5) * overtimeValue) || 0;
            totalDouble = ((rateValue * 2) * doubleeValue) || 0;
            totalGrossPay = (totalRegular + totalRegular + totalDouble + additionalValue + paytipsValue) || 0;
            $(this).find(".colGrossPay").val(utilityService.modifynegativeCurrencyFormat(totalGrossPay) || 0);
        });
        $('.lblSumDouble').text(totalvalue || 0);

    },
    'blur .colAdditional, keyup .colAdditional, change .colAdditional': function(event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseFloat($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colAdditional').each(function() {
            var chkbidwithLine = Number($(this).val().replace(/[^0-9.-]+/g, "")) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function() {
            var rateValue = Number($(this).find(".colRate").val().replace(/[^0-9.-]+/g, "")) || 0;
            var regHourValue = Number($(this).find(".colRegHours").val()) || 0;
            var overtimeValue = Number($(this).find(".olOvertime").val()) || 0;
            var doubleeValue = Number($(this).find(".colDouble").val()) || 0;
            var additionalValue = Number($(this).find(".colAdditional").val().replace(/[^0-9.-]+/g, "")) || 0;
            var paytipsValue = Number($(this).find(".colPaycheckTips").val().replace(/[^0-9.-]+/g, "")) || 0;
            //var cashtipsValue = Number($(this).find(".colCashTips").val().replace(/[^0-9.-]+/g,""))||0;

            totalRegular = (rateValue * regHourValue) || 0;
            totalOvertime = ((rateValue * 1.5) * overtimeValue) || 0;
            totalDouble = ((rateValue * 2) * doubleeValue) || 0;
            totalGrossPay = (totalRegular + totalRegular + totalDouble + additionalValue + paytipsValue) || 0;
            $(this).find(".colGrossPay").val(utilityService.modifynegativeCurrencyFormat(totalGrossPay) || 0);
        });
        $('.lblSumAdditions').text(utilityService.modifynegativeCurrencyFormat(totalvalue) || 0);

    },
    'blur .colPaycheckTips, keyup .colPaycheckTips, change .colPaycheckTips': function(event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseFloat($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colPaycheckTips').each(function() {
            var chkbidwithLine = Number($(this).val().replace(/[^0-9.-]+/g, "")) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function() {
            var rateValue = Number($(this).find(".colRate").val().replace(/[^0-9.-]+/g, "")) || 0;
            var regHourValue = Number($(this).find(".colRegHours").val()) || 0;
            var overtimeValue = Number($(this).find(".olOvertime").val()) || 0;
            var doubleeValue = Number($(this).find(".colDouble").val()) || 0;
            var additionalValue = Number($(this).find(".colAdditional").val().replace(/[^0-9.-]+/g, "")) || 0;
            var paytipsValue = Number($(this).find(".colPaycheckTips").val().replace(/[^0-9.-]+/g, "")) || 0;
            //var cashtipsValue = Number($(this).find(".colCashTips").val().replace(/[^0-9.-]+/g,""))||0;

            totalRegular = (rateValue * regHourValue) || 0;
            totalOvertime = ((rateValue * 1.5) * overtimeValue) || 0;
            totalDouble = ((rateValue * 2) * doubleeValue) || 0;
            totalGrossPay = (totalRegular + totalRegular + totalDouble + additionalValue + paytipsValue) || 0;
            $(this).find(".colGrossPay").val(utilityService.modifynegativeCurrencyFormat(totalGrossPay) || 0);
        });
        $('.lblSumPaytips').text(utilityService.modifynegativeCurrencyFormat(totalvalue) || 0);

    },
    'blur .colCashTips, keyup .colCashTips, change .colCashTips': function(event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseFloat($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colCashTips').each(function() {
            var chkbidwithLine = Number($(this).val().replace(/[^0-9.-]+/g, "")) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function() {
            var rateValue = Number($(this).find(".colRate").val().replace(/[^0-9.-]+/g, "")) || 0;
            var regHourValue = Number($(this).find(".colRegHours").val()) || 0;
            var overtimeValue = Number($(this).find(".olOvertime").val()) || 0;
            var doubleeValue = Number($(this).find(".colDouble").val()) || 0;
            var additionalValue = Number($(this).find(".colAdditional").val().replace(/[^0-9.-]+/g, "")) || 0;
            var paytipsValue = Number($(this).find(".colPaycheckTips").val().replace(/[^0-9.-]+/g, "")) || 0;
            //var cashtipsValue = Number($(this).find(".colCashTips").val().replace(/[^0-9.-]+/g,""))||0;

            totalRegular = (rateValue * regHourValue) || 0;
            totalOvertime = ((rateValue * 1.5) * overtimeValue) || 0;
            totalDouble = ((rateValue * 2) * doubleeValue) || 0;
            totalGrossPay = (totalRegular + totalRegular + totalDouble + additionalValue + paytipsValue) || 0;
            $(this).find(".colGrossPay").val(utilityService.modifynegativeCurrencyFormat(totalGrossPay) || 0);
        });
        $('.lblSumCashtips').text(utilityService.modifynegativeCurrencyFormat(totalvalue) || 0);

    },
    'blur .colGrossPay, keyup .colGrossPay, change .colGrossPay': function(event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseFloat($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colGrossPay').each(function() {
            var chkbidwithLine = Number($(this).val().replace(/[^0-9.-]+/g, "")) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function() {
            var rateValue = Number($(this).find(".colRate").val().replace(/[^0-9.-]+/g, "")) || 0;
            var regHourValue = Number($(this).find(".colRegHours").val()) || 0;
            var overtimeValue = Number($(this).find(".olOvertime").val()) || 0;
            var doubleeValue = Number($(this).find(".colDouble").val()) || 0;
            var additionalValue = Number($(this).find(".colAdditional").val().replace(/[^0-9.-]+/g, "")) || 0;
            var paytipsValue = Number($(this).find(".colPaycheckTips").val().replace(/[^0-9.-]+/g, "")) || 0;
            //var cashtipsValue = Number($(this).find(".colCashTips").val().replace(/[^0-9.-]+/g,""))||0;

            totalRegular = (rateValue * regHourValue) || 0;
            totalOvertime = ((rateValue * 1.5) * overtimeValue) || 0;
            totalDouble = ((rateValue * 2) * doubleeValue) || 0;
            totalGrossPay = (totalRegular + totalRegular + totalDouble + additionalValue + paytipsValue) || 0;
            $(this).find(".colGrossPay").val(utilityService.modifynegativeCurrencyFormat(totalGrossPay) || 0);
        });
        $('.lblSumTotalCharge').text(utilityService.modifynegativeCurrencyFormat(totalvalue) || 0);

    },
    'keydown .cashamount': function(event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
            // Allow: Ctrl+A, Command+A
            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
            // Allow: home, end, left, right, down, up
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            // let it happen, don't do anything
            return;
        }

        if (event.shiftKey == true) {
            event.preventDefault();
        }

        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190) {} else {
            event.preventDefault();
        }
    },
    // 'click .btnEditTimeSheet': function (event) {
    //     var targetID = $(event.target).closest('tr').attr('id'); // table row ID
    //     $('#edtTimesheetID').val(targetID);
    // }
    // ,
    'click #btnNewTimeSheet': function(event) {
        $('#edtTimesheetID').val('');
        $('#add-timesheet-title').text('New Timesheet');
        $('.sltEmployee').val(localStorage.getItem('mySessionEmployee'));
        $('.sltJob').val('');
        $('.lineEditHourlyRate').val('');
        $('.lineEditHour').val('8');
        $('.lineEditTechNotes').val('');
    },
    'change #dateTo': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterTimeSheetData(formatDateFrom, formatDateTo, false);
        }

    },
    'change #dateFrom': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterTimeSheetData(formatDateFrom, formatDateTo, false);
        }

    },
    'click #today': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if ((currentBeginDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth() + 1);
        }

        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDateERPFrom = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        var toDateERPTo = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);

        var toDateDisplayFrom = (fromDateDay) + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay) + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterTimeSheetData(toDateERPFrom, toDateERPTo, false);
    },
    'click #lastweek': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if ((currentBeginDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth() + 1);
        }

        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDateERPFrom = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay - 7);
        var toDateERPTo = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);

        var toDateDisplayFrom = (fromDateDay - 7) + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay) + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterTimeSheetData(toDateERPFrom, toDateERPTo, false);
    },
    'click #lastMonth': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();

        var prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        var prevMonthFirstDate = new Date(currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1), (currentDate.getMonth() - 1 + 12) % 12, 1);

        var formatDateComponent = function(dateComponent) {
            return (dateComponent < 10 ? '0' : '') + dateComponent;
        };

        var formatDate = function(date) {
            return formatDateComponent(date.getDate()) + '/' + formatDateComponent(date.getMonth() + 1) + '/' + date.getFullYear();
        };

        var formatDateERP = function(date) {
            return date.getFullYear() + '-' + formatDateComponent(date.getMonth() + 1) + '-' + formatDateComponent(date.getDate());
        };


        var fromDate = formatDate(prevMonthFirstDate);
        var toDate = formatDate(prevMonthLastDate);

        $("#dateFrom").val(fromDate);
        $("#dateTo").val(toDate);

        var getLoadDate = formatDateERP(prevMonthLastDate);
        let getDateFrom = formatDateERP(prevMonthFirstDate);
        templateObject.getAllFilterTimeSheetData(getDateFrom, getLoadDate, false);
    },
    'click #lastQuarter': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        function getQuarter(d) {
            d = d || new Date();
            var m = Math.floor(d.getMonth() / 3) + 2;
            return m > 4 ? m - 4 : m;
        }

        var quarterAdjustment = (moment().month() % 3) + 1;
        var lastQuarterEndDate = moment().subtract({
            months: quarterAdjustment
        }).endOf('month');
        var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({
            months: 2
        }).startOf('month');

        var lastQuarterStartDateFormat = moment(lastQuarterStartDate).format("DD/MM/YYYY");
        var lastQuarterEndDateFormat = moment(lastQuarterEndDate).format("DD/MM/YYYY");


        $("#dateFrom").val(lastQuarterStartDateFormat);
        $("#dateTo").val(lastQuarterEndDateFormat);

        let fromDateMonth = getQuarter(currentDate);
        var quarterMonth = getQuarter(currentDate);
        let fromDateDay = currentDate.getDate();

        var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
        let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
        templateObject.getAllFilterTimeSheetData(getDateFrom, getLoadDate, false);
    },
    'click #last12Months': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
        let fromDateDay = currentDate.getDate();
        if ((currentDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentDate.getMonth() + 1);
        }
        if (currentDate.getDate() < 10) {
            fromDateDay = "0" + currentDate.getDate();
        }

        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + Math.floor(currentDate.getFullYear() - 1);
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        var currentDate2 = new Date();
        if ((currentDate2.getMonth() + 1) < 10) {
            fromDateMonth2 = "0" + Math.floor(currentDate2.getMonth() + 1);
        }
        if (currentDate2.getDate() < 10) {
            fromDateDay2 = "0" + currentDate2.getDate();
        }
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + fromDateMonth2 + "-" + currentDate2.getDate();
        templateObject.getAllFilterTimeSheetData(getDateFrom, getLoadDate, false);

    },
    'click #ignoreDate': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
        templateObject.getAllFilterTimeSheetData('', '', true);
    },
    'keyup #tblTimeSheet_filter input': function(event) {
        // if($(event.target).val() != ''){
        //   $(".btnRefreshTimeSheet").addClass('btnSearchAlert');
        // }else{
        //   $(".btnRefreshTimeSheet").removeClass('btnSearchAlert');
        // }
        // if (event.keyCode == 13) {
        //    $(".btnRefreshTimeSheet").trigger("click");
        // }
    },
    'click .btnRefreshTimeSheet': function(event) {
        $(".btnRefreshOne").trigger("click");
    },

});

Template.timesheet.helpers({
    jobsrecords: () => {
        return Template.instance().jobsrecords.get().sort(function(a, b) {
            if (a.jobname == 'NA') {
                return 1;
            } else if (b.jobname == 'NA') {
                return -1;
            }
            return (a.jobname.toUpperCase() > b.jobname.toUpperCase()) ? 1 : -1;
        });
    },
    edithours: () => {
        return localStorage.getItem('CloudEditTimesheetHours') || false;
    },
    clockOnOff: () => {
        return localStorage.getItem('CloudClockOnOff') || false;
    },
    launchClockOnOff: () => {
        return localStorage.getItem('launchClockOnOff') || false;
    },
    seeOwnTimesheets: () => {
        return localStorage.getItem('seeOwnTimesheets') || false;
    },
    timesheetStartStop: () => {
        return localStorage.getItem('timesheetStartStop') || false;
    },
    showTimesheetEntries: () => {
        return localStorage.getItem('CloudTimesheetEntry') || false;
    },
    showTimesheet: () => {
        return localStorage.getItem('CloudShowTimesheet') || false;
    },
    employeerecords: () => {
        return Template.instance().employeerecords.get().sort(function(a, b) {
            if (a.employeename == 'NA') {
                return 1;
            } else if (b.employeename == 'NA') {
                return -1;
            }
            return (a.employeename.toUpperCase() > b.employeename.toUpperCase()) ? 1 : -1;
        });
    },
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.sortdate == 'NA') {
                return 1;
            } else if (b.sortdate == 'NA') {
                return -1;
            }
            return (a.sortdate.toUpperCase() > b.sortdate.toUpperCase()) ? 1 : -1;
        });
    },
    productsdatatablerecords: () => {
        return Template.instance().productsdatatablerecords.get().sort(function(a, b) {
            if (a.productname == 'NA') {
                return 1;
            } else if (b.productname == 'NA') {
                return -1;
            }
            return (a.productname.toUpperCase() > b.productname.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    },
    loggedInEmployee: () => {
        return localStorage.getItem('mySessionEmployee') || '';
    },
    apiFunction:function() {
        return sideBarService.getAllTimeSheetList;
    },
    searchAPI: function() {
        return sideBarService.getAllTimeSheetListByEmployeeName;
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
    }

});
