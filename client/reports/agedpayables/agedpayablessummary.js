import {ReportService} from "../report-service";
import 'jQuery.print/jQuery.print.js';
import {UtilityService} from "../../utility-service";
import { SideBarService } from "../../js/sidebar-service";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import GlobalFunctions from "../../GlobalFunctions";
import Datehandler from "../../DateHandler";
import TemplateInjector from "../../TemplateInjector";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import { Template } from 'meteor/templating';
import './agedpayablessummary.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

const reportService = new ReportService();
const utilityService = new UtilityService();
const taxRateService = new TaxRateService();
const sideBarService = new SideBarService();

let defaultCurrencyCode = CountryAbbr;

Template.agedpayablessummary.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.displaysettings = new ReactiveVar([]);

  FxGlobalFunctions.initVars(templateObject);
  let reset_data = [
    { index: 0, label: 'ID', class: 'colID', active: false, display: true, width: "150", calc: false},
    { index: 1, label: 'Contact', class: 'colName', active: true, display: true, width: "150", calc: false},
    { index: 2, label: 'PO No.', class: 'colPONumber', active: true, display: true, width: "150", calc: false},
    { index: 3, label: 'Due Date', class: 'colDueDate', active: true, display: true, width: "150", calc: false},
    { index: 4, label: 'Total Amount Due', class: 'colAmountDue text-right', active: true, display: true, width: "170", calc: true},
    { index: 5, label: 'Current', class: 'colCurrent text-right', active: true, display: true, width: "150", calc: true},
    { index: 6, label: '1 - 30 Days', class: 'col130Days text-right', active: true, display: true, width: "150", calc: true},
    { index: 7, label: '30 - 60 Days', class: 'col3060Days text-right', active: true, display: true, width: "150", calc: true},
    { index: 8, label: '60 - 90 Days', class: 'col6090Days text-right', active: true, display: true, width: "150", calc: true},
    { index: 9, label: '> 90 Days', class: 'col90Days text-right', active: true, display: true, width: "150", calc: true},
  ]
  templateObject.displaysettings.set(reset_data);
  templateObject.getReportDataRecord = function(data) {
    var dataList = [];
    if(data!='') {
      dataList =  [
        data.Name || "",
        data.PONumber || "",
        GlobalFunctions.formatDate(data.dueDate) || "",
        data.AmountDue || 0,
        data.Current || 0,
        data["30Days"] || 0,
        data["60Days"] || 0,
        data["90Days"] || 0,
        data["120Days"] || 0,
      ];
      for(let i = 0 ; i < dataList.length; i ++){
        if(i > 2)    dataList[i] = GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(dataList[i]), dataList[i] < 0 ? "text-danger" : "text-primary");
        else         dataList[i] = GlobalFunctions.generateSpan(dataList[i], "text-primary");
      }
    }else {
      dataList = [
        "", "", "", "", "", "", "", "", "",
      ]
    }
    return dataList;
  }
});
Template.agedpayablessummary.onRendered(() =>{});
/*
Template.agedpayablessummary.onRendered(() => {
  const templateObject = Template.instance();
  LoadingOverlay.show();

  templateObject.init_reset_data = function () {
    let reset_data = [];
    reset_data = [
      { index: 1, label: 'Contact', class: 'colName', active: true, display: true, width: "150" },
      { index: 2, label: 'PO No.', class: 'colPONumber', active: true, display: true, width: "150" },
      { index: 3, label: 'Due Date', class: 'colDueDate', active: true, display: true, width: "150" },
      { index: 4, label: 'Total Amount Due', class: 'colAmountDue text-right', active: true, display: true, width: "170" },
      { index: 5, label: 'Current', class: 'colCurrent text-right', active: true, display: true, width: "150" },
      { index: 6, label: '1 - 30 Days', class: 'col130Days text-right', active: true, display: true, width: "150" },
      { index: 7, label: '30 - 60 Days', class: 'col3060Days text-right', active: true, display: true, width: "150" },
      { index: 8, label: '60 - 90 Days', class: 'col6090Days text-right', active: true, display: true, width: "150" },
      { index: 9, label: '> 90 Days', class: 'col90Days text-right', active: true, display: true, width: "150" },
    ];
    templateObject.agedpayablesth.set(reset_data);
  }
  templateObject.init_reset_data();

  // await reportService.getBalanceSheetReport(dateAOsf) :

  // --------------------------------------------------------------------------------------------------
  templateObject.initDate = () => {
    Datehandler.initOneMonth();
  };
  templateObject.setDateAs = (dateFrom = null) => {
    templateObject.dateAsAt.set((dateFrom) ? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"))
  };
  templateObject.initDate();

  // let date = new Date();
  // templateObject.currentYear.set(date.getFullYear());
  // templateObject.nextYear.set(date.getFullYear() + 1);
  // let currentMonth = moment(date).format("DD/MM/YYYY");
  // templateObject.currentMonth.set(currentMonth);

  // templateObject.setDateAs(GlobalFunctions.convertYearMonthDay($('#dateFrom').val()));

    let currenctURL = FlowRouter.current().queryParams || '';
    let contactName = FlowRouter.current().queryParams.contact ||'';
    let contactID = FlowRouter.current().queryParams.contactid ||'';
  templateObject.loadReport = async (dateFrom = null, dateTo = null, ignoreDate = false) => {

    templateObject.setDateAs(dateFrom);
    LoadingOverlay.show();
    let data = await CachedHttp.get(erpObject.TAPReport, async () => {
      return await reportService.getAgedPayableDetailsSummaryData(dateFrom, dateTo, ignoreDate, contactID);
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      validate: (cachedResponse) => {
        return false;
      }
    });
    templateObject.displayAgedPayablesData(data.response);

  }
  templateObject.getAgedPayablesData = async function (dateFrom, dateTo, ignoreDate, contactID) {

    templateObject.setDateAs(dateFrom);
    getVS1Data('TAPReport').then(function (dataObject) {
      if (dataObject.length == 0) {
        reportService.getAgedPayableDetailsSummaryData(dateFrom, dateTo, ignoreDate,contactID).then(async function (data) {
          await addVS1Data('TAPReport', JSON.stringify(data));
          templateObject.displayAgedPayablesData(data);
        }).catch(function (err) {
        });
      } else {
        let data = JSON.parse(dataObject[0].data);
        templateObject.displayAgedPayablesData(data);
      }
    }).catch(function (err) {
      reportService.getAgedPayableDetailsSummaryData(dateFrom, dateTo, ignoreDate,contactID).then(async function (data) {
        await addVS1Data('TAPReport', JSON.stringify(data));
        templateObject.displayAgedPayablesData(data);
      }).catch(function (err) {

      });
    });
  }

  templateObject.getAgedPayablesData(
    GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
    GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
    false
  );
  templateObject.displayAgedPayablesData = async function (data) {
    var splashArrayAgedPayablesReport = new Array();
    let deleteFilter = false;
    if (data.Params.Search.replace(/\s/g, "") == "") {
      deleteFilter = true;
    } else {
      deleteFilter = false;
    };
    let sum =  new Array(), total = new Array();
    let contact, j;
    for(j = 0 ; j < 6; j ++)  total[j] = 0;
    for (let i = 0; i < data.tapreport.length; i++) {
      var dataList = [
        data.tapreport[i].Name || "",
        data.tapreport[i].PONumber || "",
        GlobalFunctions.formatDate(data.tapreport[i].DueDate) || "",
        data.tapreport[i].AmountDue || "",
        data.tapreport[i].Current || "",
        data.tapreport[i]["30Days"] || "",
        data.tapreport[i]["60Days"] || "",
        data.tapreport[i]["90Days"] || "",
        data.tapreport[i]["120Days"] || "",
      ];
      if(contact != dataList[0]){
        if(i != 0) {
          for(j = 0 ; j < 6; j ++)
            sum[j] = sum[j] >= 0 ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(sum[j]), "text-primary", "text-right") : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(sum[j]), "text-danger", "text-right");
          splashArrayAgedPayablesReport.push([
              GlobalFunctions.generateSpan(contact, "text-primary"),
              "",
              "",
              sum[0],
              sum[1],
              sum[2],
              sum[3],
              sum[4],
              sum[5],
          ]);
        }
        contact = dataList[0];
        for(j = 0 ; j < 6; j ++)
          sum[j] = 0;
      }
      for(j = 0 ; j < 6; j ++) sum[j] += dataList[3 + j] - 0, total[j] += dataList[3 + j] - 0;
    }
    for(j = 0 ; j < 6; j ++)
      total[j] =  total[j] >= 0 ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(total[j]), "table-cells text-primary", "text-right") : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(total[j]), "text-danger text-bold", "text-right");
    splashArrayAgedPayablesReport.push([
      GlobalFunctions.generateSpan("Grand Total", "table-cells text-bold"),
      "",
      "",
      total[0],
      total[1],
      total[2],
      total[3],
      total[4],
      total[5],
    ]);
    templateObject.transactiondatatablerecords.set(splashArrayAgedPayablesReport);

    if (templateObject.transactiondatatablerecords.get()) {
      setTimeout(function () {
        //MakeNegative();
      }, 100);
    }
    //$('.fullScreenSpin').css('display','none');

    setTimeout(function () {
      $('#tableExport1').DataTable({
        data: splashArrayAgedPayablesReport,
        searching: false,
        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        columnDefs: [
          {
            targets: 0,
            className: "colAccountID",
          },
          {
            targets: 1,
            className: "colAccountName"
          },
          {
            targets: 2,
            className: "colAccountNo"
          },
          {
            targets: 3,
            className: "colAccounts hiddenColumn",
          },
          {
            targets: 4,
            className: "colAmountEx hiddenColumn",
          },
          {
            targets: 5,
            className: "colAmountInc hiddenColumn",
          },
          {
            targets: 6,
            className: "colChequeNumber hiddenColumn",
          },
          {
            targets: 7,
            className: "colDepartment",
          },
          {
            targets: 8,
            className: "colClassID",
          },
          {
            targets: 9,
            className: "colProductDescription",
          },
          {
            targets: 10,
            className: "colCreditEx hiddenColumn",
          },
          {
            targets: 11,
            className: "colCreditInc hiddenColumn",
          },
          {
            targets: 12,
            className: "colDate",
          },
          {
            targets: 13,
            className: "colDebitsEx hiddenColumn",
          },
          {
            targets: 14,
            className: "colDebitsInc hiddenColumn",
          },
          {
            targets: 15,
            className: "colDetails hiddenColumn",
          },
          {
            targets: 16,
            className: "colFixedAssetID hiddenColumn",
          },
          {
            targets: 17,
            className: "colGlobalRef",
          },
          {
            targets: 18,
            className: "colID hiddenColumn",
          },
          {
            targets: 19,
            className: "colMemo hiddenColumn",
          },
          {
            targets: 20,
            className: "colPaymentID hiddenColumn",
          },
          {
            targets: 21,
            className: "colPrepaymentID hiddenColumn",
          },
          {
            targets: 22,
            className: "colCredit",
          },
          {
            targets: 23,
            className: "colProductID hiddenColumn",
          },
          {
            targets: 24,
            className: "colPurchaseOrderID",
          },
          {
            targets: 25,
            className: "colRefNo hiddenColumn",
          },
          {
            targets: 26,
            className: "colRepName",
          },
          {
            targets: 27,
            className: "colSaleID hiddenColumn",
          },
          {
            targets: 28,
            className: "colTaxCode hiddenColumn",
          },
          {
            targets: 29,
            className: "colTaxRate hiddenColumn",
          },
          {
            targets: 30,
            className: "colType",
          },
        ],
        select: true,
        destroy: true,
        colReorder: true,
        pageLength: initialDatatableLoad,
        lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
        info: true,
        responsive: true,
        "order": [[1, "asc"]],
        action: function () {
          $('#tableExport').DataTable().ajax.reload();
        },

      }).on('page', function () {
        setTimeout(function () {
          MakeNegative();
        }, 100);
      }).on('column-reorder', function () {

      }).on('length.dt', function (e, settings, len) {

        $(".fullScreenSpin").css("display", "inline-block");
        let dataLenght = settings._iDisplayLength;
        if (dataLenght == -1) {
          if (settings.fnRecordsDisplay() > initialDatatableLoad) {
            $(".fullScreenSpin").css("display", "none");
          } else {
            $(".fullScreenSpin").css("display", "none");
          }
        } else {
          $(".fullScreenSpin").css("display", "none");
        }
        setTimeout(function () {
          MakeNegative();
        }, 100);
      });
      $(".fullScreenSpin").css("display", "none");
    }, 0);

    $('div.dataTables_filter input').addClass('form-control form-control-sm');
  }


  // ------------------------------------------------------------------------------------------------------
  // $("#tblgeneralledger tbody").on("click", "tr", function () {
  //   var listData = $(this).closest("tr").children('td').eq(8).text();
  //   var checkDeleted = $(this).closest("tr").find(".colStatus").text() || "";

  //   if (listData) {
  //     if (checkDeleted == "Deleted") {
  //       swal("You Cannot View This Transaction", "Because It Has Been Deleted", "info");
  //     } else {
  //       FlowRouter.go("/journalentrycard?id=" + listData);
  //     }
  //   }
  // });


  LoadingOverlay.hide();
});
*/
// Template.agedpayablessummary.onRendered(function() {
//   LoadingOverlay.show();
//  const templateObject = Template.instance();


