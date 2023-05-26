import {TaxRateService} from "../../settings-service";
import {ReactiveVar} from "meteor/reactive-var";
import "../../../lib/global/indexdbstorage.js";
import {Template} from 'meteor/templating';
import './automatedEmail.html';

const taxRateService = new TaxRateService();

Template.automatedEmail.onCreated(function () {
    let templateObject = Template.instance()
    this.tablename = new ReactiveVar(this.data.essential ? "tblEssentialAutomatedEmailsUpdated" : "tblAutomatedEmailsUpdated");
    let headerStructure  = [
        { index: 0, label: 'ID', class: 'colID', active: false, display: false, width: "20" },
        { index: 1, label: 'Transaction Type', class: 'colTransType arrow', active: true, display: true, width: "250" },
        { index: 2, label: 'Frequency', class: 'colFrequency', active: true, display: true, width: "250" },
        { index: 3, label: 'Recipients', class: 'colRecipients', active: true, display: true, width: "250" },        
        { index: 4, label: 'History & Upcoming', class: 'colHistory text-center', active: true, display: true, width: "250" },
        { index: 5, label: 'Print Wrapper', class: 'colPrintWrapper', active: false, display: false, width: "120" },
        // { index: 6, label: 'Status', class: 'colStatus', active: false, display: false, width: "120" },
    ];
    this.tableheaderrecords = new ReactiveVar(headerStructure);
    


    this.getDataTableList = function(data){
        let typeId = data.formID
        if (templateObject.data.essential) {
            if (typeId !== 1 && typeId !== 54 && typeId !== 129 && typeId !== 177) return []           
        } else {
            if (typeId == 1 || typeId == 54 || typeId == 129 || typeId == 177) return []
        }        
        let frequency
        switch (data.frequencyType) {
            case 'M':
                frequency = `<div class="s-input" id="edtFrequency" data-basedontype="${data.basedOnType}"
                    data-monthdate="${data.monthDays}" data-starttime="${data.startTime}"
                    data-starttime="${data.startTime}" data-startdate="${data.startDate}"
                >Monthly${data.basedOnTypeText}</div>`
                break;
            case 'W':
                frequency = `<div class="s-input" id="edtFrequency" data-basedontype="${data.basedOnType}"
                    data-selectdays="${data.weekDay}" data-everyweeks="${data.every}"
                    data-starttime="${data.startTime}" data-startdate="${data.startDate}"
                >Weekly${data.basedOnTypeText}</div>`
                break;
            case 'D':
                frequency = `<div class="s-input" id="edtFrequency" data-basedontype="${data.basedOnType}"
                    data-sataction="${data.satAction}" data-sunaction="${data.sunAction}"
                    data-everydays="${data.every}"
                    data-starttime="${data.startTime}" data-startdate="${data.startDate}"
                >Daily${data.basedOnTypeText}</div>`
                break;
            case 'O':
                if (data.startDate !== "") {
                    frequency = `<div class="s-input" id="edtFrequency" data-basedontype="${data.basedOnType}"
                        data-starttime="${data.startTime}" data-startdate="${data.startDate}"
                    >One Time Only${data.basedOnTypeText}</div>`
                } else {
                    frequency = `<div class="s-input" id="edtFrequency" data-basedontype="${data.basedOnType}"
                    ></div>`
                }
                break;
            default:
                frequency = `<div class="s-input" id="edtFrequency" data-basedontype="${data.basedOnType}"
                    >${data.basedOnTypeText}</div>`
        }
        let printWrapper
        switch (typeId) {
            case 129:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-129" id="profitTemp">
                    {{> newprofitandloss}}
                </div>`
                break;
            case 54:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-54" id="invoicePDFTemp">
                    {{> invoicePrintTemp}}
                </div>`
                break;
            case 177:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-177" id="statementPDFTemp">
                    {{> statementPrintTemp}}
                </div>`
                break;
            case 6:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-6" id="agedPayablesTemp">
                    {{> agedpayables}}
                </div>`
                break;
            case 134:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-134" id="agedReceivableTemp">
                    {{> agedreceivables}}
                </div>`
                break;
            case 12:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-12" id="billPDFTemp">
                    {{> billPrintTemp}}
                </div>`
                break;
            case 18:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-18" id="chequePDFTemp">
                    {{> chequePrintTemp}}
                </div>`
                break;
            case 21:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-21" id="creditPDFTemp">
                    {{> creditPrintTemp}}
                </div>`
                break;
            case 61:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-61" id="paymentsPDFTemp">
                    {{> paymentsPrintTemp}}
                </div>`
                break;
            case 69:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-69" id="purchaseOrderPDFTemp">
                    {{> purchaseOrderPrintTemp}}
                </div>`
                break;
            case 225:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-225" id="generalLedgerTemp">
                    {{> generalledger}}
                </div>`
                break;
            case 1464:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-1464" id="productSalesReportTemp">
                    {{> productsalesreport}}
                </div>`
                break;
            case 70:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-70" id="purchaseReportTemp">
                    {{> purchasesreport}}
                </div>`
                break;
            case 1364:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-1364" id="purchaseSummaryTemp">
                    {{> purchasesummaryreport}}
                </div>`
                break;
            case 71:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-71" id="quotePDFTemp">
                    {{> quotesPrintTemp}}
                </div>`
                break;
            case 74:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-74" id="refundPDFTemp">
                    {{> refundPrintTemp}}
                </div>`
                break;
            case 77:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-77" id="salesorderPDFTemp">
                    {{> salesorderPrintTemp}}
                </div>`
                break;
            case 68:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-68" id="salesReportTemp">
                    {{> salesreport}}
                </div>`
                break;
            case 17544:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-17544" id="statementPDFTemp">
                    {{> statementPrintTemp}}
                </div>`
                break;
            case 94:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-94" id="supplierpaymentPDFTemp">
                    {{> supplierpaymentPrintTemp}}
                </div>`
                break;
            case 278:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-278" id="taxSummaryReportTemp">
                    {{> taxsummaryreport}}
                </div>`
                break;
            case 140:
                printWrapper = `<div class="d-none print-wrapper print-wrapper-140" id="trialBalanceTemp">
                    {{> trialbalance}}
                </div>`
                break;
            default:
                printWrapper = ``
        }
        let dataList = [
            `automated${data.formID}`,
            `<div ${data.formID === 1 ? 'id="groupedReports"' : ''} data-ids="${data.formIDs}">${data.formname}</div>`,
            frequency,
            `<input id="edtRecipients-${data.formID}" class="es-input highlightSelect edtRecipients" 
            type="search" data-ids="${data.employeeid}" value="${data.recipients}"
            >`,
            `<button class="btn btn-primary btn-show-history d-flex align-items-center justify-content-around col-xl-4 col-6 mx-auto">
                <div class="fa fa-history"></div>
            </button>`,
            printWrapper,
            // data.status ? "" : "In-Active"
        ]        
        return dataList;
    }
});

Template.automatedEmail.onRendered(function () {

});

Template.automatedEmail.events({

});

Template.automatedEmail.helpers({    
    tablename : () => {
        return Template.instance().tablename.get();
    },
 
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },    

    apiFunction:function() {        
        return taxRateService.getAutomatedEmail;
    },

    searchAPI: function() {        
        return taxRateService.searchAutomatedEmail;
    },
   
    service: ()=>{        
        return taxRateService;
    },

    datahandler: function () {        
        return Template.instance().getDataTableList
    },
   
    exDataHandler: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data)
            return dataReturn
        }
    },
   
    apiParams: ()=>{
        return []
    },
});
