import { ReportService } from "../report-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import { TaxRateService } from "../../settings/settings-service";
import LoadingOverlay from "../../LoadingOverlay";
import GlobalFunctions from "../../GlobalFunctions";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";
import Datehandler from "../../DateHandler";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import { template } from "lodash";
import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './trialbalance.html';
import moment from "moment";

let _ = require('lodash');
let defaultCurrencyCode = CountryAbbr; // global variable "AUD"

let reportService = new ReportService();
let utilityService = new UtilityService();
let taxRateService = new TaxRateService();
const currentDate = new Date();

Template.trialbalance.inheritsHelpersFrom('vs1_report_template');
Template.trialbalance.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.displaysettings = new ReactiveVar([]);

  let reset_data = [
    { index: 0, label: 'ID', class:'colLineId', active: false, display: true, width: "10", calc: false},
    { index: 1, label: 'Account Name', class:'colAccountName', active: true, display: true, width: "41", calc: false },
    { index: 2, label: 'Account No', class:'colAccountNo', active: true, display: true, width: "15", calc: false },
    { index: 3, label: 'Account', class:'colAccount', active: true, display: true, width: "15", calc: false },
    { index: 4, label: 'Credits (Ex)', class:'colCreditsEx text-center0', active: true, display: true, width: "15", calc: true },
    { index: 5, label: 'Debits (Ex)', class:'colDebitsEx text-center0', active: true, display: true, width: "14", calc: true },
  ]
  templateObject.displaysettings.set(reset_data);
  templateObject.getReportDataRecord = function(data) {
    var dataList = [];
    if(data!='') {
      dataList =  [
        data.AccountName || "",
        data.AccountNumber || "",
        data.Account || "",
        data.CreditsEx || 0,
        data.DebitsEx || 0,
      ];
    }else {
      dataList = [
        "", "", "", 0, 0,
      ]
    }
    return dataList;
  }
});
/*
Template.trialbalance.onRendered(() => {
  const templateObject = Template.instance();
  LoadingOverlay.show();

  templateObject.init_reset_data = function () {
    let reset_data = [];
    reset_data = [
      { index: 0, label: '#', class:'colLineId', active: false, display: true, width: "10", calc: false},
      { index: 1, label: 'Account Name', class:'colAccountName', active: true, display: true, width: "41", calc: false },
      { index: 2, label: 'Account No', class:'colAccountNo', active: true, display: true, width: "15", calc: false },
      { index: 3, label: 'Account', class:'colAccount', active: true, display: true, width: "15", calc: false },
      { index: 4, label: 'Credits (Ex)', class:'colCreditsEx text-center0', active: true, display: true, width: "15", calc: true },
      { index: 5, label: 'Debits (Ex)', class:'colDebitsEx text-center0', active: true, display: true, width: "14", calc: true },
    ];
    templateObject.trialbalanceth.set(reset_data);
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

  templateObject.getTrialBalanceData = async function (dateFrom, dateTo, ignoreDate) {

    templateObject.setDateAs(dateTo);
    getVS1Data('TTrialBalanceReport').then(function (dataObject) {
      if (dataObject.length == 0) {
        reportService.getTrialBalanceDetailsData(dateFrom, dateTo, ignoreDate).then(async function (data) {
          await addVS1Data('TTrialBalanceReport', JSON.stringify(data));
          templateObject.displayTrialBalanceData(data);
        }).catch(function (err) {
        });
      } else {
        let data = JSON.parse(dataObject[0].data);
        templateObject.displayTrialBalanceData(data);
      }
    }).catch(function (err) {
      reportService.getTrialBalanceDetailsData(dateFrom, dateTo, ignoreDate).then(async function (data) {
        await addVS1Data('TTrialBalanceReport', JSON.stringify(data));
        templateObject.displayTrialBalanceData(data);
      }).catch(function (err) {

      });
    });
  }

  templateObject.getTrialBalanceData(
      GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
      GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
      false
  );
  templateObject.displayTrialBalanceData = async function (data) {
    var splashArrayTrialBalanceReport = new Array();
    let deleteFilter = false;
    if (data.Params.Search.replace(/\s/g, "") == "") {
      deleteFilter = true;
    } else {
      deleteFilter = false;
    };

    for (let i = 0; i < data.ttrialbalancereport.length; i++) {
      var dataList = [
        // data.ttrialbalancereport[i].ID || "",
        data.ttrialbalancereport[i].AccountName || "",
        data.ttrialbalancereport[i].AccountNumber || "",
        data.ttrialbalancereport[i].Account || "",
        // data.ttrialbalancereport[i].AccountNameOnly || "",
        data.ttrialbalancereport[i].CreditsEx || "",
        // data.ttrialbalancereport[i].CreditsInc || "",
        data.ttrialbalancereport[i].DebitsEx || "",
        // data.ttrialbalancereport[i].DebitsInc || "",
        // data.ttrialbalancereport[i].SortID || "",
        // data.ttrialbalancereport[i].SortOrder || "",
        // data.ttrialbalancereport[i].TransID || "",
      ];
      splashArrayTrialBalanceReport.push(dataList);
    }


    let start = splashArrayTrialBalanceReport[0][0], credit = 0, debit = 0, creditSum = 0, debitSum = 0;
    let T_AccountName = splashArrayTrialBalanceReport[0][0];
    let trialBalanceReport = [];
    let symDollar = '$';
    trialBalanceReport.push([
        GlobalFunctions.generateSpan(T_AccountName, "table-cells text-bold"),
      "",
      "",
      "",
      ""
    ]);

    for(let i = 0 ; i < splashArrayTrialBalanceReport.length ; i ++){
      if(start != splashArrayTrialBalanceReport[i][0]) {
        creditSum += (credit - 0), debitSum += (debit - 0);
        start = splashArrayTrialBalanceReport[i][0];
        credit = credit >= 0 ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(credit), "table-cells text-lbold", "text-right") : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(credit), "table-danger text-bold", "text-right");
        debit = debit >= 0 ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(debit), "table-cells text-lbold", "text-right") : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(debit), "table-danger text-bold", "text-right");
        trialBalanceReport.push([
          GlobalFunctions.generateSpan(`Total ${T_AccountName}`, "table-cells text-lbold"),
          "",
          "",
          credit,
          debit,
        ]);
        trialBalanceReport.push([
          GlobalFunctions.generateSpan(splashArrayTrialBalanceReport[i][0], "table-cells text-bold"),
          "",
          "",
          "",
          ""
        ]);
        credit = 0, debit = 0;
      }
      T_AccountName = splashArrayTrialBalanceReport[i][0];
      splashArrayTrialBalanceReport[i][0] = "";
      splashArrayTrialBalanceReport[i][1] = GlobalFunctions.generateSpan(splashArrayTrialBalanceReport[i][1], "text-primary");
      splashArrayTrialBalanceReport[i][2] = GlobalFunctions.generateSpan(splashArrayTrialBalanceReport[i][2], "text-primary");

      let tmp;
      tmp = splashArrayTrialBalanceReport[i][3] - 0;
      credit += tmp;
      splashArrayTrialBalanceReport[i][3] = (tmp >= 0) ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(tmp), "text-primary", "text-right") : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(tmp), "text-danger", "text-right");

      tmp = splashArrayTrialBalanceReport[i][4] - 0;
      debit += tmp;
      splashArrayTrialBalanceReport[i][4] = (tmp >= 0) ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(tmp), "text-primary", "text-right") : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(tmp), "text-danger", "text-right");
      trialBalanceReport.push(splashArrayTrialBalanceReport[i]);
    }
    trialBalanceReport.push([
      GlobalFunctions.generateSpan(`Total ${T_AccountName}`, "table-cells text-bold"),
      "",
      "",
      credit >= 0 ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(credit), "table-cells text-bold", "text-right") : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(credit), "table-danger text-bold", "text-right"),
      debit >= 0 ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(debit), "table-cells text-bold", "text-right") : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(debit), "table-danger text-bold", "text-right"),
    ]);
    creditSum += (credit - 0), debitSum += (debit - 0);
    trialBalanceReport.push([
      GlobalFunctions.generateSpan(`Grand Total`, "table-cells text-bold"),
      "",
      "",
      creditSum >= 0 ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(creditSum), "table-cells text-bold", "text-right") : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(creditSum), "table-danger text-bold", "text-right"),
      debitSum >= 0 ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(debitSum), "table-cells text-bold", "text-right") : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(debitSum), "table-danger text-bold", "text-right"),
    ]);
    templateObject.transactiondatatablerecords.set(trialBalanceReport);
    setTimeout(function () {
      $('#trialbalance').DataTable({
        data: trialBalanceReport,
        searching: false,
        "bSort" : false,
        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        columnDefs: [
          {
            targets: 0,
            className: "colAccountName",
          },
          {
            targets: 1,
            className: "colAccountNo",
          },
          {
            targets: 2,
            className: "colAccount"
          },
          {
            targets: 3,
            className: "colCreditsEx text-center0"
          },
          {
            targets: 4,
            className: "colDebitsEx text-center0",
          },
          // {
          //   targets: 5,
          //   className: "colCreditsEx",
          // },
          // {
          //   targets: 6,
          //   className: "colCreditsInc",
          // },
          // {
          //   targets: 7,
          //   className: "colDebitsEx",
          // },
          // {
          //   targets: 8,
          //   className: "colDebitsInc",
          // },
          // {
          //   targets: 9,
          //   className: "colSortID hiddenColumn",
          // },
          // {
          //   targets: 10,
          //   className: "colSortOrder hiddenColumn",
          // },
          // {
          //   targets: 11,
          //   className: "colTransID hiddenColumn",
          // },
        ],
        select: true,
        destroy: true,
        colReorder: true,
        pageLength: initialDatatableLoad,
        lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
        info: true,
        // responsive: true,
        // "order": [[1, "asc"]],
        action: function () {
          $('#' + currenttablename).DataTable().ajax.reload();
        },

      }).on('page', function () {
        setTimeout(function () {
          // MakeNegative();
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
// Template.trialbalance.onRendered(() => {
//   LoadingOverlay.show();
//   const templateObject = Template.instance();

//   let reset_data = [
//     { index: 1, label: 'Account Name', class:'colAccountName', active: true, display: true, width: "250" },
//     { index: 2, label: 'Account Number', class:'colAccountNo', active: true, display: true, width: "150" },
//     { index: 3, label: 'Account', class:'colAccount', active: true, display: true, width: "150" },
//     { index: 4, label: 'Credits (Ex)', class:'colCreditsEx', active: true, display: true, width: "120" },
//     { index: 5, label: 'Credits (Inc)', class:'colCreditsInc', active: true, display: true, width: "120" },
//     { index: 6, label: 'Debits (Ex)', class:'colDebitsEx', active: true, display: true, width: "120" },
//     { index: 7, label: 'Debits (Inc)', class:'colDebitsInc', active: true, display: true, width: "120" },
//     { index: 8, label: 'Account Name Only', class:'colAccountNameOnly', active: false, display: true, width: "150" },
//     { index: 9, label: 'TransID', class:'colTransID', active: false, display: true, width: "80" },
//   ]
//   templateObject.trialbalanceth.set(reset_data);
//   templateObject.initDate = () => {
//     Datehandler.initOneMonth();

//   };

//   templateObject.initDate();

//   templateObject.setDateAs = ( dateFrom = null ) => {
//     templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
//   };


//   // let salesOrderTable;
//   // var splashArray = new Array();
//   // var today = moment().format("DD/MM/YYYY");
//   // var currentDate = new Date();
//   // var begunDate = moment(currentDate).format("DD/MM/YYYY");
//   // let fromDateMonth = currentDate.getMonth() + 1;
//   // let fromDateDay = currentDate.getDate();
//   // if (currentDate.getMonth() + 1 < 10) {
//   //   fromDateMonth = "0" + (currentDate.getMonth() + 1);
//   // }

//   // templateObject.initUploadedImage = () => {
//   //   let imageData = localStorage.getItem("Image");
//   //   if (imageData) {
//   //     $("#uploadedImage").attr("src", imageData);
//   //     $("#uploadedImage").attr("width", "50%");
//   //   }
//   // };
//   // let imageData = localStorage.getItem("Image");
//   // if (imageData) {
//   //   $("#uploadedImage").attr("src", imageData);
//   //   $("#uploadedImage").attr("width", "50%");
//   // }

//   // if (currentDate.getDate() < 10) {
//   //   fromDateDay = "0" + currentDate.getDate();
//   // }
//   // // let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + ;
//   // var fromDate =
//   //   fromDateDay + "/" + fromDateMonth + "/" + currentDate.getFullYear();
//   // templateObject.dateAsAt.set(begunDate);
//   // const dataTableList = [];
//   // const deptrecords = [];
//   // $("#date-input,#dateTo,#dateFrom").datepicker({
//   //   showOn: "button",
//   //   buttonText: "Show Date",
//   //   buttonImageOnly: true,
//   //   buttonImage: "/img/imgCal2.png",
//   //   dateFormat: "dd/mm/yy",
//   //   showOtherMonths: true,
//   //   selectOtherMonths: true,
//   //   changeMonth: true,
//   //   changeYear: true,
//   //   yearRange: "-90:+10",
//   //   onChangeMonthYear: function (year, month, inst) {
//   //     // Set date to picker
//   //     $(this).datepicker(
//   //       "setDate",
//   //       new Date(year, inst.selectedMonth, inst.selectedDay)
//   //     );
//   //     // Hide (close) the picker
//   //     // $(this).datepicker('hide');
//   //     // // Change ttrigger the on change function
//   //     // $(this).trigger('change');
//   //   },
//   // });

//   // $("#dateFrom").val(fromDate);
//   // $("#dateTo").val(begunDate);
//   templateObject.setReportOptions = async function ( ignoreDate = true, formatDateFrom = new Date(),  formatDateTo = new Date() ) {
//     let defaultOptions = templateObject.reportOptions.get();
//     if (defaultOptions) {
//       defaultOptions.fromDate = formatDateFrom;
//       defaultOptions.toDate = formatDateTo;
//       defaultOptions.ignoreDate = ignoreDate;
//     } else {
//       defaultOptions = {
//         fromDate: moment().subtract(1, "months").format("YYYY-MM-DD"),
//         toDate: moment().format("YYYY-MM-DD"),
//         ignoreDate: true
//       };
//     }
//     templateObject.dateAsAt.set(moment(defaultOptions.fromDate).format('DD/MM/YYYY'));
//     $('.edtReportDates').attr('disabled', false)
//     if( ignoreDate == true ){
//       $('.edtReportDates').attr('disabled', true);
//       templateObject.dateAsAt.set("Current Date");
//     }
//     $("#dateFrom").val(moment(defaultOptions.fromDate).format('DD/MM/YYYY'));
//     $("#dateTo").val(moment(defaultOptions.toDate).format('DD/MM/YYYY'));
//     await templateObject.reportOptions.set(defaultOptions);
//     await templateObject.getTrialBalanceReports(defaultOptions.fromDate, defaultOptions.toDate, defaultOptions.ignoreDate);
//   };
//   // templateObject.setReportOptions();


//   /**
//    * @deprecated since 23 september 2022
//    * use loadReport instead
//    */
//   templateObject.getTrialBalanceReports = function (
//     dateFrom,
//     dateTo,
//     ignoreDate
//   ) {
//     if (!localStorage.getItem("VS1TrialBalance_Report")) {
//       reportService
//         .getTrialBalanceDetailsData(dateFrom, dateTo, ignoreDate)
//         .then(function (data) {
//           let totalRecord = [];
//           let grandtotalRecord = [];

