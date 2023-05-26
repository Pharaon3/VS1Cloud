import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../../js/core-service';
import {UtilityService} from "../../utility-service";
import {ContactService} from "../../contacts/contact-service";
import { SideBarService } from '../../js/sidebar-service';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import "./timesheettimelog.html";

let utilityService = new UtilityService();
let sideBarService = new SideBarService();
Template.timesheettimelog.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.datatablerecords1 = new ReactiveVar([]);
    templateObject.employeerecords = new ReactiveVar([]);
    templateObject.jobsrecords = new ReactiveVar([]);
    templateObject.selectedTimesheet = new ReactiveVar([]);
    templateObject.selectedTimesheetID = new ReactiveVar();
    templateObject.selectedFile = new ReactiveVar();

    templateObject.tableheaderrecords = new ReactiveVar();
  
  templateObject.selectedFile = new ReactiveVar();
  templateObject.getDataTableList = function (data) {

  let Hours = 0;
  let arrayLogId = "";
  let arrayLogProject = "";
  let arrayLogNote = "";
  
  let sortdate = data.fields.TimeSheetDate != '' ? moment(data.fields.TimeSheetDate).format("YYYY/MM/DD") : data.fields.TimeSheetDate;
    if (Array.isArray(data.fields.Logs)) {
        for (let l = 0; l < data.fields.Logs.length; l++) {

            if (data.fields.Logs[l].fields.StartDatetime != "") {
                startTime = moment(data.fields.Logs[l].fields.StartDatetime).format('h:mm a');
            } else {
                startTime = '';
            }

            if (data.fields.Logs[l].fields.EndDatetime != "") {
                endTime = moment(data.fields.Logs[l].fields.EndDatetime).format('h:mm a');
            } else {
                endTime = '';
            }

            if (data.fields.Logs[l].fields.StartDatetime != "" && data.fields.Logs[l].fields.EndDatetime != "") {
                let dt1 = new Date(data.fields.Logs[l].fields.StartDatetime);
                let dt2 = new Date(data.fields.Logs[l].fields.EndDatetime);
                Hours = templateObject.diff_hours1(dt2, dt1);
            } else {
                Hours = "0h:0m";
            }
            arrayLogId = data.fields.Logs[l].fields.ID;
            arrayLogProject = data.fields.Logs[l].fields.Product;
            arrayLogNote = data.fields.Logs[l].fields.Description;   
        }
    }

    else if(data.fields.Logs != null){
        if (data.fields.Logs.fields.StartDatetime != "") {
            startTime = moment(data.fields.Logs.fields.StartDatetime).format('h:mm a');
        } else {
            startTime = '';
        }

        if (data.fields.Logs.fields.EndDatetime != "") {
            endTime = moment(data.fields.Logs.fields.EndDatetime).format('h:mm a');
        } else {
            endTime = '';
        }

        if (data.fields.Logs.fields.StartDatetime != "" && data.fields.Logs.fields.EndDatetime != "") {
            let dt1 = new Date(data.fields.Logs.fields.StartDatetime);
            let dt2 = new Date(data.fields.Logs.fields.EndDatetime);
            Hours = templateObject.diff_hours1(dt2, dt1);
        } else {
           Hours = "0h:0m";
        }
        arrayLogId = data.fields.Logs.fields.ID;
        arrayLogProject = data.fields.Logs.fields.Product;
        arrayLogNote = data.fields.Logs.fields.Description;     
    }
    const dataList = [
        data.fields.ID || '',
        arrayLogId || '',
        data.fields.EmployeeName || '',
        sortdate || '',
        data.fields.Job || '',     
        arrayLogProject || data.fields.ServiceName || '',
        startTime,
        endTime,
        Hours,
        arrayLogNote || '',
        data.fields.Status == true ? '' : 'Unprocessed'
    ];
    return dataList;
  };

  let headerStructure = [
    {
      index: 0,
      label: "Sort ID",
      class: "colSortID hiddenColumn",
      active: false,
      display: true,
      width: "10",
    },
    {
      index: 1,
      label: "ID",
      class: "colTimesheetID",
      active: false,
      display: true,
      width: "10",
    },
    {
      index: 2,
      label: "Employee",
      class: "colName",
      active: true,
      display: true,
      width: "120",
    },
    {
      index: 3,
      label: "Date",
      class: "colDate",
      active: true,
      display: true,
      width: "150",
    },
    {
      index: 4,
      label: "Job",
      class: "colJob",
      active: true,
      display: true,
      width: "120",
    },
    {
        index: 5,
        label: "Product",
        class: "colJob",
        active: true,
        display: true,
        width: "120",
      },
    {
      index: 6,
      label: "From Time",
      class: "colFromTime",
      active: true,
      display: true,
      width: "120",
    },
    {
      index: 7,
      label: "To Time",
      class: "colToTime",
      active: true,
      display: true,
      width: "120",
    },
    {
      index: 8,
      label: "Hours",
      class: "colHours",
      active: false,
      display: true,
      width: "50",
    },
    {
      index: 9,
      label: "Break",
      class: "colBreak",
      active: true,
      display: true,
      width: "120",
    },
    {
      index: 10,
      label: "Status",
      class: "colStatus",
      active: true,
      display: true,
      width: "120",
    }
  ];

  
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.timesheettimelog.onRendered(function () {
    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    let contactService = new ContactService();


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

    templateObject.diff_hours1 = function (dt2, dt1) {
        var diff = (dt2.getTime() - dt1.getTime()) / 1000;
        let hours = Math.floor(diff / 3600) % 24;
        let min = Math.floor(diff / 60) % 60;
        let time = hours + "h:" + ("0" + min).slice(-2) + "m"
            // if (hours < 1 && min < 1) {
            //     time = 0;
            // }
            return time;
    }

    Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblTimeSheet', function (error, result) {
        if (error) {}
        else {
            if (result) {

                for (let i = 0; i < result.customFields.length; i++) {
                    let customcolumn = result.customFields;
                    let columData = customcolumn[i].label;
                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                    let hiddenColumn = customcolumn[i].hidden;
                    let columnClass = columHeaderUpdate.split('.')[1];
                    let columnWidth = customcolumn[i].width;

                    $("th." + columnClass + "").html(columData);
                    $("th." + columnClass + "").css('width', "" + columnWidth + "px");

                }
            }

        }
    });

    function MakeNegative() {
        $('td').each(function () {
            if ($(this).text().indexOf('-' + Currency) >= 0)
                $(this).addClass('text-danger')
        });
    };
    // templateObject.dateAsAt.set(begunDate);

    $("#date-input,#dateTo,#dateFrom").datepicker({
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
        onChangeMonthYear: function(year, month, inst){
        // Set date to picker
        $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
        // Hide (close) the picker
        // $(this).datepicker('hide');
        // // Change ttrigger the on change function
        // $(this).trigger('change');
       }
    });

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);
});

