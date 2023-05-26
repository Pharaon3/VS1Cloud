import { SalesBoardService } from "../js/sales-service";
import { ReactiveVar } from "meteor/reactive-var";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from "../js/sidebar-service";
import "../lib/global/indexdbstorage.js";
import { Template } from 'meteor/templating';
import './salesOverview.html'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();


let defaultCurrencyCode = CountryAbbr;

Template.salesoverview.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.custfields = new ReactiveVar([]);
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);

  templateObject.getDataTableList = function(data) {
    let totalAmountEx =
      utilityService.modifynegativeCurrencyFormat(
        data.TotalAmount
      ) || 0.0;
    let totalTax =
      utilityService.modifynegativeCurrencyFormat(
        data.TotalTax
      ) || 0.0;
    let totalAmount =
      utilityService.modifynegativeCurrencyFormat(
        data.TotalAmountinc
      ) || 0.0;
    let totalPaid =
      utilityService.modifynegativeCurrencyFormat(
        data.Payment
      ) || 0.0;
    let totalOutstanding =
      utilityService.modifynegativeCurrencyFormat(
        data.Balance
      ) || 0.0;
    let salestatus = data.Status || '';
    if(data.Done == true){
      salestatus = "Deleted";
    }else if(data.CustomerName == ''){
      salestatus = "Deleted";
    };

    let dataList = [
      '<span style="display: none">' + (data.SaleDate != ""
      ? moment(data.SaleDate).format("DD/MM/YYYY")
      : data.SaleDate) + '</span>' + (data.SaleDate != ""
      ? moment(data.SaleDate).format("DD/MM/YYYY")
      : data.SaleDate),
      data.SaleId || "",
      data.Type || "",
      data.CustomerName || "",
      totalAmountEx || 0.0,
      totalTax || 0.0,
      totalAmount || 0.0,
      totalPaid || 0.0,
      totalOutstanding || 0.0,
      data.employeename || "",
      data.Comments || "",
      salestatus || "",
    ];
    return dataList;
  }

  let headerStructure = [
    { index: 0, label: 'Sale Date', class:'colSaleDate', active: true, display: true, width: "100" },
    { index: 1, label: 'Sales No.', class:'colSalesNo', active: true, display: true, width: "100" },
    { index: 2, label: 'Type', class:'colType', active: true, display: true, width: "100" },
    { index: 3, label: 'Customer', class:'colCustomer', active: true, display: true, width: "300" },
    { index: 4, label: 'Amount (Ex)', class:'colAmountEx', active: true, display: true, width: "150" },
    { index: 5, label: 'Tax', class:'colTax', active: true, display: true, width: "80" },
    { index: 6, label: 'Amount (Inc)', class:'colAmount', active: true, display: true, width: "150" },
    { index: 7, label: 'Paid', class:'colPaid', active: true, display: true, width: "80" },
    { index: 8, label: 'Balance Outstanding', class:'colBalanceOutstanding', active: true, display: true, width: "200" },
    { index: 9, label: 'Employee', class:'colEmployee', active: true, display: true, width: "100" },
    { index: 10, label: 'Comments', class: 'colComments', active: true, display: true, width: "100" },
    { index: 11, label: 'Status', class:'colStatus', active: true, display: true, width: "100" },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.salesoverview.onRendered(function () {
  $(".fullScreenSpin").css("display", "inline-block");
  let templateObject = Template.instance();

  let accountService = new AccountService();
  let salesService = new SalesBoardService();
  const customerList = [];
  let salesOrderTable;
  var splashArray = new Array();
  const dataTableList = [];
  const tableHeaderList = [];

  function MakeNegative() {
      $('td').each(function () {
          if ($(this).text().indexOf('-' + Currency) >= 0)
              $(this).addClass('text-danger')
      });

      $('td.colStatus').each(function(){
          if($(this).text() == "Deleted") $(this).addClass('text-deleted');
          if ($(this).text() == "Full") $(this).addClass('text-fullyPaid');
          if ($(this).text() == "Part") $(this).addClass('text-partialPaid');
          if ($(this).text() == "Rec") $(this).addClass('text-reconciled');
      });
  };

  templateObject.resetData = function (dataVal) {
    location.reload();
  };

  $("#tblSalesOverview tbody").on("click", "tr", function () {
    var listData = $(this).closest("tr").find(".colSalesNo").text();
    var transactiontype = $(event.target).closest("tr").find(".colType").text();
    var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
    if (listData && transactiontype) {
      if(checkDeleted == "Deleted"){
        swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
      }else{
        if (transactiontype === "Invoice") {
          FlowRouter.go("/invoicetemp?id=" + listData);
        } else if (transactiontype === "Quote") {
          FlowRouter.go("/quotecard?id=" + listData);
        } else if (transactiontype === "Sales Order") {
          FlowRouter.go("/salesordercard?id=" + listData);
        } else if (transactiontype === "Refund") {
          FlowRouter.go("/refundcard?id=" + listData);
        } else {
          //FlowRouter.go('/purchaseordercard?id=' + listData);
        }
      }
    }
  });

  
  templateObject.getAllFilterSalesOrderData = function (fromDate,toDate,ignoreDate) {
    sideBarService.getSalesListData(fromDate, toDate, ignoreDate, initialReportLoad, 0).then(function (data) {
        addVS1Data("TSalesList", JSON.stringify(data)).then(function (datareturn) {
            location.reload();
          }).catch(function (err) {
            location.reload();
          });
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
        // Meteor._reload.reload();
      });
  };

  let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
  let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
  let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
  if (urlParametersDateFrom) {
    if (urlParametersIgnoreDate == true) {
      $("#dateFrom").attr("readonly", true);
      $("#dateTo").attr("readonly", true);
    } else {
      $("#dateFrom").attr("readonly", false);
      $("#dateTo").attr("readonly", false);
      $("#dateFrom").val(urlParametersDateFrom != "" ? moment(urlParametersDateFrom).format("DD/MM/YYYY"): urlParametersDateFrom);
      $("#dateTo").val(urlParametersDateTo != ""? moment(urlParametersDateTo).format("DD/MM/YYYY"): urlParametersDateTo);
    }
  }

});

Template.salesoverview.events({
  "click .btnViewDeleted": async function (e) {
    $(".fullScreenSpin").css("display", "inline-block");
    e.stopImmediatePropagation();
    const templateObject = Template.instance();
    await clearData('TSalesList');
    $('.btnViewDeleted').css('display','none');
    $('.btnHideDeleted').css('display','inline-block');
    await templateObject.getAllSalesOrderData(true);
  },
  "click .btnHideDeleted": async function (e) {
    $(".fullScreenSpin").css("display", "inline-block");
    e.stopImmediatePropagation();
    let templateObject = Template.instance();
    await clearData('TSalesList');
    $('.btnHideDeleted').css('display','none');
    $('.btnViewDeleted').css('display','inline-block');
    await templateObject.getAllSalesOrderData(false);
  },
  "keyup #tblSalesOverview_filter input": function (event) {
    if ($(event.target).val() != "") {
      $(".btnRefreshSalesOverview").addClass("btnSearchAlert");
    } else {
      $(".btnRefreshSalesOverview").removeClass("btnSearchAlert");
    }
    if (event.keyCode == 13) {
      $(".btnRefresh").trigger("click");
    }
  },
  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();
    var currentBeginDate = new Date();
    var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    let fromDateMonth = currentBeginDate.getMonth() + 1;
    let fromDateDay = currentBeginDate.getDate();
    if (currentBeginDate.getMonth() + 1 < 10) {
      fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
    } else {
      fromDateMonth = currentBeginDate.getMonth() + 1;
    }

    if (currentBeginDate.getDate() < 10) {
      fromDateDay = "0" + currentBeginDate.getDate();
    }
    var toDate =
      currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
    let prevMonth11Date = moment()
      .subtract(reportsloadMonths, "months")
      .format("YYYY-MM-DD");

    sideBarService
      .getSalesListData(prevMonth11Date, toDate, true, initialReportLoad, 0)
      .then(function (dataSales) {
        addVS1Data("TSalesList", JSON.stringify(dataSales))
          .then(function (datareturn) {
            sideBarService
              .getAllInvoiceList(initialDataLoad, 0)
              .then(function (data) {
                addVS1Data("TInvoiceEx", JSON.stringify(data))
                  .then(function (datareturn) {
                    window.open('/salesoverview', '_self');
                  }).catch(function (err) {
                    window.open('/salesoverview', '_self');
                  });
              }).catch(function (err) {
                window.open('/salesoverview', '_self');
              });
          })
          .catch(function (err) {
            sideBarService
              .getAllInvoiceList(initialDataLoad, 0)
              .then(function (data) {
                addVS1Data("TInvoiceEx", JSON.stringify(data))
                  .then(function (datareturn) {
                    window.open('/salesoverview', '_self');
                  })
                  .catch(function (err) {
                    window.open("/salesoverview", "_self");
                  });
              })
              .catch(function (err) {
                window.open("/salesoverview", "_self");
              });
          });
      })
      .catch(function (err) {
        window.open("/salesoverview", "_self");
      });
  },
  
  "click .feeOnTopInput": function (event) {
    if ($(event.target).is(":checked")) {
      $(".feeInPriceInput").attr("checked", false);
    }
  },
  "click .feeInPriceInput": function (event) {
    if ($(event.target).is(":checked")) {
      $(".feeOnTopInput").attr("checked", false);
    }
  },
  "click #newSalesOrder": function (event) {
    FlowRouter.go("/salesordercard");
  },
  "click .salesOrderList": function (event) {
    FlowRouter.go("/salesorderslist");
  },
  "click #newInvoice": function (event) {
    FlowRouter.go("/invoicetemp");
  },
  "click #newRefund": function (event) {
    FlowRouter.go("/refundcard");
  },
  "click .invoiceList": function (event) {
    FlowRouter.go("/invoicelist");
  },
  "click .refundList": function (event) {
    FlowRouter.go("/refundlist");
  },
  "click .invoiceListBO": function (event) {
    FlowRouter.go("/invoicelistBO");
  },
  "click #newQuote": function (event) {
    FlowRouter.go("/quotecard");
  },
  "click .QuoteList": function (event) {
    FlowRouter.go("/quoteslist");
  },
  "click .btnTaxRateSettings": function (event) {
    $(".modal-backdrop").css("display", "none");
    FlowRouter.go("/taxratesettings");
  },
  "click .btnTermsSettings": function (event) {
    $(".modal-backdrop").css("display", "none");
    FlowRouter.go("/termsettings");
  },
  "click .btnCurrencySettings": function (event) {
    $(".modal-backdrop").css("display", "none");
    FlowRouter.go("/currenciessettings");
  },
  "click .chkDatatable": function (event) {
    var columns = $("#tblSalesOverview th");
    let columnDataValue = $(event.target)
      .closest("div")
      .find(".divcolumn")
      .text();

    $.each(columns, function (i, v) {
      let className = v.classList;
      let replaceClass = className[1];

      if (v.innerText == columnDataValue) {
        if ($(event.target).is(":checked")) {
          $("." + replaceClass + "").css("display", "table-cell");
          $("." + replaceClass + "").css("padding", ".75rem");
          $("." + replaceClass + "").css("vertical-align", "top");
        } else {
          $("." + replaceClass + "").css("display", "none");
        }
      }
    });
  },
  'click .chkSaleDate': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colSaleDate').addClass('showColumn');
      $('.colSaleDate').removeClass('hiddenColumn');
    } else {
      $('.colSaleDate').addClass('hiddenColumn');
      $('.colSaleDate').removeClass('showColumn');
    }
  },
  'click .chkSalesNo': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colSalesNo').addClass('showColumn');
      $('.colSalesNo').removeClass('hiddenColumn');
    } else {
      $('.colSalesNo').addClass('hiddenColumn');
      $('.colSalesNo').removeClass('showColumn');
    }
  },
  'click .chkType': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colType').addClass('showColumn');
      $('.colType').removeClass('hiddenColumn');
    } else {
      $('.colType').addClass('hiddenColumn');
      $('.colType').removeClass('showColumn');
    }
  },
  'click .chkCustomer': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colCustomer').addClass('showColumn');
      $('.colCustomer').removeClass('hiddenColumn');
    } else {
      $('.colCustomer').addClass('hiddenColumn');
      $('.colCustomer').removeClass('showColumn');
    }
  },
  'click .chkAmountEx': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colAmountEx').addClass('showColumn');
      $('.colAmountEx').removeClass('hiddenColumn');
    } else {
      $('.colAmountEx').addClass('hiddenColumn');
      $('.colAmountEx').removeClass('showColumn');
    }
  },
  'click .chkTax': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colTax').addClass('showColumn');
      $('.colTax').removeClass('hiddenColumn');
    } else {
      $('.colTax').addClass('hiddenColumn');
      $('.colTax').removeClass('showColumn');
    }
  },
  // displaysettings
  'click .chkAmount': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colAmount').addClass('showColumn');
      $('.colAmount').removeClass('hiddenColumn');
    } else {
      $('.colAmount').addClass('hiddenColumn');
      $('.colAmount').removeClass('showColumn');
    }
  },
  'click .chkPaid': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colPaid').addClass('showColumn');
      $('.colPaid').removeClass('hiddenColumn');
    } else {
      $('.colPaid').addClass('hiddenColumn');
      $('.colPaid').removeClass('showColumn');
    }
  },

  'click .chkBalanceOutstanding': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colBalanceOutstanding').addClass('showColumn');
      $('.colBalanceOutstanding').removeClass('hiddenColumn');
    } else {
        $('.colBalanceOutstanding').addClass('hiddenColumn');
        $('.colBalanceOutstanding').removeClass('showColumn');
    }
  },
  'click .chkStatus': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colStatus').addClass('showColumn');
      $('.colStatus').removeClass('hiddenColumn');
    } else {
      $('.colStatus').addClass('hiddenColumn');
      $('.colStatus').removeClass('showColumn');
    }
  },
  'click .chkEmployee': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colEmployee').addClass('showColumn');
      $('.colEmployee').removeClass('hiddenColumn');
    } else {
      $('.colEmployee').addClass('hiddenColumn');
      $('.colEmployee').removeClass('showColumn');
    }
  },
  'click .chkComments': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colComments').addClass('showColumn');
      $('.colComments').removeClass('hiddenColumn');
    } else {
      $('.colComments').addClass('hiddenColumn');
      $('.colComments').removeClass('showColumn');
    }
  },
  // display settings


  'change .rngRangeSaleDate': function(event) {
      let range = $(event.target).val();
      $(".spWidthSaleDate").html(range);
      $('.colSaleDate').css('width', range);
  },
  'change .rngRangeSalesNo': function(event) {
      let range = $(event.target).val();
      $(".spWidthSalesNo").html(range);
      $('.colSalesNo').css('width', range);
  },
  'change .rngRangeType': function(event) {
      let range = $(event.target).val();
      $(".spWidthType").html(range);
      $('.colType').css('width', range);
  },
  'change .rngRangeUnitPriceInc': function(event) {
      let range = $(event.target).val();
      $(".spWidthUnitPrice").html(range);
      $('.colUnitPriceInc').css('width', range);
  },
  'change .rngRangeUnitPriceEx': function(event) {
      let range = $(event.target).val();
      $('.colUnitPriceEx').css('width', range);
  },
  'change .rngRangeTax': function(event) {
      let range = $(event.target).val();
      $(".spWidthTax").html(range);
      $('.colTax').css('width', range);
  },
  'change .rngRangeAmountInc': function (event) {
      let range = $(event.target).val();
      //$(".spWidthAmount").html(range);
      $('.colAmountInc').css('width', range);
  },
  'change .rngRangeAmountEx': function (event) {
      let range = $(event.target).val();
      //$(".spWidthAmount").html(range);
      $('.colAmountEx').css('width', range);
  },
  'change .rngRangePaid': function (event) {
      let range = $(event.target).val();
      //$(".spWidthAmount").html(range);
      $('.colPaid').css('width', range);
  },
  'change .rngRangeBalanceOutstanding': function (event) {
      let range = $(event.target).val();
      $('.colBalanceOutstanding').css('width', range);
  },
  'change .rngRangeStatus': function (event) {
      let range = $(event.target).val();
      $('.colStatus').css('width', range);
  },
  'change .rngRangeAmount': function (event) {
      let range = $(event.target).val();
      $('.colAmount').css('width', range);
  },
  'change .rngRangeCustomer': function(event) {
      let range = $(event.target).val();
      $(".spWidthCustomer").html(range);
      $('.colCustomer').css('width', range);
  },
  'change .rngRangeEmployee': function(event) {
      let range = $(event.target).val();
      $(".spWidthEmployee").html(range);
      $('.colEmployee').css('width', range);
  },
  'change .rngRangeComments': function(event) {
      let range = $(event.target).val();
      $(".spWidthComments").html(range);
      $('.colComments').css('width', range);
  },
