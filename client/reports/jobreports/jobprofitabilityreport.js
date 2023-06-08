import { ReportService } from "../report-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import Datehandler from "../../DateHandler";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";
import GlobalFunctions from "../../GlobalFunctions";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import { Template } from 'meteor/templating';
import "./jobprofitabilityreport.html";
import moment from "moment";

let taxRateService = new TaxRateService();
let reportService = new ReportService();
let utilityService = new UtilityService();
let defaultCurrencyCode = CountryAbbr;

function MakeNegative() {
  $('td').each(function(){
    if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
  });
}

Template.jobprofitabilityreport.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.displaysettings = new ReactiveVar([]);

  FxGlobalFunctions.initVars(templateObject);
  let reset_data = [
    { index: 0, label: 'ID', class:'colLineId', active: false, display: true, width: "10", calc: false},
    { index: 1, label: 'Company', class: 'colCompanyName', active: true, display: true, width: "200", calc: false},
    { index: 2, label: 'Job Name', class: 'colJobName', active: true, display: true, width: "120", calc: false},
    { index: 3, label: 'Job No', class: 'colJobNo', active: true, display: true, width: "120", calc: false},
    { index: 4, label: 'Cost (ex)', class: 'colCostEX text-right', active: true, display: true, width: "120", calc: true},
    { index: 5, label: 'Income (ex)', class: 'colIncomeEX text-right', active: true, display: true, width: "120", calc: true},
    { index: 6, label: 'Quoted (ex)', class: 'colQuotedEX text-right', active: true, display: true, width: "120", calc: true},
    { index: 7, label: 'Diff Inc Cost', class: 'colDiffIncCost text-right', active: true, display: true, width: "120", calc: true},
    { index: 8, label: 'Backorders', class: 'colBackorders', active: true, display: true, width: "120", calc: false},
    { index: 9, label: 'Credit', class: 'colCredit text-right', active: true, display: true, width: "120", calc: true},
    { index: 10, label: 'Profit %', class: 'colProfit% text-right', active: true, display: true, width: "120", calc: false},
    { index: 11, label: 'Profit', class: 'colProfit text-right', active: true, display: true, width: "120", calc: true},
  ]
  templateObject.displaysettings.set(reset_data);
  templateObject.getReportDataRecord = function(data) {
    var dataList = [];
    if(data!='') {
      dataList =  [
        data.CompanyName || "",
        data.JobName || " ",
        data.JobNumber || " ",
        data.CostEx || 0,
        data.IncomeEx || 0,
        data.Quotedex || 0,
        data.DiffIncome_Cost || 0,
        data.Backorders || 0,
        data.CreditEx || 0,
        parseFloat(data.ProfitPercent).toFixed(2) + '%' || '',
        data.ProfitDollars || 0,
      ];
    }else {
      dataList = [
        "", "", "",  "", "", 0, 0, 0,
      ]
    }
    return dataList;
  }
});

Template.jobprofitabilityreport.onRendered(() => {});