//  let reset_data = [
//   { index: 1, label: 'Name', class: 'colName', active: true, display: true, width: "" },
//   { index: 2, label: 'Type', class: 'colType', active: true, display: true, width: "" },
//   { index: 3, label: 'PO Number', class: 'colPONumber', active: true, display: true, width: "" },
//   { index: 4, label: 'Due Date', class: 'colDueDate', active: true, display: true, width: "" },
//   { index: 5, label: 'Amount Due', class: 'colAmountDue', active: true, display: true, width: "" },
//   { index: 6, label: 'Current', class: 'colCurrent', active: true, display: true, width: "" },
//   { index: 7, label: '1-30 Days', class: 'col130Days', active: true, display: true, width: "" },
//   { index: 8, label: '30-60 Days', class: 'col3060Days', active: true, display: true, width: "" },
//   { index: 9, label: '60-90 Days', class: 'col6090Days', active: true, display: true, width: "" },
//   { index: 10, label: '> 90 Days', class: 'col90Days', active: true, display: true, width: "" },
//   { index: 11, label: 'Order Date', class: 'colOrderDate', active: true, display: true, width: "" },
//   { index: 12, label: 'Invoice Date', class: 'colInvoiceDate', active: true, display: true, width: "" },
//   { index: 13, label: 'Original Amount', class: 'colOriginalAmount', active: true, display: true, width: "" },
//   { index: 14, label: 'Details', class: 'colDetails', active: false, display: true, width: "" },
//   { index: 15, label: 'Invoice Number', class: 'colInvoiceNumber', active: false, display: true, width: "" },
//   { index: 16, label: 'Account Name', class: 'colAccountName', active: false, display: true, width: "" },
//   { index: 17, label: 'Supplier ID', class: 'colSupplierID', active: false, display: true, width: "" },
//   { index: 18, label: 'Terms', class: 'colTerms', active: false, display: true, width: "" },
//   { index: 19, label: 'APNotes', class: 'colAPNotes', active: false, display: true, width: "" },
//   { index: 20, label: 'Print Name', class: 'colPrintName', active: false, display: true, width: "" },
//   { index: 21, label: 'PCStatus', class: 'colPCStatus', active: false, display: true, width: "" },
//   { index: 22, label: 'GlobalRef', class: 'colGlobalRef', active: false, display: true, width: "" },
//   { index: 23, label: 'POGlobalRef', class: 'colPOGlobalRef', active: false, display: true, width: "" },
// ]

