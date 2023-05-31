import { ReportService } from "../report-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import JobSalesApi from "../../js/Api/JobSaleApi";
import CachedHttp from "../../lib/global/CachedHttp";
import GlobalFunctions from "../../GlobalFunctions";
import Datehandler from "../../DateHandler";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import { Template } from 'meteor/templating';
import "./jobsalessummary.html"
import moment from "moment";

let reportService = new ReportService();
let utilityService = new UtilityService();
let taxRateService = new TaxRateService();


let defaultCurrencyCode = CountryAbbr;

Template.jobsalessummary.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.displaysettings = new ReactiveVar([]);
  templateObject.headerList = new ReactiveVar([]);
  FxGlobalFunctions.initVars(templateObject);
  let reset_data = [
    { index: 0, label: 'ID', class:'colLineId', active: false, display: true, width: "10", calc: false},
    { index: 1, label: 'Customer', class: 'colCustomer', active: true, display: true, width: "130", calc: false},
    { index: 2, label: 'Job Customer', class: 'colJobCustomer', active: true, display: true, width: "130", calc: false},
    { index: 3, label: 'Job Number', class: 'colJobNumber', active: true, display: true, width: "130", calc: false},
    { index: 4, label: 'Job Name', class: 'colJobName', active: true, display: true, width: "130", calc: false},
    { index: 5, label: 'Product Name', class: 'colProductID', active: true, display: true, width: "130", calc: false},
    { index: 6, label: 'Qty Shipped', class: 'colQtyShipped', active: true, display: true, width: "130", calc: false},
    { index: 7, label: 'Discount', class: 'colDiscount', active: true, display: true, width: "130", calc: false},
    { index: 8, label: 'Tax', class: 'colTax text-right', active: true, display: true, width: "130", calc: true},
    { index: 9, label: 'Amount (ex)', class: 'colAmountEx text-right', active: true, display: true, width: "130", calc: true},
    { index: 10, label: 'Amount (inc)', class: 'colAmountInc text-right', active: true, display: true, width: "130", calc: true},
  ]
  templateObject.displaysettings.set(reset_data);
  templateObject.getReportDataRecord = function(data) {
    console.log(data);
    var dataList = [];
    if(data!='') {
      dataList =  [
        data.Customer || "Other",
        data.JobCustomer || " ",
        data.CustomerJobNumber || " ",
        data.JobName || " ",
        data.ProductName || " ",
        data.QtyShipped || " ",
        data.TotalDiscount || " ",
        data.TotalTax || 0,
        data.TotalAmountEx || 0,
        data.TotalAmountInc || 0,
      ];
    }else {
      dataList = [
        "", "", "",  "", "", "", 0, 0, 0,
      ]
    }
    let headerData = templateObject.headerList.get();
    let headerFlag = false;
    if(headerData.indexOf(dataList[0]) == -1) {
      headerData.push(dataList[0]);
      for(let i = 1 ; i < dataList.length; i ++)  dataList[i] = '';
      templateObject.headerList.set(headerData);
      headerFlag = true;
    }
    else dataList[0] = '';

    for(let i = 0 ; i < dataList.length; i ++) {
        if(i == 0)
            dataList[i] = GlobalFunctions.generateSpan(dataList[i], "table-cells text-bold");
        else if(i > 6 && headerFlag == false) {
            let tmp = dataList[i] - 0;
            dataList[i] = (tmp >= 0) ? GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(tmp), "text-primary") : GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(tmp), "text-danger");
        }
        else
            dataList[i] = GlobalFunctions.generateSpan(dataList[i], "text-primary");
    }

    return dataList;
  }
});
Template.jobsalessummary.onRendered(() =>{});
// Template.jobsalessummary.onRendered(() => {
//   const templateObject = Template.instance();
//   LoadingOverlay.show();
//
//   templateObject.init_reset_data = function () {
//     let reset_data = [];
//     reset_data = [
//       { index: 1, label: 'Customer', class: 'colCustomer', active: true, display: true, width: "130" },
//       { index: 2, label: 'Job Customer', class: 'colJobCustomer', active: true, display: true, width: "130" },
//       { index: 3, label: 'Job Number', class: 'colJobNumber', active: true, display: true, width: "130" },
//       { index: 4, label: 'Job Name', class: 'colJobName', active: true, display: true, width: "130" },
//       { index: 5, label: 'Product Name', class: 'colProductID', active: true, display: true, width: "130" },
//       { index: 6, label: 'Qty Shipped', class: 'colQtyShipped', active: true, display: true, width: "130" },
//       { index: 7, label: 'Discount', class: 'colDiscount', active: true, display: true, width: "130" },
//       { index: 8, label: 'Tax', class: 'colTax text-right', active: true, display: true, width: "130" },
//       { index: 9, label: 'Amount (ex)', class: 'colAmountEx text-right', active: true, display: true, width: "130" },
//       { index: 10, label: 'Amount (inc)', class: 'colAmountInc text-right', active: true, display: true, width: "130" },
//       // { index: 11, label: 'DetailType', class: 'colDetailType', active: false, display: true, width: "100" },
//       // { index: 12, label: 'ParentClientID', class: 'colParentClientID', active: false, display: true, width: "100" },
//       // { index: 13, label: 'ClientID', class: 'colClientID', active: false, display: true, width: "100" },
//     ]
//
//     templateObject.jobsalessummaryth.set(reset_data);
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
//
//   templateObject.getReportData = async function (dateFrom, dateTo, ignoreDate) {
//
//     templateObject.setDateAs(dateFrom);
//     getVS1Data('TJobSalesSummary').then(function (dataObject) {
//       if (dataObject.length == 0) {
//         reportService.getJobSalesSummaryReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
//           await addVS1Data('TJobSalesSummary', JSON.stringify(data));
//           templateObject.displayReportData(data);
//         }).catch(function (err) {
//         });
//       } else {
//         let data = JSON.parse(dataObject[0].data);
//         templateObject.displayReportData(data);
//       }
//     }).catch(function (err) {
//       reportService.getJobSalesSummaryReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
//         await addVS1Data('TJobSalesSummary', JSON.stringify(data));
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
//     var dataList = [
//       GlobalFunctions.generateSpan("Other", "table-cells text-bold"),
//       "",
//       "",
//       "",
//       "",
//       "",
//       "",
//       "",
//       "",
//       "",
//     ];
//     splashArrayReport.push(dataList);
//     for (let i = 1; ; i++) {
//       let amountStyle = "text-success";
//       if(i == data.tjobsalessummary.length) {
//         i = 0;
//         amountStyle = "text-bold table-cells";
//       }
//       dataList = [
//         i == 0 ? GlobalFunctions.generateSpan("Total", "table-cells text-bold") : "",
//         GlobalFunctions.generateSpan(data.tjobsalessummary[i].JobCustomer || "", "text-primary"),
//         GlobalFunctions.generateSpan(data.tjobsalessummary[i].CustomerJobNumber || "","text-primary"),
//         GlobalFunctions.generateSpan(data.tjobsalessummary[i].JobName || "","text-primary"),
//         GlobalFunctions.generateSpan(data.tjobsalessummary[i].ProductName || "","text-primary"),
//         GlobalFunctions.generateSpan(data.tjobsalessummary[i].QtyShipped || "","text-primary"),
//         GlobalFunctions.generateSpan(data.tjobsalessummary[i].TotalDiscount || "","text-primary"),
//         GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tjobsalessummary[i].TotalTax - 0), amountStyle, 'text-right'),
//         GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tjobsalessummary[i].TotalAmountEx - 0), amountStyle, 'text-right'),
//         GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tjobsalessummary[i].TotalAmountInc - 0), amountStyle, 'text-right'),
//         // data.tjobsalessummary[i].DetailType || "",
//         // data.tjobsalessummary[i].ParentClientID || "",
//         // data.tjobsalessummary[i].ClientID || "",
//       ];
//       splashArrayReport.push(dataList);
//       templateObject.transactiondatatablerecords.set(splashArrayReport);
//       if(i == 0)
//         break;
//     }
//
//
//     if (templateObject.transactiondatatablerecords.get()) {
//       setTimeout(function () {
//         // MakeNegative();
//       }, 100);
//     }
//     //$('.fullScreenSpin').css('display','none');
//
//     setTimeout(function () {
//       $('#tableExport1').DataTable({
//         data: splashArrayReport,
//         searching: false,
//         "bsort": false,
//         "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
//         columnDefs: [
//           {
//             targets: 0,
//             className: "colCustomer",
//           },
//           {
//             targets: 1,
//             className: "colJobCustomer"
//           },
//           {
//             targets: 2,
//             className: "colJobNumber"
//           },
//           {
//             targets: 3,
//             className: "colJobName",
//           },
//           {
//             targets: 4,
//             className: "colProductID",
//           },
//           {
//             targets: 5,
//             className: "colQtyShipped",
//           },
//           {
//             targets: 6,
//             className: "colDiscount",
//           },
//           {
//             targets: 7,
//             className: "colTax",
//           },
//           {
//             targets: 8,
//             className: "colAmountEx",
//           },
//           {
//             targets: 9,
//             className: "colAmountInc",
//           },
//           // {
//           //   targets: 10,
//           //   className: "colDetailType hiddenColumn",
//           // },
//           // {
//           //   targets: 11,
//           //   className: "colParentClientID hiddenColumn",
//           // },
//           // {
//           //   targets: 12,
//           //   className: "colClientID hiddenColumn",
//           // },
//         ],
//         select: true,
//         destroy: true,
//         colReorder: true,
//         pageLength: initialDatatableLoad,
//         lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
//         info: true,
//         // responsive: true,
//         "order": [],
//         action: function () {
//           $('#' + currenttablename).DataTable().ajax.reload();
//         },
//
//       }).on('page', function () {
//         setTimeout(function () {
//           // MakeNegative();
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
//           // MakeNegative();
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