// Template.jobprofitabilityreport.onRendered(() => {
//   const templateObject = Template.instance();
//   LoadingOverlay.show();
//
//   templateObject.init_reset_data = function () {
//     let reset_data = [];
//     reset_data = [
//       { index: 1, label: 'Company', class: 'colCompanyName', active: true, display: true, width: "200" },
//       { index: 2, label: 'Job Name', class: 'colJobName', active: true, display: true, width: "120" },
//       { index: 3, label: 'Job No', class: 'colJobNo', active: true, display: true, width: "120" },
//       { index: 4, label: 'Cost (ex)', class: 'colCostEX text-right', active: true, display: true, width: "120" },
//       { index: 5, label: 'Income (ex)', class: 'colIncomeEX text-right', active: true, display: true, width: "120" },
//       { index: 6, label: 'Quoted (ex)', class: 'colQuotedEX text-right', active: true, display: true, width: "120" },
//       { index: 7, label: 'Diff Inc Cost', class: 'colDiffIncCost text-right', active: true, display: true, width: "120" },
//       { index: 8, label: 'Backorders', class: 'colBackorders', active: true, display: true, width: "120" },
//       { index: 9, label: 'Credit', class: 'colCredit text-right', active: true, display: true, width: "120" },
//       { index: 10, label: 'Profit %', class: 'colProfit%', active: true, display: true, width: "120" },
//       { index: 11, label: 'Profit', class: 'colProfit text-right', active: true, display: true, width: "120" },
//       // { index: 1, label: 'Company Name', class: 'colCompanyName', active: true, display: true, width: "120" },
//       // { index: 2, label: 'Job Name', class: 'colJobName', active: true, display: true, width: "120" },
//       // { index: 3, label: 'Job Number', class: 'colJobNumber', active: true, display: true, width: "120" },
//       // { index: 4, label: 'Txn Type', class: 'colTxnType', active: true, display: true, width: "120" },
//       // { index: 5, label: 'Txn No', class: 'colTxnNo', active: true, display: true, width: "120" },
//       // { index: 6, label: 'Cost Ex', class: 'colCostEx', active: true, display: true, width: "120" },
//       // { index: 7, label: 'Income Ex', class: 'colIncomeEx', active: true, display: true, width: "120" },
//       // { index: 8, label: 'Quoted Ex', class: 'colQuotedEx', active: true, display: true, width: "120" },
//       // { index: 9, label: 'Diff Inc Cost', class: 'colDiffIncCost', active: true, display: true, width: "120" },
//       // { index: 10, label: '%Diff Inc By Cost', class: 'colDiffIncByCost', active: true, display: true, width: "200" },
//       // { index: 11, label: 'Diff Inc Quote', class: 'colDiffIncQuote', active: true, display: true, width: "120" },
//       // { index: 12, label: '%Diff Inc By Quote', class: 'colDiffIncByQuote', active: true, display: true, width: "200" },
//       // { index: 13, label: 'Backorders', class: 'colBackorders', active: true, display: true, width: "120" },
//       // { index: 14, label: 'Account Name', class: 'colAccountName', active: true, display: true, width: "120" },
//       // { index: 15, label: 'Debit Ex', class: 'colDebitEx', active: true, display: true, width: "120" },
//       // { index: 16, label: 'Credit Ex', class: 'colCreditEx', active: true, display: true, width: "120" },
//       // { index: 17, label: 'Profit %', class: 'colProfitpercent', active: true, display: true, width: "150" },
//       // { index: 18, label: 'Department', class: 'colDepartment', active: true, display: true, width: "120" },
//       // { index: 19, label: 'Product', class: 'colProduct', active: true, display: true, width: "120" },
//       // { index: 20, label: 'Sub Group', class: 'colSubGroup', active: true, display: true, width: "120" },
//       // { index: 21, label: 'Type', class: 'colType', active: true, display: true, width: "120" },
//       // { index: 22, label: 'Dept', class: 'colDept', active: true, display: true, width: "120" },
//       // { index: 23, label: 'Area', class: 'colArea', active: true, display: true, width: "120" },
//       // { index: 24, label: 'Landed Cost', class: 'colLandedCost', active: true, display: true, width: "120" },
//       // { index: 25, label: 'Latestcost', class: 'colLatestcost', active: true, display: true, width: "120" },
//       // { index: 26, label: 'Diff Inc Landedcost', class: 'colDiffIncLandedcost', active: true, display: true, width: "200" },
//       // { index: 27, label: '%Diff Inc By Landedcost', class: 'colDiffIncByLandedcost', active: true, display: true, width: "200" },
//       // { index: 28, label: 'Diff Inc Latestcost', class: 'colDiffIncLatestcost', active: true, display: true, width: "200" },
//       // { index: 29, label: '%Diff Inc By Latestcost', class: 'colDiffIncByLatestcost', active: true, display: true, width: "200" },
//       // { index: 30, label: 'Ordered', class: 'colOrderd', active: true, display: true, width: "120" },
//       // { index: 31, label: 'Shipped', class: 'colShipped', active: true, display: true, width: "120" },
//       // { index: 32, label: 'Back Ordered', class: 'colBackOrdered', active: true, display: true, width: "120" },
//       // { index: 33, label: 'CUSTFLD1', class: 'colCUSTFLD1', active: true, display: true, width: "120" },
//       // { index: 34, label: 'CUSTFLD2', class: 'colCUSTFLD2', active: true, display: true, width: "120" },
//       // { index: 35, label: 'CUSTFLD3', class: 'colCUSTFLD3', active: true, display: true, width: "120" },
//       // { index: 36, label: 'CUSTFLD4', class: 'colCUSTFLD4', active: true, display: true, width: "120" },
//       // { index: 37, label: 'CUSTFLD5', class: 'colCUSTFLD5', active: true, display: true, width: "120" },
//       // { index: 38, label: 'CUSTFLD6', class: 'colCUSTFLD6', active: true, display: true, width: "120" },
//       // { index: 39, label: 'CUSTFLD7', class: 'colCUSTFLD7', active: true, display: true, width: "120" },
//       // { index: 40, label: 'CUSTFLD8', class: 'colCUSTFLD8', active: true, display: true, width: "120" },
//       // { index: 41, label: 'CUSTFLD9', class: 'colCUSTFLD9', active: true, display: true, width: "120" },
//       // { index: 42, label: 'CUSTFLD10', class: 'colCUSTFLD10', active: true, display: true, width: "120" },
//       // { index: 43, label: 'CUSTFLD11', class: 'colCUSTFLD11', active: true, display: true, width: "120" },
//       // { index: 44, label: 'CUSTFLD12', class: 'colCUSTFLD12', active: true, display: true, width: "120" },
//       // { index: 45, label: 'CUSTFLD13', class: 'colCUSTFLD13', active: true, display: true, width: "120" },
//       // { index: 46, label: 'CUSTFLD14', class: 'colCUSTFLD14', active: true, display: true, width: "120" },
//       // { index: 47, label: 'CUSTFLD15', class: 'colCUSTFLD15', active: true, display: true, width: "120" },
//       // { index: 48, label: 'Profit $', class: 'colProfitdoller', active: true, display: true, width: "120" },
//       // { index: 49, label: 'Trans Date', class: 'colTransDate', active: true, display: true, width: "200" },
//       // { index: 50, label: 'Supplier ID', class: 'colSupplierID', active: false, display: true, width: "120" },
//     ]
//
//     templateObject.jobprofitabilityreportth.set(reset_data);
//   }
//   templateObject.init_reset_data();
//
//   // await reportService.getBalanceSheetReport(dateAOsf) :
//
//   // --------------------------------------------------------------------------------------------------
//   templateObject.initDate = () => {
//     Datehandler.initOneMonth();
//   };
//   templateObject.setDateAs = (dateFrom = null) => {
//     templateObject.dateAsAt.set((dateFrom) ? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"))
//   };
//   templateObject.initDate();
//
//   // let date = new Date();
//   // templateObject.currentYear.set(date.getFullYear());
//   // templateObject.nextYear.set(date.getFullYear() + 1);
//   // let currentMonth = moment(date).format("DD/MM/YYYY");
//   // templateObject.currentMonth.set(currentMonth);
//
//   // templateObject.setDateAs(GlobalFunctions.convertYearMonthDay($('#dateFrom').val()));
//   templateObject.loadReport = async (dateFrom = null, dateTo = null, ignoreDate = false) => {
//     LoadingOverlay.show();
//     templateObject.setDateAs(dateFrom);
//     let data = await CachedHttp.get(erpObject.TJobProfitability, async () => {
//       return await reportService.getJobProfitabilityReport(dateFrom, dateTo, ignoreDate);
//     }, {
//       useIndexDb: true,
//       useLocalStorage: false,
//       validate: (cachedResponse) => {
//         return false;
//       }
//     });
//     addVS1Data('TJobProfitability', JSON.stringify(data.response));
//     templateObject.displayReportData(data.response);
//     LoadingOverlay.hide();
//   }
//   templateObject.getReportData = async function (dateFrom, dateTo, ignoreDate) {
//
//     templateObject.setDateAs(dateFrom);
//     getVS1Data('TJobProfitability').then(function (dataObject) {
//       if (dataObject.length == 0) {
//         reportService.getJobProfitabilityReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
//           await addVS1Data('TJobProfitability', JSON.stringify(data));
//           templateObject.displayReportData(data);
//         }).catch(function (err) {
//         });
//       } else {
//         let data = JSON.parse(dataObject[0].data);
//         templateObject.displayReportData(data);
//       }
//     }).catch(function (err) {
//       reportService.getJobProfitabilityReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
//         await addVS1Data('TJobProfitability', JSON.stringify(data));
//         templateObject.displayReportData(data);
//       }).catch(function (err) {
//
//       });
//     });
//   }
//
//   templateObject.getReportData(
//     GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//     GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//     false
//   );
//   templateObject.displayReportData = async function (data) {
//     var splashArrayReport = new Array();
//     let deleteFilter = false;
//     if (data.Params.Search.replace(/\s/g, "") == "") {
//       deleteFilter = true;
//     } else {
//       deleteFilter = false;
//     };
//
//     for (let i = 0; i < data.tjobprofitability.length; i++) {
//       var dataList = [
//         data.tjobprofitability[i].CompanyName || "",
//         data.tjobprofitability[i].JobName || "",
//         data.tjobprofitability[i].JobNumber || "",
//         data.tjobprofitability[i].CostEx || "",
//         data.tjobprofitability[i].IncomeEx || "",
//         data.tjobprofitability[i].Quotedex || "",
//         data.tjobprofitability[i].DiffIncome_Cost || "",
//         data.tjobprofitability[i].Backorders || "",
//         data.tjobprofitability[i].CreditEx || "",
//         data.tjobprofitability[i].ProfitPercent || "",
//         data.tjobprofitability[i].ProfitDollars || "",
//         // data.tjobprofitability[i].CompanyName || "",
//         // data.tjobprofitability[i].JobName || "",
//         // data.tjobprofitability[i].JobNumber || "",
//         // data.tjobprofitability[i].TransactionType || "",
//         // data.tjobprofitability[i].TransactionNo || "",
//         // data.tjobprofitability[i].CostEx || "",
//         // data.tjobprofitability[i].IncomeEx || "",
//         // data.tjobprofitability[i].Quotedex || "",
//         // data.tjobprofitability[i].DiffIncome_Cost || "",
//         // data.tjobprofitability[i].PercentDiffIncomebyCost || "",
//         // data.tjobprofitability[i].DiffIncome_Quote || "",
//         // data.tjobprofitability[i].PercentDiffIncomebyQuote || "",
//         // data.tjobprofitability[i].Backorders || "",
//         // data.tjobprofitability[i].AccountName || "",
//         // data.tjobprofitability[i].DebitEx || "",
//         // data.tjobprofitability[i].CreditEx || "",
//         // data.tjobprofitability[i].ProfitPercent || "",
//         // data.tjobprofitability[i].Department || "",
//         // data.tjobprofitability[i].ProductID || "",
//         // data.tjobprofitability[i].ProductName || "",
//         // data.tjobprofitability[i].ClientID || "",
//         // data.tjobprofitability[i].Details || "",
//         // data.tjobprofitability[i].Area || "",
//         // data.tjobprofitability[i].LandedCost || "",
//         // data.tjobprofitability[i].Latestcost || "",
//         // data.tjobprofitability[i].DiffIncome_Landedcost || "",
//         // data.tjobprofitability[i].PercentDiffIncomebyLandedcost || "",
//         // data.tjobprofitability[i].DiffIncome_Latestcost || "",
//         // data.tjobprofitability[i].PercentDiffIncomebyLatestcost || "",
//         // data.tjobprofitability[i].QtyOrdered || "",
//         // data.tjobprofitability[i].QtyShipped || "",
//         // data.tjobprofitability[i].QtyBackOrder || "",
//         // data.tjobprofitability[i].CUSTFLD1 || "",
//         // data.tjobprofitability[i].CUSTFLD2 || "",
//         // data.tjobprofitability[i].CUSTFLD3 || "",
//         // data.tjobprofitability[i].CUSTFLD4 || "",
//         // data.tjobprofitability[i].CUSTFLD5 || "",
//         // data.tjobprofitability[i].CUSTFLD6 || "",
//         // data.tjobprofitability[i].CUSTFLD7 || "",
//         // data.tjobprofitability[i].CUSTFLD8|| "",
//         // data.tjobprofitability[i].CUSTFLD9 || "",
//         // data.tjobprofitability[i].CUSTFLD10 || "",
//         // data.tjobprofitability[i].CUSTFLD11 || "",
//         // data.tjobprofitability[i].CUSTFLD12 || "",
//         // data.tjobprofitability[i].CUSTFLD13 || "",
//         // data.tjobprofitability[i].CUSTFLD14 || "",
//         // data.tjobprofitability[i].CUSTFLD15 || "",
//         // data.tjobprofitability[i].ProfitDollars || "",
//         // data.tjobprofitability[i].Transdate || "",
//         // data.tjobprofitability[i].SupplierName || "",
//       ];
//       splashArrayReport.push(dataList);
//     }
//     let T_AccountName = "", j, customerProductReport = [];
//     function currencySpan(tmp){
//       return (tmp >= 0) ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(tmp), 'text-success', 'text-right') : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(tmp), 'text-danger', 'text-right');
//     }
//     for(let i = 0 ; i < splashArrayReport.length ; i ++){
//       if(T_AccountName != splashArrayReport[i][0]) {
//         T_AccountName = splashArrayReport[i][0];
//         customerProductReport.push([
//           GlobalFunctions.generateSpan(`${T_AccountName}`, "table-cells text-bold"),
//           "",
//           "",
//           "",
//           "",
//           "",
//           "",
//           "",
//           "",
//           "",
//           "",
//         ]);
//       }
//       T_AccountName = splashArrayReport[i][0];
//       splashArrayReport[i][0] = "";
//
//       splashArrayReport[i][1] = GlobalFunctions.generateSpan(splashArrayReport[i][1], 'text-primary');
//       splashArrayReport[i][2] = GlobalFunctions.generateSpan(splashArrayReport[i][2], 'text-primary');
//       splashArrayReport[i][7] = GlobalFunctions.generateSpan(splashArrayReport[i][7], 'text-primary');
//       splashArrayReport[i][9] = GlobalFunctions.generateSpan(GlobalFunctions.covert2Comma(splashArrayReport[i][9] - 0) + '%', 'text-primary');
//
//       splashArrayReport[i][3] = currencySpan(splashArrayReport[i][3] - 0);
//       splashArrayReport[i][4] = currencySpan(splashArrayReport[i][4] - 0);
//       splashArrayReport[i][5] = currencySpan(splashArrayReport[i][5] - 0);
//       splashArrayReport[i][6] = currencySpan(splashArrayReport[i][6] - 0);
//       splashArrayReport[i][8] = currencySpan(splashArrayReport[i][8] - 0);
//       splashArrayReport[i][10] = currencySpan(splashArrayReport[i][10] - 0);
//
//       customerProductReport.push(splashArrayReport[i]);
//     }
//     templateObject.records.set(customerProductReport);
//     if (templateObject.records.get()) {
//       setTimeout(function () {
//         MakeNegative();
//       }, 100);
//     }
//     //$('.fullScreenSpin').css('display','none');
//
//     setTimeout(function () {
//       $('#tableExport1').DataTable({
//         data: customerProductReport,
//         searching: false,
//         "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
//         columnDefs: [
//           {
//             targets: 0,
//             className: "colCompanyName",
//           },
//           {
//             targets: 1,
//             className: "colJobName",
//           },
//           {
//             targets: 2,
//             className: "colJobNo",
//           },
//           {
//             targets: 3,
//             className: "colCostEX",
//           },
//           {
//             targets: 4,
//             className: "colIncomeEX",
//           },
//           {
//             targets: 5,
//             className: "colQuotedEX",
//           },
//           {
//             targets: 6,
//             className: "colDiffIncCost",
//           },
//           {
//             targets: 7,
//             className: "colBackorders",
//           },
//           {
//             targets: 8,
//             className: "colCredit",
//           },
//           {
//             targets: 9,
//             className: "colProfit%",
//           },
//           {
//             targets: 10,
//             className: "colProfit",
//           },
//           // {
//           //   targets: 0,
//           //   className: "colCompanyName",
//           // },
//           // {
//           //   targets: 1,
//           //   className: "colJobName"
//           // },
//           // {
//           //   targets: 2,
//           //   className: "colJobNumber"
//           // },
//           // {
//           //   targets: 3,
//           //   className: "colTxnType",
//           // },
//           // {
//           //   targets: 4,
//           //   className: "colTxnNo",
//           // },
//           // {
//           //   targets: 5,
//           //   className: "colCostEx",
//           // },
//           // {
//           //   targets: 6,
//           //   className: "colIncomeEx",
//           // },
//           // {
//           //   targets: 7,
//           //   className: "colQuotedEx",
//           // },
//           // {
//           //   targets: 8,
//           //   className: "colDiffIncCost",
//           // },
//           // {
//           //   targets: 9,
//           //   className: "colDiffIncByCost",
//           // },
//           // {
//           //   targets: 10,
//           //   className: "colDiffIncQuote",
//           // },
//           // {
//           //   targets: 11,
//           //   className: "colDiffIncByQuote",
//           // },
//           // {
//           //   targets: 12,
//           //   className: "colBackorders",
//           // },
//           // {
//           //   targets: 13,
//           //   className: "colAccountName",
//           // },
//           // {
//           //   targets: 14,
//           //   className: "colDebitEx"
//           // },
//           // {
//           //   targets: 15,
//           //   className: "colCreditEx"
//           // },
//           // {
//           //   targets: 16,
//           //   className: "colProfitpercent",
//           // },
//           // {
//           //   targets: 17,
//           //   className: "colDepartment",
//           // },
//           // {
//           //   targets: 18,
//           //   className: "colProduct",
//           // },
//           // {
//           //   targets: 19,
//           //   className: "colSubGroup",
//           // },
//           // {
//           //   targets: 20,
//           //   className: "colType",
//           // },
//           // {
//           //   targets: 21,
//           //   className: "colDept",
//           // },
//           // {
//           //   targets: 22,
//           //   className: "colArea",
//           // },
//           // {
//           //   targets: 23,
//           //   className: "colLandedCost",
//           // },
//           // {
//           //   targets: 24,
//           //   className: "colLatestcost",
//           // },
//           // {
//           //   targets: 25,
//           //   className: "colDiffIncLandedcost",
//           // },
//           // {
//           //   targets: 26,
//           //   className: "colDiffIncByLandedcost",
//           // },
//           // {
//           //   targets: 27,
//           //   className: "colDiffIncLatestcost"
//           // },
//           // {
//           //   targets: 28,
//           //   className: "colDiffIncByLatestcost"
//           // },
//           // {
//           //   targets: 29,
//           //   className: "colOrderd",
//           // },
//           // {
//           //   targets: 30,
//           //   className: "colShipped",
//           // },
//           // {
//           //   targets: 31,
//           //   className: "colBackOrdered",
//           // },
//           // {
//           //   targets: 32,
//           //   className: "colCUSTFLD1",
//           // },
//           // {
//           //   targets: 33,
//           //   className: "colCUSTFLD2",
//           // },
//           // {
//           //   targets: 34,
//           //   className: "colCUSTFLD3",
//           // },
//           // {
//           //   targets: 35,
//           //   className: "colCUSTFLD4",
//           // },
//           // {
//           //   targets: 36,
//           //   className: "colCUSTFLD5",
//           // },
//           // {
//           //   targets: 37,
//           //   className: "colCUSTFLD6",
//           // },
//           // {
//           //   targets: 38,
//           //   className: "colCUSTFLD7",
//           // },
//           // {
//           //   targets: 39,
//           //   className: "colCUSTFLD8",
//           // },
//           // {
//           //   targets: 40,
//           //   className: "colCUSTFLD9"
//           // },
//           // {
//           //   targets: 41,
//           //   className: "colCUSTFLD10"
//           // },
//           // {
//           //   targets: 42,
//           //   className: "colCUSTFLD11",
//           // },
//           // {
//           //   targets: 43,
//           //   className: "colCUSTFLD12",
//           // },
//           // {
//           //   targets: 44,
//           //   className: "colCUSTFLD13",
//           // },
//           // {
//           //   targets: 45,
//           //   className: "colCUSTFLD14",
//           // },
//           // {
//           //   targets: 46,
//           //   className: "colCUSTFLD15",
//           // },
//           // {
//           //   targets: 47,
//           //   className: "colProfitdoller",
//           // },
//           // {
//           //   targets: 48,
//           //   className: "colTransDate",
//           // },
//           // {
//           //   targets: 49,
//           //   className: "colSupplierID hiddenColumn",
//           // },
//         ],
//         select: true,
//         destroy: true,
//         colReorder: true,
//         pageLength: initialDatatableLoad,
//         lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
//         info: true,
//         // responsive: true,
//         "bsort": false,
//         "order": [],
//         action: function () {
//           $('#tableExport').DataTable().ajax.reload();
//         },
//
//       }).on('page', function () {
//         setTimeout(function () {
//           MakeNegative();
//         }, 100);
//       }).on('column-reorder', function () {
//
//       }).on('length.dt', function (e, settings, len) {
//
//         $(".fullScreenSpin").css("display", "inline-block");
//         let dataLenght = settings._iDisplayLength;
//         if (dataLenght == -1) {
//           if (settings.fnRecordsDisplay() > initialDatatableLoad) {
//             $(".fullScreenSpin").css("display", "none");
//           } else {
//             $(".fullScreenSpin").css("display", "none");
//           }
//         } else {
//           $(".fullScreenSpin").css("display", "none");
//         }
//         setTimeout(function () {
//           MakeNegative();
//         }, 100);
//       });
//       $(".fullScreenSpin").css("display", "none");
//     }, 0);
//
//     $('div.dataTables_filter input').addClass('form-control form-control-sm');
//   }
//
//
//   // ------------------------------------------------------------------------------------------------------
//   // $("#tblgeneralledger tbody").on("click", "tr", function () {
//   //   var listData = $(this).closest("tr").children('td').eq(8).text();
//   //   var checkDeleted = $(this).closest("tr").find(".colStatus").text() || "";
//
//   //   if (listData) {
//   //     if (checkDeleted == "Deleted") {
//   //       swal("You Cannot View This Transaction", "Because It Has Been Deleted", "info");
//   //     } else {
//   //       FlowRouter.go("/journalentrycard?id=" + listData);
//   //     }
//   //   }
//   // });
//
//
//   LoadingOverlay.hide();
// });