"blur .divcolumn": function (event) {
  let columData = $(event.target).html();
  let columHeaderUpdate = $(event.target).attr("valueupdate");
  $("th.col" + columHeaderUpdate + "").html(columData);
},
  "click .resetTable": function (event) {
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    // let isBatchSerialNoTracking = localStorage.getItem("CloudShowSerial") || false;
    // if(isBatchSerialNoTracking) {
    //   reset_data[11].display = true;
    // } else {
    //   reset_data[11].display = false;
    // }
    reset_data = reset_data.filter(redata => redata.display);

    $(".displaySettings").each(function (index) {
      let $tblrow = $(this);
      $tblrow.find(".divcolumn").text(reset_data[index].label);
      $tblrow.find(".custom-control-input").prop("checked", reset_data[index].active);

      let title = $("#tblSalesOverview").find("th").eq(index+1);
      $(title).html(reset_data[index].label);

      if (reset_data[index].active) {
        $('.col' + reset_data[index].class).addClass('showColumn');
        $('.col' + reset_data[index].class).removeClass('hiddenColumn');
      } else {
        $('.col' + reset_data[index].class).addClass('hiddenColumn');
        $('.col' + reset_data[index].class).removeClass('showColumn');
      }
      $(".rngRange" + reset_data[index].class).val('');
    });
  },
  "click .saveTable": async function (event) {
    let lineItems = [];
    $(".fullScreenSpin").css("display", "inline-block");

    $(".displaySettings").each(function (index) {
      var $tblrow = $(this);
      var fieldID = $tblrow.attr("custid") || 0;
      var colTitle = $tblrow.find(".divcolumn").text() || "";
      var colWidth = $tblrow.find(".custom-range").val() || 0;
      var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
      var colHidden = false;
      if ($tblrow.find(".custom-control-input").is(":checked")) {
        colHidden = true;
      } else {
        colHidden = false;
      }
      let lineItemObj = {
        index: parseInt(fieldID),
        label: colTitle,
        active: colHidden,
        width: parseInt(colWidth),
        class: colthClass,
        display: true
      };

      lineItems.push(lineItemObj);
    });

    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    reset_data = reset_data.filter(redata => redata.display == false);
    lineItems.push(...reset_data);
    lineItems.sort((a,b) => a.index - b.index);

    try {
      let erpGet = erpDb();
      let tableName = "tblSalesOverview";
      let employeeId = parseInt(localStorage.getItem('mySessionEmployeeLoggedID'))||0;
      let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);
      $(".fullScreenSpin").css("display", "none");
      if(added) {
        sideBarService.getNewCustomFieldsWithQuery(parseInt(localStorage.getItem('mySessionEmployeeLoggedID')),'').then(function (dataCustomize) {
            addVS1Data('VS1_Customize', JSON.stringify(dataCustomize));
        });
          swal({
            title: 'SUCCESS',
            text: "Display settings is updated!",
            type: 'success',
            showCancelButton: false,
            confirmButtonText: 'OK'
          }).then((result) => {
              if (result.value) {
                 $('#displaySettingsModal2').modal('hide');
              }
          });
      } else {
        swal("Something went wrong!", "", "error");
      }
    } catch (error) {
      $(".fullScreenSpin").css("display", "none");
      swal("Something went wrong!", "", "error");
    }
  },

  "change .rngRange": function (event) {
    let range = $(event.target).val();
    let columnDataValue = $(event.target)
      .closest("div")
      .prev()
      .find(".divcolumn")
      .text();
    var datable = $("#tblSalesOverview th");
    $.each(datable, function (i, v) {
      if (v.innerText == columnDataValue) {
        let className = v.className;
        let replaceClass = className.replace(/ /g, ".");
        $("." + replaceClass + "").css("width", range + "px");
      }
    });
  },
  
  "click #exportbtn": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblSalesOverview_wrapper .dt-buttons .btntabletocsv").click();
    $(".fullScreenSpin").css("display", "none");
  },
  "click .printConfirm": function (event) {
    playPrintAudio();
    setTimeout(function(){
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblSalesOverview_wrapper .dt-buttons .btntabletopdf").click();
    $(".fullScreenSpin").css("display", "none");
  }, delayTimeAfterSound);
  },
  "click .close": function (event) {
    var vid = document.getElementById("myVideo");
    vid.pause();
  },

});

Template.salesoverview.helpers({
  datatablerecords: () => {
    return Template.instance()
      .datatablerecords.get()
      .sort(function (a, b) {
        if (a.saledate == "NA") {
          return 1;
        } else if (b.saledate == "NA") {
          return -1;
        }
        return a.saledate.toUpperCase() > b.saledate.toUpperCase() ? 1 : -1;
      });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "tblSalesOverview",
    });
  },
  currentdate: () => {
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    return begunDate;
  },
  loggedCompany: () => {
    return localStorage.getItem("mySession") || "";
  },

  // custom fields displaysettings
  custfields: () => {
    return Template.instance().custfields.get();
  },

  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },
  apiFunction:function() { // do not use arrow function
    return sideBarService.getSalesListData
  },
  apiParams: function() {
    return ['dateFrom', 'dateTo', 'ignoredate', 'limitCount', 'limitFrom', 'deleteFilter'];
  },
  service: ()=>{
    return sideBarService;
  },
  datahandler: function () {
    let templateObject = Template.instance();
    return function(data) {
        let dataReturn =  templateObject.getDataTableList(data)
        return dataReturn
    }
  }
});