// Template.jobsalessummary.onRendered(() => {

//   LoadingOverlay.show();
//   const templateObject = Template.instance();
//   // const jobSalesApi = new JobSalesApi();

//   let reset_data = [] ;
//   reset_data = [
//     { index: 1, label: 'Customer ID', class:'colCustomerID', active: true, display: true, width: "85" },
//     { index: 2, label: 'Contact Name', class:'colContactName', active: true, display: true, width: "85" },
//     { index: 3, label: 'Job Customer Name', class:'colJobCustomerName', active: true, display: true, width: "85" },
//     { index: 4, label: 'Job Name', class:'colJobName', active: true, display: true, width: "85" },
//     { index: 5, label: 'Sale Date Time', class:'colSaleDateTime', active: true, display: true, width: "85" },
//     { index: 6, label: 'Sale Total Ex', class:'colSaleTotalEx', active: true, display: true, width: "85" },
//     { index: 7, label: 'Sale Amount Inc', class:'colSaleAmountInc', active: true, display: true, width: "85" },
//     { index: 8, label: 'Sale Tax', class:'colSaleTax', active: true, display: true, width: "85" },
//     { index: 9, label: 'Sale Cust Field1', class:'colSaleCustField1', active: true, display: true, width: "85" },
//     { index: 10, label: 'Sale Cust Field2', class:'colSaleCustField2', active: true, display: true, width: "85" },
//     { index: 11, label: 'Sale Cust Field3', class:'colSaleCustField3', active: true, display: true, width: "85" },
//     { index: 12, label: 'Sale Cust Field4', class:'colSaleCustField4', active: true, display: true, width: "85" },
//     { index: 13, label: 'Sale Cust Field5', class:'colSaleCustField5', active: true, display: true, width: "85" },
//     { index: 14, label: 'Sale Cust Field6', class:'colSaleCustField6', active: true, display: true, width: "85" },
//     { index: 15, label: 'Sale Cust Field7', class:'colSaleCustField7', active: true, display: true, width: "85" },
//     { index: 16, label: 'Sale Cust Field8', class:'colSaleCustField8', active: true, display: true, width: "85" },
//     { index: 17, label: 'Sale Cust Field9', class:'colSaleCustField9', active: true, display: true, width: "85" },
//     { index: 18, label: 'Sale Cust Field10', class:'colSaleCustField10', active: true, display: true, width: "85" },
//     { index: 19, label: 'Product ID', class:'colProductID', active: true, display: true, width: "85" },
//     { index: 20, label: 'Uom Qty Shipped', class:'colUomQtyShipped', active: true, display: true, width: "85" },
//     { index: 21, label: 'Uom Name', class:'colUomName', active: true, display: true, width: "85" },
//     { index: 22, label: 'Amount Ex', class:'colAmountEx', active: true, display: true, width: "85" },
//     { index: 23, label: 'Amount Inc', class:'colAmountInc', active: true, display: true, width: "85" },
//     { index: 24, label: 'Amount Tax', class:'colAmountTax', active: true, display: true, width: "85" },
//     { index: 25, label: 'Tax Code', class:'colTaxCode', active: true, display: true, width: "85" },
//     { index: 26, label: 'Amount Discount', class:'colAmountDiscount', active: true, display: true, width: "85" },
//     { index: 27, label: 'Discount Per Unit', class:'colDiscountPerUnit', active: true, display: true, width: "85" },
//     { index: 28, label: 'DetailType', class:'colDetailType', active: false, display: true, width: "85" },
//     { index: 29, label: 'CustomerID', class:'colCustomerID', active: false, display: true, width: "85" },
//     { index: 30, label: 'ClientNo', class:'colClientNo', active: false, display: true, width: "85" },
//     { index: 31, label: 'CustomerType', class:'colCustomerType', active: false, display: true, width: "85" },
//     { index: 32, label: 'CustomerStreet', class:'colCustomerStreet', active: false, display: true, width: "85" },
//     { index: 33, label: 'CustomerStreet2', class:'colCustomerStreet2', active: false, display: true, width: "85" },
//     { index: 34, label: 'CustomerStreet3', class:'colCustomerStreet3', active: false, display: true, width: "85" },
//     { index: 35, label: 'Suburb', class:'colSuburb', active: false, display: true, width: "85" },
//     { index: 36, label: 'State', class:'colState', active: false, display: true, width: "85" },
//     { index: 37, label: 'CustomerPostcode', class:'colCustomerPostcode', active: false, display: true, width: "85" },
//     { index: 39, label: 'JobID', class:'colJobID', acticve: false, display: true, width: "85" },
//     { index: 40, label: 'JobClientNo', class:'colJobClientNo', active: false, display: true, width: "85" },
//     { index: 41, label: 'JobRegistration', class:'colJobRegistration', active: false, display: true, width: "85" },
//     { index: 42, label: 'JobNumber', class:'colJobNumber', active: false, display: true, width: "85" },
//     { index: 43, label: 'JobWarrantyPeriod', class:'colJobWarrantyPeriod', active: false, display: true, width: "85" },
//     { index: 44, label: 'JobNotes', class:'colJobNotes', active: false, display: true, width: "85" },
//     { index: 45, label: 'SaleCustomerName', class:'colSaleCustomerName', active: false, display: true, width: "85" },
//     { index: 46, label: 'SaleDate', class:'colSaleDate', active: false, display: true, width: "85" },
//     { index: 47, label: 'SaleDepartment', class:'colSaleDepartment', active: false, display: true, width: "85" },
//     { index: 48, label: 'SaleComments', class:'colSaleComments', active: false, display: true, width: "85" },
//     { index: 49, label: 'SaleTerms', class:'colSaleTerms', active: false, display: true, width: "85" },
//     { index: 50, label: 'SaleCustomerName', class:'colSaleCustomerName', active: false, display: true, width: "85" },
//     { index: 51, label: 'DocketNumber', class:'colDocketNumber', active: false, display: true, width: "85" },
//     { index: 52, label: 'MemoLine', class:'colMemoLine', active: false, display: true, width: "85" },
//     { index: 53, label: 'UomQtySold', class:'colUomQtySold', active: false, display: true, width: "85" },
//     { index: 54, label: 'UomQtyBackorder ', class:'colUomQtyBackorder', active: false, display: true, width: "85" },
//   ];