Template.timesheettimelog.events({

    'blur .divcolumn': function (event) {
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');

        var datable = $('#tblTimeSheet').DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);

    },
    'change .rngRange': function (event) {
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblTimeSheet th');
        $.each(datable, function (i, v) {

            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');

            }
        });

    },
    // 'click #check-all': function (event) {
    //     if ($(event.target).is(':checked')) {
    //         $(".chkBox").prop("checked", true);
    //     } else {
    //         $(".chkBox").prop("checked", false);
    //     }
    // },
    // 'click .chkBox': function () {
    //     var listData = $(this).closest('tr').attr('id');
    //     const templateObject = Template.instance();
    //     const selectedTimesheetList = [];
    //     const selectedTimesheetCheck = [];
    //     let ids = [];
    //     let JsonIn = {};
    //     let JsonIn1 = {};
    //     let myStringJSON = '';
    //     $('.chkBox:checkbox:checked').each(function () {
    //         var chkIdLine = $(this).closest('tr').attr('id');
    //         let obj = {
    //             AppointID: parseInt(chkIdLine)
    //         }

    //         selectedTimesheetList.push(obj);

    //         templateObject.selectedTimesheetID.set(chkIdLine);
    //         // selectedAppointmentCheck.push(JsonIn1);
    //         // }
    //     });
    //     JsonIn = {
    //         Params: {
    //             AppointIDs: selectedTimesheetList
    //         }
    //     };
    //     templateObject.selectedTimesheet.set(JsonIn);
    // },
    'click .btnOpenSettings': function (event) {
        let templateObject = Template.instance();
        var columns = $('#tblTimeSheet th');

        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
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
    'click .exportbtn': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblTimeSheet_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click .exportbtnExcel': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblTimeSheet_wrapper .dt-buttons .btntabletoexcel').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click .btnSaveTimeSheet': function () {
        playSaveAudio();
        let templateObject = Template.instance();
        let contactService = new ContactService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        let timesheetID = $('#edtTimesheetID').val();
        var employeeName = $('#sltEmployee').val();
        var jobName = $('#sltJob').val();
        var edthourlyRate = $('.lineEditHourlyRate').val() || 0;
        var edthour = $('.lineEditHour').val() || 0;
        var techNotes = $('.lineEditTechNotes').val() || '';
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
                                LabourCost: parseFloat(edthourlyRate) || 0,
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
                        }
                    ],
                    "TypeName": "Payroll",
                    "WhoEntered": localStorage.getItem('mySessionEmployee') || ""
                }
            };

            contactService.saveTimeSheet(data).then(function (data) {
                window.open('/timesheet', '_self');
            }).catch(function (err) {
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
                    LabourCost: parseFloat(edthourlyRate) || 0,
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

            contactService.saveTimeSheetUpdate(data).then(function (data) {
                window.open('/timesheet', '_self');
            }).catch(function (err) {
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
    'change #dateTo': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        let timesheetData = templateObject.datatablerecords1.get();
        let timesheetList = [];
        setTimeout(function(){
        //templateObject.datatablerecords.set('');
        let startDate = new Date($("#dateFrom").datepicker("getDate"));
        let endDate = new Date($("#dateTo").datepicker("getDate"));
        for (let x = 0; x < timesheetData.length; x++) {
            let date = new Date(timesheetData[x].timesheetdate1);
            if (date >= startDate && date <= endDate) {
                timesheetList.push(timesheetData[x]);
            }
        }
        templateObject.datatablerecords.set(timesheetList);
        $('.fullScreenSpin').css('display', 'none');
        },500);
    },
    'change #dateFrom': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        let timesheetData = templateObject.datatablerecords1.get();
        let timesheetList = [];
        //templateObject.datatablerecords.set('');
        setTimeout(function(){
        let startDate = new Date($("#dateFrom").datepicker("getDate"));
        let endDate = new Date($("#dateTo").datepicker("getDate"));
        for (let x = 0; x < timesheetData.length; x++) {
            let date = new Date(timesheetData[x].timesheetdate1);
            if (date >= startDate && date <= endDate) {
                timesheetList.push(timesheetData[x]);
            }
        }
        templateObject.datatablerecords.set(timesheetList);
        $('.fullScreenSpin').css('display', 'none');
        },500);
    },
    'click .btnAddNewAccounts': function () {

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
    'click .btnDeleteTimeSheet': function () {
        playDeleteAudio();
        let templateObject = Template.instance();
        let contactService = new ContactService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        let timesheetID = $('#edtTimesheetID').val();

        if (timesheetID == "") {
            window.open('/timesheet', '_self');
        } else {
            data = {
                type: "TTimeSheet",
                fields: {
                    ID: timesheetID,
                    Active: false,
                }
            };

            contactService.saveTimeSheetUpdate(data).then(function (data) {
                window.open('/timesheet', '_self');
            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }
    }, delayTimeAfterSound);
    },
    'blur .cashamount': function (event) {
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
    'blur .colRate, keyup .colRate, change .colRate': function (event) {
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
        $('.colRate').each(function () {
            var chkbidwithLine = Number($(this).val().replace(/[^0-9.-]+/g, "")) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function () {
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
    'blur .colRegHours, keyup .colRegHours, change .colRegHours': function (event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseInt($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colRegHours').each(function () {
            var chkbidwithLine = Number($(this).val()) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function () {
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
    'blur .colOvertime, keyup .colOvertime, change .colOvertime': function (event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseInt($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colOvertime').each(function () {
            var chkbidwithLine = Number($(this).val()) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function () {
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
    'blur .colDouble, keyup .colDouble, change .colDouble': function (event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseInt($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colDouble').each(function () {
            var chkbidwithLine = Number($(this).val()) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function () {
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
    'blur .colAdditional, keyup .colAdditional, change .colAdditional': function (event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseFloat($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colAdditional').each(function () {
            var chkbidwithLine = Number($(this).val().replace(/[^0-9.-]+/g, "")) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function () {
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
    'blur .colPaycheckTips, keyup .colPaycheckTips, change .colPaycheckTips': function (event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseFloat($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colPaycheckTips').each(function () {
            var chkbidwithLine = Number($(this).val().replace(/[^0-9.-]+/g, "")) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function () {
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
    'blur .colCashTips, keyup .colCashTips, change .colCashTips': function (event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseFloat($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colCashTips').each(function () {
            var chkbidwithLine = Number($(this).val().replace(/[^0-9.-]+/g, "")) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function () {
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
    'blur .colGrossPay, keyup .colGrossPay, change .colGrossPay': function (event) {
        let templateObject = Template.instance();
        let inputUnitPrice = parseFloat($(event.target).val()) || 0;
        let utilityService = new UtilityService();
        let totalvalue = 0;

        $('.colGrossPay').each(function () {
            var chkbidwithLine = Number($(this).val().replace(/[^0-9.-]+/g, "")) || 0;
            totalvalue = totalvalue + chkbidwithLine;
        });

        $('.tblTimeSheet tbody tr').each(function () {
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
    'keydown .cashamount': function (event) {
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
            event.keyCode == 46 || event.keyCode == 190) {}
        else {
            event.preventDefault();
        }
    }
});

Template.timesheettimelog.helpers({
    jobsrecords: () => {
        return Template.instance().jobsrecords.get().sort(function (a, b) {
            if (a.jobname == 'NA') {
                return 1;
            } else if (b.jobname == 'NA') {
                return -1;
            }
            return (a.jobname.toUpperCase() > b.jobname.toUpperCase()) ? 1 : -1;
        });
    },
    employeerecords: () => {
        return Template.instance().employeerecords.get().sort(function (a, b) {
            if (a.employeename == 'NA') {
                return 1;
            } else if (b.employeename == 'NA') {
                return -1;
            }
            return (a.employeename.toUpperCase() > b.employeename.toUpperCase()) ? 1 : -1;
        });
    },
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.timesheetdate == 'NA') {
                return 1;
            } else if (b.timesheetdate == 'NA') {
                return -1;
            }
            return (a.timesheetdate.toUpperCase() > b.timesheetdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
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

    exDataHandler: function () {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.timesheetdate == 'NA') {
                return 1;
            } else if (b.timesheetdate == 'NA') {
                return -1;
            }
            return (a.timesheetdate.toUpperCase() > b.timesheetdate.toUpperCase()) ? 1 : -1;
        });
    },
    apiParams: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },
    tablename: () => {
        let templateObject = Template.instance();
        let accCustID = templateObject.data.custid ? templateObject.data.custid : '';
        return 'tblTimeSheet'+ accCustID;
    },
});