// templateObject.agedpayablessummaryth.set(reset_data);
// //   let salesOrderTable;
// //   var splashArray = new Array();
// //   var today = moment().format('DD/MM/YYYY');
// //   var currentDate = new Date();
// //   var begunDate = moment(currentDate).format("DD/MM/YYYY");
// //   let fromDateMonth = (currentDate.getMonth() + 1);
// //   let fromDateDay = currentDate.getDate();
// //   if((currentDate.getMonth()+1) < 10){
// //     fromDateMonth = "0" + (currentDate.getMonth()+1);
// //   }

// //   let imageData= (localStorage.getItem("Image"));
// //   if(imageData)
// //   {
// //       $('#uploadedImage').attr('src', imageData);
// //       $('#uploadedImage').attr('width','50%');
// //   }

// //   if(currentDate.getDate() < 10){
// //     fromDateDay = "0" + currentDate.getDate();
// //   }
// //   var fromDate =fromDateDay + "/" +(fromDateMonth) + "/" + currentDate.getFullYear();


// //   templateObject.dateAsAt.set(begunDate);
// //  const dataTableList = [];
// //  const deptrecords = [];
// //   $("#date-input,#dateTo,#dateFrom").datepicker({
// //       showOn: 'button',
// //       buttonText: 'Show Date',
// //       buttonImageOnly: true,
// //       buttonImage: '/img/imgCal2.png',
// //       dateFormat: 'dd/mm/yy',
// //       showOtherMonths: true,
// //       selectOtherMonths: true,
// //       changeMonth: true,
// //       changeYear: true,
// //       yearRange: "-90:+10",
// //       onChangeMonthYear: function(year, month, inst){
// //       // Set date to picker
// //       $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
// //       // Hide (close) the picker
// //       // $(this).datepicker('hide');
// //       // // Change ttrigger the on change function
// //       // $(this).trigger('change');
// //      }
// //   });

