import { SalesBoardService } from "../js/sales-service";
import { PurchaseBoardService } from "../js/purchase-service";
import { ReactiveVar } from "meteor/reactive-var";
import { UtilityService } from "../utility-service";
import { ProductService } from "../product/product-service";
import "../lib/global/erp-objects";
import "jquery-ui-dist/external/jquery/jquery";
import "jquery-ui-dist/jquery-ui";
import { Random } from "meteor/random";
import { jsPDF } from "jspdf";
import "jQuery.print/jQuery.print.js";
import "jquery-editable-select";
import { SideBarService } from "../js/sidebar-service";
import "../lib/global/indexdbstorage.js";
import { ContactService } from "../contacts/contact-service";
import { TaxRateService } from "../settings/settings-service";
import { saveCurrencyHistory } from "../packages/currency/CurrencyWidget";
import FxGlobalFunctions from "../packages/currency/FxGlobalFunctions";
import CachedHttp from "../lib/global/CachedHttp";
import erpObject from "../lib/global/erp-objects";
import { Template } from 'meteor/templating';
import './frm_invoice_with_temp.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import LoadingOverlay from '../LoadingOverlay';

const sideBarService = new SideBarService();
const utilityService = new UtilityService();
const productService = new ProductService();
const salesService = new SalesBoardService();
const contactService = new ContactService();
const taxRateService = new TaxRateService();
const initialDatatableLoad = 10

let times = 0;
let clickedInput = "";

let template_list = ["Invoices", "Invoice Back Orders", "Delivery Docket"];
var noHasTotals = ["Customer Payment", "Customer Statement", "Supplier Payment", "Statement", "Delivery Docket", "Journal Entry", "Deposit"];

let defaultCurrencyCode = CountryAbbr;

function generateHtmlMailBody(ID, stringQuery) {
  let erpInvoiceId = ID;
  let mailFromName = localStorage.getItem("vs1companyName");
  let emailDueDate = $("#dtDueDate").val();
  var grandtotal = $("#grandTotal").text() || Currency + 0;
  let customerEmailName = $("#edtCustomerName").val();
  let customerBillingAddress = $("#txabillingAddress").val();
  let customerTerms = $(".transheader > #sltTerms_fromtransactionheader").val();
  let customerSubtotal = $("#subtotal_total").html();
  let customerTax = $("#subtotal_tax").html();
  let customerNett = $("#subtotal_nett").html();
  let customerTotal = $("#grandTotal").html();
  let html =
            '    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate;mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">' +
            "        <tr>" +
            '            <td class="container" style="display: block; margin: 0 auto !important; max-width: 650px; padding: 10px; width: 650px;">' +
            '                <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 650px; padding: 10px;">' +
            '                    <table class="main">' +
            "                        <tr>" +
            '                            <td class="wrapper">' +
            '                                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">' +
            "                                    <tr>" +
            '                                        <td class="content-block" style="text-align: center; letter-spacing: 2px;">' +
            '                                            <span class="doc-details" style="color: #999999; font-size: 12px; text-align: center; margin: 0 auto; text-transform: uppercase;">Invoice No. ' +
            erpInvoiceId +
            " Details</span>" +
            "                                        </td>" +
            "                                    </tr>" +
            '                                    <tr style="height: 16px;"></tr>' +
            "                                    <tr>" +
            "                                        <td>" +
            '                                            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%;" />' +
            "                                        </td>" +
            "                                    </tr>" +
            '                                    <tr style="height: 48px;"></tr>' +
            '                                    <tr style="background-color: rgba(0, 163, 211, 0.5); ">' +
            '                                        <td style="text-align: center;padding: 32px 0px 16px 0px;">' +
            '                                             <p style="font-weight: 700; font-size: 16px; color: #363a3b; margin-bottom: 6px;">DUE ' +
            emailDueDate +
            "</p>" +
            '                                            <p style="font-weight: 700; font-size: 36px; color: #363a3b; margin-bottom: 6px; margin-top: 6px;">' +
            grandtotal +
            "</p>" +
            '                                            <table border="0" cellpadding="0" cellspacing="0" style="box-sizing: border-box; width: 100%;">' +
            "                                                <tbody>" +
            "                                                    <tr>" +
            '                                                        <td align="center" style="padding-bottom: 15px;">' +
            '                                                            <table border="0" cellpadding="0" cellspacing="0" style="width: auto;">' +
            "                                                                <tbody>" +
            "                                                                    <tr>" +
            '                                                                        <td> <a href="' +
            stripeGlobalURL +
            "" +
            stringQuery +
            '" style="border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none;' +
            '                                                                        text-transform: capitalize; background-color: #363a3b; border-color: #363a3b; color: #ffffff;" target="">Pay Now</a> </td>' +
            "                                                                    </tr>" +
            "                                                                </tbody>" +
            "                                                            </table>" +
            "                                                        </td>" +
            "                                                    </tr>" +
            "                                                </tbody>" +
            "                                            </table>" +
            '                                            <p style="margin-top: 0px;">Powered by VS1 Cloud</p>' +
            "                                        </td>" +
            "                                    </tr>" +
            "                                    <tr>" +
            '                                        <td class="content-block" style="padding: 16px 32px;">' +
            '                                            <p style="font-size: 18px;">Dear ' +
            customerEmailName +
            ",</p>" +
            '                                            <p style="font-size: 18px; margin: 34px 0px;">Here\'s your invoice! We appreciate your prompt payment.</p>' +
            '                                            <p style="font-size: 18px; margin-bottom: 8px;">Thanks for your business!</p>' +
            '                                            <p style="font-size: 18px;">' +
            mailFromName +
            "</p>" +
            "                                        </td>" +
            "                                    </tr>" +
            '                                    <tr style="background-color: #ededed;">' +
            '                                        <td class="content-block" style="padding: 16px 32px;">' +
            '                                            <div style="width: 100%; padding: 16px 0px;">' +
            '                                                <div style="width: 50%; float: left;">' +
            '                                                    <p style="font-size: 18px;">Invoice To</p>' +
            "                                                </div>" +
            '                                                <div style="width: 50%; float: right;">' +
            '                                                    <p style="margin-bottom: 0px;font-size: 16px;">' +
            customerEmailName +
            "</p>" +
            '                                                    <p style="margin-bottom: 0px;font-size: 16px;">' +
            customerBillingAddress +
            "</p>" +
            "                                                </div>" +
            "                                            </div>" +
            "                                        </td>" +
            "                                    </tr>" +
            '                                    <tr style="background-color: #ededed;">' +
            '                                        <td class="content-block" style="padding: 16px 32px;">' +
            '                                            <hr style=" border-top: 1px dotted #363a3b;" />' +
            '                                            <div style="width: 100%; padding: 16px 0px;">' +
            '                                                <div style="width: 50%; float: left;">' +
            '                                                    <p style="font-size: 18px;">Terms</p>' +
            "                                                </div>" +
            '                                                <div style="width: 50%; float: right;">' +
            '                                                    <p style="font-size: 18px;">' +
            customerTerms +
            "</p>" +
            "                                                </div>" +
            "                                            </div>" +
            "                                        </td>" +
            "                                    </tr>" +
            "                                    <tr>" +
            '                                        <td class="content-block" style="padding: 16px 32px;">' +
            '                                            <hr style=" border-top: 1px dotted #363a3b;" />' +
            '                                            <div style="width: 100%; float: right; padding-top: 24px;">' +
            '                                                <div style="width: 50%; float: left;">' +
            '                                                    <p style="font-size: 18px; font-weight: 600;">Subtotal</p>' +
            '                                                    <p style="font-size: 18px; font-weight: 600;">Tax</p>' +
            '                                                    <p style="font-size: 18px; font-weight: 600;">Nett</p>' +
            '                                                    <p style="font-size: 18px; font-weight: 600;">Balance Due</p>' +
            "                                                </div>" +
            '                                                <div style="width: 50%; float: right; text-align: right;">' +
            '                                                    <p style="font-size: 18px; font-weight: 600;">' +
            customerSubtotal +
            "</p>" +
            '                                                    <p style="font-size: 18px; font-weight: 600;">' +
            customerTax +
            "</p>" +
            '                                                    <p style="font-size: 18px; font-weight: 600;">' +
            customerNett +
            "</p>" +
            '                                                    <p style="font-size: 18px; font-weight: 600;">' +
            customerTotal +
            "</p>" +
            "                                                </div>" +
            "                                            </div>" +
            "                                        </td>" +
            "                                    </tr>" +
            "                                    <tr>" +
            '                                        <td class="content-block" style="padding: 16px 32px; padding-top: 0px;">' +
            '                                            <hr style=" border-top: 1px dotted #363a3b;" />' +
            '                                            <table border="0" cellpadding="0" cellspacing="0" style="box-sizing: border-box; width: 100%;">' +
            "                                                <tbody>" +
            "                                                    <tr>" +
            '                                                        <td align="center">' +
            '                                                            <table border="0" cellpadding="0" cellspacing="0" style="width: auto;">' +
            "                                                                <tbody>" +
            "                                                                    <tr>" +
            '                                                                        <td> <a href="' +
            stripeGlobalURL +
            "" +
            stringQuery +
            '" style="border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none;' +
            '                                                                        text-transform: capitalize; background-color: #363a3b; border-color: #363a3b; color: #ffffff;" target="">Pay Now</a> </td>' +
            "                                                                    </tr>" +
            "                                                                </tbody>" +
            "                                                            </table>" +
            "                                                        </td>" +
            "                                                    </tr>" +
            "                                                </tbody>" +
            "                                            </table>" +
            "                                        </td>" +
            "                                    </tr>" +
            "                                    <tr>" +
            '                                        <td class="content-block" style="padding: 16px 32px;">' +
            '                                            <p style="font-size: 15px; color: #666666;">If you receive an email that seems fraudulent, please check with the business owner before paying.</p>' +
            "                                        </td>" +
            "                                    </tr>" +
            "                                    <tr>" +
            "                                        <td>" +
            '                                            <table border="0" cellpadding="0" cellspacing="0" style="box-sizing: border-box; width: 100%;">' +
            "                                                <tbody>" +
            "                                                    <tr>" +
            '                                                        <td align="center">' +
            '                                                            <table border="0" cellpadding="0" cellspacing="0" style="width: auto;">' +
            "                                                                <tbody>" +
            "                                                                    <tr>" +
            '                                                                        <td> <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%; width: 20%; margin: 0; padding: 12px 25px; display: inline-block;" /> </td>' +
            "                                                                    </tr>" +
            "                                                                </tbody>" +
            "                                                            </table>" +
            "                                                        </td>" +
            "                                                    </tr>" +
            "                                                </tbody>" +
            "                                            </table>" +
            "                                        </td>" +
            "                                    </tr>" +
            "                                </table>" +
            "                            </td>" +
            "                        </tr>" +
            "                    </table>" +
            '                    <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">' +
            '                        <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">' +
            "                            <tr>" +
            '                                <td class="content-block" style="color: #999999; font-size: 12px; text-align: center;">' +
            '                                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">' +
            mailFromName +
            "</span>" +
            "                                    <br>" +
            '                                    <a href="https://vs1cloud.com/downloads/VS1%20Privacy%20ZA.pdf" style="color: #999999; font-size: 12px; text-align: center;">Privacy</a>' +
            '                                    <a href="https://vs1cloud.com/downloads/VS1%20Terms%20ZA.pdf" style="color: #999999; font-size: 12px; text-align: center;">Terms of Service</a>' +
            "                                </td>" +
            "                            </tr>" +
            "                        </table>" +
            "                    </div>" +
            "                </div>" +
            "            </td>" +
            "        </tr>" +
            "    </table>";

        return html;
}