//           if (data.ttrialbalancereport.length) {
//             localStorage.setItem(
//               "VS1TrialBalance_Report",
//               JSON.stringify(data) || ""
//             );
//             let records = [];
//             let allRecords = [];
//             let current = [];

//             let totalNetAssets = 0;
//             let GrandTotalLiability = 0;
//             let GrandTotalAsset = 0;
//             let incArr = [];
//             let cogsArr = [];
//             let expArr = [];
//             let accountData = data.ttrialbalancereport;
//             let accountType = "";

//             for (let i = 0; i < accountData.length; i++) {
//               let recordObj = {};
//               recordObj.Id = data.ttrialbalancereport[i].TransID;
//               recordObj.type = data.ttrialbalancereport[i].Account;
//               recordObj.AccountName = data.ttrialbalancereport[i].AccountName;
//               recordObj.dataArr = [
//                 "",
//                 data.ttrialbalancereport[i].AccountNumber,
//                 data.ttrialbalancereport[i].Account,
//                 utilityService.modifynegativeCurrencyFormat(
//                   data.ttrialbalancereport[i].CreditsEx
//                 ) || "-",
//                 utilityService.modifynegativeCurrencyFormat(
//                   data.ttrialbalancereport[i].DebitsEx
//                 ) || "-",
//               ];