//   templateObject.jobsalessummaryth.set(reset_data);


//   templateObject.initDate = () => {
//     Datehandler.initOneMonth();
//   };

//   templateObject.initDate();

//   templateObject.setDateAs = ( dateFrom = null ) => {
//     templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
//   };

//   templateObject.initUploadedImage = () => {
//     let imageData = localStorage.getItem("Image");
//     if (imageData) {
//       $("#uploadedImage").attr("src", imageData);
//       $("#uploadedImage").attr("width", "50%");
//     }
//   };

//   templateObject.loadReport = async (dateFrom, dateTo, ignoreDate = false) => {
//     templateObject.setDateAs(dateFrom);
//     LoadingOverlay.show();


//     let data = await CachedHttp.get(jobSalesApi.collectionNames.TJobSalesSummary, async () => {

//       let endPoint = jobSalesApi.collection.findByName(jobSalesApi.collectionNames.TJobSalesSummary);

//       endPoint.url.searchParams.set('IgnoreDates', ignoreDate);
//       endPoint.url.searchParams.set('ListType', "'Summary'");
//       endPoint.url.searchParams.set('DateFrom', '"' + dateFrom + '"');
//       endPoint.url.searchParams.set('DateTo', '"' + dateTo + '"');

//       const response = await endPoint.fetch();