Template.invoice_temp.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.isForeignEnabled = new ReactiveVar(false);
  templateObject.records = new ReactiveVar();
  templateObject.CleintName = new ReactiveVar();
  templateObject.Department = new ReactiveVar();
  templateObject.Date = new ReactiveVar();
  templateObject.DueDate = new ReactiveVar();
  templateObject.InvoiceNo = new ReactiveVar();
  templateObject.RefNo = new ReactiveVar();
  templateObject.Branding = new ReactiveVar();
  templateObject.Currency = new ReactiveVar();
  templateObject.Total = new ReactiveVar();
  templateObject.Subtotal = new ReactiveVar();
  templateObject.TotalTax = new ReactiveVar();
  templateObject.invoicerecord = new ReactiveVar({});
  templateObject.taxrateobj = new ReactiveVar();
  templateObject.Accounts = new ReactiveVar([]);
  templateObject.InvoiceId = new ReactiveVar();
  templateObject.selectedCurrency = new ReactiveVar([]);
  templateObject.inputSelectedCurrency = new ReactiveVar([]);
  templateObject.currencySymbol = new ReactiveVar([]);
  templateObject.deptrecords = new ReactiveVar();
  templateObject.termrecords = new ReactiveVar();
  templateObject.clientrecords = new ReactiveVar([]);
  templateObject.taxraterecords = new ReactiveVar([]);
  templateObject.taxcodes = new ReactiveVar([]);
  templateObject.accountID = new ReactiveVar();
  templateObject.stripe_fee_method = new ReactiveVar();
  /* Attachments */
  templateObject.uploadedFile = new ReactiveVar();
  templateObject.uploadedFiles = new ReactiveVar([]);
  templateObject.attachmentCount = new ReactiveVar();
  templateObject.address = new ReactiveVar();
  templateObject.abn = new ReactiveVar();
  templateObject.referenceNumber = new ReactiveVar();
  templateObject.statusrecords = new ReactiveVar([]);
  templateObject.includeBOnShippedQty = new ReactiveVar();
  templateObject.includeBOnShippedQty.set(true);
  templateObject.productextrasellrecords = new ReactiveVar([]);
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.selectedcustomerpayrecords = new ReactiveVar([]);
  templateObject.singleInvoiceData = new ReactiveVar([]);
  templateObject.defaultsaleterm = new ReactiveVar();

  templateObject.invoice_data = new ReactiveVar([]);
  templateObject.subtaxcodes = new ReactiveVar([]);
  templateObject.isbackorderredirect = new ReactiveVar();
  templateObject.isbackorderredirect.set(false);
  templateObject.hasFollow = new ReactiveVar(false);
  templateObject.customers = new ReactiveVar([]);
  templateObject.customer = new ReactiveVar();

  templateObject.customerRecord = new ReactiveVar();
  templateObject.headerfields = new ReactiveVar();
  templateObject.headerbuttons = new ReactiveVar();
  templateObject.tranasctionfooterfields = new ReactiveVar();

  function formatDate (date) {
    return moment(date).format('DD/MM/YYYY');
  }

  let transactionheaderfields = [
      {label: "Sales Date", type:"date", readonly: false, value: formatDate(new Date()), divClass:"col-12 col-md-6 col-lg-4 col-xl-2 transheader", field:'saledate'},
      {label: "P.O.Number", type:'default', id: 'ponumber', value: '', readonly: false, divClass:"col-12 col-md-6 col-lg-4 col-xl-2 transheader", field: 'custPONumber'},
      {label: 'Terms', type: 'search', id: 'sltTerms', listModalId:'termsList_modal', listModalTemp: 'termlistpop', colName: 'colName', editModalId: 'newTerms_modal', editModalTemp:'newtermspop', editable: true, divClass:"col-12 col-md-6 col-lg-4 col-xl-2 transheader", field:'termsName'},
      {label: 'Status', type: 'search', id: 'sltStatus', listModalId:'statusPop_modal', listModalTemp: 'statuspop', colName: 'colStatusName', editModalId: 'newStatusPop_modal', editModalTemp:'newstatuspop', editable: true, divClass:"col-12 col-md-6 col-lg-4 col-xl-2 transheader", field: 'status'},
      {label: 'Reference', type: 'defailt', id:'edtRef', value: '', readonly: false, divClass:"col-12 col-md-6 col-lg-4 col-xl-2 transheader", field: 'reference'},
      {label: 'Department', type: 'search', id: 'sltDept', listModalId:'department_modal', listModalTemp: 'departmentpop', colName: 'colDeptName', editModalId: 'newDepartment_modal', editModalTemp:'newdepartmentpop', editable: true, divClass:"col-12 col-md-6 col-lg-4 col-xl-2 transheader", field: 'department'},
  ]
  templateObject.headerfields.set(transactionheaderfields);

  let transactionheaderbuttons = [
      {label: "Pay Now", class:'btnTransaction payNow', id:'btnPayNow', bsColor:'success', icon:'dollar-sign'},
      {label: "Payment", class:'btnTransaction btnMakePayment', id:'btnPayment', bsColor:'primary'},
      {label: "Copy Invoice", class:'btnTransaction copyInvoice btnCopyTransaction', id:'btnCopyInvoice', bsColor:'primary'}
  ]
  templateObject.headerbuttons.set(transactionheaderbuttons)


  let transactionfooterfields = [
    {label: 'Comments', id: "txaComment", name:"txaComment", row: 6, datafield: 'comments'},
    {label: 'Picking Instructions', id: "txapickmemo", name:"txapickmemo", row: 6, datafield: 'pickmemo'},
  ];

  templateObject.tranasctionfooterfields.set(transactionfooterfields);

  templateObject.printOptions = new ReactiveVar();
  let options = [ {title: 'Invoices', number: 1, nameFieldID:'Invoices_1'}, {title: 'Invoices', number: 2, nameFieldID:'Invoices_2'}, {title: 'Invoices', number: 3, nameFieldID:'Invoices_3'},
  {title: 'Invoice Back Orders', number: 1, nameFieldID:'Invoice Back Orders_1'},{title: 'Invoice Back Orders', number: 2, nameFieldID:'Invoice Back Orders_2'},{title: 'Invoice Back Orders', number: 3, nameFieldID:'Invoice Back Orders_3'},
  {title: 'Delivery Docket', number: 1, nameFieldID:'Delivery Docket_1'},{title: 'Delivery Docket', number: 2, nameFieldID:'Delivery Docket_2'},{title: 'Delivery Docket', number: 3, nameFieldID:'Delivery Docket_3'},
  ]

  templateObject.printOptions.set(options)


  templateObject.setInitialRecords = function () {
    let lineItems = [];
    let lineItemObj = {};
    lineItemObj = {
      lineID: Random.id(),
      item: "",
      description: "",
      quantity: 1,
      qtyordered: "",
      qtyshipped: "",
      qtybo: "",
      UnitOfMeasure: defaultUOM || "",
      unitPrice: 0,
      unitPriceInc: 0,
      TotalAmt: 0,
      TotalAmtInc: 0,
      taxRate: "",
      taxCode: "",
      curTotalAmt: 0,
      TaxTotal: 0,
      TaxRate: 0,
      weight: 0,
      weightUnit: 'Kg',
      volume: 0,
      volumeUnit: 'm3',
    };
    lineItems.push(lineItemObj);
    const currentDate = new Date();
    const begunDate = moment(currentDate).format("DD/MM/YYYY");
    let invoicerecord = {
      id: "",
      lid: "New Invoice",
      socustomer: "",
      salesOrderto: "",
      shipto: "",
      department: defaultDept || "",
      docnumber: "",
      custPONumber: "",
      saledate: begunDate,
      duedate: "",
      employeename: "",
      status: "",
      category: "",
      comments: "",
      pickmemo: "",
      ponumber: "",
      via: "",
      connote: "",
      reference: "",
      currency: "",
      branding: "",
      invoiceToDesc: "",
      shipToDesc: "",
      termsName: templateObject.defaultsaleterm.get() || "",
      Total: Currency + "" + 0.0,
      TotalDiscount: Currency + "" + 0.0,
      LineItems: lineItems,
      TotalTax: Currency + "" + 0.0,
      SubTotal: Currency + "" + 0.0,
      balanceDue: Currency + "" + 0.0,
      saleCustField1: "",
      saleCustField2: "",
      totalPaid: Currency + "" + 0.0,
      ispaid: false,
      isPartialPaid: false,
      showingDelivery: false
    };
    if (FlowRouter.current().queryParams.customerid) {
      // templateObject.getCustomerData(FlowRouter.current().queryParams.customerid);
    } else {
      $("#edtCustomerName").val("");
    }
    $(".transheader > #sltDept_fromtransactionheader").val(defaultDept);
    $(".transheader > #sltTerms_fromtransactionheader").val(invoicerecord.termsName);
    $('#edtCustfield_1').val(invoicerecord.saleCustField1)
    $('#edtCustfield_2').val(invoicerecord.saleCustField2)
    // templateObject.getLastInvoiceData();
    templateObject.invoicerecord.set(invoicerecord)
    return invoicerecord;
  }

  /**
   * It should be updated with indexeddb
   */
  templateObject.getLastInvoiceData = async function () {
    let lastDepartment = defaultDept || "";
    salesService.getLastInvoiceID().then(function (data) {
        let latestInvoiceId;
        if (data.tinvoice.length > 0) {
          lastInvoice = data.tinvoice[data.tinvoice.length - 1];
          latestInvoiceId = lastInvoice.Id;
        } else {
          latestInvoiceId = 0;
        }
        newInvoiceId = latestInvoiceId + 1;
        setTimeout(function () {
          $(".transheader > #sltDept_fromtransactionheader").val(lastDepartment);
        }, 50);
      })
      .catch(function (err) {
        $(".transheader > #sltDept_fromtransactionheader").val(lastDepartment);
      });
  };
 
  /**
 * Should be updated with indexeddb
 */
  templateObject.getAllSelectPaymentData = function () {
    let customerName = $("#edtCustomerName").val() || "";
    salesService
      .getCheckPaymentDetailsByName(customerName)
      .then(function (data) {
        const dataTableList = [];
        for (let i = 0; i < data.tcustomerpayment.length; i++) {
          let amount =
            utilityService.modifynegativeCurrencyFormat(
              data.tcustomerpayment[i].fields.Amount
            ) || 0.0;
          let applied =
            utilityService.modifynegativeCurrencyFormat(
              data.tcustomerpayment[i].fields.Applied
            ) || 0.0;
          let balance =
            utilityService.modifynegativeCurrencyFormat(
              data.tcustomerpayment[i].fields.Balance
            ) || 0.0;
          var dataList = {
            id: data.tcustomerpayment[i].fields.ID || "",
            sortdate: data.tcustomerpayment[i].fields.PaymentDate != "" ?
              moment(data.tcustomerpayment[i].fields.PaymentDate).format(
                "YYYY/MM/DD"
              ) : data.tcustomerpayment[i].fields.PaymentDate,
            paymentdate: data.tcustomerpayment[i].fields.PaymentDate != "" ?
              moment(data.tcustomerpayment[i].fields.PaymentDate).format(
                "DD/MM/YYYY"
              ) : data.tcustomerpayment[i].fields.PaymentDate,
            customername: data.tcustomerpayment[i].fields.CompanyName || "",
            paymentamount: amount || 0.0,
            applied: applied || 0.0,
            balance: balance || 0.0,
            lines: data.tcustomerpayment[i].fields.Lines,
            bankaccount: data.tcustomerpayment[i].fields.AccountName || "",
            department: data.tcustomerpayment[i].fields.DeptClassName || "",
            refno: data.tcustomerpayment[i].fields.ReferenceNo || "",
            paymentmethod: data.tcustomerpayment[i].fields.PaymentMethodName || "",
            notes: data.tcustomerpayment[i].fields.Notes || "",
          };
          dataTableList.push(dataList);
        }
        templateObject.selectedcustomerpayrecords.set(dataTableList);
      })
      .catch(function (err) { });
  };


  templateObject.setInvoiceDataFields = function(data) {
    templateObject.singleInvoiceData.set(data);
    const isRepeated = data.fields.RepeatedFrom;
    // templateObject.hasFollow.set(isRepeated);
    let lineItems = [];
    let lineItemObj = {};
    let currencySymbol = Currency;
    let totalInc = currencySymbol + "" + data.fields.TotalAmountInc.toLocaleString(undefined, {minimumFractionDigits: 2,});
    let totalDiscount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalDiscount).toLocaleString(undefined, {minimumFractionDigits: 2,});
    let subTotal = currencySymbol + "" + data.fields.TotalAmount.toLocaleString(undefined, {minimumFractionDigits: 2,});
    let totalTax = currencySymbol + "" + data.fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2,});
    let totalBalance = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {minimumFractionDigits: 2,});

    let totalPaidAmount = currencySymbol + "" + data.fields.TotalPaid.toLocaleString(undefined, {minimumFractionDigits: 2,
      });
    if (data.fields.Lines != null) {
      if (data.fields.Lines.length) {
        for (let i = 0; i < data.fields.Lines.length; i++) {
          let AmountGbp = currencySymbol + "" + data.fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {minimumFractionDigits: 2,});
          let currencyAmountGbp = currencySymbol + "" + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
          let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
          let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);

          let SalesLinesCustField1Val = (data.fields.Lines[i].fields.SalesLinesCustField1);

          let serialno = "";
          let lotno = "";
          let expirydate = "";
          if(data.fields.Lines[i].fields?.PQA?.fields?.PQASN != null){
            for (let j = 0; j < data.fields.Lines[i].fields.PQA.fields.PQASN.length; j++) {
              serialno += (serialno == "") ? data.fields.Lines[i].fields.PQA.fields.PQASN[j].fields.SerialNumber : ","+data.fields.Lines[i].fields.PQA.fields.PQASN[j].fields.SerialNumber;
            }
          }
          if(data.fields.Lines[i].fields?.PQA?.fields?.PQABatch != null){
            for (let j = 0; j < data.fields.Lines[i].fields.PQA.fields.PQABatch.length; j++) {
              lotno += (lotno == "") ? data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchNo : ","+data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchNo;
              let expirydateformat = data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate != '' ? moment(data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate).format("YYYY/MM/DD"): data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate;
              expirydate += (expirydate == "") ? expirydateformat : ","+expirydateformat;
            }
          }
          lineItemObj = {
            lineID: Random.id(),
            id: data.fields.Lines[i].fields.ID || "",
            item: data.fields.Lines[i].fields.ProductName || "",
            description: data.fields.Lines[i].fields.ProductDescription ||
              "",
            quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
            qtyordered: data.fields.Lines[i].fields.UOMOrderQty || 0,
            qtyshipped: data.fields.Lines[i].fields.UOMQtyShipped || 0,
            qtybo: data.fields.Lines[i].fields.UOMQtyBackOrder || 0,
            UnitOfMeasure: data.fields.Lines[i].fields.UnitOfMeasure || defaultUOM,
            unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, {minimumFractionDigits: 2,}) || '0.00',
            unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, {minimumFractionDigits: 2,}) || '0.00',
            TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, {minimumFractionDigits: 2,}) || '0.00',
            TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, {minimumFractionDigits: 2,}) || '0.00',
            lineCost: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCost).toLocaleString(undefined, {minimumFractionDigits: 2,}) || '0.00',
            taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
            taxCode: data.fields.Lines[i].fields.LineTaxCode || "",
            curTotalAmt: currencyAmountGbp || currencySymbol + "0",
            TaxTotal: TaxTotalGbp || '0.00',
            TaxRate: TaxRateGbp || 0,
            DiscountPercent: data.fields.Lines[i].fields.DiscountPercent || 0,
            SalesLinesCustField1: SalesLinesCustField1Val,
            serialnumbers: serialno,
            lotnumbers: lotno,
            expirydates: expirydate,
            weight: data.fields.Lines[i].fields.Weight || 0,
            weightUnit: data.fields.Lines[i].fields.WeightUnit || 'kg',
            volume: data.fields.Lines[i].fields.Volume || 0,
            volumeUnit: data.fields.Lines[i].fields.VolumeUnit || "m3"
          };
          
          lineItems.push(lineItemObj);
        }
      } else {
        let AmountGbp = data.fields.Lines.fields.TotalLineAmountInc.toLocaleString(undefined, {minimumFractionDigits: 2,});
        let currencyAmountGbp = currencySymbol + "" + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
        let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines.fields.LineTaxTotal);
        let TaxRateGbp = (data.fields.Lines.fields.LineTaxRate * 100).toFixed(2);
        lineItemObj = {
          lineID: Random.id(),
          id: data.fields.Lines.fields.ID || "",
          description: data.fields.Lines.fields.ProductDescription || "",
          quantity: data.fields.Lines.fields.UOMOrderQty || 0,
          UnitOfMeasure: data.fields.Lines.fields.UnitOfMeasure || defaultUOM,
          unitPrice: data.fields.Lines[i].fields.OriginalLinePrice.toLocaleString(undefined, { minimumFractionDigits: 2, }) || '0.00',
          lineCost: data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00',
          taxRate: (data.fields.Lines.fields.LineTaxRate * 100).toFixed(2) || 0,
          taxCode: data.fields.Lines.fields.LineTaxCode || "",
          TotalAmt: AmountGbp || '0.00',
          curTotalAmt: currencyAmountGbp || currencySymbol + "0",
          TaxTotal: TaxTotalGbp || '0.00',
          TaxRate: TaxRateGbp || 0,
          DiscountPercent: data.fields.Lines.fields.DiscountPercent || 0,
          SalesLinesCustField1: data.fields.Lines.fields.SalesLinesCustField1 || "",
          weight: data.fields.Lines[i].fields.Weight || 0,
          weightUnit: data.fields.Lines[i].fields.WeightUnit || 'kg',
          volume: data.fields.Lines[i].fields.Volume || 0,
          volumeUnit: data.fields.Lines[i].fields.VolumeUnit || "m3"
        };
        lineItems.push(lineItemObj);
      }
    }
    let lidData = "Edit Invoice" + " " + data.fields.ID || "";
    if (data.fields.IsBackOrder) {
      lidData = "Edit Invoice" + " (BO) " + data.fields.ID || "";
      templateObject.isbackorderredirect.set(true);
    }
    let isPartialPaid = data.fields.TotalPaid > 0;
    let invoicerecord = {
      id: data.fields.ID,
      lid: lidData,
      socustomer: data.fields.CustomerName,
      salesOrderto: data.fields.InvoiceToDesc,
      shipto: data.fields.ShipToDesc,
      department: data.fields.SaleClassName,
      docnumber: data.fields.DocNumber,
      custPONumber: data.fields.CustPONumber,
      saledate: data.fields.SaleDate ? moment(data.fields.SaleDate).format("DD/MM/YYYY") : "",
      duedate: data.fields.DueDate ? moment(data.fields.DueDate).format("DD/MM/YYYY") : "",
      employeename: data.fields.EmployeeName,
      status: data.fields.SalesStatus,
      category: data.fields.SalesCategory,
      comments: data.fields.Comments,
      pickmemo: data.fields.PickMemo,
      ponumber: data.fields.CustPONumber,
      via: data.fields.Shipping,
      connote: data.fields.ConNote,
      reference: data.fields.ReferenceNo,
      currency: data.fields.ForeignExchangeCode || Currency,
      branding: data.fields.MedType,
      invoiceToDesc: data.fields.InvoiceToDesc,
      shipToDesc: data.fields.ShipToDesc,
      termsName: data.fields.TermsName,
      Total: totalInc,
      TotalDiscount: totalDiscount,
      LineItems: lineItems,
      TotalTax: totalTax,
      SubTotal: subTotal,
      balanceDue: totalBalance,
      saleCustField1: data.fields.SaleCustField1,
      saleCustField2: data.fields.SaleCustField2,
      totalPaid: totalPaidAmount,
      ispaid: data.fields.IsPaid,
      isPartialPaid: isPartialPaid,
      CustomerID: data.fields.CustomerID,
      isRepeated: data.fields.RepeatedFrom,
      showingDelivery: data.fields.SaleCustField9 == "true"?true: false
    };

    $("#edtCustomerName").val(data.fields.CustomerName);
    $(".transheader > #sltStatus_fromtransactionheader").val(data.fields.SalesStatus);
    $(".transheader > #sltDept_fromtransactionheader").val(data.fields.SaleClassName);
    $(".transheader > .form-group> #edtRef").val(data.fields.ReferenceNo);
    $(".transheader .sltCurrency").val(invoicerecord.currency);
    $(".transheader > .form-group>#ponumber").val(data.fields.CustPONumber)
    FxGlobalFunctions.handleChangedCurrency(data.fields.ForeignExchangeCode, defaultCurrencyCode);

    $('#exchange_rate').val(data.fields.ForeignExchangeRate);
    $(".transheader > #sltTerms_fromtransactionheader").val(data.fields.TermsName);

    $(".transactionfooter #txaComment").text(data.fields.Comments)
    $(".transactionfooter #txapickmemo").text(data.fields.PickMemo)
    $("#edtCustfield_1").val(data.fields.SaleCustField1)
    $("#edtCustfield_2").val(data.fields.SaleCustField2)
    $("#edtCustfield_3").val(data.fields.SaleCustField3);
    $("#toggleShowFx").prop('checked', data.fields.SaleCustField10 == 'true'? true: false);
    $("#toggleShowDelivery").prop('checked', data.fields.SaleCustField9 == 'true'?true: false);

    templateObject.CleintName.set(data.fields.CustomerName);

    /* START attachment */
    templateObject.attachmentCount.set(0);
    if (data.fields.Attachments) {
      if (data.fields.Attachments.length) {
        templateObject.attachmentCount.set(data.fields.Attachments.length);
        templateObject.uploadedFiles.set(data.fields.Attachments);
      }
    }
    /* END  attachment */
    var checkISCustLoad = false;
    const clientList = templateObject.clientrecords.get()
    if (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].customername == data.fields.CustomerName) {
          checkISCustLoad = true;
          invoicerecord.firstname = clientList[i].firstname || "";
          invoicerecord.lastname = clientList[i].lastname || "";
          templateObject.invoicerecord.set(invoicerecord);
          $("#edtCustomerEmail").val(clientList[i].customeremail);
          $("#edtCustomerEmail").attr("customerid", clientList[i].customerid);
          $("#edtCustomerName").attr("custid", clientList[i].customerid);
          $("#edtCustomerEmail").attr("customerfirstname", clientList[i].firstname);
          $("#edtCustomerEmail").attr("customerlastname", clientList[i].lastname);
          $("#customerType").text(clientList[i].clienttypename || "Default");
          $("#customerDiscount").text(clientList[i].discount + "%" || 0 + "%");
          $("#edtCustomerUseType").val(clientList[i].clienttypename || "Default");
          $("#edtCustomerUseDiscount").val(clientList[i].discount || 0);
          break;
        }
      }
    }

    if (data.fields.IsPaid === true) {
      $("#edtCustomerName").attr("readonly", true);
      $(".btn-primary").attr("disabled", "disabled");
      $("#btnCopyInvoice").attr("disabled", "disabled");
      $("#edtCustomerName").css("background-color", "#eaecf4");
      $("#btnViewPayment").removeAttr("disabled", "disabled");
      $(".btnSave").attr("disabled", "disabled");
      $("#btnBack").removeAttr("disabled", "disabled");
      $(".printConfirm").removeAttr("disabled", "disabled");
      $(".tblInvoiceLine tbody tr").each(function () {
        var $tblrow = $(this);
        $tblrow.find("td").attr("contenteditable", false);
        $tblrow.find("td").removeClass("lineTaxRate");
        $tblrow.find("td").removeClass("lineTaxCode");
        $tblrow.find("td").attr("readonly", true);
        $tblrow.find("td").attr("disabled", "disabled");
        $tblrow.find("td").css("background-color", "#eaecf4");
        $tblrow
          .find("td .table-remove")
          .removeClass("btnRemove");
      });
    }
    templateObject.invoicerecord.set(invoicerecord);

    templateObject.selectedCurrency.set(invoicerecord.currency);
    templateObject.inputSelectedCurrency.set(invoicerecord.currency);
    return {record: invoicerecord, attachmentCount: templateObject.attachmentCount.get(), uploadedFiles: templateObject.uploadedFiles.get(), selectedCurrency: invoicerecord.currency}
  }



  templateObject.showInvoiceBack1 = function(template_title, number, bprint) {
    var array_data = [];
    let lineItems = [];
    let object_invoce = [];
    let item_invoices = "";

    let invoice_data = templateObject.invoicerecord.get();
    let stripe_id = templateObject.accountID.get() || "";
    let stripe_fee_method = templateObject.stripe_fee_method.get();
    var erpGet = erpDb();
    var customfield1 = $("#edtSaleCustField_1").val() || "  ";
    var customfield2 = $("#edtSaleCustField_2").val() || "  ";
    var customfield3 = $("#edtSaleCustField_3").val() || "  ";

    var customfieldlabel1 =
      $(".lblCustomField1").first().text() || "Custom Field 1";
    var customfieldlabel2 =
      $(".lblCustomField2").first().text() || "Custom Field 2";
    var customfieldlabel3 =
      $(".lblCustomField3").first().text() || "Custom Field 3";
    let balancedue = $("#totalBalanceDue").html() || 0;
    let tax = $("#subtotal_tax").html() || 0;
    let customer = $("#edtCustomerName").val();
    let name = $("#firstname").val();
    let surname = $("#lastname").val();
    let dept = $(".transheader > #sltDept_fromtransactionheader").val();
    let fx = $("#sltCurrency").val();
    var comment = $("#txaComment").val();
    var subtotal_tax = $("#subtotal_tax").html() || Currency + 0;
    var total_paid = $("#totalPaidAmt").html() || Currency + 0;
    var ref = $("#edtRef").val() || "-";
    var txabillingAddress = $("#txabillingAddress").val() || "";
    var dtSODate = $("#dtSODate").val();
    var subtotal_total = $("#subtotal_total").text() || Currency + 0;
    var grandTotal = $("#grandTotal").text() || Currency + 0;
    var duedate = $("#dtDueDate").val();
    var po = $("#ponumber").val() || ".";

    $("#tblInvoiceLine > tbody > tr").each(function () {
      var lineID = this.id;
      let tdproduct = $("#" + lineID + " .lineProductName").val();
      let tddescription = $("#" + lineID + " .lineProductDesc").text();
      let tdQty = $("#" + lineID + " .lineQty").val();
      let tdunitprice = $("#" + lineID + " .colUnitPriceExChange").val();
      let tdtaxrate = $("#" + lineID + " .lineTaxRate").text();
      let taxamount = $("#" + lineID + " .colTaxAmount").first().text();
      let tdlineamt = $("#" + lineID + " .colAmountInc").first().text();

      array_data.push([
        tdproduct,
        tddescription,
        tdQty,
        tdunitprice,
        taxamount,
        tdlineamt,
      ]);

      lineItemObj = {
        description: tddescription || "",
        quantity: tdQty || 0,
        unitPrice: tdunitprice.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        }) || 0,
        tax: tdtaxrate || 0,
        amount: tdlineamt || 0,
      };
      lineItems.push(lineItemObj);
    });

    let company = localStorage.getItem("vs1companyName");
    let vs1User = localStorage.getItem("mySession");
    let customerEmail = $("#edtCustomerEmail").val();
    let currencyname = CountryAbbr.toLowerCase();
    stringQuery = "?";
    for (let l = 0; l < lineItems.length; l++) {
      stringQuery =
        stringQuery +
        "product" +
        l +
        "=" +
        lineItems[l].description +
        "&price" +
        l +
        "=" +
        lineItems[l].unitPrice +
        "&qty" +
        l +
        "=" +
        lineItems[l].quantity +
        "&";
    }
    stringQuery =
      stringQuery +
      "tax=" +
      tax +
      "&total=" +
      grandTotal +
      "&customer=" +
      customer +
      "&name=" +
      name +
      "&surname=" +
      surname +
      "&quoteid=" +
      invoice_data.id +
      "&transid=" +
      stripe_id +
      "&feemethod=" +
      stripe_fee_method +
      "&company=" +
      company +
      "&vs1email=" +
      vs1User +
      "&customeremail=" +
      customerEmail +
      "&type=Invoice&url=" +
      window.location.href +
      "&server=" +
      erpGet.ERPIPAddress +
      "&username=" +
      erpGet.ERPUsername +
      "&token=" +
      erpGet.ERPPassword +
      "&session=" +
      erpGet.ERPDatabase +
      "&port=" +
      erpGet.ERPPort +
      "&dept=" +
      dept +
      "&currency=" +
      currencyname;
    if (stripe_id != "") {
      $(".linkText").attr("href", stripeGlobalURL + stringQuery);
    } else {
      $(".linkText").attr("href", "#");
    }

    if (number == 1) {
      item_invoices = {
        o_url: localStorage.getItem("vs1companyURL"),
        o_name: localStorage.getItem("vs1companyName"),
        o_address: localStorage.getItem("vs1companyaddress1"),
        o_city: localStorage.getItem("vs1companyCity"),
        o_state: localStorage.getItem("companyState") + " " + localStorage.getItem("vs1companyPOBox"),
        o_reg: Template.new_invoice.__helpers.get("companyReg").call(),
        o_abn: Template.new_invoice.__helpers.get("companyabn").call(),
        o_phone: Template.new_invoice.__helpers.get("companyphone").call(),
        title: "Invoice Back Order",
        value: invoice_data.id,
        date: dtSODate,
        invoicenumber: invoice_data.id,
        refnumber: ref,
        pqnumber: po,
        duedate: duedate,
        paylink: "Pay Now",
        supplier_type: "Customer",
        supplier_name: customer,
        supplier_addr: txabillingAddress,
        fields: {
          "Product Name": ["25", "left"],
          "Description": ["30", "left"],
          "Qty": ["7", "right"],
          "Unit Price": ["15", "right"],
          "Tax": ["7", "right"],
          "Amount": ["15", "right"],
        },
        subtotal: subtotal_total,
        gst: subtotal_tax,
        total: grandTotal,
        paid_amount: total_paid,
        bal_due: balancedue,
        bsb: Template.new_invoice.__helpers.get("vs1companyBankBSB").call(),
        account: Template.new_invoice.__helpers
          .get("vs1companyBankAccountNo")
          .call(),
        swift: Template.new_invoice.__helpers
          .get("vs1companyBankSwiftCode")
          .call(),
        data: array_data,
        customfield1: "NA",
        customfield2: "NA",
        customfield3: "NA",
        customfieldlabel1: "NA",
        customfieldlabel2: "NA",
        customfieldlabel3: "NA",
        applied: "",
        showFX: "",
        comment: comment,
      };
    } else if (number == 2) {
      item_invoices = {
        o_url: localStorage.getItem("vs1companyURL"),
        o_name: localStorage.getItem("vs1companyName"),
        o_address: localStorage.getItem("vs1companyaddress1"),
        o_city: localStorage.getItem("vs1companyCity"),
        o_state: localStorage.getItem("companyState") + " " + localStorage.getItem("vs1companyPOBox"),
        o_reg: Template.new_invoice.__helpers.get("companyReg").call(),
        o_abn: Template.new_invoice.__helpers.get("companyabn").call(),
        o_phone: Template.new_invoice.__helpers.get("companyphone").call(),
        title: "Invoice Back Order",
        value: invoice_data.id,
        date: dtSODate,
        invoicenumber: invoice_data.id,
        refnumber: ref,
        pqnumber: po,
        duedate: duedate,
        paylink: "Pay Now",
        supplier_type: "Customer",
        supplier_name: customer,
        supplier_addr: txabillingAddress,
        fields: {
          "Product Name": ["25", "left"],
          "Description": ["30", "left"],
          "Qty": ["7", "right"],
          "Unit Price": ["15", "right"],
          "Tax": ["7", "right"],
          "Amount": ["15", "right"],
        },
        subtotal: subtotal_total,
        gst: subtotal_tax,
        total: grandTotal,
        paid_amount: total_paid,
        bal_due: balancedue,
        bsb: Template.new_invoice.__helpers.get("vs1companyBankBSB").call(),
        account: Template.new_invoice.__helpers
          .get("vs1companyBankAccountNo")
          .call(),
        swift: Template.new_invoice.__helpers
          .get("vs1companyBankSwiftCode")
          .call(),
        data: array_data,
        customfield1: customfield1,
        customfield2: customfield2,
        customfield3: customfield3,
        customfieldlabel1: customfieldlabel1,
        customfieldlabel2: customfieldlabel2,
        customfieldlabel3: customfieldlabel3,
        applied: "",
        showFX: "",
        comment: comment,
      };
    } else {
      item_invoices = {
        o_url: localStorage.getItem("vs1companyURL"),
        o_name: localStorage.getItem("vs1companyName"),
        o_address: localStorage.getItem("vs1companyaddress1"),
        o_city: localStorage.getItem("vs1companyCity"),
        o_state: localStorage.getItem("companyState") + " " + localStorage.getItem("vs1companyPOBox"),
        o_reg: Template.new_invoice.__helpers.get("companyReg").call(),
        o_abn: Template.new_invoice.__helpers.get("companyabn").call(),
        o_phone: Template.new_invoice.__helpers.get("companyphone").call(),
        title: "Invoice Back Order",
        value: invoice_data.id,
        date: dtSODate,
        invoicenumber: invoice_data.id,
        refnumber: ref,
        pqnumber: po,
        duedate: duedate,
        paylink: "Pay Now",
        supplier_type: "Customer",
        supplier_name: customer,
        supplier_addr: txabillingAddress,
        fields: {
          "Product Name": ["25", "left"],
          "Description": ["30", "left"],
          "Qty": ["7", "right"],
          "Unit Price": ["15", "right"],
          "Tax": ["7", "right"],
          "Amount": ["15", "right"],
        },
        subtotal: subtotal_total,
        gst: subtotal_tax,
        total: grandTotal,
        paid_amount: total_paid,
        bal_due: balancedue,
        bsb: Template.new_invoice.__helpers.get("vs1companyBankBSB").call(),
        account: Template.new_invoice.__helpers
          .get("vs1companyBankAccountNo")
          .call(),
        swift: Template.new_invoice.__helpers
          .get("vs1companyBankSwiftCode")
          .call(),
        data: array_data,
        customfield1: customfield1,
        customfield2: customfield2,
        customfield3: customfield3,
        customfieldlabel1: customfieldlabel1,
        customfieldlabel2: customfieldlabel2,
        customfieldlabel3: customfieldlabel3,
        applied: "",
        showFX: fx,
        comment: comment,
      };
    }

    if (stripe_id == "") {
      item_invoices.paylink = "";
    }
    object_invoce.push(item_invoices);

    $("#templatePreviewModal .field_payment").show();
    $("#templatePreviewModal .field_amount").show();

    if (bprint == false) {
      $("#html-2-pdfwrapper").css("width", "90%");
      $("#html-2-pdfwrapper2").css("width", "90%");
      $("#html-2-pdfwrapper3").css("width", "90%");
    } else {
      $("#html-2-pdfwrapper").css("width", "210mm");
      $("#html-2-pdfwrapper2").css("width", "210mm");
      $("#html-2-pdfwrapper3").css("width", "210mm");
    }

    if (number == 1) {
      updateTemplate1(object_invoce, bprint);
    } else if (number == 2) {
      updateTemplate2(object_invoce, bprint);
    } else {
      updateTemplate3(object_invoce, bprint);
    }

    saveTemplateFields("fields" + template_title, object_invoce[0]["fields"]);
    return;
  }



  // templateObject.getAllTaxCodes = function () {
  //   const splashArrayTaxRateList = [];
  //   const taxCodesList = [];
  //   getVS1Data("TTaxcodeVS1")
  //     .then(function (dataObject) {
  //       if (dataObject.length == 0) {
  //         salesService.getTaxCodesDetailVS1().then(function (data) {
  //           const taxCodes = data.ttaxcodevs1;
  //           templateObject.taxcodes.set(taxCodes);
  //           for (let i = 0; i < data.ttaxcodevs1.length; i++) {
  //             let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
  //             let dataList = [
  //               data.ttaxcodevs1[i].Id || "",
  //               data.ttaxcodevs1[i].CodeName || "",
  //               data.ttaxcodevs1[i].Description || "-",
  //               taxRate || 0,
  //             ];

  //             let taxcoderecordObj = {
  //               codename: data.ttaxcodevs1[i].CodeName || " ",
  //               coderate: taxRate || " ",
  //             };
  //             taxCodesList.push(taxcoderecordObj);
  //             splashArrayTaxRateList.push(dataList);
  //           }
  //           templateObject.taxraterecords.set(taxCodesList);
  //         });
  //       } else {
  //         let data = JSON.parse(dataObject[0].data);
  //         let useData = data.ttaxcodevs1;
  //         const taxCodes = data.ttaxcodevs1;
  //         templateObject.taxcodes.set(taxCodes);
  //         for (let i = 0; i < useData.length; i++) {
  //           let taxRate = (useData[i].Rate * 100).toFixed(2);
  //           var dataList = [
  //             useData[i].Id || "",
  //             useData[i].CodeName || "",
  //             useData[i].Description || "-",
  //             taxRate || 0,
  //           ];

  //           let taxcoderecordObj = {
  //             codename: useData[i].CodeName || " ",
  //             coderate: taxRate || " ",
  //           };
  //           taxCodesList.push(taxcoderecordObj);
  //           splashArrayTaxRateList.push(dataList);
  //         }
  //         templateObject.taxraterecords.set(taxCodesList);
  //       }
  //     })
  //     .catch(function () {
  //       salesService.getTaxCodesDetailVS1().then(function (data) {
  //         taxCodes = data.ttaxcodevs1;
  //         templateObject.taxcodes.set(taxCodes);
  //         for (let i = 0; i < data.ttaxcodevs1.length; i++) {
  //           let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
  //           var dataList = [
  //             data.ttaxcodevs1[i].Id || "",
  //             data.ttaxcodevs1[i].CodeName || "",
  //             data.ttaxcodevs1[i].Description || "-",
  //             taxRate || 0,
  //           ];
  //           splashArrayTaxRateList.push(dataList);
  //         }
  //         templateObject.taxraterecords.set(taxCodesList);
  //       });
  //     });
  // };

  // templateObject.getSubTaxCodes = function () {
  //   let subTaxTableList = [];
  //   getVS1Data("TSubTaxVS1")
  //     .then(function (dataObject) {
  //       if (dataObject.length == 0) {
  //         taxRateService.getSubTaxCode().then(function (data) {
  //           for (let i = 0; i < data.tsubtaxcode.length; i++) {
  //             var dataList = {
  //               id: data.tsubtaxcode[i].Id || "",
  //               codename: data.tsubtaxcode[i].Code || "-",
  //               description: data.tsubtaxcode[i].Description || "-",
  //               category: data.tsubtaxcode[i].Category || "-",
  //             };
  //             subTaxTableList.push(dataList);
  //           }
  //           templateObject.subtaxcodes.set(subTaxTableList);
  //         });
  //       } else {
  //         let data = JSON.parse(dataObject[0].data);
  //         let useData = data.tsubtaxcode;
  //         for (let i = 0; i < useData.length; i++) {
  //           var dataList = {
  //             id: useData[i].Id || "",
  //             codename: useData[i].Code || "-",
  //             description: useData[i].Description || "-",
  //             category: useData[i].Category || "-",
  //           };
  //           subTaxTableList.push(dataList);
  //         }
  //         templateObject.subtaxcodes.set(subTaxTableList);
  //       }
  //     })
  //     .catch(function (err) {
  //       taxRateService.getSubTaxCode().then(function (data) {
  //         for (let i = 0; i < data.tsubtaxcode.length; i++) {
  //           var dataList = {
  //             id: data.tsubtaxcode[i].Id || "",
  //             codename: data.tsubtaxcode[i].Code || "-",
  //             description: data.tsubtaxcode[i].Description || "-",
  //             category: data.tsubtaxcode[i].Category || "-",
  //           };
  //           subTaxTableList.push(dataList);
  //         }
  //         templateObject.subtaxcodes.set(subTaxTableList);
  //       });
  //     });
  // };

  // in this function, we'll handle the new line to add
  templateObject.addInvoiceLine = async (event) => {
    // get all lines first
    let lines = await this.invoiceLines.get();
    // then open the product modal
  }

  // templateObject.generatePdfForMail = async (invoiceId, printID, stringQuery, pdfType) => {
  //   let stripe_id = templateObject.accountID.get() || "";
  //   let file = "Invoice-" + invoiceId + ".pdf";
  //   return new Promise((resolve, reject) => {
  //     if (stripe_id != "") {
  //       $(".linkText").attr("href", stripeGlobalURL + stringQuery);
  //     } else {
  //       $(".linkText").attr("href", "#");
  //     }
  //     var source = document.getElementById(printID);
  //     var opt = {
  //       margin: 0,
  //       filename: file,
  //       image: {
  //         type: "jpeg",
  //         quality: 0.98,
  //       },
  //       html2canvas: {
  //         scale: 2,
  //       },
  //       jsPDF: {
  //         unit: "in",
  //         format: "a4",
  //         orientation: "portrait",
  //       },
  //     };
  //     resolve(
  //       html2pdf().set(opt).from(source).toPdf().output(pdfType)
  //     );
  //   });
  // }


  templateObject.getEmailBody = (objDetails)=> {
    let invoiceId = objDetails.fields.ID;
    // let erpInvoiceId = objDetails.fields.ID;
    // let mailFromName = localStorage.getItem("vs1companyName");
    // let mailFrom = localStorage.getItem("VS1OrgEmail") || localStorage.getItem("VS1AdminUserName");
    // let customerEmailName = $("#edtCustomerName").val();
    // let checkEmailData = $("#edtCustomerEmail").val();
    // let grandtotal = $("#grandTotal").html();
    // let emailDueDate = $("#dtDueDate").val();
    // let customerBillingAddress = $("#txabillingAddress").val();
    // let customerTerms = $(".transheader > #sltTerms_fromtransactionheader").val();

    // let customerSubtotal = $("#subtotal_total").html();
    // let customerTax = $("#subtotal_tax").html();
    // let customerNett = $("#subtotal_nett").html();
    // let customerTotal = $("#grandTotal").html();

    const stringQuery = "";
    return generateHtmlMailBody(invoiceId, stringQuery)
  }


  // addAttachment = async (objDetails, printID, stringQuery, frequency, pdfType='datauristring') => {
  //   let attachment = [];
  //   let invoiceId = objDetails.fields.ID;
  //   let encodedPdf = await templateObject.generatePdfForMail(invoiceId, printID, stringQuery, pdfType);
  //   let base64data = encodedPdf.split(",")[1];
  //   let pdfObject = {
  //     filename: "invoice-" + invoiceId + ".pdf",
  //     content: base64data,
  //     encoding: "base64",
  //   };
  //   attachment.push(pdfObject);
  //   let erpInvoiceId = objDetails.fields.ID;

  //   let mailFromName = localStorage.getItem("vs1companyName");
  //   let mailFrom = localStorage.getItem("VS1OrgEmail") || localStorage.getItem("VS1AdminUserName");
  //   let customerEmailName = $("#edtCustomerName").val();
  //   let checkEmailData = $("#edtCustomerEmail").val();
  //   let grandtotal = $("#grandTotal").html();
  //   let emailDueDate = $("#dtDueDate").val();
  //   let customerBillingAddress = $("#txabillingAddress").val();
  //   let customerTerms = $(".transheader > #sltTerms_fromtransactionheader").val();

  //   let customerSubtotal = $("#subtotal_total").html();
  //   let customerTax = $("#subtotal_tax").html();
  //   let customerNett = $("#subtotal_nett").html();
  //   let customerTotal = $("#grandTotal").html();

  //   let mailSubject = "Invoice " + erpInvoiceId + " from " + mailFromName + " for " + customerEmailName;
  //   var htmlmailBody = generateHtmlMailBody(erpInvoiceId, emailDueDate, grandtotal, stripeGlobalURL, stringQuery, customerEmailName, mailFromName, customerBillingAddress, customerTerms, customerSubtotal, customerTax, customerNett, customerTotal)


  //   if (
  //     $(".chkEmailCopy").is(":checked") &&
  //     $(".chkEmailRep").is(":checked")
  //   ) {
  //     Meteor.call(
  //       "sendEmail", {
  //       from: "" + mailFromName + " <" + mailFrom + ">",
  //       to: checkEmailData,
  //       subject: mailSubject,
  //       text: "",
  //       html: htmlmailBody,
  //       attachments: attachment,
  //     },
  //       async function (error, result) {
  //         if (error && error.error === "error") {
  //           FlowRouter.go("/invoicelist?success=true");
  //           if(frequency) {
  //             templateObject.checkEmailFrequencySetting()
  //           }
  //         } else {
  //           $("#html-Invoice-pdfwrapper").css("display", "none");
  //           swal({
  //             title: "SUCCESS",
  //             text: "Email Sent To Customer: " + checkEmailData + " ",
  //             type: "success",
  //             showCancelButton: false,
  //             confirmButtonText: "OK",
  //           }).then((result) => {
  //           });
  //         }
  //       }
  //     );

  //     Meteor.call(
  //       "sendEmail", {
  //       from: "" + mailFromName + " <" + mailFrom + ">",
  //       to: mailFrom,
  //       subject: mailSubject,
  //       text: "",
  //       html: htmlmailBody,
  //       attachments: attachment,
  //     },
  //     async function  (error, result) {
  //         if (error && error.error === "error") {
  //           if(frequency) {
  //             await templateObject.checkEmailFrequencySetting()
  //           } 
  //             FlowRouter.go("/invoicelist?success=true");
  //         } else {
  //           $("#html-Invoice-pdfwrapper").css("display", "none");
  //           swal({
  //             title: "SUCCESS",
  //             text: "Email Sent To Customer: " +
  //               checkEmailData +
  //               " and User: " +
  //               mailFrom +
  //               "",
  //             type: "success",
  //             showCancelButton: false,
  //             confirmButtonText: "OK",
  //           }).then(async (result) => {
              
  //             if (result.value) {
  //               if(frequency) {
  //                 await templateObject.checkEmailFrequencySetting();
  //               }
  //               if (FlowRouter.current().queryParams.trans) {
  //                 FlowRouter.go(
  //                   "/customerscard?id=" +
  //                   FlowRouter.current().queryParams.trans +
  //                   "&transTab=active"
  //                 );
  //               } else {
                  
  //                 FlowRouter.go("/invoicelist?success=true");
  //               }
  //             } else if (result.dismiss === "cancel") { }
  //           });
  //         }
  //       }
  //     );
  //   } else if ($(".chkEmailCopy").is(":checked")) {
  //     Meteor.call(
  //       "sendEmail", {
  //       from: "" + mailFromName + " <" + mailFrom + ">",
  //       to: checkEmailData,
  //       subject: mailSubject,
  //       text: "",
  //       html: htmlmailBody,
  //       attachments: attachment,
  //     },
  //       async function (error, result) {
  //         if (error && error.error === "error") {
  //           if(frequency) {
  //             await templateObject.checkEmailFrequencySetting()
  //           }
  //           FlowRouter.go("/invoicelist?success=true");
  //         } else {
  //           $("#html-Invoice-pdfwrapper").css("display", "none");
  //           swal({
  //             title: "SUCCESS",
  //             text: "Email Sent To Customer: " + checkEmailData + " ",
  //             type: "success",
  //             showCancelButton: false,
  //             confirmButtonText: "OK",
  //           }).then(async (result) => {
  //             if (FlowRouter.current().queryParams.trans) {
  //               FlowRouter.go(
  //                 "/customerscard?id=" +
  //                 FlowRouter.current().queryParams.trans +
  //                 "&transTab=active"
  //               );
  //             } else {
  //               if(frequency) {
  //                 await templateObject.checkEmailFrequencySetting()
  //               } 
  //                 FlowRouter.go("/invoicelist?success=true");
  //             }
  //           });
  //         }
  //       }
  //     );
  //   } else if ($(".chkEmailRep").is(":checked")) {
  //     Meteor.call(
  //       "sendEmail", {
  //       from: "" + mailFromName + " <" + mailFrom + ">",
  //       to: mailFrom,
  //       subject: mailSubject,
  //       text: "",
  //       html: htmlmailBody,
  //       attachments: attachment,
  //     },
  //       async function (error, result) {
  //         if (error && error.error === "error") {
  //           // FlowRouter.go("/invoicelist?success=true");
  //           $('.fullScreenSpin').css('display', 'none');
  //           if(frequency) {
  //             await templateObject.checkEmailFrequencySetting()
  //           }
  //         } else {
  //           $("#html-Invoice-pdfwrapper").css("display", "none");
  //           swal({
  //             title: "SUCCESS",
  //             text: "Email Sent To User: " + mailFrom + " ",
  //             type: "success",
  //             showCancelButton: false,
  //             confirmButtonText: "OK",
  //           }).then(async (result)=> {
  //             if(result.value) {
  //               if(frequency){
  //                 await templateObject.checkEmailFrequencySetting()
  //               }
  //               $('.fullScreenSpin').css('display', 'none'); 
  //             }
  //           })
  //         }
  //       }
  //     );
  //   } else {
  //     if(frequency) {
  //       await templateObject.checkEmailFrequencySetting();
  //     }
  //     if (FlowRouter.current().queryParams.trans) {
  //       FlowRouter.go(
  //         "/customerscard?id=" +
  //         FlowRouter.current().queryParams.trans +
  //         "&transTab=active"
  //       );
  //     } else {
  //       FlowRouter.go("/invoicelist?success=true");
  //     }
  //   }
  //   //   // window.open(url, "_self");
  // }

  templateObject.sendEmail = async (isforced = false) => {
    return new Promise((resolve, reject)=> {
      var splashLineArray = new Array();
      let lineItemsForm = [];
      let lineItems = [];
      let lineItemObjForm = {};
      var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
      let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) +"-" + saledateTime.getDate();
      let checkBackOrder = templateObject.includeBOnShippedQty.get();
      $("#tblInvoiceLine > tbody > tr").each(function () {
        var lineID = this.id;
        const tdproduct = $(this).find(".lineProductName").val();
        const tddescription = $(this).find('.lineProductDesc').text();
        const tdQty = $(this).find('.lineQty').val();
        const tdOrderd = $(this).find(".lineOrdered").val();
        const tdunitprice = $(this).find('.colUnitPriceExChange').val();
        const tdtaxCode = $(this).find(".lineTaxCode").val();
        const tdtaxrate = $(this).find(".lineTaxRate").val();
        const tdlineUnit = $(this).find(".lineUOM").text() || defaultUOM;
        const taxamount = $(this).find('.colTaxAmount').val();
        const tdlineamt = $(this).find(".colAmountInc").text();
        const tdSalesLineCustField1 = $(this).find(".lineSalesLinesCustField1").text();
  
        const lineItemObj = {
          description: tddescription || "",
          quantity: tdQty || 0,
          unitPrice: tdunitprice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          }) || 0,
        };

        lineItems.push(lineItemObj);

        if (tdproduct != "") {
          if (checkBackOrder == true) {
            lineItemObjForm = {
              type: "TInvoiceLine",
              fields: {
                ProductName: tdproduct || "",
                ProductDescription: tddescription || "",
                UOMQtySold: parseFloat(tdOrderd) || 0,
                UOMQtyShipped: parseFloat(tdQty) || 0,
                LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                Headershipdate: saleDate,
                LineTaxCode: tdtaxCode || "",
                DiscountPercent: parseFloat($(this).find(".lineDiscount").val()) || 0,
                UnitOfMeasure: tdlineUnit,
                SalesLinesCustField1: tdSalesLineCustField1,
              },
            };
          } else {
            lineItemObjForm = {
              type: "TInvoiceLine",
              fields: {
                ProductName: tdproduct || "",
                ProductDescription: tddescription || "",
                UOMQtySold: parseFloat(tdQty) || 0,
                UOMQtyShipped: parseFloat(tdQty) || 0,
                LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                Headershipdate: saleDate,
                LineTaxCode: tdtaxCode || "",
                DiscountPercent: parseFloat($(this).find(".lineDiscount").val()) || 0,
                UnitOfMeasure: tdlineUnit,
                SalesLinesCustField1: tdSalesLineCustField1,
              },
            };
          }

          lineItemsForm.push(lineItemObjForm);
          splashLineArray.push(lineItemObjForm);
        }
      });
      if ($("#formCheck-one").is(":checked")) {
        getchkcustomField1 = false;
      }
      if ($("#formCheck-two").is(":checked")) {
        getchkcustomField2 = false;
      }

      let customer = $("#edtCustomerName").val();

      let poNumber = $("#ponumber").val();
      let reference = $("#edtRef").val();
  
      let departement = $(".transheader > #sltDept_fromtransactionheader").val();
      let shippingAddress = $("#txaShipingInfo").val();
      let comments = $("#txaComment").val();
      let pickingInfrmation = $("#txapickmemo").val();
      let saleCustField1 = $("#edtSaleCustField_1").val() || "";
      let saleCustField2 = $("#edtSaleCustField_2").val() || "";
      let saleCustField3 = $("#edtSaleCustField_3").val() || "";
      const billingAddress  = $("#txabillingAddress").val();
      var url = FlowRouter.current().path;
      var getso_id = url.split("?id=");
      var currentInvoice = getso_id[getso_id.length - 1];
      let uploadedItems = templateObject.uploadedFiles.get();
      var currencyCode = $(".transheader>.sltCurrency").val() || CountryAbbr;
      let ForeignExchangeRate = $('#exchange_rate').val() || 0;
      var objDetails = "";
      let termname = $('.transheader > #sltTerms_fromtransactionheader').val() || '';
      if (termname === '') {
        swal('Terms has not been selected!', '', 'warning');
        event.preventDefault();
        return false;
      }
      if (getso_id[1]) {
        currentInvoice = parseInt(currentInvoice);
        objDetails = {
          type: "TInvoiceEx",
          fields: {
            ID: currentInvoice,
            CustomerName: customer,
            ForeignExchangeCode: currencyCode,
            ForeignExchangeRate: parseFloat(ForeignExchangeRate),
            Lines: splashLineArray,
            InvoiceToDesc: billingAddress,
            SaleDate: saleDate,
            CustPONumber: poNumber,
            ReferenceNo: reference,
            TermsName: termname,
            SaleClassName: departement,
            ShipToDesc: shippingAddress,
            Comments: comments,
            SaleCustField1: saleCustField1,
            SaleCustField2: saleCustField2,
            SaleCustField3: saleCustField3,
            PickMemo: pickingInfrmation,
            Attachments: uploadedItems,
            SalesStatus: $(".transheader > #sltStatus_fromtransactionheader").val(),
          },
        };
      } else {
        objDetails = {
          type: "TInvoiceEx",
          fields: {
            CustomerName: customer,
            ForeignExchangeCode: currencyCode,
            ForeignExchangeRate: parseFloat(ForeignExchangeRate),
            Lines: splashLineArray,
            InvoiceToDesc: billingAddress,
            SaleDate: saleDate,
            CustPONumber: poNumber,
            ReferenceNo: reference,
            TermsName: termname,
            SaleClassName: departement,
            ShipToDesc: shippingAddress,
            Comments: comments,
            SaleCustField1: saleCustField1,
            SaleCustField2: saleCustField2,
            SaleCustField3: saleCustField3,
            PickMemo: pickingInfrmation,
            Attachments: uploadedItems,
            SalesStatus: $(".transheader > #sltStatus_fromtransactionheader").val(),
          },
        };
      }
      resolve(objDetails)
    })

  }

  // templateObject.exportSalesToPdf = function (template_title, number) {
  //   if (template_title == "Invoices") {
  //     templateObject.showInvoice1(template_title, number, true);
  //   } else if (template_title == "Delivery Docket") {
  //     templateObject.showDeliveryDocket1(template_title, number, true);
  //   } else if (template_title == "Invoice Back Orders") {
  //     templateObject.showInvoiceBack1(template_title, number, true);
  //   } else { }

  //   if (template_title == 'Delivery Docket') {
  //     $("#templatePreviewModal .horizontal_blue_line").hide();
  //     $("#templatePreviewModal .ACCOUNT_NAME").hide();
  //     $("#templatePreviewModal .BANK_NAME").hide();
  //     $("#templatePreviewModal .BSB").hide();
  //     $("#templatePreviewModal .ACC").hide();
  //     $("#templatePreviewModal .SUB_TOTAL").hide();
  //     $("#templatePreviewModal .sub_total_underline").hide();
  //     $("#templatePreviewModal .TOTAL_TAX").hide();
  //     $("#templatePreviewModal .GST").hide();
  //     $("#templatePreviewModal .less_amount_underline").hide();
  //     $("#templatePreviewModal .BALANCE").hide();

  //     $("#templatePreviewModal .horizontal_black_line").hide();
  //     $("#templatePreviewModal .ACCOUNT_NAME2").hide();
  //     $("#templatePreviewModal .BANK_NAME2").hide();
  //     $("#templatePreviewModal .BSB2").hide();
  //     $("#templatePreviewModal .ACC2").hide();
  //     $("#templatePreviewModal .SUB_TOTAL2").hide();
  //     $("#templatePreviewModal .sub_total_underline").hide();
  //     $("#templatePreviewModal .TOTAL_AUD2").hide();
  //     $("#templatePreviewModal .PAID_AMOUNT2").hide();
  //     $("#templatePreviewModal .less_amount_underline").hide();
  //     $("#templatePreviewModal .AMOUNT_DUE_AUD2").hide();

  //     $("#templatePreviewModal .PAYMENT_DETAILS3").hide();
  //     $("#templatePreviewModal .ACCOUNT_NAME3").hide();
  //     $("#templatePreviewModal .BANK_NAME3").hide();
  //     $("#templatePreviewModal .SORT_CODE3").hide();
  //     $("#templatePreviewModal .ACC3").hide();
  //     $("#templatePreviewModal .ACCOUNT_DETAIL3").hide();
  //     $("#templatePreviewModal .PAYMENT_TERMS3").hide();
  //     $("#templatePreviewModal .SUB_TOTAL3").hide();

  //     $('.PAY_LINK, .PAY_LINK2, .PAY_LINK3').hide();

  //     $('.amountdue_label, .amountdue3_label').text('Ship Date');
  //     $('.o_date_wrap').show();
  //     var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
  //     let saleDate =
  //         saledateTime.getFullYear() +
  //         "-" +
  //         (saledateTime.getMonth() + 1) +
  //         "-" +
  //         saledateTime.getDate();
  //     $('.amountdue, .amountdue3').text(saleDate);
  //   } else {
  //     $('.o_date_wrap').hide();
  //   }

  //   let invoice_data_info = templateObject.invoicerecord.get();
  //   var source;
  //   if (number == 1) {
  //     $("#html-2-pdfwrapper").show();
  //     $("#html-2-pdfwrapper2").hide();
  //     $("#html-2-pdfwrapper3").hide();
  //     source = document.getElementById("html-2-pdfwrapper");
  //   } else if (number == 2) {
  //     $("#html-2-pdfwrapper").hide();
  //     $("#html-2-pdfwrapper2").show();
  //     $("#html-2-pdfwrapper3").hide();
  //     source = document.getElementById("html-2-pdfwrapper2");
  //   } else {
  //     $("#html-2-pdfwrapper").hide();
  //     $("#html-2-pdfwrapper2").hide();
  //     $("#html-2-pdfwrapper3").show();
  //     source = document.getElementById("html-2-pdfwrapper3");
  //   }
  //   let file = "Invoice.pdf";
  //   if (
  //     $(".printID").attr("id") != undefined ||
  //     $(".printID").attr("id") != ""
  //   ) {
  //     if (template_title == "Invoices") {
  //       file = "Invoice-" + invoice_data_info.id + ".pdf";
  //     } else if (template_title == "Invoice Back Orders") {
  //       file = "Invoice Back Orders-" + invoice_data_info.id + ".pdf";
  //     } else if (template_title == "Delivery Docket") {
  //       file = "Delivery Docket-" + invoice_data_info.id + ".pdf";
  //     }
  //   }

  //   var opt = {
  //     margin: 0,
  //     filename: file,
  //     image: {
  //       type: "jpeg",
  //       quality: 0.98,
  //     },
  //     html2canvas: {
  //       scale: 2,
  //     },
  //     jsPDF: {
  //       unit: "in",
  //       format: "a4",
  //       orientation: "portrait",
  //     },
  //   };

  //   html2pdf()
  //     .set(opt)
  //     .from(source)
  //     .save()
  //     .then(function () {
  //       $("#html-2-pdfwrapper_new").css("display", "none");
  //       $("#html-2-pdfwrapper").css("display", "none");
  //       $("#html-2-pdfwrapper2").css("display", "none");
  //       $("#html-2-pdfwrapper3").css("display", "none");
  //       $("#printModal").modal('hide');
  //       LoadingOverlay.hide();
  //     });
  //   return true;
  // };

});