//               records.push(recordObj);
//             }
//             records = _.sortBy(records, "AccountName");
//             records = _.groupBy(records, "AccountName");

//             for (let key in records) {
//               let obj = [{ key: key }, { data: records[key] }];
//               allRecords.push(obj);
//             }

//             let iterator = 0;
//             for (let i = 0; i < allRecords.length; i++) {
//               let amountduetotal = 0;
//               let Currenttotal = 0;
//               let creditEx = 0;
//               let debitEx = 0;
//               let twoMonth = 0;
//               let threeMonth = 0;
//               let Older = 0;
//               const currencyLength = Currency.length;
//               for (let k = 0; k < allRecords[i][1].data.length; k++) {
//                 creditEx =
//                   creditEx +
//                   utilityService.convertSubstringParseFloat(
//                     allRecords[i][1].data[k].dataArr[3]
//                   );
//                 debitEx =
//                   debitEx +
//                   utilityService.convertSubstringParseFloat(
//                     allRecords[i][1].data[k].dataArr[4]
//                   );
//               }
//               let val = [
//                 "Total " + allRecords[i][0].key + "",
//                 "",
//                 "",

//                 utilityService.modifynegativeCurrencyFormat(creditEx),
//                 utilityService.modifynegativeCurrencyFormat(debitEx),
//               ];
//               current.push(val);
//             }