//       if(response.ok) {
//         let data = await response.json();

//         return data;
//       }

//     }, {
//       requestParams: {
//         DateFrom: dateFrom,
//         DateTo: dateTo,
//         IgnoreDates: ignoreDate
//       },
//       useIndexDb: true,
//       useLocalStorage: false,
//       validate: (cachedResponse) => {
//         if (GlobalFunctions.isSameDay(cachedResponse.response.Params.DateFrom, dateFrom)
//         && GlobalFunctions.isSameDay(cachedResponse.response.Params.DateTo, dateTo)
//         && cachedResponse.response.Params.IgnoreDates == ignoreDate) {
//           return true;
//         }
//         return false;
//       }
//     });

//     if(data.response.tjobsalessummary) {
//       let records = [];
//       const array = data.response.tjobsalessummary;
//       let customers = _.groupBy(array, 'Customer');

//       for(let key in customers) {
//         records.push({
//           title: key || "Other",
//           entries: customers[key],
//           total: {}
//         });
//       }


//       templateObject.reportRecords.set(records);
//     }


//     LoadingOverlay.hide();

//   }



//   templateObject.initDate();
//   templateObject.setDateAs();
//   templateObject.initUploadedImage();


//   templateObject.loadReport(
//     GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//     GlobalFunctions.convertYearMonthDay($('#dateTo').val())
//   );

//   LoadingOverlay.hide();
// });

Template.jobsalessummary.events({

});

Template.jobsalessummary.helpers({
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
    return reportService.getJobSalesSummaryReport;
  },

  listParams: function() {
    return ['limitCount', 'limitFrom', 'dateFrom', 'dateTo', 'ignoreDate']
  },

  service: function () {
    return reportService
  },

  searchFunction: function () {
    return reportService.getJobSalesSummaryReportByKeyword;
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