Template.invoice_temp.onRendered(function () {

  $(".fullScreenSpin").css("display", "inline-block");
  const templateObject = Template.instance();

  let currentInvoice;
  let getso_id;

  // templateObject.initPage();

  // templateObject.getAllTaxCodes();
  // templateObject.getSubTaxCodes();

  // templateObject.getAllClients();
  // templateObject.getOrganisationDetails();
  // templateObject.getAllLeadStatuss();
  // templateObject.getDepartments();
  // templateObject.getTerms();

  if (
    FlowRouter.current().queryParams.id ||
    FlowRouter.current().queryParams.customerid
  ) {
    templateObject.getAllSelectPaymentData();
  } else {
    $(".transheader > #sltTerms_fromtransactionheader").val(templateObject.defaultsaleterm.get() || "");
  }

  $('#edtFrequencyDetail').css('display', 'none');
  $("#date-input,#edtWeeklyStartDate,#edtWeeklyFinishDate,#dtDueDate,#customdateone,#edtMonthlyStartDate,#edtMonthlyFinishDate,#edtDailyStartDate,#edtDailyFinishDate,#edtOneTimeOnlyDate").datepicker({
    showOn: 'button',
    buttonText: 'Show Date',
    buttonImageOnly: true,
    buttonImage: '/img/imgCal2.png',
    constrainInput: false,
    dateFormat: 'd/mm/yy',
    showOtherMonths: true,
    selectOtherMonths: true,
    changeMonth: true,
    changeYear: true,
    yearRange: "-90:+10",
  });

  $("#serialNumberModal .btnSelect").removeClass("d-none");
  $("#serialNumberModal .btnAutoFill").addClass("d-none");
  $("#choosetemplate").attr("checked", true);
  var invoice_type = FlowRouter.current().queryParams.type;

  if (invoice_type == "bo") {
    localStorage.setItem("invoice_type", "bo");
  } else {
    localStorage.setItem("invoice_type", "invoice");
  }

  if (localStorage.getItem("invoice_type") == "bo") {
    $(".Invoices").css("display", "none");
    $(".Docket").css("display", "none");
    $(".add_dy .coltr").removeClass("col-md-6");
  } else {
    $(".Invoices").css("display", "block");
    $(".Docket").css("display", "block");
    $(".Invoice").css("display", "none");
    $(".add_dy .coltr").addClass("col-md-6");
  }

  $(window).on("load", function () {
    const win = $(this); //this = window
    if (win.width() <= 1024 && win.width() >= 450) {
      $("#colBalanceDue").addClass("order-12");
    }
    if (win.width() <= 926) {
      $("#totalSection").addClass("offset-md-6");
    }
  });

  let imageData = localStorage.getItem("Image");

  if (imageData) {
    $(".uploadedImage").attr("src", imageData);
  }

  let isBOnShippedQty = localStorage.getItem("CloudSalesQtyOnly")||false;
  if(JSON.parse(isBOnShippedQty)) {
    templateObject.includeBOnShippedQty.set(false);
  }

  $("#date-input,#dtSODate,#dtDueDate,#customdateone").datepicker({
    showOn: "button",
    buttonText: "Show Date",
    buttonImageOnly: true,
    buttonImage: "/img/imgCal2.png",
    constrainInput: false,
    dateFormat: "d/mm/yy",
    showOtherMonths: true,
    selectOtherMonths: true,
    changeMonth: true,
    changeYear: true,
    yearRange: "-90:+10",
  });

  /**
   * This if else clause is sucks, should updated.
   */
  let url = FlowRouter.current().path;


  if (
    $(".printID").attr("id") == undefined ||
    $(".printID").attr("id") != undefined ||
    $(".printID").attr("id") != ""
  ) {
    var duedate = new Date();
    let dueDate =
      ("0" + duedate.getDate()).slice(-2) +
      "/" +
      ("0" + (duedate.getMonth() + 1)).slice(-2) +
      "/" +
      duedate.getFullYear();
    $(".due").text(dueDate);
  }

  /* On Click TaxCode List */
  // $(document).on("click", "#tblTaxRate tbody tr", function (e) {
  //   let selectLineID = $("#selectLineID").val();
  //   let taxcodeList = templateObject.taxraterecords.get();
  //   var table = $(this);
  //   let utilityService = new UtilityService();
  //   let $tblrows = $("#tblInvoiceLine tbody tr");
  //   var $printrows = $(".invoice_print tbody tr");

  //   if (selectLineID) {
  //     let lineTaxCode = table.find(".taxName").text();
  //     let lineTaxRate = table.find(".taxRate").text();
  //     let subGrandTotal = 0;
  //     let taxGrandTotal = 0;
  //     let subDiscountTotal = 0; // New Discount
  //     let taxGrandTotalPrint = 0;

  //     $("#" + selectLineID + " .lineTaxRate").text(lineTaxRate || 0);
  //     $("#" + selectLineID + " .lineTaxCode").val(lineTaxCode);
  //     if (
  //       $(".printID").attr("id") != undefined ||
  //       $(".printID").attr("id") != ""
  //     ) {
  //       $("#" + selectLineID + " #lineTaxCode").text(lineTaxCode);
  //     }

  //     $("#taxRateListModal").modal("toggle");
  //     let subGrandTotalNet = 0;
  //     let taxGrandTotalNet = 0;
  //     $tblrows.each(function (index) {
  //       var $tblrow = $(this);
  //       let tdproduct = $tblrow.find(".lineProductName").val() || "";
  //       if (tdproduct != "") {
  //         var qty = $tblrow.find(".lineQty").val() || 0;
  //         var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
  //         var taxRate = $tblrow.find(".lineTaxCode").val();

  //         var taxrateamount = 0;
  //         if (taxcodeList) {
  //           for (var i = 0; i < taxcodeList.length; i++) {
  //             if (taxcodeList[i].codename == taxRate) {
  //               taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
  //             }
  //           }
  //         }

  //         var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
  //         var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
  //         var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").val()) || 0; // New Discount
  //         let lineTotalAmount = subTotal + taxTotal;

  //         let lineDiscountTotal = lineDiscountPerc / 100;

  //         var discountTotal = lineTotalAmount * lineDiscountTotal;
  //         var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
  //         var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
  //         var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
  //         var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
  //         if (!isNaN(discountTotal)) {
  //           subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;
  //           document.getElementById("subtotal_discount").innerHTML =
  //             utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
  //         }
  //         $tblrow
  //           .find(".lineTaxAmount")
  //           .text(
  //             utilityService.modifynegativeCurrencyFormat(
  //               taxTotalWithDiscountTotalLine
  //             )
  //           );

  //         let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
  //         let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, "")) || 0;
  //         let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc || 0;
  //         $tblrow
  //           .find(".colUnitPriceExChange")
  //           .val(
  //             utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal)
  //           );
  //         $tblrow
  //           .find(".colUnitPriceIncChange")
  //           .val(
  //             utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal)
  //           );

  //         if (!isNaN(subTotal)) {
  //           $tblrow
  //             .find(".colAmountEx")
  //             .text(utilityService.modifynegativeCurrencyFormat(subTotal));
  //           $tblrow
  //             .find(".colAmountInc")
  //             .text(
  //               utilityService.modifynegativeCurrencyFormat(lineTotalAmount)
  //             );
  //           subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
  //           subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
  //           document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
  //         }

  //         if (!isNaN(taxTotal)) {
  //           taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
  //           taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
  //           document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
  //         }

  //         if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
  //           let GrandTotal = parseFloat(subGrandTotal) + parseFloat(taxGrandTotal);
  //           let GrandTotalNet = parseFloat(subGrandTotalNet) + parseFloat(taxGrandTotalNet);
  //           document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
  //           document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
  //           document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
  //           document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
  //         }
  //       }
  //     });

  //     $printrows.each(function () {
  //       var $printrows = $(this);
  //       var qty = $printrows.find("#lineQty").text() || 0;
  //       var price = $printrows.find("#lineUnitPrice").text() || "0";
  //       var taxrateamount = 0;
  //       var taxRate = $printrows.find("#lineTaxCode").text();
  //       if (taxcodeList) {
  //         for (var i = 0; i < taxcodeList.length; i++) {
  //           if (taxcodeList[i].codename == taxRate) {
  //             taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
  //           }
  //         }
  //       }
  //       var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
  //       var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
  //       $printrows
  //         .find("#lineTaxAmount")
  //         .text(utilityService.modifynegativeCurrencyFormat(taxTotal));
  //       if (!isNaN(subTotal)) {
  //         $printrows
  //           .find("#lineAmt")
  //           .text(utilityService.modifynegativeCurrencyFormat(subTotal));
  //         subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
  //         document.getElementById("subtotal_totalPrint").innerHTML = $("#subtotal_total").text();
  //       }

  //       if (!isNaN(taxTotal)) {
  //         taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
  //         document.getElementById("totalTax_totalPrint").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
  //       }
  //       if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
  //         document.getElementById("grandTotalPrint").innerHTML = $("#grandTotal").text();
  //         document.getElementById("totalBalanceDuePrint").innerHTML = $("#totalBalanceDue").text();
  //       }
  //     });
  //   }
  // });


  $(document).on("click", "#custListType tbody tr", function (e) {
    if (clickedInput == "one") {
      $("#edtSaleCustField_1").val($(this).find(".colFieldName").text());
    } else if (clickedInput == "two") {
      $("#edtSaleCustField_2").val($(this).find(".colFieldName").text());
    } else if (clickedInput == "three") {
      $("#edtSaleCustField_3").val($(this).find(".colFieldName").text());
    }
    $("#customFieldList").modal("toggle");

  });

  templateObject.checkEmailFrequencySetting = function () {
    let values = [];
    let basedOnTypeStorages = Object.keys(localStorage);
    basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
      let employeeId = storage.split("_")[2];
      return storage.includes("BasedOnType_");
      // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
    });
    let i = basedOnTypeStorages.length;
    if (i > 0) {
      while (i--) {
        values.push(localStorage.getItem(basedOnTypeStorages[i]));
      }
    }
    values.forEach((value) => {
      let reportData = JSON.parse(value);
      reportData.HostURL = $(location).attr("protocal") ?
        $(location).attr("protocal") +
        "://" +
        $(location).attr("hostname") :
        "http://" + $(location).attr("hostname");
      reportData.attachments = attachment;
      if (reportData.BasedOnType.includes("S")) {
        if (reportData.FormID == 1) {
          let formIds = reportData.FormIDs.split(",");
          if (formIds.includes("54")) {
            reportData.FormID = 54;
            Meteor.call("sendNormalEmail", reportData);
          }
        } else {
          if (reportData.FormID == 54)
            Meteor.call("sendNormalEmail", reportData);
        }
      }
    });
  }


  templateObject.saveInvoiceData = function(data, custid = "CurrencyWidget2") {
    setTimeout(function () {
      saveCurrencyHistory(data, custid);
      let uploadedItems = data.uploadedData
      let stripe_id = templateObject.accountID.get();
      let stripe_fee_method = templateObject.stripe_fee_method.get();
      let customername = $("#edtCustomerName");
      let name = $("#edtCustomerEmail").attr("customerfirstname");
      let surname = $("#edtCustomerEmail").attr("customerlastname");

      let termname = $(".transheader > #sltTerms_fromtransactionheader").val() || "";
      if (termname === "") {
        swal({
          title: "Terms has not been selected!",
          text: '',
          type: 'warning',
        }).then((result) => {
          if (result.value) {
            $('.transheader > #sltTerms_fromtransactionheader').focus();
          } else if (result.dismiss == 'cancel') {

          }
        });
        event.preventDefault();
        return false;
      }
      if (customername.val() === "") {
        swal({
          title: "Customer has not been selected!",
          text: '',
          type: 'warning',
        }).then((result) => {
          if (result.value) {
            $('#edtCustomerName').focus();
          } else if (result.dismiss == 'cancel') {

          }
        });
        event.preventDefault();
      } else {
        $(".fullScreenSpin").css("display", "inline-block");
        var splashLineArray = new Array();
        let lineItemsForm = [];
        let lineItems = [];
        let lineItemObjForm = {};
        var erpGet = erpDb();
        var saledateTime = new Date($("#dtSODate").datepicker("getDate"));

        var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

        let saleDate =
          saledateTime.getFullYear() +
          "-" +
          (saledateTime.getMonth() + 1) +
          "-" +
          saledateTime.getDate();

        let checkBackOrder = templateObject.includeBOnShippedQty.get();
        $("#tblInvoiceLine > tbody > tr").each(function () {
          var lineID = this.id;
          let tdproduct = $("#" + lineID + " .lineProductName").val();
          let tddescription = $("#" + lineID + " .lineProductDesc").text();
          let tdQty = $("#" + lineID + " .lineQty").val();

          let tdOrderd = $("#" + lineID + " .lineOrdered").val() || 1;

          let tdunitprice = $("#" + lineID + " .colUnitPriceExChange").val();
          let tdtaxCode =
            $("#" + lineID + " .lineTaxCode").val() || loggedTaxCodeSalesInc;
          let tdlineUnit = $("#" + lineID + " .lineUOM #edtUOMID").val() || defaultUOM;

          let tdSerialNumber = $("#" + lineID + " .colSerialNo").attr(
            "data-serialnumbers"
          );
          let tdLotNumber = $("#" + lineID + " .colSerialNo").attr(
            "data-lotnumbers"
          );
          let tdLotExpiryDate = $("#" + lineID + " .colSerialNo").attr(
            "data-expirydates"
          );
          let tdSalesLineCustField1 = $("#" + lineID + " .colSalesLinesCustField1").text();

          let lineItemObj = {
            description: tddescription || "",
            quantity: tdQty || 0,
            unitPrice: tdunitprice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            }) || 0,
          };

          lineItems.push(lineItemObj);

          if (tdproduct != "") {
            if (checkBackOrder == true) {
              lineItemObjForm = {
                type: "TInvoiceLine",
                fields: {
                  ProductName: tdproduct || "",
                  ProductDescription: tddescription || "",
                  UOMQtySold: parseFloat(tdOrderd) || 0,
                  UOMQtyShipped: parseFloat(tdQty) || 0,
                  LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                  Headershipdate: saleDate,
                  LineTaxCode: tdtaxCode || "",
                  DiscountPercent: parseFloat($("#" + lineID + " .lineDiscount").val()) || 0,
                  UnitOfMeasure: tdlineUnit,
                  SalesLinesCustField1: tdSalesLineCustField1,
                },
              };
            } else {
              lineItemObjForm = {
                type: "TInvoiceLine",
                fields: {
                  ProductName: tdproduct || "",
                  ProductDescription: tddescription || "",
                  UOMQtySold: parseFloat(tdQty) || 0,
                  UOMQtyShipped: parseFloat(tdQty) || 0,
                  LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                  Headershipdate: saleDate,
                  LineTaxCode: tdtaxCode || "",
                  DiscountPercent: parseFloat($("#" + lineID + " .lineDiscount").val()) || 0,
                  UnitOfMeasure: tdlineUnit,
                  SalesLinesCustField1: tdSalesLineCustField1,
                },
              };
            }

            // Feature/ser-lot number tracking: Save Serial Numbers
            if (tdSerialNumber) {
              const serialNumbers = tdSerialNumber.split(",");
              let tpqaList = [];
              for (let i = 0; i < serialNumbers.length; i++) {
                const tpqaObject = {
                  type: "TPQASN",
                  fields: {
                    Active: true,
                    Qty: 1,
                    SerialNumber: serialNumbers[i],
                  },
                };
                tpqaList.push(tpqaObject);
              }
              const pqaObject = {
                type: "TPQA",
                fields: {
                  Active: true,
                  PQASN: tpqaList,
                  Qty: serialNumbers.length,
                },
              };
              lineItemObjForm.fields.PQA = pqaObject;
            }

            // Feature/ser-lot number tracking: Save Lot Number
            if (tdLotNumber != undefined && tdLotNumber != "") {
              const lotNumbers = tdLotNumber.split(",");
              const expiryDates = tdLotExpiryDate.split(",");
              let tpqaList = [];
              for (let i = 0; i < lotNumbers.length; i++) {
                const dates = expiryDates[i].split("/");
                const tpqaObject = {
                  type: "PQABatch",
                  fields: {
                    Active: true,
                    BatchExpiryDate: new Date(
                      parseInt(dates[0]),
                      parseInt(dates[1]) - 1,
                      parseInt(dates[2])
                    ).toISOString(),
                    Qty: 1,
                    BatchNo: lotNumbers[i],
                  },
                };
                tpqaList.push(tpqaObject);
              }
              const pqaObject = {
                type: "TPQA",
                fields: {
                  Active: true,
                  PQABatch: tpqaList,
                  Qty: lotNumbers.length,
                },
              };
              lineItemObjForm.fields.PQA = pqaObject;
            }

            lineItemsForm.push(lineItemObjForm);
            splashLineArray.push(lineItemObjForm);
          }
        });
        let getchkcustomField1 = true;
        let getchkcustomField2 = true;
        let getcustomField1 = $(".customField1Text").html() || "";
        let getcustomField2 = $(".customField2Text").html() || "";
        if ($("#formCheck-one").is(":checked")) {
          getchkcustomField1 = false;
        }
        if ($("#formCheck-two").is(":checked")) {
          getchkcustomField2 = false;
        }

        let customer = $("#edtCustomerName").val();
        let customerEmail = $("#edtCustomerEmail").val();
        let billingAddress = $("#txabillingAddress").val();

        let poNumber = $("#ponumber").val();
        let reference = $("#edtRef").val();

        let departement = $(".transheader > #sltDept_fromtransactionheader").val() || "";
        let shippingAddress = $("#txaShipingInfo").val();
        let comments = $("#txaComment").val();
        let pickingInfrmation = $("#txapickmemo").val();
        let total = $("#totalBalanceDue").html() || 0;
        let tax = $("#subtotal_tax").html() || 0;
        let saleCustField1 = $("#edtSaleCustField_1").val() || "";
        let saleCustField2 = $("#edtSaleCustField_2").val() || "";
        let saleCustField3 = $("#edtSaleCustField_3").val() || "";
        var url = FlowRouter.current().path;
        var getso_id = url.split("?id=");
        var currentInvoice = getso_id[getso_id.length - 1];

        var currencyCode = $("#sltCurrency").val() || CountryAbbr;
        let ForeignExchangeRate = $('#exchange_rate').val() || 0;
        var showingFx = $("#toggleShowFx").prop('checked') == true? 'true': 'false';
        var showingDelivery = $('#toggleShowDelivery').prop('checked') ==true? 'true': 'false';
        var objDetails = "";
        if (departement === "") {
          swal({
            title: "Department has not been selected!",
            text: '',
            type: 'warning',
          }).then((result) => {
            if (result.value) {
              $('.transheader > #sltDept_fromtransactionheader').focus();
            } else if (result.dismiss == 'cancel') {

            }
          });
          $(".fullScreenSpin").css("display", "none");
          event.preventDefault();
          return false;
        }
        if (splashLineArray.length > 0) {
          if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);

            objDetails = {
              type: "TInvoiceEx",
              fields: {
                ID: currentInvoice,
                CustomerName: customer,
                ForeignExchangeCode: currencyCode,
                ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                Lines: splashLineArray,
                InvoiceToDesc: billingAddress,
                SaleDate: saleDate,
                CustPONumber: poNumber,
                ReferenceNo: reference,
                TermsName: termname,
                SaleClassName: departement,
                ShipToDesc: shippingAddress,
                Comments: comments,
                SaleCustField1: saleCustField1,
                SaleCustField2: saleCustField2,
                SaleCustField3: saleCustField3,
                PickMemo: pickingInfrmation,
                Attachments: uploadedItems,
                SalesStatus: $(".transheader > #sltStatus_fromtransactionheader").val(),
                SaleCustField10: showingFx,
                SaleCustField9: showingDelivery
              },
            };

          } else {
            objDetails = {
              type: "TInvoiceEx",
              fields: {
                CustomerName: customer,
                ForeignExchangeCode: currencyCode,
                ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                Lines: splashLineArray,
                InvoiceToDesc: billingAddress,
                SaleDate: saleDate,
                CustPONumber: poNumber,
                ReferenceNo: reference,
                TermsName: termname,
                SaleClassName: departement,
                ShipToDesc: shippingAddress,
                Comments: comments,
                SaleCustField1: saleCustField1,
                SaleCustField2: saleCustField2,
                SaleCustField3: saleCustField3,
                PickMemo: pickingInfrmation,
                Attachments: uploadedItems,
                SalesStatus: $(".transheader > #sltStatus_fromtransactionheader").val(),
                SaleCustField10: showingFx,
                SaleCustField9: showingDelivery
              },
            };
          }
        } else {
          swal("Product name has not been selected!", "", "warning");
          $(".fullScreenSpin").css("display", "none");
          event.preventDefault();
          return false;
        }

        salesService.saveInvoiceEx(objDetails).then(function (objDetails) {

          sideBarService.getAllSerialNumber().then(async function(data) {
              await addVS1Data('TSerialNumberListCurrentReport', JSON.stringify(data));
          }).catch(function (err){
          });

          productService.getProductBatches().then(async function (data) {
              await addVS1Data('TProductBatches', JSON.stringify(data));
          }).catch(function (err) {
          });

          if (localStorage.getItem("enteredURL") != null) {
            FlowRouter.go(localStorage.getItem("enteredURL"));
            localStorage.removeItem("enteredURL");
            return;
          }

          // add to custom field
          let company = localStorage.getItem("vs1companyName");
          let vs1User = localStorage.getItem("mySession");
          let customerEmail = $("#edtCustomerEmail").val() || "";
          let currencyname = CountryAbbr.toLowerCase();
          let stringQuery = "?";
          var customerID = $("#edtCustomerEmail").attr("customerid");
          for (let l = 0; l < lineItems.length; l++) {
            stringQuery =
              stringQuery +
              "product" +
              l +
              "=" +
              lineItems[l].description +
              "&price" +
              l +
              "=" +
              lineItems[l].unitPrice +
              "&qty" +
              l +
              "=" +
              lineItems[l].quantity +
              "&";
          }
          stringQuery =
            stringQuery +
            "tax=" +
            tax +
            "&total=" +
            total +
            "&customer=" +
            customer +
            "&name=" +
            name +
            "&surname=" +
            surname +
            "&quoteid=" +
            objDetails.fields.ID +
            "&transid=" +
            stripe_id +
            "&feemethod=" +
            stripe_fee_method +
            "&company=" +
            company +
            "&vs1email=" +
            vs1User +
            "&customeremail=" +
            customerEmail +
            "&type=Invoice&url=" +
            window.location.href +
            "&server=" +
            erpGet.ERPIPAddress +
            "&username=" +
            erpGet.ERPUsername +
            "&token=" +
            erpGet.ERPPassword +
            "&session=" +
            erpGet.ERPDatabase +
            "&port=" +
            erpGet.ERPPort +
            "&dept=" +
            departement +
            "&currency=" +
            currencyname;
          $("#html-Invoice-pdfwrapper").css("display", "block");
          $(".pdfCustomerName").html($("#edtCustomerName").val());
          $(".pdfCustomerAddress").html(
            $("#txabillingAddress")
              .val()
              .replace(/[\r\n]/g, "<br />")
          );
          var ponumber = $("#ponumber").val() || ".";
          $(".po").text(ponumber);

          // function generatePdfForMail(invoiceId) {
          //   let stripe_id = templateObject.accountID.get() || "";
          //   let file = "Invoice-" + invoiceId + ".pdf";
          //   return new Promise((resolve, reject) => {
          //     if (stripe_id != "") {
          //       $(".linkText").attr("href", stripeGlobalURL + stringQuery);
          //     } else {
          //       $(".linkText").attr("href", "#");
          //     }
          //     var source = document.getElementById("html-Invoice-pdfwrapper");
          //     var opt = {
          //       margin: 0,
          //       filename: file,
          //       image: {
          //         type: "jpeg",
          //         quality: 0.98,
          //       },
          //       html2canvas: {
          //         scale: 2,
          //       },
          //       jsPDF: {
          //         unit: "in",
          //         format: "a4",
          //         orientation: "portrait",
          //       },
          //     };
          //     resolve(
          //       html2pdf().set(opt).from(source).toPdf().output("datauristring")
          //     );
          //   });
          // }

          var htmlmailBody = generateHtmlMailBody(objDetails.fields.ID || '',stringQuery) 

          addAttachment("Invoice", "Supplier", objDetails.fields.ID || '', htmlmailBody, 'invoicelist', 54,  'html-Invoice-pdfwrapper', stringQuery, true)
          // async function addAttachment() {
          //   let attachment = [];
          //   let invoiceId = objDetails.fields.ID;
          //   let encodedPdf = await generatePdfForMail(invoiceId);
          //   let base64data = encodedPdf.split(",")[1];
          //   pdfObject = {
          //     filename: "invoice-" + invoiceId + ".pdf",
          //     content: base64data,
          //     encoding: "base64",
          //   };
          //   attachment.push(pdfObject);
          //   let erpInvoiceId = objDetails.fields.ID;

          //   let mailFromName = localStorage.getItem("vs1companyName");
          //   let mailFrom = localStorage.getItem("VS1OrgEmail") || localStorage.getItem("VS1AdminUserName");
          //   let customerEmailName = $("#edtCustomerName").val();
          //   let checkEmailData = $("#edtCustomerEmail").val();
          //   let grandtotal = $("#grandTotal").html();
          //   let emailDueDate = $("#dtDueDate").val();
          //   let customerBillingAddress = $("#txabillingAddress").val();
          //   let customerTerms = $(".transheader > #sltTerms_fromtransactionheader").val();

          //   let customerSubtotal = $("#subtotal_total").html();
          //   let customerTax = $("#subtotal_tax").html();
          //   let customerNett = $("#subtotal_nett").html();
          //   let customerTotal = $("#grandTotal").html();




          //   let mailSubject = "Invoice " + erpInvoiceId + " from " + mailFromName + " for " + customerEmailName;
          //   var htmlmailBody = generateHtmlMailBody(erpInvoiceId, emailDueDate, grandtotal, stripeGlobalURL, stringQuery, customerEmailName, mailFromName, customerBillingAddress, customerTerms, customerSubtotal, customerTax, customerNett, customerTotal)

          //   if (
          //     $(".chkEmailCopy").is(":checked") &&
          //     $(".chkEmailRep").is(":checked")
          //   ) {
          //     Meteor.call(
          //       "sendEmail", {
          //       from: "" + mailFromName + " <" + mailFrom + ">",
          //       to: checkEmailData,
          //       subject: mailSubject,
          //       text: "",
          //       html: htmlmailBody,
          //       attachments: attachment,
          //     },
          //       function (error, result) {
          //         if (error && error.error === "error") {
          //           FlowRouter.go("/invoicelist?success=true");
          //         } else { }
          //       }
          //     );

          //     Meteor.call(
          //       "sendEmail", {
          //       from: "" + mailFromName + " <" + mailFrom + ">",
          //       to: mailFrom,
          //       subject: mailSubject,
          //       text: "",
          //       html: htmlmailBody,
          //       attachments: attachment,
          //     },
          //       function (error, result) {
          //         if (error && error.error === "error") {
          //           if (FlowRouter.current().queryParams.trans) {
          //             FlowRouter.go(
          //               "/customerscard?id=" +
          //               FlowRouter.current().queryParams.trans +
          //               "&transTab=active"
          //             );
          //           } else {
          //             FlowRouter.go("/invoicelist?success=true");
          //           }
          //         } else {
          //           $("#html-Invoice-pdfwrapper").css("display", "none");
          //           swal({
          //             title: "SUCCESS",
          //             text: "Email Sent To Customer: " +
          //               checkEmailData +
          //               " and User: " +
          //               mailFrom +
          //               "",
          //             type: "success",
          //             showCancelButton: false,
          //             confirmButtonText: "OK",
          //           }).then((result) => {
          //             if (result.value) { } else if (result.dismiss === "cancel") { }
          //           });

          //           $(".fullScreenSpin").css("display", "none");
          //         }
          //       }
          //     );

          //     templateObject.checkEmailFrequencySetting();
          //   } else if ($(".chkEmailCopy").is(":checked")) {
          //     Meteor.call(
          //       "sendEmail", {
          //       from: "" + mailFromName + " <" + mailFrom + ">",
          //       to: checkEmailData,
          //       subject: mailSubject,
          //       text: "",
          //       html: htmlmailBody,
          //       attachments: attachment,
          //     },
          //       function (error, result) {
          //         if (error && error.error === "error") {
          //           FlowRouter.go("/invoicelist?success=true");
          //         } else {
          //           $("#html-Invoice-pdfwrapper").css("display", "none");
          //           swal({
          //             title: "SUCCESS",
          //             text: "Email Sent To Customer: " + checkEmailData + " ",
          //             type: "success",
          //             showCancelButton: false,
          //             confirmButtonText: "OK",
          //           }).then((result) => {
          //             if (result.value) {
          //               if (FlowRouter.current().queryParams.trans) {
          //                 FlowRouter.go(
          //                   "/customerscard?id=" +
          //                   FlowRouter.current().queryParams.trans +
          //                   "&transTab=active"
          //                 );
          //               } else {
          //                 FlowRouter.go("/invoicelist?success=true");
          //               }
          //             } else if (result.dismiss === "cancel") { }
          //           });

          //           $(".fullScreenSpin").css("display", "none");
          //         }
          //       }
          //     );
          //     templateObject.checkEmailFrequencySetting();
          //   } else if ($(".chkEmailRep").is(":checked")) {
          //     Meteor.call(
          //       "sendEmail", {
          //       from: "" + mailFromName + " <" + mailFrom + ">",
          //       to: mailFrom,
          //       subject: mailSubject,
          //       text: "",
          //       html: htmlmailBody,
          //       attachments: attachment,
          //     },
          //       function (error, result) {
          //         if (error && error.error === "error") {
          //           FlowRouter.go("/invoicelist?success=true");
          //         } else {
          //           $("#html-Invoice-pdfwrapper").css("display", "none");
          //           swal({
          //             title: "SUCCESS",
          //             text: "Email Sent To User: " + mailFrom + " ",
          //             type: "success",
          //             showCancelButton: false,
          //             confirmButtonText: "OK",
          //           }).then((result) => {
          //             if (result.value) {
          //               if (FlowRouter.current().queryParams.trans) {
          //                 FlowRouter.go(
          //                   "/customerscard?id=" +
          //                   FlowRouter.current().queryParams.trans +
          //                   "&transTab=active"
          //                 );
          //               } else {
          //                 FlowRouter.go("/invoicelist?success=true");
          //               }
          //             } else if (result.dismiss === "cancel") { }
          //           });

          //           $(".fullScreenSpin").css("display", "none");
          //         }
          //       }
          //     );
          //     templateObject.checkEmailFrequencySetting();
          //   } else {
          //     templateObject.checkEmailFrequencySetting();
          //     if (FlowRouter.current().queryParams.trans) {
          //       FlowRouter.go(
          //         "/customerscard?id=" +
          //         FlowRouter.current().queryParams.trans +
          //         "&transTab=active"
          //       );
          //     } else {
          //       FlowRouter.go("/invoicelist?success=true");
          //     }
          //   }
          // }
          // addAttachment();
        }).catch(function (err) {
            $("#html-Invoice-pdfwrapper").css("display", "none");
            swal({
              title: "Oooops...",
              text: err,
              type: "error",
              showCancelButton: false,
              confirmButtonText: "Try Again",
            }).then((result) => {
              if (result.value) {
                if (err === checkResponseError) {
                  window.open("/", "_self");
                }
              } else if (result.dismiss === "cancel") { }
            });
            $(".fullScreenSpin").css("display", "none");
          });
      }
    }, delayTimeAfterSound);
  }

});