//             //grandtotalRecord
//             let grandamountduetotal = 0;
//             let grandCurrenttotal = 0;
//             let grandlessTnMonth = 0;
//             let grandCreditEx = 0;
//             let grandDebitEx = 0;
//             let grandthreeMonth = 0;
//             let grandOlder = 0;

//             for (let n = 0; n < current.length; n++) {
//               const grandcurrencyLength = Currency.length;

//               //for (let m = 0; m < current[n].data.length; m++) {

//               grandCreditEx =
//                 grandCreditEx +
//                 utilityService.convertSubstringParseFloat(current[n][3]);
//               grandDebitEx =
//                 grandDebitEx +
//                 utilityService.convertSubstringParseFloat(current[n][4]);
//             }

//             let grandval = [
//               "Grand Total " + "",
//               "",
//               "",
//               utilityService.modifynegativeCurrencyFormat(grandCreditEx),
//               utilityService.modifynegativeCurrencyFormat(grandDebitEx),
//             ];

//             for (let key in records) {
//               let dataArr = current[iterator];
//               let obj = [
//                 { key: key },
//                 { data: records[key] },
//                 { total: [{ dataArr: dataArr }] },
//               ];
//               totalRecord.push(obj);
//               iterator += 1;
//             }

//             templateObject.records.set(totalRecord);
//             templateObject.grandrecords.set(grandval);

