import { ReportService } from "../report-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import GlobalFunctions from "../../GlobalFunctions";
import Datehandler from "../../DateHandler";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import { Template } from 'meteor/templating';
import "./customerdetailsreport.html"
import moment from "moment";

const reportService = new ReportService();
const utilityService = new UtilityService();
const taxRateService = new TaxRateService();
let defaultCurrencyCode = CountryAbbr;

const currentDate = new Date();

Template.customerdetailsreport.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.displaysettings = new ReactiveVar([]);

  let reset_data = [
    { index: 0, label: 'ID', class:'colLineId', active: false, display: true, width: "10", calc: false},
    { index: 1, label: 'Name', class:'colCompanyName', active: true, display: true, width: "200", calc: false},
    { index: 2, label: 'Phone', class:'colPhone', active: true, display: true, width: "150", calc: false },
    { index: 3, label: 'Type', class:'colType', active: true, display: true, width: "150", calc: false },
    { index: 4, label: 'Total (Ex)', class:'colTotalEx text-right', active: true, display: true, width: "150", calc: false },
    { index: 5, label: 'Total (Inc)', class:'colTotalInc text-right', active: true, display: true, width: "150", calc: false },
    { index: 6, label: 'Gross Profit', class:'colGrossProfit text-right', active: true, display: true, width: "150", calc: false },
    { index: 7, label: 'Margin', class:'colMargin', active: true, display: true, width: "150", calc: false },
    { index: 8, label: 'Address', class:'colAddress', active: true, display: true, width: "150", calc: false },
    { index: 9, label: 'City', class:'colCity', active: true, display: true, width: "150", calc: false },
    { index: 10, label: 'Zip', class:'colZip', active: true, display: true, width: "150", calc: false },
    { index: 11, label: 'State', class:'colState', active: true, display: true, width: "150", calc: false },
  ];
  templateObject.displaysettings.set(reset_data);
  templateObject.getReportDataRecord = function(data) {
    var dataList = [];
    if(data!='') {
      dataList =  [
        data.Name || "",
        data.Phone || "",
        data.Type || "",
        data["Total Amount (Ex)"] || "",
        data["Total Amount (Inc)"] || "",
        data["Gross Profit"] || "",
        data["Total Cost"] || "",
        data.Address || "",
        data["Address 2"] || "",
        data["Postcode"] || "",
        data["State"] || "",
      ];
      for(let i = 0 ; i < dataList.length ; i ++){
        dataList[i] = GlobalFunctions.generateSpan(dataList[i])
      }
    }else {
      dataList = [
        "", "", "", "", "", "", "", "", "", "", "",
      ]
    }
    return dataList;
  }
});