Template.invoice_temp.helpers({
  oneExAPIName:function() {
    return salesService.getOneInvoicedataEx;
  },

  service: ()=>{
    return salesService;
  },

  setTransData: ()=> {
    let templateObject = Template.instance();
    return function(data) {
        let dataReturn =  templateObject.setInvoiceDataFields(data)
        return dataReturn;
    }
  },

  sendEmail:() => {
    let templateObject = Template.instance();
    return async function() {
      let dataReturn = await templateObject.sendEmail();
      return dataReturn
    }
  },

  getTemplateList: function () {
    return template_list;
  },

  getTemplateNumber: function () {
    let template_numbers = ["1", "2", "3"];
    return template_numbers;
  },


  mailHtml: function () {
    return function(data) {
      return Template.instance().getEmailBody(data)
    }
  },


  initialRecords: function () {
    let templateObject = Template.instance();
    return function() {
      let data = templateObject.setInitialRecords();
      return data;
    }
  },

  saveTransaction: function() {
    let templateObject = Template.instance();
    return function(data) {
      templateObject.saveInvoiceData(data, "CurrencyWidget2")
    }
  },

  printOptions: ()=>{
    return Template.instance().printOptions.get()
  },

  isBatchSerialNoTracking: () => {
    return localStorage.getItem("CloudShowSerial") || false;
  },
  vs1companyBankName: () => {
    return localStorage.getItem("vs1companyBankName") || "";
  },
  bsbRegionName: () => {
    return bsbCodeName;
  },
  vs1companyBankAccountName: () => {
    return localStorage.getItem("vs1companyBankAccountName") || "";
  },
  vs1companyBankAccountNo: () => {
    return localStorage.getItem("vs1companyBankAccountNo") || "";
  },
  vs1companyBankBSB: () => {
    return localStorage.getItem("vs1companyBankBSB") || "";
  },
  vs1companyBankSwiftCode: () => {
    return localStorage.getItem("vs1companyBankSwiftCode") || "";
  },
  vs1companyBankRoutingNo: () => {
    return localStorage.getItem("vs1companyBankRoutingNo") || "";
  },
  
  invoicerecord: () => {
    return Template.instance().invoicerecord.get();
  },
  accountID: () => {
    return Template.instance().accountID.get();
  },
  custfield1: () => {
    return localStorage.getItem("custfield1sales") || "Custom Field 1";
  },
  custfield2: () => {
    return localStorage.getItem("custfield2sales") || "Custom Field 2";
  },
  custfield3: () => {
    return localStorage.getItem("custfield3sales") || "Custom Field 3";
  },
  currentDate: () => {
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    return begunDate;
  },
  deptrecords: () => {
    return Template.instance()
      .deptrecords.get()
      .sort(function (a, b) {
        if (a.department == "NA") {
          return 1;
        } else if (b.department == "NA") {
          return -1;
        }
        return a.department.toUpperCase() > b.department.toUpperCase() ? 1 : -1;
      });
  },
  termrecords: () => {
    return Template.instance()
      .termrecords.get()
      .sort(function (a, b) {
        if (a.termsname == "NA") {
          return 1;
        } else if (b.termsname == "NA") {
          return -1;
        }
        return a.termsname.toUpperCase() > b.termsname.toUpperCase() ? 1 : -1;
      });
  },
  clientrecords: () => {
    return Template.instance()
      .clientrecords.get()
      .sort(function (a, b) {
        if (a.customername == "NA") {
          return 1;
        } else if (b.customername == "NA") {
          return -1;
        }
        return a.customername.toUpperCase() > b.customername.toUpperCase() ?
          1 :
          -1;
      });
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "new_invoice",
    });
  },
  salesCloudGridPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "tblInvoiceLine",
    });
  },
  uploadedFiles: () => {
    return Template.instance().uploadedFiles.get();
  },
  attachmentCount: () => {
    return Template.instance().attachmentCount.get();
  },
  uploadedFile: () => {
    return Template.instance().uploadedFile.get();
  },
  statusrecords: () => {
    return Template.instance()
      .statusrecords.get()
      .sort(function (a, b) {
        if (a.orderstatus == "NA") {
          return 1;
        } else if (b.orderstatus == "NA") {
          return -1;
        }
        return a.orderstatus.toUpperCase() > b.orderstatus.toUpperCase() ?
          1 :
          -1;
      });
  },
  includeBOnShippedQty: () => {
    return Template.instance().includeBOnShippedQty.get();
  },
  companyname: () => {
    return loggedCompany;
  },
  companyaddress1: () => {
    return localStorage.getItem("vs1companyaddress1");
  },
  companyaddress2: () => {
    return localStorage.getItem("vs1companyaddress2");
  },
  city: () => {
    return localStorage.getItem("vs1companyCity");
  },
  state: () => {
    return localStorage.getItem("companyState");
  },
  poBox: () => {
    return localStorage.getItem("vs1companyPOBox");
  },
  companyphone: () => {
    let phone = "Phone: " + localStorage.getItem("vs1companyPhone");
    return phone;
  },
  companyabn: () => {
    //Update Company ABN
    let countryABNValue = localStorage.getItem("vs1companyABN");
    return countryABNValue;
  },
  companyReg: () => {
    //Add Company Reg
    let countryRegValue = "";
    if (LoggedCountry == "South Africa") {
      countryRegValue = "Reg No: " + localStorage.getItem("vs1companyReg");
    }

    return countryRegValue;
  },
  organizationname: () => {
    return localStorage.getItem("vs1companyName");
  },
  organizationurl: () => {
    return localStorage.getItem("vs1companyURL");
  },
  isMobileDevices: () => {
    var isMobile = false;
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        navigator.userAgent
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        navigator.userAgent.substr(0, 4)
      )
    ) {
      isMobile = true;
    }

    return isMobile;
  },

  customerRecord: () => {
    return Template.instance().customerRecord.get();
  },

  productqtyrecords: () => {
    return Template.instance()
      .productqtyrecords.get()
      .sort(function (a, b) {
        if (a.department == "NA") {
          return 1;
        } else if (b.department == "NA") {
          return -1;
        }
        return a.department.toUpperCase() > b.department.toUpperCase() ? 1 : -1;
      });
  },
  productExtraSell: () => {
    return Template.instance()
      .productExtraSell.get()
      .sort(function (a, b) {
        if (a.clienttype == "NA") {
          return 1;
        } else if (b.clienttype == "NA") {
          return -1;
        }
        return a.clienttype.toUpperCase() > b.clienttype.toUpperCase() ? 1 : -1;
      });
  },
  totaldeptquantity: () => {
    return Template.instance().totaldeptquantity.get();
  },
  isTrackChecked: () => {
    let templateObj = Template.instance();
    return templateObj.isTrackChecked.get();
  },
  isExtraSellChecked: () => {
    let templateObj = Template.instance();
    return templateObj.isExtraSellChecked.get();
  },

  // custom field displaysettings

  loggedInCountryVAT: () => {
    let countryVatLabel = "GST";
    if (localStorage.getItem("ERPLoggedCountry") == "South Africa") {
      countryVatLabel = "VAT";
    }
    return countryVatLabel;
  },


  isForeignEnabled: () => {
    return Template.instance().isForeignEnabled.get();
  },
  getDefaultCurrency: () => {
    return defaultCurrencyCode;
  },

  headerfields: () => {
    return Template.instance().headerfields.get()
  },

  headerbuttons:()=>{
    return Template.instance().headerbuttons.get()
  },


  listapifunction: function () {
    return sideBarService.getAllTInvoiceListData
  },
  
  // apiFunction: function() {
  //   return salesService.getOneInvoicedataEx
  // },

  listapiservice: function () {
    return sideBarService
  },

  service: function() {
    return salesService
  },

  saveapifunction: function () {
    return salesService.saveInvoiceEx
  },
  isCurrencyEnable: () => FxGlobalFunctions.isCurrencyEnabled(),
  lineDataHandler: function () {
    let templateObject = Template.instance();
    return function(data) {
        let dataReturn =  templateObject.getLineTableData(data)
        return dataReturn
    }
  },
  getAttributes: function() {
    let templateObject = Template.instance();
    return function(data) {
      let dataReturn = templateObject.getLineAttributes(data)
      return dataReturn
    }
  },
  footerFields: function() {
    return Template.instance().tranasctionfooterfields.get()
  }
});