// Template.jobprofitabilityreport.onRendered(() => {
//   const templateObject = Template.instance();
//   LoadingOverlay.show();

//   let reset_data = [
//     { index: 1, label: 'Company Name', class: 'colCompanyName', active: true, display: true, width: "120" },
//     { index: 2, label: 'Job Name', class: 'colJobName', active: true, display: true, width: "120" },
//     { index: 3, label: 'Job Number', class: 'colJobNumber', active: true, display: true, width: "120" },
//     { index: 4, label: 'Txn Type', class: 'colTxnType', active: true, display: true, width: "120" },
//     { index: 5, label: 'Txn No', class: 'colTxnNo', active: true, display: true, width: "120" },
//     { index: 6, label: 'Cost Ex', class: 'colCostEx', active: true, display: true, width: "120" },
//     { index: 7, label: 'Income Ex', class: 'colIncomeEx', active: true, display: true, width: "120" },
//     { index: 8, label: 'Quoted Ex', class: 'colQuotedEx', active: true, display: true, width: "120" },
//     { index: 9, label: 'Diff Inc Cost', class: 'colDiffIncCost', active: true, display: true, width: "120" },
//     { index: 10, label: '%Diff Inc By Cost', class: 'colDiffIncByCost', active: true, display: true, width: "120" },
//     { index: 11, label: 'Diff Inc Quote', class: 'colDiffIncQuote', active: true, display: true, width: "120" },
//     { index: 12, label: '%Diff Inc By Quote', class: 'colDiffIncByQuote', active: true, display: true, width: "120" },
//     { index: 13, label: 'Backorders', class: 'colBackorders', active: true, display: true, width: "120" },
//     { index: 14, label: 'Account Name', class: 'colAccountName', active: true, display: true, width: "120" },
//     { index: 15, label: 'Debit Ex', class: 'colDebitEx', active: true, display: true, width: "120" },
//     { index: 16, label: 'Credit Ex', class: 'colCreditEx', active: true, display: true, width: "120" },
//     { index: 17, label: 'Profit %', class: 'colProfitpercent', active: true, display: true, width: "120" },
//     { index: 18, label: 'Department', class: 'colDepartment', active: true, display: true, width: "120" },
//     { index: 19, label: 'Product', class: 'colProduct', active: true, display: true, width: "120" },
//     { index: 20, label: 'Sub  Group', class: 'colSubGroup', active: true, display: true, width: "120" },
//     { index: 21, label: 'Type', class: 'colType', active: true, display: true, width: "120" },
//     { index: 22, label: 'Dept', class: 'colDept', active: true, display: true, width: "120" },
//     { index: 23, label: 'Area', class: 'colArea', active: true, display: true, width: "120" },
//     { index: 24, label: 'Landed Cost', class: 'colLandedCost', active: true, display: true, width: "120" },
//     { index: 25, label: 'Latestcost', class: 'colLatestcost', active: true, display: true, width: "120" },
//     { index: 26, label: 'First Name', class: 'colFirstName', active: true, display: true, width: "120" },
//     { index: 27, label: 'Last Name', class: 'colLastName', active: true, display: true, width: "120" },
//     { index: 28, label: 'Diff Inc Landedcost', class: 'colDiffIncLandedcost', active: true, display: true, width: "120" },
//     { index: 29, label: '%Diff Inc By Landedcost', class: 'colDiffIncByLandedcost', active: true, display: true, width: "120" },
//     { index: 30, label: 'Diff Inc Latestcost', class: 'colDiffIncLatestcost', active: true, display: true, width: "120" },
//     { index: 31, label: '%Diff Inc By Latestcost', class: 'colDiffIncByLatestcost', active: true, display: true, width: "120" },
//     { index: 32, label: 'Ordered', class: 'colOrderd', active: true, display: true, width: "120" },
//     { index: 33, label: 'Shipped', class: 'colShipped', active: true, display: true, width: "120" },
//     { index: 34, label: 'Back Ordered', class: 'colBackOrdered', active: true, display: true, width: "120" },
//     { index: 35, label: 'CUSTFLD1', class: 'colCUSTFLD1', active: true, display: true, width: "120" },
//     { index: 36, label: 'CUSTFLD2', class: 'colCUSTFLD2', active: true, display: true, width: "120" },
//     { index: 37, label: 'CUSTFLD3', class: 'colCUSTFLD3', active: true, display: true, width: "120" },
//     { index: 39, label: 'CUSTFLD4', class: 'colCUSTFLD4', acticve: true, display: true, width: "120" },
//     { index: 40, label: 'CUSTFLD5', class: 'colCUSTFLD5', active: true, display: true, width: "120" },
//     { index: 41, label: 'CUSTFLD6', class: 'colCUSTFLD6', active: true, display: true, width: "120" },
//     { index: 42, label: 'CUSTFLD7', class: 'colCUSTFLD7', active: true, display: true, width: "120" },
//     { index: 43, label: 'CUSTFLD8', class: 'colCUSTFLD8', active: true, display: true, width: "120" },
//     { index: 44, label: 'JobNotes', class: 'colJobNotes', active: true, display: true, width: "120" },
//     { index: 45, label: 'CUSTFLD9', class: 'colCUSTFLD9', active: true, display: true, width: "120" },
//     { index: 46, label: 'CUSTFLD10', class: 'colCUSTFLD10', active: true, display: true, width: "120" },
//     { index: 47, label: 'CUSTFLD11', class: 'colCUSTFLD11', active: true, display: true, width: "120" },
//     { index: 48, label: 'CUSTFLD12', class: 'colCUSTFLD12', active: true, display: true, width: "120" },
//     { index: 49, label: 'CUSTFLD13', class: 'colCUSTFLD13', active: true, display: true, width: "120" },
//     { index: 50, label: 'CUSTFLD14', class: 'colCUSTFLD14', active: true, display: true, width: "120" },
//     { index: 51, label: 'CUSTFLD15', class: 'colCUSTFLD15', active: true, display: true, width: "120" },
//     { index: 52, label: 'Profit $', class: 'colProfitdoller', active: true, display: true, width: "120" },
//   ]
//   templateObject.jobprofitabilityreportth.set(reset_data);

