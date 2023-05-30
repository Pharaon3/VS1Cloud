import { PurchaseBoardService } from '../js/purchase-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { EmployeeProfileService } from "../js/profile-service";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import "./cheque_list.html";
import moment from "moment";
import {CRMService} from "../crm/crm-service";


let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.chequelist.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.getDataTableList = function(data) {
        let totalAmountEx;
        let totalTax;
        let totalAmount;
        let totalOutstanding;
        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.Payment) || 0.00;

        if(data.TotalAmount > 0 && data.TotalAmount != 0){
            totalAmountEx = utilityService.modifynegativeCurrencyFormat(-Math.abs(data.TotalAmount)) || 0.00;
        }else{
            totalAmountEx = utilityService.modifynegativeCurrencyFormat(Math.abs(data.TotalAmount)) || 0.00;
        }

        if(data.TotalTax > 0 && data.TotalTax != 0){
            totalTax = utilityService.modifynegativeCurrencyFormat(-Math.abs(data.TotalTax)) || 0.00;
        }else{
            totalTax = utilityService.modifynegativeCurrencyFormat(Math.abs(data.TotalTax)) || 0.00;
        }


        if(data.TotalAmountInc > 0 && data.TotalAmountInc != 0){
            totalAmount = utilityService.modifynegativeCurrencyFormat(-Math.abs(data.TotalAmountInc)) || 0.00;
        }else{
            totalAmount = utilityService.modifynegativeCurrencyFormat(Math.abs(data.TotalAmountInc)) || 0.00;
        }


        if(data.Balance > 0 && data.Balance != 0){
            totalOutstanding = utilityService.modifynegativeCurrencyFormat(-Math.abs(data.Balance)) || 0.00;
        }else{
            totalOutstanding = utilityService.modifynegativeCurrencyFormat(Math.abs(data.Balance)) || 0.00;
        }

        const dataList = [
            `<span style="display:none;">${data.OrderDate != '' ? moment(data.OrderDate).format("DD/MM/YYYY") : data.OrderDate}</span>${data.OrderDate != '' ? moment(data.OrderDate).format("DD/MM/YYYY") : data.OrderDate}`,
            data.PurchaseOrderID || '',
            data.Account || '',
            data.InvoiceNumber || '',
            data.SupplierName || '',
            data.RefNo || '',
            data.Shipping || '',
            data.ForeignExchangeCode || '',
            totalAmountEx || 0.00,
            totalTax || 0.00,
            totalAmount || 0.00,
            totalPaid || 0.00,
            totalOutstanding || 0.00,
            '' || '',
            '' || '',
            data.Employee || '',
            data.Comments || '',
            data.Deleted ? "Deleted" : "",
        ];
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: "Order Date", class: "colOrderDate", active: true, display: true, width: "80" },
        { index: 1, label: "ID", class: "colChequeID", active: false, display: true, width: "65" },
        { index: 2, label: "Bank Account", class: "colBankAccount", active: true, display: true, width: "95" },
        { index: 3, label: "PurchaseNo", class: "colPurchaseNo", active: true, display: true, width: "100" },
        { index: 4, label: "Supplier", class: "colSupplier", active: true, display: true, width: "110" },
        { index: 5, label: "Reference", class: "colReference", active: true, display: true, width: "110" },
        { index: 6, label: "Via", class: "colVia", active: true, display: true, width: "110" },
        { index: 7, label: "Currency", class: "colCurrency", active: true, display: true, width: "110" },
        { index: 8, label: "Amount (Ex)", class: "colAmountEx", active: true, display: true, width: "110" },
        { index: 9, label: "Tax", class: "colTax", active: true, display: true, width: "110" },
        { index: 10, label: "Amount (Inc)", class: "colAmount", active: true, display: true, width: "110" },
        { index: 11, label: "Paid", class: "colPaid", active: true, display: true, width: "110" },
        { index: 12, label: "Outstanding", class: "colOutstanding", active: true, display: true, width: "110" },
        { index: 13, label: "PurchaseCustField1", class: "colPurchaseCustField1", active: false, display: true, width: "110" },
        { index: 14, label: "PurchaseCustField2", class: "colPurchaseCustField2", active: false, display: true, width: "110" },
        { index: 15, label: "Employee", class: "colEmployee", active: false, display: true, width: "110" },
        { index: 16, label: "Comments", class: "colComments", active: true, display: true, width: "500" },
        { index: 17, label: "Status", class: "colStatus", active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.chequelist.onRendered(function() {
    $('#tblchequelist tbody').on('click', 'tr', function() {
        var listData = $(this).closest('tr').attr('id') || '';
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

Template.chequelist.events({
    'click #btnNewCheque': function(event) {
        FlowRouter.go('/chequecard');
    },
    'click .btnRefreshCheque': function (event) {
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblchequelist_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewChequeByNameOrID(dataSearchName).then(function (data) {
                $(".btnRefreshCheque").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.tchequeex.length > 0) {
                    for (let i = 0; i < data.tchequeex.length; i++) {
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tchequeex[i].fields.TotalAmount) || 0.00;
                        let totalTax = utilityService.modifynegativeCurrencyFormat(data.tchequeex[i].fields.TotalTax) || 0.00;
                        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tchequeex[i].fields.TotalAmountInc) || 0.00;
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tchequeex[i].fields.TotalPaid) || 0.00;
                        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tchequeex[i].fields.TotalBalance) || 0.00;
                        let orderstatus = data.tchequeex[i].fields.OrderStatus || '';
                        if(data.tchequeex[i].fields.Deleted == true){
                            orderstatus = "Deleted";
                        }else if(data.tchequeex[i].fields.CustomerName == ''){
                            orderstatus = "Deleted";
                        };
                        var dataList = {
                            id: data.tchequeex[i].fields.ID || '',
                            employee: data.tchequeex[i].fields.EmployeeName || '',
                            accountname: data.tchequeex[i].fields.GLAccountName || '',
                            sortdate: data.tchequeex[i].fields.OrderDate != '' ? moment(data.tchequeex[i].fields.OrderDate).format("YYYY/MM/DD") : data.tchequeex[i].fields.OrderDate,
                            orderdate: data.tchequeex[i].fields.OrderDate != '' ? moment(data.tchequeex[i].fields.OrderDate).format("DD/MM/YYYY") : data.tchequeex[i].fields.OrderDate,
                            suppliername: data.tchequeex[i].fields.SupplierName || '',
                            chequeNumber: data.tchequeex[i].fields.SupplierInvoiceNumber || '',
                            reference: data.tchequelist[i].fields.RefNo || '',
                            via: data.tchequelist[i].fields.Shipping || '',
                            currency: data.tchequelist[i].fields.ForeignExchangeCode || '',
                            totalamountex: totalAmountEx || 0.00,
                            totaltax: totalTax || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            orderstatus: orderstatus || '',
                            custfield1: '' || '',
                            custfield2: '' || '',
                            comments: data.tchequeex[i].fields.Comments || '',
                        };
                        if(data.tchequeex[i].fields.Deleted == false){
                            splashArrayInvoiceList.push(dataList);
                        }

                    }
                    templateObject.datatablerecords.set(splashArrayInvoiceList);

                    let item = templateObject.datatablerecords.get();
                    $('.fullScreenSpin').css('display', 'none');
                    if (splashArrayInvoiceList) {
                        var datatable = $('#tblchequelist').DataTable();
                        $("#tblchequelist > tbody").empty();
                        for (let x = 0; x < item.length; x++) {
                            $("#tblchequelist > tbody").append(
                                ' <tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                                '<td contenteditable="false" class="colSortDate hiddenColumn">' + item[x].sortdate + '</td>' +
                                '<td contenteditable="false" class="colOrderDate" ><span style="display:none;">' + item[x].orderdate + '</span>' + item[x].orderdate + '</td>' +
                                '<td contenteditable="false" class="colChequeID">' + item[x].id + '</td>' +
                                '<td contenteditable="false" class="colBankAccount" >' + item[x].accountname + '</td>' +
                                '<td contenteditable="false" class="colPurchaseNo">' + item[x].chequeNumber + '</td>' +
                                '<td contenteditable="false" class="colSupplier">' + item[x].suppliername + '</td>' +
                                '<td contenteditable="false" class="colReference">' + item[x].reference + '</td>' +
                                '<td contenteditable="false" class="colVia">' + item[x].via + '</td>' +
                                '<td contenteditable="false" class="colCurrency">' + item[x].currency + '</td>' +
                                '<td contenteditable="false" class="colAmountEx" style="text-align: right!important;">' + item[x].totalamountex + '</td>' +
                                '<td contenteditable="false" class="colTax" style="text-align: right!important;">' + item[x].totaltax + '</td>' +
                                '<td contenteditable="false" class="colAmount" style="text-align: right!important;">' + item[x].totalamount + '</td>' +
                                '<td contenteditable="false" class="colPaid" style="text-align: right!important;">' + item[x].totalpaid + '</td>' +
                                '<td contenteditable="false" class="colBalanceOutstanding" style="text-align: right!important;"">' + item[x].totaloustanding + '</td>' +
                                '<td contenteditable="false" class="colStatus">' + item[x].orderstatus + '</td>' +
                                '<td contenteditable="false" class="colPurchaseCustField1 hiddenColumn">' + item[x].custfield1 + '</td>' +
                                '<td contenteditable="false" class="colPurchaseCustField2 hiddenColumn">' + item[x].custfield2 + '</td>' +
                                '<td contenteditable="false" class="colComments">' + item[x].comments + '</td>' +
                                '</tr>');

                        }
                        $('.dataTables_info').html('Showing 1 to ' + data.tchequeex.length + ' of ' + data.tchequeex.length + ' entries');
                        setTimeout(function() {
                            makeNegativeGlobal();
                        }, 100);
                    }

                } else {
                    $('.fullScreenSpin').css('display', 'none');

                    swal({
                        title: 'Question',
                        text: "Cheque does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/chequecard');
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
    'click .btnRefresh': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        const currentBeginDate = new Date();
        const begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth()+1);
        }
        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        const toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        sideBarService.getAllPurchasesList(prevMonth11Date,toDate, true,initialReportLoad,0).then(function(data) {
            addVS1Data('TPurchasesList',JSON.stringify(data)).then(function (datareturn) {

            }).catch(function (err) {

            });
        }).catch(function(err) {

        });
        sideBarService.getAllChequeListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function(dataCheque) {
            addVS1Data('TChequeList', JSON.stringify(dataCheque)).then(function(datareturn) {
                sideBarService.getAllChequeList(initialDataLoad,0).then(function(data) {
                    addVS1Data('TCheque', JSON.stringify(data)).then(function(datareturn) {
                        window.open('/chequelist', '_self');
                    }).catch(function(err) {
                        window.open('/chequelist', '_self');
                    });
                }).catch(function(err) {
                    window.open('/chequelist', '_self');
                });
            }).catch(function(err) {
                sideBarService.getAllChequeList(initialDataLoad,0).then(function(data) {
                    addVS1Data('TCheque', JSON.stringify(data)).then(function(datareturn) {
                        window.open('/chequelist', '_self');
                    }).catch(function(err) {
                        window.open('/chequelist', '_self');
                    });
                }).catch(function(err) {
                    window.open('/chequelist', '_self');
                });
            });
        }).catch(function(err) {
            window.open('/chequelist', '_self');
        });
    },
});

Template.chequelist.helpers({
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
        return chequeSpelling;
    },

    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getAllChequeListData;
    },

    searchAPI: function() {
        return sideBarService.getChequeListDataByName;
    },

    service: ()=>{
        let sideBarService = new SideBarService();
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
            let dataReturn =  templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    apiParams: function() {
        return ["dateFrom", "dateTo", "ignoredate", "limitCount", "limitFrom", "deleteFilter"];
    },
});
Template.registerHelper('equals', function(a, b) {
    return a === b;
});