// //    $("#dateFrom").val(fromDate);
// //    $("#dateTo").val(begunDate);

//   this.initDate = () => {
//     Datehandler.initOneMonth();
//     this.dateAsAt.set("Current Date");
//   };

//   templateObject.setDateAs = ( dateFrom = null ) => {
//     templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
//   };

//   this.initUploadedImage = () => {
//     let imageData = localStorage.getItem("Image");
//     if (imageData) {
//       $("#uploadedImage").attr("src", imageData);
//       $("#uploadedImage").attr("width", "50%");
//     }
//   };

//   let contactID = FlowRouter.current().queryParams.contactid ||'';
//   this.loadReport = async (dateFrom = null, dateTo = null, ignoreDate = false) => {

//     templateObject.setDateAs( dateFrom );
//     LoadingOverlay.show();
//     let data = await CachedHttp.get(erpObject.TAPReport, async () => {
//       return await reportService.getAgedPayableDetailsSummaryData(dateFrom, dateTo, ignoreDate, contactID);
//     }, {
//       useIndexDb: true,
//       useLocalStorage: false,
//       validate: (cachedResponse) => {
//         return false;
//       }
//     });

//     data = data.response;

//     if (data.tapreport.length) {
//      localStorage.setItem("VS1AgedPayablesSummary_Report", JSON.stringify(data) || "");
//       let records = [];
//       let reportrecords = [];
//       let allRecords = [];
//       let current = [];

