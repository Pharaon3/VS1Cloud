import {PaymentsService} from '../payments/payments-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';

import './customerAwaitingPayments.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.customerawaitingpayments.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.selectedAwaitingPayment = new ReactiveVar([]);

    templateObject.custfields = new ReactiveVar([]);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.convertedStatus = new ReactiveVar();

    templateObject.getDataTableList = function(data){
      let amount = utilityService.modifynegativeCurrencyFormat(data.TotalAmountinc) || 0.00;
       let applied = utilityService.modifynegativeCurrencyFormat(data.Payment) || 0.00;
       // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
       let balance = utilityService.modifynegativeCurrencyFormat(data.Balance) || 0.00;
       let totalPaid = utilityService.modifynegativeCurrencyFormat(data.Balance) || 0.00;
       let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.Balance) || 0.00;
       let totalOrginialAmount = utilityService.modifynegativeCurrencyFormat(data.TotalAmountinc) || 0.00;

       var dueDateCal = new Date(data.dueDate);
       var currentDateCal = new Date();
       let overDueDays = 0;
       let overDueDaysText = '';
       let overDueType = 'text-Green';
       let salestatus = data.QuoteStatus || '';
       if(data.Deleted == true){
         salestatus = "Deleted";
       };

       if (dueDateCal < currentDateCal) {
           overDueDays = Math.round((currentDateCal-dueDateCal)/(1000*60*60*24));
           if(overDueDays > 0){
             if(overDueDays == 1){
                overDueDaysText = overDueDays + ' Day';
              }else{
                overDueDaysText = overDueDays + ' Days';
              }
           if(overDueDays <= 30){
             overDueType = 'text-Yellow';
           }else if(overDueDays <= 60){
             overDueType = 'text-Orange';
           }else{
             overDueType = 'text-deleted';
           };

         }
       };
       let chkBox = '<div class="custom-control custom-switch chkBox chkPaymentCard pointer text-center" overduetype="'+overDueType+'"><input name="pointer" class="custom-control-input chkBox notevent pointer" type="checkbox" id="f-' + data.SaleId + '" name="' + data.SaleId + '" value="' + totalOutstanding + '"><label class="custom-control-label chkBox pointer" for="f--' + data.SaleId +
           '"></label></div>'; //switchbox

      let dataList = [
          chkBox,
          overDueDaysText || '',
          '<span style="display:none;">'+(data.SaleDate !=''? moment(data.SaleDate).format("YYYY/MM/DD"): data.SaleDate)+'</span>'+(data.SaleDate !=''? moment(data.SaleDate).format("DD/MM/YYYY"): data.SaleDate),
          data.CustomerName || '',
          data.SaleId || '',
          data.BORef || '',
          amount || 0.00,
          totalOrginialAmount || 0.00,
          totalOutstanding || 0.00,
          data.ClassName || '',
          data.PaymentMethodName || '',
          data.Comments || '',
          salestatus || '',
      ];
      return dataList;
    }

    let checkBoxHeader = `<div class="custom-control custom-switch colChkBoxAll chkBoxAll text-center pointer">
        <input name="pointer" class="custom-control-input colChkBoxAll pointer" type="checkbox" id="colChkBoxAll" value="0">
        <label class="custom-control-label colChkBoxAll" for="colChkBoxAll"></label>
        </div>`;

    let headerStructure = [
    { index: 0, label: 'checkBoxHeader', class: "colCheckBox", active: true, display: false, width: "40" },
    { index: 1, label: "Overdue", class: "colOverdueDays", active: true, display: true, width: "100" },
    { index: 2, label: "Date", class: "colPaymentDate", active: true, display: true, width: "100" },
    { index: 3, label: "Customer Name", class: "colCustomerName", active: true, display: true, width: "200" },
    { index: 4, label: "Sales No.", class: "colPaymentId", active: true, display: true, width: "100" },
    { index: 5, label: "Ref No.", class: "colReceiptNo", active: true, display: true, width: "100" },
    { index: 6, label: "Paid", class: "colPaymentAmount", active: true, display: true, width: "100" },
    { index: 7, label: "Original", class: "colApplied", active: true, display: true, width: "100" },
    { index: 8, label: "Outstanding", class: "colBalance", active: true, display: true, width: "100" },
    { index: 9, label: "Department", class: "colDepartment", active: true, display: true, width: "100" },
    { index: 10, label: "Payment Method", class: "colPaymentMethod", active: false, display: true, width: "300" },
    { index: 11, label: "Comments", class: "colNotes", active: true, display: true, width: "300" },
    { index: 12, label: "Status", class: "colStatus", active: true, display: true, width: "100" },
  ];
  templateObject.tableheaderrecords.set(headerStructure);
});