//             if (templateObject.records.get()) {
//               setTimeout(function () {
//                 $("td a").each(function () {
//                   if (
//                     $(this)
//                       .text()
//                       .indexOf("-" + Currency) >= 0
//                   )
//                     $(this).addClass("text-danger");
//                 });
//                 $("td").each(function () {
//                   if (
//                     $(this)
//                       .text()
//                       .indexOf("-" + Currency) >= 0
//                   )
//                     $(this).addClass("text-danger");
//                 });

//                 $("td").each(function () {
//                   let lineValue = $(this).first().text()[0];
//                   if (lineValue != undefined) {
//                     if (lineValue.indexOf(Currency) >= 0)
//                       $(this).addClass("text-right");
//                   }
//                 });

//                 $("td").each(function () {
//                   if (
//                     $(this)
//                       .first()
//                       .text()
//                       .indexOf("-" + Currency) >= 0
//                   )
//                     $(this).addClass("text-right");
//                 });

//                 LoadingOverlay.hide();
//               }, 100);
//             }
//           } else {
//             let records = [];
//             let recordObj = {};
//             recordObj.Id = "";
//             recordObj.type = "";
//             recordObj.AccountName = " ";
//             recordObj.dataArr = [
//               "-",
//               "-",
//               "-",
//               "-",
//               "-",
//               "-",
//               "-",
//               "-",
//               "-",
//               "-",
//             ];