/*
Template.customerdetailsreport.onRendered(() => {
  const templateObject = Template.instance();
  LoadingOverlay.show();

  templateObject.init_reset_data = function () {
    let reset_data = [];
    reset_data = [
      { index: 1, label: 'Name', class:'colCompanyName', active: true, display: true, width: "200" },
      { index: 2, label: 'Phone', class:'colPhone', active: true, display: true, width: "150" },
      { index: 3, label: 'Type', class:'colType', active: true, display: true, width: "150" },
      { index: 4, label: 'Total (Ex)', class:'colTotalEx text-right', active: true, display: true, width: "150" },
      { index: 5, label: 'Total (Inc)', class:'colTotalInc text-right', active: true, display: true, width: "150" },
      { index: 6, label: 'Gross Profit', class:'colGrossProfit text-right', active: true, display: true, width: "150" },
      { index: 7, label: 'Margin', class:'colMargin', active: true, display: true, width: "150" },
      { index: 8, label: 'Address', class:'colAddress', active: true, display: true, width: "150" },
      { index: 9, label: 'City', class:'colCity', active: true, display: true, width: "150" },
      { index: 10, label: 'Zip', class:'colZip', active: true, display: true, width: "150" },
      { index: 11, label: 'State', class:'colState', active: true, display: true, width: "150" },
    ];
    templateObject.customerdetailsreportth.set(reset_data);
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

  templateObject.getCustomerDetailsData = async function (dateFrom, dateTo, ignoreDate) {

    templateObject.setDateAs(dateTo);
    getVS1Data('CustomerDetailsReport').then(function (dataObject) {
      if (dataObject.length == 0) {
        reportService.getCustomerDetailReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
          await addVS1Data('CustomerDetailsReport', JSON.stringify(data));
          templateObject.displayCustomerDetailsData(data);
        }).catch(function (err) {
        });
      } else {
        let data = JSON.parse(dataObject[0].data);
        templateObject.displayCustomerDetailsData(data);
      }
    }).catch(function (err) {
      reportService.getCustomerDetailReport(dateFrom, dateTo, ignoreDate).then(async function (data) {
        await addVS1Data('CustomerDetailsReport', JSON.stringify(data));
        templateObject.displayCustomerDetailsData(data);
      }).catch(function (err) {

      });
    });
  }

  templateObject.getCustomerDetailsData(
    GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
    GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
    false
  );
  templateObject.displayCustomerDetailsData = async function (data) {
    var splashArrayCustomerDetailsReport = new Array();
    let deleteFilter = false;
    // if (data.Params.Search.replace(/\s/g, "") == "") {
    //   deleteFilter = true;
    // } else {
    //   deleteFilter = false;
    // };

    for (let i = 0; i < data.tcustomersummaryreport.length; i++) {
      var dataList = [
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i].Company || "", "text-primary"),
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i].Phone || "", "text-primary"),
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i].Type || "", "text-primary"),
        GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tcustomersummaryreport[i]["Total Amount (Ex)"] || ""), "text-success"),
        GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tcustomersummaryreport[i]["Total Amount (Inc)"] || ""), "text-success"),
        GlobalFunctions.generateSpan(GlobalFunctions.showCurrency(data.tcustomersummaryreport[i]["Gross Profit"] || ""), "text-success"),
        "",
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i].Address || "", "text-primary"),
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i]["Address 2"] || "", "text-primary"),
        // data.tcustomersummaryreport[i]["CLIENT NAME"] || "",
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i].Postcode || "", "text-primary"),
        GlobalFunctions.generateSpan(data.tcustomersummaryreport[i].State || "", "text-primary"),
        // data.tcustomersummaryreport[i].DATE || "",
        // data.tcustomersummaryreport[i].DEBITSEX || "",
        // data.tcustomersummaryreport[i].DEBITSINC || "",
        // data.tcustomersummaryreport[i].DETAILS || "",
        // data.tcustomersummaryreport[i].FIXEDASSETID || "",
        // data.tcustomersummaryreport[i].GLOBALREF || "",
        // data.tcustomersummaryreport[i].ID || "",
        // data.tcustomersummaryreport[i].MEMO || "",
        // data.tcustomersummaryreport[i].PAYMENTID || "",
        // data.tcustomersummaryreport[i].PREPAYMENTID || "",
        // data.tcustomersummaryreport[i].PRODUCTDESCRIPTION || "",
        // data.tcustomersummaryreport[i].PRODUCTNAME || "",
        // data.tcustomersummaryreport[i].PURCHASEORDERID || "",
        // data.tcustomersummaryreport[i].REFERENCENO || "",
        // data.tcustomersummaryreport[i].REPNAME || "",
        // data.tcustomersummaryreport[i].SALEID || "",
        // data.tcustomersummaryreport[i].TAXCODE || "",
        // data.tcustomersummaryreport[i].TAXRATE || "",
        // data.tcustomersummaryreport[i].TYPE || "",

      ];
      splashArrayCustomerDetailsReport.push(dataList);
      templateObject.transactiondatatablerecords.set(splashArrayCustomerDetailsReport);
  
    }


    if (templateObject.transactiondatatablerecords.get()) {
      setTimeout(function () {
        MakeNegative();
      }, 100);
    }
    //$('.fullScreenSpin').css('display','none');

    setTimeout(function () {
      $('#tableExport').DataTable({
        data: splashArrayCustomerDetailsReport,
        "bsort": false,
        searching: false,
        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        columnDefs: [
          {
            targets: 0,
            className: "colCompanyName",
          },
          {
            targets: 1,
            className: "colPhone"
          },
          {
            targets: 2,
            className: "colType"
          },
          {
            targets: 3,
            className: "colTotalEx text-right",
          },
          {
            targets: 4,
            className: "colTotalInc text-right",
          },
          {
            targets: 5,
            className: "colGrossProfit text-right",
          },
          {
            targets: 6,
            className: "colMargin",
          },
          {
            targets: 7,
            className: "colAddress",
          },
          {
            targets: 8,
            className: "colCity",
          },
          {
            targets: 9,
            className: "colZip",
          },
          {
            targets: 10,
            className: "colState",
          },
        ],
        select: true,
        destroy: true,
        colReorder: true,
        pageLength: initialDatatableLoad,
        lengthMenu: [[initialDatatableLoad, -1], [initialDatatableLoad, "All"]],
        info: true,
        // responsive: true,
        "order": [],
        action: function () {
          $('#' + currenttablename).DataTable().ajax.reload();
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
  $("#tblgeneralledger tbody").on("click", "tr", function () {
    var listData = $(this).closest("tr").children('td').eq(8).text();
    var checkDeleted = $(this).closest("tr").find(".colStatus").text() || "";

    if (listData) {
      if (checkDeleted == "Deleted") {
        swal("You Cannot View This Transaction", "Because It Has Been Deleted", "info");
      } else {
        FlowRouter.go("/journalentrycard?id=" + listData);
      }
    }
  });


  LoadingOverlay.hide();
});
*/
// Template.customerdetailsreport.onRendered(() => {
//   LoadingOverlay.show();
//   const templateObject = Template.instance();

//   let taxRateService = new TaxRateService();
//   let utilityService = new UtilityService();

//   templateObject.initDate = () => {
//     Datehandler.initOneMonth();
//   };

//   templateObject.setDateAs = ( dateFrom = null ) => {
//     templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
//   };

//   templateObject.getCustomerDetailReportData = async function ( dateFrom, dateTo, ignoreDate ) {
//     LoadingOverlay.show();
//     templateObject.setDateAs( dateFrom );