Template.customerawaitingpayments.onRendered(function () {
    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    let paymentService = new PaymentsService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];

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

    var url = window.location.href;
    let customerID = 0;
    if (url.indexOf("customerawaitingpayments?id=") > 0) {
        newurl = new URL(window.location.href);
        customerID = ( !isNaN(newurl.searchParams.get("id")) )? newurl.searchParams.get("id") : 0;
    }


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


    templateObject.resetData = function (dataVal) {
        location.reload();
    }

    let contactID = FlowRouter.current().queryParams.contactid ||'';
    // $('#tblcustomerAwaitingPayment').DataTable();
    templateObject.getAllCustomerPaymentData = function () {
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

        getVS1Data('TAwaitingCustomerPayment').then(function (dataObject) {
            if (dataObject.length == 0) {
              sideBarService.getAllAwaitingCustomerPayment(prevMonth11Date,toDate, true,initialReportLoad,0,contactID).then(function (data) {
                  let lineItems = [];
                  let lineItemObj = {};
                  addVS1Data('TAwaitingCustomerPayment', JSON.stringify(data));
                  if (data.Params.IgnoreDates == true) {
                      $('#dateFrom').attr('readonly', true);
                      $('#dateTo').attr('readonly', true);
                      //FlowRouter.go('/customerawaitingpayments?ignoredate=true');
                  } else {
                    $('#dateFrom').attr('readonly', false);
                    $('#dateTo').attr('readonly', false);
                      $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                      $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                  }

                  for (let i = 0; i < data.tsaleslist.length; i++) {
                      let amount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;
                      let applied = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Payment) || 0.00;
                      // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                      let balance = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                      let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                      let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                      let totalOrginialAmount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;

                      var dueDateCal = new Date(data.tsaleslist[i].dueDate);
                      var currentDateCal = new Date();
                      let overDueDays = 0;
                      let overDueDaysText = '';
                      let overDueType = 'text-Green';

                      if (dueDateCal < currentDateCal) {
                          overDueDays = Math.round((currentDateCal-dueDateCal)/(1000*60*60*24));
                          if(overDueDays > 0){
                          if(overDueDays == 1){
                            overDueDaysText = overDueDays + ' Day';
                          }else{
                            overDueDaysText = overDueDays + ' Days';
                          }
                          if(overDueDays <= 30){
                            overDueType = 'text-Yellow';
                          }else if(overDueDays <= 60){
                            overDueType = 'text-Orange';
                          }else{
                            overDueType = 'text-deleted';
                          }
                        }
                      }

                      var dataList = {
                          id: data.tsaleslist[i].SaleId || '',
                          sortdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD") : data.tsaleslist[i].SaleDate,
                          paymentdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
                          customername: data.tsaleslist[i].CustomerName || '',
                          paymentamount: amount || 0.00,
                          applied: applied || 0.00,
                          balance: balance || 0.00,
                          originalamount: totalOrginialAmount || 0.00,
                          outsandingamount: totalOutstanding || 0.00,
                          // bankaccount: data.tsaleslist[i].GLAccountName || '',
                          department: data.tsaleslist[i].ClassName || '',
                          refno: data.tsaleslist[i].BORef || '',
                          paymentmethod: data.tsaleslist[i].PaymentMethodName || '',
                          notes: data.tsaleslist[i].Comments || '',
                          overduedays:overDueDaysText,
                          overduetype:overDueType,
                      };
                      //if (data.tsaleslist[i].Balance != 0) {
                        if( customerID != 0 ){
                            if (data.tsaleslist[i].Balance != 0 && data.tsaleslist[i].ClientId == customerID ) {
                                dataTableList.push(dataList);
                            }
                        }else{
                          dataTableList.push(dataList);
                        }
                    //  }

                  }
                  templateObject.datatablerecords.set(dataTableList);
                  if (templateObject.datatablerecords.get()) {

                      Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblcustomerAwaitingPayment', function (error, result) {
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
                                      let columnindex = customcolumn[i].index + 1;

                                      if (hiddenColumn == true) {

                                          $("." + columnClass + "").addClass('hiddenColumn');
                                          $("." + columnClass + "").removeClass('showColumn');
                                      } else if (hiddenColumn == false) {
                                          $("." + columnClass + "").removeClass('hiddenColumn');
                                          $("." + columnClass + "").addClass('showColumn');
                                      }

                                  }
                              }

                          }
                      });

                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                  }

                  $('.fullScreenSpin').css('display', 'none');
                  setTimeout(function () {
                      //$.fn.dataTable.moment('DD/MM/YY');
                      $('#tblcustomerAwaitingPayment').DataTable({
                          columnDefs: [{
                                  "orderable": false,
                                  "targets": 0
                              }, {
                                  type: 'date',
                                  targets: 1
                              }
                          ],
                          "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                          buttons: [{
                                  extend: 'excelHtml5',
                                  text: '',
                                  download: 'open',
                                  className: "btntabletocsv hiddenColumn",
                                  filename: "Outstanding Invoices - " + moment().format(),
                                  orientation: 'portrait',
                                  exportOptions: {
                                      columns: ':visible:not(.chkBox)',
                                      format: {
                                          body: function (data, row, column) {
                                              if (data.includes("</span>")) {
                                                  var res = data.split("</span>");
                                                  data = res[1];
                                              }

                                              return column === 1 ? data.replace(/<.*?>/ig, "") : data;

                                          }
                                      }
                                  }
                              }, {
                                  extend: 'print',
                                  download: 'open',
                                  className: "btntabletopdf hiddenColumn",
                                  text: '',
                                  title: 'Supplier Payment',
                                  filename: "Outstanding Invoices - " + moment().format(),
                                  exportOptions: {
                                      columns: ':visible:not(.chkBox)',
                                      stripHtml: false
                                  }
                              }
                          ],
                          select: true,
                          destroy: true,
                          colReorder: true,
                          colReorder: {
                              fixedColumnsLeft: 1
                          },
                          // bStateSave: true,
                          // rowId: 0,
                          pageLength: initialReportDatatableLoad,
                          "bLengthChange": false,


                          // pageLength: 25,
                          // lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                          info: true,
                          responsive: true,
                          "order": [[ 2, "desc" ],[ 4, "desc" ]],
                          // "aaSorting": [[1,'desc']],
                          action: function () {
                              $('#tblcustomerAwaitingPayment').DataTable().ajax.reload();
                          },
                          "fnDrawCallback": function (oSettings) {
                            let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                              $('.paginate_button.page-item').removeClass('disabled');
                              $('#tblcustomerAwaitingPayment_ellipsis').addClass('disabled');

                              if (oSettings._iDisplayLength == -1) {
                                  if (oSettings.fnRecordsDisplay() > 150) {
                                      $('.paginate_button.page-item.previous').addClass('disabled');
                                      $('.paginate_button.page-item.next').addClass('disabled');
                                  }
                              } else {}
                              if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                  $('.paginate_button.page-item.next').addClass('disabled');
                              }
                              $('.paginate_button.next:not(.disabled)', this.api().table().container())
                              .on('click', function () {
                                  $('.fullScreenSpin').css('display', 'inline-block');
                                  let dataLenght = oSettings._iDisplayLength;

                                  var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                  var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                  let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                  let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                  if(data.Params.IgnoreDates == true){
                                    sideBarService.getAllAwaitingCustomerPayment(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay(),contactID).then(function (dataObjectnew) {
                                        getVS1Data('TAwaitingCustomerPayment').then(function (dataObjectold) {
                                            if (dataObjectold.length == 0) {}
                                            else {
                                                let dataOld = JSON.parse(dataObjectold[0].data);
                                                var thirdaryData = $.merge($.merge([], dataObjectnew.tsaleslist), dataOld.tsaleslist);
                                                let objCombineData = {
                                                    Params: dataOld.Params,
                                                    tsaleslist: thirdaryData
                                                }

                                                addVS1Data('TAwaitingCustomerPayment', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                    templateObject.resetData(objCombineData);
                                                    $('.fullScreenSpin').css('display', 'none');
                                                }).catch(function (err) {
                                                    $('.fullScreenSpin').css('display', 'none');
                                                });

                                            }
                                        }).catch(function (err) {});

                                    }).catch(function (err) {
                                        $('.fullScreenSpin').css('display', 'none');
                                    });
                                  }else{
                                  sideBarService.getAllAwaitingCustomerPayment(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay(),contactID).then(function (dataObjectnew) {
                                      getVS1Data('TAwaitingCustomerPayment').then(function (dataObjectold) {
                                          if (dataObjectold.length == 0) {}
                                          else {
                                              let dataOld = JSON.parse(dataObjectold[0].data);
                                              var thirdaryData = $.merge($.merge([], dataObjectnew.tsaleslist), dataOld.tsaleslist);
                                              let objCombineData = {
                                                  Params: dataOld.Params,
                                                  tsaleslist: thirdaryData
                                              }

                                              addVS1Data('TAwaitingCustomerPayment', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                  templateObject.resetData(objCombineData);
                                                  $('.fullScreenSpin').css('display', 'none');
                                              }).catch(function (err) {
                                                  $('.fullScreenSpin').css('display', 'none');
                                              });

                                          }
                                      }).catch(function (err) {});

                                  }).catch(function (err) {
                                      $('.fullScreenSpin').css('display', 'none');
                                  });
                                }
                              });

                              setTimeout(function () {
                                  MakeNegative();
                              }, 100);
                          },
                          language: { search: "",searchPlaceholder: "Search List..." },
                          "fnInitComplete": function () {
                            this.fnPageChange('last');
                            if(data.Params.Search.replace(/\s/g, "") == ""){
                              $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblcustomerAwaitingPayment_filter");
                            }else{
                              $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblcustomerAwaitingPayment_filter");
                            };
                               $("<button class='btn btn-primary btnRefreshCustomerAwaiting' type='button' id='btnRefreshCustomerAwaiting' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblcustomerAwaitingPayment_filter");
                               $('.myvarFilterForm').appendTo(".colDateFilter");
                           },
                           "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                             let countTableData = data.Params.Count || 0; //get count from API data

                               return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                           }

                      }).on('page', function () {
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                          let draftRecord = templateObject.datatablerecords.get();
                          templateObject.datatablerecords.set(draftRecord);
                      }).on('column-reorder', function () {}).on('length.dt', function (e, settings, len) {
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      });
                      $('.fullScreenSpin').css('display', 'none');

                  }, 0);

                  var columns = $('#tblcustomerAwaitingPayment th');
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
                  $('div.dataTables_filter input').addClass('form-control form-control-sm');


              }).catch(function (err) {
                  // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                  $('.fullScreenSpin').css('display', 'none');
                  // Meteor._reload.reload();
              });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsaleslist;
                let lineItems = [];
                let lineItemObj = {};
                if (data.Params.IgnoreDates == true) {
                    $('#dateFrom').attr('readonly', true);
                    $('#dateTo').attr('readonly', true);
                    //FlowRouter.go('/customerawaitingpayments?ignoredate=true');
                } else {
                  $('#dateFrom').attr('readonly', false);
                  $('#dateTo').attr('readonly', false);
                    $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                    $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                }

                for (let i = 0; i < data.tsaleslist.length; i++) {
                    let amount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;
                    let applied = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Payment) || 0.00;
                    // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let balance = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    let totalOrginialAmount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;

                    var dueDateCal = new Date(data.tsaleslist[i].dueDate);
                    var currentDateCal = new Date();
                    let overDueDays = 0;
                    let overDueDaysText = '';
                    let overDueType = 'text-Green';

                    if (dueDateCal < currentDateCal) {
                        overDueDays = Math.round((currentDateCal-dueDateCal)/(1000*60*60*24));
                        if(overDueDays > 0){
                        if(overDueDays == 1){
                          overDueDaysText = overDueDays + ' Day';
                        }else{
                          overDueDaysText = overDueDays + ' Days';
                        }
                        if(overDueDays <= 30){
                          overDueType = 'text-Yellow';
                        }else if(overDueDays <= 60){
                          overDueType = 'text-Orange';
                        }else{
                          overDueType = 'text-deleted';
                        }
                      }
                    }


                    var dataList = {
                        id: data.tsaleslist[i].SaleId || '',
                        sortdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD") : data.tsaleslist[i].SaleDate,
                        paymentdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
                        customername: data.tsaleslist[i].CustomerName || '',
                        paymentamount: amount || 0.00,
                        applied: applied || 0.00,
                        balance: balance || 0.00,
                        originalamount: totalOrginialAmount || 0.00,
                        outsandingamount: totalOutstanding || 0.00,
                        // bankaccount: data.tsaleslist[i].GLAccountName || '',
                        department: data.tsaleslist[i].ClassName || '',
                        refno: data.tsaleslist[i].BORef || '',
                        paymentmethod: data.tsaleslist[i].PaymentMethodName || '',
                        notes: data.tsaleslist[i].Comments || '',
                        overduedays:overDueDaysText,
                        overduetype:overDueType,
                    };
                    //if (data.tsaleslist[i].Balance != 0) {
                        if( customerID != 0 ){
                            if (data.tsaleslist[i].Balance != 0 && data.tsaleslist[i].ClientId == customerID ) {
                                dataTableList.push(dataList);
                            }
                        }else{
                          dataTableList.push(dataList);
                        }
                    //}

                }
                templateObject.datatablerecords.set(dataTableList);
                if (templateObject.datatablerecords.get()) {

                    Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblcustomerAwaitingPayment', function (error, result) {
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
                                    let columnindex = customcolumn[i].index + 1;

                                    if (hiddenColumn == true) {

                                        $("." + columnClass + "").addClass('hiddenColumn');
                                        $("." + columnClass + "").removeClass('showColumn');
                                    } else if (hiddenColumn == false) {
                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                        $("." + columnClass + "").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });

                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function () {
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblcustomerAwaitingPayment').DataTable({
                        columnDefs: [{
                                "orderable": false,
                                "targets": 0
                            }, {
                                type: 'date',
                                targets: 1
                            }
                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Outstanding Invoices - " + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible:not(.chkBox)',
                                    format: {
                                        body: function (data, row, column) {
                                            if (data.includes("</span>")) {
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, "") : data;

                                        }
                                    }
                                }
                            }, {
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Supplier Payment',
                                filename: "Outstanding Invoices - " + moment().format(),
                                exportOptions: {
                                    columns: ':visible:not(.chkBox)',
                                    stripHtml: false
                                }
                            }
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        colReorder: {
                            fixedColumnsLeft: 1
                        },
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialReportDatatableLoad,
                        "bLengthChange": false,


                        // pageLength: 25,
                        // lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 2, "desc" ],[ 4, "desc" ]],
                        // "aaSorting": [[1,'desc']],
                        action: function () {
                            $('#tblcustomerAwaitingPayment').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblcustomerAwaitingPayment_ellipsis').addClass('disabled');

                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {
                                    $('.paginate_button.page-item.previous').addClass('disabled');
                                    $('.paginate_button.page-item.next').addClass('disabled');
                                }
                            } else {}
                            if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }
                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function () {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                let dataLenght = oSettings._iDisplayLength;

                                var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                if(data.Params.IgnoreDates == true){
                                  sideBarService.getAllAwaitingCustomerPayment(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay(),contactID).then(function (dataObjectnew) {
                                      getVS1Data('TAwaitingCustomerPayment').then(function (dataObjectold) {
                                          if (dataObjectold.length == 0) {}
                                          else {
                                              let dataOld = JSON.parse(dataObjectold[0].data);
                                              var thirdaryData = $.merge($.merge([], dataObjectnew.tsaleslist), dataOld.tsaleslist);
                                              let objCombineData = {
                                                  Params: dataOld.Params,
                                                  tsaleslist: thirdaryData
                                              }

                                              addVS1Data('TAwaitingCustomerPayment', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                  templateObject.resetData(objCombineData);
                                                  $('.fullScreenSpin').css('display', 'none');
                                              }).catch(function (err) {
                                                  $('.fullScreenSpin').css('display', 'none');
                                              });

                                          }
                                      }).catch(function (err) {});

                                  }).catch(function (err) {
                                      $('.fullScreenSpin').css('display', 'none');
                                  });
                                }else{
                                sideBarService.getAllAwaitingCustomerPayment(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay(),contactID).then(function (dataObjectnew) {
                                    getVS1Data('TAwaitingCustomerPayment').then(function (dataObjectold) {
                                        if (dataObjectold.length == 0) {}
                                        else {
                                            let dataOld = JSON.parse(dataObjectold[0].data);
                                            var thirdaryData = $.merge($.merge([], dataObjectnew.tsaleslist), dataOld.tsaleslist);
                                            let objCombineData = {
                                                Params: dataOld.Params,
                                                tsaleslist: thirdaryData
                                            }

                                            addVS1Data('TAwaitingCustomerPayment', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                templateObject.resetData(objCombineData);
                                                $('.fullScreenSpin').css('display', 'none');
                                            }).catch(function (err) {
                                                $('.fullScreenSpin').css('display', 'none');
                                            });

                                        }
                                    }).catch(function (err) {});

                                }).catch(function (err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                              }
                            });

                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function () {
                          this.fnPageChange('last');
                          if(data.Params.Search.replace(/\s/g, "") == ""){
                            $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblcustomerAwaitingPayment_filter");
                          }else{
                            $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblcustomerAwaitingPayment_filter");
                          };
                             $("<button class='btn btn-primary btnRefreshCustomerAwaiting' type='button' id='btnRefreshCustomerAwaiting' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblcustomerAwaitingPayment_filter");
                             $('.myvarFilterForm').appendTo(".colDateFilter");
                         },
                         "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                           let countTableData = data.Params.Count || 0; //get count from API data

                             return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                         }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {}).on('length.dt', function (e, settings, len) {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });
                    $('.fullScreenSpin').css('display', 'none');

                }, 0);

                var columns = $('#tblcustomerAwaitingPayment th');
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
                $('div.dataTables_filter input').addClass('form-control form-control-sm');


            }
        }).catch(function (err) {
            sideBarService.getAllAwaitingCustomerPayment(prevMonth11Date,toDate, true,initialReportLoad,0,contactID).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                addVS1Data('TAwaitingCustomerPayment', JSON.stringify(data));
                if (data.Params.IgnoreDates == true) {
                    $('#dateFrom').attr('readonly', true);
                    $('#dateTo').attr('readonly', true);
                    //FlowRouter.go('/customerawaitingpayments?ignoredate=true');
                } else {
                    $('#dateFrom').attr('readonly', false);
                    $('#dateTo').attr('readonly', false);
                    $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                    $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                }

                for (let i = 0; i < data.tsaleslist.length; i++) {
                    let amount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;
                    let applied = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Payment) || 0.00;
                    // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let balance = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    let totalOrginialAmount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;

                    var dueDateCal = new Date(data.tsaleslist[i].dueDate);
                    var currentDateCal = new Date();
                    let overDueDays = 0;
                    let overDueDaysText = '';
                    let overDueType = 'text-Green';

                    if (dueDateCal < currentDateCal) {
                        overDueDays = Math.round((currentDateCal-dueDateCal)/(1000*60*60*24));
                        if(overDueDays > 0){
                        if(overDueDays == 1){
                          overDueDaysText = overDueDays + ' Day';
                        }else{
                          overDueDaysText = overDueDays + ' Days';
                        }
                        if(overDueDays <= 30){
                          overDueType = 'text-Yellow';
                        }else if(overDueDays <= 60){
                          overDueType = 'text-Orange';
                        }else{
                          overDueType = 'text-deleted';
                        }
                      }
                    }

                    var dataList = {
                        id: data.tsaleslist[i].SaleId || '',
                        sortdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD") : data.tsaleslist[i].SaleDate,
                        paymentdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
                        customername: data.tsaleslist[i].CustomerName || '',
                        paymentamount: amount || 0.00,
                        applied: applied || 0.00,
                        balance: balance || 0.00,
                        originalamount: totalOrginialAmount || 0.00,
                        outsandingamount: totalOutstanding || 0.00,
                        // bankaccount: data.tsaleslist[i].GLAccountName || '',
                        department: data.tsaleslist[i].ClassName || '',
                        refno: data.tsaleslist[i].BORef || '',
                        paymentmethod: data.tsaleslist[i].PaymentMethodName || '',
                        notes: data.tsaleslist[i].Comments || '',
                        overduedays:overDueDaysText,
                        overduetype:overDueType,
                    };
                    //if (data.tsaleslist[i].Balance != 0) {
                        if( customerID != 0 ){
                            if (data.tsaleslist[i].Balance != 0 && data.tsaleslist[i].ClientId == customerID ) {
                                dataTableList.push(dataList);
                            }
                        }else{
                          dataTableList.push(dataList);
                        }
                    //}

                }
                templateObject.datatablerecords.set(dataTableList);
                if (templateObject.datatablerecords.get()) {

                    Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblcustomerAwaitingPayment', function (error, result) {
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
                                    let columnindex = customcolumn[i].index + 1;

                                    if (hiddenColumn == true) {

                                        $("." + columnClass + "").addClass('hiddenColumn');
                                        $("." + columnClass + "").removeClass('showColumn');
                                    } else if (hiddenColumn == false) {
                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                        $("." + columnClass + "").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });

                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function () {
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblcustomerAwaitingPayment').DataTable({
                        columnDefs: [{
                                "orderable": false,
                                "targets": 0
                            }, {
                                type: 'date',
                                targets: 1
                            }
                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Outstanding Invoices - " + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible:not(.chkBox)',
                                    format: {
                                        body: function (data, row, column) {
                                            if (data.includes("</span>")) {
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, "") : data;

                                        }
                                    }
                                }
                            }, {
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Supplier Payment',
                                filename: "Outstanding Invoices - " + moment().format(),
                                exportOptions: {
                                    columns: ':visible:not(.chkBox)',
                                    stripHtml: false
                                }
                            }
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        colReorder: {
                            fixedColumnsLeft: 1
                        },
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialReportDatatableLoad,
                        "bLengthChange": false,


                        // pageLength: 25,
                        // lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 2, "desc" ],[ 4, "desc" ]],
                        // "aaSorting": [[1,'desc']],
                        action: function () {
                            $('#tblcustomerAwaitingPayment').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblcustomerAwaitingPayment_ellipsis').addClass('disabled');

                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {
                                    $('.paginate_button.page-item.previous').addClass('disabled');
                                    $('.paginate_button.page-item.next').addClass('disabled');
                                }
                            } else {}
                            if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }
                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function () {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                let dataLenght = oSettings._iDisplayLength;

                                var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                if(data.Params.IgnoreDates == true){
                                  sideBarService.getAllAwaitingCustomerPayment(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay(),contactID).then(function (dataObjectnew) {
                                      getVS1Data('TAwaitingCustomerPayment').then(function (dataObjectold) {
                                          if (dataObjectold.length == 0) {}
                                          else {
                                              let dataOld = JSON.parse(dataObjectold[0].data);
                                              var thirdaryData = $.merge($.merge([], dataObjectnew.tsaleslist), dataOld.tsaleslist);
                                              let objCombineData = {
                                                  Params: dataOld.Params,
                                                  tsaleslist: thirdaryData
                                              }

                                              addVS1Data('TAwaitingCustomerPayment', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                  templateObject.resetData(objCombineData);
                                                  $('.fullScreenSpin').css('display', 'none');
                                              }).catch(function (err) {
                                                  $('.fullScreenSpin').css('display', 'none');
                                              });

                                          }
                                      }).catch(function (err) {});

                                  }).catch(function (err) {
                                      $('.fullScreenSpin').css('display', 'none');
                                  });
                                }else{
                                sideBarService.getAllAwaitingCustomerPayment(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay(),contactID).then(function (dataObjectnew) {
                                    getVS1Data('TAwaitingCustomerPayment').then(function (dataObjectold) {
                                        if (dataObjectold.length == 0) {}
                                        else {
                                            let dataOld = JSON.parse(dataObjectold[0].data);
                                            var thirdaryData = $.merge($.merge([], dataObjectnew.tsaleslist), dataOld.tsaleslist);
                                            let objCombineData = {
                                                Params: dataOld.Params,
                                                tsaleslist: thirdaryData
                                            }

                                            addVS1Data('TAwaitingCustomerPayment', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                templateObject.resetData(objCombineData);
                                                $('.fullScreenSpin').css('display', 'none');
                                            }).catch(function (err) {
                                                $('.fullScreenSpin').css('display', 'none');
                                            });

                                        }
                                    }).catch(function (err) {});

                                }).catch(function (err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                              }
                            });

                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function () {
                          this.fnPageChange('last');
                          if(data.Params.Search.replace(/\s/g, "") == ""){
                            $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblcustomerAwaitingPayment_filter");
                          }else{
                            $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblcustomerAwaitingPayment_filter");
                          };
                             $("<button class='btn btn-primary btnRefreshCustomerAwaiting' type='button' id='btnRefreshCustomerAwaiting' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblcustomerAwaitingPayment_filter");
                             $('.myvarFilterForm').appendTo(".colDateFilter");
                         },
                         "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                           let countTableData = data.Params.Count || 0; //get count from API data

                             return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                         }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {}).on('length.dt', function (e, settings, len) {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });
                    $('.fullScreenSpin').css('display', 'none');

                }, 0);

                var columns = $('#tblcustomerAwaitingPayment th');
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
                $('div.dataTables_filter input').addClass('form-control form-control-sm');


            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });
    };

    //templateObject.getAllCustomerPaymentData();

    $('#tblcustomerAwaitingPayment tbody').on('click', 'tr .colOverdueDays, tr .colPaymentDate, tr .colReceiptNo, tr .colPaymentAmount, tr .colApplied, tr .colBalance, tr .colCustomerName, tr .colPaymentId, tr .colDepartment, tr .colRefNo, tr .colPaymentMethod, tr .colNotes', function () {
        var listData = $(this).closest('tr').attr('id');
        if (!$(this).closest('tbody').hasClass('FilterMode')) {
          if (listData) {
              FlowRouter.go('/invoicecard?id=' + listData);
          }
        }else{
         //Filter Code here
        };
    });

    templateObject.getAllFilterAwaitingCustData = function(fromDate, toDate, ignoreDate) {
        sideBarService.getAllAwaitingCustomerPayment(fromDate, toDate, ignoreDate,initialReportLoad,0,contactID).then(function(data) {
            addVS1Data('TAwaitingCustomerPayment', JSON.stringify(data)).then(function(datareturn) {
                location.reload();
            }).catch(function(err) {
                location.reload();
            });
        }).catch(function(err) {
            $('.fullScreenSpin').css('display', 'none');
        });
    }

    let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
    let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
    let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
    if (urlParametersDateFrom) {
        if (urlParametersIgnoreDate == true) {
            $('#dateFrom').attr('readonly', true);
            $('#dateTo').attr('readonly', true);
        } else {

            $("#dateFrom").val(urlParametersDateFrom != '' ? moment(urlParametersDateFrom).format("DD/MM/YYYY") : urlParametersDateFrom);
            $("#dateTo").val(urlParametersDateTo != '' ? moment(urlParametersDateTo).format("DD/MM/YYYY") : urlParametersDateTo);
        }
    }
});