//       let totalNetAssets = 0;
//       let GrandTotalLiability = 0;
//       let GrandTotalAsset = 0;
//       let incArr = [];
//       let cogsArr = [];
//       let expArr = [];
//       let accountData = data.tapreport;
//       let accountType = "";

//       if (data.Params.IgnoreDates == true) {
//         $("#dateFrom").attr("readonly", true);
//         $("#dateTo").attr("readonly", true);
//       } else {
//         $("#dateFrom").attr("readonly", false);
//         $("#dateTo").attr("readonly", false);
//         $("#dateFrom").val(
//           data.Params.DateFrom != ""
//           ? moment(data.Params.DateFrom).format("DD/MM/YYYY")
//           : data.Params.DateFrom);
//         $("#dateTo").val(
//           data.Params.DateTo != ""
//           ? moment(data.Params.DateTo).format("DD/MM/YYYY")
//           : data.Params.DateTo);
//       }

//       accountData.forEach(account => {
//         let amountdue = utilityService.modifynegativeCurrencyFormat(account.AmountDue) || 0;
//         let current = utilityService.modifynegativeCurrencyFormat(account.Current) || 0;
//         let day30 = utilityService.modifynegativeCurrencyFormat(account["30Days"]) || 0;
//         let day60 = utilityService.modifynegativeCurrencyFormat(account["60Days"]) || 0;
//         let day90 = utilityService.modifynegativeCurrencyFormat(account["90Days"]) || 0;
//         let dayabove90 = utilityService.modifynegativeCurrencyFormat(account["120Days"]) || 0;

//         let dataList = {
//           id: account.PurchaseOrderID || "",
//           contact: account.Name || "",
//           clientid: account.ClientID || "",
//           type: "",
//           invoiceno: "",
//           duedate: "",
//           amountdue: amountdue || 0.0,
//           current: current || 0.0,
//           day30: day30 || 0.0,
//           day60: day60 || 0.0,
//           day90: day90 || 0.0,
//           dayabove90: dayabove90 || 0.0
//         };

