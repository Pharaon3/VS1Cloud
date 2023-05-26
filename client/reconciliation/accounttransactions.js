import { PurchaseBoardService } from '../js/purchase-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { EmployeeProfileService } from "../js/profile-service";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import { Template } from 'meteor/templating';
import './accounttransactions.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import moment from "moment";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.accounttransactions.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.getDataTableList = function(data) {
        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.TotalAmount) || 0.00;
        let totalTax = utilityService.modifynegativeCurrencyFormat(data.TotalTax) || 0.00;
        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.TotalAmountInc) || 0.00;
        // let totalPaid = utilityService.modifynegativeCurrencyFormat(data.fields.TotalPaid) || 0.00;
        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.Balance) || 0.00;
        var dataList = [
            data.PurchaseOrderID || '',
            '<span style="display:none;">'+(data.OrderDate !=''? moment(data.OrderDate).format("YYYY/MM/DD"): data.OrderDate)+'</span>'+(data.OrderDate !=''? moment(data.OrderDate).format("DD/MM/YYYY"): data.OrderDate),
            data.Account || '',
            data.PurchaseOrderNumber || '',
            data.SupplierName || '',
            totalAmountEx || 0.00,
            totalTax || 0.00,
            totalAmount || 0.00,
            data.Paid || '',
            totalOutstanding || 0.00,
            '' || '',
            '' || '',
            data.EmployeeName || '',
            data.Comments || '',
            data.Deleted ? "Deleted" : "",
        ];
        return dataList;
    }
    let headerStructure = [
        { index: 0, label: 'ID', class:'colId', active: false, display: true, width: "10" },
        { index: 1, label: "Order Date", class: "colOrderDate", active: true, display: true, width: "80" },
        { index: 2, label: 'Account Name', class:'colAccountName', active: true, display: true, width: "200" },
        { index: 3, label: "Number", class: "colNumber", active: true, display: true, width: "110" },
        { index: 4, label: "Company", class: "colCompany", active: true, display: true, width: "200" },
        { index: 5, label: "Amount (Ex)", class: "colAmountEx", active: true, display: true, width: "110" },
        { index: 6, label: "Tax", class: "colTax", active: true, display: true, width: "110" },
        { index: 7, label: "Amount (Inc)", class: "colAmount", active: true, display: true, width: "110" },
        { index: 8, label: "Paid", class: "colPaid", active: false, display: true, width: "110" },
        { index: 9, label: "Outstanding", class: "colBalanceOutstanding", active: false, display: true, width: "110" },
        { index: 10, label: "Custom Field 1", class: "colCustomField1", active: false, display: true, width: "110" },
        { index: 11, label: "Custom Field 2", class: "colCustomField2", active: false, display: true, width: "110" },
        { index: 12, label: "Employee", class: "colEmployee", active: true, display: true, width: "200" },
        { index: 13, label: "Comments", class: "colComments", active: true, display: true, width: "300" },
        { index: 14, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.accounttransactions.onRendered(function() {
    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    let accountService = new AccountService();
    let purchaseService = new PurchaseBoardService();
    const supplierList = [];
    let billTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];
    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }
    // Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblchequelist', function(error, result) {
    //     if (error) {
    //
    //     } else {
    //         if (result) {
    //             for (let i = 0; i < result.customFields.length; i++) {
    //                 let customcolumn = result.customFields;
    //                 let columData = customcolumn[i].label;
    //                 let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                 let hiddenColumn = customcolumn[i].hidden;
    //                 let columnClass = columHeaderUpdate.split('.')[1];
    //                 let columnWidth = customcolumn[i].width;
    //
    //                 $("th." + columnClass + "").html(columData);
    //                 $("th." + columnClass + "").css('width', "" + columnWidth + "px");
    //
    //             }
    //         }
    //
    //     }
    // });

    function MakeNegative() {
        // TDs = document.getElementsByTagName('td');
        // for (var i=0; i<TDs.length; i++) {
        //         var temp = TDs[i];
        //         if (temp.firstChild.nodeValue.indexOf('-'+Currency) == 0){
        //           temp.className = "text-danger";
        //         }
        //     }
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    };
    var url = new URL(window.location.href);
    let Id = url.searchParams.get("id");
    // templateObject.getAllChequeData = function() {
    //     getVS1Data('TCheque').then(function(dataObject) {
    //         if (dataObject.length == 0) {
    //             purchaseService.getAllChequeList().then(function(data) {
    //                 let lineItems = [];
    //                 let lineItemObj = {};
    //                 for (let i = 0; i < data.tcheque.length; i++) {
    //                     let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tcheque[i].TotalAmount) || 0.00;
    //                     let totalTax = utilityService.modifynegativeCurrencyFormat(data.tcheque[i].TotalTax) || 0.00;
    //                     let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tcheque[i].TotalAmountInc) || 0.00;
    //                     let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tcheque[i].TotalPaid) || 0.00;
    //                     let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tcheque[i].TotalBalance) || 0.00;
    //                     var dataList = {
    //                         id: data.tcheque[i].Id || '',
    //                         employee: data.tcheque[i].EmployeeName || '',
    //                         accountname: data.tcheque[i].GLAccountName || '',
    //                         sortdate: data.tcheque[i].OrderDate != '' ? moment(data.tcheque[i].OrderDate).format("YYYY/MM/DD") : data.tcheque[i].OrderDate,
    //                         orderdate: data.tcheque[i].OrderDate != '' ? moment(data.tcheque[i].OrderDate).format("DD/MM/YYYY") : data.tcheque[i].OrderDate,
    //                         suppliername: data.tcheque[i].SupplierName || '',
    //                         chequeNumber: data.tcheque[i].SupplierInvoiceNumber || '',
    //                         totalamountex: totalAmountEx || 0.00,
    //                         totaltax: totalTax || 0.00,
    //                         totalamount: totalAmount || 0.00,
    //                         totalpaid: totalPaid || 0.00,
    //                         totaloustanding: totalOutstanding || 0.00,
    //                         orderstatus: data.tcheque[i].OrderStatus || '',
    //                         custfield1: '' || '',
    //                         custfield2: '' || '',
    //                         comments: data.tcheque[i].Comments || '',
    //                     };
    //                     dataTableList.push(dataList);
    //
    //                 }
    //                 templateObject.datatablerecords.set(dataTableList);
    //
    //                 if (templateObject.datatablerecords.get()) {
    //
    //                     Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblchequelist', function(error, result) {
    //                         if (error) {
    //
    //                         } else {
    //                             if (result) {
    //                                 for (let i = 0; i < result.customFields.length; i++) {
    //                                     let customcolumn = result.customFields;
    //                                     let columData = customcolumn[i].label;
    //                                     let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                                     let hiddenColumn = customcolumn[i].hidden;
    //                                     let columnClass = columHeaderUpdate.split('.')[1];
    //                                     let columnWidth = customcolumn[i].width;
    //                                     let columnindex = customcolumn[i].index + 1;
    //
    //                                     if (hiddenColumn == true) {
    //
    //                                         $("." + columnClass + "").addClass('hiddenColumn');
    //                                         $("." + columnClass + "").removeClass('showColumn');
    //                                     } else if (hiddenColumn == false) {
    //                                         $("." + columnClass + "").removeClass('hiddenColumn');
    //                                         $("." + columnClass + "").addClass('showColumn');
    //                                     }
    //
    //                                 }
    //                             }
    //
    //                         }
    //                     });
    //
    //
    //                     setTimeout(function() {
    //                         MakeNegative();
    //                     }, 100);
    //                 }
    //
    //                 setTimeout(function() {
    //                     $('.fullScreenSpin').css('display', 'none');
    //                     //$.fn.dataTable.moment('DD/MM/YY');
    //                     $('#tblchequelist').DataTable({
    //                         // columnDefs: [
    //                         //     {type: 'date', targets: 0}
    //                         // ],
    //                         "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                         buttons: [{
    //                             extend: 'excelHtml5',
    //                             text: '',
    //                             download: 'open',
    //                             className: "btntabletocsv hiddenColumn",
    //                             filename: "chequelist_" + moment().format(),
    //                             orientation: 'portrait',
    //                             exportOptions: {
    //                                 columns: ':visible'
    //                             }
    //                         }, {
    //                             extend: 'print',
    //                             download: 'open',
    //                             className: "btntabletopdf hiddenColumn",
    //                             text: '',
    //                             title: 'Cheque',
    //                             filename: "chequelist_" + moment().format(),
    //                             exportOptions: {
    //                                 columns: ':visible'
    //                             }
    //                         }],
    //                         select: true,
    //                         destroy: true,
    //                         colReorder: true,
    //                         // bStateSave: true,
    //                         // rowId: 0,
    //                         pageLength: initialDatatableLoad,
    //                         lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
    //                         info: true,
    //                         responsive: true,
    //                         "order": [
    //                             [0, "desc"]
    //                         ],
    //                         action: function() {
    //                             $('#tblchequelist').DataTable().ajax.reload();
    //                         },
    //                         "fnDrawCallback": function(oSettings) {
    //                             setTimeout(function() {
    //                                 MakeNegative();
    //                             }, 100);
    //                         },
    //
    //                     }).on('page', function() {
    //                         setTimeout(function() {
    //                             MakeNegative();
    //                         }, 100);
    //                         let draftRecord = templateObject.datatablerecords.get();
    //                         templateObject.datatablerecords.set(draftRecord);
    //                     }).on('column-reorder', function() {
    //
    //                     }).on('length.dt', function(e, settings, len) {
    //                         setTimeout(function() {
    //                             MakeNegative();
    //                         }, 100);
    //                     });
    //                     $('.fullScreenSpin').css('display', 'none');
    //                 }, 0);
    //
    //                 var columns = $('#tblchequelist th');
    //                 let sTible = "";
    //                 let sWidth = "";
    //                 let sIndex = "";
    //                 let sVisible = "";
    //                 let columVisible = false;
    //                 let sClass = "";
    //                 $.each(columns, function(i, v) {
    //                     if (v.hidden == false) {
    //                         columVisible = true;
    //                     }
    //                     if ((v.className.includes("hiddenColumn"))) {
    //                         columVisible = false;
    //                     }
    //                     sWidth = v.style.width.replace('px', "");
    //
    //                     let datatablerecordObj = {
    //                         sTitle: v.innerText || '',
    //                         sWidth: sWidth || '',
    //                         sIndex: v.cellIndex || '',
    //                         sVisible: columVisible || false,
    //                         sClass: v.className || ''
    //                     };
    //                     tableHeaderList.push(datatablerecordObj);
    //                 });
    //                 templateObject.tableheaderrecords.set(tableHeaderList);
    //                 $('div.dataTables_filter input').addClass('form-control form-control-sm');
    //                 $('#tblchequelist tbody').on('click', 'tr', function() {
    //                     var listData = $(this).closest('tr').attr('id');
    //                     if (listData) {
    //                         FlowRouter.go('/chequecard?id=' + listData);
    //                     }
    //                 });
    //
    //             }).catch(function(err) {
    //                 // Bert.alert('<strong>' + err + '</strong>!', 'danger');
    //                 $('.fullScreenSpin').css('display', 'none');
    //                 // Meteor._reload.reload();
    //             });
    //         } else {
    //             let data = JSON.parse(dataObject[0].data);
    //             let useData = data.tcheque;
    //
    //             let lineItems = [];
    //             let lineItemObj = {};
    //             for (let i = 0; i < useData.length; i++) {
    //
    //                 if (Id != null) {
    //
    //                     if (Id == useData[i].fields.GLAccountName) {
    //                         let totalAmountEx = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalAmount) || 0.00;
    //                         let totalTax = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalTax) || 0.00;
    //                         let totalAmount = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalAmountInc) || 0.00;
    //                         let totalPaid = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalPaid) || 0.00;
    //                         let totalOutstanding = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalBalance) || 0.00;
    //                         var dataList = {
    //                             id: useData[i].fields.ID || '',
    //                             employee: useData[i].fields.EmployeeName || '',
    //                             accountname: useData[i].fields.GLAccountName || '',
    //                             sortdate: useData[i].fields.OrderDate != '' ? moment(useData[i].fields.OrderDate).format("YYYY/MM/DD") : useData[i].fields.OrderDate,
    //                             orderdate: useData[i].fields.OrderDate != '' ? moment(useData[i].fields.OrderDate).format("DD/MM/YYYY") : useData[i].fields.OrderDate,
    //                             suppliername: useData[i].fields.SupplierName || '',
    //                             chequeNumber: useData[i].fields.SupplierInvoiceNumber || '',
    //                             totalamountex: totalAmountEx || 0.00,
    //                             totaltax: totalTax || 0.00,
    //                             totalamount: totalAmount || 0.00,
    //                             totalpaid: totalPaid || 0.00,
    //                             totaloustanding: totalOutstanding || 0.00,
    //                             orderstatus: useData[i].fields.OrderStatus || '',
    //                             custfield1: '' || '',
    //                             custfield2: '' || '',
    //                             comments: useData[i].fields.Comments || '',
    //                         };
    //                         dataTableList.push(dataList);
    //                     }
    //
    //                 } else {
    //
    //                     let totalAmountEx = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalAmount) || 0.00;
    //                     let totalTax = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalTax) || 0.00;
    //                     let totalAmount = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalAmountInc) || 0.00;
    //                     let totalPaid = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalPaid) || 0.00;
    //                     let totalOutstanding = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalBalance) || 0.00;
    //                     var dataList = {
    //                         id: useData[i].fields.ID || '',
    //                         employee: useData[i].fields.EmployeeName || '',
    //                         accountname: useData[i].fields.GLAccountName || '',
    //                         sortdate: useData[i].fields.OrderDate != '' ? moment(useData[i].fields.OrderDate).format("YYYY/MM/DD") : useData[i].fields.OrderDate,
    //                         orderdate: useData[i].fields.OrderDate != '' ? moment(useData[i].fields.OrderDate).format("DD/MM/YYYY") : useData[i].fields.OrderDate,
    //                         suppliername: useData[i].fields.SupplierName || '',
    //                         chequeNumber: useData[i].fields.SupplierInvoiceNumber || '',
    //                         totalamountex: totalAmountEx || 0.00,
    //                         totaltax: totalTax || 0.00,
    //                         totalamount: totalAmount || 0.00,
    //                         totalpaid: totalPaid || 0.00,
    //                         totaloustanding: totalOutstanding || 0.00,
    //                         orderstatus: useData[i].fields.OrderStatus || '',
    //                         custfield1: '' || '',
    //                         custfield2: '' || '',
    //                         comments: useData[i].fields.Comments || '',
    //                     };
    //                     dataTableList.push(dataList);
    //                 }
    //             }
    //         }
    //         templateObject.datatablerecords.set(dataTableList);
    //
    //         if (templateObject.datatablerecords.get()) {
    //
    //             Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblchequelist', function(error, result) {
    //                 if (error) {
    //
    //                 } else {
    //                     if (result) {
    //                         for (let i = 0; i < result.customFields.length; i++) {
    //                             let customcolumn = result.customFields;
    //                             let columData = customcolumn[i].label;
    //                             let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                             let hiddenColumn = customcolumn[i].hidden;
    //                             let columnClass = columHeaderUpdate.split('.')[1];
    //                             let columnWidth = customcolumn[i].width;
    //                             let columnindex = customcolumn[i].index + 1;
    //
    //                             if (hiddenColumn == true) {
    //
    //                                 $("." + columnClass + "").addClass('hiddenColumn');
    //                                 $("." + columnClass + "").removeClass('showColumn');
    //                             } else if (hiddenColumn == false) {
    //                                 $("." + columnClass + "").removeClass('hiddenColumn');
    //                                 $("." + columnClass + "").addClass('showColumn');
    //                             }
    //
    //                         }
    //                     }
    //
    //                 }
    //             });
    //
    //
    //             setTimeout(function() {
    //                 MakeNegative();
    //             }, 100);
    //         }
    //
    //         setTimeout(function() {
    //             $('.fullScreenSpin').css('display', 'none');
    //             //$.fn.dataTable.moment('DD/MM/YY');
    //             $('#tblchequelist').DataTable({
    //                 // columnDefs: [
    //                 //     {type: 'date', targets: 0}
    //                 // ],
    //                 "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                 buttons: [{
    //                     extend: 'excelHtml5',
    //                     text: '',
    //                     download: 'open',
    //                     className: "btntabletocsv hiddenColumn",
    //                     filename: "chequelist_" + moment().format(),
    //                     orientation: 'portrait',
    //                     exportOptions: {
    //                         columns: ':visible'
    //                     }
    //                 }, {
    //                     extend: 'print',
    //                     download: 'open',
    //                     className: "btntabletopdf hiddenColumn",
    //                     text: '',
    //                     title: 'Cheque',
    //                     filename: "chequelist_" + moment().format(),
    //                     exportOptions: {
    //                         columns: ':visible'
    //                     }
    //                 }],
    //                 select: true,
    //                 destroy: true,
    //                 colReorder: true,
    //                 // bStateSave: true,
    //                 // rowId: 0,
    //                 pageLength: initialDatatableLoad,
    //                 lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
    //                 info: true,
    //                 responsive: true,
    //                 "order": [
    //                     [0, "desc"]
    //                 ],
    //                 action: function() {
    //                     $('#tblchequelist').DataTable().ajax.reload();
    //                 },
    //                 "fnDrawCallback": function(oSettings) {
    //                     setTimeout(function() {
    //                         MakeNegative();
    //                     }, 100);
    //                 },
    //
    //             }).on('page', function() {
    //                 setTimeout(function() {
    //                     MakeNegative();
    //                 }, 100);
    //                 let draftRecord = templateObject.datatablerecords.get();
    //                 templateObject.datatablerecords.set(draftRecord);
    //             }).on('column-reorder', function() {
    //
    //             }).on('length.dt', function(e, settings, len) {
    //                 setTimeout(function() {
    //                     MakeNegative();
    //                 }, 100);
    //             });
    //             $('.fullScreenSpin').css('display', 'none');
    //         }, 0);
    //
    //         var columns = $('#tblchequelist th');
    //         let sTible = "";
    //         let sWidth = "";
    //         let sIndex = "";
    //         let sVisible = "";
    //         let columVisible = false;
    //         let sClass = "";
    //         $.each(columns, function(i, v) {
    //             if (v.hidden == false) {
    //                 columVisible = true;
    //             }
    //             if ((v.className.includes("hiddenColumn"))) {
    //                 columVisible = false;
    //             }
    //             sWidth = v.style.width.replace('px', "");
    //
    //             let datatablerecordObj = {
    //                 sTitle: v.innerText || '',
    //                 sWidth: sWidth || '',
    //                 sIndex: v.cellIndex || '',
    //                 sVisible: columVisible || false,
    //                 sClass: v.className || ''
    //             };
    //             tableHeaderList.push(datatablerecordObj);
    //         });
    //         templateObject.tableheaderrecords.set(tableHeaderList);
    //         $('div.dataTables_filter input').addClass('form-control form-control-sm');
    //         $('#tblchequelist tbody').on('click', 'tr', function() {
    //             var listData = $(this).closest('tr').attr('id');
    //             if (listData) {
    //                 FlowRouter.go('/chequecard?id=' + listData);
    //             }
    //         });
    //
    //     }).catch(function(err) {
    //         purchaseService.getAllChequeList().then(function(data) {
    //             let lineItems = [];
    //             let lineItemObj = {};
    //             for (let i = 0; i < data.tcheque.length; i++) {
    //                 let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tcheque[i].TotalAmount) || 0.00;
    //                 let totalTax = utilityService.modifynegativeCurrencyFormat(data.tcheque[i].TotalTax) || 0.00;
    //                 let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tcheque[i].TotalAmountInc) || 0.00;
    //                 let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tcheque[i].TotalPaid) || 0.00;
    //                 let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tcheque[i].TotalBalance) || 0.00;
    //                 var dataList = {
    //                     id: data.tcheque[i].Id || '',
    //                     employee: data.tcheque[i].EmployeeName || '',
    //                     accountname: data.tcheque[i].GLAccountName || '',
    //                     sortdate: data.tcheque[i].OrderDate != '' ? moment(data.tcheque[i].OrderDate).format("YYYY/MM/DD") : data.tcheque[i].OrderDate,
    //                     orderdate: data.tcheque[i].OrderDate != '' ? moment(data.tcheque[i].OrderDate).format("DD/MM/YYYY") : data.tcheque[i].OrderDate,
    //                     suppliername: data.tcheque[i].SupplierName || '',
    //                     chequeNumber: data.tcheque[i].SupplierInvoiceNumber || '',
    //                     totalamountex: totalAmountEx || 0.00,
    //                     totaltax: totalTax || 0.00,
    //                     totalamount: totalAmount || 0.00,
    //                     totalpaid: totalPaid || 0.00,
    //                     totaloustanding: totalOutstanding || 0.00,
    //                     orderstatus: data.tcheque[i].OrderStatus || '',
    //                     custfield1: '' || '',
    //                     custfield2: '' || '',
    //                     comments: data.tcheque[i].Comments || '',
    //                 };
    //                 if (Id != null) {
    //
    //                     if (Id == data.tcheque[i].GLAccountName) {
    //                 dataTableList.push(dataList);
    //
    //               }
    //             }
    //
    //             }
    //             templateObject.datatablerecords.set(dataTableList);
    //
    //             if (templateObject.datatablerecords.get()) {
    //
    //                 Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblchequelist', function(error, result) {
    //                     if (error) {
    //
    //                     } else {
    //                         if (result) {
    //                             for (let i = 0; i < result.customFields.length; i++) {
    //                                 let customcolumn = result.customFields;
    //                                 let columData = customcolumn[i].label;
    //                                 let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                                 let hiddenColumn = customcolumn[i].hidden;
    //                                 let columnClass = columHeaderUpdate.split('.')[1];
    //                                 let columnWidth = customcolumn[i].width;
    //                                 let columnindex = customcolumn[i].index + 1;
    //
    //                                 if (hiddenColumn == true) {
    //
    //                                     $("." + columnClass + "").addClass('hiddenColumn');
    //                                     $("." + columnClass + "").removeClass('showColumn');
    //                                 } else if (hiddenColumn == false) {
    //                                     $("." + columnClass + "").removeClass('hiddenColumn');
    //                                     $("." + columnClass + "").addClass('showColumn');
    //                                 }
    //
    //                             }
    //                         }
    //
    //                     }
    //                 });
    //
    //
    //                 setTimeout(function() {
    //                     MakeNegative();
    //                 }, 100);
    //             }
    //
    //             setTimeout(function() {
    //                 $('.fullScreenSpin').css('display', 'none');
    //                 //$.fn.dataTable.moment('DD/MM/YY');
    //                 $('#tblchequelist').DataTable({
    //                     // columnDefs: [
    //                     //     {type: 'date', targets: 0}
    //                     // ],
    //                     "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                     buttons: [{
    //                         extend: 'excelHtml5',
    //                         text: '',
    //                         download: 'open',
    //                         className: "btntabletocsv hiddenColumn",
    //                         filename: "chequelist_" + moment().format(),
    //                         orientation: 'portrait',
    //                         exportOptions: {
    //                             columns: ':visible'
    //                         }
    //                     }, {
    //                         extend: 'print',
    //                         download: 'open',
    //                         className: "btntabletopdf hiddenColumn",
    //                         text: '',
    //                         title: 'Cheque',
    //                         filename: "chequelist_" + moment().format(),
    //                         exportOptions: {
    //                             columns: ':visible'
    //                         }
    //                     }],
    //                     select: true,
    //                     destroy: true,
    //                     colReorder: true,
    //                     // bStateSave: true,
    //                     // rowId: 0,
    //                     pageLength: initialDatatableLoad,
    //                     lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
    //                     info: true,
    //                     responsive: true,
    //                     "order": [
    //                         [0, "desc"]
    //                     ],
    //                     action: function() {
    //                         $('#tblchequelist').DataTable().ajax.reload();
    //                     },
    //                     "fnDrawCallback": function(oSettings) {
    //                         setTimeout(function() {
    //                             MakeNegative();
    //                         }, 100);
    //                     },
    //
    //                 }).on('page', function() {
    //                     setTimeout(function() {
    //                         MakeNegative();
    //                     }, 100);
    //                     let draftRecord = templateObject.datatablerecords.get();
    //                     templateObject.datatablerecords.set(draftRecord);
    //                 }).on('column-reorder', function() {
    //
    //                 }).on('length.dt', function(e, settings, len) {
    //                     setTimeout(function() {
    //                         MakeNegative();
    //                     }, 100);
    //                 });
    //                 $('.fullScreenSpin').css('display', 'none');
    //             }, 0);
    //
    //             var columns = $('#tblchequelist th');
    //             let sTible = "";
    //             let sWidth = "";
    //             let sIndex = "";
    //             let sVisible = "";
    //             let columVisible = false;
    //             let sClass = "";
    //             $.each(columns, function(i, v) {
    //                 if (v.hidden == false) {
    //                     columVisible = true;
    //                 }
    //                 if ((v.className.includes("hiddenColumn"))) {
    //                     columVisible = false;
    //                 }
    //                 sWidth = v.style.width.replace('px', "");
    //
    //                 let datatablerecordObj = {
    //                     sTitle: v.innerText || '',
    //                     sWidth: sWidth || '',
    //                     sIndex: v.cellIndex || '',
    //                     sVisible: columVisible || false,
    //                     sClass: v.className || ''
    //                 };
    //                 tableHeaderList.push(datatablerecordObj);
    //             });
    //             templateObject.tableheaderrecords.set(tableHeaderList);
    //             $('div.dataTables_filter input').addClass('form-control form-control-sm');
    //             $('#tblchequelist tbody').on('click', 'tr', function() {
    //                 var listData = $(this).closest('tr').attr('id');
    //                 if (listData) {
    //                     FlowRouter.go('/chequecard?id=' + listData);
    //                 }
    //             });
    //
    //         }).catch(function(err) {
    //             // Bert.alert('<strong>' + err + '</strong>!', 'danger');
    //             $('.fullScreenSpin').css('display', 'none');
    //             // Meteor._reload.reload();
    //         });
    //     });
    // }

    // templateObject.getAllChequeData();

    $('#tblchequelist tbody').on('click', 'tr', function() {
        var listData = $(this).closest('tr').attr('id');
        var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
        if (listData) {
            if(checkDeleted == "Deleted"){
                swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
            }else{
                FlowRouter.go('/chequecard?id=' + listData);
            }
        }
    });

});