Template.customerawaitingpayments.events({
    'click .btnDropdownFilter11': function (event) {
        $('#customFilterModal_tblcustomerAwaitingPayment').modal('toggle');
    },
    'keyup #tblcustomerAwaitingPayment_filter input': function (event) {
          if($(event.target).val() != ''){
            $(".btnRefreshCustomerAwaiting").addClass('btnSearchAlert');
          }else{
            $(".btnRefreshCustomerAwaiting").removeClass('btnSearchAlert');
          }
          if (event.keyCode == 13) {
             $(".btnRefreshCustomerAwaiting").trigger("click");
          }
        },
    'click .btnRefreshCustomerAwaiting':function(event){
      let templateObject = Template.instance();
      let utilityService = new UtilityService();
      let tableProductList;
      const dataTableList = [];
      var splashArrayInvoiceList = new Array();
      const lineExtaSellItems = [];
      $('.fullScreenSpin').css('display', 'inline-block');
      let dataSearchName = $('#tblcustomerAwaitingPayment_filter input').val();
      if (dataSearchName.replace(/\s/g, '') != '') {
          sideBarService.getAllAwaitingCustomerPaymentByCustomerNameOrID(dataSearchName).then(function (data) {
              $(".btnRefreshCustomerAwaiting").removeClass('btnSearchAlert');
              let lineItems = [];
              let lineItemObj = {};
              if (data.tsaleslist.length > 0) {
                  for (let i = 0; i < data.tsaleslist.length; i++) {
                    let amount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;
                          let applied = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Payment) || 0.00;
                          // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                          let balance = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                          let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                          let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                          let totalOrginialAmount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;

                          var dueDateCal = new Date(data.tsaleslist[i].dueDate);
                          var currentDateCal = new Date();
                          let overDueDays = 0;
                          let overDueDaysText = '';
                          let overDueType = 'text-Green';

                          if (dueDateCal < currentDateCal) {
                              overDueDays = Math.round((currentDateCal-dueDateCal)/(1000*60*60*24));
                              if(overDueDays > 0){
                              if(overDueDays == 1){
                                overDueDaysText = overDueDays + ' Day';
                              }else{
                                overDueDaysText = overDueDays + ' Days';
                              }
                              if(overDueDays <= 30){
                                overDueType = 'text-Yellow';
                              }else if(overDueDays <= 60){
                                overDueType = 'text-Orange';
                              }else{
                                overDueType = 'text-deleted';
                              }
                            }
                          }

                          var dataList = {
                           id: data.tsaleslist[i].SaleId || '',
                           sortdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD") : data.tsaleslist[i].SaleDate,
                           paymentdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
                           customername: data.tsaleslist[i].CustomerName || '',
                           paymentamount: amount || 0.00,
                           applied: applied || 0.00,
                           balance: balance || 0.00,
                           originalamount: totalOrginialAmount || 0.00,
                           outsandingamount: totalOutstanding || 0.00,
                           department: data.tsaleslist[i].ClassName || '',
                           refno: data.tsaleslist[i].BORef || '',
                           paymentmethod: data.tsaleslist[i].PaymentMethodName || '',
                           notes: data.tsaleslist[i].Comments || '',
                           overduedays:overDueDaysText,
                           overduetype:overDueType,
                       };

                      //if(data.tinvoiceex[i].fields.Deleted == false){
                      //splashArrayInvoiceList.push(dataList);
                      dataTableList.push(dataList);
                      //}


                      //}
                  }
                  templateObject.datatablerecords.set(dataTableList);

                  let item = templateObject.datatablerecords.get();
                  $('.fullScreenSpin').css('display', 'none');
                  if (dataTableList) {
                      var datatable = $('#tblcustomerAwaitingPayment').DataTable();
                      $("#tblcustomerAwaitingPayment > tbody").empty();
                      for (let x = 0; x < item.length; x++) {
                          $("#tblcustomerAwaitingPayment > tbody").append(
                              ' <tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                              '<td contenteditable="false" class="chkBox pointer" style="width:15px;"><div class="custom-control custom-checkbox chkBox pointer" style="width:15px;"><input class="custom-control-input chkBox chkPaymentCard pointer" type="checkbox" id="formCheck-' + item[x].id + '" value="' + item[x].outsandingamount + '"><label class="custom-control-label chkBox pointer" for="formCheck-' + item[x].id + '"></label></div></td>' +
                              '<td contenteditable="false" class="colSortDate hiddenColumn">' + item[x].sortdate + '</td>' +
                              '<td contenteditable="false" class="colPaymentDate" ><span style="display:none;">' + item[x].sortdate + '</span>' + item[x].paymentdate + '</td>' +
                              '<td contenteditable="false" class="colPaymentId">' + item[x].id + '</td>' +
                              '<td contenteditable="false" class="colReceiptNo">' + item[x].refno + '</td>' +
                              '<td contenteditable="false" class="colPaymentAmount" style="text-align: right!important;">' + item[x].applied + '</td>' +
                              '<td contenteditable="false" class="colApplied" style="text-align: right!important;">' + item[x].originalamount + '</td>' +
                              '<td contenteditable="false" class="colBalance" style="text-align: right!important;">' + item[x].outsandingamount + '</td>' +
                              '<td contenteditable="false" class="colCustomerName" id="colCustomerName' + item[x].id + '">' + item[x].customername + '</td>' +
                              '<td contenteditable="false" class="colDepartment">' + item[x].department + '</td>' +
                              '<td contenteditable="false" class="colRefNo hiddenColumn">' + item[x].refno + '</td>' +
                              '<td contenteditable="false" class="colPaymentMethod hiddenColumn">' + item[x].paymentmethod + '</td>' +
                              '<td contenteditable="false" class="colNotes">' + item[x].notes + '</td>' +
                              '</tr>');

                      }
                      $('.dataTables_info').html('Showing 1 to ' + data.tsaleslist.length + ' of ' + data.tsaleslist.length + ' entries');
                      setTimeout(function() {
                        makeNegativeGlobal();
                      }, 100);
                  }

              } else {
                  $('.fullScreenSpin').css('display', 'none');

                  swal({
                      title: 'Question',
                      text: "Invoice does not exist, would you like to create it?",
                      type: 'question',
                      showCancelButton: true,
                      confirmButtonText: 'Yes',
                      cancelButtonText: 'No'
                  }).then((result) => {
                      if (result.value) {
                          FlowRouter.go('/invoicecard');
                      } else if (result.dismiss === 'cancel') {
                          //$('#productListModal').modal('toggle');
                      }
                  });
              }
          }).catch(function (err) {
              $('.fullScreenSpin').css('display', 'none');
          });
      } else {

        $(".btnRefresh").trigger("click");
      }
    },
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display','inline-block');
        let templateObject = Template.instance();
        let contactID = FlowRouter.current().queryParams.contactid ||'';
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);

        let fromDateDay = currentBeginDate.getDate();
        if ((currentBeginDate.getMonth()+1) < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth() + 1);
        }


        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");


        sideBarService.getAllAwaitingCustomerPayment(prevMonth11Date, toDate, true, initialReportLoad, 0,contactID).then(function(dataPaymentList) {
            addVS1Data('TAwaitingCustomerPayment', JSON.stringify(dataPaymentList)).then(function(datareturn) {
                window.open('/customerawaitingpayments', '_self');
            }).catch(function(err) {
              setTimeout(function () {
                window.open('/customerawaitingpayments', '_self');
              }, 2000);
            });
        }).catch(function(err) {
          setTimeout(function () {
            window.open('/customerawaitingpayments', '_self');
          }, 2000);

        });

    },
    'click .btnPaymentList': function () {
        FlowRouter.go('/customerpayment');
    },
    'click #exportbtn': function () {

        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblcustomerAwaitingPayment_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .printConfirm': function (event) {
        playPrintAudio();
        setTimeout(function(){
        let values = [];
        let basedOnTypeStorages = Object.keys(localStorage);
        basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
            let employeeId = storage.split('_')[2];
            return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
        });
        let i = basedOnTypeStorages.length;
        if (i > 0) {
            while (i--) {
                values.push(localStorage.getItem(basedOnTypeStorages[i]));
            }
        }
        values.forEach(value => {
            let reportData = JSON.parse(value);
            reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
            if (reportData.BasedOnType.includes("P")) {
                if (reportData.FormID == 1) {
                    let formIds = reportData.FormIDs.split(',');
                    if (formIds.includes("54")) {
                        reportData.FormID = 54;
                        Meteor.call('sendNormalEmail', reportData);
                    }
                } else {
                    if (reportData.FormID == 54)
                        Meteor.call('sendNormalEmail', reportData);
                }
            }
        });

        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblcustomerAwaitingPayment_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display', 'none');
    }, delayTimeAfterSound);
    },
    'click .chkBoxAll': function () {
        if ($(event.target).is(':checked')) {
            $(".chkBox").prop("checked", true);
            $(".btnCustPayment").addClass('btnSearchAlert');
        } else {
            $(".chkBox").prop("checked", false);
            $(".btnCustPayment").removeClass('btnSearchAlert');
        }
    },
    'click .chkPaymentCard': function () {
        var listData = $(this).closest('tr').attr('id');
        var selectedClient = $(event.target).closest("tr").find(".colCustomerName").text();
        const templateObject = Template.instance();
        const selectedAwaitingPayment = [];
        const selectedAwaitingPayment2 = [];
        $('.chkPaymentCard:checkbox:checked').each(function () {
            var chkIdLine = $(this).closest('tr').attr('id');
            var customername = $(this).closest('.colCustomerName');
            let paymentTransObj = {
                awaitingId: chkIdLine,
                type: "inv",
                clientname: $('#colCustomerName' + chkIdLine).text()
            };
            if (selectedAwaitingPayment.length > 0) {
                // var checkClient = selectedAwaitingPayment.filter(slctdAwtngPyment => {
                //     return slctdAwtngPyment.clientname == $('#colCustomerName' + chkIdLine).text();
                // });

                // if (checkClient.length > 0) {
                selectedAwaitingPayment.push(paymentTransObj);
                // } else {
                //     swal('','You have selected multiple Customers,  a separate payment will be created for each', 'info');
                //     $(this).prop("checked", false);
                // }
            } else {
                selectedAwaitingPayment.push(paymentTransObj);
            }
        });
        localStorage.setItem('paymentsArray',JSON.stringify(selectedAwaitingPayment));
        templateObject.selectedAwaitingPayment.set(selectedAwaitingPayment);

        setTimeout(function () {
          let selectClient = templateObject.selectedAwaitingPayment.get();
          if (selectClient.length === 0) {
            $(".btnCustPayment").removeClass('btnSearchAlert');
          } else {
            $(".btnCustPayment").addClass('btnSearchAlert');
          };
        }, 100);


    },
    'click .btnCustPayment': function (e) {
        event.preventDefault();
        const templateObject = Template.instance();
        var datacomb = '';
        let allData = [];
        let allDataObj = {};
        let selectClient = templateObject.selectedAwaitingPayment.get();
        if (selectClient.length === 0) {
            window.open('/paymentcard','_self');
            //swal('Please select Customer to pay for!', '', 'info');
        } else {
            let custName = selectClient[0].clientname;
            if (selectClient.every(v => v.clientname === custName) == true) {
                var result = [];
                $.each(selectClient, function (k, v) {
                    result.push(v.awaitingId);
                });
                FlowRouter.go('/paymentcard?selectcust=' + result);

            } else {
                var final_result = [];
                var groups = {};
                var groupName = '';

                for (let x = 0; x < selectClient.length; x++) {
                    var result = [];

                    let lineItemObjlevel = {
                        ids: selectClient[x].awaitingId || '',
                        customername: selectClient[x].clientname || '',
                        description: selectClient[x].clientname || ''
                    };


                    groupName = selectClient[x].clientname;
                            if (!groups[groupName]) {
                                groups[groupName] = [];
                            }

                            groups[groupName].sort(function(a, b){
                                if (a.description == 'NA') {
                                    return 1;
                                }
                                else if (b.description == 'NA') {
                                    return -1;
                                }
                                return (a.description.toUpperCase() > b.description.toUpperCase()) ? 1 : -1;
                            });


                            groups[groupName].push(lineItemObjlevel);
                    /*
                    datacomb = selectClient.filter(client => {
                        return client.clientname == selectClient[x].clientname
                    })
                        if (datacomb.length > 0) {
                            for (let y = 0; y < datacomb.length; y++) {
                                result.push(datacomb[y].awaitingId)
                            }

                            //window.open('/paymentcard?selectcust=' + result.toString());
                            //final_result.push(result.toString())
                        }
                        */

                }
                 _.map(groups, function (datacomb, key) {

                    var result = [];

                    if (datacomb.length > 1) {

                    var resultSelect = [];

                     for (let y = 0; y < datacomb.length; y++) {

                        if(datacomb[y].customername == key){
                            resultSelect.push(datacomb[y].ids.toString())
                        }
                     }

                      allDataObj = {
                        selectCust:resultSelect.toString(),
                     }

                     allData.push(allDataObj);
                   // window.open('/paymentcard?selectcust=' + resultSelect.toString());

                    }else{
                        if(datacomb[0].customername == key){
                             allDataObj = {
                                selectCust:datacomb[0].ids.toString(),
                          }
                            allData.push(allDataObj);
                       // window.open('/paymentcard?selectcust=' + datacomb[0].ids);
                        }
                    }


                 });
                let url = '/paymentcard?selectcust=' + allData[0].selectCust
                allData.shift();
                localStorage.setItem('customerpayments', JSON.stringify(allData));
                window.open(url,'_self');
            }
        }

    },
    'click .chkBox': function () {
        var totalAmount = 0,
        selectedvalues = [];
        $('.chkBox:checkbox:checked').each(function () {
            if ($(this).prop("checked") == true) {
                selectedAmount = $(this).val().replace(/[^0-9.-]+/g, "");
                selectedvalues.push(selectedAmount);
                totalAmount += parseFloat(selectedAmount);
            } else if ($(this).prop("checked") == false) {}
        });
        $("#selectedTot").val(utilityService.modifynegativeCurrencyFormat(totalAmount));
    }

});
Template.customerawaitingpayments.helpers({
  datatablerecords : () => {
      return Template.instance().datatablerecords.get();
  },
  tableheaderrecords: () => {
      return Template.instance().tableheaderrecords.get();
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
    return sideBarService.getAllAwaitingCustomerPayment
  },

  searchAPI: function() {
    return sideBarService.getAllAwaitingCustomerPaymentByCustomerNameOrID
  },

  filterAPI: function() {
    return sideBarService.getAllAwaitingCustomerPaymentByFilter
  },

  apiParams: function() {
    return ['dateFrom', 'dateTo', 'ignoredate', 'limitCount', 'limitFrom', 'deleteFilter', 'contactid'];
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
  },

  exDataHandler: function() {
    let templateObject = Template.instance();
    return function(data) {
      let dataReturn = templateObject.getExData(data);
      return dataReturn
    }
  },
  contactID: function() {
    return FlowRouter.current().queryParams.contactid ||'';
  }
});