//         reportrecords.push(dataList);

//         let recordObj = {
//           Id: account.PurchaseOrderID,
//           Type: account.Type,
//           SupplierName: account.Name,
//           entries: account
//         };

//         records.push(recordObj);
//       });

//       // for (let i = 0; i < accountData.length; i++) {
//       //   let amountdue = utilityService.modifynegativeCurrencyFormat(data.tapreport[i].AmountDue) || 0;
//       //   let current = utilityService.modifynegativeCurrencyFormat(data.tapreport[i].Current) || 0;
//       //   let day30 = utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["30Days"]) || 0;
//       //   let day60 = utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["60Days"]) || 0;
//       //   let day90 = utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["90Days"]) || 0;
//       //   let dayabove90 = utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["120Days"]) || 0;
//       //   var dataList = {
//       //     id: data.tapreport[i].PurchaseOrderID || "",
//       //     contact: data.tapreport[i].Name || "",
//       //     clientid: data.tapreport[i].ClientID || "",
//       //     type: "",
//       //     invoiceno: "",
//       //     duedate: "",
//       //     amountdue: amountdue || 0.0,
//       //     current: current || 0.0,
//       //     day30: day30 || 0.0,
//       //     day60: day60 || 0.0,
//       //     day90: day90 || 0.0,
//       //     dayabove90: dayabove90 || 0.0
//       //   };

//       //   reportrecords.push(dataList);

//       //   let recordObj = {};
//       //   recordObj.Id = data.tapreport[i].PurchaseOrderID;
//       //   recordObj.type = data.tapreport[i].Type;
//       //   recordObj.SupplierName = data.tapreport[i].Name;
//       //   recordObj.dataArr = [
//       //     "", data.tapreport[i].Type,
//       //     data.tapreport[i].PurchaseOrderID,
//       //      moment(data.tapreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
//       //     data.tapreport[i].DueDate != ""
//       //       ? moment(data.tapreport[i].DueDate).format("DD/MM/YYYY")
//       //       : data.tapreport[i].DueDate,
//       //      data.tapreport[i].InvoiceNumber || '-',
//       //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i].AmountDue) || "-",
//       //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i].Current) || "-",
//       //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["30Days"]) || "-",
//       //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["60Days"]) || "-",
//       //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["90Days"]) || "-",
//       //     utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["120Days"]) || "-"

//       //
//       //   ];

//       //      if((data.tapreport[i].AmountDue != 0) || (data.tapreport[i].Current != 0)
//       //      || (data.tapreport[i]["30Days"] != 0) || (data.tapreport[i]["60Days"] != 0)
//       //    || (data.tapreport[i]["90Days"] != 0) || (data.tapreport[i]["120Days"] != 0)){
//       //   records.push(recordObj);
//       //   }
//       // }

//       reportrecords = _.sortBy(reportrecords, "contact");
//       this.reportrecords.set(reportrecords);
//       records = _.sortBy(records, "SupplierName");
//       records = _.groupBy(records, "SupplierName");

//       for (let key in records) {
//         // let obj = [{key: key}, {data: records[key]}];
//         let obj = {
//           title: key,
//           entries: records[key],
//           total: null
//         };
//         allRecords.push(obj);
//       }

//       allRecords.forEach(record => {
//         let amountduetotal = 0;
//         let Currenttotal = 0;
//         let lessTnMonth = 0;
//         let oneMonth = 0;
//         let twoMonth = 0;
//         let threeMonth = 0;
//         let Older = 0;

//         record.entries.forEach(entry => {
//           amountduetotal = amountduetotal + parseFloat(entry.entries.AmountDue);
//           Currenttotal = Currenttotal + parseFloat(entry.entries.Current);
//           oneMonth = oneMonth + parseFloat(entry.entries["30Days"]);
//           twoMonth = twoMonth + parseFloat(entry.entries["60Days"]);
//           threeMonth = threeMonth + parseFloat(entry.entries["90Days"]);
//           Older = Older + parseFloat(entry.entries["120Days"]);
//         });