//             records.push(recordObj);
//             templateObject.records.set(records);
//             templateObject.grandrecords.set("");
//             LoadingOverlay.hide();
//           }
//         })
//         .catch(function (err) {
//           //Bert.alert('<strong>' + err + '</strong>!', 'danger');
//           LoadingOverlay.hide();
//         });
//     } else {
//       let data = JSON.parse(localStorage.getItem("VS1TrialBalance_Report"));
//       let totalRecord = [];
//       let grandtotalRecord = [];

//       if (data.ttrialbalancereport.length) {
//         let records = [];
//         let allRecords = [];
//         let current = [];

//         let totalNetAssets = 0;
//         let GrandTotalLiability = 0;
//         let GrandTotalAsset = 0;
//         let incArr = [];
//         let cogsArr = [];
//         let expArr = [];
//         let accountData = data.ttrialbalancereport;
//         let accountType = "";

//         for (let i = 0; i < accountData.length; i++) {
//           let recordObj = {};
//           recordObj.Id = data.ttrialbalancereport[i].TransID;
//           recordObj.type = data.ttrialbalancereport[i].Account;
//           recordObj.AccountName = data.ttrialbalancereport[i].AccountName;
//           recordObj.dataArr = [
//             "",
//             data.ttrialbalancereport[i].AccountNumber,
//             data.ttrialbalancereport[i].Account,
//             {
//               type: 'amount',
//               value: utilityService.modifynegativeCurrencyFormat(
//                 data.ttrialbalancereport[i].CreditsEx
//               ) || "-",
//             },
//             {
//               type: 'amount',
//               value: utilityService.modifynegativeCurrencyFormat(
//                 data.ttrialbalancereport[i].DebitsEx
//               ) || "-",
//             },

//           ];

//           records.push(recordObj);
//         }
//         records = _.sortBy(records, "AccountName");
//         records = _.groupBy(records, "AccountName");

//         for (let key in records) {
//           let obj = [{ key: key }, { data: records[key] }];
//           allRecords.push(obj);
//         }

//         let iterator = 0;
//         for (let i = 0; i < allRecords.length; i++) {
//           let amountduetotal = 0;
//           let Currenttotal = 0;
//           let creditEx = 0;
//           let debitEx = 0;
//           let twoMonth = 0;
//           let threeMonth = 0;
//           let Older = 0;
//           const currencyLength = Currency.length;
//           for (let k = 0; k < allRecords[i][1].data.length; k++) {
//             creditEx =
//               creditEx +
//               utilityService.convertSubstringParseFloat(
//                 allRecords[i][1].data[k].dataArr[3].value
//               );
//             debitEx =
//               debitEx +
//               utilityService.convertSubstringParseFloat(
//                 allRecords[i][1].data[k].dataArr[4].value
//               );
//           }
//           let val = [
//             "Total " + allRecords[i][0].key + "",
//             "",
//             "",
//             {
//               type: 'amount',
//               value: utilityService.modifynegativeCurrencyFormat(creditEx),
//             },
//             {
//               type: 'amount',
//               value: utilityService.modifynegativeCurrencyFormat(debitEx),
//             },
//           ];
//           current.push(val);
//         }