Template.invoice_temp.events({
  
  "click .btnRefreshCustomField": function (event) {
    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();
    sideBarService
      .getAllCustomFields()
      .then(function (data) {
        addVS1Data("TCustomFieldList", JSON.stringify(data))
          .then(function (datareturn) {
            Meteor._reload.reload();
          })
          .catch(function (err) {
            Meteor._reload.reload();
          });
        templateObject.getSalesCustomFieldsList();
        $(".fullScreenSpin").css("display", "none");
      })
      .catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
      });
  },
  "click #edtSaleCustField_1": function (event) {
    clickedInput = "one";
    $("#clickedControl").val(clickedInput);
  },
  "click #edtSaleCustField_2": function (event) {
    clickedInput = "two";
    $("#clickedControl").val(clickedInput);
  },
  "click  #open_print_confirm": function (event) { },

  // "click #choosetemplate": function (event) {
  //   if ($("#choosetemplate").is(":checked")) {
  //     $("#templateselection").modal("show");
  //   } else {
  //     $("#templateselection").modal("hide");
  //   }
  // },
  "click #edtSaleCustField_3": function (event) {
    clickedInput = "three";
    $("#clickedControl").val(clickedInput);
  },
  "change .transheader > #sltStatus_fromtransactionheader": function () {
    let status = $(".transheader > #sltStatus_fromtransactionheader").find(":selected").val();
 
    if (status == "newstatus") {
      $("#statusModal").modal();
    }
  },
  // "blur .lineProductDesc": function (event) { // can be moved to transactiongrid I think
  //   var targetID = $(event.target).closest("tr").attr("id");
  //   $("#" + targetID + " #lineProductDesc").text(
  //     $("#" + targetID + " .lineProductDesc").text()
  //   );
  // },
  "click .payNow": function (event) {
    let templateObject = Template.instance();
    let stripe_id = templateObject.accountID.get() || "";
    let stripe_fee_method = templateObject.stripe_fee_method.get();
    if (stripe_id != "") {
      var url = FlowRouter.current().path;
      var id_available = url.includes("?id=");
      if (id_available == true) {
        if ($("#edtCustomerEmail").val() != "") {
          let quoteData = templateObject.invoicerecord.get();
          let lineItems = [];
          let total = $("#totalBalanceDue").html() || 0;
          let tax = $("#subtotal_tax").html() || 0;
          let customer = $("#edtCustomerName").val();
          let company = localStorage.getItem("vs1companyName");
          let name = $("#firstname").val();
          let surname = $("#lastname").val();
          $("#tblInvoiceLine > tbody > tr").each(function () {
            var lineID = this.id;
            let tddescription = $("#" + lineID + " .lineProductDesc").text();
            let tdQty = $("#" + lineID + " .lineQty").val();
            let tdunitprice = $("#" + lineID + " .colUnitPriceExChange").val();
            const lineItemObj = {
              description: tddescription || "",
              quantity: tdQty || 0,
              unitPrice: tdunitprice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              }) || 0,
            };

            lineItems.push(lineItemObj);
          });
          var erpGet = erpDb();
          let vs1User = localStorage.getItem("mySession");
          let customerEmail = $("#edtCustomerEmail").val();
          let currencyname = CountryAbbr.toLowerCase();
          let stringQuery = "?";
          let dept = $(".transheader > #sltDept_fromtransactionheader").val();
          for (let l = 0; l < lineItems.length; l++) {
            stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice +
              "&qty" + l + "=" + lineItems[l].quantity + "&";
          }
          stringQuery = stringQuery + "tax=" + tax + "&total=" + total + "&customer=" + customer + "&name=" +
            name + "&surname=" + surname + "&quoteid=" + quoteData.id + "&transid=" + stripe_id + "&feemethod=" +
            stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" +
            customerEmail + "&type=Invoice&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress +
            "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase +
            "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;
          window.open(stripeGlobalURL + stringQuery, "_self");
        } else {
          swal({
            title: "Customer Email Required",
            text: "Please enter customer email",
            type: "error",
            showCancelButton: false,
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.value) { } else if (result.dismiss === "cancel") { }
          });
        }
      } else {
        let templateObject = Template.instance();
        let customername = $("#edtCustomerName");
        let name = $("#edtCustomerEmail").attr("customerfirstname");
        let surname = $("#edtCustomerEmail").attr("customerlastname");
        let salesService = new SalesBoardService();
        let termname =
          $(".transheader > #sltTerms_fromtransactionheader").val() || templateObject.defaultsaleterm.get();
        if (termname === "") {
          swal({
            title: "Terms has not been selected!",
            text: '',
            type: 'warning',
          }).then((result) => {
            if (result.value) {
              $('.transheader > #sltTerms_fromtransactionheader').focus();
            }
          });
          event.preventDefault();
          return false;
        }
        if (customername.val() === "") {
          swal({
            title: "Customer has not been selected!",
            text: '',
            type: 'warning',
          }).then((result) => {
            if (result.value) {
              $('#edtCustomerName').focus();
            }
          });
          e.preventDefault();
        } else {
          $(".fullScreenSpin").css("display", "inline-block");
          var splashLineArray = new Array();
          let lineItemsForm = [];
          let lineItems = [];
          let lineItemObjForm = {};
          var erpGet = erpDb();
          var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
          let saleDate =
            saledateTime.getFullYear() +
            "-" +
            (saledateTime.getMonth() + 1) +
            "-" +
            saledateTime.getDate();
          let checkBackOrder = templateObject.includeBOnShippedQty.get();
          $("#tblInvoiceLine > tbody > tr").each(function () {
            var lineID = this.id;
            let tdproduct = $("#" + lineID + " .lineProductName").val();
            let tddescription = $("#" + lineID + " .lineProductDesc").text();
            let tdQty = $("#" + lineID + " .lineQty").val();
            let tdOrderd = $("#" + lineID + " .lineOrdered").val();
            let tdunitprice = $("#" + lineID + " .colUnitPriceExChange").val();
            let tdtaxCode = $("#" + lineID + " .lineTaxCode").val();
            let tdlineUnit = $("#" + lineID + " .lineUOM").text() || defaultUOM;
            let tdSalesLineCustField1 = $("#" + lineID + " .lineSalesLinesCustField1").text();

            const lineItemObj = {
              description: tddescription || "",
              quantity: tdQty || 0,
              unitPrice: tdunitprice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              }) || 0,
            };

            lineItems.push(lineItemObj);

            if (tdproduct != "") {
              if (checkBackOrder == true) {
                lineItemObjForm = {
                  type: "TInvoiceLine",
                  fields: {
                    ProductName: tdproduct || "",
                    ProductDescription: tddescription || "",
                    UOMQtySold: parseFloat(tdOrderd) || 0,
                    UOMQtyShipped: parseFloat(tdQty) || 0,
                    LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                    Headershipdate: saleDate,
                    LineTaxCode: tdtaxCode || "",
                    DiscountPercent: parseFloat($("#" + lineID + " .lineDiscount").val()) || 0,
                    UnitOfMeasure: tdlineUnit,
                    SalesLinesCustField1: tdSalesLineCustField1,
                  },
                };
              } else {
                lineItemObjForm = {
                  type: "TInvoiceLine",
                  fields: {
                    ProductName: tdproduct || "",
                    ProductDescription: tddescription || "",
                    UOMQtySold: parseFloat(tdQty) || 0,
                    UOMQtyShipped: parseFloat(tdQty) || 0,
                    LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                    Headershipdate: saleDate,
                    LineTaxCode: tdtaxCode || "",
                    DiscountPercent: parseFloat($("#" + lineID + " .lineDiscount").val()) || 0,
                    UnitOfMeasure: tdlineUnit,
                    SalesLinesCustField1: tdSalesLineCustField1,
                  },
                };
              }

              lineItemsForm.push(lineItemObjForm);
              splashLineArray.push(lineItemObjForm);
            }
          });
          if ($("#formCheck-one").is(":checked")) {
            getchkcustomField1 = false;
          }
          if ($("#formCheck-two").is(":checked")) {
            getchkcustomField2 = false;
          }

          let customer = $("#edtCustomerName").val();

          let poNumber = $("#ponumber").val();
          let reference = $("#edtRef").val();

          let departement = $(".transheader > #sltDept_fromtransactionheader").val();
          let shippingAddress = $("#txaShipingInfo").val();
          let comments = $("#txaComment").val();
          let pickingInfrmation = $("#txapickmemo").val();
          let total = $("#totalBalanceDue").html() || 0;
          let tax = $("#subtotal_tax").html() || 0;
          let saleCustField1 = $("#edtSaleCustField_1").val() || "";
          let saleCustField2 = $("#edtSaleCustField_2").val() || "";
          let saleCustField3 = $("#edtSaleCustField_3").val() || "";
          var url = FlowRouter.current().path;
          var getso_id = url.split("?id=");
          var currentInvoice = getso_id[getso_id.length - 1];
          let uploadedItems = templateObject.uploadedFiles.get();
          var currencyCode = $("#sltCurrency").val() || CountryAbbr;
          let ForeignExchangeRate = $('#exchange_rate').val() || 0;
          var objDetails = "";
          if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);
            objDetails = {
              type: "TInvoiceEx",
              fields: {
                ID: currentInvoice,
                CustomerName: customer,
                ForeignExchangeCode: currencyCode,
                ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                Lines: splashLineArray,
                InvoiceToDesc: billingAddress,
                SaleDate: saleDate,
                CustPONumber: poNumber,
                ReferenceNo: reference,
                TermsName: termname,
                SaleClassName: departement,
                ShipToDesc: shippingAddress,
                Comments: comments,
                SaleCustField1: saleCustField1,
                SaleCustField2: saleCustField2,
                SaleCustField3: saleCustField3,
                PickMemo: pickingInfrmation,
                Attachments: uploadedItems,
                SalesStatus: $(".transheader > #sltStatus_fromtransactionheader").val(),
              },
            };
          } else {
            objDetails = {
              type: "TInvoiceEx",
              fields: {
                CustomerName: customer,
                ForeignExchangeCode: currencyCode,
                ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                Lines: splashLineArray,
                InvoiceToDesc: billingAddress,
                SaleDate: saleDate,
                CustPONumber: poNumber,
                ReferenceNo: reference,
                TermsName: termname,
                SaleClassName: departement,
                ShipToDesc: shippingAddress,
                Comments: comments,
                SaleCustField1: saleCustField1,
                SaleCustField2: saleCustField2,
                SaleCustField3: saleCustField3,
                PickMemo: pickingInfrmation,
                Attachments: uploadedItems,
                SalesStatus: $(".transheader > #sltStatus_fromtransactionheader").val(),
              },
            };
          }

          salesService.saveInvoiceEx(objDetails).then(function () {
              let company = localStorage.getItem("vs1companyName");
              let vs1User = localStorage.getItem("mySession");
              let customerEmail = $("#edtCustomerEmail").val() || "";
              let currencyname = CountryAbbr.toLowerCase();
              let stringQuery = "?";
              for (let l = 0; l < lineItems.length; l++) {
                stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + 
                lineItems[l].unitPrice + "&qty" + l + "=" +  lineItems[l].quantity + "&";
              }
              stringQuery = stringQuery + "tax=" + tax + "&total=" + total + "&customer=" + customer + "&name=" + name +
                "&surname=" + surname + "&quoteid=" + objDetails.fields.ID + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method +
                "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Invoice&url=" + window.location.href +
                "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase +
                "&port=" + erpGet.ERPPort + "&dept=" + departement + "&currency=" + currencyname;
              let url = stripeGlobalURL + stringQuery;
              $("#html-Invoice-pdfwrapper").css("display", "block");
              $(".pdfCustomerName").html($("#edtCustomerName").val());
              $(".pdfCustomerAddress").html($("#txabillingAddress").val().replace(/[\r\n]/g, "<br />"));

              // function generatePdfForMail(invoiceId) {
              //   let stripe_id = templateObject.accountID.get() || "";
              //   let file = "Invoice-" + invoiceId + ".pdf";
              //   return new Promise((resolve, reject) => {
              //     if (stripe_id != "") {
              //       $(".linkText").attr("href", stripeGlobalURL + stringQuery);
              //     } else {
              //       $(".linkText").attr("href", "#");
              //     }
              //     var source = document.getElementById(
              //       "html-Invoice-pdfwrapper"
              //     );
              //     var opt = {
              //       margin: 0,
              //       filename: file,
              //       image: {
              //         type: "jpeg",
              //         quality: 0.98,
              //       },
              //       html2canvas: {
              //         scale: 2,
              //       },
              //       jsPDF: {
              //         unit: "in",
              //         format: "a4",
              //         orientation: "portrait",
              //       },
              //     };
              //     resolve(
              //       html2pdf()
              //         .set(opt)
              //         .from(source)
              //         .toPdf()
              //         .output("datauristring")
              //     );
              //   });
              // }
              // async function addAttachment() {
              //   let attachment = [];
              //   let invoiceId = objDetails.fields.ID;
              //   let encodedPdf = await generatePdfForMail(invoiceId);
              //   let base64data = encodedPdf.split(",")[1];
              //   let pdfObject = {
              //     filename: "invoice-" + invoiceId + ".pdf",
              //     content: base64data,
              //     encoding: "base64",
              //   };
              //   attachment.push(pdfObject);
              //   let erpInvoiceId = objDetails.fields.ID;

              //   let mailFromName = localStorage.getItem("vs1companyName");
              //   let mailFrom = localStorage.getItem("VS1OrgEmail") || localStorage.getItem("VS1AdminUserName");
              //   let customerEmailName = $("#edtCustomerName").val();
              //   let checkEmailData = $("#edtCustomerEmail").val();
              //   let grandtotal = $("#grandTotal").html();
              //   let emailDueDate = $("#dtDueDate").val();
              //   let customerBillingAddress = $("#txabillingAddress").val();
              //   let customerTerms = $(".transheader > #sltTerms_fromtransactionheader").val();

              //   let customerSubtotal = $("#subtotal_total").html();
              //   let customerTax = $("#subtotal_tax").html();
              //   let customerNett = $("#subtotal_nett").html();
              //   let customerTotal = $("#grandTotal").html();

              //   let mailSubject = "Invoice " + erpInvoiceId + " from " + mailFromName + " for " + customerEmailName;
              //   var htmlmailBody = generateHtmlMailBody(erpInvoiceId, emailDueDate, grandtotal, stripeGlobalURL, stringQuery, customerEmailName, mailFromName, customerBillingAddress, customerTerms, customerSubtotal, customerTax, customerNett, customerTotal)

              //   if (
              //     $(".chkEmailCopy").is(":checked") &&
              //     $(".chkEmailRep").is(":checked")
              //   ) {
              //     Meteor.call(
              //       "sendEmail", {
              //       from: "" + mailFromName + " <" + mailFrom + ">",
              //       to: checkEmailData,
              //       subject: mailSubject,
              //       text: "",
              //       html: htmlmailBody,
              //       attachments: attachment,
              //     },
              //       function (error, result) {
              //         if (error && error.error === "error") {
              //           FlowRouter.go("/invoicelist?success=true");
              //         }
              //       }
              //     );

              //     Meteor.call(
              //       "sendEmail", {
              //       from: "" + mailFromName + " <" + mailFrom + ">",
              //       to: mailFrom,
              //       subject: mailSubject,
              //       text: "",
              //       html: htmlmailBody,
              //       attachments: attachment,
              //     },
              //       function (error, result) {
              //         if (error && error.error === "error") {
              //           if (FlowRouter.current().queryParams.trans) {
              //             FlowRouter.go(
              //               "/customerscard?id=" +
              //               FlowRouter.current().queryParams.trans +
              //               "&transTab=active"
              //             );
              //           } else {
              //             FlowRouter.go("/invoicelist?success=true");
              //           }
              //         } else {
              //           $("#html-Invoice-pdfwrapper").css("display", "none");
              //           swal({
              //             title: "SUCCESS",
              //             text: "Email Sent To Customer: " +
              //               checkEmailData +
              //               " and User: " +
              //               mailFrom +
              //               "",
              //             type: "success",
              //             showCancelButton: false,
              //             confirmButtonText: "OK",
              //           }).then((result) => {
              //             if (result.value) {
              //               window.open(url, "_self");
              //             } else if (result.dismiss === "cancel") { }
              //           });

              //           $(".fullScreenSpin").css("display", "none");
              //         }
              //       }
              //     );
              //   } else if ($(".chkEmailCopy").is(":checked")) {
              //     Meteor.call(
              //       "sendEmail", {
              //       from: "" + mailFromName + " <" + mailFrom + ">",
              //       to: checkEmailData,
              //       subject: mailSubject,
              //       text: "",
              //       html: htmlmailBody,
              //       attachments: attachment,
              //     },
              //       function (error, result) {
              //         if (error && error.error === "error") {
              //           FlowRouter.go("/invoicelist?success=true");
              //         } else {
              //           $("#html-Invoice-pdfwrapper").css("display", "none");
              //           swal({
              //             title: "SUCCESS",
              //             text: "Email Sent To Customer: " + checkEmailData + " ",
              //             type: "success",
              //             showCancelButton: false,
              //             confirmButtonText: "OK",
              //           }).then((result) => {
              //             if (result.value) {
              //               window.open(url, "_self");
              //             }
              //           });

              //           $(".fullScreenSpin").css("display", "none");
              //         }
              //       }
              //     );
              //   } else if ($(".chkEmailRep").is(":checked")) {
              //     Meteor.call(
              //       "sendEmail", {
              //       from: "" + mailFromName + " <" + mailFrom + ">",
              //       to: mailFrom,
              //       subject: mailSubject,
              //       text: "",
              //       html: htmlmailBody,
              //       attachments: attachment,
              //     },
              //       function (error, result) {
              //         if (error && error.error === "error") {
              //           FlowRouter.go("/invoicelist?success=true");
              //         } else {
              //           $("#html-Invoice-pdfwrapper").css("display", "none");
              //           swal({
              //             title: "SUCCESS",
              //             text: "Email Sent To User: " + mailFrom + " ",
              //             type: "success",
              //             showCancelButton: false,
              //             confirmButtonText: "OK",
              //           }).then((result) => {
              //             if (result.value) {
              //               window.open(url, "_self");
              //             }
              //           });

              //           $(".fullScreenSpin").css("display", "none");
              //         }
              //       }
              //     );
              //   } else {
              //     window.open(url, "_self");
              //   }
              // }
              // addAttachment();

              // templateObject.addAttachment(objDetails, 'html-Invoice-pdfwrapper', stringQuery, false)
              let htmlmailBody = generateHtmlMailBody(objDetails.fields.ID || '',stringQuery)
              addAttachment("Invoice", "Customer", objDetails.fields.ID || '', htmlmailBody, 'invoicelist', 54,  'html-Invoice-pdfwrapper', stringQuery, false, 'blob')
            })
            .catch(function (err) {
              $("#html-Invoice-pdfwrapper").css("display", "none");
              swal({
                title: "Oooops...",
                text: err,
                type: "error",
                showCancelButton: false,
                confirmButtonText: "Try Again",
              }).then((result) => {
                if (result.value) {
                  if (err === checkResponseError) {
                    window.open("/", "_self");
                  }
                } else if (result.dismiss === "cancel") { }
              });
              $(".fullScreenSpin").css("display", "none");
            });
        }
      }
    } else {
      swal({
        title: "WARNING",
        text: "Please Set Up Payment Method To Use This Option, Click Ok to be Redirected to Payment Method page.",
        type: "warning",
        showCancelButton: false,
        confirmButtonText: "OK",
      }).then((result) => {
        if (result.value) {
          window.open("paymentmethodSettings", "_self");
        } else if (result.dismiss === "cancel") { }
      });
    }
  },

  "click #btnCustomFileds": function (event) {
    var x = document.getElementById("divCustomFields");
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  },

  "click #btnPayment": function (e) {
    var currenturl = FlowRouter.current().path;
    var getcurrent_id = currenturl.split("?id=");
    let templateObject = Template.instance();
    let customername = $("#edtCustomerName");
    let salesService = new SalesBoardService();
    let termname = $(".transheader > #sltTerms_fromtransactionheader").val() || templateObject.defaultsaleterm.get();
    if (termname === "") {
      swal('Terms has not been selected!', '', 'warning');
      e.preventDefault();
      return false;
    }
    if (customername.val() === "") {
      swal('Supplier has not been selected!', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            e.preventDefault();
    } else {
      $(".fullScreenSpin").css("display", "inline-block");
      var splashLineArray = new Array();
      let lineItemsForm = [];
      let lineItems = [];
      let lineItemObjForm = {};
      var saledateTime = new Date($("#dtSODate").datepicker("getDate"));

      var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

      let saleDate =
        saledateTime.getFullYear() +
        "-" +
        (saledateTime.getMonth() + 1) +
        "-" +
        saledateTime.getDate();

      let checkBackOrder = templateObject.includeBOnShippedQty.get();
      $("#tblInvoiceLine > tbody > tr").each(function () {
        var lineID = this.id;
        let tdproduct = $("#" + lineID + " .lineProductName").val();
        let tddescription = $("#" + lineID + " .lineProductDesc").text();
        let tdQty = $("#" + lineID + " .lineQty").val();

        let tdOrderd = $("#" + lineID + " .lineOrdered").val();

        let tdunitprice = $("#" + lineID + " .colUnitPriceExChange").val();
        let tdtaxCode = $("#" + lineID + " .lineTaxCode").val();
        let tdlineUnit = $("#" + lineID + " .lineUOM").text() || defaultUOM;
        let tdSalesLineCustField1 = $("#" + lineID + " .lineSalesLinesCustField1").text();
        let lineItemObj = {
          description: tddescription || "",
          quantity: tdQty || 0,
          unitPrice: tdunitprice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          }) || 0,
        };

        lineItems.push(lineItemObj);

        if (tdproduct != "") {
          if (checkBackOrder == true) {
            lineItemObjForm = {
              type: "TInvoiceLine",
              fields: {
                ProductName: tdproduct || "",
                ProductDescription: tddescription || "",
                UOMQtySold: parseFloat(tdOrderd) || 0,
                UOMQtyShipped: parseFloat(tdQty) || 0,
                LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                Headershipdate: saleDate,
                LineTaxCode: tdtaxCode || "",
                DiscountPercent: parseFloat($("#" + lineID + " .lineDiscount").val()) || 0,
                UnitOfMeasure: tdlineUnit,
                SalesLinesCustField1: tdSalesLineCustField1,
              },
            };
          } else {
            lineItemObjForm = {
              type: "TInvoiceLine",
              fields: {
                ProductName: tdproduct || "",
                ProductDescription: tddescription || "",
                UOMQtySold: parseFloat(tdQty) || 0,
                UOMQtyShipped: parseFloat(tdQty) || 0,
                LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                Headershipdate: saleDate,
                LineTaxCode: tdtaxCode || "",
                DiscountPercent: parseFloat($("#" + lineID + " .lineDiscount").val()) || 0,
                UnitOfMeasure: tdlineUnit,
                SalesLinesCustField1: tdSalesLineCustField1,
              },
            };
          }

          lineItemsForm.push(lineItemObjForm);
          splashLineArray.push(lineItemObjForm);
        }
      });

      let getchkcustomField1 = true;
      let getchkcustomField2 = true;
      let getcustomField1 = $(".customField1Text").html();
      let getcustomField2 = $(".customField2Text").html();
      if ($("#formCheck-one").is(":checked")) {
        getchkcustomField1 = false;
      }
      if ($("#formCheck-two").is(":checked")) {
        getchkcustomField2 = false;
      }

      let customer = $("#edtCustomerName").val();
      let customerEmail = $("#edtCustomerEmail").val();
      let billingAddress = $("#txabillingAddress").val();

      let poNumber = $("#ponumber").val();
      let reference = $("#edtRef").val();

      let departement = $(".transheader > #sltDept_fromtransactionheader").val();
      let shippingAddress = $("#txaShipingInfo").val();
      let comments = $("#txaComment").val();
      let pickingInfrmation = $("#txapickmemo").val();

      let saleCustField1 = $("#edtSaleCustField_1").val() || "";
      let saleCustField2 = $("#edtSaleCustField_2").val() || "";
      let saleCustField3 = $("#edtSaleCustField_3").val() || "";
      var url = FlowRouter.current().path;
      var getso_id = url.split("?id=");
      var currentInvoice = getso_id[getso_id.length - 1];
      let uploadedItems = templateObject.uploadedFiles.get();
      var currencyCode = $("#sltCurrency").val() || CountryAbbr;
      let ForeignExchangeRate = $('#exchange_rate').val() || 0;
      var objDetails = "";
      if (getso_id[1]) {
        currentInvoice = parseInt(currentInvoice);
        objDetails = {
          type: "TInvoiceEx",
          fields: {
            ID: currentInvoice,
            CustomerName: customer,
            ForeignExchangeCode: currencyCode,
            ForeignExchangeRate: parseFloat(ForeignExchangeRate),
            Lines: splashLineArray,
            InvoiceToDesc: billingAddress,
            SaleDate: saleDate,
            CustPONumber: poNumber,
            ReferenceNo: reference,
            TermsName: termname,
            SaleClassName: departement,
            ShipToDesc: shippingAddress,
            Comments: comments,
            SaleCustField1: saleCustField1,
            SaleCustField2: saleCustField2,
            SaleCustField3: saleCustField3,
            PickMemo: pickingInfrmation,
            Attachments: uploadedItems,
            SalesStatus: $(".transheader > #sltStatus_fromtransactionheader").val(),
          },
        };
      } else {
        objDetails = {
          type: "TInvoiceEx",
          fields: {
            CustomerName: customer,
            ForeignExchangeCode: currencyCode,
            ForeignExchangeRate: parseFloat(ForeignExchangeRate),
            Lines: splashLineArray,
            InvoiceToDesc: billingAddress,
            SaleDate: saleDate,
            CustPONumber: poNumber,
            ReferenceNo: reference,
            TermsName: termname,
            SaleClassName: departement,
            ShipToDesc: shippingAddress,
            Comments: comments,
            SaleCustField1: saleCustField1,
            SaleCustField2: saleCustField2,
            SaleCustField3: saleCustField3,
            PickMemo: pickingInfrmation,
            Attachments: uploadedItems,
            SalesStatus: $(".transheader > #sltStatus_fromtransactionheader").val(),
          },
        };
      }

      salesService
        .saveInvoiceEx(objDetails)
        .then(function () {
          var customerID = $("#edtCustomerEmail").attr("customerid");
          $("#html-Invoice-pdfwrapper").css("display", "block");
          $(".pdfCustomerName").html($("#edtCustomerName").val());
          $(".pdfCustomerAddress").html(
            $("#txabillingAddress")
              .val()
              .replace(/[\r\n]/g, "<br />")
          );
          // async function addAttachment() {
          //   let attachment = [];
          //   let invoiceId = objDetails.fields.ID;
          //   let encodedPdf = await generatePdfForMail(invoiceId);
          //   var reader = new FileReader();
          //   reader.readAsDataURL(encodedPdf);
          //   reader.onloadend = function () {
          //     var base64data = reader.result;
          //     base64data = base64data.split(",")[1];
          //   let pdfObject = {
          //     filename: "invoice-" + invoiceId + ".pdf",
          //     content: base64data,
          //     encoding: "base64",
          //   };
          //   attachment.push(pdfObject);
          //   let erpInvoiceId = objDetails.fields.ID;

          //   let mailFromName = localStorage.getItem("vs1companyName");
          //   let mailFrom = localStorage.getItem("VS1OrgEmail") || localStorage.getItem("VS1AdminUserName");
          //   let customerEmailName = $("#edtCustomerName").val();
          //   let checkEmailData = $("#edtCustomerEmail").val();
          //   let grandtotal = $("#grandTotal").html();
          //   let amountDueEmail = $("#totalBalanceDue").html();
          //   let emailDueDate = $("#dtDueDate").val();
          //   let customerBillingAddress = $("#txabillingAddress").val();
          //   let customerTerms = $("#sltTerms").val();

          //   let customerSubtotal = $("#subtotal_total").html();
          //   let customerTax = $("#subtotal_tax").html();
          //   let customerNett = $("#subtotal_nett").html();
          //   let customerTotal = $("#grandTotal").html();
          //   let mailSubject = "Invoice " + erpInvoiceId + " from " + mailFromName + " for " + customerEmailName;
          //   var htmlmailBody = generateHtmlMailBody(erpInvoiceId, emailDueDate, grandtotal, stripeGlobalURL, stringQuery, customerEmailName, mailFromName, customerBillingAddress, customerTerms, customerSubtotal, customerTax, customerNett, customerTotal)

          //     if ($(".chkEmailCopy").is(":checked") && $(".chkEmailRep").is(":checked")) {
          //       Meteor.call(
          //         "sendEmail", {
          //         from: "" + mailFromName + " <" + mailFrom + ">",
          //         to: checkEmailData,
          //         subject: mailSubject,
          //         text: "",
          //         html: htmlmailBody,
          //         attachments: attachment,
          //       },
          //         function (error, result) {
          //           if (error && error.error === "error") { } else { }
          //         }
          //       );

          //       Meteor.call(
          //         "sendEmail", {
          //         from: "" + mailFromName + " <" + mailFrom + ">",
          //         to: mailFrom,
          //         subject: mailSubject,
          //         text: "",
          //         html: htmlmailBody,
          //         attachments: attachment,
          //       },
          //         function (error, result) {
          //           if (error && error.error === "error") { } else {
          //             $("#html-Invoice-pdfwrapper").css("display", "none");
          //             swal({
          //               title: "SUCCESS",
          //               text: "Email Sent To Customer: " +
          //                 checkEmailData +
          //                 " and User: " +
          //                 mailFrom +
          //                 "",
          //               type: "success",
          //               showCancelButton: false,
          //               confirmButtonText: "OK",
          //             }).then((result) => {
          //               if (result.value) { } else if (result.dismiss === "cancel") { }
          //             });
          //           }
          //         }
          //       );
          //     } else if ($(".chkEmailCopy").is(":checked")) {
          //       Meteor.call(
          //         "sendEmail", {
          //         from: "" + mailFromName + " <" + mailFrom + ">",
          //         to: checkEmailData,
          //         subject: mailSubject,
          //         text: "",
          //         html: htmlmailBody,
          //         attachments: attachment,
          //       },
          //         function (error, result) {
          //           if (error && error.error === "error") { } else {
          //             $("#html-Invoice-pdfwrapper").css("display", "none");
          //             swal({
          //               title: "SUCCESS",
          //               text: "Email Sent To Customer: " + checkEmailData + " ",
          //               type: "success",
          //               showCancelButton: false,
          //               confirmButtonText: "OK",
          //             }).then((result) => {
          //               if (result.value) { } else if (result.dismiss === "cancel") { }
          //             });
          //           }
          //         }
          //       );
          //     } else if ($(".chkEmailRep").is(":checked")) {
          //       Meteor.call(
          //         "sendEmail", {
          //         from: "" + mailFromName + " <" + mailFrom + ">",
          //         to: mailFrom,
          //         subject: mailSubject,
          //         text: "",
          //         html: htmlmailBody,
          //         attachments: attachment,
          //       },
          //         function (error, result) {
          //           if (error && error.error === "error") { } else {
          //             $("#html-Invoice-pdfwrapper").css("display", "none");
          //             swal({
          //               title: "SUCCESS",
          //               text: "Email Sent To User: " + mailFrom + " ",
          //               type: "success",
          //               showCancelButton: false,
          //               confirmButtonText: "OK",
          //             }).then((result) => {
          //               if (result.value) { } else if (result.dismiss === "cancel") { }
          //             });
          //           }
          //         }
          //       );
          //     } else { }
          //   };
          // }
          // addAttachment();
          let stringQuery = ''
          // templateObject.addAttachment(objDetails, 'html-Invoice-pdfwrapper', stringQuery, false)
          let htmlmailBody = generateHtmlMailBody(objDetails.fields.ID || '',stringQuery)
          addAttachment("Invoice", "Customer", objDetails.fields.ID || '', htmlmailBody, 'invoicelist', 54,  'html-Invoice-pdfwrapper', stringQuery, false)

          // function generatePdfForMail(invoiceId) {
          //   return new Promise((resolve, reject) => {
          //     let doc = new jsPDF("p", "pt", "a4");
          //     doc.setFontSize(18);
          //     var source = document.getElementById("html-Invoice-pdfwrapper");
          //     doc.addHTML(source, function () {
          //       resolve(doc.output("blob"));
          //       $("#html-Invoice-pdfwrapper").css("display", "none");
          //     });
          //   });
          // }
          if (customerID !== " ") { }
          let linesave = objDetails.fields.ID;

          sideBarService
            .getAllInvoiceList(initialDataLoad, 0)
            .then(function (data) {
              addVS1Data("TInvoiceEx", JSON.stringify(data))
                .then(function (datareturn) {
                  window.open("/paymentcard?invid=" + linesave, "_self");
                })
                .catch(function (err) {
                  window.open("/paymentcard?invid=" + linesave, "_self");
                });
            })
            .catch(function (err) {
              window.open("/paymentcard?invid=" + linesave, "_self");
            });
        })
        .catch(function (err) {
          swal({
            title: "Oooops...",
            text: err,
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Try Again",
          }).then((result) => {
            if (result.value) {
              if (err === checkResponseError) {
                window.open("/", "_self");
              }
            } else if (result.dismiss === "cancel") { }
          });
          $(".fullScreenSpin").css("display", "none");
        });
    }
  },
  "click #btnViewPayment": async function () {
    let salesService = new SalesBoardService();
    $(".fullScreenSpin").css("display", "inline-block");
    let paymentID = "";
    var url = FlowRouter.current().path;
    var getso_id = url.split("?id=");
    var currentInvoice = getso_id[getso_id.length - 1];
    let paymentData =
      (await salesService.getCheckPaymentLineByTransID(currentInvoice)) || "";

    if (paymentData) {
      for (let x = 0; x < paymentData.tcustomerpaymentline.length; x++) {
        if (paymentData.tcustomerpaymentline.length > 1) {
          paymentID = paymentData.tcustomerpaymentline[x].fields.Payment_ID;
          window.open("/paymentcard?id=" + paymentID, "_self");
        } else {
          paymentID = paymentData.tcustomerpaymentline[0].fields.Payment_ID;
          window.open("/paymentcard?id=" + paymentID, "_self");
        }
      }
    } else {
      $(".fullScreenSpin").css("display", "none");
    }
  },
  "click .btnTransactionPaid": async function () {
    let salesService = new SalesBoardService();
    $(".fullScreenSpin").css("display", "inline-block");
    let selectedSupplierPaymentID = [];
    let paymentID = "";
    var url = FlowRouter.current().path;
    var getso_id = url.split("?id=");
    var currentInvoice = getso_id[getso_id.length - 1];
    let suppliername = $("#edtCustomerName").val() || "";
    let paymentData =
      (await salesService.getCheckPaymentLineByTransID(currentInvoice)) || "";
    if (paymentData) {
      for (let x = 0; x < paymentData.tcustomerpaymentline.length; x++) {
        if (paymentData.tcustomerpaymentline.length > 1) {
          paymentID = paymentData.tcustomerpaymentline[x].fields.Payment_ID;
          selectedSupplierPaymentID.push(paymentID);
        } else {
          paymentID = paymentData.tcustomerpaymentline[0].fields.Payment_ID;
          window.open("/paymentcard?id=" + paymentID, "_self");
        }
      }

      setTimeout(function () {
        let selectPayID = selectedSupplierPaymentID;
        window.open(
          "/customerpayment?payment=" + selectPayID + "&name=" + suppliername,
          "_self"
        );
      }, 500);
    } else {
      $(".fullScreenSpin").css("display", "none");
    }
  },
 
  "focusout .lineShipped": function (event) {
    // $(".fullScreenSpin").css("display", "inline-block");
    var target = event.target;
    let selectedunit = $(target).closest("tr").find(".lineOrdered").val();
    localStorage.setItem("productItem", selectedunit);
    let selectedProductName = $(target).closest("tr").find(".lineProductName").val();
    localStorage.setItem("selectedProductName", selectedProductName);

    let productService = new ProductService();
    const templateObject = Template.instance();
    const InvoiceData = templateObject.invoicerecord.get();
    let existProduct = false;
    if(parseInt($(target).val()) > 0){
      InvoiceData.LineItems.forEach(async (element) => {
        if (element.item == selectedProductName) {
          existProduct = true;
        }
      });
      if (!existProduct) {
        if (selectedProductName == "") {
          swal("You have to select Product.", "", "info");
          event.preventDefault();
          return false;
        } else {
          getVS1Data("TProductQtyList").then(function (dataObject) {
            if (dataObject.length == 0) {
              productService.getProductStatus(selectedProductName).then(async function (data) {
                if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                  return false;
                } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                  let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                  if(selectedLot != undefined && selectedLot != ""){
                    shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                  }
                  else{
                    shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                  }
                  setTimeout(function () {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $("#availableLotNumberModal").attr("data-row", row + 1);
                    $("#availableLotNumberModal").modal("show");
                  }, 200);
                } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                  let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                  if(selectedSN != undefined && selectedSN != ""){
                    shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                  }
                  else{
                    shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                  }
                  setTimeout(function () {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $("#availableSerialNumberModal").attr("data-row", row + 1);
                    $('#availableSerialNumberModal').modal('show');
                    if(data.tproductvs1[0].CUSTFLD13 == 'true'){
                      $("#availableSerialNumberModal .btnSNCreate").show();
                    }
                    else{
                      $("#availableSerialNumberModal .btnSNCreate").hide();
                    }
                  }, 200);
                }
              });
            }
            else{
              let data = JSON.parse(dataObject[0].data);
              for (let i = 0; i < data.tproductqtylist.length; i++) {
                if(data.tproductqtylist[i].ProductName == selectedProductName){
                  if (data.tproductqtylist[i].batch == false && data.tproductqtylist[i].SNTracking == false) {
                    return false;
                  } else if (data.tproductqtylist[i].batch == true && data.tproductqtylist[i].SNTracking == false) {
                    let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                    if(selectedLot != undefined && selectedLot != ""){
                      shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                    }
                    else{
                      shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                    }
                    setTimeout(function () {
                      var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                      $("#availableLotNumberModal").attr("data-row", row + 1);
                      $("#availableLotNumberModal").modal("show");
                    }, 200);
                  } else if (data.tproductqtylist[i].batch == false && data.tproductqtylist[i].SNTracking == true) {
                    let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                    if(selectedSN != undefined && selectedSN != ""){
                      shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                    }
                    else{
                      shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                    }
                    setTimeout(function () {
                      var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                      $("#availableSerialNumberModal").attr("data-row", row + 1);
                      $('#availableSerialNumberModal').modal('show');
                      if(data.tproductqtylist[i].CUSTFLD13 == 'true'){
                        $("#availableSerialNumberModal .btnSNCreate").show();
                      }
                      else{
                        $("#availableSerialNumberModal .btnSNCreate").hide();
                      }
                    }, 200);
                  }
                }
              }
            }
          }).catch(function (err) {
            productService.getProductStatus(selectedProductName).then(async function (data) {
              if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                return false;
              } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                if(selectedLot != undefined && selectedLot != ""){
                  shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                }
                else{
                  shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                }
                setTimeout(function () {
                  var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                  $("#availableLotNumberModal").attr("data-row", row + 1);
                  $("#availableLotNumberModal").modal("show");
                }, 200);
              } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                if(selectedSN != undefined && selectedSN != ""){
                  shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                }
                else{
                  shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                }
                setTimeout(function () {
                  var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                  $("#availableSerialNumberModal").attr("data-row", row + 1);
                  $('#availableSerialNumberModal').modal('show');
                  if(data.tproductvs1[0].CUSTFLD13 == 'true'){
                    $("#availableSerialNumberModal .btnSNCreate").show();
                  }
                  else{
                    $("#availableSerialNumberModal .btnSNCreate").hide();
                  }
                }, 200);
              }
            });
          });
        }
      }
    }
  },
  "click .btnSnLotmodal": function (event) {
    var target = event.target;
    let selectedShipped = $(target).closest("tr").find(".lineShipped").val();
    let selectedunit = $(target).closest("tr").find(".lineOrdered").val();
    localStorage.setItem("productItem", selectedunit);
    let selectedProductName = $(target).closest("tr").find(".lineProductName").val();
    localStorage.setItem("selectedProductName", selectedProductName);

    let productService = new ProductService();
    const templateObject = Template.instance();
    const InvoiceData = templateObject.invoicerecord.get();
    let existProduct = false;
    if(parseInt(selectedShipped) > 0){
      InvoiceData.LineItems.forEach(async (element) => {
        if (element.item == selectedProductName) {
          existProduct = true;
        }
      });
      if (!existProduct) {
        if (selectedProductName == "") {
          swal("You have to select Product.", "", "info");
          event.preventDefault();
          return false;
        } else {
          getVS1Data("TProductQtyList").then(function (dataObject) {
            if (dataObject.length == 0) {
              productService.getProductStatus(selectedProductName).then(async function (data) {
                if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                  var buttons = $("<div>")
                  .append($('<button id="trackSN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Serial Number</button>'))
                  .append($('<button id="trackLN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Lot Number</button>'))
                  .append($('<button id="trackCancel" class="swal2-styled" style="background-color: rgb(170, 170, 170);">No</button>'));
                  swal({
                    title: 'This Product "' + selectedProductName + '" does not currently track Serial Numbers, Lot Numbers or Bin Locations, Do You Wish To Add that Ability.',
                    type: "warning",
                    showCancelButton: false,
                    showConfirmButton: false,
                    html: buttons,
                    onOpen: function (dObj) {
                      $('#trackSN').on('click',function () {
                        objDetails = {
                          type: "TProductVS1",
                          fields: {
                            ID: parseInt(data.tproductqtylist[i].PARTSID),
                            Active: true,
                            SNTracking: "true",
                            Batch: "false",
                          },
                        };

                        productService.saveProductVS1(objDetails)
                        .then(async function (objDetails) {
                          sideBarService.getProductListVS1("All", 0)
                            .then(async function (dataReload) {
                              await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                              swal.close();
                              $(target).click();
                            })
                            .catch(function (err) {
                            });
                        })
                        .catch(function (err) {
                          swal({
                            title: "Oooops...",
                            text: err,
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                          }).then((result) => {
                            if (result.value) {
                              // Meteor._reload.reload();
                            } else if (result.dismiss === "cancel") {
                            }
                          });
                        });
                      });
                      $('#trackLN').on('click',function () {
                        swal.close();
                        objDetails = {
                          type: "TProductVS1",
                          fields: {
                            ID: parseInt(data.tproductqtylist[i].PARTSID),
                            Active: true,
                            SNTracking: "false",
                            Batch: "true",
                          },
                        };

                        productService.saveProductVS1(objDetails)
                        .then(async function (objDetails) {
                          sideBarService.getProductListVS1("All", 0)
                            .then(async function (dataReload) {
                              await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                              swal.close();
                              $(target).click();
                            })
                            .catch(function (err) {
                            });
                        })
                        .catch(function (err) {
                          swal({
                            title: "Oooops...",
                            text: err,
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                          }).then((result) => {
                            if (result.value) {
                              // Meteor._reload.reload();
                            } else if (result.dismiss === "cancel") {
                            }
                          });
                        });
                      });
                      $('#trackCancel').on('click',function () {
                          swal.close();
                      });
                    }
                  });
                } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                  let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                  if(selectedLot != undefined && selectedLot != ""){
                    shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                  }
                  else{
                    shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                  }
                  setTimeout(function () {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $("#availableLotNumberModal").attr("data-row", row + 1);
                    $("#availableLotNumberModal").modal("show");
                  }, 200);
                } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                  let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                  if(selectedSN != undefined && selectedSN != ""){
                    shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                  }
                  else{
                    shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                  }
                  setTimeout(function () {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $("#availableSerialNumberModal").attr("data-row", row + 1);
                    $('#availableSerialNumberModal').modal('show');
                    if(data.tproductvs1[0].CUSTFLD13 == 'true'){
                      $("#availableSerialNumberModal .btnSNCreate").show();
                    }
                    else{
                      $("#availableSerialNumberModal .btnSNCreate").hide();
                    }
                  }, 200);
                }
              });
            }
            else{
              let data = JSON.parse(dataObject[0].data);
              for (let i = 0; i < data.tproductqtylist.length; i++) {
                if(data.tproductqtylist[i].ProductName == selectedProductName){
                  if (data.tproductqtylist[i].batch == false && data.tproductqtylist[i].SNTracking == false) {
                    var buttons = $("<div>")
                    .append($('<button id="trackSN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Serial Number</button>'))
                    .append($('<button id="trackLN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Lot Number</button>'))
                    .append($('<button id="trackCancel" class="swal2-styled" style="background-color: rgb(170, 170, 170);">No</button>'));
                    swal({
                      title: 'This Product "' + selectedProductName + '" does not currently track Serial Numbers, Lot Numbers or Bin Locations, Do You Wish To Add that Ability.',
                      type: "warning",
                      showCancelButton: false,
                      showConfirmButton: false,
                      html: buttons,
                      onOpen: function (dObj) {
                        $('#trackSN').on('click',function () {
                          objDetails = {
                            type: "TProductVS1",
                            fields: {
                              ID: parseInt(data.tproductqtylist[i].PARTSID),
                              Active: true,
                              SNTracking: "true",
                              Batch: "false",
                            },
                          };

                          productService.saveProductVS1(objDetails)
                          .then(async function (objDetails) {
                            sideBarService.getProductListVS1("All", 0)
                              .then(async function (dataReload) {
                                await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                                swal.close();
                                $(target).click();
                              })
                              .catch(function (err) {
                              });
                          })
                          .catch(function (err) {
                            swal({
                              title: "Oooops...",
                              text: err,
                              type: "error",
                              showCancelButton: false,
                              confirmButtonText: "Try Again",
                            }).then((result) => {
                              if (result.value) {
                                // Meteor._reload.reload();
                              } else if (result.dismiss === "cancel") {
                              }
                            });
                          });
                        });
                        $('#trackLN').on('click',function () {
                          swal.close();
                          objDetails = {
                            type: "TProductVS1",
                            fields: {
                              ID: parseInt(data.tproductqtylist[i].PARTSID),
                              Active: true,
                              SNTracking: "false",
                              Batch: "true",
                            },
                          };

                          productService.saveProductVS1(objDetails)
                          .then(async function (objDetails) {
                            sideBarService.getProductListVS1("All", 0)
                              .then(async function (dataReload) {
                                await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                                swal.close();
                                $(target).click();
                              })
                              .catch(function (err) {
                              });
                          })
                          .catch(function (err) {
                            swal({
                              title: "Oooops...",
                              text: err,
                              type: "error",
                              showCancelButton: false,
                              confirmButtonText: "Try Again",
                            }).then((result) => {
                              if (result.value) {
                                // Meteor._reload.reload();
                              } else if (result.dismiss === "cancel") {
                              }
                            });
                          });
                        });
                        $('#trackCancel').on('click',function () {
                            swal.close();
                        });
                      }
                    });
                  } else if (data.tproductqtylist[i].batch == true && data.tproductqtylist[i].SNTracking == false) {
                    let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                    if(selectedLot != undefined && selectedLot != ""){
                      shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                    }
                    else{
                      shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                    }
                    setTimeout(function () {
                      var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                      $("#availableLotNumberModal").attr("data-row", row + 1);
                      $("#availableLotNumberModal").modal("show");
                    }, 200);
                  } else if (data.tproductqtylist[i].batch == false && data.tproductqtylist[i].SNTracking == true) {
                    let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                    if(selectedSN != undefined && selectedSN != ""){
                      shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                    }
                    else{
                      shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                    }
                    setTimeout(function () {
                      var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                      $("#availableSerialNumberModal").attr("data-row", row + 1);
                      $('#availableSerialNumberModal').modal('show');
                      if(data.tproductqtylist[i].CUSTFLD13 == 'true'){
                        $("#availableSerialNumberModal .btnSNCreate").show();
                      }
                      else{
                        $("#availableSerialNumberModal .btnSNCreate").hide();
                      }
                    }, 200);
                  }
                }
              }
            }
          }).catch(function (err) {
            productService.getProductStatus(selectedProductName).then(async function (data) {
              if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                var buttons = $("<div>")
                .append($('<button id="trackSN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Serial Number</button>'))
                .append($('<button id="trackLN" class="swal2-styled" style="background-color: rgb(48, 133, 214); border-left-color: rgb(48, 133, 214); border-right-color: rgb(48, 133, 214);">Track Lot Number</button>'))
                .append($('<button id="trackCancel" class="swal2-styled" style="background-color: rgb(170, 170, 170);">No</button>'));
                swal({
                  title: 'This Product "' + selectedProductName + '" does not currently track Serial Numbers, Lot Numbers or Bin Locations, Do You Wish To Add that Ability.',
                  type: "warning",
                  showCancelButton: false,
                  showConfirmButton: false,
                  html: buttons,
                  onOpen: function (dObj) {
                    $('#trackSN').on('click',function () {
                      objDetails = {
                        type: "TProductVS1",
                        fields: {
                          ID: parseInt(data.tproductqtylist[i].PARTSID),
                          Active: true,
                          SNTracking: "true",
                          Batch: "false",
                        },
                      };

                      productService.saveProductVS1(objDetails)
                      .then(async function (objDetails) {
                        sideBarService.getProductListVS1("All", 0)
                          .then(async function (dataReload) {
                            await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                            swal.close();
                            $(target).click();
                          })
                          .catch(function (err) {
                          });
                      })
                      .catch(function (err) {
                        swal({
                          title: "Oooops...",
                          text: err,
                          type: "error",
                          showCancelButton: false,
                          confirmButtonText: "Try Again",
                        }).then((result) => {
                          if (result.value) {
                            // Meteor._reload.reload();
                          } else if (result.dismiss === "cancel") {
                          }
                        });
                      });
                    });
                    $('#trackLN').on('click',function () {
                      swal.close();
                      objDetails = {
                        type: "TProductVS1",
                        fields: {
                          ID: parseInt(data.tproductqtylist[i].PARTSID),
                          Active: true,
                          SNTracking: "false",
                          Batch: "true",
                        },
                      };

                      productService.saveProductVS1(objDetails)
                      .then(async function (objDetails) {
                        sideBarService.getProductListVS1("All", 0)
                          .then(async function (dataReload) {
                            await addVS1Data("TProductQtyList", JSON.stringify(dataReload));
                            swal.close();
                            $(target).click();
                          })
                          .catch(function (err) {
                          });
                      })
                      .catch(function (err) {
                        swal({
                          title: "Oooops...",
                          text: err,
                          type: "error",
                          showCancelButton: false,
                          confirmButtonText: "Try Again",
                        }).then((result) => {
                          if (result.value) {
                            // Meteor._reload.reload();
                          } else if (result.dismiss === "cancel") {
                          }
                        });
                      });
                    });
                    $('#trackCancel').on('click',function () {
                        swal.close();
                    });
                  }
                });
              } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                if(selectedLot != undefined && selectedLot != ""){
                  shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                }
                else{
                  shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                }
                setTimeout(function () {
                  var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                  $("#availableLotNumberModal").attr("data-row", row + 1);
                  $("#availableLotNumberModal").modal("show");
                }, 200);
              } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                if(selectedSN != undefined && selectedSN != ""){
                  shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                }
                else{
                  shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                }
                setTimeout(function () {
                  var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                  $("#availableSerialNumberModal").attr("data-row", row + 1);
                  $('#availableSerialNumberModal').modal('show');
                  if(data.tproductvs1[0].CUSTFLD13 == 'true'){
                    $("#availableSerialNumberModal .btnSNCreate").show();
                  }
                  else{
                    $("#availableSerialNumberModal .btnSNCreate").hide();
                  }
                }, 200);
              }
            });
          });
        }
      }
    }
  },
  "click .btnSNCreate": function (event) {
    // $("#availableSerialNumberModal").modal("hide");
    // $("#serialNumberModal").modal("show");

    let tokenid = "random";
    var rowData = `<tr class="dnd-moved checkRowSelected" id="${tokenid}">
            <td class="colChkBox pointer" style="width:10%!important;">
                <div class="custom-control custom-switch chkBox pointer chkServiceCard" style="width:15px;">
                    <input name="pointer" class="custom-control-input chkBox pointer chkServiceCard" type="checkbox" id="formCheck-${tokenid}" checked>
                    <label class="custom-control-label chkBox pointer" for="formCheck-${tokenid}"></label>
                </div>
            </td>
            <td class="colID hiddenColumn dtr-control" tabindex="0">
                ${tokenid}
            </td>
            <td class="colSN" contenteditable="true">Random</td>
        </tr>`;

    $("#tblAvailableSNCheckbox tbody").prepend(rowData);
  },

  'change #sltCurrency': (e, ui) => {
    if ($("#sltCurrency").val() && $("#sltCurrency").val() != defaultCurrencyCode) {
      $(".foreign-currency-js").css("display", "block");
      ui.isForeignEnabled.set(true);
      FxGlobalFunctions.toggleVisbilityOfValuesToConvert(true);
    } else {
      $(".foreign-currency-js").css("display", "none");
      ui.isForeignEnabled.set(false);
      FxGlobalFunctions.toggleVisbilityOfValuesToConvert(false);
    }
  },

  'change .exchange-rate-js, change input.lineUnitPrice': (e, ui) => {
    FxGlobalFunctions.convertToForeignEveryFieldsInTableId("#tblInvoiceLine", new UtilityService());
  },

  // "click #printModal .btn-check-template": function (event) {
  //   const template = $(event.target).data('template');
  //   const templateObject = Template.instance()
  //   // $("#" + checkboxID).trigger("click");
  //   templateObject.print(template)
  // },

  // "click .printConfirm": async function (event) {
  //   const checkedPrintOptions = $("#printModal").find(".chooseTemplateBtn:checked")
  //   // if(checkedPrintOptions.length == 0){
  //   //   return;
  //   // }
  //   playPrintAudio();
  //   const templateObject = Template.instance();
  //   templateObject.print()
  // },

});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});

export const convertToForeignCurrencyAllFieldsInTheTable = (tableId) => {

}