//         record.total = {
//           // new
//           Title: "Total " + record.title,
//           TotalAmountDue: amountduetotal,
//           TotalCurrent: Currenttotal,
//           OneMonth: oneMonth,
//           TwoMonth: twoMonth,
//           ThreeMonth: threeMonth,
//           OlderMonth: Older
//         };

//         // Used for grand total later
//         current.push(record.total);
//       });

//       //    let iterator = 0;
//       //  for (let i = 0; i < allRecords.length; i++) {
//       //      let amountduetotal = 0;
//       //      let Currenttotal = 0;
//       //      let lessTnMonth = 0;
//       //      let oneMonth = 0;
//       //      let twoMonth = 0;
//       //      let threeMonth = 0;
//       //      let Older = 0;
//       //      const currencyLength = Currency.length;
//       //      for (let k = 0; k < allRecords[i][1].data.length; k++) {
//       //          amountduetotal = amountduetotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[4]);
//       //          Currenttotal = Currenttotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
//       //          oneMonth = oneMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
//       //          twoMonth = twoMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
//       //          threeMonth = threeMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);
//       //          Older = Older + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[9]);
//       //      }
//       //      let val = [allRecords[i][0].key+'', '', '', '',
//       //      utilityService.modifynegativeCurrencyFormat(amountduetotal),
//       //      utilityService.modifynegativeCurrencyFormat(Currenttotal),
//       //          utilityService.modifynegativeCurrencyFormat(oneMonth),
//       //      utilityService.modifynegativeCurrencyFormat(twoMonth),
//       //      utilityService.modifynegativeCurrencyFormat(threeMonth),
//       //      utilityService.modifynegativeCurrencyFormat(Older)];

//       //      current.push(val);

//       //  }

//       //grandtotalRecord
//       let grandamountduetotal = 0;
//       let grandCurrenttotal = 0;
//       let grandlessTnMonth = 0;
//       let grandoneMonth = 0;
//       let grandtwoMonth = 0;
//       let grandthreeMonth = 0;
//       let grandOlder = 0;

//       current.forEach(total => {
//         grandamountduetotal = grandamountduetotal + parseFloat(total.TotalAmountDue);
//         grandCurrenttotal = grandCurrenttotal + parseFloat(total.TotalCurrent);
//         // grandlessTnMonth = grandlessTnMonth + utilityService.convertSubstringParseFloat(current[n][5]);
//         grandoneMonth = grandoneMonth + parseFloat(total.OneMonth);
//         grandtwoMonth = grandtwoMonth + parseFloat(total.TwoMonth);
//         grandthreeMonth = grandthreeMonth + parseFloat(total.ThreeMonth);
//         grandOlder = grandOlder + parseFloat(total.OlderMonth);
//       });
//       // for (let n = 0; n < current.length; n++) {

//       //     const grandcurrencyLength = Currency.length;

//       //     for (let m = 0; m < current[n].data.length; m++) {
//       //           grandamountduetotal = grandamountduetotal + utilityService.convertSubstringParseFloat(current[n][4]);
//       //           grandCurrenttotal = grandCurrenttotal + utilityService.convertSubstringParseFloat(current[n][5]);
//       //          grandlessTnMonth = grandlessTnMonth + utilityService.convertSubstringParseFloat(current[n][5]);
//       //           grandoneMonth = grandoneMonth + utilityService.convertSubstringParseFloat(current[n][6]);
//       //           grandtwoMonth = grandtwoMonth + utilityService.convertSubstringParseFloat(current[n][7]);
//       //           grandthreeMonth = grandthreeMonth + utilityService.convertSubstringParseFloat(current[n][8]);
//       //           grandOlder = grandOlder + utilityService.convertSubstringParseFloat(current[n][9]);
//       //     }
//       //      let val = ['Total ' + allRecords[i][0].key+'', '', '', '', utilityService.modifynegativeCurrencyFormat(Currenttotal), utilityService.modifynegativeCurrencyFormat(lessTnMonth),
//       //          utilityService.modifynegativeCurrencyFormat(oneMonth), utilityService.modifynegativeCurrencyFormat(twoMonth), utilityService.modifynegativeCurrencyFormat(threeMonth), utilityService.modifynegativeCurrencyFormat(Older)];
//       //      current.push(val);