//     let reset_data = [
//       { index: 1, label: 'Company Name', class:'colCompanyName', active: true, display: true, width: "85" },
//       { index: 2, label: 'Rep', class:'colRep', active: true, display: true, width: "85" },
//       { index: 3, label: 'Discount Type', class:'colDiscountType', active: true, display: true, width: "85" },
//       { index: 4, label: 'Discount', class:'colDiscount', active: true, display: true, width: "85" },
//       { index: 5, label: 'Special Discount', class:'colSpecialDiscount', active: true, display: true, width: "85" },
//       { index: 6, label: 'Orig Price', class:'colOrigPrice', active: true, display: true, width: "85" },
//       { index: 7, label: 'Line Price', class:'colLinePrice', active: true, display: true, width: "85" },
//       { index: 8, label: 'Product ID', class:'colProductID', active: true, display: true, width: "85" },
//       { index: 9, label: 'Description', class:'colDescription', active: true, display: true, width: "85" },
//       { index: 10, label: 'Sub Group', class:'colSubGroup', active: true, display: true, width: "85" },
//       { index: 11, label: 'Type', class:'colType', active: true, display: true, width: "85" },
//       { index: 12, label: 'Dept', class:'colDept', active: true, display: true, width: "85" },
//       { index: 13, label: 'Customer ID', class:'colCustomerID', active: false, display: true, width: "85" },
//       { index: 14, label: 'Password', class:'colPassword', active: false, display: true, width: "85" },
//       { index: 15, label: 'Test', class:'colTest', active: false, display: true, width: "85" },
//       { index: 16, label: 'Birthday', class:'colBirthday', active: false, display: true, width: "85" },
//     ];

//     templateObject.customerdetailsreportth.set(reset_data);


//     let data = [];
//     if (!localStorage.getItem('VS1CustomerDetails_Report')) {
//     data = await reportService.getCustomerDetailReport( dateFrom, dateTo, ignoreDate);
//       if( data.tcustomersummaryreport.length > 0 ){
//         localStorage.setItem('VS1CustomerDetails_Report', JSON.stringify(data)||'');
//       }
//     }else{
//       data = JSON.parse(localStorage.getItem('VS1CustomerDetails_Report'));
//     }
//     let reportData = [];
//     if( data.tcustomersummaryreport.length > 0 ){
//         let reportGroups = [];

//         let reportSummary = data.tcustomersummaryreport.map(el => {
//           let resultobj = {};
//           Object.entries(el).map(([key, val]) => {
//               resultobj[key.split(" ").join("_").replace(/\W+/g, '')] = val;
//               return resultobj;
//           })
//           return resultobj;
//         })

//         for (const item of reportSummary) {
//             let isExist = reportGroups.filter((subitem) => {
//                 if( subitem.EMAIL == item.EMAIL ){
//                   subitem.SubAccounts.push(item)
//                   return subitem
//                 }
//             });

//             if( isExist.length == 0 ){
//               reportGroups.push({
//                   SubAccounts: [item],
//                   TotalEx: 0,
//                   TotalInc: 0,
//                   TotalGrossProfit: 0,
//                   ...item
//               });
//             }
//         }

//         reportData = reportGroups.filter((item) => {
//             let TotalEx = 0;
//             let TotalInc = 0;
//             let TotalGrossProfit = 0;
//             item.SubAccounts.map((subitem) => {
//               TotalEx += subitem['Total_Amount_Ex'];
//               TotalInc += subitem['Total_Amount_Inc'];
//               TotalGrossProfit += subitem['Gross_Profit'];
//             });
//             item.TotalEx = TotalEx;
//             item.TotalInc = TotalInc;
//             item.TotalGrossProfit = TotalGrossProfit;
//             return item;
//         });
//     }

//     templateObject.records.set(reportData);
//     LoadingOverlay.hide();
//     setTimeout(function() {
//         MakeNegative();
//     }, 1000);
//   }

//   /**
//    * This function will load
//    * @param {*} dateFrom
//    * @param {*} dateTo
//    * @param {*} ignoreDate
//    */
//   // templateObject.getReport = async (dateFrom, dateTo, ignoreDate = false) => {
//   //   LoadingOverlay.show();
//   //   let dataObj = await reportService.getCustomerDetails(
//   //     dateFrom,
//   //     dateTo,
//   //     ignoreDate
//   //   );

//   //   LoadingOverlay.hide();
//   // };



//   templateObject.initDate();
//   templateObject.getCustomerDetailReportData(
//     GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
//     GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
//     false
//   );
//   templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )
//   // templateObject.getReport(
//   //   `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`,
//   //   moment(currentDate).format("YYYY-MM-DD")
//   // );
//   LoadingOverlay.hide();
// });

Template.customerdetailsreport.events({

});

Template.customerdetailsreport.helpers({
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
    return reportService.getCustomerDetailReport;
  },

  listParams: function() {
    return ['limitCount', 'limitFrom', 'dateFrom', 'dateTo', 'ignoreDate']
  },

  service: function () {
    return reportService
  },

  searchFunction: function () {
    return reportService.getCustomerDetailReportByKeyword;
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
