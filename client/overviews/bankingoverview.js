import { PaymentsService } from '../payments/payments-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { EmployeeProfileService } from "../js/profile-service";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';

import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './bankingoverview.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import moment from "moment";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.bankingoverview.inheritsHooksFrom('transaction_list');

Template.bankingoverview.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.awaitingcustpaymentCount = new ReactiveVar();
    templateObject.awaitingsupppaymentCount = new ReactiveVar();

    templateObject.overduecustpaymentCount = new ReactiveVar();
    templateObject.overduesupppaymentCount = new ReactiveVar();
    templateObject.bankaccountdatarecord = new ReactiveVar([]);

    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);

    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.getDataTableList = function(data) {
        let lineID = "LineID";
        let accountType = data.Type || '';
        let amount = utilityService.modifynegativeCurrencyFormat(data.Amount) || 0.00;
        let amountInc = utilityService.modifynegativeCurrencyFormat(data.Amountinc) || 0.00;
        let creditEx = utilityService.modifynegativeCurrencyFormat(data.TotalCreditInc) || 0.00;
        let openningBalance = utilityService.modifynegativeCurrencyFormat(data.OpeningBalanceInc) || 0.00;
        let closingBalance = utilityService.modifynegativeCurrencyFormat(data.ClosingBalanceInc) || 0.00;

        if (data.Type == "Un-Invoiced PO") {
            lineID = data.PurchaseOrderID;
        } else if (data.Type == "PO") {
            lineID = data.PurchaseOrderID;
        } else if (data.Type == "Invoice") {
            lineID = data.SaleID;
        } else if (data.Type == "Credit") {
            lineID = data.PurchaseOrderID;
        } else if (data.Type == "Supplier Payment") {
            lineID = data.PaymentID;
        } else if (data.Type == "Bill") {
            lineID = data.PurchaseOrderID;
        } else if (data.Type == "Customer Payment") {
            lineID = data.PaymentID;
        } else if (data.Type == "Journal Entry") {
            lineID = data.SaleID;
        } else if (data.Type == "UnInvoiced SO") {
            lineID = data.SaleID;
        } else if (data.Type == "Cheque") {
            if (localStorage.getItem('ERPLoggedCountry') == "Australia") {
                accountType = "Cheque";
            } else if (localStorage.getItem('ERPLoggedCountry') == "United States of America") {
                accountType = "Check";
            } else {
                accountType = "Cheque";
            }

            lineID = data.PurchaseOrderID;
        } else if (data.Type == "Check") {
            lineID = data.PurchaseOrderID;
        }else {
            lineID = data.TransID;
        }

        var dataList = [
            data.Date != '' ? moment(data.Date).format("YYYY/MM/DD") : data.Date,
            '<span style="display:none;">' + (data.Date != '' ? moment(data.Date).format("YYYY/MM/DD") : data.Date).toString() + '</span>' +
            (data.Date != '' ? moment(data.Date).format("DD/MM/YYYY") : data.Date).toString(),
            lineID || '',
            data.AccountName || '',
            accountType || '',
            amount || 0.00,
            amountInc || 0.00,
            data.ClassName || '',
            data.ChqRefNo || '',
            data.Active == true ? '' : "Deleted",
            data.Notes || '',
            // creditex: creditEx || 0.00,
            // customername: data.ClientName || '',
            // openingbalance: openningBalance || 0.00,
            // closingbalance: closingBalance || 0.00,
            // accountnumber: data.AccountNumber || '',
            // accounttype: data.AccountType || '',
            // balance: balance || 0.00,
            // receiptno: data.ReceiptNo || '',
            // jobname: data.jobname || '',
            // paymentmethod: data.PaymentMethod || '',
        ];
        return dataList;
    }

    let headerStructure = [
        {index: 0, label: "#ID", class: "colSortDate", width: "0", active: false, display: false},
        {index: 1, label: "Date", class: "colPaymentDate", width: "80", active: true, display: true},
        {index: 2, label: "Trans ID", class: "colAccountId", width: "80", active: true, display: true},
        {index: 3, label: "Account", class: "colBankAccount", width: "100", active: true, display: true},
        {index: 4, label: "Type", class: "colType", width: "120", active: true, display: true},
        {index: 5, label: "Amount", class: "colPaymentAmount", width: "80", active: true, display: true},
        {index: 6, label: "Amount (Inc)", class: "colDebitEx", width: "120", active: true, display: true},
        {index: 7, label: "Department", class: "colDepartment", width: "80", active: true, display: true},
        {index: 8, label: "#ChqRefNo", class: "colChqRefNo", width: "110", active: false, display: true},
        {index: 9, label: "Status", class: "colStatus", width: "100", active: true, display: true},
        {index: 10, label: "Comments", class: "colNotes", width: "", active: true, display: true},
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.bankingoverview.onRendered(function() {
});

Template.bankingoverview.events({
    'click #tblBankingOverview tbody tr': function (event) {
        var listData = $(event.target).closest('tr').find('.colAccountId').text();
        var transactiontype = $(event.target).closest("tr").find(".colType").text();
        if ((listData) && (transactiontype)) {
            if (transactiontype == "Un-Invoiced PO") {
                FlowRouter.go('/purchaseordercard?id=' + listData);
            } else if (transactiontype == "PO") {
                FlowRouter.go('/purchaseordercard?id=' + listData);
            } else if (transactiontype == "Invoice") {
                FlowRouter.go('/invoicecard?id=' + listData);
            } else if (transactiontype == "Credit") {
                FlowRouter.go('/creditcard?id=' + listData);
            } else if (transactiontype == "Supplier Payment") {
                FlowRouter.go('/supplierpaymentcard?id=' + listData);
            } else if (transactiontype == "Bill") {
                FlowRouter.go('/billcard?id=' + listData);
            } else if (transactiontype == "Customer Payment") {
                FlowRouter.go('/paymentcard?id=' + listData);
            } else if (transactiontype == "Journal Entry") {
                FlowRouter.go('/journalentrycard?id=' + listData);
            } else if (transactiontype == "UnInvoiced SO") {
                FlowRouter.go('/salesordercard?id=' + listData);
            } else if (transactiontype == "Cheque") {
                FlowRouter.go('/chequecard?id=' + listData);
            } else if (transactiontype == "Check") {
                FlowRouter.go('/chequecard?id=' + listData);
            } else if (transactiontype == "Deposit Entry") {
                FlowRouter.go('/depositcard?id=' + listData);
            } else {
                FlowRouter.go('/chequelist');
            }
        }
    },
    'click .btnEft': function() {
      FlowRouter.go('/eft');
    },
    "keyup #tblBankingOverview_filter input": function (event) {
      if ($(event.target).val() != "") {
        $(".btnRefreshBankingOverview").addClass("btnSearchAlert");
      } else {
        $(".btnRefreshBankingOverview").removeClass("btnSearchAlert");
      }
      if (event.keyCode == 13) {
        $(".btnRefresh").trigger("click");
      }
    },
    "click .btnRefreshBankingOverview": function () {
        $(".btnRefresh").trigger("click");
    },
    'click .btnRefresh': function() {
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
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();

        sideBarService.getAllBankAccountDetails(prevMonth11Date,toDate, true,initialReportLoad,0).then(function(data) {
            addVS1Data('TBankAccountReport', JSON.stringify(data)).then(function(datareturn) {
                window.open('/bankingoverview','_self');
            }).catch(function(err) {
                window.open('/bankingoverview','_self');
            });
        }).catch(function(err) {
            window.open('/bankingoverview','_self');
        });
        //templateObject.getAllBankAccountData();
    },

    
    'click #newSalesOrder': function(event) {
        FlowRouter.go('/salesordercard');
    },
    'click .btnNewDepositEnrty': function(event) {
        FlowRouter.go('/depositcard');
    },
    'click .btnDepositList': function(event) {
        FlowRouter.go('/depositlist');
    },
    'click .btnCustomerlist': function(event) {
        FlowRouter.go('/customerpayment');
    },
    'click #newInvoice': function(event) {
        FlowRouter.go('/invoicecard');
    },
    'click .btnSupplierPaymentList': function(event) {
        FlowRouter.go('/supplierpayment');
    },
    'click #newQuote': function(event) {
        FlowRouter.go('/quotecard');
    },
    'click .QuoteList': function(event) {
        FlowRouter.go('/quoteslist');
    },
    'click #btnNewCheck': function(event) {
        FlowRouter.go('/chequecard');
    },
    
    'click .exportbtn': function() {

        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblBankingOverview_wrapper .dt-buttons .btntabletoexcel').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblBankingOverview_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display', 'none');
    }, delayTimeAfterSound);
    },
    'click .openaccountpayable': function() {
        FlowRouter.go('/chequelist');
    },
    'click .opentrans': async function(event) {
        let bankAccountName = $(event.target).closest('.openaccountreceivable').attr('id');
        // FlowRouter.go('/accounttransactions?id=' + id);
        await clearData('TAccountRunningBalanceReport');
        FlowRouter.go("/balancetransactionlist?accountName=" +bankAccountName +"&isTabItem=" +false);
    },
    'click .btnPrinStatment': function() {
        FlowRouter.go('/statementlist');
    },
    'click .btnStockAdjustment': function() {
        FlowRouter.go('/chequelist');
    },
    'click .btnReconcile': function() {
        FlowRouter.go('/bankrecon');
        // FlowRouter.go('/bankrecon');
        // window.open('/newbankrecon', '_self');
    },
    'click .btnBankRecon': function() {
        FlowRouter.go('/newbankrecon');
    },
    'click .btnReconList': function() {
        FlowRouter.go('/reconciliationlist');
    },
    'click #btnReconRuleList': function() {
        FlowRouter.go('/reconrulelist');
    },
    'click #btnNewReconRule': function(event) {
        FlowRouter.go('/newreconrule');
    },
    'click #btnEFTBankRuleList': function() {
        FlowRouter.go('/eftbankrulelist');
    },
    'click #btnNewEFTBankRule': function(event) {
        FlowRouter.go('/eftnewbankrule');
    },
    'click #btnEFTFileList': function() {
        FlowRouter.go('/eftfilescreated');
    },
    'click #btnEFTNewFile': function(event) {
        FlowRouter.go('/eft');
    },
});
Template.bankingoverview.helpers({
    
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: localStorage.getItem('mycloudLogonID'), PrefName: 'tblBankingOverview' });
    },
    formname: () => {
        return chequeSpelling;
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    },
    bankaccountdatarecord: () => {
        return Template.instance().bankaccountdatarecord.get();
    },
    // custom field displaysettings
    displayfields: () => {
      return Template.instance().displayfields.get();
    },

    datatablerecords : () => {
        return Template.instance().datatablerecords.get();
    },
    selectedInventoryAssetAccount: () => {
        return Template.instance().selectedInventoryAssetAccount.get();
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },

    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getAllBankAccountDetails;
    },

    searchAPI: function() {
        return sideBarService.searchAllBankAccountDetails;
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
      return ['dateFrom', 'dateTo', 'ignoredate', 'limitCount', 'limitFrom', 'deleteFilter'];
    },
});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});