//       // }

//       // let grandval = ['Grand Total ', '', '','',
//       // utilityService.modifynegativeCurrencyFormat(grandamountduetotal),
//       //  utilityService.modifynegativeCurrencyFormat(grandamountduetotal),
//       // utilityService.modifynegativeCurrencyFormat(grandCurrenttotal),
//       //     utilityService.modifynegativeCurrencyFormat(grandoneMonth),
//       //     utilityService.modifynegativeCurrencyFormat(grandtwoMonth),
//       //     utilityService.modifynegativeCurrencyFormat(grandthreeMonth),
//       //     utilityService.modifynegativeCurrencyFormat(grandOlder)];

//       let grandValObj = {
//         Title: "Grand Total ",
//         TotalAmountDue: grandamountduetotal,
//         TotalCurrent: grandCurrenttotal,
//         OneMonth: grandoneMonth,
//         TwoMonth: grandtwoMonth,
//         ThreeMonth: grandthreeMonth,
//         OlderMonth: grandOlder
//       };

//       //  for (let key in records) {
//       //      let dataArr = current[iterator]
//       //      let obj = [{key: key}, {data: records[key]},{total:[{dataArr:dataArr}]}];
//       //      totalRecord.push(obj);
//       //      iterator += 1;
//       //  }

//       this.records.set(allRecords);
//       this.grandrecords.set(grandValObj);

//       if (this.records.get()) {
//         setTimeout(function () {
//           $("td a").each(function () {
//             if ($(this).text().indexOf("-" + Currency) >= 0)
//               $(this).addClass("text-danger");
//             }
//           );
//           $("td").each(function () {
//             if ($(this).text().indexOf("-" + Currency) >= 0)
//               $(this).addClass("text-danger");
//             }
//           );

//           $("td").each(function () {
//             let lineValue = $(this).first().text()[0];
//             if (lineValue != undefined) {
//               if (lineValue.indexOf(Currency) >= 0)
//                 $(this).addClass("text-right");
//               }
//             });

//           $("td").each(function () {
//             if ($(this).first().text().indexOf("-" + Currency) >= 0)
//               $(this).addClass("text-right");
//             }
//           );

//         }, 100);
//       }
//     } else {
//       this.records.set([]);
//       this.reportrecords.set([]);
//       this.grandrecords.set(null);
//     }


//     LoadingOverlay.hide();
//   };

//     // var currentDate2 = new Date();
//     // var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
//     // let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + currentDate2.getDate();
//     //templateObject.getAgedPayableReports(getDateFrom,getLoadDate,false);
//     // $('.ignoreDate').trigger('click');
//     // templateObject.getDepartments = function(){


//     //   reportService.getDepartment().then(function(data){
//     //     for(let i in data.tdeptclass){

//     //       let deptrecordObj = {
//     //         id: data.tdeptclass[i].Id || ' ',
//     //         department: data.tdeptclass[i].DeptClassName || ' ',
//     //       };

//     //       deptrecords.push(deptrecordObj);
//     //       templateObject.departments.set(deptrecords);

//     //     }
//     // });

//     // }
//     // templateObject.getAllProductData();


//     this.initDate();
//     this.initUploadedImage();
//     this.loadReport(
//       GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//       GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//       false
//     );
//     this.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )
//     TemplateInjector.addDepartments(this);

// });

Template.agedpayablessummary.events({

});

Template.agedpayablessummary.helpers({
  displaysettings: ()=> {
    return Template.instance().displaysettings.get()
  },

  datahandler: () => {
    let templateObject = Template.instance();
    return function (data) {
      let returnvalue = templateObject.getReportDataRecord(data);
      return returnvalue
    }
  },

  apiFunction: function() {
    return reportService.getAgedPayableDetailsSummaryData;
  },

  listParams: function() {
    return ['limitCount', 'limitFrom', 'dateFrom', 'dateTo', 'ignoreDate']
  },

  service: function () {
    return reportService
  },

  searchFunction: function () {
    return reportService.getAgedPayableDetailsSummaryDataByKeyword;
  },
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});

Template.registerHelper("notEquals", function (a, b) {
  return a != b;
});

Template.registerHelper("containsequals", function (a, b) {
  return a.indexOf(b) >= 0;
});