//   templateObject.initDate = () => {
//     Datehandler.initOneMonth();
//   };

//   templateObject.setDateAs = (dateFrom = null) => {
//     templateObject.dateAsAt.set((dateFrom) ? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"))
//   };

//   templateObject.setReportOptions = async function (ignoreDate = true, formatDateFrom = new Date(), formatDateTo = new Date()) {
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
//     $('.edtReportDates').attr('disabled', false)
//     if (ignoreDate == true) {
//       $('.edtReportDates').attr('disabled', true);
//       templateObject.dateAsAt.set("Current Date");
//     }
//     $("#dateFrom").val(moment(defaultOptions.fromDate).format('DD/MM/YYYY'));
//     $("#dateTo").val(moment(defaultOptions.toDate).format('DD/MM/YYYY'));
//     templateObject.dateAsAt.set(moment(defaultOptions.toDate).format('DD/MM/YYYY'));
//     await templateObject.reportOptions.set(defaultOptions);
//     await templateObject.getJobProfitabilityReportData();
//   };

  // templateObject.loadReport = async (dateFrom = null, dateTo = null, ignoreDate = false) => {
  //   LoadingOverlay.show();
  //   templateObject.setDateAs(dateFrom);
  //   // let data = [];
  //   // if (!localStorage.getItem('VS1JobProfitability_Report')) {
  //   //   const options = await templateObject.reportOptions.get();
  //   //   let dateFrom = moment(options.fromDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
  //   //   let dateTo = moment(options.toDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
  //   //   let ignoreDate = options.ignoreDate || false;
  //   //   data = await reportService.getJobProfitabilityReport( dateFrom, dateTo, ignoreDate);
  //   //   if( data.tjobprofitability.length > 0 ){
  //   //     localStorage.setItem('VS1JobProfitability_Report', JSON.stringify(data)||'');
  //   //   }
  //   // }else{
  //   //   data = JSON.parse(localStorage.getItem('VS1JobProfitability_Report'));
  //   // }
  //
  //   // const options = await templateObject.reportOptions.get();
  //   // let dateFrom = moment(options.fromDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
  //   // let dateTo = moment(options.toDate).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD");
  //   // let ignoreDate = options.ignoreDate || false;
  //
  //   let data = await CachedHttp.get(erpObject.TJobProfitability, async () => {
  //     return await reportService.getJobProfitabilityReport(dateFrom, dateTo, ignoreDate);
  //   }, {
  //     useIndexDb: true,
  //     useLocalStorage: false,
  //     validate: (cachedResponse) => {
  //       return false;
  //     }
  //   });
  //
  //   data = data.response;