//         //grandtotalRecord
//         let grandamountduetotal = 0;
//         let grandCurrenttotal = 0;
//         let grandlessTnMonth = 0;
//         let grandCreditEx = 0;
//         let grandDebitEx = 0;
//         let grandthreeMonth = 0;
//         let grandOlder = 0;

//         for (let n = 0; n < current.length; n++) {
//           const grandcurrencyLength = Currency.length;

//           //for (let m = 0; m < current[n].data.length; m++) {

//           grandCreditEx =
//             grandCreditEx +
//             utilityService.convertSubstringParseFloat(current[n][3].value);
//           grandDebitEx =
//             grandDebitEx +
//             utilityService.convertSubstringParseFloat(current[n][4].value);
//         }

//         let grandval = [
//           "Grand Total " + "",
//           "",
//           "",
//           {
//             type: "amount",
//             value: utilityService.modifynegativeCurrencyFormat(grandCreditEx),
//           },
//           {
//             type: "amount",
//             value: utilityService.modifynegativeCurrencyFormat(grandDebitEx),
//           }
//         ];

//         for (let key in records) {
//           let dataArr = current[iterator];
//           let obj = [
//             { key: key },
//             { data: records[key] },
//             { total: [{ dataArr: dataArr }] },
//           ];
//           totalRecord.push(obj);
//           iterator += 1;
//         }

//         templateObject.records.set(totalRecord);
//         templateObject.grandrecords.set(grandval);

//         if (templateObject.records.get()) {
//           setTimeout(function () {
//             $("td a").each(function () {
//               if (
//                 $(this)
//                   .text()
//                   .indexOf("-" + Currency) >= 0
//               )
//                 $(this).addClass("text-danger");
//             });
//             $("td").each(function () {
//               if (
//                 $(this)
//                   .text()
//                   .indexOf("-" + Currency) >= 0
//               )
//                 $(this).addClass("text-danger");
//             });

//             $("td").each(function () {
//               let lineValue = $(this).first().text()[0];
//               if (lineValue != undefined) {
//                 if (lineValue.indexOf(Currency) >= 0)
//                   $(this).addClass("text-right");
//               }
//             });

//             $("td").each(function () {
//               if (
//                 $(this)
//                   .first()
//                   .text()
//                   .indexOf("-" + Currency) >= 0
//               )
//                 $(this).addClass("text-right");
//             });

//             LoadingOverlay.hide();
//           }, 100);
//         }
//       } else {
//         let records = [];
//         let recordObj = {};
//         recordObj.Id = "";
//         recordObj.type = "";
//         recordObj.AccountName = " ";
//         recordObj.dataArr = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];

//         records.push(recordObj);
//         templateObject.records.set(records);
//         templateObject.grandrecords.set("");
//         LoadingOverlay.hide();
//       }
//       $(".fullScreenSpin").css("display", "none");
//     }
//   };
//   /**
//    * This will be used
//    *
//    * @param {*} dateFrom
//    * @param {*} dateTo
//    * @param {*} ignoreDate
//    */
//   templateObject.loadReport = async (dateFrom, dateTo, ignoreDate) => {
//     LoadingOverlay.show();
//     templateObject.setDateAs( dateFrom );
//     let data = await CachedHttp.get(erpObject.TTrialBalanceReport, async () => {
//       return await reportService.getTrialBalanceDetailsData(dateFrom, dateTo, ignoreDate);
//     }, {
//       useIndexDb: true,
//       useLocalStorage: true,
//       validate: cachedResponse => {
//         return false;
//       }
//     });

//     data = data.response;
//     let accountData = data.ttrialbalancereport;

//     let records = accountData.map(account => {
//       return {
//         Id: account.TransID,
//         type: account.Account,
//         AccountName: account.AccountName,
//         ...account
//       };
//     });

//     records = _.sortBy(records, "AccountName");
//     records = _.groupBy(records, "AccountName");

//     let allRecords = [];

