import { ReportService } from "../reports/report-service";
import { SalesBoardService } from '../js/sales-service';
import 'jQuery.print/jQuery.print.js';
import { UtilityService } from "../utility-service";

import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './vatreturntransactionlist.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import {SideBarService} from "../js/sidebar-service";
import moment from "moment";

let reportService = new ReportService();
let utilityService = new UtilityService();

const months = [];
months["January"] = "01";
months["February"] = "02";
months["March"] = "03";
months["April"] = "04";
months["May"] = "05";
months["June"] = "06";
months["July"] = "07";
months["August"] = "08";
months["September"] = "09";
months["October"] = "10";
months["November"] = "11";
months["December"] = "12";

Template.vatreturntransactionlist.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.getDataTableList = function(data) {
        let totalAmount = utilityService.modifynegativeCurrencyFormat( data.fields.VAT1 ) || 0.0;
        var dataList = [
            data.fields.ID || "",
            data.fields.AccMethod || "",
            data.fields.GlobalRef || "",
            data.fields.VATType || '',
            '<span style="display:none;">'+(data.SumTransDate !=''? moment(data.SumTransDate).format("YYYY/MM/DD"): data.SumTransDate)+'</span>'+(data.SumTransDate !=''? moment(data.SumTransDate).format("DD/MM/YYYY"): data.SumTransDate),
            totalAmount ? totalAmount : '',
            data.fields.VATDesc || '',
            data.ReturnPeriod || 0.0,
            '<span style="display:none;">'+(data.ReturnStartDate !=''? moment(data.ReturnStartDate).format("YYYY/MM/DD"): data.ReturnStartDate)+'</span>'+(data.ReturnStartDate !=''? moment(data.ReturnStartDate).format("DD/MM/YYYY"): data.ReturnStartDate),
            '<span style="display:none;">'+(data.ReturnEndDate !=''? moment(data.ReturnEndDate).format("YYYY/MM/DD"): data.ReturnEndDate)+'</span>'+(data.ReturnEndDate !=''? moment(data.ReturnEndDate).format("DD/MM/YYYY"): data.ReturnEndDate),
            data.fields.Active ? "" : "In-Active"
        ];
        return dataList;
    }
    let headerStructure = [
        { index: 0, label: 'ID', class:'colId', active: false, display: true, width: "10" },
        { index: 1, label: 'Accounting Method', class:'colAccountingMethod', active: true, display: true, width: "110" },
        { index: 2, label: "Transaction Ref", class: "colTransactionRef", active: true, display: true, width: "110" },
        { index: 3, label: "Transaction Type", class: "colTransactionType", active: true, display: true, width: "110" },
        { index: 4, label: "Transaction Date", class: "colTransactionDate", active: true, display: true, width: "80" },
        { index: 5, label: "Transaction Amount", class: "colAmount", active: true, display: true, width: "110" },
        { index: 6, label: "Description", class: "colDescription", active: true, display: true, width: "110" },
        { index: 7, label: "Return Period", class: "colReturnPeriod", active: true, display: true, width: "110" },
        { index: 8, label: "Return From", class: "colReturnFrom", active: true, display: true, width: "80" },
        { index: 9, label: "Return To", class: "colReturnTo", active: true, display: true, width: "80" },
        { index: 10, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.vatreturntransactionlist.onRendered(function() {
    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    // let accountService = new AccountService();
    // let salesService = new SalesBoardService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    };
    templateObject.resetData = function(dataVal) {
        location.reload();
    };

    // templateObject.getAccountsSummaryReports = function(data, transactionitem) {
    //     let datemethod = "Accrual";
    //     var startDate = "";
    //     var endDate = "";
    //     if (transactionitem == "1" || transactionitem == "1A" || transactionitem == "2" || transactionitem == "2A" ||
    //         transactionitem == "3" || transactionitem == "5" || transactionitem == "7" || transactionitem == "10" ||
    //         transactionitem == "12") {
    //         datemethod = data.Tab1_Type;
    //         startDate = data.Tab1_Year + "-" + months[data.Tab1_Month] + "-01";
    //         var endMonth = (data.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.Tab1_Month]) / 3) * 3) : (months[data.Tab1_Month]);
    //         endDate = new Date(data.Tab1_Year, (parseInt(endMonth)), 0);
    //         endDate = moment(endDate).format("YYYY-MM-DD");
    //     }
    //     if (transactionitem == "14" || transactionitem == "14A" || transactionitem == "15" || transactionitem == "15A" ||
    //         transactionitem == "16" || transactionitem == "17" || transactionitem == "18") {
    //         datemethod = data.Tab2_Type;
    //         startDate = data.Tab2_Year + "-" + months[data.Tab2_Month] + "-01";
    //         var endMonth = (data.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.Tab2_Month]) / 3) * 3) : (months[data.Tab2_Month]);
    //         endDate = new Date(data.Tab2_Year, (parseInt(endMonth)), 0);
    //         endDate = moment(endDate).format("YYYY-MM-DD");
    //     }
    //     if (transactionitem == "21" || transactionitem == "22" || transactionitem == "26" || transactionitem == "27" ||
    //         transactionitem == "30" || transactionitem == "31" || transactionitem == "34" || transactionitem == "35") {
    //         datemethod = data.Tab3_Type;
    //         startDate = data.Tab3_Year + "-" + months[data.Tab3_Month] + "-01";
    //         var endMonth = (data.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.Tab3_Month]) / 3) * 3) : (months[data.Tab3_Month]);
    //         endDate = new Date(data.Tab3_Year, (parseInt(endMonth)), 0);
    //         endDate = moment(endDate).format("YYYY-MM-DD");
    //     }
    //     if (data.Lines != null) {
    //         for (let i = 0; i < data.Lines.length; i++) {
    //             if (data.Lines[i].fields.ReportCode == transactionitem) {
    //                 var dataList = {
    //                     description: data.BasSheetDesc,
    //                     accountingMethod: data.AccMethod,
    //                     datemethod: datemethod,
    //                     dateFrom: startDate,
    //                     dateTo: endDate,
    //                     globalref: data.Lines[i].fields.TransGlobalref,
    //                     transtype: data.Lines[i].fields.Transtype,
    //                     transdate: moment(data.Lines[i].fields.TransDate).format("YYYY-MM-DD"),
    //                     amount: data.Lines[i].fields.Amount,
    //                 };
    //
    //                 dataTableList.push(dataList);
    //             }
    //         }
    //     }
    //     templateObject.datatablerecords.set(dataTableList);
    //     setTimeout(function() {
    //         $('#tblVatReturnTransactionList').DataTable({
    //             // dom: 'lBfrtip',
    //             columnDefs: [
    //                 { type: 'vatnumber', targets: 0 }
    //             ],
    //             "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //             buttons: [{
    //                 extend: 'excelHtml5',
    //                 text: '',
    //                 title: 'VAT Return Details',
    //                 download: 'open',
    //                 className: "btntabletocsv hiddenColumn",
    //                 filename: "vatreturndetails_" + moment().format(),
    //                 orientation: 'portrait',
    //                 exportOptions: {
    //                     columns: ':visible'
    //                 }
    //             }, {
    //                 extend: 'print',
    //                 download: 'open',
    //                 className: "btntabletopdf hiddenColumn",
    //                 text: '',
    //                 title: 'VAT Return List',
    //                 filename: "vatreturndetails_" + moment().format(),
    //                 exportOptions: {
    //                     columns: ':visible'
    //                 }
    //             }],
    //             select: true,
    //             destroy: true,
    //             colReorder: true,
    //             // bStateSave: true,
    //             // rowId: 0,
    //             pageLength: initialDatatableLoad,
    //             "bLengthChange": false,
    //             info: true,
    //             responsive: true,
    //             "order": [
    //                 [0, "desc"],
    //                 // [2, "desc"]
    //             ],
    //             // "aaSorting": [[1,'desc']],
    //             action: function() {
    //                 $('#tblVatReturnTransactionList').DataTable().ajax.reload();
    //             },
    //             "fnInitComplete": function() {
    //                 // this.fnPageChange('last');
    //                 // if (data.Params.Search.replace(/\s/g, "") == "") {
    //                 //     $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 8px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblBankingOverview_filter");
    //                 // } else {
    //                 //     $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 8px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblBankingOverview_filter");
    //                 // }
    //                 $("<button class='btn btn-primary btnRefreshVatReturn' type='button' id='btnRefreshVatReturn' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblVatReturnTransactionList_filter");
    //                 $('.myvarFilterForm').appendTo(".colDateFilter");
    //             },
    //             "fnInfoCallback": function(oSettings, iStart, iEnd, iMax, iTotal, sPre) {
    //                 let countTableData = data.length || 0; //get count from API data
    //
    //                 return 'Showing ' + iStart + " to " + iEnd + " of " + countTableData;
    //             }
    //
    //         }).on('page', function() {
    //             setTimeout(function() {
    //                 MakeNegative();
    //             }, 100);
    //             let draftRecord = templateObject.datatablerecords.get();
    //             templateObject.datatablerecords.set(draftRecord);
    //         }).on('column-reorder', function() {
    //
    //         });
    //     }, 1000);
    // }

    // setTimeout(function() {
    //     $(document).ready(function() {
    //         $('.fullScreenSpin').css('display', 'inline-block');
    //         var vatreturnid = FlowRouter.current().queryParams.vatreturnid;
    //         var transactionitem = FlowRouter.current().queryParams.transactionitem;
    //         if (vatreturnid) {
    //             getVS1Data('TVATReturn').then(function(dataObject) {
    //                 let userdata = JSON.parse(dataObject[0].data) || [];
    //                 userdata = userdata.tvatreturns || [];
    //                 if (userdata.length > 0) {
    //                     let data = JSON.parse(dataObject[0].data);
    //                     for (let i = 0; i < data.tvatreturn.length; i++) {
    //                         if (vatreturnid == data.tvatreturn[i].fields.ID && transactionitem != "") {
    //                             templateObject.getAccountsSummaryReports(data.tvatreturn[i].fields, transactionitem);
    //                         }
    //                     }
    //                     $('.fullScreenSpin').css('display', 'none');
    //                 } else {
    //                     reportService.getOneVATReturn(vatreturnid).then(function(data) {
    //                         if (data.tvatreturn.length > 0 && transactionitem != "") {
    //                             templateObject.getAccountsSummaryReports(data.tvatreturn[0].fields, transactionitem);
    //                         }
    //                         $('.fullScreenSpin').css('display', 'none');
    //                     })
    //                 }
    //             }).catch(function(err) {
    //                 reportService.getOneVATReturn(vatreturnid).then(function(data) {
    //                     if (data.tvatreturn.length > 0 && transactionitem != "") {
    //                         templateObject.getAccountsSummaryReports(data.tvatreturn[0].fields, transactionitem);
    //                     }
    //                     $('.fullScreenSpin').css('display', 'none');
    //                 })
    //             });
    //         }
    //     });
    // }, 500);


    // $('#tblVatReturnTransactionList tbody').on('click', 'tr', function() {
    //     var listData = $(this).closest('tr').attr('id');
    //     if (listData) {
    //         // window.open('/invoicecard?id=' + listData,'_self');
    //     }

    // });


    // $('#tblBasReturnTransactionList tbody').on('click', 'tr', function() {
    //     var listData = $(this).closest('tr').attr('id');
    //     var transactiontype = $(event.target).closest("tr").find(".transactiontype").text();

    //     if ((listData) && (transactiontype)) {
    //         if (transactiontype === 'Quote') {
    //             window.open('/quotecard?id=' + listData, '_self');
    //         } else if (transactiontype === 'Sales Order') {
    //             window.open('/salesordercard?id=' + listData, '_self');
    //         } else if (transactiontype === 'Invoice') {
    //             window.open('/invoicecard?id=' + listData, '_self');
    //         } else if (transactiontype === 'PO') {
    //             window.open('/purchaseordercard?id=' + listData, '_self');
    //         } else if (transactiontype === 'Bill') {
    //             //window.open('/billcard?id=' + listData,'_self');
    //         } else if (transactiontype === 'Credit') {
    //             //window.open('/creditcard?id=' + listData,'_self');
    //         } else if (transactiontype === 'Customer Payment') {
    //             window.open('/paymentcard?id=' + listData, '_self');
    //         } else if (transactiontype === 'Cheque') {
    //             window.open('/chequecard?id=' + listData, '_self');
    //         }

    //     }
    // });

});

Template.vatreturntransactionlist.events({
    // 'click .chkDatatable': function(event) {
    //     var columns = $('#tblVatReturnTransactionList th');
    //     let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();
    //
    //     $.each(columns, function(i, v) {
    //         let className = v.classList;
    //         let replaceClass = className[1];
    //
    //         if (v.innerText == columnDataValue) {
    //             if ($(event.target).is(':checked')) {
    //                 $("." + replaceClass + "").css('display', 'table-cell');
    //                 $("." + replaceClass + "").css('padding', '.75rem');
    //                 $("." + replaceClass + "").css('vertical-align', 'top');
    //             } else {
    //                 $("." + replaceClass + "").css('display', 'none');
    //             }
    //         }
    //     });
    // },
    // 'click .resetTable': function(event) {
    //     var getcurrentCloudDetails = CloudUser.findOne({ _id: localStorage.getItem('mycloudLogonID'), clouddatabaseID: localStorage.getItem('mycloudLogonDBID') });
    //     if (getcurrentCloudDetails) {
    //         if (getcurrentCloudDetails._id.length > 0) {
    //             var clientID = getcurrentCloudDetails._id;
    //             var clientUsername = getcurrentCloudDetails.cloudUsername;
    //             var clientEmail = getcurrentCloudDetails.cloudEmail;
    //             var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblVatReturnTransactionList' });
    //             if (checkPrefDetails) {
    //                 CloudPreference.remove({ _id: checkPrefDetails._id }, function(err, idTag) {
    //                     if (err) {
    //
    //                     } else {
    //                         Meteor._reload.reload();
    //                     }
    //                 });
    //
    //             }
    //         }
    //     }
    // },
    // 'click .saveTable': function(event) {
    //     let lineItems = [];
    //     $('.columnSettings').each(function(index) {
    //         var $tblrow = $(this);
    //         var colTitle = $tblrow.find(".divcolumn").text() || '';
    //         var colWidth = $tblrow.find(".custom-range").val() || 0;
    //         var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
    //         var colHidden = false;
    //         if ($tblrow.find(".custom-control-input").is(':checked')) {
    //             colHidden = false;
    //         } else {
    //             colHidden = true;
    //         }
    //         let lineItemObj = {
    //             index: index,
    //             label: colTitle,
    //             hidden: colHidden,
    //             width: colWidth,
    //             thclass: colthClass
    //         }
    //
    //         lineItems.push(lineItemObj);
    //     });
    //
    //     var getcurrentCloudDetails = CloudUser.findOne({ _id: localStorage.getItem('mycloudLogonID'), clouddatabaseID: localStorage.getItem('mycloudLogonDBID') });
    //     if (getcurrentCloudDetails) {
    //         if (getcurrentCloudDetails._id.length > 0) {
    //             var clientID = getcurrentCloudDetails._id;
    //             var clientUsername = getcurrentCloudDetails.cloudUsername;
    //             var clientEmail = getcurrentCloudDetails.cloudEmail;
    //             var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblVatReturnTransactionList' });
    //             if (checkPrefDetails) {
    //                 CloudPreference.update({ _id: checkPrefDetails._id }, {
    //                     $set: {
    //                         userid: clientID,
    //                         username: clientUsername,
    //                         useremail: clientEmail,
    //                         PrefGroup: 'salesform',
    //                         PrefName: 'tblVatReturnTransactionList',
    //                         published: true,
    //                         customFields: lineItems,
    //                         updatedAt: new Date()
    //                     }
    //                 }, function(err, idTag) {
    //                     if (err) {
    //                         $('#myModal2').modal('toggle');
    //                     } else {
    //                         $('#myModal2').modal('toggle');
    //                     }
    //                 });
    //
    //             } else {
    //                 CloudPreference.insert({
    //                     userid: clientID,
    //                     username: clientUsername,
    //                     useremail: clientEmail,
    //                     PrefGroup: 'salesform',
    //                     PrefName: 'tblVatReturnTransactionList',
    //                     published: true,
    //                     customFields: lineItems,
    //                     createdAt: new Date()
    //                 }, function(err, idTag) {
    //                     if (err) {
    //                         $('#myModal2').modal('toggle');
    //                     } else {
    //                         $('#myModal2').modal('toggle');
    //
    //                     }
    //                 });
    //             }
    //         }
    //     }
    //
    // },
    // 'blur .divcolumn': function(event) {
    //     let columData = $(event.target).text();
    //
    //     let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
    //     var datable = $('#tblVatReturnTransactionList').DataTable();
    //     var title = datable.column(columnDatanIndex).header();
    //     $(title).html(columData);
    //
    // },
    // 'change .rngRange': function(event) {
    //     let range = $(event.target).val();
    //     $(event.target).closest("div.divColWidth").find(".spWidth").html(range + 'px');
    //
    //     let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
    //     let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
    //     var datable = $('#tblVatReturnTransactionList th');
    //     $.each(datable, function(i, v) {
    //
    //         if (v.innerText == columnDataValue) {
    //             let className = v.className;
    //             let replaceClass = className.replace(/ /g, ".");
    //             $("." + replaceClass + "").css('width', range + 'px');
    //
    //         }
    //     });
    //
    // },
    // 'click .btnOpenSettings': function(event) {
    //     let templateObject = Template.instance();
    //     var columns = $('#tblVatReturnTransactionList th');
    //
    //     const tableHeaderList = [];
    //     let sTible = "";
    //     let sWidth = "";
    //     let sIndex = "";
    //     let sVisible = "";
    //     let columVisible = false;
    //     let sClass = "";
    //     $.each(columns, function(i, v) {
    //         if (v.hidden == false) {
    //             columVisible = true;
    //         }
    //         if ((v.className.includes("hiddenColumn"))) {
    //             columVisible = false;
    //         }
    //         sWidth = v.style.width.replace('px', "");
    //
    //         let datatablerecordObj = {
    //             sTitle: v.innerText || '',
    //             sWidth: sWidth || '',
    //             sIndex: v.id || '',
    //             sVisible: columVisible || false,
    //             sClass: v.className || ''
    //         };
    //         tableHeaderList.push(datatablerecordObj);
    //     });
    //     templateObject.tableheaderrecords.set(tableHeaderList);
    // },
    'click #exportbtn': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblVatReturnTransactionList_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblVatReturnTransactionList_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click .btnRefresh': function() {
        // $('.fullScreenSpin').css('display', 'inline-block');
        // //localStorage.setItem('VS1BalanceTrans_Report', '');
        // Meteor._reload.reload();

        $('.fullScreenSpin').css('display', 'inline-block');
        let currentDate = new Date();
        let hours = currentDate.getHours(); //returns 0-23
        let minutes = currentDate.getMinutes(); //returns 0-59
        let seconds = currentDate.getSeconds(); //returns 0-59
        let month = (currentDate.getMonth() + 1);
        let days = currentDate.getDate();

        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        }else{
            fromDateMonth = (currentBeginDate.getMonth()+1);
        }

        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDate = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");
        // sideBarService.getAllExpenseCliamExDataVS1().then(function(expenseData) {
        reportService.getAllVATReturn(prevMonth11Date, toDate, true, initialReportLoad,0, false).then(function (expenseData) {
            addVS1Data('TVATReturn', JSON.stringify(expenseData)).then(function (datareturn) {
                window.open('/vatreturntransactionlist', '_self');
            }).catch(function (err) {
                setTimeout(() => {
                    window.open('/vatreturntransactionlist', '_self');
                }, 200);
            });
        }).catch(function (err) {
            setTimeout(() => {
                window.open('/vatreturntransactionlist', '_self');
            }, 200);
        });
    },
    'click .btnRefreshTrans': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        //localStorage.setItem('VS1BalanceTrans_Report', '');
        Meteor._reload.reload();
    },
    'keyup #tblVatReturnTransactionList_filter input': function(event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshTrans").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshTrans").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshTrans").trigger("click");
        }
    }
});

Template.vatreturntransactionlist.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get();
        // return Template.instance().datatablerecords.get().sort(function(a, b) {
        //     if (a.type == 'NA') {
        //         return 1;
        //     } else if (b.type == 'NA') {
        //         return -1;
        //     }
        //     return (a.type.toUpperCase() > b.type.toUpperCase()) ? 1 : -1;
        // });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: localStorage.getItem('mycloudLogonID'), PrefName: 'tblVatReturnTransactionList' });
    },

    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    apiFunction:function() {
        let reportService = new ReportService();
        return reportService.getAllVATReturn;
    },

    searchAPI: function() {
        let reportService = new ReportService();
        return reportService.getVATReturnByDescription;
    },

    service: ()=>{
        let reportService = new ReportService();
        return reportService;
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
        return ['dateFrom', 'dateTo', 'ignoredate', 'limitCount', 'limitFrom', 'deleteFilter'];
    },
});