Template.accounttransactions.events({
    'click #btnNewCheque': function(event) {
        FlowRouter.go('/chequecard');
    },
    // 'click .chkDatatable': function(event) {
    //     var columns = $('#tblchequelist th');
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
    //             var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblchequelist' });
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
    //     var getcurrentCloudDetails = CloudUser.findOne({ _id: localStorage.getItem('mycloudLogonID'), clouddatabaseID: localStorage.getItem('mycloudLogonDBID') });
    //     if (getcurrentCloudDetails) {
    //         if (getcurrentCloudDetails._id.length > 0) {
    //             var clientID = getcurrentCloudDetails._id;
    //             var clientUsername = getcurrentCloudDetails.cloudUsername;
    //             var clientEmail = getcurrentCloudDetails.cloudEmail;
    //             var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblchequelist' });
    //             if (checkPrefDetails) {
    //                 CloudPreference.update({ _id: checkPrefDetails._id }, {
    //                     $set: {
    //                         userid: clientID,
    //                         username: clientUsername,
    //                         useremail: clientEmail,
    //                         PrefGroup: 'salesform',
    //                         PrefName: 'tblchequelist',
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
    //                     PrefName: 'tblchequelist',
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
    //
    //             }
    //         }
    //     }
    //     $('#myModal2').modal('toggle');
    // },
    // 'blur .divcolumn': function(event) {
    //     let columData = $(event.target).text();
    //     let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
    //     var datable = $('#tblchequelist').DataTable();
    //     var title = datable.column(columnDatanIndex).header();
    //     $(title).html(columData);
    //
    // },
    // 'change .rngRange': function(event) {
    //     let range = $(event.target).val();
    //     let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
    //     var datable = $('#tblchequelist th');
    //     $.each(datable, function(i, v) {
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
    //     var columns = $('#tblchequelist th');
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
    //             sIndex: v.cellIndex || '',
    //             sVisible: columVisible || false,
    //             sClass: v.className || ''
    //         };
    //         tableHeaderList.push(datatablerecordObj);
    //     });
    //
    //     templateObject.tableheaderrecords.set(tableHeaderList);
    // },
    // 'click #exportbtn': function() {
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     jQuery('#tblchequelist_wrapper .dt-buttons .btntabletocsv').click();
    //     $('.fullScreenSpin').css('display', 'none');
    //
    // },
    'click .btnRefresh': function() {
        var currentBeginDate = new Date();
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
        let purchaseService = new PurchaseBoardService();
        $('.fullScreenSpin').css('display', 'inline-block');
        purchaseService.getChequeList(prevMonth11Date,toDate, true, initialReportLoad,0, false).then(function(data) {
            addVS1Data('TChequeList', JSON.stringify(data)).then(function(datareturn) {
                window.open('/accounttransactions', '_self');
            }).catch(function(err) {
                window.open('/accounttransactions', '_self');
            });
        }).catch(function(err) {
            window.open('/accounttransactions', '_self');
        });
    },
    // 'click .printConfirm': function(event) {
    //     playPrintAudio();
    //     setTimeout(function(){
    //     $('.fullScreenSpin').css('display', 'inline-block');
    //     jQuery('#tblchequelist_wrapper .dt-buttons .btntabletopdf').click();
    //     $('.fullScreenSpin').css('display', 'none');
    // }, delayTimeAfterSound);
    // }

});

Template.accounttransactions.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.orderdate == 'NA') {
                return 1;
            } else if (b.orderdate == 'NA') {
                return -1;
            }
            return (a.orderdate.toUpperCase() > b.orderdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    purchasesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: localStorage.getItem('mycloudLogonID'), PrefName: 'tblchequelist' });
    },
    formname: () => {
        return "Transaction List";
    },

    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    apiFunction:function() {
        let purchaseService = new PurchaseBoardService();
        return purchaseService.getChequeList;
    },

    searchAPI: function() {
        let purchaseService = new PurchaseBoardService();
        return purchaseService.getChequeListByAccountName;
    },

    service: ()=>{
        let purchaseService = new PurchaseBoardService();
        return purchaseService;
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