//     const calculateTotal = (entries = [], title = "Total ") => {
//       let amountduetotal = 0;
//       let Currenttotal = 0;
//       let creditEx = 0;
//       let debitEx = 0;
//       let twoMonth = 0;
//       let threeMonth = 0;
//       let Older = 0;
//       const currencyLength = Currency.length;

//       entries.forEach(entry => {
//         creditEx = creditEx + parseFloat(entry.CreditsEx);
//         debitEx = debitEx + parseFloat(entry.DebitsEx);
//       });

//       return {
//         title: "Total " + title,
//         CreditsEx: creditEx,
//         DebitsEx: debitEx
//       };
//     };

//     for (let key in records) {
//       allRecords.push({
//         title: key,
//         entries: records[key],
//         total: calculateTotal(records[key], key)
//       });
//     }

//     const calculateGrandTotal = (allRecords = []) => {
//       //grandtotalRecord
//       let grandamountduetotal = 0;
//       let grandCurrenttotal = 0;
//       let grandlessTnMonth = 0;
//       let grandCreditEx = 0;
//       let grandDebitEx = 0;
//       let grandthreeMonth = 0;
//       let grandOlder = 0;

//       allRecords.forEach(record => {
//         grandCreditEx = grandCreditEx + parseFloat(record.total.CreditsEx);
//         grandDebitEx = grandDebitEx + parseFloat(record.total.DebitsEx);
//       });

//       return {title: "Grand Total ", DebitsEx: grandDebitEx, CreditsEx: grandCreditEx};
//     };

//     const grandTotal = calculateGrandTotal(allRecords);

//     templateObject.records.set(allRecords);
//     templateObject.grandrecords.set(grandTotal);

//     if (templateObject.records.get()) {
//       setTimeout(function () {
//         $("td a").each(function () {
//           if ($(this).text().indexOf("-" + Currency) >= 0)
//             $(this).addClass("text-danger");
//           }
//         );
//         $("td").each(function () {
//           if ($(this).text().indexOf("-" + Currency) >= 0)
//             $(this).addClass("text-danger");
//           }
//         );

//         $("td").each(function () {
//           let lineValue = $(this).first().text()[0];
//           if (lineValue != undefined) {
//             if (lineValue.indexOf(Currency) >= 0)
//               $(this).addClass("text-right");
//             }
//           });

//         $("td").each(function () {
//           if ($(this).first().text().indexOf("-" + Currency) >= 0)
//             $(this).addClass("text-right");
//           }
//         );

//         LoadingOverlay.hide();
//       }, 100);
//     }

//     LoadingOverlay.hide();
//   };



//   // var currentDate2 = new Date();
//   // var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");

//   // let getDateFrom =
//   //   currentDate2.getFullYear() +
//   //   "-" +
//   //   currentDate2.getMonth() +
//   //   "-" +
//   //   currentDate2.getDate();

//   //templateObject.getTrialBalanceReports(getDateFrom, getLoadDate, false);

//   templateObject.getDepartments = function () {
//     let deptrecords = [];
//     reportService.getDepartment().then(function (data) {
//       for (let i in data.tdeptclass) {
//         let deptrecordObj = {
//           id: data.tdeptclass[i].Id || " ",
//           department: data.tdeptclass[i].DeptClassName || " ",
//         };

//         deptrecords.push(deptrecordObj);
//         templateObject.deptrecords.set(deptrecords);
//       }
//     });
//   };
//   // templateObject.getAllProductData();
//   //templateObject.getDepartments();


//   templateObject.initDate();
//   templateObject.getDepartments();

//   templateObject.loadReport(
//     GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//     GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//     false
//   );
//   templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )
// });

Template.trialbalance.events({

});

Template.trialbalance.helpers({
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
    return reportService.getTrialBalanceDetailsData;
  },

  listParams: function() {
    return ['limitCount', 'limitFrom', 'dateFrom', 'dateTo', 'ignoreDate']
  },

  service: function () {
    return reportService
  },

  searchFunction: function () {
    return reportService.getTrialBalanceDetailsDataByKeyword;
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