//     let reportData = [];
//     if (data.tjobprofitability.length > 0) {
//       for (const item of data.tjobprofitability) {
//         let isExist = reportData.filter((subitem) => {
//           if (subitem.CompanyName == item.CompanyName) {
//             subitem.SubAccounts.push(item)
//             return subitem
//           }
//         });

//         if (isExist.length == 0) {
//           reportData.push({
//             // TotalOrCost: 0,
//             // TotalCrCost: 0,
//             SubAccounts: [item],
//             ...item
//           });
//         }
//         $(".fullScreenSpin").css("display", "none");
//       }
//     }
//     // let useData = reportData.filter((item) => {
//     //   let TotalOrCost = 0;
//     //   let TotalCrCost = 0;
//     //   item.SubAccounts.map((subitem) => {
//     //     TotalOrCost += subitem.Linecost;
//     //     TotalCrCost += subitem.linecostinc;
//     //   });
//     //   item.TotalOrCost = TotalOrCost;
//     //   item.TotalCrCost = TotalCrCost;
//     //   return item;
//     // });
//     templateObject.records.set(reportData);
//     if (templateObject.records.get()) {
//       setTimeout(function () {
//         $("td a").each(function () {
//           if ($(this).text().indexOf("-" + Currency) >= 0) {
//             $(this).addClass("text-danger");
//             $(this).removeClass("fgrblue");
//           }
//         });
//         $("td").each(function () {
//           if ($(this).text().indexOf("-" + Currency) >= 0) {
//             $(this).addClass("text-danger");
//             $(this).removeClass("fgrblue");
//           }
//         });
//         $(".fullScreenSpin").css("display", "none");
//       }, 1000);
//     }

//     LoadingOverlay.hide();
//   }

//   // templateObject.setReportOptions();


//   templateObject.initDate();

//   templateObject.loadReport(
//     GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//     GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//     false
//   );
//   templateObject.setDateAs(GlobalFunctions.convertYearMonthDay($('#dateFrom').val()))
//   LoadingOverlay.hide();
// });

Template.jobprofitabilityreport.events({

});

Template.jobprofitabilityreport.helpers({
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
    return reportService.getJobProfitabilityReport;
  },

  listParams: function() {
    return ['limitCount', 'limitFrom', 'dateFrom', 'dateTo', 'ignoreDate']
  },

  service: function () {
    return reportService
  },

  searchFunction: function () {
    return reportService.getJobProfitabilityReportByKeyword;
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
