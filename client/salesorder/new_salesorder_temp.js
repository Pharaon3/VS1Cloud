import { SalesBoardService } from '../js/sales-service';
import { PurchaseBoardService } from '../js/purchase-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { UtilityService } from "../utility-service";
import { ProductService } from "../product/product-service";
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import { Random } from 'meteor/random';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import { ContactService } from "../contacts/contact-service";
import { TaxRateService } from "../settings/settings-service";
import LoadingOverlay from '../LoadingOverlay';
import { saveCurrencyHistory } from '../packages/currency/CurrencyWidget';
import { convertToForeignAmount } from '../payments/paymentcard/supplierPaymentcard';
import { getCurrentCurrencySymbol } from '../popUps/currnecypopup';
import FxGlobalFunctions from '../packages/currency/FxGlobalFunctions';
import CachedHttp from '../lib/global/CachedHttp';
import erpObject from '../lib/global/erp-objects';
import GlobalFunctions from '../GlobalFunctions';
import { getDayNumber } from "../lib/utiles/dateUtils";
import { foreignCols } from '../vs1_templates/transaction_temp/transaction_line';
import { Template } from 'meteor/templating';
import '../salesorder/frm_salesorder_temp.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

const sideBarService = new SideBarService();
const utilityService = new UtilityService();
const productService = new ProductService();
const salesService = new SalesBoardService();
const contactService = new ContactService();
const taxRateService = new TaxRateService();
const initialDatatableLoad = 10
let times = 0;
let clickedInput = "";
var template_list = [
  "Sales Order",
  "Delivery Docket",
];
var noHasTotals = ["Customer Payment", "Customer Statement", "Supplier Payment", "Statement", "Delivery Docket", "Journal Entry", "Deposit"];

let defaultCurrencyCode = CountryAbbr;



function generateHtmlMailBody(ID, stringQuery) {
  let erpInvoiceId = ID;
  let mailFromName = localStorage.getItem('vs1companyName');
  let emailDueDate = $("#dtDueDate").val();
  let customerBillingAddress = $('#txabillingAddress').val();
  let customerTerms = $('.transheader > #sltTerms_fromtransactionheader').val();
  let customerSubtotal = $('#subtotal_total').html();
  let customerTax = $('#subtotal_tax').html();
  let customerNett = $('#subtotal_nett').html();
  let customerTotal = $('#grandTotal').html();
  let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
  let customerEmailName = $('#edtCustomerName').val();
  let checkEmailData = $('#edtCustomerEmail').val();
  let grandtotal = $('#grandTotal').html();
  let mailSubject = 'Sales Order ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;

  '<table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate;mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">' +
    '        <tr>' +
    '            <td class="container" style="display: block; margin: 0 auto !important; max-width: 650px; padding: 10px; width: 650px;">' +
    '                <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 650px; padding: 10px;">' +
    '                    <table class="main">' +
    '                        <tr>' +
    '                            <td class="wrapper">' +
    '                                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">' +
    '                                    <tr>' +
    '                                        <td class="content-block" style="text-align: center; letter-spacing: 2px;">' +
    '                                            <span class="doc-details" style="color: #999999; font-size: 12px; text-align: center; margin: 0 auto; text-transform: uppercase;">Sales Order No. ' + erpInvoiceId + ' Details</span>' +
    '                                        </td>' +
    '                                    </tr>' +
    '                                    <tr style="height: 16px;"></tr>' +
    '                                    <tr>' +
    '                                        <td>' +
    '                                            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%;" />' +
    '                                        </td>' +
    '                                    </tr>' +
    '                                    <tr style="height: 48px;"></tr>' +
    '                                    <tr style="background-color: rgba(0, 163, 211, 0.5); ">' +
    '                                        <td style="text-align: center;padding: 32px 0px 16px 0px;">' +
    '                                            <p style="font-weight: 700; font-size: 36px; color: #363a3b; margin-bottom: 6px; margin-top: 6px;">' + grandtotal + '</p>' +
    '                                            <table border="0" cellpadding="0" cellspacing="0" style="box-sizing: border-box; width: 100%;">' +
    '                                                <tbody>' +
    '                                                    <tr>' +
    '                                                        <td align="center" style="padding-bottom: 15px;">' +
    '                                                            <table border="0" cellpadding="0" cellspacing="0" style="width: auto;">' +
    '                                                                <tbody>' +
    '                                                                    <tr>' +
    '                                                                        <td> <a href="https://www.depot.vs1cloud.com/stripe/' + stringQuery + '" style="border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none;' +
    '                                                                        text-transform: capitalize; background-color: #363a3b; border-color: #363a3b; color: #ffffff;" target="">Pay Now</a> </td>' +
    '                                                                    </tr>' +
    '                                                                </tbody>' +
    '                                                            </table>' +
    '                                                        </td>' +
    '                                                    </tr>' +
    '                                                </tbody>' +
    '                                            </table>' +
    '                                            <p style="margin-top: 0px;">Powered by VS1 Cloud</p>' +
    '                                        </td>' +
    '                                    </tr>' +
    '                                    <tr>' +
    '                                        <td class="content-block" style="padding: 16px 32px;">' +
    '                                            <p style="font-size: 18px;">Dear ' + customerEmailName + ',</p>' +
    '                                            <p style="font-size: 18px; margin: 34px 0px;">Here\'s your invoice! We appreciate your prompt payment.</p>' +
    '                                            <p style="font-size: 18px; margin-bottom: 8px;">Thanks for your business!</p>' +
    '                                            <p style="font-size: 18px;">' + mailFromName + '</p>' +
    '                                        </td>' +
    '                                    </tr>' +
    '                                    <tr style="background-color: #ededed;">' +
    '                                        <td class="content-block" style="padding: 16px 32px;">' +
    '                                            <div style="width: 100%; padding: 16px 0px;">' +
    '                                                <div style="width: 50%; float: left;">' +
    '                                                    <p style="font-size: 18px;">Invoice To</p>' +
    '                                                </div>' +
    '                                                <div style="width: 50%; float: right;">' +
    '                                                    <p style="margin-bottom: 0px;font-size: 16px;">' + customerEmailName + '</p>' +
    '                                                    <p style="margin-bottom: 0px;font-size: 16px;">' + customerBillingAddress + '</p>' +
    '                                                </div>' +
    '                                            </div>' +
    '                                        </td>' +
    '                                    </tr>' +
    '                                    <tr style="background-color: #ededed;">' +
    '                                        <td class="content-block" style="padding: 16px 32px;">' +
    '                                            <hr style=" border-top: 1px dotted #363a3b;" />' +
    '                                            <div style="width: 100%; padding: 16px 0px;">' +
    '                                                <div style="width: 50%; float: left;">' +
    '                                                    <p style="font-size: 18px;">Terms</p>' +
    '                                                </div>' +
    '                                                <div style="width: 50%; float: right;">' +
    '                                                    <p style="font-size: 16px;">' + customerTerms + '</p>' +
    '                                                </div>' +
    '                                            </div>' +
    '                                        </td>' +
    '                                    </tr>' +
    '                                    <tr>' +
    '                                        <td class="content-block" style="padding: 16px 32px;">' +
    '                                            <hr style=" border-top: 1px dotted #363a3b;" />' +
    '                                            <div style="width: 100%; float: right; padding-top: 24px;">' +
    '                                                <div style="width: 50%; float: left;">' +
    '                                                    <p style="font-size: 18px; font-weight: 600;">Subtotal</p>' +
    '                                                    <p style="font-size: 18px; font-weight: 600;">Tax</p>' +
    '                                                    <p style="font-size: 18px; font-weight: 600;">Nett</p>' +
    '                                                    <p style="font-size: 18px; font-weight: 600;">Balance Due</p>' +
    '                                                </div>' +
    '                                                <div style="width: 50%; float: right; text-align: right;">' +
    '                                                    <p style="font-size: 18px; font-weight: 600;">' + customerSubtotal + '</p>' +
    '                                                    <p style="font-size: 18px; font-weight: 600;">' + customerTax + '</p>' +
    '                                                    <p style="font-size: 18px; font-weight: 600;">' + customerNett + '</p>' +
    '                                                    <p style="font-size: 18px; font-weight: 600;">' + customerTotal + '</p>' +
    '                                                </div>' +
    '                                            </div>' +
    '                                        </td>' +
    '                                    </tr>' +
    '                                    <tr>' +
    '                                        <td class="content-block" style="padding: 16px 32px; padding-top: 0px;">' +
    '                                            <hr style=" border-top: 1px dotted #363a3b;" />' +
    '                                            <table border="0" cellpadding="0" cellspacing="0" style="box-sizing: border-box; width: 100%;">' +
    '                                                <tbody>' +
    '                                                    <tr>' +
    '                                                        <td align="center">' +
    '                                                            <table border="0" cellpadding="0" cellspacing="0" style="width: auto;">' +
    '                                                                <tbody>' +
    '                                                                    <tr>' +
    '                                                                        <td> <a href="https://www.depot.vs1cloud.com/stripe/' + stringQuery + '" style="border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none;' +
    '                                                                        text-transform: capitalize; background-color: #363a3b; border-color: #363a3b; color: #ffffff;" target="">Pay Now</a> </td>' +
    '                                                                    </tr>' +
    '                                                                </tbody>' +
    '                                                            </table>' +
    '                                                        </td>' +
    '                                                    </tr>' +
    '                                                </tbody>' +
    '                                            </table>' +
    '                                        </td>' +
    '                                    </tr>' +
    '                                    <tr>' +
    '                                        <td class="content-block" style="padding: 16px 32px;">' +
    '                                            <p style="font-size: 15px; color: #666666;">If you receive an email that seems fraudulent, please check with the business owner before paying.</p>' +
    '                                        </td>' +
    '                                    </tr>' +
    '                                    <tr>' +
    '                                        <td>' +
    '                                            <table border="0" cellpadding="0" cellspacing="0" style="box-sizing: border-box; width: 100%;">' +
    '                                                <tbody>' +
    '                                                    <tr>' +
    '                                                        <td align="center">' +
    '                                                            <table border="0" cellpadding="0" cellspacing="0" style="width: auto;">' +
    '                                                                <tbody>' +
    '                                                                    <tr>' +
    '                                                                        <td> <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%; width: 20%; margin: 0; padding: 12px 25px; display: inline-block;" /> </td>' +
    '                                                                    </tr>' +
    '                                                                </tbody>' +
    '                                                            </table>' +
    '                                                        </td>' +
    '                                                    </tr>' +
    '                                                </tbody>' +
    '                                            </table>' +
    '                                        </td>' +
    '                                    </tr>' +
    '                                </table>' +
    '                            </td>' +
    '                        </tr>' +
    '                    </table>' +
    '                    <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">' +
    '                        <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">' +
    '                            <tr>' +
    '                                <td class="content-block" style="color: #999999; font-size: 12px; text-align: center;">' +
    '                                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">' + mailFromName + '</span>' +
    '                                    <br>' +
    '                                    <a href="mailto:' + mailFrom + '" style="color: #999999; font-size: 12px; text-align: center;">Contact Us</a>' +
    '                                    <a href="https://vs1cloud.com/downloads/VS1%20Privacy%20ZA.pdf" style="color: #999999; font-size: 12px; text-align: center;">Privacy</a>' +
    '                                    <a href="https://vs1cloud.com/downloads/VS1%20Terms%20ZA.pdf" style="color: #999999; font-size: 12px; text-align: center;">Terms of Service</a>' +
    '                                </td>' +
    '                            </tr>' +
    '                        </table>' +
    '                    </div>' +
    '                </div>' +
    '            </td>' +
    '        </tr>' +
    '    </table>';
}

Template.new_salesorder_temp.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.isForeignEnabled = new ReactiveVar(false);
  templateObject.records = new ReactiveVar();
  templateObject.CleintName = new ReactiveVar();
  templateObject.Department = new ReactiveVar();
  templateObject.Date = new ReactiveVar();
  templateObject.DueDate = new ReactiveVar();
  templateObject.SalesOrderNo = new ReactiveVar();
  templateObject.RefNo = new ReactiveVar();
  templateObject.Branding = new ReactiveVar();
  templateObject.Currency = new ReactiveVar();
  templateObject.Total = new ReactiveVar();
  templateObject.Subtotal = new ReactiveVar();
  templateObject.TotalTax = new ReactiveVar();
  templateObject.salesorderrecord = new ReactiveVar({});
  templateObject.taxrateobj = new ReactiveVar();
  templateObject.Accounts = new ReactiveVar([]);
  templateObject.SalesOrderId = new ReactiveVar();
  // templateObject.selectedCurrency = new ReactiveVar([]);
  // templateObject.inputSelectedCurrency = new ReactiveVar([]);
  templateObject.currencySymbol = new ReactiveVar([]);
  templateObject.deptrecords = new ReactiveVar();
  templateObject.termrecords = new ReactiveVar();
  templateObject.clientrecords = new ReactiveVar([]);
  templateObject.taxraterecords = new ReactiveVar([]);
  templateObject.taxcodes = new ReactiveVar([]);
  templateObject.accountID = new ReactiveVar();
  templateObject.stripe_fee_method = new ReactiveVar();
  templateObject.uploadedFile = new ReactiveVar();
  templateObject.uploadedFiles = new ReactiveVar([]);
  templateObject.attachmentCount = new ReactiveVar();
  templateObject.address = new ReactiveVar();
  templateObject.abn = new ReactiveVar();
  templateObject.referenceNumber = new ReactiveVar();
  templateObject.statusrecords = new ReactiveVar([]);
  templateObject.record = new ReactiveVar({});
  templateObject.productextrasellrecords = new ReactiveVar([]);
  templateObject.defaultsaleterm = new ReactiveVar();
  templateObject.subtaxcodes = new ReactiveVar([]);
  templateObject.abletomakeworkorder = new ReactiveVar(false);
  templateObject.saleOrders = new ReactiveVar([]);
  templateObject.saleOrder = new ReactiveVar();
  templateObject.products = new ReactiveVar([]);
  templateObject.hasFollow = new ReactiveVar(false);
  templateObject.customerRecord = new ReactiveVar();

  templateObject.currencyData = new ReactiveVar();
  templateObject.headerfields = new ReactiveVar();
  templateObject.headerbuttons = new ReactiveVar();
  templateObject.tranasctionfooterfields = new ReactiveVar();
  templateObject.printOptions = new ReactiveVar();
  templateObject.temporaryfiles = new ReactiveVar([]);
  templateObject.printfields = new ReactiveVar();

  let printfields = {
    "Product Name": ["25", "left"],
    "Description": ["30", "left"],
    "Qty": ["7", "right"],
    "Unit Price": ["15", "right"],
    "Tax": ["7", "right"],
    "Amount": ["15", "right"],
  }

  templateObject.printfields.set(printfields)

  let options = [{ title: 'Purchase Orders', number: 1, nameFieldID: 'Purchase_orders_1' }, { title: 'Purchase_Orders', number: 2, nameFieldID: 'Purchase_Orders_2' }, { title: 'Purchase_Orders', number: 3, nameFieldID: 'Purchase_Orders_3' },
  { title: 'Email', number: 1, nameFieldID: 'Email_1' }, { title: 'Email', number: 2, nameFieldID: 'Email_2' }, { title: 'Email', number: 3, nameFieldID: 'Email_3' },
  { title: 'SMS', number: 1, nameFieldID: 'SMS_1' }, { title: 'SMS', number: 2, nameFieldID: 'SMS_2' }, { title: 'SMS', number: 3, nameFieldID: 'SMS_3' },
  { title: 'Preview', number: 1, nameFieldID: 'Preview_1' }, { title: 'Preview', number: 2, nameFieldID: 'Preview_2' }, { title: 'Preview', number: 3, nameFieldID: 'Preview_3' },
  ]

  templateObject.printOptions.set(options)

  // Methods

  function formatDate (date) {
    return moment(date).format('DD/MM/YYYY');
  }

  let transactionheaderfields = [
    { label: "Sales Date", type: "date", readonly: false, value: formatDate(new Date()), divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader", },
    { label: "P.O.Number", type: 'default', id: 'ponumber', value: '', readonly: false, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
    { label: 'Terms', type: 'search', id: 'sltTerms', listModalId: 'termsList_modal', listModalTemp: 'termlistpop', colName: 'colName', editModalId: 'newTerms_modal', editModalTemp: 'newtermspop', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
    { label: 'Status', type: 'search', id: 'sltStatus', listModalId: 'statusPop_modal', listModalTemp: 'statuspop', colName: 'colStatusName', editModalId: 'newStatusPop_modal', editModalTemp: 'newstatuspop', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
    { label: 'Reference', type: 'defailt', id: 'edtRef', value: '', readonly: false, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader", },
  ]
  templateObject.headerfields.set(transactionheaderfields);

  let transactionheaderbuttons = [
    { label: "Pay Now", class: 'btnTransaction payNow', id: 'btnPayNow', bsColor: 'success', icon: 'dollar-sign' },
    { label: "Payment", class: 'btnTransaction btnMakePayment', id: 'btnPayment', bsColor: 'primary' },
    { label: "Copy Sales Order", class: 'btnTransaction copyInvoice', id: 'btnCopyInvoice', bsColor: 'primary' }
  ]
  templateObject.headerbuttons.set(transactionheaderbuttons)

  let transactionfooterfields = [
    { label: 'Comments', id: "txaComment", name: "txaComment", row: 6 },
    { label: 'Picking Instructions', id: "txapickmemo", name: "txapickmemo", row: 6 },
  ];

  templateObject.tranasctionfooterfields.set(transactionfooterfields);


  getVS1Data('TSalesOrderTemp').then(function(dataObject){
    if(dataObject.length == 0) {
      templateObject.temporaryfiles.set([]);
    } else {
      let data = JSON.parse(dataObject[0].data);
      let useData = data.tsalesordertemp;
      templateObject.temporaryfiles.set(useData)
    }
  }).catch(function(e){
    templateObject.temporaryfiles.set([])
  })

  templateObject.initialRecords = (data) => {

    LoadingOverlay.hide();
    let lineItems = [];
    let lineItemsTable = [];
    const lineItemObj = {
      lineID: Random.id(),
      item: '',
      description: '',
      quantity: '',
      unitPrice: 0,
      unitPriceInc: 0,
      TotalAmt: 0,
      TotalAmtInc: 0,
      taxRate: '',
      taxCode: '',
      curTotalAmt: 0,
      TaxTotal: 0,
      TaxRate: 0,
      weight: 1,
      weightUnit: 'KG',
      volume: 1,
      volumeUnit: 'CF'
    };
   
    lineItems.push(lineItemObj);
    const currentDate = new Date();
    const begunDate = moment(currentDate).format("DD/MM/YYYY");
    let salesorderrecord = {
      id: '',
      lid: 'New Sales Order',
      socustomer: '',
      salesOrderto: '',
      shipto: '',
      department: defaultDept || '',
      docnumber: '',
      custPONumber: '',
      saledate: begunDate,
      duedate: '',
      employeename: '',
      status: '',
      category: '',
      comments: '',
      pickmemo: '',
      ponumber: '',
      via: '',
      connote: '',
      reference: '',
      currency: '',
      branding: '',
      invoiceToDesc: '',
      shipToDesc: '',
      termsName: templateObject.defaultsaleterm.get() || '',
      Total: Currency + '' + 0.00,
      TotalDiscount: Currency + '' + 0.00,
      LineItems: lineItems,
      TotalTax: Currency + '' + 0.00,
      SubTotal: Currency + '' + 0.00,
      balanceDue: Currency + '' + 0.00,
      saleCustField1: '',
      saleCustField2: '',
      totalPaid: Currency + '' + 0.00,
      isConverted: false,
      showingDelivery: false,
      showingFx: false,
      showingSN: false
    };
    if (FlowRouter.current().queryParams.customerid) {
      // templateObject.getCustomerData(FlowRouter.current().queryParams.customerid);
    } else {
      $('#edtCustomerName').val('');
    }
    setTimeout(function () {
      $('.transheader > #sltDept_fromtransactionheader').val(defaultDept);
      $('.transheader > #sltTerms_fromtransactionheader').val(salesorderrecord.termsName);
      $('#edtCustfield_1').val(salesorderrecord.saleCustField1)
      $('#edtCustfield_2').val(salesorderrecord.saleCustField2)
      // templateObject.getLastSOData();
    }, 200);
    templateObject.salesorderrecord.set(salesorderrecord);
    // if (templateObject.salesorderrecord.get()) {
    //   Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblSalesOrderLine', function (error, result) {
    //     if (error) { } else {
    //       if (result) {
    //         for (let i = 0; i < result.customFields.length; i++) {
    //           let customcolumn = result.customFields;
    //           let columData = customcolumn[i].label;
    //           let columHeaderUpdate = customcolumn[i].thclass;
    //           let hiddenColumn = customcolumn[i].hidden;
    //           let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
    //           let columnWidth = customcolumn[i].width;
    //           $("" + columHeaderUpdate + "").html(columData);
    //           if (columnWidth != 0) {
    //             $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
    //           }
    //           if (hiddenColumn == true) {
    //             $("." + columnClass + "").addClass('hiddenColumn');
    //             $("." + columnClass + "").removeClass('showColumn');
    //           } else if (hiddenColumn == false) {
    //             $("." + columnClass + "").removeClass('hiddenColumn');
    //             $("." + columnClass + "").addClass('showColumn');
    //           }
    //         }
    //       }
    //     }
    //   });
    // }

    return salesorderrecord;
    
  }


  templateObject.setOneSalesordersData = (data) => {

    let lineItems = [];
    let lineItemsTable = [];
    let currencySymbol = Currency;
    let totalInc = currencySymbol + '' + data.fields.TotalAmountInc.toLocaleString(undefined, {
      minimumFractionDigits: 2
    });

    let totalDiscount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalDiscount).toLocaleString(undefined, {
      minimumFractionDigits: 2
    });

    let subTotal = currencySymbol + '' + data.fields.TotalAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2
    });
    let totalTax = currencySymbol + '' + data.fields.TotalTax.toLocaleString(undefined, {
      minimumFractionDigits: 2
    });
    let totalBalance = currencySymbol + '' + data.fields.TotalBalance.toLocaleString(undefined, {
      minimumFractionDigits: 2
    });
    let totalPaidAmount = currencySymbol + '' + data.fields.TotalPaid.toLocaleString(undefined, {
      minimumFractionDigits: 2
    });
    if (data.fields.Lines.length) {
      for (let i = 0; i < data.fields.Lines.length; i++) {
        let AmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2
        });
        let currencyAmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
        let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
        let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);

        let serialno = "";
        let lotno = "";
        let expirydate = "";
        if (data.fields.Lines[i].fields?.PQA?.fields?.PQASN != null) {
          for (let j = 0; j < data.fields.Lines[i].fields.PQA.fields.PQASN.length; j++) {
            serialno += (serialno == "") ? data.fields.Lines[i].fields.PQA.fields.PQASN[j].fields.SerialNumber : "," + data.fields.Lines[i].fields.PQA.fields.PQASN[j].fields.SerialNumber;
          }
        }
        if (data.fields.Lines[i].fields?.PQA?.fields?.PQABatch != null) {
          for (let j = 0; j < data.fields.Lines[i].fields.PQA.fields.PQABatch.length; j++) {
            lotno += (lotno == "") ? data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchNo : "," + data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchNo;
            let expirydateformat = data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate != '' ? moment(data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate).format("YYYY/MM/DD") : data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate;
            expirydate += (expirydate == "") ? expirydateformat : "," + expirydateformat;
          }
        }

        const lineItemObj = {
          lineID: Random.id(),
          id: data.fields.Lines[i].fields.ID || '',
          item: data.fields.Lines[i].fields.ProductName || '',
          description: data.fields.Lines[i].fields.ProductDescription || '',
          quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
          qtyordered: data.fields.Lines[i].fields.UOMOrderQty || 0,
          qtyshipped: data.fields.Lines[i].fields.UOMQtyShipped || 0,
          qtybo: data.fields.Lines[i].fields.UOMQtyBackOrder || 0,
          unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
          unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
          TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
          TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
          lineCost: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
            minimumFractionDigits: 2
          }) || 0,
          taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
          taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
          //TotalAmt: AmountGbp || 0,
          curTotalAmt: currencyAmountGbp || currencySymbol + '0',
          TaxTotal: TaxTotalGbp || 0,
          TaxRate: TaxRateGbp || 0,
          DiscountPercent: data.fields.Lines[i].fields.DiscountPercent || 0,
          pqaseriallotdata: data.fields.Lines[i].fields.PQA || '',
          serialnumbers: serialno,
          lotnumbers: lotno,
          expirydates: expirydate,
          weight: data.fields.Lines[i].fields.SalesLinesCustField7 || 1,
          weightUnit: data.fields.Lines[i].fields.SalesLinesCustField8 || 'KG',
          volume: data.fields.Lines[i].fields.SalesLinesCustField9 || 1,
          volumeUnit: data.fields.Lines[i].fields.SalesLinesCustField10 || "CF"
        };
        // var dataListTable = [
        //   data.fields.Lines[i].fields.ProductName || '',
        //   data.fields.Lines[i].fields.ProductDescription || '',
        //   "<div contenteditable='true' class='qty'>" + '' + data.fields.Lines[i].fields.UOMOrderQty + '' + "</div>" || "<div>" + '' + 0 + '' + "</div>",
        //   "<div>" + '' + currencySymbol + '' + data.fields.Lines[i].fields.LinePrice.toFixed(2) + '' + "</div>" || currencySymbol + '' + 0.00,
        //   data.fields.Lines[i].fields.LineTaxCode || '',
        //   AmountGbp || currencySymbol + '' + 0.00,
        //   '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
        // ];
        // lineItemsTable.push(dataListTable);
        lineItems.push(lineItemObj);
      }
    } else {
      let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
      let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines.fields.LineTaxTotal);
      let TaxRateGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxRate;

      let serialno = "";
      let lotno = "";
      let expirydate = "";
      if (data.fields.Lines.fields?.PQA?.fields?.PQASN != null) {
        for (let j = 0; j < data.fields.Lines.fields.PQA.fields.PQASN.length; j++) {
          serialno += (serialno == "") ? data.fields.Lines.fields.PQA.fields.PQASN[j].fields.SerialNumber : "," + data.fields.Lines.fields.PQA.fields.PQASN[j].fields.SerialNumber;
        }
      }
      if (data.fields.Lines.fields?.PQA?.fields?.PQABatch != null) {
        for (let j = 0; j < data.fields.Lines.fields.PQA.fields.PQABatch.length; j++) {
          lotno += (lotno == "") ? data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchNo : "," + data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchNo;
          let expirydateformat = data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate != '' ? moment(data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate).format("YYYY/MM/DD") : data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate;
          expirydate += (expirydate == "") ? expirydateformat : "," + expirydateformat;
        }
      }

      const lineItemObj = {
        lineID: Random.id(),
        id: data.fields.Lines.fields.ID || '',
        description: data.fields.Lines.fields.ProductDescription || '',
        quantity: data.fields.Lines.fields.UOMOrderQty || 0,
        unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
        unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
        TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
        TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
        lineCost: data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
          minimumFractionDigits: 2
        }) || 0,
        taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
        taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
        curTotalAmt: currencyAmountGbp || currencySymbol + '0',
        TaxTotal: TaxTotalGbp || 0,
        TaxRate: TaxRateGbp || 0,
        pqaseriallotdata: data.fields.Lines[i].fields.PQA || '',
        serialnumbers: serialno,
        lotnumbers: lotno,
        expirydates: expirydate,
        weight: data.fields.Lines[i].fields.SalesLinesCustField7 || 1,
        weightUnit: data.fields.Lines[i].fields.SalesLinesCustField8 || 'KG',
        volume: data.fields.Lines[i].fields.SalesLinesCustField9 || 1,
        volumeUnit: data.fields.Lines[i].fields.SalesLinesCustField10 || "CF"
      };
      lineItems.push(lineItemObj);
    }
    let salesorderrecord = {
      id: data.fields.ID,
      lid: 'Edit Sales Order' + ' ' + data.fields.ID,
      socustomer: data.fields.CustomerName,
      salesOrderto: data.fields.InvoiceToDesc,
      shipto: data.fields.ShipToDesc,
      department: data.fields.SaleClassName,
      docnumber: data.fields.DocNumber,
      custPONumber: data.fields.CustPONumber,
      saledate: data.fields.SaleDate ? moment(data.fields.SaleDate).format('DD/MM/YYYY') : "",
      duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
      employeename: data.fields.EmployeeName,
      status: data.fields.SalesStatus,
      category: data.fields.SalesCategory,
      comments: data.fields.Comments,
      pickmemo: data.fields.PickMemo,
      ponumber: data.fields.CustPONumber,
      via: data.fields.Shipping,
      connote: data.fields.ConNote,
      reference: data.fields.ReferenceNo,
      currency: data.fields.ForeignExchangeCode,
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
      isConverted: data.fields.Converted,
      CustomerID: data.fields.CustomerID,
      ClientEmail: data.fields.ContactEmail,
      ClientName: data.fields.ClientName,
      isRepeated: data.fields.RepeatedFrom,
      showingDelivery: data.fields.SaleCustField9 == "true"?true: false,
      showingFx: data.fields.SaleCustField10 == "true"?true: false,
      showingSN: data.fields.SaleCustField8 == 'true'? true: false
    };

    $('#edtCustomerName').val(data.fields.CustomerName);
    templateObject.CleintName.set(data.fields.CustomerName);
    //$('#exchange_rate').val(data.fields.ForeignExchangeRate);
    $('.transheader > .sltCurrency').val(data.fields.ForeignExchangeCode);
    $('#exchange_rate').val(data.fields.ForeignExchangeRate);
    $('.transheader > #sltStatus_fromtransactionheader').val(data.fields.SalesStatus);
    $('.transheader > #sltTerms_fromtransactionheader').val(data.fields.TermsName);
    $('#sltDept').val(data.fields.SaleClassName);

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
    setTimeout(function () {
      const clientList = templateObject.clientrecords.get()
      if (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          if (clientList[i].customername == data.fields.CustomerName) {
            checkISCustLoad = true;
            salesorderrecord.firstname = clientList[i].firstname || '';
            salesorderrecord.lastname = clientList[i].lastname || '';
            templateObject.salesorderrecord.set(salesorderrecord);
            $('#edtCustomerEmail').val(clientList[i].customeremail);
            $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
            $('#edtCustomerName').attr('custid', clientList[i].customerid);
            $('#edtCustomerEmail').attr('customerfirstname', clientList[i].firstname);
            $('#edtCustomerEmail').attr('customerlastname', clientList[i].lastname);
            $('#customerType').text(clientList[i].clienttypename || 'Default');
            $('#customerDiscount').text(clientList[i].discount + '%' || 0 + '%');
            $('#edtCustomerUseType').val(clientList[i].clienttypename || 'Default');
            $('#edtCustomerUseDiscount').val(clientList[i].discount || 0);
          }
        }
      }

      if (!checkISCustLoad) {
        sideBarService.getCustomersDataByName(data.fields.CustomerName).then(function (dataClient) {
          for (var c = 0; c < dataClient.tcustomervs1.length; c++) {
            var customerrecordObj = {
              customerid: dataClient.tcustomervs1[c].Id || ' ',
              firstname: dataClient.tcustomervs1[c].FirstName || ' ',
              lastname: dataClient.tcustomervs1[c].LastName || ' ',
              customername: dataClient.tcustomervs1[c].ClientName || ' ',
              customeremail: dataClient.tcustomervs1[c].Email || ' ',
              street: dataClient.tcustomervs1[c].Street || ' ',
              street2: dataClient.tcustomervs1[c].Street2 || ' ',
              street3: dataClient.tcustomervs1[c].Street3 || ' ',
              suburb: dataClient.tcustomervs1[c].Suburb || ' ',
              statecode: dataClient.tcustomervs1[c].State + ' ' + dataClient.tcustomervs1[c].Postcode || ' ',
              country: dataClient.tcustomervs1[c].Country || ' ',
              termsName: dataClient.tcustomervs1[c].TermsName || '',
              taxCode: dataClient.tcustomervs1[c].TaxCodeName || 'E',
              clienttypename: dataClient.tcustomervs1[c].ClientTypeName || 'Default',
              discount: dataClient.tcustomervs1[c].Discount || 0
            };
            clientList.push(customerrecordObj);

            salesorderrecord.firstname = dataClient.tcustomervs1[c].FirstName || '';
            salesorderrecord.lastname = dataClient.tcustomervs1[c].LastName || '';
            $('#edtCustomerEmail').val(dataClient.tcustomervs1[c].Email);
            $('#edtCustomerEmail').attr('customerid', clientList[c].customerid);
            $('#edtCustomerName').attr('custid', dataClient.tcustomervs1[c].Id);
            $('#edtCustomerEmail').attr('customerfirstname', dataClient.tcustomervs1[c].FirstName);
            $('#edtCustomerEmail').attr('customerlastname', dataClient.tcustomervs1[c].LastName);
            $('#customerType').text(dataClient.tcustomervs1[c].ClientTypeName || 'Default');
            $('#customerDiscount').text(dataClient.tcustomervs1[c].Discount + '%' || 0 + '%');
            $('#edtCustomerUseType').val(dataClient.tcustomervs1[c].ClientTypeName || 'Default');
            $('#edtCustomerUseDiscount').val(dataClient.tcustomervs1[c].Discount || 0);
          }

          templateObject.clientrecords.set(clientList.sort(function (a, b) {
            if (a.customername == 'NA') {
              return 1;
            } else if (b.customername == 'NA') {
              return -1;
            }
            return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
          }));
        });
      }
    }, 100);

    templateObject.salesorderrecord.set(salesorderrecord);
    // templateObject.selectedCurrency.set(salesorderrecord.currency);
    // templateObject.inputSelectedCurrency.set(salesorderrecord.currency);
    setTimeout(() => {
      templateObject.checkAbleToMakeWorkOrder()
    }, 1000)
    // if (templateObject.salesorderrecord.get()) {

    //   Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblSalesOrderLine', function (error, result) {
    //     if (error) {

    //     } else {
    //       if (result) {
    //         for (let i = 0; i < result.customFields.length; i++) {
    //           let customcolumn = result.customFields;
    //           let columData = customcolumn[i].label;
    //           let columHeaderUpdate = customcolumn[i].thclass;
    //           let hiddenColumn = customcolumn[i].hidden;
    //           let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
    //           let columnWidth = customcolumn[i].width;

    //           $("" + columHeaderUpdate + "").html(columData);
    //           if (columnWidth != 0) {
    //             $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
    //           }

    //           if (hiddenColumn == true) {

    //             $("." + columnClass + "").addClass('hiddenColumn');
    //             $("." + columnClass + "").removeClass('showColumn');
    //           } else if (hiddenColumn == false) {
    //             $("." + columnClass + "").removeClass('hiddenColumn');
    //             $("." + columnClass + "").addClass('showColumn');

    //           }

    //         }
    //       }

    //     }
    //   });
    // }

    return {record: salesorderrecord, attachmentCount: templateObject.attachmentCount.get(), uploadedFiles: templateObject.uploadedFiles.get(), selectedCurrency: salesorderrecord.currency}
  }

  templateObject.saveSalesOrderData = function(data) {

    // event.preventDefault();
    // event.stopPropagation();
    playSaveAudio();
    let salesService = new SalesBoardService();
    let uploadedItems = templateObject.uploadedFiles.get();
    setTimeout(function () {
      saveCurrencyHistory();

      let stripe_id = templateObject.accountID.get();
      let stripe_fee_method = templateObject.stripe_fee_method.get();
      let customername = $('#edtCustomerName');
      let name = $('#edtCustomerEmail').attr('customerfirstname');
      let surname = $('#edtCustomerEmail').attr('customerlastname');

      let termname = $('.transheader > #sltTerms_fromtransactionheader').val() || '';
      if (termname === '') {
        swal('Terms has not been selected!', '', 'warning');
        // event.preventDefault();
        return false;
      }

      if (customername.val() === '') {
        swal('Customer has not been selected!', '', 'warning');
        // e.preventDefault();
      } else {
        LoadingOverlay.show();
        var splashLineArray = new Array();
        var erpGet = erpDb();
        let lineItemsForm = [];
        let lineItemObjForm = {};
        var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
        let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
        $('#tblSalesOrderLine > tbody > tr').each(function () {
          var lineID = this.id;
          let tdproduct = $('#' + lineID + " .lineProductName").val();
          let tddescription = $('#' + lineID + " .lineProductDesc").text();
          let tdQty = $('#' + lineID + " .lineQty").val();
          let tdunitprice = $('#' + lineID + " .colUnitPriceExChange").val();
          let tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || loggedTaxCodeSalesInc;
          let tdSerialNumber = $('#' + lineID + " .colSerialNo").attr('data-serialnumbers');
          let tdLotNumber = $('#' + lineID + " .colSerialNo").attr('data-lotnumbers');
          let tdExpiryDates = $('#' + lineID + " .colSerialNo").attr('data-expirydates');

          if (tdproduct != "") {

            lineItemObjForm = {
              type: "TSalesOrderLine",
              fields: {
                ProductName: tdproduct || '',
                ProductDescription: tddescription || '',
                UOMQtySold: parseFloat(tdQty) || 0,
                UOMQtyShipped: parseFloat(tdQty) || 0,
                LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                Headershipdate: saleDate,
                LineTaxCode: tdtaxCode || '',
                DiscountPercent: parseFloat($('#' + lineID + " .lineDiscount").text()) || 0
              }
            };

            // Feature/ser-lot number tracking: Save Serial Numbers
            if (tdSerialNumber) {
              const serialNumbers = tdSerialNumber.split(',');
              let tpqaList = [];
              for (let i = 0; i < serialNumbers.length; i++) {
                const tpqaObject = {
                  type: "TPQASN",
                  fields: {
                    Active: true,
                    Qty: 1,
                    SerialNumber: serialNumbers[i],
                  }
                };
                tpqaList.push(tpqaObject);
              }
              const pqaObject = {
                type: "TPQA",
                fields: {
                  Active: true,
                  PQASN: tpqaList,
                  Qty: serialNumbers.length,
                }
              }
              lineItemObjForm.fields.PQA = pqaObject;
            }

            // Feature/ser-lot number tracking: Save Lot Number
            if (tdLotNumber) {
              const lotNumbers = tdLotNumber.split(',');
              const expiryDates = tdExpiryDates.split(',');
              let tpqaList = [];
              for (let i = 0; i < lotNumbers.length; i++) {
                const dates = expiryDates[i].split('/');
                const tpqaObject = {
                  type: "PQABatch",
                  fields: {
                    Active: true,
                    BatchExpiryDate: new Date(parseInt(dates[2]), parseInt(dates[1]) - 1, parseInt(dates[0])).toISOString(),
                    Qty: 1,
                    BatchNo: lotNumbers[i],
                  }
                };
                tpqaList.push(tpqaObject);
              }
              const pqaObject = {
                type: "TPQA",
                fields: {
                  Active: true,
                  PQABatch: tpqaList,
                  Qty: lotNumbers.length,
                }
              }
              lineItemObjForm.fields.PQA = pqaObject;
            }

            lineItemsForm.push(lineItemObjForm);
            splashLineArray.push(lineItemObjForm);
          }
        });
        let getchkcustomField1 = true;
        let getchkcustomField2 = true;
        let getcustomField1 = $('.customField1Text').html();
        let getcustomField2 = $('.customField2Text').html();
        if ($('#formCheck-one').is(':checked')) {
          getchkcustomField1 = false;
        }
        if ($('#formCheck-two').is(':checked')) {
          getchkcustomField2 = false;
        }

        let customer = $('#edtCustomerName').val();
        let customerEmail = $('#edtCustomerEmail').val();
        let billingAddress = $('#txabillingAddress').val();


        let poNumber = $('#ponumber').val();
        let reference = $('#edtRef').val();

        let departement = $('.transheader > #sltDept_fromtransactionheader').val();
        let shippingAddress = $('#txaShipingInfo').val();
        let comments = $('#txaComment').val();
        let pickingInfrmation = $('#txapickmemo').val();
        let total = $('#totalBalanceDue').html() || 0;
        let tax = $('#subtotal_tax').html() || 0;
        let saleCustField1 = $('#edtSaleCustField1').val() || '';
        let saleCustField2 = $('#edtSaleCustField2').val() || '';
        let saleCustField3 = $('#edtSaleCustField3').val() || '';
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentSalesOrder = getso_id[getso_id.length - 1];

        var currencyCode = $(".transheader>.sltCurrency").val() || CountryAbbr;
        let ForeignExchangeRate = $('#exchange_rate').val() || 0;
        var showingFx = $("#toggleShowFx").prop('checked') == true? 'true': 'false';
        var showingDelivery = $('#toggleShowDelivery').prop('checked') ==true? 'true': 'false';
        var showingSN = $('#toggleShowSN').prop('checked')==true? 'true': 'false';

        let AddToManifest = false;
        if ($('.toggleManifest').prop('checked')) {
          AddToManifest = true;
        } else {
          AddToManifest = false;
        };
        let foreignCurrencyFields = {}
        if (FxGlobalFunctions.isCurrencyEnabled()) {
          foreignCurrencyFields = {
            ForeignExchangeCode: currencyCode,
            ForeignExchangeRate: parseFloat(ForeignExchangeRate),
          }
        }
        var objDetails = '';
        if (splashLineArray.length > 0) {
          if (getso_id[1]) {
            currentSalesOrder = parseInt(currentSalesOrder);
            objDetails = {
              type: "TSalesOrderEx",
              fields: {
                ID: currentSalesOrder,
                CustomerName: customer,
                ForeignExchangeCode: currencyCode,
                ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                Lines: splashLineArray,
                InvoiceToDesc: billingAddress,
                SaleDate: saleDate,
                // DueDate: dueDate,
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
                SalesStatus: $('.transheader > #sltStatus_fromtransactionheader').val(),
                SaleCustField10: showingFx,
                SaleCustField9: showingDelivery,
                SaleCustField8: showingSN,
                addtomanifest:AddToManifest
              }
            };
          } else {
            objDetails = {
              type: "TSalesOrderEx",
              fields: {
                CustomerName: customer,
                //  ForeignExchangeCode: currencyCode,
                // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                ...foreignCurrencyFields,
                Lines: splashLineArray,
                InvoiceToDesc: billingAddress,
                SaleDate: saleDate,
                //DueDate: dueDate,
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
                SalesStatus: $('.transheader > #sltStatus_fromtransactionheader').val(),
                SaleCustField10: showingFx,
                SaleCustField9: showingDelivery,
                SaleCustField8: showingSN,
                addtomanifest: AddToManifest,
              }
            };
          }
        } else {
          swal("Product name has not been selected!", "", "warning");
          $(".fullScreenSpin").css("display", "none");
          // event.preventDefault();
          return false;
        }

        showSimpleMessageTransaction();
        playSaveAudio();

        function saveFunc() {
          let company = localStorage.getItem('vs1companyName');
          let vs1User = localStorage.getItem('mySession');
          var customerID = $("#__customer_id").val();
          let currencyname = (CountryAbbr).toLowerCase();
          let stringQuery = "?";
          var customerID = $('#edtCustomerEmail').attr('customerid');
          for (let l = 0; l < lineItemsForm.length; l++) {
            stringQuery = stringQuery + "product" + l + "=" + lineItemsForm[l].fields.ProductName + "&price" + l + "=" + lineItemsForm[l].fields.LinePrice + "&qty" + l + "=" + lineItemsForm[l].fields.UOMQtySold + "&";
          }
          stringQuery = stringQuery + "tax=" + tax + "&total=" + total + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + objDetails.fields.ID + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Sales Order&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + departement + "&currency=" + currencyname;
          // Send Email
          $('#html-2-pdfwrapper').css('display', 'block');
          $('.pdfCustomerName').html($('#edtCustomerName').val());
          $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));
          var ponumber = $('#ponumber').val() || '.';
          $('.po').text(ponumber);
          // const templateObject = Template.instance();

          var htmlmailBody = generateHtmlMailBody(objDetails.fields.ID || '',stringQuery)

          addAttachment("Sales Order", "Customer", objDetails.fields.ID || '', htmlmailBody, 'salesorderslist', 77, 'html-2-pdfwrapper_salesorders', stringQuery, true);

          // End Send Email

          if (customerID !== " ") {
            let customerEmailData = {
              type: "TCustomer",
              fields: {
                ID: customerID,
                Email: customerEmail
              }
            }
          };
          var getcurrentCloudDetails = CloudUser.findOne({
            _id: localStorage.getItem('mycloudLogonID'),
            clouddatabaseID: localStorage.getItem('mycloudLogonDBID')
          });
          if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
              var clientID = getcurrentCloudDetails._id;
              var clientUsername = getcurrentCloudDetails.cloudUsername;
              var clientEmail = getcurrentCloudDetails.cloudEmail;
              var checkPrefDetails = CloudPreference.findOne({
                userid: clientID,
                PrefName: 'new_salesorder'
              });
              if (checkPrefDetails) {
                CloudPreference.update({
                  _id: checkPrefDetails._id
                }, {
                  $set: {
                    username: clientUsername,
                    useremail: clientEmail,
                    PrefGroup: 'salesform',
                    PrefName: 'new_salesorder',
                    published: true,
                    customFields: [{
                      index: '1',
                      label: getcustomField1,
                      hidden: getchkcustomField1
                    }, {
                      index: '2',
                      label: getcustomField2,
                      hidden: getchkcustomField2
                    }],
                    updatedAt: new Date()
                  }
                }, function (err, idTag) {
                  if (err) {
                    //FlowRouter.go('/salesorderslist?success=true');
                  } else {
                    //FlowRouter.go('/salesorderslist?success=true');

                  }
                });
              } else {
                CloudPreference.insert({
                  userid: clientID,
                  username: clientUsername,
                  useremail: clientEmail,
                  PrefGroup: 'salesform',
                  PrefName: 'new_salesorder',
                  published: true,
                  customFields: [{
                    index: '1',
                    label: getcustomField1,
                    hidden: getchkcustomField1
                  }, {
                    index: '2',
                    label: getcustomField2,
                    hidden: getchkcustomField2
                  }],
                  createdAt: new Date()
                }, function (err, idTag) {
                  if (err) {
                    //FlowRouter.go('/salesorderslist?success=true');
                  } else {
                    //FlowRouter.go('/salesorderslist?success=true');

                  }
                });
              }
            }
          }
        }

        let currentsotemp = templateObject.temporaryfiles.get();
        let newsotemp= [...currentsotemp, objDetails];
        templateObject.temporaryfiles.set(newsotemp);
        // salesService.saveSalesOrderEx(objDetails).then(function (data) {
          addVS1Data('TSalesOrderTemp', JSON.stringify({tsalesordertemp: newsotemp})).then(function(){

            saveFunc()
          // sideBarService.getAllSalesOrderList(initialDataLoad, 0).then(function (dataUpdated) {
          //   addVS1Data('TSalesOrderEx', JSON.stringify(dataUpdated)).then(function (dataReturn) {
          //   }).catch((error) => {
          //     // saveFunc()
          //   })
          // }).catch(errroorrrr => {
          //   // saveFunc()
          // })
          // salesService.saveSalesOrderEx(objDetails).then(function(objDetails) {

        }).catch(function (err) {

          swal({
            title: 'Oooops...',
            text: err,
            type: 'error',
            showCancelButton: false,
            confirmButtonText: 'Try Again'
          }).then((result) => {
            if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
            else if (result.dismiss === 'cancel') {

            }
          });
          //$('.loginSpinner').css('display','none');
          LoadingOverlay.hide();
        });
      }
    }, delayTimeAfterSound);
  }


  templateObject.getEmailBody = (objDetails)=> {
    let soid = objDetails.fields.ID;
    const stringQuery = "";
    return generateHtmlMailBody(soid, stringQuery)
  }

  // Methods
  // templateObject.hasFollowings = async function () {
  //   let salesService = new SalesBoardService();
  //   var url = FlowRouter.current().path;
  //   var getso_id = url.split('?id=');
  //   var currentInvoice = getso_id[getso_id.length - 1];
  //   if (getso_id[1]) {
  //     currentInvoice = parseInt(currentInvoice);
  //     var soData = await salesService.getOneSalesOrderdataEx(currentInvoice);
  //     var isRepeated = soData.fields.RepeatedFrom;
  //     templateObject.hasFollow.set(isRepeated);
  //   }
  // }

  templateObject.sendEmail = async() => {
    return new PromiseRejectionEvent((resolve, reject)=>{
      let termname = $('.transheader > #sltTerms_fromtransactionheader').val() || '';
      if (termname === '') {
        swal('Terms has not been selected!', '', 'warning');
        resolve()
        return false;
      }

      var splashLineArray = new Array();
      let lineItemsForm = [];
      let lineItemObjForm = {};
      var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
      let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();

      $('#tblSalesOrderLine > tbody > tr').each(function () {
        var lineID = this.id;
        let tdproduct = $('#' + lineID + " .lineProductName").val();
        let tddescription = $('#' + lineID + " .lineProductDesc").text();
        let tdQty = $('#' + lineID + " .lineQty").val();
        let tdunitprice = $('#' + lineID + " .colUnitPriceExChange").val();
        let tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || loggedTaxCodeSalesInc;
        let tdSerialNumber = $('#' + lineID + " .colSerialNo").attr('data-serialnumbers');
        let tdLotNumber = $('#' + lineID + " .colSerialNo").attr('data-lotnumbers');
        let tdExpiryDates = $('#' + lineID + " .colSerialNo").attr('data-expirydates');
  
        if (tdproduct != "") {
  
          lineItemObjForm = {
            type: "TSalesOrderLine",
            fields: {
              ProductName: tdproduct || '',
              ProductDescription: tddescription || '',
              UOMQtySold: parseFloat(tdQty) || 0,
              UOMQtyShipped: parseFloat(tdQty) || 0,
              LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
              Headershipdate: saleDate,
              LineTaxCode: tdtaxCode || '',
              DiscountPercent: parseFloat($('#' + lineID + " .lineDiscount").text()) || 0
            }
          };
  
          // Feature/ser-lot number tracking: Save Serial Numbers
          if (tdSerialNumber) {
            const serialNumbers = tdSerialNumber.split(',');
            let tpqaList = [];
            for (let i = 0; i < serialNumbers.length; i++) {
              const tpqaObject = {
                type: "TPQASN",
                fields: {
                  Active: true,
                  Qty: 1,
                  SerialNumber: serialNumbers[i],
                }
              };
              tpqaList.push(tpqaObject);
            }
            const pqaObject = {
              type: "TPQA",
              fields: {
                Active: true,
                PQASN: tpqaList,
                Qty: serialNumbers.length,
              }
            }
            lineItemObjForm.fields.PQA = pqaObject;
          }
  
          // Feature/ser-lot number tracking: Save Lot Number
          if (tdLotNumber) {
            const lotNumbers = tdLotNumber.split(',');
            const expiryDates = tdExpiryDates.split(',');
            let tpqaList = [];
            for (let i = 0; i < lotNumbers.length; i++) {
              const dates = expiryDates[i].split('/');
              const tpqaObject = {
                type: "PQABatch",
                fields: {
                  Active: true,
                  BatchExpiryDate: new Date(parseInt(dates[2]), parseInt(dates[1]) - 1, parseInt(dates[0])).toISOString(),
                  Qty: 1,
                  BatchNo: lotNumbers[i],
                }
              };
              tpqaList.push(tpqaObject);
            }
            const pqaObject = {
              type: "TPQA",
              fields: {
                Active: true,
                PQABatch: tpqaList,
                Qty: lotNumbers.length,
              }
            }
            lineItemObjForm.fields.PQA = pqaObject;
          }
  
          lineItemsForm.push(lineItemObjForm);
          splashLineArray.push(lineItemObjForm);
        }
      });

      if ($('#formCheck-one').is(':checked')) {
        getchkcustomField1 = false;
      }
      if ($('#formCheck-two').is(':checked')) {
        getchkcustomField2 = false;
      }
  
      let customer = $('#edtCustomerName').val();
      let billingAddress = $('#txabillingAddress').val();
  
      let poNumber = $('#ponumber').val();
      let reference = $('#edtRef').val();
  
      let departement = $('#sltDept').val();
      let shippingAddress = $('#txaShipingInfo').val();
      let comments = $('#txaComment').val();
      let pickingInfrmation = $('#txapickmemo').val();
      let saleCustField1 = $('#edtSaleCustField1').val() || '';
      let saleCustField2 = $('#edtSaleCustField2').val() || '';
      let saleCustField3 = $('#edtSaleCustField3').val() || '';
      var url = FlowRouter.current().path;
      var getso_id = url.split('?id=');
      var currentSalesOrder = getso_id[getso_id.length - 1];
      let uploadedItems = templateObject.uploadedFiles.get();
      var currencyCode = $(".transheader > .sltCurrency").val() || CountryAbbr;
      let ForeignExchangeRate = $('#exchange_rate').val() || 0;
      let foreignCurrencyFields = {}
      if (FxGlobalFunctions.isCurrencyEnabled()) {
        foreignCurrencyFields = {
          ForeignExchangeCode: currencyCode,
          ForeignExchangeRate: parseFloat(ForeignExchangeRate),
        }
      }
      var objDetails = '';
      if (getso_id[1]) {
        currentSalesOrder = parseInt(currentSalesOrder);
        objDetails = {
          type: "TSalesOrderEx",
          fields: {
            ID: currentSalesOrder,
            CustomerName: customer,
            ...foreignCurrencyFields,
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
            SalesStatus: $('.transheader > #sltStatus_fromtransactionheader').val()
          }
        };
      } else {
        objDetails = {
          type: "TSalesOrderEx",
          fields: {
            CustomerName: customer,
            ...foreignCurrencyFields,
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
            SalesStatus: $('.transheader > #sltStatus_fromtransactionheader').val()
          }
        };
      }

      resolve(objDetails)
    })
  }
  // templateObject.getTemplateInfoNew = function () {
  //   LoadingOverlay.show();
  //   getVS1Data('TTemplateSettings').then(function (dataObject) {
  //     if (dataObject.length == 0) {
  //       sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
  //         addVS1Data('TTemplateSettings', JSON.stringify(data));
  //         for (let i = 0; i < data.ttemplatesettings.length; i++) {
  //           if (data.ttemplatesettings[i].fields.SettingName == 'Sales Orders') {
  //             if (data.ttemplatesettings[i].fields.Template == 1) {
  //               $('input[name="Sales Order_1"]').val(data.ttemplatesettings[i].fields.Description);
  //               if (data.ttemplatesettings[i].fields.Active == true) {
  //                 $('#Sales_Orders_1').attr('checked', 'checked');
  //               }

  //             }
  //             if (data.ttemplatesettings[i].fields.Template == 2) {
  //               $('input[name="Sales Order_2"]').val(data.ttemplatesettings[i].fields.Description);
  //               if (data.ttemplatesettings[i].fields.Active == true) {
  //                 $('#Sales_Orders_2').attr('checked', 'checked');
  //               }
  //             }
  //             if (data.ttemplatesettings[i].fields.Template == 3) {
  //               $('input[name="Sales Order_3"]').val(data.ttemplatesettings[i].fields.Description);
  //               if (data.ttemplatesettings[i].fields.Active == true) {
  //                 $('#Sales_Orders_3').attr('checked', 'checked');
  //               }
  //             }

  //             break;
  //           }
  //         }
  //         LoadingOverlay.hide();
  //       }).catch(function (err) {
  //         LoadingOverlay.hide();
  //       });
  //     } else {
  //       let data = JSON.parse(dataObject[0].data);
  //       for (let i = 0; i < data.ttemplatesettings.length; i++) {
  //         if (data.ttemplatesettings[i].fields.SettingName == 'Sales Orders') {
  //           if (data.ttemplatesettings[i].fields.Template == 1) {
  //             $('input[name="Sales Order_1"]').val(data.ttemplatesettings[i].fields.Description);
  //             if (data.ttemplatesettings[i].fields.Active == true) {
  //               $('#Sales_Orders_1').attr('checked', 'checked');
  //             }

  //           }
  //           if (data.ttemplatesettings[i].fields.Template == 2) {
  //             $('input[name="Sales Order_2"]').val(data.ttemplatesettings[i].fields.Description);
  //             if (data.ttemplatesettings[i].fields.Active == true) {
  //               $('#Sales_Orders_2').attr('checked', 'checked');
  //             }
  //           }
  //           if (data.ttemplatesettings[i].fields.Template == 3) {
  //             $('input[name="Sales Order_3"]').val(data.ttemplatesettings[i].fields.Description);
  //             if (data.ttemplatesettings[i].fields.Active == true) {
  //               $('#Sales_Orders_3').attr('checked', 'checked');
  //             }
  //           }

  //           break;
  //         }
  //       }
  //       LoadingOverlay.hide();
  //     }
  //   }).catch(function (err) {
  //     sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
  //       addVS1Data('TTemplateSettings', JSON.stringify(data));
  //       for (let i = 0; i < data.ttemplatesettings.length; i++) {
  //         if (data.ttemplatesettings[i].fields.SettingName == 'Sales Orders') {
  //           if (data.ttemplatesettings[i].fields.Template == 1) {
  //             $('input[name="Sales Order_1"]').val(data.ttemplatesettings[i].fields.Description);
  //             if (data.ttemplatesettings[i].fields.Active == true) {
  //               $('#Sales_Orders_1').attr('checked', 'checked');
  //             }

  //           }
  //           if (data.ttemplatesettings[i].fields.Template == 2) {
  //             $('input[name="Sales Order_2"]').val(data.ttemplatesettings[i].fields.Description);
  //             if (data.ttemplatesettings[i].fields.Active == true) {
  //               $('#Sales_Orders_2').attr('checked', 'checked');
  //             }
  //           }
  //           if (data.ttemplatesettings[i].fields.Template == 3) {
  //             $('input[name="Sales Order_3"]').val(data.ttemplatesettings[i].fields.Description);
  //             if (data.ttemplatesettings[i].fields.Active == true) {
  //               $('#Sales_Orders_3').attr('checked', 'checked');
  //             }
  //           }
  //           break;
  //         }
  //       }
  //       LoadingOverlay.hide();
  //     }).catch(function (err) {
  //       LoadingOverlay.hide();
  //     });
  //   });
  // };
  // should be updated with indexeddb
  // templateObject.getLastSOData = async function () {
  //   let lastDepartment = defaultDept || "";
  //   salesService.getLastSOID().then(function (data) {
  //     let latestSOId;
  //     if (data.tsalesorder.length > 0) {
  //       lastSO = data.tsalesorder[data.tsalesorder.length - 1]
  //       latestSOId = (lastSO.Id);
  //     } else {
  //       latestSOId = 0;
  //     }
  //     newSOId = (latestSOId + 1);
  //     $('#sltDept').val(lastDepartment);
  //   }).catch(function (err) {
  //     $('#sltDept').val(lastDepartment);
  //   });
  // };

  // templateObject.generateInvoiceData = async function (template_title, number) {
  //   switch (template_title) {
  //     case "Sales Orders":
  //       showSealsOrder1(template_title, number, false);
  //       break;
  //     case "Delivery Docket":
  //       showDeliveryDocket1(template_title, number, false);
  //       break;
  //   }
  //   let printSettings = await getPrintSettings(template_title, number);
  //   for (key in printSettings) {
  //     $('.' + key).css('display', printSettings[key][2] ? 'revert' : 'none');
  //   }
  // };

  // function showSealsOrder1(template_title, number, bprint) {
  //   var array_data = [];
  //   let lineItems = [];
  //   let taxItems = {};
  //   let object_invoce = [];
  //   let item_invoices = '';
  //   let invoice_data = templateObject.salesorderrecord.get();
  //   let stripe_id = templateObject.accountID.get() || '';
  //   let stripe_fee_method = templateObject.stripe_fee_method.get();
  //   var erpGet = erpDb();
  //   var customfield1 = $('#edtSaleCustField1').val() || '  ';
  //   var customfield2 = $('#edtSaleCustField2').val() || '  ';
  //   var customfield3 = $('#edtSaleCustField3').val() || '  ';
  //   var customfieldlabel1 = $('.lblCustomField1').first().text() || 'Custom Field 1';
  //   var customfieldlabel2 = $('.lblCustomField2').first().text() || 'Custom Field 2';
  //   var customfieldlabel3 = $('.lblCustomField3').first().text() || 'Custom Field 3';
  //   let balancedue = $('#totalBalanceDue').html() || 0;
  //   let tax = $('#subtotal_tax').html() || 0;
  //   let customer = $('#edtCustomerName').val();
  //   let name = $('#firstname').val();
  //   let surname = $('#lastname').val();
  //   let dept = $('#sltDept').val();
  //   let fx = $('.sltCurrency').val();
  //   var comment = $('#txaComment').val();
  //   var subtotal_tax = $('#subtotal_tax').html() || '$' + 0;
  //   var total_paid = $('#totalPaidAmt').html() || '$' + 0;
  //   var ref = $('#edtRef').val() || '-';
  //   var txabillingAddress = $('#txabillingAddress').val() || '';
  //   var dtSODate = $('#dtSODate').val();
  //   var subtotal_total = $('#subtotal_total').text() || '$' + 0;
  //   var grandTotal = $('#grandTotal').text() || '$' + 0;
  //   var duedate = $('#dtDueDate').val();
  //   var po = $('#ponumber').val() || '.';

  //   $('#tblSalesOrderLine > tbody > tr').each(function () {
  //     var lineID = this.id;
  //     const tdproduct = $(this).find(".lineProductName").val();
  //     let tddescription = $(this).find('.lineProductDesc').text();
  //     let tdpqa = $('#' + lineID + " .lineProductDesc").attr('data-pqa');
  //     if (tdpqa) {
  //       tddescription += " " + tdpqa;
  //     }

  //     const tdQty = $(this).find('.lineQty').val();
  //     const tdunitprice = $(this).find('.colUnitPriceExChange').val();
  //     const taxamount = $(this).find('.lineTaxAmount:not(.convert-to-foreign)').text();
  //     const tdlineamt = $(this).find('.lineAmount').text();
  //     const targetRow = $(this);
  //     const targetTaxCode = targetRow.find('.lineTaxCode').val();
  //     let qty = targetRow.find(".lineQty").val() || 0
  //     let price = targetRow.find('.colUnitPriceExChange').val() || 0;
  //     const taxDetail = templateObject.taxcodes.get().find((v) => v.CodeName === targetTaxCode);
  //     if (taxDetail) {
  //       let priceTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, ""));
  //       if (taxDetail.Lines) {
  //         taxDetail.Lines.map((line) => {
  //           let taxCode = line.SubTaxCode;
  //           let amount = priceTotal * line.Percentage / 100;
  //           if (taxItems[taxCode]) {
  //             taxItems[taxCode] += amount;
  //           }
  //           else {
  //             taxItems[taxCode] = amount;
  //           }
  //         });
  //       }
  //     }
  //     array_data.push([
  //       tdproduct,
  //       tddescription,
  //       tdQty,
  //       tdunitprice,
  //       taxamount,
  //       tdlineamt,
  //     ]);
  //     const lineItemObj = {
  //       description: tddescription || '',
  //       quantity: tdQty || 0,
  //       unitPrice: tdunitprice?.toLocaleString(undefined, {
  //         minimumFractionDigits: 2
  //       }) || 0
  //     }
  //     lineItems.push(lineItemObj);
  //   });

  //   let company = localStorage.getItem('vs1companyName');
  //   let vs1User = localStorage.getItem('mySession');
  //   let customerEmail = $('#edtCustomerEmail').val();
  //   let currencyname = (CountryAbbr).toLowerCase();
  //   stringQuery = "?";
  //   for (let l = 0; l < lineItems.length; l++) {
  //     stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
  //   }
  //   stringQuery = stringQuery + "tax=" + tax + "&total=" + grandTotal + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + invoice_data.id + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Invoice&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;
  //   $(".linkText").attr("href", stripeGlobalURL + stringQuery);

  //   if (number == 1) {
  //     item_invoices = {
  //       o_url: localStorage.getItem('vs1companyURL'),
  //       o_name: localStorage.getItem('vs1companyName'),
  //       o_address: localStorage.getItem('vs1companyaddress1'),
  //       o_city: localStorage.getItem('vs1companyCity'),
  //       o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
  //       o_reg: Template.new_salesorder.__helpers.get('companyReg').call(),
  //       o_abn: Template.new_salesorder.__helpers.get('companyabn').call(),
  //       o_phone: Template.new_salesorder.__helpers.get('companyphone').call(),
  //       title: 'Sales Order',
  //       value: invoice_data.id,
  //       date: dtSODate,
  //       invoicenumber: invoice_data.id,
  //       refnumber: ref,
  //       pqnumber: po,
  //       duedate: duedate,
  //       paylink: "Pay Now",
  //       supplier_type: "Customer",
  //       supplier_name: customer,
  //       supplier_addr: txabillingAddress,
  //       fields: {
  //         "Product Name": ["25", "left"],
  //         "Description": ["30", "left"],
  //         "Qty": ["7", "right"],
  //         "Unit Price": ["15", "right"],
  //         "Tax": ["7", "right"],
  //         "Amount": ["15", "right"],
  //       },
  //       subtotal: subtotal_total,
  //       gst: subtotal_tax,
  //       total: grandTotal,
  //       paid_amount: total_paid,
  //       bal_due: balancedue,
  //       bsb: Template.new_salesorder.__helpers.get('vs1companyBankBSB').call(),
  //       account: Template.new_salesorder.__helpers.get('vs1companyBankAccountNo').call(),
  //       swift: Template.new_salesorder.__helpers.get('vs1companyBankSwiftCode').call(),
  //       data: array_data,
  //       customfield1: 'NA',
  //       customfield2: 'NA',
  //       customfield3: 'NA',
  //       customfieldlabel1: 'NA',
  //       customfieldlabel2: 'NA',
  //       customfieldlabel3: 'NA',
  //       applied: "",
  //       showFX: "",
  //       comment: comment,
  //     };
  //   }
  //   else if (number == 2) {
  //     item_invoices = {
  //       o_url: localStorage.getItem('vs1companyURL'),
  //       o_name: localStorage.getItem('vs1companyName'),
  //       o_address: localStorage.getItem('vs1companyaddress1'),
  //       o_city: localStorage.getItem('vs1companyCity'),
  //       o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
  //       o_reg: Template.new_salesorder.__helpers.get('companyReg').call(),
  //       o_abn: Template.new_salesorder.__helpers.get('companyabn').call(),
  //       o_phone: Template.new_salesorder.__helpers.get('companyphone').call(),
  //       title: 'Sales Order',
  //       value: invoice_data.id,
  //       date: dtSODate,
  //       invoicenumber: invoice_data.id,
  //       refnumber: ref,
  //       pqnumber: po,
  //       duedate: duedate,
  //       paylink: "Pay Now",
  //       supplier_type: "Customer",
  //       supplier_name: customer,
  //       supplier_addr: txabillingAddress,
  //       fields: {
  //         "Product Name": ["25", "left"],
  //         "Description": ["30", "left"],
  //         "Qty": ["7", "right"],
  //         "Unit Price": ["15", "right"],
  //         "Tax": ["7", "right"],
  //         "Amount": ["15", "right"],
  //       },
  //       subtotal: subtotal_total,
  //       gst: subtotal_tax,
  //       total: grandTotal,
  //       paid_amount: total_paid,
  //       bal_due: balancedue,
  //       bsb: Template.new_salesorder.__helpers.get('vs1companyBankBSB').call(),
  //       account: Template.new_salesorder.__helpers.get('vs1companyBankAccountNo').call(),
  //       swift: Template.new_salesorder.__helpers.get('vs1companyBankSwiftCode').call(),
  //       data: array_data,
  //       customfield1: customfield1,
  //       customfield2: customfield2,
  //       customfield3: customfield3,
  //       customfieldlabel1: customfieldlabel1,
  //       customfieldlabel2: customfieldlabel2,
  //       customfieldlabel3: customfieldlabel3,
  //       applied: "",
  //       showFX: "",
  //       comment: comment,
  //     };
  //   }
  //   else {
  //     item_invoices = {
  //       o_url: localStorage.getItem('vs1companyURL'),
  //       o_name: localStorage.getItem('vs1companyName'),
  //       o_address: localStorage.getItem('vs1companyaddress1'),
  //       o_city: localStorage.getItem('vs1companyCity'),
  //       o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
  //       o_reg: Template.new_salesorder.__helpers.get('companyReg').call(),
  //       o_abn: Template.new_salesorder.__helpers.get('companyabn').call(),
  //       o_phone: Template.new_salesorder.__helpers.get('companyphone').call(),
  //       title: 'Sales Order',
  //       value: invoice_data.id,
  //       date: dtSODate,
  //       invoicenumber: invoice_data.id,
  //       refnumber: ref,
  //       pqnumber: po,
  //       duedate: duedate,
  //       paylink: "Pay Now",
  //       supplier_type: "Customer",
  //       supplier_name: customer,
  //       supplier_addr: txabillingAddress,
  //       fields: {
  //         "Product Name": ["25", "left"],
  //         "Description": ["30", "left"],
  //         "Qty": ["7", "right"],
  //         "Unit Price": ["15", "right"],
  //         "Tax": ["7", "right"],
  //         "Amount": ["15", "right"],
  //       },
  //       subtotal: subtotal_total,
  //       gst: subtotal_tax,
  //       total: grandTotal,
  //       paid_amount: total_paid,
  //       bal_due: balancedue,
  //       bsb: Template.new_salesorder.__helpers.get('vs1companyBankBSB').call(),
  //       account: Template.new_salesorder.__helpers.get('vs1companyBankAccountNo').call(),
  //       swift: Template.new_salesorder.__helpers.get('vs1companyBankSwiftCode').call(),
  //       data: array_data,
  //       customfield1: customfield1,
  //       customfield2: customfield2,
  //       customfield3: customfield3,
  //       customfieldlabel1: customfieldlabel1,
  //       customfieldlabel2: customfieldlabel2,
  //       customfieldlabel3: customfieldlabel3,
  //       applied: "",
  //       showFX: fx,
  //       comment: comment,
  //     };
  //   }
  //   item_invoices.taxItems = taxItems;
  //   object_invoce.push(item_invoices);
  //   $("#templatePreviewModal .field_payment").show();
  //   $("#templatePreviewModal .field_amount").show();
  //   if (bprint == false) {
  //     $("#html-2-pdfwrapper_quotes").css("width", "90%");
  //     $("#html-2-pdfwrapper_quotes2").css("width", "90%");
  //     $("#html-2-pdfwrapper_quotes3").css("width", "90%");
  //   } else {
  //     $("#html-2-pdfwrapper_quotes").css("width", "210mm");
  //     $("#html-2-pdfwrapper_quotes2").css("width", "210mm");
  //     $("#html-2-pdfwrapper_quotes3").css("width", "210mm");
  //   }

  //   if (number == 1) {
  //     updateTemplate1(object_invoce, bprint);
  //   } else if (number == 2) {
  //     updateTemplate2(object_invoce, bprint);
  //   } else {
  //     updateTemplate3(object_invoce, bprint);
  //   }
  //   saveTemplateFields("fields" + template_title, object_invoce[0]["fields"]);
  // }

  // function showDeliveryDocket1(template_title, number, bprint) {
  //   const array_data = [];
  //   let lineItems = [];
  //   const object_invoce = [];
  //   let item_invoices = '';
  //   let invoice_data = templateObject.salesorderrecord.get();
  //   let stripe_id = templateObject.accountID.get() || '';
  //   let stripe_fee_method = templateObject.stripe_fee_method.get();
  //   const erpGet = erpDb();

  //   let customfield1 = $('#edtSaleCustField1').val() || '  ';
  //   let customfield2 = $('#edtSaleCustField2').val() || '  ';
  //   let customfield3 = $('#edtSaleCustField3').val() || '  ';

  //   let customfieldlabel1 = $('.lblCustomField1').first().text() || 'Custom Field 1';
  //   let customfieldlabel2 = $('.lblCustomField2').first().text() || 'Custom Field 2';
  //   let customfieldlabel3 = $('.lblCustomField3').first().text() || 'Custom Field 3';
  //   let tax = $('#subtotal_tax').html() || 0;
  //   let customer = $('#edtCustomerName').val();
  //   let name = $('#firstname').val();
  //   let surname = $('#lastname').val();
  //   let dept = $('#sltDept').val();
  //   let comment = $('#txaComment').val();
  //   let ref = $('#edtRef').val() || '-';
  //   let txabillingAddress = $('#txabillingAddress').val() || '';
  //   let dtSODate = $('#dtSODate').val();
  //   let grandTotal = $('#grandTotal').text() || '$' + 0;
  //   let duedate = $('#dtDueDate').val();
  //   let po = $('#ponumber').val() || '.';

  //   $('#tblSalesOrderLine > tbody > tr').each(function () {
  //     const tdproduct = $(this).find(".lineProductName").val();
  //     const tddescription = $(this).find('.lineProductDesc').text();
  //     const tdQty = $(this).find('.lineQty').val();
  //     const tdunitprice = $(this).find('.colUnitPriceExChange').val();
  //     const taxamount = $(this).find('.lineTaxAmount:not(.convert-to-foreign)').text();
  //     const targetRow = $(this);
  //     const targetTaxCode = targetRow.find('.lineTaxCode').val();
  //     array_data.push([
  //       tdproduct,
  //       tddescription,
  //       tdQty,
  //     ]);
  //     const lineItemObj = {
  //       description: tddescription || '',
  //       quantity: tdQty || 0,
  //       unitPrice: tdunitprice.toLocaleString(undefined, {
  //         minimumFractionDigits: 2
  //       }) || 0
  //     }
  //     lineItems.push(lineItemObj);
  //   });

  //   let company = localStorage.getItem('vs1companyName');
  //   let vs1User = localStorage.getItem('mySession');
  //   let customerEmail = $('#edtCustomerEmail').val();
  //   let currencyname = (CountryAbbr).toLowerCase();
  //   let stringQuery = "?";
  //   for (let l = 0; l < lineItems.length; l++) {
  //     stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
  //   }
  //   stringQuery = stringQuery + "tax=" + tax + "&total=" + grandTotal + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + invoice_data.id + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Invoice&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;
  //   $(".linkText").attr("href", stripeGlobalURL + stringQuery);
  //   if (number == 1) {
  //     item_invoices = {
  //       o_url: localStorage.getItem('vs1companyURL'),
  //       o_name: localStorage.getItem('vs1companyName'),
  //       o_address: localStorage.getItem('vs1companyaddress1'),
  //       o_city: localStorage.getItem('vs1companyCity'),
  //       o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
  //       o_reg: Template.new_salesorder.__helpers.get('companyReg').call(),
  //       o_abn: Template.new_salesorder.__helpers.get('companyabn').call(),
  //       o_phone: Template.new_salesorder.__helpers.get('companyphone').call(),
  //       title: 'Delivery Docket',
  //       value: invoice_data.id,
  //       date: dtSODate,
  //       invoicenumber: invoice_data.id,
  //       refnumber: ref,
  //       pqnumber: po,
  //       duedate: duedate,
  //       paylink: "Pay Now",
  //       supplier_type: "Customer",
  //       supplier_name: customer,
  //       supplier_addr: txabillingAddress,
  //       fields: {
  //         "Product Name": ["40", "left"],
  //         "Description": ["40", "left"],
  //         "Qty": ["20", "right"]
  //       },
  //       subtotal: "",
  //       gst: "",
  //       total: "",
  //       paid_amount: "",
  //       bal_due: "",
  //       bsb: "",
  //       account: "",
  //       swift: "",
  //       data: array_data,
  //       customfield1: 'NA',
  //       customfield2: 'NA',
  //       customfield3: 'NA',
  //       customfieldlabel1: 'NA',
  //       customfieldlabel2: 'NA',
  //       customfieldlabel3: 'NA',
  //       applied: "",
  //       showFX: "",
  //       comment: comment,
  //     };
  //   }
  //   else if (number == 2) {
  //     item_invoices = {
  //       o_url: localStorage.getItem('vs1companyURL'),
  //       o_name: localStorage.getItem('vs1companyName'),
  //       o_address: localStorage.getItem('vs1companyaddress1'),
  //       o_city: localStorage.getItem('vs1companyCity'),
  //       o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
  //       o_reg: Template.new_salesorder.__helpers.get('companyReg').call(),
  //       o_abn: Template.new_salesorder.__helpers.get('companyabn').call(),
  //       o_phone: Template.new_salesorder.__helpers.get('companyphone').call(),
  //       title: 'Delivery Docket',
  //       value: invoice_data.id,
  //       date: dtSODate,
  //       invoicenumber: invoice_data.id,
  //       refnumber: ref,
  //       pqnumber: po,
  //       duedate: duedate,
  //       paylink: "Pay Now",
  //       supplier_type: "Customer",
  //       supplier_name: customer,
  //       supplier_addr: txabillingAddress,
  //       fields: {
  //         "Product Name": ["40", "left"],
  //         "Description": ["40", "left"],
  //         "Qty": ["20", "right"]
  //       },
  //       subtotal: "",
  //       gst: "",
  //       total: "",
  //       paid_amount: "",
  //       bal_due: "",
  //       bsb: "",
  //       account: "",
  //       swift: "",
  //       data: array_data,
  //       customfield1: customfield1,
  //       customfield2: customfield2,
  //       customfield3: customfield3,
  //       customfieldlabel1: customfieldlabel1,
  //       customfieldlabel2: customfieldlabel2,
  //       customfieldlabel3: customfieldlabel3,
  //       applied: "",
  //       showFX: "",
  //       comment: comment,
  //     };

  //   }
  //   else {
  //     item_invoices = {
  //       o_url: localStorage.getItem('vs1companyURL'),
  //       o_name: localStorage.getItem('vs1companyName'),
  //       o_address: localStorage.getItem('vs1companyaddress1'),
  //       o_city: localStorage.getItem('vs1companyCity'),
  //       o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
  //       o_reg: Template.new_salesorder.__helpers.get('companyReg').call(),
  //       o_abn: Template.new_salesorder.__helpers.get('companyabn').call(),
  //       o_phone: Template.new_salesorder.__helpers.get('companyphone').call(),
  //       title: 'Delivery Docket',
  //       value: invoice_data.id,
  //       date: dtSODate,
  //       invoicenumber: invoice_data.id,
  //       refnumber: ref,
  //       pqnumber: po,
  //       duedate: duedate,
  //       paylink: "Pay Now",
  //       supplier_type: "Customer",
  //       supplier_name: customer,
  //       supplier_addr: txabillingAddress,
  //       fields: {
  //         "Product Name": ["40", "left"],
  //         "Description": ["40", "left"],
  //         "Qty": ["20", "right"]
  //       },
  //       subtotal: "",
  //       gst: "",
  //       total: "",
  //       paid_amount: "",
  //       bal_due: "",
  //       bsb: "",
  //       account: "",
  //       swift: "",
  //       data: array_data,
  //       customfield1: customfield1,
  //       customfield2: customfield2,
  //       customfield3: customfield3,
  //       customfieldlabel1: customfieldlabel1,
  //       customfieldlabel2: customfieldlabel2,
  //       customfieldlabel3: customfieldlabel3,
  //       applied: "",
  //       showFX: "",
  //       comment: comment,
  //     };

  //   }
  //   object_invoce.push(item_invoices);
  //   $("#templatePreviewModal .field_payment").show();
  //   $("#templatePreviewModal .field_amount").show();
  //   if (bprint == false) {
  //     $("#html-2-pdfwrapper").css("width", "90%");
  //     $("#html-2-pdfwrapper2").css("width", "90%");
  //     $("#html-2-pdfwrapper3").css("width", "90%");
  //   } else {
  //     $("#html-2-pdfwrapper").css("width", "210mm");
  //     $("#html-2-pdfwrapper2").css("width", "210mm");
  //     $("#html-2-pdfwrapper3").css("width", "210mm");
  //   }
  //   if (number == 1) {
  //     updateTemplate1(object_invoce, bprint);
  //   } else if (number == 2) {
  //     updateTemplate2(object_invoce, bprint);
  //   } else {
  //     updateTemplate3(object_invoce, bprint);
  //   }
  //   saveTemplateFields("fields" + template_title, object_invoce[0]["fields"]);
  // }
  // function loadTemplateBody1(object_invoce) {
  //   if (object_invoce[0]["taxItems"]) {
  //     let taxItems = object_invoce[0]["taxItems"];
  //     if (taxItems && Object.keys(taxItems).length > 0) {
  //       $("#templatePreviewModal #tax_list_print").html("");
  //       Object.keys(taxItems).map((code) => {
  //         let html = `
  //                       <div style="width: 100%; display: flex;">
  //                           <div style="padding-right: 16px; width: 50%;">
  //                               <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
  //                                   ${code}</p>
  //                           </div>
  //                           <div style="padding-left: 16px; width: 50%;">
  //                               <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
  //                                   $${taxItems[code].toFixed(3)}</p>
  //                           </div>
  //                       </div>
  //                   `;
  //         $("#templatePreviewModal #tax_list_print").append(html);
  //       });
  //     } else {
  //       $("#templatePreviewModal #tax_list_print").remove();
  //     }
  //   }


  //   // table content
  //   var tbl_content = $("#templatePreviewModal .tbl_content");
  //   tbl_content.empty();
  //   const data = object_invoce[0]["data"];

  //   let idx = 0;
  //   for (item of data) {
  //     idx = 0;
  //     var html = '';
  //     html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
  //     for (item_temp of item) {
  //       if (idx > 1)
  //         html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
  //       else
  //         html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
  //       idx++;
  //     }

  //     html += "</tr>";
  //     tbl_content.append(html);

  //   }

  //   // total amount
  //   if (noHasTotals.includes(object_invoce[0]["title"])) {
  //     $("#templatePreviewModal .field_amount").hide();
  //     $("#templatePreviewModal .field_payment").css("borderRight", "0px solid black");
  //   } else {
  //     $("#templatePreviewModal .field_amount").show();
  //     $("#templatePreviewModal .field_payment").css("borderRight", "1px solid black");
  //   }

  //   $('#templatePreviewModal #subtotal_total').text("Sub total");
  //   $("#templatePreviewModal #subtotal_totalPrint").text(object_invoce[0]["subtotal"]);
  //   $('#templatePreviewModal #grandTotal').text("Grand total");
  //   $("#templatePreviewModal #totalTax_totalPrint").text(object_invoce[0]["gst"]);
  //   $("#templatePreviewModal #grandTotalPrint").text(object_invoce[0]["total"]);
  //   $("#templatePreviewModal #totalBalanceDuePrint").text(object_invoce[0]["bal_due"]);
  //   $("#templatePreviewModal #paid_amount").text(object_invoce[0]["paid_amount"]);

  // }

  // function loadTemplateBody2(object_invoce) {
  //   if (object_invoce[0]["taxItems"]) {
  //     let taxItems = object_invoce[0]["taxItems"];
  //     if (taxItems && Object.keys(taxItems).length > 0) {
  //       $("#templatePreviewModal #tax_list_print").html("");
  //       Object.keys(taxItems).map((code) => {
  //         let html = `
  //                       <div style="width: 100%; display: flex;">
  //                           <div style="padding-right: 16px; width: 50%;">
  //                               <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
  //                                   ${code}</p>
  //                           </div>
  //                           <div style="padding-left: 16px; width: 50%;">
  //                               <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
  //                                   $${taxItems[code].toFixed(3)}</p>
  //                           </div>
  //                       </div>
  //                   `;
  //         $("#templatePreviewModal #tax_list_print").append(html);
  //       });
  //     } else {
  //       $("#templatePreviewModal #tax_list_print").remove();
  //     }
  //   }
  //   // table content
  //   var tbl_content = $("#templatePreviewModal .tbl_content");
  //   tbl_content.empty();
  //   const data = object_invoce[0]["data"];

  //   let idx = 0;
  //   for (item of data) {
  //     idx = 0;
  //     var html = '';
  //     html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
  //     for (item_temp of item) {
  //       if (idx > 1)
  //         html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
  //       else
  //         html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
  //       idx++;
  //     }

  //     html += "</tr>";
  //     tbl_content.append(html);
  //   }
  //   // total amount
  //   if (noHasTotals.includes(object_invoce[0]["title"])) {
  //     $(".subtotal2").hide();
  //   } else {
  //     $(".subtotal2").show();
  //   }

  //   $("#templatePreviewModal #subtotal_totalPrint2").text(
  //     object_invoce[0]["subtotal"]
  //   );
  //   $("#templatePreviewModal #grandTotalPrint2").text(
  //     object_invoce[0]["total"]
  //   );
  //   $("#templatePreviewModal #totalBalanceDuePrint2").text(
  //     object_invoce[0]["bal_due"]
  //   );
  //   $("#templatePreviewModal #paid_amount2").text(
  //     object_invoce[0]["paid_amount"]
  //   );

  // }

  // function loadTemplateBody3(object_invoce) {
  //   if (object_invoce[0]["taxItems"]) {
  //     let taxItems = object_invoce[0]["taxItems"];
  //     if (taxItems && Object.keys(taxItems).length > 0) {
  //       $("#templatePreviewModal #tax_list_print").html("");
  //       Object.keys(taxItems).map((code) => {
  //         let html = `
  //                       <div style="width: 100%; display: flex;">
  //                           <div style="padding-right: 16px; width: 50%;">
  //                               <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
  //                                   ${code}</p>
  //                           </div>
  //                           <div style="padding-left: 16px; width: 50%;">
  //                               <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
  //                                   $${taxItems[code].toFixed(3)}</p>
  //                           </div>
  //                       </div>
  //                   `;
  //         $("#templatePreviewModal #tax_list_print").append(html);
  //       });
  //     } else {
  //       $("#templatePreviewModal #tax_list_print").remove();
  //     }
  //   }
  //   // table content
  //   var tbl_content = $("#templatePreviewModal .tbl_content");
  //   tbl_content.empty();
  //   const data = object_invoce[0]["data"];
  //   let idx = 0;
  //   for (item of data) {
  //     idx = 0;
  //     var html = '';
  //     html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
  //     for (item_temp of item) {
  //       if (idx > 1)
  //         html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
  //       else
  //         html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
  //       idx++;
  //     }
  //     html += "</tr>";
  //     tbl_content.append(html);
  //   }

  //   // total amount
  //   if (noHasTotals.includes(object_invoce[0]["title"])) {
  //     $(".subtotal3").hide();
  //   } else {
  //     $(".subtotal3").show();
  //   }

  //   $("#templatePreviewModal #subtotal_totalPrint3").text(
  //     object_invoce[0]["subtotal"]
  //   );
  //   $("#templatePreviewModal #totalTax_totalPrint3").text(
  //     object_invoce[0]["gst"]
  //   );
  //   $("#templatePreviewModal #totalBalanceDuePrint3").text(
  //     object_invoce[0]["bal_due"]
  //   );
  // }

  // function updateTemplate1(object_invoce, bprint) {
  //   // global function
  //   initTemplateHeaderFooter1();
  //   $("#html-2-pdfwrapper_quotes").show();
  //   $("#html-2-pdfwrapper_quotes2").hide();
  //   $("#html-2-pdfwrapper_quotes3").hide();
  //   if (bprint == false)
  //     $("#templatePreviewModal").modal("toggle");
  //   //global function
  //   loadTemplateHeaderFooter1(object_invoce);
  //   loadTemplateBody1(object_invoce);
  // }

  // function updateTemplate2(object_invoce, bprint) {
  //   initTemplateHeaderFooter2();
  //   $("#html-2-pdfwrapper_quotes").hide();
  //   $("#html-2-pdfwrapper_quotes2").show();
  //   $("#html-2-pdfwrapper_quotes3").hide();
  //   if (bprint == false)
  //     $("#templatePreviewModal").modal("toggle");
  //   loadTemplateHeaderFooter2(object_invoce);
  //   loadTemplateBody2(object_invoce);
  // }

  // function updateTemplate3(object_invoce, bprint) {
  //   initTemplateHeaderFooter3();
  //   $("#html-2-pdfwrapper_quotes").hide();
  //   $("#html-2-pdfwrapper_quotes2").hide();
  //   $("#html-2-pdfwrapper_quotes3").show();
  //   if (bprint == false)
  //     $("#templatePreviewModal").modal("toggle");
  //   loadTemplateHeaderFooter3(object_invoce);
  //   loadTemplateBody3(object_invoce);
  // }

  // function saveTemplateFields(key, value) {
  //   localStorage.setItem(key, value)
  // }

  // templateObject.exportSalesToPdf = function (template_title, number) {
  //   if (template_title == 'Sales Orders') {
  //     showSealsOrder1(template_title, number, true);
  //   }
  //   if (template_title == 'Delivery Docket') {
  //     showDeliveryDocket1(template_title, number, true);
  //   }
  //   let invoice_data_info = templateObject.salesorderrecord.get();
  //   var source;
  //   if (number == 1) {
  //     $("#html-2-pdfwrapper_quotes").show();
  //     $("#html-2-pdfwrapper_quotes2").hide();
  //     $("#html-2-pdfwrapper_quotes3").hide();
  //     source = document.getElementById("html-2-pdfwrapper_quotes");
  //   } else if (number == 2) {
  //     $("#html-2-pdfwrapper_quotes").hide();
  //     $("#html-2-pdfwrapper_quotes2").show();
  //     $("#html-2-pdfwrapper_quotes3").hide();
  //     source = document.getElementById("html-2-pdfwrapper_quotes2");
  //   } else {
  //     $("#html-2-pdfwrapper_quotes").hide();
  //     $("#html-2-pdfwrapper_quotes2").hide();
  //     $("#html-2-pdfwrapper_quotes3").show();
  //     source = document.getElementById("html-2-pdfwrapper_quotes3");
  //   }

  //   let file = "SalesOrder.pdf";
  //   if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
  //     if (template_title == 'Sales Orders') {
  //       file = 'Sales Order-' + invoice_data_info.id + '.pdf';
  //     }
  //     else {
  //       file = 'Delivery Docket-' + invoice_data_info.id + '.pdf';
  //     }
  //   }

  //   var opt = {
  //     margin: 0,
  //     filename: file,
  //     image: {
  //       type: 'jpeg',
  //       quality: 0.98
  //     },
  //     html2canvas: {
  //       scale: 2
  //     },
  //     jsPDF: {
  //       unit: 'in',
  //       format: 'a4',
  //       orientation: 'portrait'
  //     }
  //   };

  //   html2pdf().set(opt).from(source).save().then(function (dataObject) {
  //     $('#html-2-pdfwrapper_new').css('display', 'none');
  //     $('#html-2-pdfwrapper').css('display', 'none');
  //     $("#html-2-pdfwrapper_quotes").hide();
  //     $("#html-2-pdfwrapper_quotes2").hide();
  //     $("#html-2-pdfwrapper_quotes3").hide();
  //     $("#printModal").modal('hide');
  //     LoadingOverlay.hide();
  //   });
  //   return true;
  // };


  // templateObject.getAllClients = function () {
  //   getVS1Data('TCustomerVS1').then(function (dataObject) {
  //     if (dataObject.length === 0) {
  //       sideBarService.getAllCustomersDataVS1("All").then(function (data) {
  //         setClientVS1(data);
  //       });
  //     } else {
  //       let data = JSON.parse(dataObject[0].data);
  //       setClientVS1(data);
  //     }
  //   }).catch(function (err) {
  //     sideBarService.getAllCustomersDataVS1("All").then(function (data) {
  //       setClientVS1(data);
  //     });
  //   });
  // };
  // function setClientVS1(data) {
  //   const clientList = [];
  //   for (let i in data.tcustomervs1) {
  //     if (data.tcustomervs1.hasOwnProperty(i)) {
  //       let customerrecordObj = {
  //         customerid: data.tcustomervs1[i].fields.ID || ' ',
  //         firstname: data.tcustomervs1[i].fields.FirstName || ' ',
  //         lastname: data.tcustomervs1[i].fields.LastName || ' ',
  //         customername: data.tcustomervs1[i].fields.ClientName || ' ',
  //         customeremail: data.tcustomervs1[i].fields.Email || ' ',
  //         street: data.tcustomervs1[i].fields.Street || ' ',
  //         street2: data.tcustomervs1[i].fields.Street2 || ' ',
  //         street3: data.tcustomervs1[i].fields.Street3 || ' ',
  //         suburb: data.tcustomervs1[i].fields.Suburb || ' ',
  //         statecode: data.tcustomervs1[i].fields.State + ' ' + data.tcustomervs1[i].fields.Postcode || ' ',
  //         country: data.tcustomervs1[i].fields.Country || ' ',
  //         termsName: data.tcustomervs1[i].fields.TermsName || '',
  //         taxCode: data.tcustomervs1[i].fields.TaxCodeName || 'E',
  //         clienttypename: data.tcustomervs1[i].fields.ClientTypeName || 'Default',
  //         discount: data.tcustomervs1[i].fields.Discount || 0
  //       };
  //       clientList.push(customerrecordObj);
  //     }
  //   }
  //   templateObject.clientrecords.set(clientList);
  //   if (FlowRouter.current().queryParams.id || FlowRouter.current().queryParams.customerid || FlowRouter.current().queryParams.copyquid) {
  //   } else {
  //     $('#edtCustomerName').trigger("click");
  //   }
  // }

  // templateObject.getOrganisationDetails = function () {
  //   let account_id = localStorage.getItem('vs1companyStripeID') || '';
  //   let stripe_fee = localStorage.getItem('vs1companyStripeFeeMethod') || 'apply';
  //   this.accountID.set(account_id);
  //   this.stripe_fee_method.set(stripe_fee);
  // };

  // templateObject.getSalesCustomFieldsList = function () {
  //   return;
  // }

  templateObject.getAllLeadStatuss = function () {
    const statusList = [];
    getVS1Data('TLeadStatusType').then(function (dataObject) {
      if (dataObject.length == 0) {
        salesService.getAllLeadStatus().then(function (data) {
          for (let i in data.tleadstatustype) {
            const leadrecordObj = {
              orderstatus: data.tleadstatustype[i].TypeName || ' '
            };
            statusList.push(leadrecordObj);
          }
          templateObject.statusrecords.set(statusList);
        });
      } else {
        let data = JSON.parse(dataObject[0].data);
        let useData = data.tleadstatustype;
        for (let i in useData) {
          const leadrecordObj = {
            orderstatus: useData[i].TypeName || ' '
          };
          statusList.push(leadrecordObj);
        }
        templateObject.statusrecords.set(statusList);
      }
      $('.transheader > #sltStatus_fromtransactionheader').append('<option value="newstatus">New Lead Status</option>');
    }).catch(function (err) {
      salesService.getAllLeadStatus().then(function (data) {
        for (let i in data.tleadstatustype) {
          const leadrecordObj = {
            orderstatus: data.tleadstatustype[i].TypeName || ' '
          };
          statusList.push(leadrecordObj);
        }
        templateObject.statusrecords.set(statusList);
      });
    });
  };

  templateObject.setCustomerInfo = function (selectedTaxCodeName) {
    if (!FlowRouter.current().queryParams.customerid) {
      $('#customerListModal').modal('toggle');
    }
    let taxcodeList = templateObject.taxraterecords.get();
    let customers = templateObject.clientrecords.get();
    let $tblrows = $("#tblSalesOrderLine tbody tr");
    let $printrows = $(".sales_print tbody tr");
    let selectedCustomer = $('#edtCustomerName').val();
    let taxRate = "";
    if (selectedCustomer !== "") {
      getCustDetails = customers.filter(customer => {
        return customer.customername === selectedCustomer
      });
      taxRate = taxcodeList.filter(taxrate => {
        return taxrate.codename === selectedTaxCodeName
      });

      if (taxRate.length > 0) {
        let rate = taxRate[0].coderate;
        let code = selectedTaxCodeName || 'E';
        if (code === "NT") {
          code = "E";
        }
        let taxcodeList = templateObject.taxraterecords.get();
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let subDiscountTotal = 0; // New Discount
        let subGrandTotalNet = 0;
        let taxGrandTotalNet = 0;
        $tblrows.each(function (index) {
          const $tblrow = $(this);
          const qty = $tblrow.find(".lineQty").val() || 0;
          const price = $tblrow.find(".colUnitPriceExChange").val() || 0;
          const taxRate = $tblrow.find(".lineTaxCode").val();
          if ($tblrow.find(".lineProductName").val() === '') {
            $tblrow.find(".colProductName").addClass('boldtablealertsborder');
          }
          let taxrateamount = 0;
          if (taxcodeList) {
            for (var i = 0; i < taxcodeList.length; i++) {
              if (taxcodeList[i].codename == taxRate) {
                taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
              }
            }
          }
          const subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
          const taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
          const lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").text()) || 0; // New Discount
          let lineTotalAmount = subTotal + taxTotal;
          let lineDiscountTotal = lineDiscountPerc / 100;
          const discountTotal = lineTotalAmount * lineDiscountTotal;
          const subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
          const subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
          const taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
          const taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
          if (!isNaN(discountTotal)) {
            subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;
            document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
          }
          $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

          let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
          let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, "")) || 0;
          let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc || 0;
          $tblrow.find('.colUnitPriceExChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
          $tblrow.find('.colUnitPriceIncChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));
          if (!isNaN(subTotal)) {
            $tblrow.find('.colAmountEx').text(utilityService.modifynegativeCurrencyFormat(subTotal));
            $tblrow.find('.colAmountInc').text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
            subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
            subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
            document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
          }
          if (!isNaN(taxTotal)) {
            taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
            taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
            document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
          }
          if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
            let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
            let GrandTotalNet = (parseFloat(subGrandTotalNet)) + (parseFloat(taxGrandTotalNet));
            document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
            document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
            document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
            document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
          }
        });
        $printrows.each(function (index) {
          const $printrows = $(this);
          const qty = $printrows.find("#lineQty").text() || 0;
          const price = $printrows.find("#lineUnitPrice").text() || "0";
          const taxcode = code;
          $printrows.find("#lineTaxCode").text(code);
          $printrows.find("#lineTaxRate").text(rate);
          let taxrateamount = 0;
          if (taxcodeList) {
            for (let i = 0; i < taxcodeList.length; i++) {
              if (taxcodeList[i].codename === taxcode) {
                taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
              }
            }
          }
          const subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
          const taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
          $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
          if (!isNaN(subTotal)) {
            $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
            subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
            document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
          }
          if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
            document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
            document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();
          }
        });
      }
    }
    $('#tblCustomerlist_filter .form-control-sm').val('');
    LoadingOverlay.hide();
  }
  // function setCustomerByID(data) {
  //   $('#edtCustomerName').val(data.fields.ClientName);
  //   $('#edtCustomerName').attr("custid", data.fields.ID);
  //   $('#edtCustomerEmail').val(data.fields.Email);
  //   $('#edtCustomerEmail').attr('customerid', data.fields.ID);
  //   $('#edtCustomerName').attr('custid', data.fields.ID);
  //   $('#edtCustomerEmail').attr('customerfirstname', data.fields.FirstName);
  //   $('#edtCustomerEmail').attr('customerlastname', data.fields.LastName);
  //   $('#customerType').text(data.fields.ClientTypeName || 'Default');
  //   $('#customerDiscount').text(data.fields.Discount + '%' || 0 + '%');
  //   $('#edtCustomerUseType').val(data.fields.ClientTypeName || 'Default');
  //   $('#edtCustomerUseDiscount').val(data.fields.Discount || 0);
  //   const postalAddress = data.fields.Companyname + '\n' + data.fields.Street + '\n' + data.fields.Street2 + ' ' + data.fields.State + ' ' + data.fields.Postcode + '\n' + data.fields.Country;
  //   $('#txabillingAddress').val(postalAddress);
  //   $('#pdfCustomerAddress').html(postalAddress);
  //   $('.pdfCustomerAddress').text(postalAddress);
  //   $('#txaShipingInfo').val(postalAddress);
  //   $('#sltTerms').val(data.fields.TermsName || templateObject.defaultsaleterm.get() || '');
  //   const selectedTaxCodeName = data.fields.TaxCodeName || 'E';
  //   templateObject.setCustomerInfo(selectedTaxCodeName);
  // }

  // templateObject.getCustomerData = function (customerID) {
  //   getVS1Data('TCustomerVS1').then(function (dataObject) {
  //     if (dataObject.length === 0) {
  //       contactService.getOneCustomerDataEx(customerID).then(function (data) {
  //         setCustomerByID(data);
  //       });
  //     } else {
  //       let data = JSON.parse(dataObject[0].data);
  //       let useData = data.tcustomervs1;
  //       let added = false;
  //       for (let i = 0; i < useData.length; i++) {
  //         if (parseInt(useData[i].fields.ID) === parseInt(customerID)) {
  //           added = true;
  //           setCustomerByID(useData[i]);
  //         }
  //       }
  //       if (!added) {
  //         contactService.getOneCustomerDataEx(customerID).then(function (data) {
  //           setCustomerByID(data);
  //         });
  //       }
  //     }
  //   }).catch(function (err) {
  //     contactService.getOneCustomerDataEx(customerID).then(function (data) {
  //       LoadingOverlay.hide();
  //       setCustomerByID(data);
  //     });
  //   });
  // }

  // templateObject.loadSaleOrder = async (refresh = false) => {
  //   const SaleOrderId = FlowRouter.current().queryParams.id;
  //   let data = await CachedHttp.get(erpObject.TSalesOrderEx, async () => {
  //     return await salesService.getOneSalesOrderdataEx(currentSalesOrder);
  //   }, {
  //     forceOverride: refresh,
  //     validate: (cachedResponse) => {
  //       return true;
  //     }
  //   });

  //   data = data.response;
  //   let saleOrders = data.tsalesorderex;
  //   let saleOrder = saleOrders.find(s => s.fields.ID == SaleOrderId);

  //   this.saleOrders.set(saleOrders);
  //   this.saleOrder.set(saleOrder);
  // }

  // this.getDepartments = function () {
  //   const deptrecords = [];
  //   getVS1Data('TDeptClass').then(function (dataObject) {
  //     if (dataObject.length == 0) {
  //       salesService.getDepartment().then(function (data) {
  //         for (let i in data.tdeptclass) {
  //           const deptrecordObj = {
  //             department: data.tdeptclass[i].DeptClassName || ' ',
  //           };
  //           deptrecords.push(deptrecordObj);
  //           templateObject.deptrecords.set(deptrecords);
  //         }
  //       });
  //     } else {
  //       let data = JSON.parse(dataObject[0].data);
  //       let useData = data.tdeptclass;
  //       for (let i in useData) {
  //         const deptrecordObj = {
  //           department: useData[i].DeptClassName || ' ',
  //         };
  //         deptrecords.push(deptrecordObj);
  //         templateObject.deptrecords.set(deptrecords);
  //       }
  //     }
  //   }).catch(function (err) {
  //     salesService.getDepartment().then(function (data) {
  //       for (let i in data.tdeptclass) {
  //         const deptrecordObj = {
  //           department: data.tdeptclass[i].DeptClassName || ' ',
  //         };
  //         deptrecords.push(deptrecordObj);
  //         templateObject.deptrecords.set(deptrecords);
  //       }
  //     });
  //   });
  // };

  templateObject.getDefaultTerm = function () {
    const termrecords = [];
    getVS1Data('TTermsVS1').then(function (dataObject) {
      if (dataObject.length == 0) {
        salesService.getTermVS1().then(function (data) {
          for (let i in data.ttermsvs1) {
            if (data.ttermsvs1[i].isSalesdefault == true) {
              localStorage.setItem('ERPTermsSales', data.ttermsvs1[i].TermsName || "COD");
              templateObject.defaultsaleterm.set(data.ttermsvs1[i].TermsName);
            }
          }
        });
      } else {
        let data = JSON.parse(dataObject[0].data);
        let useData = data.ttermsvs1;
        for (let i in useData) {
          if (useData[i].isSalesdefault == true) {
            templateObject.defaultsaleterm.set(useData[i].TermsName);
          }
        }
      }
    }).catch(function (err) {
      salesService.getTermVS1().then(function (data) {
        for (let i in data.ttermsvs1) {
          if (data.ttermsvs1[i].isSalesdefault == true) {
            localStorage.setItem('ERPTermsSales', data.ttermsvs1[i].TermsName || "COD");
            templateObject.defaultsaleterm.set(data.ttermsvs1[i].TermsName);
          }
        }
      });
    });
  };

  async function getAllBOMProducts() {
    return new Promise(async (resolve, reject) => {
      getVS1Data('TProcTree').then(function (dataObject) {
        if (dataObject.length == 0) {
          productService.getAllBOMProducts(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TProcTree', JSON.stringify(data)).then(function () { resolve(data.tproctree) })
          })
        } else {
          let data = JSON.parse(dataObject[0].data);
          resolve(data.tproctree)
        }
      }).catch(function (e) {
        productService.getAllBOMProducts(initialBaseDataLoad, 0).then(function (data) {
          addVS1Data('TProcTree', JSON.stringify(data)).then(function () { resolve(data.tproctree) })
        })
      })
    })
  }
  async function getAllWorkorders() {
    return new Promise(async function (resolve, reject) {
      getVS1Data('TVS1Workorder').then(function (dataObject) {
        if (dataObject.length == 0) {
          resolve([]);
        } else {
          let data = JSON.parse(dataObject[0].data);
          resolve(data.tvs1workorder)
        }
      })
    })
  }
  templateObject.checkAbleToMakeWorkOrder = async function () {
    let bomProducts = await getAllBOMProducts();
    let workorderList = await getAllWorkorders();
    let returnvalue = false;
    let lineTable = $("#tblSalesOrderLine");
    let orderlines = $(lineTable).find("tbody tr");
    for (let i = 0; i < orderlines.length; i++) {
      let line = orderlines[i];
      let productName = $(line).find(".lineProductName").val();
      let existBOM = false;
      let index = bomProducts.findIndex((product) => {
        return product.Caption == productName;
      });
      if (index > -1) {
        existBOM = true;
      } else {
        await productService.getOneBOMProductByName(productName).then(function (data) {
          if (data.tproctree.length > 0) {
            existBOM = true
          }
        })
      }
      if (existBOM == true) {
        //check if the workorder is already exists
        let workOrderIndex = workorderList.findIndex((order) => {
          return (
            order.fields.SaleID == templateObject.SalesOrderId.get() &&
            order.fields.ProductName == productName
          );
        });
        if (workOrderIndex == -1) {
          returnvalue = true;
        }
      }
    }
    this.abletomakeworkorder.set(returnvalue);
  };

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
  //           this.subtaxcodes.set(subTaxTableList);
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

  // templateObject.getAllTaxCodes = function () {
  //   const taxCodesList = [];
  //   const splashArrayTaxRateList = [];
  //   getVS1Data('TTaxcodeVS1').then(function (dataObject) {
  //     if (dataObject.length == 0) {
  //       salesService.getTaxCodesDetailVS1().then(function (data) {
  //         taxCodes = data.ttaxcodevs1;
  //         templateObject.taxcodes.set(taxCodes);
  //         for (let i = 0; i < data.ttaxcodevs1.length; i++) {
  //           let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
  //           const dataList = [
  //             data.ttaxcodevs1[i].Id || '',
  //             data.ttaxcodevs1[i].CodeName || '',
  //             data.ttaxcodevs1[i].Description || '-',
  //             taxRate || 0,
  //           ];
  //           let taxcoderecordObj = {
  //             codename: data.ttaxcodevs1[i].CodeName || ' ',
  //             coderate: taxRate || ' ',
  //           };
  //           taxCodesList.push(taxcoderecordObj);
  //           splashArrayTaxRateList.push(dataList);
  //         }
  //         templateObject.taxraterecords.set(taxCodesList);
  //         if (splashArrayTaxRateList) {
  //           $('#tblTaxRate').DataTable({
  //             data: splashArrayTaxRateList,
  //             "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
  //             paging: true,
  //             "aaSorting": [],
  //             "orderMulti": true,
  //             columnDefs: [{
  //               orderable: false,
  //               targets: 0
  //             }, {
  //               className: "taxName",
  //               "targets": [1]
  //             }, {
  //               className: "taxDesc",
  //               "targets": [2]
  //             }, {
  //               className: "taxRate text-right",
  //               "targets": [3]
  //             }],
  //             select: true,
  //             destroy: true,
  //             colReorder: true,
  //             bStateSave: true,
  //             pageLength: initialDatatableLoad,
  //             lengthMenu: [
  //               [initialDatatableLoad, -1],
  //               [initialDatatableLoad, "All"]
  //             ],
  //             info: true,
  //             responsive: true,
  //             language: { search: "", searchPlaceholder: "Search List..." },
  //             "fnInitComplete": function () {
  //               $("<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTaxRate_filter");
  //               $("<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTaxRate_filter");
  //             }
  //           });
  //         }
  //       })
  //     } else {
  //       let data = JSON.parse(dataObject[0].data);
  //       let useData = data.ttaxcodevs1;
  //       taxCodes = data.ttaxcodevs1;
  //       templateObject.taxcodes.set(taxCodes);
  //       for (let i = 0; i < useData.length; i++) {
  //         let taxRate = (useData[i].Rate * 100).toFixed(2);
  //         const dataList = [
  //           useData[i].Id || '',
  //           useData[i].CodeName || '',
  //           useData[i].Description || '-',
  //           taxRate || 0,
  //         ];
  //         const taxcoderecordObj = {
  //           codename: useData[i].CodeName || ' ',
  //           coderate: taxRate || ' ',
  //         };
  //         taxCodesList.push(taxcoderecordObj);
  //         splashArrayTaxRateList.push(dataList);
  //       }
  //       tempObj.taxraterecords.set(taxCodesList);
  //       if (splashArrayTaxRateList) {
  //         $('#tblTaxRate').DataTable({
  //           data: splashArrayTaxRateList,
  //           "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
  //           paging: true,
  //           "aaSorting": [],
  //           "orderMulti": true,
  //           columnDefs: [{
  //             orderable: false,
  //             targets: 0
  //           }, {
  //             className: "taxName",
  //             "targets": [1]
  //           }, {
  //             className: "taxDesc",
  //             "targets": [2]
  //           }, {
  //             className: "taxRate text-right",
  //             "targets": [3]
  //           }],
  //           select: true,
  //           destroy: true,
  //           colReorder: true,
  //           bStateSave: true,
  //           pageLength: initialDatatableLoad,
  //           lengthMenu: [
  //             [initialDatatableLoad, -1],
  //             [initialDatatableLoad, "All"]
  //           ],
  //           info: true,
  //           responsive: true,
  //           language: { search: "", searchPlaceholder: "Search List..." },
  //           "fnInitComplete": function () {
  //             $("<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTaxRate_filter");
  //             $("<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTaxRate_filter");
  //           }
  //         });
  //       }
  //     }
  //   }).catch(function (err) {
  //     salesService.getTaxCodesDetailVS1().then(function (data) {
  //       taxCodes = data.ttaxcodevs1;
  //       templateObject.taxcodes.set(taxCodes);
  //       for (let i = 0; i < data.ttaxcodevs1.length; i++) {
  //         let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
  //         const dataList = [
  //           data.ttaxcodevs1[i].Id || '',
  //           data.ttaxcodevs1[i].CodeName || '',
  //           data.ttaxcodevs1[i].Description || '-',
  //           taxRate || 0,
  //         ];
  //         const taxcoderecordObj = {
  //           codename: data.ttaxcodevs1[i].CodeName || ' ',
  //           coderate: taxRate || ' ',
  //         };
  //         taxCodesList.push(taxcoderecordObj);
  //         splashArrayTaxRateList.push(dataList);
  //       }
  //       templateObject.taxraterecords.set(taxCodesList);
  //       if (splashArrayTaxRateList) {
  //         $('#tblTaxRate').DataTable({
  //           data: splashArrayTaxRateList,
  //           "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
  //           paging: true,
  //           "aaSorting": [],
  //           "orderMulti": true,
  //           columnDefs: [{
  //             orderable: false,
  //             targets: 0
  //           }, {
  //             className: "taxName",
  //             "targets": [1]
  //           }, {
  //             className: "taxDesc",
  //             "targets": [2]
  //           }, {
  //             className: "taxRate text-right",
  //             "targets": [3]
  //           }],
  //           select: true,
  //           destroy: true,
  //           colReorder: true,
  //           bStateSave: true,
  //           pageLength: initialDatatableLoad,
  //           lengthMenu: [
  //             [initialDatatableLoad, -1],
  //             [initialDatatableLoad, "All"]
  //           ],
  //           info: true,
  //           responsive: true,
  //           language: { search: "", searchPlaceholder: "Search List..." },
  //           "fnInitComplete": function () {
  //             $("<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTaxRate_filter");
  //             $("<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTaxRate_filter");
  //           }
  //         });
  //       }
  //     })
  //   });
  // };

  templateObject.getOrganisationDetails = function () {
    let account_id = localStorage.getItem("vs1companyStripeID") || "";
    let stripe_fee = localStorage.getItem("vs1companyStripeFeeMethod") || "apply";
    templateObject.accountID.set(account_id);
    templateObject.stripe_fee_method.set(stripe_fee);
  };
  templateObject.getOrganisationDetails()

  

 
  // templateObject.print = async function (_template = '') {
  //   LoadingOverlay.show();
  //   setTimeout(async function () {
  //     var printTemplate = [];
  //     var sales_orders = $('input[name="Sales Orders"]:checked').val();
  //     let emid = localStorage.getItem('mySessionEmployeeLoggedID');
  //     var delivery_docket = $('input[name="Delivery Docket"]:checked').val();

  //     if (_template !== '') {
  //       const _templateNumber = $(`input[name="${_template}"]:checked`).val();
  //       await templateObject.exportSalesToPdf(_template, _templateNumber);
  //       return;
  //     }

  //     if ($('#print_sales_order').is(':checked') || $('#print_sales_order_second').is(':checked')) {
  //       printTemplate.push('Sales Orders');
  //     }

  //     if ($('#print_delivery_docket').is(':checked') || $('#print_delivery_docket_second').is(':checked')) {
  //       printTemplate.push('Delivery Docket');
  //     }

  //     if (!printTemplate.length) {
  //       printTemplate.push("Sales Orders");
  //     }

  //     for (var i = 0; i < printTemplate.length; i++) {
  //       if (printTemplate[i] == 'Sales Order') {
  //         var template_number = $('input[name="Sales Orders"]:checked').val();
  //       }
  //       else if (printTemplate[i] == 'Delivery Docket') {
  //         var template_number = $('input[name="Delivery Docket"]:checked').val();
  //       }
  //       await templateObject.exportSalesToPdf(printTemplate[i], template_number);
  //     }

  //     // Send email
  //     const isEmailChecked = $("#printModal").find("#emailSend").is(":checked");
  //     if (isEmailChecked) {
  //       await templateObject.sendEmailWithAttatchment();
  //     }

  //   }, delayTimeAfterSound);
  // }

  // templateObject.getCurrencies = async function () {
  //   let currencyData = [];
  //   let dataObject = await getVS1Data("TCurrencyList");
  //   if (dataObject.length == 0) {
  //     taxRateService.getCurrencies().then(function (data) {
  //       for (let i in data.tcurrencylist) {
  //         let currencyObj = {
  //           id: data.tcurrencylist[i].CurrencyID || "",
  //           currency: data.tcurrencylist[i].Currency || "",
  //           currencySellRate: data.tcurrencylist[i].SellRate || "",
  //           currencyBuyRate: data.tcurrencylist[i].BuyRate || "",
  //           currencyCode: data.tcurrencylist[i].Code || "",
  //         };

  //         currencyData.push(currencyObj);
  //       }
  //       templateObject.currencyData.set(currencyData);
  //     });
  //   } else {
  //     let data = JSON.parse(dataObject[0].data);
  //     let useData = data.tcurrencylist;
  //     for (let i in useData) {
  //       let currencyObj = {
  //         id: data.tcurrencylist[i].CurrencyID || "",
  //         currency: data.tcurrencylist[i].Currency || "",
  //         currencySellRate: data.tcurrencylist[i].SellRate || "",
  //         currencyBuyRate: data.tcurrencylist[i].BuyRate || "",
  //         currencyCode: data.tcurrencylist[i].Code || "",
  //       };

  //       currencyData.push(currencyObj)
  //     }
  //     templateObject.currencyData.set(currencyData);
  //   }
  // }
  // templateObject.getCurrencyRate = (currency, type) => {
  //   let currencyData = templateObject.currencyData.get();
  //   for (let i = 0; i < currencyData.length; i++) {
  //     if (currencyData[i].currencyCode == currency || currencyData[i].currency == currency) {
  //       if (type == 0) return currencyData[i].currencySellRate;
  //       else return currencyData[i].currencyBuyRate;
  //     }
  //   };
  // };
});

Template.new_salesorder_temp.onRendered(function () {
  let templateObject = Template.instance();

  // templateObject.getCurrencies();
  // templateObject.hasFollowings();
  // templateObject.getAllClients();
  // templateObject.getOrganisationDetails();
  // templateObject.getAllLeadStatuss();
  // templateObject.getTemplateInfoNew();
  // templateObject.getSalesCustomFieldsList()
  // templateObject.loadSaleOrder();
  // templateObject.getDepartments();
  templateObject.getDefaultTerm();
  // templateObject.getAllTaxCodes();
  // templateObject.getSubTaxCodes();

  let currentSalesOrder;
  let getso_id;

  // $('#edtFrequencyDetail').css('display', 'none');
  // $("#date-input,#edtWeeklyStartDate,#edtWeeklyFinishDate,#dtDueDate,#customdateone,#edtMonthlyStartDate,#edtMonthlyFinishDate,#edtDailyStartDate,#edtDailyFinishDate,#edtOneTimeOnlyDate").datepicker({
  //   showOn: 'button',
  //   buttonText: 'Show Date',
  //   buttonImageOnly: true,
  //   buttonImage: '/img/imgCal2.png',
  //   constrainInput: false,
  //   dateFormat: 'd/mm/yy',
  //   showOtherMonths: true,
  //   selectOtherMonths: true,
  //   changeMonth: true,
  //   changeYear: true,
  //   yearRange: "-90:+10",
  // });

  // $('#choosetemplate').attr('checked', true);
  // $(document).on("click", ".templateItem .btnPreviewTemplate", function (e) {
  //   title = $(this).parent().attr("data-id");
  //   number = $(this).parent().attr("data-template-id");//e.getAttribute("data-template-id");
  //   templateObject.generateInvoiceData(title, number);
  // });

  // $(window).on('load', function () {
  //   const win = $(this); //this = window
  //   if (win.width() <= 1024 && win.width() >= 450) {
  //     $("#colBalanceDue").addClass("order-12");
  //   }
  //   if (win.width() <= 926) {
  //     $("#totalSection").addClass("offset-md-6");
  //   }
  // });

  let imageData = (localStorage.getItem("Image"));
  if (imageData) {
    $('.uploadedImage').attr('src', imageData);
  }
  const clientList = [];


  // $("#date-input,#dtSODate,#dtDueDate").datepicker({
  //   showOn: 'button',
  //   buttonText: 'Show Date',
  //   buttonImageOnly: true,
  //   buttonImage: '/img/imgCal2.png',
  //   dateFormat: 'dd/mm/yy',
  //   showOtherMonths: true,
  //   selectOtherMonths: true,
  //   changeMonth: true,
  //   changeYear: true,
  //   yearRange: "-90:+10",
  // });

  LoadingOverlay.show();

  // $(document).ready(function () {
  //   $('#formCheck-one').click(function () {
  //     if ($(event.target).is(':checked')) {
  //       $('.checkbox1div').css('display', 'block');
  //     } else {
  //       $('.checkbox1div').css('display', 'none');
  //     }
  //   });

  //   $('#formCheck-two').click(function () {
  //     if ($(event.target).is(':checked')) {
  //       $('.checkbox2div').css('display', 'block');
  //     } else {
  //       $('.checkbox2div').css('display', 'none');
  //     }
  //   });

  //   $('.customField1Text').blur(function () {
  //     var inputValue1 = $('.customField1Text').text();
  //     $('.lblCustomField1').text(inputValue1);
  //   });

  //   $('.customField2Text').blur(function () {
  //     var inputValue2 = $('.customField2Text').text();
  //     $('.lblCustomField2').text(inputValue2);
  //   });


  // });
  /**
   *
   * Loading the saleOrders
   * Loading the current SaleOrder
   */

  // let url = FlowRouter.current().path;
  // if (url.indexOf('?id=') > 0) {
  //   getso_id = url.split('?id=');
  //   currentSalesOrder = getso_id[getso_id.length - 1];
  //   if (getso_id[1]) {
  //     currentSalesOrder = parseInt(currentSalesOrder);
  //     $('.printID').attr("id", currentSalesOrder);
  //     templateObject.getSalesOrderData = function () {
  //       getVS1Data('TSalesOrderEx').then(function (dataObject) {
  //         if (dataObject.length == 0) {
  //           salesService.getOneSalesOrderdataEx(currentSalesOrder).then(function (data) {
  //             LoadingOverlay.hide();
  //             let lineItems = [];
  //             let lineItemObj = {};
  //             let lineItemsTable = [];
  //             let currencySymbol = Currency;
  //             let totalInc = currencySymbol + '' + data.fields.TotalAmountInc.toLocaleString(undefined, {
  //               minimumFractionDigits: 2
  //             });
  //             let totalDiscount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalDiscount).toLocaleString(undefined, {
  //               minimumFractionDigits: 2
  //             });

  //             let subTotal = currencySymbol + '' + data.fields.TotalAmount.toLocaleString(undefined, {
  //               minimumFractionDigits: 2
  //             });
  //             let totalTax = currencySymbol + '' + data.fields.TotalTax.toLocaleString(undefined, {
  //               minimumFractionDigits: 2
  //             });
  //             let totalBalance = currencySymbol + '' + data.fields.TotalBalance.toLocaleString(undefined, {
  //               minimumFractionDigits: 2
  //             });
  //             let totalPaidAmount = currencySymbol + '' + data.fields.TotalPaid.toLocaleString(undefined, {
  //               minimumFractionDigits: 2
  //             });

  //             if (data.fields.Lines != null) {
  //               if (data.fields.Lines.length) {
  //                 for (let i = 0; i < data.fields.Lines.length; i++) {
  //                   let AmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {
  //                     minimumFractionDigits: 2
  //                   });
  //                   let currencyAmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
  //                   let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
  //                   let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);

  //                   let serialno = "";
  //                   let lotno = "";
  //                   let expirydate = "";
  //                   if (data.fields.Lines[i].fields?.PQA?.fields?.PQASN != null) {
  //                     for (let j = 0; j < data.fields.Lines[i].fields.PQA.fields.PQASN.length; j++) {
  //                       serialno += (serialno == "") ? data.fields.Lines[i].fields.PQA.fields.PQASN[j].fields.SerialNumber : "," + data.fields.Lines[i].fields.PQA.fields.PQASN[j].fields.SerialNumber;
  //                     }
  //                   }
  //                   if (data.fields.Lines[i].fields.PQA.fields.PQABatch != null) {
  //                     for (let j = 0; j < data.fields.Lines[i].fields.PQA.fields.PQABatch.length; j++) {
  //                       lotno += (lotno == "") ? data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchNo : "," + data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchNo;
  //                       let expirydateformat = data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate != '' ? moment(data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate).format("YYYY/MM/DD") : data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate;
  //                       expirydate += (expirydate == "") ? expirydateformat : "," + expirydateformat;
  //                     }
  //                   }
  //                   lineItemObj = {
  //                     lineID: Random.id(),
  //                     id: data.fields.Lines[i].fields.ID || '',
  //                     item: data.fields.Lines[i].fields.ProductName || '',
  //                     description: data.fields.Lines[i].fields.ProductDescription || '',
  //                     quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
  //                     unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                     unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                     TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                     TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                     lineCost: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
  //                       minimumFractionDigits: 2
  //                     }) || 0,
  //                     taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
  //                     taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
  //                     curTotalAmt: currencyAmountGbp || currencySymbol + '0',
  //                     TaxTotal: TaxTotalGbp || 0,
  //                     TaxRate: TaxRateGbp || 0,
  //                     DiscountPercent: data.fields.Lines[i].fields.DiscountPercent || 0,
  //                     serialnumbers: serialno,
  //                     lotnumbers: lotno,
  //                     expirydates: expirydate
  //                   };
  //                   var dataListTable = [
  //                     data.fields.Lines[i].fields.ProductName || '',
  //                     data.fields.Lines[i].fields.ProductDescription || '',
  //                     "<div contenteditable='true' class='qty'>" + '' + data.fields.Lines[i].fields.UOMOrderQty + '' + "</div>" || "<div>" + '' + 0 + '' + "</div>",
  //                     "<div>" + '' + currencySymbol + '' + data.fields.Lines[i].fields.LinePrice.toFixed(2) + '' + "</div>" || currencySymbol + '' + 0.00,
  //                     data.fields.Lines[i].fields.LineTaxCode || '',
  //                     AmountGbp || currencySymbol + '' + 0.00,
  //                     '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
  //                   ];
  //                   lineItemsTable.push(dataListTable);
  //                   lineItems.push(lineItemObj);
  //                 }
  //               } else {
  //                 let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
  //                 let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines.fields.LineTaxTotal);
  //                 let TaxRateGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxRate;
  //                 let serialno = "";
  //                 let lotno = "";
  //                 let expirydate = "";
  //                 if (data.fields.Lines.fields?.PQA?.fields?.PQASN != null) {
  //                   for (let j = 0; j < data.fields.Lines.fields.PQA.fields.PQASN.length; j++) {
  //                     serialno += (serialno == "") ? data.fields.Lines.fields.PQA.fields.PQASN[j].fields.SerialNumber : "," + data.fields.Lines.fields.PQA.fields.PQASN[j].fields.SerialNumber;
  //                   }
  //                 }
  //                 if (data.fields.Lines.fields.PQA.fields.PQABatch != null) {
  //                   for (let j = 0; j < data.fields.Lines.fields.PQA.fields.PQABatch.length; j++) {
  //                     lotno += (lotno == "") ? data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchNo : "," + data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchNo;
  //                     let expirydateformat = data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate != '' ? moment(data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate).format("YYYY/MM/DD") : data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate;
  //                     expirydate += (expirydate == "") ? expirydateformat : "," + expirydateformat;
  //                   }
  //                 }
  //                 const lineItemObj = {
  //                   lineID: Random.id(),
  //                   id: data.fields.Lines.fields.ID || '',
  //                   description: data.fields.Lines.fields.ProductDescription || '',
  //                   quantity: data.fields.Lines.fields.UOMOrderQty || 0,
  //                   unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                   unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                   TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                   TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                   lineCost: data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
  //                     minimumFractionDigits: 2
  //                   }) || 0,
  //                   taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
  //                   taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
  //                   curTotalAmt: currencyAmountGbp || currencySymbol + '0',
  //                   TaxTotal: TaxTotalGbp || 0,
  //                   TaxRate: TaxRateGbp || 0,
  //                   serialnumbers: serialno,
  //                   lotnumbers: lotno,
  //                   expirydates: expirydate
  //                 };
  //                 lineItems.push(lineItemObj);
  //               }
  //             }
  //             let salesorderrecord = {
  //               id: data.fields.ID,
  //               lid: 'Edit Sales Order' + ' ' + data.fields.ID,
  //               socustomer: data.fields.CustomerName,
  //               salesOrderto: data.fields.InvoiceToDesc,
  //               shipto: data.fields.ShipToDesc,
  //               department: data.fields.SaleClassName,
  //               docnumber: data.fields.DocNumber,
  //               custPONumber: data.fields.CustPONumber,
  //               saledate: data.fields.SaleDate ? moment(data.fields.SaleDate).format('DD/MM/YYYY') : "",
  //               duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
  //               employeename: data.fields.EmployeeName,
  //               status: data.fields.SalesStatus,
  //               category: data.fields.SalesCategory,
  //               comments: data.fields.Comments,
  //               pickmemo: data.fields.PickMemo,
  //               ponumber: data.fields.CustPONumber,
  //               via: data.fields.Shipping,
  //               connote: data.fields.ConNote,
  //               reference: data.fields.ReferenceNo,
  //               currency: data.fields.ForeignExchangeCode,
  //               branding: data.fields.MedType,
  //               invoiceToDesc: data.fields.InvoiceToDesc,
  //               shipToDesc: data.fields.ShipToDesc,
  //               termsName: data.fields.TermsName,
  //               Total: totalInc,
  //               TotalDiscount: totalDiscount,
  //               LineItems: lineItems,
  //               TotalTax: totalTax,
  //               SubTotal: subTotal,
  //               balanceDue: totalBalance,
  //               saleCustField1: data.fields.SaleCustField1,
  //               saleCustField2: data.fields.SaleCustField2,
  //               totalPaid: totalPaidAmount,
  //               isConverted: data.fields.Converted,
  //               CustomerID: data.fields.CustomerID,
  //               ClientName: data.fields.CustomerName,
  //               ClientEmail: data.fields.ContactEmail
  //             };

  //             $('#edtCustomerName').val(data.fields.CustomerName);
  //             templateObject.CleintName.set(data.fields.CustomerName);
  //             $('.sltCurrency').val(data.fields.ForeignExchangeCode);
  //             //$('#exchange_rate').val(data.fields.ForeignExchangeRate);
  //             $('#exchange_rate').val(templateObject.getCurrencyRate(data.fields.ForeignExchangeCode, 1));
  //             $('#sltStatus').val(data.fields.SalesStatus);
  //             $('#sltTerms').val(data.fields.TermsName);
  //             $('#sltDept').val(data.fields.SaleClassName);

  //             /* START attachment */
  //             templateObject.attachmentCount.set(0);
  //             if (data.fields.Attachments) {
  //               if (data.fields.Attachments.length) {
  //                 templateObject.attachmentCount.set(data.fields.Attachments.length);
  //                 templateObject.uploadedFiles.set(data.fields.Attachments);
  //               }
  //             }
  //             /* END  attachment */
  //             var checkISCustLoad = false;
  //             setTimeout(function () {
  //               if (clientList) {
  //                 for (var i = 0; i < clientList.length; i++) {
  //                   if (clientList[i].customername == data.fields.CustomerName) {
  //                     checkISCustLoad = true;
  //                     salesorderrecord.firstname = clientList[i].firstname || '';
  //                     salesorderrecord.lastname = clientList[i].lastname || '';
  //                     templateObject.salesorderrecord.set(salesorderrecord);
  //                     $('#edtCustomerEmail').val(clientList[i].customeremail);
  //                     $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
  //                     $('#edtCustomerName').attr('custid', clientList[i].customerid);
  //                     $('#edtCustomerEmail').attr('customerfirstname', clientList[i].firstname);
  //                     $('#edtCustomerEmail').attr('customerlastname', clientList[i].lastname);
  //                     $('#customerType').text(clientList[i].clienttypename || 'Default');
  //                     $('#customerDiscount').text(clientList[i].discount + '%' || 0 + '%');
  //                     $('#edtCustomerUseType').val(clientList[i].clienttypename || 'Default');
  //                     $('#edtCustomerUseDiscount').val(clientList[i].discount || 0);
  //                   }
  //                 }
  //               }
  //             }, 100);
  //             templateObject.salesorderrecord.set(salesorderrecord);
  //             templateObject.selectedCurrency.set(salesorderrecord.currency);
  //             templateObject.inputSelectedCurrency.set(salesorderrecord.currency);
  //             setTimeout(() => {
  //               templateObject.checkAbleToMakeWorkOrder()
  //             }, 1000)
  //             if (templateObject.salesorderrecord.get()) {
  //               Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblSalesOrderLine', function (error, result) {
  //                 if (error) {
  //                 } else {
  //                   if (result) {
  //                     for (let i = 0; i < result.customFields.length; i++) {
  //                       let customcolumn = result.customFields;
  //                       let columData = customcolumn[i].label;
  //                       let columHeaderUpdate = customcolumn[i].thclass;
  //                       let hiddenColumn = customcolumn[i].hidden;
  //                       let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
  //                       let columnWidth = customcolumn[i].width;

  //                       $("" + columHeaderUpdate + "").html(columData);
  //                       if (columnWidth != 0) {
  //                         $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
  //                       }
  //                       if (hiddenColumn == true) {
  //                         $("." + columnClass + "").addClass('hiddenColumn');
  //                         $("." + columnClass + "").removeClass('showColumn');
  //                       } else if (hiddenColumn == false) {
  //                         $("." + columnClass + "").removeClass('hiddenColumn');
  //                         $("." + columnClass + "").addClass('showColumn');
  //                       }
  //                     }
  //                   }
  //                 }
  //               });
  //             }
  //           }).catch(function (err) {
  //             swal({
  //               title: 'Oooops...',
  //               text: err,
  //               type: 'error',
  //               showCancelButton: false,
  //               confirmButtonText: 'Try Again'
  //             }).then((result) => {
  //               if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
  //             });
  //             LoadingOverlay.hide();
  //           });
  //         } else {
  //           let data = JSON.parse(dataObject[0].data);
  //           let useData = data.tsalesorderex;
  //           var added = false;
  //           for (let d = 0; d < useData.length; d++) {
  //             if (parseInt(data.fields.ID) === currentSalesOrder) {
  //               added = true;
  //               LoadingOverlay.hide();
  //               let lineItems = [];
  //               let lineItemsTable = [];
  //               let currencySymbol = Currency;
  //               let totalInc = currencySymbol + '' + data.fields.TotalAmountInc.toLocaleString(undefined, {
  //                 minimumFractionDigits: 2
  //               });

  //               let totalDiscount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalDiscount).toLocaleString(undefined, {
  //                 minimumFractionDigits: 2
  //               });

  //               let subTotal = currencySymbol + '' + data.fields.TotalAmount.toLocaleString(undefined, {
  //                 minimumFractionDigits: 2
  //               });
  //               let totalTax = currencySymbol + '' + data.fields.TotalTax.toLocaleString(undefined, {
  //                 minimumFractionDigits: 2
  //               });
  //               let totalBalance = currencySymbol + '' + data.fields.TotalBalance.toLocaleString(undefined, {
  //                 minimumFractionDigits: 2
  //               });
  //               let totalPaidAmount = currencySymbol + '' + data.fields.TotalPaid.toLocaleString(undefined, {
  //                 minimumFractionDigits: 2
  //               });
  //               if (data.fields.Lines.length) {
  //                 for (let i = 0; i < data.fields.Lines.length; i++) {
  //                   let AmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {
  //                     minimumFractionDigits: 2
  //                   });
  //                   let currencyAmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
  //                   let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
  //                   let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);

  //                   let serialno = "";
  //                   let lotno = "";
  //                   let expirydate = "";
  //                   if (data.fields.Lines[i].fields?.PQA?.fields?.PQASN != null) {
  //                     for (let j = 0; j < data.fields.Lines[i].fields.PQA.fields.PQASN.length; j++) {
  //                       serialno += (serialno == "") ? data.fields.Lines[i].fields.PQA.fields.PQASN[j].fields.SerialNumber : "," + data.fields.Lines[i].fields.PQA.fields.PQASN[j].fields.SerialNumber;
  //                     }
  //                   }
  //                   if (data.fields.Lines[i].fields?.PQA?.fields?.PQABatch != null) {
  //                     for (let j = 0; j < data.fields.Lines[i].fields.PQA.fields.PQABatch.length; j++) {
  //                       lotno += (lotno == "") ? data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchNo : "," + data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchNo;
  //                       let expirydateformat = data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate != '' ? moment(data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate).format("YYYY/MM/DD") : data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate;
  //                       expirydate += (expirydate == "") ? expirydateformat : "," + expirydateformat;
  //                     }
  //                   }

  //                   const lineItemObj = {
  //                     lineID: Random.id(),
  //                     id: data.fields.Lines[i].fields.ID || '',
  //                     item: data.fields.Lines[i].fields.ProductName || '',
  //                     description: data.fields.Lines[i].fields.ProductDescription || '',
  //                     quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
  //                     unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                     unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                     TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                     TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                     lineCost: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
  //                       minimumFractionDigits: 2
  //                     }) || 0,
  //                     taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
  //                     taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
  //                     //TotalAmt: AmountGbp || 0,
  //                     curTotalAmt: currencyAmountGbp || currencySymbol + '0',
  //                     TaxTotal: TaxTotalGbp || 0,
  //                     TaxRate: TaxRateGbp || 0,
  //                     DiscountPercent: data.fields.Lines[i].fields.DiscountPercent || 0,
  //                     pqaseriallotdata: data.fields.Lines[i].fields.PQA || '',
  //                     serialnumbers: serialno,
  //                     lotnumbers: lotno,
  //                     expirydates: expirydate
  //                   };
  //                   var dataListTable = [
  //                     data.fields.Lines[i].fields.ProductName || '',
  //                     data.fields.Lines[i].fields.ProductDescription || '',
  //                     "<div contenteditable='true' class='qty'>" + '' + data.fields.Lines[i].fields.UOMOrderQty + '' + "</div>" || "<div>" + '' + 0 + '' + "</div>",
  //                     "<div>" + '' + currencySymbol + '' + data.fields.Lines[i].fields.LinePrice.toFixed(2) + '' + "</div>" || currencySymbol + '' + 0.00,
  //                     data.fields.Lines[i].fields.LineTaxCode || '',
  //                     AmountGbp || currencySymbol + '' + 0.00,
  //                     '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
  //                   ];
  //                   lineItemsTable.push(dataListTable);
  //                   lineItems.push(lineItemObj);
  //                 }
  //               } else {
  //                 let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
  //                 let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines.fields.LineTaxTotal);
  //                 let TaxRateGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxRate;

  //                 let serialno = "";
  //                 let lotno = "";
  //                 let expirydate = "";
  //                 if (data.fields.Lines.fields?.PQA?.fields?.PQASN != null) {
  //                   for (let j = 0; j < data.fields.Lines.fields.PQA.fields.PQASN.length; j++) {
  //                     serialno += (serialno == "") ? data.fields.Lines.fields.PQA.fields.PQASN[j].fields.SerialNumber : "," + data.fields.Lines.fields.PQA.fields.PQASN[j].fields.SerialNumber;
  //                   }
  //                 }
  //                 if (data.fields.Lines.fields?.PQA?.fields?.PQABatch != null) {
  //                   for (let j = 0; j < data.fields.Lines.fields.PQA.fields.PQABatch.length; j++) {
  //                     lotno += (lotno == "") ? data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchNo : "," + data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchNo;
  //                     let expirydateformat = data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate != '' ? moment(data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate).format("YYYY/MM/DD") : data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate;
  //                     expirydate += (expirydate == "") ? expirydateformat : "," + expirydateformat;
  //                   }
  //                 }

  //                 const lineItemObj = {
  //                   lineID: Random.id(),
  //                   id: data.fields.Lines.fields.ID || '',
  //                   description: data.fields.Lines.fields.ProductDescription || '',
  //                   quantity: data.fields.Lines.fields.UOMOrderQty || 0,
  //                   unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                   unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                   TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                   TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                   lineCost: data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
  //                     minimumFractionDigits: 2
  //                   }) || 0,
  //                   taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
  //                   taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
  //                   curTotalAmt: currencyAmountGbp || currencySymbol + '0',
  //                   TaxTotal: TaxTotalGbp || 0,
  //                   TaxRate: TaxRateGbp || 0,
  //                   pqaseriallotdata: data.fields.Lines[i].fields.PQA || '',
  //                   serialnumbers: serialno,
  //                   lotnumbers: lotno,
  //                   expirydates: expirydate
  //                 };
  //                 lineItems.push(lineItemObj);
  //               }
  //               let salesorderrecord = {
  //                 id: data.fields.ID,
  //                 lid: 'Edit Sales Order' + ' ' + data.fields.ID,
  //                 socustomer: data.fields.CustomerName,
  //                 salesOrderto: data.fields.InvoiceToDesc,
  //                 shipto: data.fields.ShipToDesc,
  //                 department: data.fields.SaleClassName,
  //                 docnumber: data.fields.DocNumber,
  //                 custPONumber: data.fields.CustPONumber,
  //                 saledate: data.fields.SaleDate ? moment(data.fields.SaleDate).format('DD/MM/YYYY') : "",
  //                 duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
  //                 employeename: data.fields.EmployeeName,
  //                 status: data.fields.SalesStatus,
  //                 category: data.fields.SalesCategory,
  //                 comments: data.fields.Comments,
  //                 pickmemo: data.fields.PickMemo,
  //                 ponumber: data.fields.CustPONumber,
  //                 via: data.fields.Shipping,
  //                 connote: data.fields.ConNote,
  //                 reference: data.fields.ReferenceNo,
  //                 currency: data.fields.ForeignExchangeCode,
  //                 branding: data.fields.MedType,
  //                 invoiceToDesc: data.fields.InvoiceToDesc,
  //                 shipToDesc: data.fields.ShipToDesc,
  //                 termsName: data.fields.TermsName,
  //                 Total: totalInc,
  //                 TotalDiscount: totalDiscount,
  //                 LineItems: lineItems,
  //                 TotalTax: totalTax,
  //                 SubTotal: subTotal,
  //                 balanceDue: totalBalance,
  //                 saleCustField1: data.fields.SaleCustField1,
  //                 saleCustField2: data.fields.SaleCustField2,
  //                 totalPaid: totalPaidAmount,
  //                 isConverted: data.fields.Converted,
  //                 CustomerID: data.fields.CustomerID,
  //                 ClientEmail: data.fields.ContactEmail,
  //                 ClientName: data.fields.ClientName
  //               };

  //               $('#edtCustomerName').val(data.fields.CustomerName);
  //               templateObject.CleintName.set(data.fields.CustomerName);
  //               //$('#exchange_rate').val(data.fields.ForeignExchangeRate);
  //               $('.sltCurrency').val(data.fields.ForeignExchangeCode);
  //               $('#exchange_rate').val(templateObject.getCurrencyRate(data.fields.ForeignExchangeCode, 1));
  //               $('#sltStatus').val(data.fields.SalesStatus);
  //               $('#sltTerms').val(data.fields.TermsName);
  //               $('#sltDept').val(data.fields.SaleClassName);

  //               /* START attachment */
  //               templateObject.attachmentCount.set(0);
  //               if (data.fields.Attachments) {
  //                 if (data.fields.Attachments.length) {
  //                   templateObject.attachmentCount.set(data.fields.Attachments.length);
  //                   templateObject.uploadedFiles.set(data.fields.Attachments);
  //                 }
  //               }
  //               /* END  attachment */
  //               var checkISCustLoad = false;
  //               setTimeout(function () {
  //                 if (clientList) {
  //                   for (var i = 0; i < clientList.length; i++) {
  //                     if (clientList[i].customername == data.fields.CustomerName) {
  //                       checkISCustLoad = true;
  //                       salesorderrecord.firstname = clientList[i].firstname || '';
  //                       salesorderrecord.lastname = clientList[i].lastname || '';
  //                       templateObject.salesorderrecord.set(salesorderrecord);
  //                       $('#edtCustomerEmail').val(clientList[i].customeremail);
  //                       $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
  //                       $('#edtCustomerName').attr('custid', clientList[i].customerid);
  //                       $('#edtCustomerEmail').attr('customerfirstname', clientList[i].firstname);
  //                       $('#edtCustomerEmail').attr('customerlastname', clientList[i].lastname);
  //                       $('#customerType').text(clientList[i].clienttypename || 'Default');
  //                       $('#customerDiscount').text(clientList[i].discount + '%' || 0 + '%');
  //                       $('#edtCustomerUseType').val(clientList[i].clienttypename || 'Default');
  //                       $('#edtCustomerUseDiscount').val(clientList[i].discount || 0);
  //                     }
  //                   }
  //                 }

  //                 if (!checkISCustLoad) {
  //                   sideBarService.getCustomersDataByName(data.fields.CustomerName).then(function (dataClient) {
  //                     for (var c = 0; c < dataClient.tcustomervs1.length; c++) {
  //                       var customerrecordObj = {
  //                         customerid: dataClient.tcustomervs1[c].Id || ' ',
  //                         firstname: dataClient.tcustomervs1[c].FirstName || ' ',
  //                         lastname: dataClient.tcustomervs1[c].LastName || ' ',
  //                         customername: dataClient.tcustomervs1[c].ClientName || ' ',
  //                         customeremail: dataClient.tcustomervs1[c].Email || ' ',
  //                         street: dataClient.tcustomervs1[c].Street || ' ',
  //                         street2: dataClient.tcustomervs1[c].Street2 || ' ',
  //                         street3: dataClient.tcustomervs1[c].Street3 || ' ',
  //                         suburb: dataClient.tcustomervs1[c].Suburb || ' ',
  //                         statecode: dataClient.tcustomervs1[c].State + ' ' + dataClient.tcustomervs1[c].Postcode || ' ',
  //                         country: dataClient.tcustomervs1[c].Country || ' ',
  //                         termsName: dataClient.tcustomervs1[c].TermsName || '',
  //                         taxCode: dataClient.tcustomervs1[c].TaxCodeName || 'E',
  //                         clienttypename: dataClient.tcustomervs1[c].ClientTypeName || 'Default',
  //                         discount: dataClient.tcustomervs1[c].Discount || 0
  //                       };
  //                       clientList.push(customerrecordObj);

  //                       salesorderrecord.firstname = dataClient.tcustomervs1[c].FirstName || '';
  //                       salesorderrecord.lastname = dataClient.tcustomervs1[c].LastName || '';
  //                       $('#edtCustomerEmail').val(dataClient.tcustomervs1[c].Email);
  //                       $('#edtCustomerEmail').attr('customerid', clientList[c].customerid);
  //                       $('#edtCustomerName').attr('custid', dataClient.tcustomervs1[c].Id);
  //                       $('#edtCustomerEmail').attr('customerfirstname', dataClient.tcustomervs1[c].FirstName);
  //                       $('#edtCustomerEmail').attr('customerlastname', dataClient.tcustomervs1[c].LastName);
  //                       $('#customerType').text(dataClient.tcustomervs1[c].ClientTypeName || 'Default');
  //                       $('#customerDiscount').text(dataClient.tcustomervs1[c].Discount + '%' || 0 + '%');
  //                       $('#edtCustomerUseType').val(dataClient.tcustomervs1[c].ClientTypeName || 'Default');
  //                       $('#edtCustomerUseDiscount').val(dataClient.tcustomervs1[c].Discount || 0);
  //                     }

  //                     templateObject.clientrecords.set(clientList.sort(function (a, b) {
  //                       if (a.customername == 'NA') {
  //                         return 1;
  //                       } else if (b.customername == 'NA') {
  //                         return -1;
  //                       }
  //                       return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
  //                     }));
  //                   });
  //                 }
  //               }, 100);

  //               templateObject.salesorderrecord.set(salesorderrecord);
  //               templateObject.selectedCurrency.set(salesorderrecord.currency);
  //               templateObject.inputSelectedCurrency.set(salesorderrecord.currency);
  //               setTimeout(() => {
  //                 templateObject.checkAbleToMakeWorkOrder()
  //               }, 1000)
  //               if (templateObject.salesorderrecord.get()) {

  //                 Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblSalesOrderLine', function (error, result) {
  //                   if (error) {

  //                   } else {
  //                     if (result) {
  //                       for (let i = 0; i < result.customFields.length; i++) {
  //                         let customcolumn = result.customFields;
  //                         let columData = customcolumn[i].label;
  //                         let columHeaderUpdate = customcolumn[i].thclass;
  //                         let hiddenColumn = customcolumn[i].hidden;
  //                         let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
  //                         let columnWidth = customcolumn[i].width;

  //                         $("" + columHeaderUpdate + "").html(columData);
  //                         if (columnWidth != 0) {
  //                           $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
  //                         }

  //                         if (hiddenColumn == true) {

  //                           $("." + columnClass + "").addClass('hiddenColumn');
  //                           $("." + columnClass + "").removeClass('showColumn');
  //                         } else if (hiddenColumn == false) {
  //                           $("." + columnClass + "").removeClass('hiddenColumn');
  //                           $("." + columnClass + "").addClass('showColumn');

  //                         }

  //                       }
  //                     }

  //                   }
  //                 });
  //               }
  //               break;
  //             }
  //           }
  //           if (!added) { }
  //         }
  //       }).catch(function (err) {
  //         salesService.getOneSalesOrderdataEx(currentSalesOrder).then(function (data) {
  //           LoadingOverlay.hide();
  //           let lineItems = [];
  //           let lineItemsTable = [];
  //           let currencySymbol = Currency;
  //           let totalInc = currencySymbol + '' + data.fields.TotalAmountInc.toLocaleString(undefined, {
  //             minimumFractionDigits: 2
  //           });
  //           let totalDiscount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalDiscount).toLocaleString(undefined, {
  //             minimumFractionDigits: 2
  //           });
  //           let subTotal = currencySymbol + '' + data.fields.TotalAmount.toLocaleString(undefined, {
  //             minimumFractionDigits: 2
  //           });
  //           let totalTax = currencySymbol + '' + data.fields.TotalTax.toLocaleString(undefined, {
  //             minimumFractionDigits: 2
  //           });
  //           let totalBalance = currencySymbol + '' + data.fields.TotalBalance.toLocaleString(undefined, {
  //             minimumFractionDigits: 2
  //           });
  //           let totalPaidAmount = currencySymbol + '' + data.fields.TotalPaid.toLocaleString(undefined, {
  //             minimumFractionDigits: 2
  //           });
  //           if (data.fields.Lines != null) {
  //             if (data.fields.Lines.length) {
  //               for (let i = 0; i < data.fields.Lines.length; i++) {
  //                 let AmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {
  //                   minimumFractionDigits: 2
  //                 });
  //                 let currencyAmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
  //                 let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
  //                 let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);

  //                 let serialno = "";
  //                 let lotno = "";
  //                 let expirydate = "";
  //                 if (data.fields.Lines[i].fields.PQA != null) {
  //                   if (data.fields.Lines[i].fields.PQA.fields.PQASN != null) {
  //                     for (let j = 0; j < data.fields.Lines[i].fields.PQA.fields.PQASN.length; j++) {
  //                       serialno += (serialno == "") ? data.fields.Lines[i].fields.PQA.fields.PQASN[j].fields.SerialNumber : "," + data.fields.Lines[i].fields.PQA.fields.PQASN[j].fields.SerialNumber;
  //                     }
  //                   }
  //                   if (data.fields.Lines[i].fields.PQA.fields.PQABatch != null) {
  //                     for (let j = 0; j < data.fields.Lines[i].fields.PQA.fields.PQABatch.length; j++) {
  //                       lotno += (lotno == "") ? data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchNo : "," + data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchNo;
  //                       let expirydateformat = data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate != '' ? moment(data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate).format("YYYY/MM/DD") : data.fields.Lines[i].fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate;
  //                       expirydate += (expirydate == "") ? expirydateformat : "," + expirydateformat;
  //                     }
  //                   }
  //                 }
  //                 const lineItemObj = {
  //                   lineID: Random.id(),
  //                   id: data.fields.Lines[i].fields.ID || '',
  //                   item: data.fields.Lines[i].fields.ProductName || '',
  //                   description: data.fields.Lines[i].fields.ProductDescription || '',
  //                   quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
  //                   unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                   unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                   TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                   TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                   lineCost: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
  //                     minimumFractionDigits: 2
  //                   }) || 0,
  //                   taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
  //                   taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
  //                   curTotalAmt: currencyAmountGbp || currencySymbol + '0',
  //                   TaxTotal: TaxTotalGbp || 0,
  //                   TaxRate: TaxRateGbp || 0,
  //                   DiscountPercent: data.fields.Lines[i].fields.DiscountPercent || 0,
  //                   pqaseriallotdata: data.fields.Lines[i].fields.PQA || '',
  //                   serialnumbers: serialno,
  //                   lotnumbers: lotno,
  //                   expirydates: expirydate
  //                 };
  //                 var dataListTable = [
  //                   data.fields.Lines[i].fields.ProductName || '',
  //                   data.fields.Lines[i].fields.ProductDescription || '',
  //                   "<div contenteditable='true' class='qty'>" + '' + data.fields.Lines[i].fields.UOMOrderQty + '' + "</div>" || "<div>" + '' + 0 + '' + "</div>",
  //                   "<div>" + '' + currencySymbol + '' + data.fields.Lines[i].fields.LinePrice.toFixed(2) + '' + "</div>" || currencySymbol + '' + 0.00,
  //                   data.fields.Lines[i].fields.LineTaxCode || '',
  //                   AmountGbp || currencySymbol + '' + 0.00,
  //                   '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
  //                 ];
  //                 lineItemsTable.push(dataListTable);
  //                 lineItems.push(lineItemObj);
  //               }
  //             } else {
  //               let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
  //               let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines.fields.LineTaxTotal);
  //               let TaxRateGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxRate;
  //               let serialno = "";
  //               let lotno = "";
  //               let expirydate = "";
  //               if (data.fields.Lines.fields.PQA != null) {
  //                 if (data.fields.Lines.fields.PQA.fields.PQASN != null) {
  //                   for (let j = 0; j < data.fields.Lines.fields.PQA.fields.PQASN.length; j++) {
  //                     serialno += (serialno == "") ? data.fields.Lines.fields.PQA.fields.PQASN[j].fields.SerialNumber : "," + data.fields.Lines.fields.PQA.fields.PQASN[j].fields.SerialNumber;
  //                   }
  //                 }
  //                 if (data.fields.Lines.fields.PQA.fields.PQABatch != null) {
  //                   for (let j = 0; j < data.fields.Lines.fields.PQA.fields.PQABatch.length; j++) {
  //                     lotno += (lotno == "") ? data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchNo : "," + data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchNo;
  //                     let expirydateformat = data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate != '' ? moment(data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate).format("YYYY/MM/DD") : data.fields.Lines.fields.PQA.fields.PQABatch[j].fields.BatchExpiryDate;
  //                     expirydate += (expirydate == "") ? expirydateformat : "," + expirydateformat;
  //                   }
  //                 }
  //               }
  //               const lineItemObj = {
  //                 lineID: Random.id(),
  //                 id: data.fields.Lines.fields.ID || '',
  //                 description: data.fields.Lines.fields.ProductDescription || '',
  //                 quantity: data.fields.Lines.fields.UOMOrderQty || 0,
  //                 unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                 unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                 TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                 TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, { minimumFractionDigits: 2 }) || 0,
  //                 lineCost: data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
  //                   minimumFractionDigits: 2
  //                 }) || 0,
  //                 taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
  //                 taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
  //                 curTotalAmt: currencyAmountGbp || currencySymbol + '0',
  //                 TaxTotal: TaxTotalGbp || 0,
  //                 TaxRate: TaxRateGbp || 0,
  //                 serialnumbers: serialno,
  //                 lotnumbers: lotno,
  //                 expirydates: expirydate
  //               };
  //               lineItems.push(lineItemObj);
  //             }
  //           }
  //           let salesorderrecord = {
  //             id: data.fields.ID,
  //             lid: 'Edit Sales Order' + ' ' + data.fields.ID,
  //             socustomer: data.fields.CustomerName,
  //             salesOrderto: data.fields.InvoiceToDesc,
  //             shipto: data.fields.ShipToDesc,
  //             department: data.fields.SaleClassName,
  //             docnumber: data.fields.DocNumber,
  //             custPONumber: data.fields.CustPONumber,
  //             saledate: data.fields.SaleDate ? moment(data.fields.SaleDate).format('DD/MM/YYYY') : "",
  //             duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
  //             employeename: data.fields.EmployeeName,
  //             status: data.fields.SalesStatus,
  //             category: data.fields.SalesCategory,
  //             comments: data.fields.Comments,
  //             pickmemo: data.fields.PickMemo,
  //             ponumber: data.fields.CustPONumber,
  //             via: data.fields.Shipping,
  //             connote: data.fields.ConNote,
  //             reference: data.fields.ReferenceNo,
  //             currency: data.fields.ForeignExchangeCode,
  //             branding: data.fields.MedType,
  //             invoiceToDesc: data.fields.InvoiceToDesc,
  //             shipToDesc: data.fields.ShipToDesc,
  //             termsName: data.fields.TermsName,
  //             Total: totalInc,
  //             TotalDiscount: totalDiscount,
  //             LineItems: lineItems,
  //             TotalTax: totalTax,
  //             SubTotal: subTotal,
  //             balanceDue: totalBalance,
  //             saleCustField1: data.fields.SaleCustField1,
  //             saleCustField2: data.fields.SaleCustField2,
  //             totalPaid: totalPaidAmount,
  //             isConverted: data.fields.Converted,
  //             CustomerID: data.fields.CustomerID,
  //             ClientName: data.fields.ClientName,
  //             ClientEmail: data.fields.ContactEmail
  //           };
  //           $('#edtCustomerName').val(data.fields.CustomerName);
  //           templateObject.CleintName.set(data.fields.CustomerName);
  //           $('.sltCurrency').val(data.fields.ForeignExchangeCode);
  //           //$('#exchange_rate').val(data.fields.ForeignExchangeRate);
  //           $('#exchange_rate').val(templateObject.getCurrencyRate(data.fields.ForeignExchangeCode, 1));
  //           $('#sltStatus').val(data.fields.SalesStatus);
  //           $('#sltTerms').val(data.fields.TermsName);
  //           $('#sltDept').val(data.fields.SaleClassName);

  //           templateObject.attachmentCount.set(0);
  //           if (data.fields.Attachments) {
  //             if (data.fields.Attachments.length) {
  //               templateObject.attachmentCount.set(data.fields.Attachments.length);
  //               templateObject.uploadedFiles.set(data.fields.Attachments);
  //             }
  //           }
  //           setTimeout(function () {
  //             if (clientList) {
  //               for (var i = 0; i < clientList.length; i++) {
  //                 if (clientList[i].customername == data.fields.CustomerName) {
  //                   $('#edtCustomerEmail').val(clientList[i].customeremail);
  //                   $('#edtCustomerEmail').attr('customerid', clientList[i].customerid);
  //                   $('#edtCustomerName').attr('custid', clientList[i].customerid);
  //                   $('#edtCustomerEmail').attr('customerfirstname', clientList[i].firstname);
  //                   $('#edtCustomerEmail').attr('customerlastname', clientList[i].lastname);
  //                 }
  //               }
  //             }
  //           }, 100);

  //           templateObject.salesorderrecord.set(salesorderrecord);
  //           templateObject.selectedCurrency.set(salesorderrecord.currency);
  //           templateObject.inputSelectedCurrency.set(salesorderrecord.currency);
  //           setTimeout(() => {
  //             templateObject.checkAbleToMakeWorkOrder()
  //           }, 1000)
  //           if (templateObject.salesorderrecord.get()) {
  //             Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblSalesOrderLine', function (error, result) {
  //               if (error) {
  //               } else {
  //                 if (result) {
  //                   for (let i = 0; i < result.customFields.length; i++) {
  //                     let customcolumn = result.customFields;
  //                     let columData = customcolumn[i].label;
  //                     let columHeaderUpdate = customcolumn[i].thclass;
  //                     let hiddenColumn = customcolumn[i].hidden;
  //                     let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
  //                     let columnWidth = customcolumn[i].width;
  //                     $("" + columHeaderUpdate + "").html(columData);
  //                     if (columnWidth != 0) {
  //                       $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
  //                     }
  //                     if (hiddenColumn == true) {
  //                       $("." + columnClass + "").addClass('hiddenColumn');
  //                       $("." + columnClass + "").removeClass('showColumn');
  //                     } else if (hiddenColumn == false) {
  //                       $("." + columnClass + "").removeClass('hiddenColumn');
  //                       $("." + columnClass + "").addClass('showColumn');
  //                     }
  //                   }
  //                 }
  //               }
  //             });
  //           }
  //         }).catch(function (err) {
  //           swal({
  //             title: 'Oooops...',
  //             text: err,
  //             type: 'error',
  //             showCancelButton: false,
  //             confirmButtonText: 'Try Again'
  //           }).then((result) => {
  //             if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
  //           });
  //           LoadingOverlay.hide();
  //         });
  //       });

  //     };

  //     templateObject.getSalesOrderData();
  //   }
  // } else {
  //   LoadingOverlay.hide();
  //   let lineItems = [];
  //   let lineItemsTable = [];
  //   const lineItemObj = {
  //     lineID: Random.id(),
  //     item: '',
  //     description: '',
  //     quantity: '',
  //     unitPrice: 0,
  //     unitPriceInc: 0,
  //     TotalAmt: 0,
  //     TotalAmtInc: 0,
  //     taxRate: '',
  //     taxCode: '',
  //     curTotalAmt: 0,
  //     TaxTotal: 0,
  //     TaxRate: 0,
  //   };
  //   const dataListTable = [
  //     ' ' || '',
  //     ' ' || '',
  //     0 || 0,
  //     0.00 || 0.00,
  //     ' ' || '',
  //     0.00 || 0.00,
  //     '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
  //   ];
  //   lineItemsTable.push(dataListTable);
  //   lineItems.push(lineItemObj);
  //   const currentDate = new Date();
  //   const begunDate = moment(currentDate).format("DD/MM/YYYY");
  //   let salesorderrecord = {
  //     id: '',
  //     lid: 'New Sales Order',
  //     socustomer: '',
  //     salesOrderto: '',
  //     shipto: '',
  //     department: defaultDept || '',
  //     docnumber: '',
  //     custPONumber: '',
  //     saledate: begunDate,
  //     duedate: '',
  //     employeename: '',
  //     status: '',
  //     category: '',
  //     comments: '',
  //     pickmemo: '',
  //     ponumber: '',
  //     via: '',
  //     connote: '',
  //     reference: '',
  //     currency: '',
  //     branding: '',
  //     invoiceToDesc: '',
  //     shipToDesc: '',
  //     termsName: templateObject.defaultsaleterm.get() || '',
  //     Total: Currency + '' + 0.00,
  //     TotalDiscount: Currency + '' + 0.00,
  //     LineItems: lineItems,
  //     TotalTax: Currency + '' + 0.00,
  //     SubTotal: Currency + '' + 0.00,
  //     balanceDue: Currency + '' + 0.00,
  //     saleCustField1: '',
  //     saleCustField2: '',
  //     totalPaid: Currency + '' + 0.00,
  //     isConverted: false
  //   };
  //   if (FlowRouter.current().queryParams.customerid) {
  //     templateObject.getCustomerData(FlowRouter.current().queryParams.customerid);
  //   } else {
  //     $('#edtCustomerName').val('');
  //   }
  //   setTimeout(function () {
  //     $('#sltDept').val(defaultDept);
  //     $('#sltTerms').val(salesorderrecord.termsName);
  //     templateObject.getLastSOData();
  //   }, 200);
  //   templateObject.salesorderrecord.set(salesorderrecord);
  //   if (templateObject.salesorderrecord.get()) {
  //     Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblSalesOrderLine', function (error, result) {
  //       if (error) { } else {
  //         if (result) {
  //           for (let i = 0; i < result.customFields.length; i++) {
  //             let customcolumn = result.customFields;
  //             let columData = customcolumn[i].label;
  //             let columHeaderUpdate = customcolumn[i].thclass;
  //             let hiddenColumn = customcolumn[i].hidden;
  //             let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
  //             let columnWidth = customcolumn[i].width;
  //             $("" + columHeaderUpdate + "").html(columData);
  //             if (columnWidth != 0) {
  //               $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
  //             }
  //             if (hiddenColumn == true) {
  //               $("." + columnClass + "").addClass('hiddenColumn');
  //               $("." + columnClass + "").removeClass('showColumn');
  //             } else if (hiddenColumn == false) {
  //               $("." + columnClass + "").removeClass('hiddenColumn');
  //               $("." + columnClass + "").addClass('showColumn');
  //             }
  //           }
  //         }
  //       }
  //     });
  //   }
  // }

  if ($('.printID').attr('id') == undefined || $('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
    var duedate = new Date();
    let dueDate = ("0" + duedate.getDate()).slice(-2) + "/" + ("0" + (duedate.getMonth() + 1)).slice(-2) + "/" + duedate.getFullYear();
    $('.due').text(dueDate);
  }

  // $(document).on("click", "#tblStatusPopList tbody tr", function (e) {
  //   $('#sltStatus').val($(this).find(".colStatusName").text());
  //   $('#statusPopModal').modal('toggle');
  //   $('#tblStatusPopList_filter .form-control-sm').val('');
  //   setTimeout(function () {
  //     $('.btnRefreshStatus').trigger('click');
  //     LoadingOverlay.hide();
  //   }, 1000);
  // });
  // $(document).on("click", "#tblCurrencyPopList tbody tr", function (e) {
  //   $('.sltCurrency').val($(this).find(".colCode").text());
  //   $('#currencyModal').modal('toggle');

  //   $('#tblCurrencyPopList_filter .form-control-sm').val('');
  //   setTimeout(function () {
  //     $('.btnRefreshCurrency').trigger('click');
  //     LoadingOverlay.hide();
  //   }, 1000);
  // });
  $(document).on("click", "#departmentList tbody tr", function (e) {
    $('#sltDept').val($(this).find(".colDeptName").text());
    $('#departmentModal').modal('toggle');
  });
  $(document).on("click", "#termsList tbody tr", function (e) {
    $('.transheader > #sltTerms_fromtransactionheader').val($(this).find(".colName").text());
    $('#termsListModal').modal('hide');
  });
  $(document).on("click", "#custListType tbody tr", function (e) {
    ;
    if (clickedInput == "one") {
      $('#edtSaleCustField1').val($(this).find(".colFieldName").text());
    } else if (clickedInput == "two") {
      $('#edtSaleCustField2').val($(this).find(".colFieldName").text());
    } else if (clickedInput == "three") {
      $('#edtSaleCustField3').val($(this).find(".colFieldName").text());
    }
    $('#customFieldList').modal('toggle');
  });

  $(document).ready(function () {
    // $('#edtCustomerName').editableSelect();
    // $('#sltStatus').editableSelect();
    // $('.sltCurrency').editableSelect();
    // $('#sltTerms').editableSelect();
    // $('#sltDept').editableSelect();
    // $('#addRow').on('click', function () {
    //   var getTableFields = [$('#tblSalesOrderLine tbody tr .lineProductName')];
    //   var checkEmptyFields;
    //   for (var i = 0; i < getTableFields.length; i++) {
    //     checkEmptyFields = getTableFields[i].filter(function (i, element) {
    //       return $.trim($(this).val()) === '';
    //     });
    //   };
    //   if (!checkEmptyFields.length) {
    //     var rowData = $('#tblSalesOrderLine tbody>tr:last').clone(true);
    //     let tokenid = Random.id();
    //     $(".lineProductName", rowData).val("");
    //     $(".lineProductDesc", rowData).text("");
    //     $(".lineQty", rowData).val("");
    //     $(".lineUnitPrice", rowData).val("");
    //     $(".lineTaxRate", rowData).text("");
    //     $(".lineTaxCode", rowData).val("");
    //     $(".lineAmt", rowData).text("");
    //     $(".lineTaxAmount", rowData).text("");
    //     $(".lineDiscount", rowData).text("");
    //     $(".lineProductName", rowData).attr("prodid", '');
    //     $(".colSerialNo", rowData).removeAttr("data-lotnumbers");
    //     $(".colSerialNo", rowData).removeAttr("data-expirydates");
    //     $(".colSerialNo", rowData).removeAttr("data-serialnumbers");
    //     rowData.attr('id', tokenid);
    //     $("#tblSalesOrderLine tbody").append(rowData);

    //     if ($('#printID').attr('id') != "") {
    //       var rowData1 = $('.sales_print tbody>tr:last').clone(true);
    //       $("#lineProductName", rowData1).text("");
    //       $("#lineProductDesc", rowData1).text("");
    //       $("#lineQty", rowData1).text("");
    //       $("#lineOrdered", rowData1).text("");
    //       $("#lineUnitPrice", rowData1).text("");
    //       // $(".lineTaxRate", rowData).text("");
    //       $("#lineTaxAmount", rowData1).text("");
    //       $("#lineAmt", rowData1).text("");
    //       $(".lineTaxAmount", rowData).text("");
    //       $(".lineDiscount", rowData).text("");
    //       $(".lineProductName", rowData).attr("prodid", '');
    //       rowData1.attr('id', tokenid);
    //       $(".sales_print tbody").append(rowData1);
    //     }
    //     setTimeout(function () {
    //       $('#' + tokenid + " .lineProductName").trigger('click');
    //     }, 200);
    //   } else {
    //     $("#tblSalesOrderLine tbody tr").each(function (index) {
    //       var $tblrow = $(this);
    //       if ($tblrow.find(".lineProductName").val() == '') {
    //         $tblrow.find(".colProductName").addClass('boldtablealertsborder');
    //       }
    //     });
    //   }
    // });
  });

  /* On clik Inventory Line */
  // $(document).on("click", ".tblInventory tbody tr", async function (e) {
  //   $(".colProductName").removeClass('boldtablealertsborder');
  //   let selectLineID = $('#selectLineID').val();
  //   let taxcodeList = await templateObject.taxraterecords.get();
  //   let customers = await templateObject.clientrecords.get();
  //   var table = $(this);
  //   let utilityService = new UtilityService();
  //   let $tblrows = $("#tblSalesOrderLine tbody tr");
  //   var $printrows = $(".sales_print tbody tr");
  //   let taxcode1 = "";
  //   let selectedCust = $('#edtCustomerName').val();
  //   let getCustDetails = "";
  //   let lineTaxRate = "";
  //   let taxRate = ""
  //   if (selectedCust != "") {
  //     getCustDetails = customers.filter(customer => {
  //       return customer.customername == selectedCust
  //     });
  //     if (getCustDetails.length > 0) {
  //       taxRate = taxcodeList.filter(taxrate => {
  //         return taxrate.codename == getCustDetails[0].taxCode
  //       });
  //       if (taxRate.length > 0) {
  //         if (taxRate.codename != "") {
  //           lineTaxRate = taxRate[0].codename
  //         } else {
  //           lineTaxRate = table.find(".taxrate").text();
  //         }
  //       } else {
  //         lineTaxRate = table.find(".taxrate").text();
  //       }

  //       taxcode1 = getCustDetails[0].taxCode;
  //     } else {
  //       lineTaxRate = table.find(".taxrate").text();
  //     }
  //   } else {
  //     lineTaxRate = table.find(".taxrate").text();
  //   }

  //   if (selectLineID) {
  //     let lineProductName = table.find(".productName").text();
  //     let lineProductDesc = table.find(".productDesc").text();
  //     let lineUnitPrice = table.find(".salePrice").text();
  //     let lineExtraSellPrice = JSON.parse(table.find(".colExtraSellPrice").text()) || null;
  //     let getCustomerClientTypeName = $('#edtCustomerUseType').val() || 'Default';
  //     let getCustomerDiscount = parseFloat($('#edtCustomerUseDiscount').val()) || 0;
  //     let getCustomerProductDiscount = 0;
  //     let discountAmount = getCustomerDiscount;
  //     if (lineExtraSellPrice != null) {
  //       for (let e = 0; e < lineExtraSellPrice.length; e++) {
  //         if (lineExtraSellPrice[e].fields.ClientTypeName === getCustomerClientTypeName) {
  //           getCustomerProductDiscount = parseFloat(lineExtraSellPrice[e].fields.QtyPercent1) || 0;
  //           if (getCustomerProductDiscount > getCustomerDiscount) {
  //             discountAmount = getCustomerProductDiscount;
  //           }
  //         }
  //       }
  //     } else {
  //       discountAmount = getCustomerDiscount;
  //     }
  //     $('#' + selectLineID + " .lineDiscount").text(discountAmount);
  //     let lineAmount = 0;
  //     let subGrandTotal = 0;
  //     let taxGrandTotal = 0;
  //     let taxGrandTotalPrint = 0;
  //     let subDiscountTotal = 0; // New Discount
  //     if (taxcodeList) {
  //       for (var i = 0; i < taxcodeList.length; i++) {
  //         if (taxcodeList[i].codename == lineTaxRate) {
  //           $('#' + selectLineID + " .lineTaxRate").text(taxcodeList[i].coderate);
  //         }
  //       }
  //     }
  //     $('#' + selectLineID + " .lineProductName").val(lineProductName);
  //     $('#' + selectLineID + " .lineProductName").attr("prodid", table.find(".colProuctPOPID").text());
  //     $('#' + selectLineID + " .lineProductDesc").text(lineProductDesc);
  //     $('#' + selectLineID + " .lineOrdered").val(1);
  //     $('#' + selectLineID + " .lineQty").val(1);
  //     $('#' + selectLineID + " .lineUnitPrice").val(lineUnitPrice);
  //     templateObject.checkAbleToMakeWorkOrder();
  //     if ($('.printID').attr('id') == undefined || $('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
  //       $('#' + selectLineID + " #lineProductName").text(lineProductName);
  //       $('#' + selectLineID + " #lineProductDesc").text(lineProductDesc);
  //       $('#' + selectLineID + " #lineOrdered").text(1);
  //       $('#' + selectLineID + " #lineQty").text(1);
  //       $('#' + selectLineID + " #lineUnitPrice").text(lineUnitPrice);
  //     }
  //     if (lineTaxRate == "NT") {
  //       lineTaxRate = "E";
  //       $('#' + selectLineID + " .lineTaxCode").val(lineTaxRate);
  //       if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
  //         $('#' + selectLineID + " #lineTaxCode").text(lineTaxRate);
  //       }
  //     } else {
  //       $('#' + selectLineID + " .lineTaxCode").val(lineTaxRate);
  //       if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
  //         $('#' + selectLineID + " #lineTaxCode").text(lineTaxRate);
  //       }
  //     }

  //     lineAmount = 1 * Number(lineUnitPrice.replace(/[^0-9.-]+/g, "")) || 0;
  //     $('#' + selectLineID + " .lineAmt").text(utilityService.modifynegativeCurrencyFormat(lineAmount));
  //     if ($('.printID').attr('id') == undefined || $('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
  //       $('#' + selectLineID + " #lineAmt").text(utilityService.modifynegativeCurrencyFormat(lineAmount));
  //     }
  //     $('#productListModal').modal('toggle');
  //     let subGrandTotalNet = 0;
  //     let taxGrandTotalNet = 0;
  //     $tblrows.each(function (index) {
  //       var $tblrow = $(this);
  //       var qty = $tblrow.find(".lineQty").val() || 0;
  //       var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
  //       var taxRate = $tblrow.find(".lineTaxCode").val();

  //       var taxrateamount = 0;
  //       if (taxcodeList) {
  //         for (var i = 0; i < taxcodeList.length; i++) {
  //           if (taxcodeList[i].codename == taxRate) {
  //             taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
  //           }
  //         }
  //       }

  //       var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
  //       var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
  //       var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").text()) || 0; // New Discount
  //       let lineTotalAmount = subTotal + taxTotal;

  //       let lineDiscountTotal = lineDiscountPerc / 100;

  //       var discountTotal = lineTotalAmount * lineDiscountTotal;
  //       var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
  //       var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
  //       var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
  //       var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
  //       if (!isNaN(discountTotal)) {
  //         subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

  //         document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
  //       }
  //       $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

  //       let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
  //       let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, "")) || 0;
  //       let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc || 0;
  //       $tblrow.find('.colUnitPriceExChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
  //       $tblrow.find('.colUnitPriceIncChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

  //       if (!isNaN(subTotal)) {
  //         $tblrow.find('.colAmountEx').text(utilityService.modifynegativeCurrencyFormat(subTotal));
  //         $tblrow.find('.colAmountInc').text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
  //         subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
  //         subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
  //         document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
  //       }

  //       if (!isNaN(taxTotal)) {
  //         taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
  //         taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
  //         document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
  //       }



  //       if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
  //         let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
  //         let GrandTotalNet = (parseFloat(subGrandTotalNet)) + (parseFloat(taxGrandTotalNet));
  //         document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
  //         document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
  //         document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
  //         document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

  //       }
  //     });

  //     //if ($('.printID').attr('id') == undefined || $('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
  //     $printrows.each(function (index) {
  //       var $printrows = $(this);
  //       var qty = $printrows.find("#lineQty").text() || 0;
  //       var price = $printrows.find("#lineUnitPrice").text() || "0";
  //       var taxrateamount = 0;
  //       var taxRate = $printrows.find("#lineTaxCode").text();
  //       if (taxcodeList) {
  //         for (var i = 0; i < taxcodeList.length; i++) {
  //           if (taxcodeList[i].codename == taxRate) {
  //             taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
  //           }
  //         }
  //       }

  //       var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
  //       var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
  //       $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))
  //       if (!isNaN(subTotal)) {
  //         $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
  //         subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
  //         document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
  //       }

  //       if (!isNaN(taxTotal)) {
  //         taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
  //         // document.getElementById("totalTax_totalPrint").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
  //       }
  //       if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
  //         let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
  //         document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
  //         //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
  //         document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

  //       }
  //     });
  //     //}

  //   }
  // });
  // $(document).on("click", "#tblTaxRate tbody tr", function (e) {
  //   let selectLineID = $('#selectLineID').val();
  //   let taxcodeList = templateObject.taxraterecords.get();
  //   var table = $(this);
  //   let utilityService = new UtilityService();
  //   let $tblrows = $("#tblSalesOrderLine tbody tr");
  //   var $printrows = $(".sales_print tbody tr");
  //   let taxGrandTotalPrint = 0;
  //   if (selectLineID) {
  //     let lineTaxCode = table.find(".taxName").text();
  //     let lineTaxRate = table.find(".taxRate").text();
  //     let lineAmount = 0;
  //     let subGrandTotal = 0;
  //     let taxGrandTotal = 0;
  //     let subDiscountTotal = 0; // New Discount
  //     let taxGrandTotalPrint = 0;

  //     $('#' + selectLineID + " .lineTaxRate").text(lineTaxRate || 0);
  //     $('#' + selectLineID + " .lineTaxCode").val(lineTaxCode);
  //     if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
  //       $('#' + selectLineID + " #lineTaxCode").text(lineTaxCode);
  //     }

  //     $('#taxRateListModal').modal('toggle');
  //     let subGrandTotalNet = 0;
  //     let taxGrandTotalNet = 0;
  //     $tblrows.each(function (index) {
  //       var $tblrow = $(this);
  //       var qty = $tblrow.find(".lineQty").val() || 0;
  //       var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
  //       var taxRate = $tblrow.find(".lineTaxCode").val();

  //       var taxrateamount = 0;
  //       if (taxcodeList) {
  //         for (var i = 0; i < taxcodeList.length; i++) {
  //           if (taxcodeList[i].codename == taxRate) {
  //             taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
  //           }
  //         }
  //       }

  //       var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
  //       var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
  //       var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").text()) || 0; // New Discount
  //       let lineTotalAmount = subTotal + taxTotal;

  //       let lineDiscountTotal = lineDiscountPerc / 100;

  //       var discountTotal = lineTotalAmount * lineDiscountTotal;
  //       var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
  //       var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
  //       var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
  //       var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
  //       if (!isNaN(discountTotal)) {
  //         subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

  //         document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
  //       }
  //       $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

  //       let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
  //       let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, "")) || 0;
  //       let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc || 0;
  //       $tblrow.find('.colUnitPriceExChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
  //       $tblrow.find('.colUnitPriceIncChange').val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

  //       if (!isNaN(subTotal)) {
  //         $tblrow.find('.colAmountEx').text(utilityService.modifynegativeCurrencyFormat(subTotal));
  //         $tblrow.find('.colAmountInc').text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
  //         subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
  //         subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
  //         document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
  //       }

  //       if (!isNaN(taxTotal)) {
  //         taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
  //         taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
  //         document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
  //       }



  //       if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
  //         let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
  //         let GrandTotalNet = (parseFloat(subGrandTotalNet)) + (parseFloat(taxGrandTotalNet));
  //         document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
  //         document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
  //         document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
  //         document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);

  //       }
  //     });

  //     //if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
  //     $printrows.each(function (index) {
  //       var $printrows = $(this);
  //       var qty = $printrows.find("#lineQty").text() || 0;
  //       var price = $printrows.find("#lineUnitPrice").text() || "0";
  //       var taxrateamount = 0;
  //       var taxRate = $printrows.find("#lineTaxCode").text();
  //       if (taxcodeList) {
  //         for (var i = 0; i < taxcodeList.length; i++) {
  //           if (taxcodeList[i].codename == taxRate) {
  //             taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
  //           }
  //         }
  //       }
  //       var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
  //       var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
  //       $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))
  //       if (!isNaN(subTotal)) {
  //         $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
  //         subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
  //         document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
  //       }

  //       if (!isNaN(taxTotal)) {
  //         taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
  //         // document.getElementById("totalTax_totalPrint").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
  //       }
  //       if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
  //         let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
  //         document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
  //         //document.getElementById("totalTax").innerHTML = $('#subtotal_tax').text();
  //         //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
  //         document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

  //       }
  //     });
  //     //}

  //   }
  // });
  /* On click Customer List */
  // $(document).on("click", "#tblCustomerlist tbody tr", function (e) {
  //   const tableCustomer = $(this);
  //   $('#edtCustomerName').val(tableCustomer.find(".colCompany").text());
  //   $('#edtCustomerName').attr("custid", tableCustomer.find(".colID").text());
  //   // $('#customerType').text(tableCustomer.find(".colCustomerType").text()||'Default');
  //   // $('#customerDiscount').text(tableCustomer.find(".colCustomerDiscount").text()+'%'|| 0+'%');
  //   // $('#edtCustomerUseType').val(tableCustomer.find(".colCustomerType").text()||'Default');
  //   // $('#edtCustomerUseDiscount').val(tableCustomer.find(".colCustomerDiscount").text()||0);
  //   $('#edtCustomerEmail').val(tableCustomer.find(".colEmail").text());
  //   $('#edtCustomerEmail').attr('customerid', tableCustomer.find(".colID").text());
  //   $('#edtCustomerName').attr('custid', tableCustomer.find(".colID").text());
  //   $('#edtCustomerEmail').attr('customerfirstname', tableCustomer.find(".colCustomerFirstName").text());
  //   $('#edtCustomerEmail').attr('customerlastname', tableCustomer.find(".colCustomerLastName").text());
  //   $('#customerType').text(tableCustomer.find(".colCustomerType").text() || 'Default');
  //   $('#customerDiscount').text(tableCustomer.find(".colCustomerDiscount").text() + '%' || 0 + '%');
  //   $('#edtCustomerUseType').val(tableCustomer.find(".colCustomerType").text() || 'Default');
  //   $('#edtCustomerUseDiscount').val(tableCustomer.find(".colCustomerDiscount").text() || 0);
  //   let postalAddress = tableCustomer.find(".colCompany").text() + '\n' + tableCustomer.find(".colStreetAddress").text() + '\n' + tableCustomer.find(".colCity").text() + ' ' + tableCustomer.find(".colState").text() + ' ' + tableCustomer.find(".colZipCode").text() + '\n' + tableCustomer.find(".colCountry").text();
  //   $('#txabillingAddress').val(postalAddress);
  //   $('#pdfCustomerAddress').html(postalAddress);
  //   $('.pdfCustomerAddress').text(postalAddress);
  //   $('#txaShipingInfo').val(postalAddress);
  //   $('#sltTerms').val(tableCustomer.find(".colCustomerTermName").text() || templateObject.defaultsaleterm.get() || '');
  //   let selectedTaxCodeName = tableCustomer.find(".colCustomerTaxCode").text() || 'E';
  //   templateObject.setCustomerInfo(selectedTaxCodeName);
  // });

  // $(document).ready(function () {
  //   $('#sltTerms').editableSelect()
  //     .on('click.editable-select', function (e, li) {
  //       var $earch = $(this);
  //       var offset = $earch.offset();
  //       var termsDataName = e.target.value || '';
  //       $('#edtTermsID').val('');
  //       if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
  //         $('#termsListModal').modal('show');
  //       } else {
  //         if (termsDataName.replace(/\s/g, '') != '') {
  //           $('#termModalHeader').text('Edit Terms');
  //           getVS1Data('TTermsVS1').then(function (dataObject) { //edit to test indexdb
  //             if (dataObject.length == 0) {
  //               LoadingOverlay.show();
  //               sideBarService.getTermsVS1().then(function (data) {
  //                 for (let i in data.ttermsvs1) {
  //                   if (data.ttermsvs1[i].TermsName === termsDataName) {
  //                     $('#edtTermsID').val(data.ttermsvs1[i].Id);
  //                     $('#edtDays').val(data.ttermsvs1[i].Days);
  //                     $('#edtName').val(data.ttermsvs1[i].TermsName);
  //                     $('#edtDesc').val(data.ttermsvs1[i].Description);
  //                     if (data.ttermsvs1[i].IsEOM === true) {
  //                       $('#isEOM').prop('checked', true);
  //                     } else {
  //                       $('#isEOM').prop('checked', false);
  //                     }
  //                     if (data.ttermsvs1[i].IsEOMPlus === true) {
  //                       $('#isEOMPlus').prop('checked', true);
  //                     } else {
  //                       $('#isEOMPlus').prop('checked', false);
  //                     }
  //                     if (data.ttermsvs1[i].isSalesdefault === true) {
  //                       $('#chkCustomerDef').prop('checked', true);
  //                     } else {
  //                       $('#chkCustomerDef').prop('checked', false);
  //                     }
  //                     if (data.ttermsvs1[i].isPurchasedefault === true) {
  //                       $('#chkSupplierDef').prop('checked', true);
  //                     } else {
  //                       $('#chkSupplierDef').prop('checked', false);
  //                     }
  //                   }
  //                 }
  //                 setTimeout(function () {
  //                   LoadingOverlay.hide();
  //                   //$('#newTermsModal').modal('show');
  //                 }, 200);
  //               });
  //             } else {
  //               let data = JSON.parse(dataObject[0].data);
  //               let useData = data.ttermsvs1;
  //               for (let i in useData) {
  //                 if (useData[i].TermsName === termsDataName) {
  //                   $('#edtTermsID').val(useData[i].Id);
  //                   $('#edtDays').val(useData[i].Days);
  //                   $('#edtName').val(useData[i].TermsName);
  //                   $('#edtDesc').val(useData[i].Description);
  //                   if (useData[i].IsEOM === true) {
  //                     $('#isEOM').prop('checked', true);
  //                   } else {
  //                     $('#isEOM').prop('checked', false);
  //                   }
  //                   if (useData[i].IsEOMPlus === true) {
  //                     $('#isEOMPlus').prop('checked', true);
  //                   } else {
  //                     $('#isEOMPlus').prop('checked', false);
  //                   }
  //                   if (useData[i].isSalesdefault === true) {
  //                     $('#chkCustomerDef').prop('checked', true);
  //                   } else {
  //                     $('#chkCustomerDef').prop('checked', false);
  //                   }
  //                   if (useData[i].isPurchasedefault === true) {
  //                     $('#chkSupplierDef').prop('checked', true);
  //                   } else {
  //                     $('#chkSupplierDef').prop('checked', false);
  //                   }
  //                 }
  //               }
  //               setTimeout(function () {
  //                 LoadingOverlay.hide();
  //                 //$('#newTermsModal').modal('show');
  //               }, 200);
  //             }
  //           }).catch(function (err) {
  //             LoadingOverlay.show();
  //             sideBarService.getTermsVS1().then(function (data) {
  //               for (let i in data.ttermsvs1) {
  //                 if (data.ttermsvs1[i].TermsName === termsDataName) {
  //                   $('#edtTermsID').val(data.ttermsvs1[i].Id);
  //                   $('#edtDays').val(data.ttermsvs1[i].Days);
  //                   $('#edtName').val(data.ttermsvs1[i].TermsName);
  //                   $('#edtDesc').val(data.ttermsvs1[i].Description);
  //                   if (data.ttermsvs1[i].IsEOM === true) {
  //                     $('#isEOM').prop('checked', true);
  //                   } else {
  //                     $('#isEOM').prop('checked', false);
  //                   }
  //                   if (data.ttermsvs1[i].IsEOMPlus === true) {
  //                     $('#isEOMPlus').prop('checked', true);
  //                   } else {
  //                     $('#isEOMPlus').prop('checked', false);
  //                   }
  //                   if (data.ttermsvs1[i].isSalesdefault === true) {
  //                     $('#chkCustomerDef').prop('checked', true);
  //                   } else {
  //                     $('#chkCustomerDef').prop('checked', false);
  //                   }
  //                   if (data.ttermsvs1[i].isPurchasedefault === true) {
  //                     $('#chkSupplierDef').prop('checked', true);
  //                   } else {
  //                     $('#chkSupplierDef').prop('checked', false);
  //                   }
  //                 }
  //               }
  //               setTimeout(function () {
  //                 LoadingOverlay.hide();
  //                 //$('#newTermsModal').modal('show');
  //               }, 200);
  //             });
  //           });
  //         } else {
  //           $('#termsListModal').modal('show');
  //           setTimeout(function () {
  //             $('#termsList_filter .form-control-sm').focus();
  //             $('#termsList_filter .form-control-sm').val('');
  //             $('#termsList_filter .form-control-sm').trigger("input");
  //             var datatable = $('#termsList').DataTable();
  //             datatable.draw();
  //             $('#termsList_filter .form-control-sm').trigger("input");
  //           }, 500);
  //         }
  //       }
  //     });

  //   $('#sltDept').editableSelect()
  //     .on('click.editable-select', function (e, li) {
  //       var $earch = $(this);
  //       var offset = $earch.offset();
  //       var deptDataName = e.target.value || '';
  //       $('#edtDepartmentID').val('');
  //       if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
  //         $('#departmentModal').modal('toggle');
  //       } else {
  //         if (deptDataName.replace(/\s/g, '') != '') {
  //           $('#newDeptHeader').text('Edit Department');

  //           getVS1Data('TDeptClass').then(function (dataObject) {
  //             if (dataObject.length == 0) {
  //               LoadingOverlay.show();
  //               sideBarService.getDepartment().then(function (data) {
  //                 for (let i = 0; i < data.tdeptclass.length; i++) {
  //                   if (data.tdeptclass[i].DeptClassName === deptDataName) {
  //                     $('#edtDepartmentID').val(data.tdeptclass[i].Id);
  //                     $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
  //                     $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
  //                     $('#edtDeptDesc').val(data.tdeptclass[i].Description);
  //                   }
  //                 }
  //                 setTimeout(function () {
  //                   LoadingOverlay.hide();
  //                   $('#newDepartmentModal').modal('toggle');
  //                 }, 200);
  //               });
  //             } else {
  //               let data = JSON.parse(dataObject[0].data);
  //               let useData = data.tdeptclass;
  //               for (let i = 0; i < data.tdeptclass.length; i++) {
  //                 if (data.tdeptclass[i].DeptClassName === deptDataName) {
  //                   $('#edtDepartmentID').val(data.tdeptclass[i].Id);
  //                   $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
  //                   $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
  //                   $('#edtDeptDesc').val(data.tdeptclass[i].Description);
  //                 }
  //               }
  //               setTimeout(function () {
  //                 LoadingOverlay.hide();
  //                 $('#newDepartmentModal').modal('toggle');
  //               }, 200);
  //             }
  //           }).catch(function (err) {
  //             LoadingOverlay.show();
  //             sideBarService.getDepartment().then(function (data) {
  //               for (let i = 0; i < data.tdeptclass.length; i++) {
  //                 if (data.tdeptclass[i].DeptClassName === deptDataName) {
  //                   $('#edtDepartmentID').val(data.tdeptclass[i].Id);
  //                   $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
  //                   $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
  //                   $('#edtDeptDesc').val(data.tdeptclass[i].Description);
  //                 }
  //               }
  //               setTimeout(function () {
  //                 LoadingOverlay.hide();
  //                 $('#newDepartmentModal').modal('toggle');
  //               }, 200);
  //             });
  //           });
  //         } else {
  //           $('#departmentModal').modal();
  //           setTimeout(function () {
  //             $('#departmentList_filter .form-control-sm').focus();
  //             $('#departmentList_filter .form-control-sm').val('');
  //             $('#departmentList_filter .form-control-sm').trigger("input");
  //             var datatable = $('#departmentList').DataTable();
  //             datatable.draw();
  //             $('#departmentList_filter .form-control-sm').trigger("input");
  //           }, 500);
  //         }
  //       }
  //     });

  //   // $('#sltStatus').editableSelect()
  //   //   .on('click.editable-select', function (e, li) {
  //   //     var $earch = $(this);
  //   //     var offset = $earch.offset();
  //   //     $('#statusId').val('');
  //   //     var statusDataName = e.target.value || '';
  //   //     if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
  //   //       $('#statusPopModal').modal('toggle');
  //   //     } else {
  //   //       if (statusDataName.replace(/\s/g, '') != '') {
  //   //         $('#newStatusHeader').text('Edit Status');
  //   //         $('#newStatus').val(statusDataName);

  //   //         getVS1Data('TLeadStatusType').then(function (dataObject) {
  //   //           if (dataObject.length == 0) {
  //   //             LoadingOverlay.show();
  //   //             sideBarService.getAllLeadStatus().then(function (data) {
  //   //               for (let i in data.tleadstatustype) {
  //   //                 if (data.tleadstatustype[i].TypeName === statusDataName) {
  //   //                   $('#statusId').val(data.tleadstatustype[i].Id);
  //   //                 }
  //   //               }
  //   //               setTimeout(function () {
  //   //                 LoadingOverlay.hide();
  //   //                 $('#newStatusPopModal').modal('toggle');
  //   //               }, 200);
  //   //             });
  //   //           } else {
  //   //             let data = JSON.parse(dataObject[0].data);
  //   //             let useData = data.tleadstatustype;
  //   //             for (let i in useData) {
  //   //               if (useData[i].TypeName === statusDataName) {
  //   //                 $('#statusId').val(useData[i].Id);

  //   //               }
  //   //             }
  //   //             setTimeout(function () {
  //   //               LoadingOverlay.hide();
  //   //               $('#newStatusPopModal').modal('toggle');
  //   //             }, 200);
  //   //           }
  //   //         }).catch(function (err) {
  //   //           LoadingOverlay.show();
  //   //           sideBarService.getAllLeadStatus().then(function (data) {
  //   //             for (let i in data.tleadstatustype) {
  //   //               if (data.tleadstatustype[i].TypeName === statusDataName) {
  //   //                 $('#statusId').val(data.tleadstatustype[i].Id);
  //   //               }
  //   //             }
  //   //             setTimeout(function () {
  //   //               LoadingOverlay.hide();
  //   //               $('#newStatusPopModal').modal('toggle');
  //   //             }, 200);
  //   //           });
  //   //         });
  //   //         setTimeout(function () {
  //   //           LoadingOverlay.hide();
  //   //           $('#newStatusPopModal').modal('toggle');
  //   //         }, 200);

  //   //       } else {
  //   //         $('#statusPopModal').modal();
  //   //         setTimeout(function () {
  //   //           $('#tblStatusPopList_filter .form-control-sm').focus();
  //   //           $('#tblStatusPopList_filter .form-control-sm').val('');
  //   //           $('#tblStatusPopList_filter .form-control-sm').trigger("input");
  //   //           var datatable = $('#tblStatusPopList').DataTable();

  //   //           datatable.draw();
  //   //           $('#tblStatusPopList_filter .form-control-sm').trigger("input");

  //   //         }, 500);
  //   //       }
  //   //     }
  //   //   });

  //   // $('.sltCurrency').editableSelect()
  //   //   .on('click.editable-select', function (e, li) {
  //   //     var $earch = $(this);
  //   //     var offset = $earch.offset();
  //   //     var currencyDataName = e.target.value || '';
  //   //     $('#edtCurrencyID').val('');
  //   //     if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
  //   //       $('#currencyModal').modal('toggle');
  //   //     } else {
  //   //       if (currencyDataName.replace(/\s/g, '') != '') {
  //   //         $('#add-currency-title').text('Edit Currency');
  //   //         $('#sedtCountry').prop('readonly', true);
  //   //         getVS1Data('TCurrency').then(function (dataObject) {
  //   //           if (dataObject.length == 0) {
  //   //             LoadingOverlay.show();
  //   //             sideBarService.getCurrencies().then(function (data) {
  //   //               for (let i in data.tcurrency) {
  //   //                 if (data.tcurrency[i].Code === currencyDataName) {
  //   //                   $('#edtCurrencyID').val(data.tcurrency[i].Id);
  //   //                   setTimeout(function () {
  //   //                     $('#sedtCountry').val(data.tcurrency[i].Country);
  //   //                   }, 200);
  //   //                   //$('#sedtCountry').val(data.tcurrency[i].Country);
  //   //                   $('#currencyCode').val(currencyDataName);
  //   //                   $('#currencySymbol').val(data.tcurrency[i].CurrencySymbol);
  //   //                   $('#edtCurrencyName').val(data.tcurrency[i].Currency);
  //   //                   $('#edtCurrencyDesc').val(data.tcurrency[i].CurrencyDesc);
  //   //                   $('#edtBuyRate').val(data.tcurrency[i].BuyRate);
  //   //                   $('#edtSellRate').val(data.tcurrency[i].SellRate);
  //   //                 }
  //   //               }
  //   //               setTimeout(function () {
  //   //                 LoadingOverlay.hide();
  //   //                 $('#newCurrencyModal').modal('toggle');
  //   //                 $('#sedtCountry').attr('readonly', true);
  //   //               }, 200);
  //   //             });
  //   //           } else {
  //   //             let data = JSON.parse(dataObject[0].data);
  //   //             let useData = data.tcurrency;
  //   //             for (let i = 0; i < data.tcurrency.length; i++) {
  //   //               if (data.tcurrency[i].Code === currencyDataName) {
  //   //                 $('#edtCurrencyID').val(data.tcurrency[i].Id);
  //   //                 $('#sedtCountry').val(data.tcurrency[i].Country);
  //   //                 $('#currencyCode').val(currencyDataName);
  //   //                 $('#currencySymbol').val(data.tcurrency[i].CurrencySymbol);
  //   //                 $('#edtCurrencyName').val(data.tcurrency[i].Currency);
  //   //                 $('#edtCurrencyDesc').val(data.tcurrency[i].CurrencyDesc);
  //   //                 $('#edtBuyRate').val(data.tcurrency[i].BuyRate);
  //   //                 $('#edtSellRate').val(data.tcurrency[i].SellRate);
  //   //               }
  //   //             }
  //   //             setTimeout(function () {
  //   //               LoadingOverlay.hide();
  //   //               $('#newCurrencyModal').modal('toggle');
  //   //             }, 200);
  //   //           }

  //   //         }).catch(function (err) {
  //   //           LoadingOverlay.show();
  //   //           sideBarService.getCurrencies().then(function (data) {
  //   //             for (let i in data.tcurrency) {
  //   //               if (data.tcurrency[i].Code === currencyDataName) {
  //   //                 $('#edtCurrencyID').val(data.tcurrency[i].Id);
  //   //                 setTimeout(function () {
  //   //                   $('#sedtCountry').val(data.tcurrency[i].Country);
  //   //                 }, 200);
  //   //                 //$('#sedtCountry').val(data.tcurrency[i].Country);
  //   //                 $('#currencyCode').val(currencyDataName);
  //   //                 $('#currencySymbol').val(data.tcurrency[i].CurrencySymbol);
  //   //                 $('#edtCurrencyName').val(data.tcurrency[i].Currency);
  //   //                 $('#edtCurrencyDesc').val(data.tcurrency[i].CurrencyDesc);
  //   //                 $('#edtBuyRate').val(data.tcurrency[i].BuyRate);
  //   //                 $('#edtSellRate').val(data.tcurrency[i].SellRate);
  //   //               }
  //   //             }
  //   //             setTimeout(function () {
  //   //               LoadingOverlay.hide();
  //   //               $('#newCurrencyModal').modal('toggle');
  //   //               $('#sedtCountry').attr('readonly', true);
  //   //             }, 200);
  //   //           });
  //   //         });

  //   //       } else {
  //   //         $('#currencyModal').modal();
  //   //         setTimeout(function () {
  //   //           $('#tblCurrencyPopList_filter .form-control-sm').focus();
  //   //           $('#tblCurrencyPopList_filter .form-control-sm').val('');
  //   //           $('#tblCurrencyPopList_filter .form-control-sm').trigger("input");
  //   //           var datatable = $('#tblCurrencyPopList').DataTable();
  //   //           datatable.draw();
  //   //           $('#tblCurrencyPopList_filter .form-control-sm').trigger("input");
  //   //         }, 500);
  //   //       }
  //   //     }
  //   //   });

  // });

  // $('#edtCustomerName').editableSelect().on('click.editable-select', function (e, li) {
  //   var $earch = $(this);
  //   var offset = $earch.offset();
  //   $('#edtCustomerPOPID').val('');
  //   var customerDataName = e.target.value || '';
  //   var customerDataID = $('#edtCustomerName').attr('custid').replace(/\s/g, '') || '';
  //   if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
  //     $('#customerListModal').modal();
  //     setTimeout(function () {
  //       $('#tblCustomerlist_filter .form-control-sm').focus();
  //       $('#tblCustomerlist_filter .form-control-sm').val('');
  //       $('#tblCustomerlist_filter .form-control-sm').trigger("input");
  //       var datatable = $('#tblCustomerlist').DataTable();
  //       //datatable.clear();
  //       //datatable.rows.add(splashArrayCustomerList);
  //       datatable.draw();
  //       $('#tblCustomerlist_filter .form-control-sm').trigger("input");
  //       //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
  //     }, 500);
  //   } else {
  //     if (customerDataName.replace(/\s/g, '') != '') {
  //       //FlowRouter.go('/customerscard?name=' + e.target.value);
  //       $('#edtCustomerPOPID').val('');
  //       getVS1Data('TCustomerVS1').then(function (dataObject) {
  //         if (dataObject.length == 0) {
  //           LoadingOverlay.show();
  //           sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
  //             LoadingOverlay.hide();
  //             let lineItems = [];
  //             $('#add-customer-title').text('Edit Customer');
  //             let popCustomerID = data.tcustomer[0].fields.ID || '';
  //             let popCustomerName = data.tcustomer[0].fields.ClientName || '';
  //             let popCustomerEmail = data.tcustomer[0].fields.Email || '';
  //             let popCustomerTitle = data.tcustomer[0].fields.Title || '';
  //             let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
  //             let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
  //             let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
  //             let popCustomertfn = '' || '';
  //             let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
  //             let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
  //             let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
  //             let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
  //             let popCustomerURL = data.tcustomer[0].fields.URL || '';
  //             let popCustomerStreet = data.tcustomer[0].fields.Street || '';
  //             let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
  //             let popCustomerState = data.tcustomer[0].fields.State || '';
  //             let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
  //             let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
  //             let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
  //             let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
  //             let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
  //             let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
  //             let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
  //             let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
  //             let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
  //             let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
  //             let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
  //             let popCustomernotes = data.tcustomer[0].fields.Notes || '';
  //             let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
  //             let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
  //             let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
  //             let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
  //             let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
  //             let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
  //             let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
  //             let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
  //             let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
  //             let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
  //             $('#edtCustomerCompany').val(popCustomerName);
  //             $('#edtCustomerPOPID').val(popCustomerID);
  //             $('#edtCustomerPOPEmail').val(popCustomerEmail);
  //             $('#edtTitle').val(popCustomerTitle);
  //             $('#edtFirstName').val(popCustomerFirstName);
  //             $('#edtMiddleName').val(popCustomerMiddleName);
  //             $('#edtLastName').val(popCustomerLastName);
  //             $('#edtCustomerPhone').val(popCustomerPhone);
  //             $('#edtCustomerMobile').val(popCustomerMobile);
  //             $('#edtCustomerFax').val(popCustomerFaxnumber);
  //             $('#edtCustomerSkypeID').val(popCustomerSkypeName);
  //             $('#edtCustomerWebsite').val(popCustomerURL);
  //             $('#edtCustomerShippingAddress').val(popCustomerStreet);
  //             $('#edtCustomerShippingCity').val(popCustomerStreet2);
  //             $('#edtCustomerShippingState').val(popCustomerState);
  //             $('#edtCustomerShippingZIP').val(popCustomerPostcode);
  //             $('#sedtCountry').val(popCustomerCountry);
  //             $('#txaNotes').val(popCustomernotes);
  //             $('#sltPreferedPayment').val(popCustomerpreferedpayment);
  //             $('#sltTermsPOP').val(popCustomerterms);
  //             $('#sltCustomerType').val(popCustomerType);
  //             $('#edtCustomerCardDiscount').val(popCustomerDiscount);
  //             $('#edtCustomeField1').val(popCustomercustfield1);
  //             $('#edtCustomeField2').val(popCustomercustfield2);
  //             $('#edtCustomeField3').val(popCustomercustfield3);
  //             $('#edtCustomeField4').val(popCustomercustfield4);

  //             $('#sltTaxCode').val(popCustomerTaxCode);

  //             if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
  //                 (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
  //                 (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
  //               $('#chkSameAsShipping2').attr("checked", "checked");
  //             }

  //             if (data.tcustomer[0].fields.IsSupplier == true) {
  //               // $('#isformcontractor')
  //               $('#chkSameAsSupplier').attr("checked", "checked");
  //             } else {
  //               $('#chkSameAsSupplier').removeAttr("checked");
  //             }
  //             let customerRecord = {
  //               id: popCustomerID,
  //               phone: popCustomerPhone,
  //               firstname: popCustomerFirstName,
  //               middlename: popCustomerMiddleName,
  //               lastname: popCustomerLastName,
  //               company: data.tcustomervs1[0].fields.Companyname || '',
  //               email: popCustomerEmail,
  //               title: popCustomerTitle,
  //               tfn: popCustomertfn,
  //               mobile: popCustomerMobile,
  //               fax: popCustomerFaxnumber,
  //               shippingaddress: popCustomerStreet,
  //               scity: popCustomerStreet2,
  //               sstate: popCustomerCountry,
  //               terms: '',
  //               spostalcode: popCustomerPostcode,
  //               scountry: popCustomerState,
  //               billingaddress: popCustomerbillingaddress,
  //               bcity: popCustomerbcity,
  //               bstate: popCustomerbstate,
  //               bpostalcode: popCustomerbpostalcode,
  //               bcountry: popCustomerCountry,
  //               custFld1: popCustomercustfield1,
  //               custFld2: popCustomercustfield2,
  //               jobbcountry: '',
  //               jobscountry: '',
  //               discount: 0
  //             }
  //             templateObject.customerRecord.set(customerRecord);
  //             setTimeout(function () {
  //               //$('#addCustomerModal').modal('show');
  //             }, 200);
  //           }).catch(function (err) {
  //             LoadingOverlay.hide();
  //           });
  //         } else {
  //           let data = JSON.parse(dataObject[0].data);
  //           let useData = data.tcustomervs1;

  //           var added = false;
  //           for (let i = 0; i < data.tcustomervs1.length; i++) {
  //             if (data.tcustomervs1[i].fields.ClientName === customerDataName) {
  //               let lineItems = [];
  //               added = true;
  //               LoadingOverlay.hide();
  //               $('#add-customer-title').text('Edit Customer');
  //               let popCustomerID = data.tcustomervs1[i].fields.ID || '';
  //               let popCustomerName = data.tcustomervs1[i].fields.ClientName || '';
  //               let popCustomerEmail = data.tcustomervs1[i].fields.Email || '';
  //               let popCustomerTitle = data.tcustomervs1[i].fields.Title || '';
  //               let popCustomerFirstName = data.tcustomervs1[i].fields.FirstName || '';
  //               let popCustomerMiddleName = data.tcustomervs1[i].fields.CUSTFLD10 || '';
  //               let popCustomerLastName = data.tcustomervs1[i].fields.LastName || '';
  //               let popCustomertfn = '' || '';
  //               let popCustomerPhone = data.tcustomervs1[i].fields.Phone || '';
  //               let popCustomerMobile = data.tcustomervs1[i].fields.Mobile || '';
  //               let popCustomerFaxnumber = data.tcustomervs1[i].fields.Faxnumber || '';
  //               let popCustomerSkypeName = data.tcustomervs1[i].fields.SkypeName || '';
  //               let popCustomerURL = data.tcustomervs1[i].fields.URL || '';
  //               let popCustomerStreet = data.tcustomervs1[i].fields.Street || '';
  //               let popCustomerStreet2 = data.tcustomervs1[i].fields.Street2 || '';
  //               let popCustomerState = data.tcustomervs1[i].fields.State || '';
  //               let popCustomerPostcode = data.tcustomervs1[i].fields.Postcode || '';
  //               let popCustomerCountry = data.tcustomervs1[i].fields.Country || LoggedCountry;
  //               let popCustomerbillingaddress = data.tcustomervs1[i].fields.BillStreet || '';
  //               let popCustomerbcity = data.tcustomervs1[i].fields.BillStreet2 || '';
  //               let popCustomerbstate = data.tcustomervs1[i].fields.BillState || '';
  //               let popCustomerbpostalcode = data.tcustomervs1[i].fields.BillPostcode || '';
  //               let popCustomerbcountry = data.tcustomervs1[i].fields.Billcountry || LoggedCountry;
  //               let popCustomercustfield1 = data.tcustomervs1[i].fields.CUSTFLD1 || '';
  //               let popCustomercustfield2 = data.tcustomervs1[i].fields.CUSTFLD2 || '';
  //               let popCustomercustfield3 = data.tcustomervs1[i].fields.CUSTFLD3 || '';
  //               let popCustomercustfield4 = data.tcustomervs1[i].fields.CUSTFLD4 || '';
  //               let popCustomernotes = data.tcustomervs1[i].fields.Notes || '';
  //               let popCustomerpreferedpayment = data.tcustomervs1[i].fields.PaymentMethodName || '';
  //               let popCustomerterms = data.tcustomervs1[i].fields.TermsName || '';
  //               let popCustomerdeliverymethod = data.tcustomervs1[i].fields.ShippingMethodName || '';
  //               let popCustomeraccountnumber = data.tcustomervs1[i].fields.ClientNo || '';
  //               let popCustomerisContractor = data.tcustomervs1[i].fields.Contractor || false;
  //               let popCustomerissupplier = data.tcustomervs1[i].fields.IsSupplier || false;
  //               let popCustomeriscustomer = data.tcustomervs1[i].fields.IsCustomer || false;
  //               let popCustomerTaxCode = data.tcustomervs1[i].fields.TaxCodeName || '';
  //               let popCustomerDiscount = data.tcustomervs1[i].fields.Discount || 0;
  //               let popCustomerType = data.tcustomervs1[i].fields.ClientTypeName || '';
  //               $('#edtCustomerCompany').val(popCustomerName);
  //               $('#edtCustomerPOPID').val(popCustomerID);
  //               $('#edtCustomerPOPEmail').val(popCustomerEmail);
  //               $('#edtTitle').val(popCustomerTitle);
  //               $('#edtFirstName').val(popCustomerFirstName);
  //               $('#edtMiddleName').val(popCustomerMiddleName);
  //               $('#edtLastName').val(popCustomerLastName);
  //               $('#edtCustomerPhone').val(popCustomerPhone);
  //               $('#edtCustomerMobile').val(popCustomerMobile);
  //               $('#edtCustomerFax').val(popCustomerFaxnumber);
  //               $('#edtCustomerSkypeID').val(popCustomerSkypeName);
  //               $('#edtCustomerWebsite').val(popCustomerURL);
  //               $('#edtCustomerShippingAddress').val(popCustomerStreet);
  //               $('#edtCustomerShippingCity').val(popCustomerStreet2);
  //               $('#edtCustomerShippingState').val(popCustomerState);
  //               $('#edtCustomerShippingZIP').val(popCustomerPostcode);
  //               $('#sedtCountry').val(popCustomerCountry);
  //               $('#txaNotes').val(popCustomernotes);
  //               $('#sltPreferedPayment').val(popCustomerpreferedpayment);
  //               $('#sltTermsPOP').val(popCustomerterms);
  //               $('#sltCustomerType').val(popCustomerType);
  //               $('#edtCustomerCardDiscount').val(popCustomerDiscount);
  //               $('#edtCustomeField1').val(popCustomercustfield1);
  //               $('#edtCustomeField2').val(popCustomercustfield2);
  //               $('#edtCustomeField3').val(popCustomercustfield3);
  //               $('#edtCustomeField4').val(popCustomercustfield4);

  //               $('#sltTaxCode').val(popCustomerTaxCode);

  //               if ((data.tcustomervs1[i].fields.Street == data.tcustomervs1[i].fields.BillStreet) && (data.tcustomervs1[i].fields.Street2 == data.tcustomervs1[i].fields.BillStreet2) &&
  //                   (data.tcustomervs1[i].fields.State == data.tcustomervs1[i].fields.BillState) && (data.tcustomervs1[i].fields.Postcode == data.tcustomervs1[i].fields.BillPostcode) &&
  //                   (data.tcustomervs1[i].fields.Country == data.tcustomervs1[i].fields.Billcountry)) {
  //                 $('#chkSameAsShipping2').attr("checked", "checked");
  //               }

  //               if (data.tcustomervs1[i].fields.IsSupplier == true) {
  //                 // $('#isformcontractor')
  //                 $('#chkSameAsSupplier').attr("checked", "checked");
  //               } else {
  //                 $('#chkSameAsSupplier').removeAttr("checked");
  //               }
  //               let customerRecord = {
  //                 id: popCustomerID,
  //                 phone: popCustomerPhone,
  //                 firstname: popCustomerFirstName,
  //                 middlename: popCustomerMiddleName,
  //                 lastname: popCustomerLastName,
  //                 company: data.tcustomervs1[i].fields.Companyname || '',
  //                 email: popCustomerEmail,
  //                 title: popCustomerTitle,
  //                 tfn: popCustomertfn,
  //                 mobile: popCustomerMobile,
  //                 fax: popCustomerFaxnumber,
  //                 shippingaddress: popCustomerStreet,
  //                 scity: popCustomerStreet2,
  //                 sstate: popCustomerCountry,
  //                 terms: '',
  //                 spostalcode: popCustomerPostcode,
  //                 scountry: popCustomerState,
  //                 billingaddress: popCustomerbillingaddress,
  //                 bcity: popCustomerbcity,
  //                 bstate: popCustomerbstate,
  //                 bpostalcode: popCustomerbpostalcode,
  //                 bcountry: popCustomerCountry,
  //                 custFld1: popCustomercustfield1,
  //                 custFld2: popCustomercustfield2,
  //                 jobbcountry: '',
  //                 jobscountry: '',
  //                 discount: 0
  //               }
  //               templateObject.customerRecord.set(customerRecord);
  //               // setTimeout(function () {
  //               //   $('#addCustomerModal').modal('show');
  //               // }, 200);
  //             }
  //           }
  //           if (!added) {
  //             LoadingOverlay.show();
  //             sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
  //               LoadingOverlay.hide();
  //               let lineItems = [];
  //               $('#add-customer-title').text('Edit Customer');
  //               let popCustomerID = data.tcustomer[0].fields.ID || '';
  //               let popCustomerName = data.tcustomer[0].fields.ClientName || '';
  //               let popCustomerEmail = data.tcustomer[0].fields.Email || '';
  //               let popCustomerTitle = data.tcustomer[0].fields.Title || '';
  //               let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
  //               let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
  //               let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
  //               let popCustomertfn = '' || '';
  //               let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
  //               let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
  //               let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
  //               let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
  //               let popCustomerURL = data.tcustomer[0].fields.URL || '';
  //               let popCustomerStreet = data.tcustomer[0].fields.Street || '';
  //               let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
  //               let popCustomerState = data.tcustomer[0].fields.State || '';
  //               let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
  //               let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
  //               let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
  //               let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
  //               let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
  //               let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
  //               let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
  //               let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
  //               let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
  //               let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
  //               let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
  //               let popCustomernotes = data.tcustomer[0].fields.Notes || '';
  //               let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
  //               let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
  //               let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
  //               let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
  //               let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
  //               let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
  //               let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
  //               let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
  //               let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
  //               let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
  //               $('#edtCustomerCompany').val(popCustomerName);
  //               $('#edtCustomerPOPID').val(popCustomerID);
  //               $('#edtCustomerPOPEmail').val(popCustomerEmail);
  //               $('#edtTitle').val(popCustomerTitle);
  //               $('#edtFirstName').val(popCustomerFirstName);
  //               $('#edtMiddleName').val(popCustomerMiddleName);
  //               $('#edtLastName').val(popCustomerLastName);
  //               $('#edtCustomerPhone').val(popCustomerPhone);
  //               $('#edtCustomerMobile').val(popCustomerMobile);
  //               $('#edtCustomerFax').val(popCustomerFaxnumber);
  //               $('#edtCustomerSkypeID').val(popCustomerSkypeName);
  //               $('#edtCustomerWebsite').val(popCustomerURL);
  //               $('#edtCustomerShippingAddress').val(popCustomerStreet);
  //               $('#edtCustomerShippingCity').val(popCustomerStreet2);
  //               $('#edtCustomerShippingState').val(popCustomerState);
  //               $('#edtCustomerShippingZIP').val(popCustomerPostcode);
  //               $('#sedtCountry').val(popCustomerCountry);
  //               $('#txaNotes').val(popCustomernotes);
  //               $('#sltPreferedPayment').val(popCustomerpreferedpayment);
  //               $('#sltTermsPOP').val(popCustomerterms);
  //               $('#sltCustomerType').val(popCustomerType);
  //               $('#edtCustomerCardDiscount').val(popCustomerDiscount);
  //               $('#edtCustomeField1').val(popCustomercustfield1);
  //               $('#edtCustomeField2').val(popCustomercustfield2);
  //               $('#edtCustomeField3').val(popCustomercustfield3);
  //               $('#edtCustomeField4').val(popCustomercustfield4);

  //               $('#sltTaxCode').val(popCustomerTaxCode);

  //               if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
  //                   (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
  //                   (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
  //                 $('#chkSameAsShipping2').attr("checked", "checked");
  //               }

  //               if (data.tcustomer[0].fields.IsSupplier == true) {
  //                 // $('#isformcontractor')
  //                 $('#chkSameAsSupplier').attr("checked", "checked");
  //               } else {
  //                 $('#chkSameAsSupplier').removeAttr("checked");
  //               }

  //               // setTimeout(function () {
  //               //   $('#addCustomerModal').modal('show');
  //               // }, 200);
  //             }).catch(function (err) {
  //               LoadingOverlay.hide();
  //             });
  //           }
  //         }
  //       }).catch(function (err) {
  //         sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
  //           LoadingOverlay.hide();
  //           let lineItems = [];
  //           $('#add-customer-title').text('Edit Customer');
  //           let popCustomerID = data.tcustomer[0].fields.ID || '';
  //           let popCustomerName = data.tcustomer[0].fields.ClientName || '';
  //           let popCustomerEmail = data.tcustomer[0].fields.Email || '';
  //           let popCustomerTitle = data.tcustomer[0].fields.Title || '';
  //           let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
  //           let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
  //           let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
  //           let popCustomertfn = '' || '';
  //           let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
  //           let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
  //           let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
  //           let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
  //           let popCustomerURL = data.tcustomer[0].fields.URL || '';
  //           let popCustomerStreet = data.tcustomer[0].fields.Street || '';
  //           let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
  //           let popCustomerState = data.tcustomer[0].fields.State || '';
  //           let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
  //           let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
  //           let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
  //           let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
  //           let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
  //           let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
  //           let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
  //           let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
  //           let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
  //           let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
  //           let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
  //           let popCustomernotes = data.tcustomer[0].fields.Notes || '';
  //           let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
  //           let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
  //           let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
  //           let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
  //           let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
  //           let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
  //           let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
  //           let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
  //           let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
  //           let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
  //           $('#edtCustomerCompany').val(popCustomerName);
  //           $('#edtCustomerPOPID').val(popCustomerID);
  //           $('#edtCustomerPOPEmail').val(popCustomerEmail);
  //           $('#edtTitle').val(popCustomerTitle);
  //           $('#edtFirstName').val(popCustomerFirstName);
  //           $('#edtMiddleName').val(popCustomerMiddleName);
  //           $('#edtLastName').val(popCustomerLastName);
  //           $('#edtCustomerPhone').val(popCustomerPhone);
  //           $('#edtCustomerMobile').val(popCustomerMobile);
  //           $('#edtCustomerFax').val(popCustomerFaxnumber);
  //           $('#edtCustomerSkypeID').val(popCustomerSkypeName);
  //           $('#edtCustomerWebsite').val(popCustomerURL);
  //           $('#edtCustomerShippingAddress').val(popCustomerStreet);
  //           $('#edtCustomerShippingCity').val(popCustomerStreet2);
  //           $('#edtCustomerShippingState').val(popCustomerState);
  //           $('#edtCustomerShippingZIP').val(popCustomerPostcode);
  //           $('#sedtCountry').val(popCustomerCountry);
  //           $('#txaNotes').val(popCustomernotes);
  //           $('#sltPreferedPayment').val(popCustomerpreferedpayment);
  //           $('#sltTermsPOP').val(popCustomerterms);
  //           $('#sltCustomerType').val(popCustomerType);
  //           $('#edtCustomerCardDiscount').val(popCustomerDiscount);
  //           $('#edtCustomeField1').val(popCustomercustfield1);
  //           $('#edtCustomeField2').val(popCustomercustfield2);
  //           $('#edtCustomeField3').val(popCustomercustfield3);
  //           $('#edtCustomeField4').val(popCustomercustfield4);

  //           $('#sltTaxCode').val(popCustomerTaxCode);

  //           if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
  //               (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
  //               (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
  //             $('#chkSameAsShipping2').attr("checked", "checked");
  //           }

  //           if (data.tcustomer[0].fields.IsSupplier == true) {
  //             // $('#isformcontractor')
  //             $('#chkSameAsSupplier').attr("checked", "checked");
  //           } else {
  //             $('#chkSameAsSupplier').removeAttr("checked");
  //           }

  //           // setTimeout(function () {
  //           //   $('#addCustomerModal').modal('show');
  //           // }, 200);
  //         }).catch(function (err) {

  //           LoadingOverlay.hide();
  //         });
  //       });
  //     } else {
  //       $('#customerListModal').modal();
  //       setTimeout(function () {
  //         $('#tblCustomerlist_filter .form-control-sm').focus();
  //         $('#tblCustomerlist_filter .form-control-sm').val('');
  //         $('#tblCustomerlist_filter .form-control-sm').trigger("input");
  //         var datatable = $('#tblCustomerlist').DataTable();
  //         //datatable.clear();
  //         //datatable.rows.add(splashArrayCustomerList);
  //         datatable.draw();
  //         $('#tblCustomerlist_filter .form-control-sm').trigger("input");
  //         //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
  //       }, 500);
  //     }
  //   }


  // });


  // $(document).on('click', '#edtCustomerName', function(e, li) {
  //   var $earch = $(this);
  //   var offset = $earch.offset();
  //   $('#edtCustomerPOPID').val('');
  //   var customerDataName = e.target.value || '';
  //   var customerDataID = $('#edtCustomerName').attr('custid').replace(/\s/g, '') || '';
  //   if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
  //     $('#customerListModal').modal();
  //     setTimeout(function () {
  //       $('#tblCustomerlist_filter .form-control-sm').focus();
  //       $('#tblCustomerlist_filter .form-control-sm').val('');
  //       $('#tblCustomerlist_filter .form-control-sm').trigger("input");
  //       var datatable = $('#tblCustomerlist').DataTable();
  //       //datatable.clear();
  //       //datatable.rows.add(splashArrayCustomerList);
  //       datatable.draw();
  //       $('#tblCustomerlist_filter .form-control-sm').trigger("input");
  //       //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
  //     }, 500);
  //   } else {
  //     if (customerDataName.replace(/\s/g, '') != '') {
  //       //FlowRouter.go('/customerscard?name=' + e.target.value);
  //       $('#edtCustomerPOPID').val('');
  //       getVS1Data('TCustomerVS1').then(function (dataObject) {
  //         if (dataObject.length == 0) {
  //           LoadingOverlay.show();
  //           sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
  //             LoadingOverlay.hide();
  //             let lineItems = [];
  //             $('#add-customer-title').text('Edit Customer');
  //             let popCustomerID = data.tcustomer[0].fields.ID || '';
  //             let popCustomerName = data.tcustomer[0].fields.ClientName || '';
  //             let popCustomerEmail = data.tcustomer[0].fields.Email || '';
  //             let popCustomerTitle = data.tcustomer[0].fields.Title || '';
  //             let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
  //             let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
  //             let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
  //             let popCustomertfn = '' || '';
  //             let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
  //             let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
  //             let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
  //             let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
  //             let popCustomerURL = data.tcustomer[0].fields.URL || '';
  //             let popCustomerStreet = data.tcustomer[0].fields.Street || '';
  //             let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
  //             let popCustomerState = data.tcustomer[0].fields.State || '';
  //             let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
  //             let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
  //             let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
  //             let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
  //             let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
  //             let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
  //             let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
  //             let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
  //             let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
  //             let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
  //             let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
  //             let popCustomernotes = data.tcustomer[0].fields.Notes || '';
  //             let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
  //             let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
  //             let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
  //             let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
  //             let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
  //             let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
  //             let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
  //             let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
  //             let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
  //             let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
  //             $('#edtCustomerCompany').val(popCustomerName);
  //             $('#edtCustomerPOPID').val(popCustomerID);
  //             $('#edtCustomerPOPEmail').val(popCustomerEmail);
  //             $('#edtTitle').val(popCustomerTitle);
  //             $('#edtFirstName').val(popCustomerFirstName);
  //             $('#edtMiddleName').val(popCustomerMiddleName);
  //             $('#edtLastName').val(popCustomerLastName);
  //             $('#edtCustomerPhone').val(popCustomerPhone);
  //             $('#edtCustomerMobile').val(popCustomerMobile);
  //             $('#edtCustomerFax').val(popCustomerFaxnumber);
  //             $('#edtCustomerSkypeID').val(popCustomerSkypeName);
  //             $('#edtCustomerWebsite').val(popCustomerURL);
  //             $('#edtCustomerShippingAddress').val(popCustomerStreet);
  //             $('#edtCustomerShippingCity').val(popCustomerStreet2);
  //             $('#edtCustomerShippingState').val(popCustomerState);
  //             $('#edtCustomerShippingZIP').val(popCustomerPostcode);
  //             $('#sedtCountry').val(popCustomerCountry);
  //             $('#txaNotes').val(popCustomernotes);
  //             $('#sltPreferedPayment').val(popCustomerpreferedpayment);
  //             $('#sltTermsPOP').val(popCustomerterms);
  //             $('#sltCustomerType').val(popCustomerType);
  //             $('#edtCustomerCardDiscount').val(popCustomerDiscount);
  //             $('#edtCustomeField1').val(popCustomercustfield1);
  //             $('#edtCustomeField2').val(popCustomercustfield2);
  //             $('#edtCustomeField3').val(popCustomercustfield3);
  //             $('#edtCustomeField4').val(popCustomercustfield4);

  //             $('#sltTaxCode').val(popCustomerTaxCode);

  //             if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
  //                 (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
  //                 (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
  //               $('#chkSameAsShipping2').attr("checked", "checked");
  //             }

  //             if (data.tcustomer[0].fields.IsSupplier == true) {
  //               // $('#isformcontractor')
  //               $('#chkSameAsSupplier').attr("checked", "checked");
  //             } else {
  //               $('#chkSameAsSupplier').removeAttr("checked");
  //             }
  //             let customerRecord = {
  //               id: popCustomerID,
  //               phone: popCustomerPhone,
  //               firstname: popCustomerFirstName,
  //               middlename: popCustomerMiddleName,
  //               lastname: popCustomerLastName,
  //               company: data.tcustomervs1[0].fields.Companyname || '',
  //               email: popCustomerEmail,
  //               title: popCustomerTitle,
  //               tfn: popCustomertfn,
  //               mobile: popCustomerMobile,
  //               fax: popCustomerFaxnumber,
  //               shippingaddress: popCustomerStreet,
  //               scity: popCustomerStreet2,
  //               sstate: popCustomerCountry,
  //               terms: '',
  //               spostalcode: popCustomerPostcode,
  //               scountry: popCustomerState,
  //               billingaddress: popCustomerbillingaddress,
  //               bcity: popCustomerbcity,
  //               bstate: popCustomerbstate,
  //               bpostalcode: popCustomerbpostalcode,
  //               bcountry: popCustomerCountry,
  //               custFld1: popCustomercustfield1,
  //               custFld2: popCustomercustfield2,
  //               jobbcountry: '',
  //               jobscountry: '',
  //               discount: 0
  //             }
  //             templateObject.customerRecord.set(customerRecord);
  //             // setTimeout(function () {
  //             //   $('#addCustomerModal').modal('show');
  //             // }, 200);
  //           }).catch(function (err) {
  //             LoadingOverlay.hide();
  //           });
  //         } else {
  //           let data = JSON.parse(dataObject[0].data);
  //           let useData = data.tcustomervs1;

  //           var added = false;
  //           for (let i = 0; i < data.tcustomervs1.length; i++) {
  //             if (data.tcustomervs1[i].fields.ClientName === customerDataName) {
  //               let lineItems = [];
  //               added = true;
  //               LoadingOverlay.hide();
  //               $('#add-customer-title').text('Edit Customer');
  //               let popCustomerID = data.tcustomervs1[i].fields.ID || '';
  //               let popCustomerName = data.tcustomervs1[i].fields.ClientName || '';
  //               let popCustomerEmail = data.tcustomervs1[i].fields.Email || '';
  //               let popCustomerTitle = data.tcustomervs1[i].fields.Title || '';
  //               let popCustomerFirstName = data.tcustomervs1[i].fields.FirstName || '';
  //               let popCustomerMiddleName = data.tcustomervs1[i].fields.CUSTFLD10 || '';
  //               let popCustomerLastName = data.tcustomervs1[i].fields.LastName || '';
  //               let popCustomertfn = '' || '';
  //               let popCustomerPhone = data.tcustomervs1[i].fields.Phone || '';
  //               let popCustomerMobile = data.tcustomervs1[i].fields.Mobile || '';
  //               let popCustomerFaxnumber = data.tcustomervs1[i].fields.Faxnumber || '';
  //               let popCustomerSkypeName = data.tcustomervs1[i].fields.SkypeName || '';
  //               let popCustomerURL = data.tcustomervs1[i].fields.URL || '';
  //               let popCustomerStreet = data.tcustomervs1[i].fields.Street || '';
  //               let popCustomerStreet2 = data.tcustomervs1[i].fields.Street2 || '';
  //               let popCustomerState = data.tcustomervs1[i].fields.State || '';
  //               let popCustomerPostcode = data.tcustomervs1[i].fields.Postcode || '';
  //               let popCustomerCountry = data.tcustomervs1[i].fields.Country || LoggedCountry;
  //               let popCustomerbillingaddress = data.tcustomervs1[i].fields.BillStreet || '';
  //               let popCustomerbcity = data.tcustomervs1[i].fields.BillStreet2 || '';
  //               let popCustomerbstate = data.tcustomervs1[i].fields.BillState || '';
  //               let popCustomerbpostalcode = data.tcustomervs1[i].fields.BillPostcode || '';
  //               let popCustomerbcountry = data.tcustomervs1[i].fields.Billcountry || LoggedCountry;
  //               let popCustomercustfield1 = data.tcustomervs1[i].fields.CUSTFLD1 || '';
  //               let popCustomercustfield2 = data.tcustomervs1[i].fields.CUSTFLD2 || '';
  //               let popCustomercustfield3 = data.tcustomervs1[i].fields.CUSTFLD3 || '';
  //               let popCustomercustfield4 = data.tcustomervs1[i].fields.CUSTFLD4 || '';
  //               let popCustomernotes = data.tcustomervs1[i].fields.Notes || '';
  //               let popCustomerpreferedpayment = data.tcustomervs1[i].fields.PaymentMethodName || '';
  //               let popCustomerterms = data.tcustomervs1[i].fields.TermsName || '';
  //               let popCustomerdeliverymethod = data.tcustomervs1[i].fields.ShippingMethodName || '';
  //               let popCustomeraccountnumber = data.tcustomervs1[i].fields.ClientNo || '';
  //               let popCustomerisContractor = data.tcustomervs1[i].fields.Contractor || false;
  //               let popCustomerissupplier = data.tcustomervs1[i].fields.IsSupplier || false;
  //               let popCustomeriscustomer = data.tcustomervs1[i].fields.IsCustomer || false;
  //               let popCustomerTaxCode = data.tcustomervs1[i].fields.TaxCodeName || '';
  //               let popCustomerDiscount = data.tcustomervs1[i].fields.Discount || 0;
  //               let popCustomerType = data.tcustomervs1[i].fields.ClientTypeName || '';
  //               $('#edtCustomerCompany').val(popCustomerName);
  //               $('#edtCustomerPOPID').val(popCustomerID);
  //               $('#edtCustomerPOPEmail').val(popCustomerEmail);
  //               $('#edtTitle').val(popCustomerTitle);
  //               $('#edtFirstName').val(popCustomerFirstName);
  //               $('#edtMiddleName').val(popCustomerMiddleName);
  //               $('#edtLastName').val(popCustomerLastName);
  //               $('#edtCustomerPhone').val(popCustomerPhone);
  //               $('#edtCustomerMobile').val(popCustomerMobile);
  //               $('#edtCustomerFax').val(popCustomerFaxnumber);
  //               $('#edtCustomerSkypeID').val(popCustomerSkypeName);
  //               $('#edtCustomerWebsite').val(popCustomerURL);
  //               $('#edtCustomerShippingAddress').val(popCustomerStreet);
  //               $('#edtCustomerShippingCity').val(popCustomerStreet2);
  //               $('#edtCustomerShippingState').val(popCustomerState);
  //               $('#edtCustomerShippingZIP').val(popCustomerPostcode);
  //               $('#sedtCountry').val(popCustomerCountry);
  //               $('#txaNotes').val(popCustomernotes);
  //               $('#sltPreferedPayment').val(popCustomerpreferedpayment);
  //               $('#sltTermsPOP').val(popCustomerterms);
  //               $('#sltCustomerType').val(popCustomerType);
  //               $('#edtCustomerCardDiscount').val(popCustomerDiscount);
  //               $('#edtCustomeField1').val(popCustomercustfield1);
  //               $('#edtCustomeField2').val(popCustomercustfield2);
  //               $('#edtCustomeField3').val(popCustomercustfield3);
  //               $('#edtCustomeField4').val(popCustomercustfield4);

  //               $('#sltTaxCode').val(popCustomerTaxCode);

  //               if ((data.tcustomervs1[i].fields.Street == data.tcustomervs1[i].fields.BillStreet) && (data.tcustomervs1[i].fields.Street2 == data.tcustomervs1[i].fields.BillStreet2) &&
  //                   (data.tcustomervs1[i].fields.State == data.tcustomervs1[i].fields.BillState) && (data.tcustomervs1[i].fields.Postcode == data.tcustomervs1[i].fields.BillPostcode) &&
  //                   (data.tcustomervs1[i].fields.Country == data.tcustomervs1[i].fields.Billcountry)) {
  //                 $('#chkSameAsShipping2').attr("checked", "checked");
  //               }

  //               if (data.tcustomervs1[i].fields.IsSupplier == true) {
  //                 // $('#isformcontractor')
  //                 $('#chkSameAsSupplier').attr("checked", "checked");
  //               } else {
  //                 $('#chkSameAsSupplier').removeAttr("checked");
  //               }
  //               let customerRecord = {
  //                 id: popCustomerID,
  //                 phone: popCustomerPhone,
  //                 firstname: popCustomerFirstName,
  //                 middlename: popCustomerMiddleName,
  //                 lastname: popCustomerLastName,
  //                 company: data.tcustomervs1[i].fields.Companyname || '',
  //                 email: popCustomerEmail,
  //                 title: popCustomerTitle,
  //                 tfn: popCustomertfn,
  //                 mobile: popCustomerMobile,
  //                 fax: popCustomerFaxnumber,
  //                 shippingaddress: popCustomerStreet,
  //                 scity: popCustomerStreet2,
  //                 sstate: popCustomerCountry,
  //                 terms: '',
  //                 spostalcode: popCustomerPostcode,
  //                 scountry: popCustomerState,
  //                 billingaddress: popCustomerbillingaddress,
  //                 bcity: popCustomerbcity,
  //                 bstate: popCustomerbstate,
  //                 bpostalcode: popCustomerbpostalcode,
  //                 bcountry: popCustomerCountry,
  //                 custFld1: popCustomercustfield1,
  //                 custFld2: popCustomercustfield2,
  //                 jobbcountry: '',
  //                 jobscountry: '',
  //                 discount: 0
  //               }
  //               templateObject.customerRecord.set(customerRecord);
  //               // setTimeout(function () {
  //               //   $('#addCustomerModal').modal('show');
  //               // }, 200);
  //             }
  //           }
  //           if (!added) {
  //             LoadingOverlay.show();
  //             sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
  //               LoadingOverlay.hide();
  //               let lineItems = [];
  //               $('#add-customer-title').text('Edit Customer');
  //               let popCustomerID = data.tcustomer[0].fields.ID || '';
  //               let popCustomerName = data.tcustomer[0].fields.ClientName || '';
  //               let popCustomerEmail = data.tcustomer[0].fields.Email || '';
  //               let popCustomerTitle = data.tcustomer[0].fields.Title || '';
  //               let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
  //               let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
  //               let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
  //               let popCustomertfn = '' || '';
  //               let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
  //               let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
  //               let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
  //               let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
  //               let popCustomerURL = data.tcustomer[0].fields.URL || '';
  //               let popCustomerStreet = data.tcustomer[0].fields.Street || '';
  //               let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
  //               let popCustomerState = data.tcustomer[0].fields.State || '';
  //               let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
  //               let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
  //               let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
  //               let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
  //               let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
  //               let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
  //               let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
  //               let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
  //               let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
  //               let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
  //               let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
  //               let popCustomernotes = data.tcustomer[0].fields.Notes || '';
  //               let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
  //               let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
  //               let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
  //               let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
  //               let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
  //               let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
  //               let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
  //               let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
  //               let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
  //               let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
  //               $('#edtCustomerCompany').val(popCustomerName);
  //               $('#edtCustomerPOPID').val(popCustomerID);
  //               $('#edtCustomerPOPEmail').val(popCustomerEmail);
  //               $('#edtTitle').val(popCustomerTitle);
  //               $('#edtFirstName').val(popCustomerFirstName);
  //               $('#edtMiddleName').val(popCustomerMiddleName);
  //               $('#edtLastName').val(popCustomerLastName);
  //               $('#edtCustomerPhone').val(popCustomerPhone);
  //               $('#edtCustomerMobile').val(popCustomerMobile);
  //               $('#edtCustomerFax').val(popCustomerFaxnumber);
  //               $('#edtCustomerSkypeID').val(popCustomerSkypeName);
  //               $('#edtCustomerWebsite').val(popCustomerURL);
  //               $('#edtCustomerShippingAddress').val(popCustomerStreet);
  //               $('#edtCustomerShippingCity').val(popCustomerStreet2);
  //               $('#edtCustomerShippingState').val(popCustomerState);
  //               $('#edtCustomerShippingZIP').val(popCustomerPostcode);
  //               $('#sedtCountry').val(popCustomerCountry);
  //               $('#txaNotes').val(popCustomernotes);
  //               $('#sltPreferedPayment').val(popCustomerpreferedpayment);
  //               $('#sltTermsPOP').val(popCustomerterms);
  //               $('#sltCustomerType').val(popCustomerType);
  //               $('#edtCustomerCardDiscount').val(popCustomerDiscount);
  //               $('#edtCustomeField1').val(popCustomercustfield1);
  //               $('#edtCustomeField2').val(popCustomercustfield2);
  //               $('#edtCustomeField3').val(popCustomercustfield3);
  //               $('#edtCustomeField4').val(popCustomercustfield4);

  //               $('#sltTaxCode').val(popCustomerTaxCode);

  //               if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
  //                   (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
  //                   (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
  //                 $('#chkSameAsShipping2').attr("checked", "checked");
  //               }

  //               if (data.tcustomer[0].fields.IsSupplier == true) {
  //                 // $('#isformcontractor')
  //                 $('#chkSameAsSupplier').attr("checked", "checked");
  //               } else {
  //                 $('#chkSameAsSupplier').removeAttr("checked");
  //               }

  //               // setTimeout(function () {
  //               //   $('#addCustomerModal').modal('show');
  //               // }, 200);
  //             }).catch(function (err) {
  //               LoadingOverlay.hide();
  //             });
  //           }
  //         }
  //       }).catch(function (err) {
  //         sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
  //           LoadingOverlay.hide();
  //           let lineItems = [];
  //           $('#add-customer-title').text('Edit Customer');
  //           let popCustomerID = data.tcustomer[0].fields.ID || '';
  //           let popCustomerName = data.tcustomer[0].fields.ClientName || '';
  //           let popCustomerEmail = data.tcustomer[0].fields.Email || '';
  //           let popCustomerTitle = data.tcustomer[0].fields.Title || '';
  //           let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
  //           let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
  //           let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
  //           let popCustomertfn = '' || '';
  //           let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
  //           let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
  //           let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
  //           let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
  //           let popCustomerURL = data.tcustomer[0].fields.URL || '';
  //           let popCustomerStreet = data.tcustomer[0].fields.Street || '';
  //           let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
  //           let popCustomerState = data.tcustomer[0].fields.State || '';
  //           let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
  //           let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
  //           let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
  //           let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
  //           let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
  //           let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
  //           let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
  //           let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
  //           let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
  //           let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
  //           let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
  //           let popCustomernotes = data.tcustomer[0].fields.Notes || '';
  //           let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
  //           let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
  //           let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
  //           let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
  //           let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
  //           let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
  //           let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
  //           let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
  //           let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
  //           let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
  //           $('#edtCustomerCompany').val(popCustomerName);
  //           $('#edtCustomerPOPID').val(popCustomerID);
  //           $('#edtCustomerPOPEmail').val(popCustomerEmail);
  //           $('#edtTitle').val(popCustomerTitle);
  //           $('#edtFirstName').val(popCustomerFirstName);
  //           $('#edtMiddleName').val(popCustomerMiddleName);
  //           $('#edtLastName').val(popCustomerLastName);
  //           $('#edtCustomerPhone').val(popCustomerPhone);
  //           $('#edtCustomerMobile').val(popCustomerMobile);
  //           $('#edtCustomerFax').val(popCustomerFaxnumber);
  //           $('#edtCustomerSkypeID').val(popCustomerSkypeName);
  //           $('#edtCustomerWebsite').val(popCustomerURL);
  //           $('#edtCustomerShippingAddress').val(popCustomerStreet);
  //           $('#edtCustomerShippingCity').val(popCustomerStreet2);
  //           $('#edtCustomerShippingState').val(popCustomerState);
  //           $('#edtCustomerShippingZIP').val(popCustomerPostcode);
  //           $('#sedtCountry').val(popCustomerCountry);
  //           $('#txaNotes').val(popCustomernotes);
  //           $('#sltPreferedPayment').val(popCustomerpreferedpayment);
  //           $('#sltTermsPOP').val(popCustomerterms);
  //           $('#sltCustomerType').val(popCustomerType);
  //           $('#edtCustomerCardDiscount').val(popCustomerDiscount);
  //           $('#edtCustomeField1').val(popCustomercustfield1);
  //           $('#edtCustomeField2').val(popCustomercustfield2);
  //           $('#edtCustomeField3').val(popCustomercustfield3);
  //           $('#edtCustomeField4').val(popCustomercustfield4);

  //           $('#sltTaxCode').val(popCustomerTaxCode);

  //           if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
  //               (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
  //               (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
  //             $('#chkSameAsShipping2').attr("checked", "checked");
  //           }

  //           if (data.tcustomer[0].fields.IsSupplier == true) {
  //             // $('#isformcontractor')
  //             $('#chkSameAsSupplier').attr("checked", "checked");
  //           } else {
  //             $('#chkSameAsSupplier').removeAttr("checked");
  //           }

  //           // setTimeout(function () {
  //           //   $('#addCustomerModal').modal('show');
  //           // }, 200);
  //         }).catch(function (err) {

  //           LoadingOverlay.hide();
  //         });
  //       });
  //     } else {
  //       $('#customerListModal').modal();
  //       setTimeout(function () {
  //         $('#tblCustomerlist_filter .form-control-sm').focus();
  //         $('#tblCustomerlist_filter .form-control-sm').val('');
  //         $('#tblCustomerlist_filter .form-control-sm').trigger("input");
  //         var datatable = $('#tblCustomerlist').DataTable();
  //         //datatable.clear();
  //         //datatable.rows.add(splashArrayCustomerList);
  //         datatable.draw();
  //         $('#tblCustomerlist_filter .form-control-sm').trigger("input");
  //         //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
  //       }, 500);
  //     }
  //   }
  // })



  // exportSalesToPdf1 = function () {

  //   let margins = {
  //     top: 0,
  //     bottom: 0,
  //     left: 0,
  //     width: 100
  //   };

  //   let invoiceData = templateObject.salesorderrecord.get();
  //   let stripe_id = templateObject.accountID.get() || '';
  //   let stripe_fee_method = templateObject.stripe_fee_method.get();
  //   let lineItems = [];
  //   let taxItems = {};
  //   let total = $('#totalBalanceDue').html() || 0;
  //   let tax = $('#subtotal_tax').html() || 0;
  //   let customer = $('#edtCustomerName').val();
  //   let name = $('#firstname').val();
  //   let surname = $('#lastname').val();
  //   let dept = $('#sltDept').val();
  //   var erpGet = erpDb();

  //   let subtotal = $('#subtotal_total').text();
  //   let net = $('#subtotal_nett').text();
  //   let subtotal_discount = $('#subtotal_discount').text();
  //   let grandTotal = $('#grandTotal').text();
  //   let totalPaidAmt = $('#totalPaidAmt').text();
  //   let totalBalanceDue = $('#totalBalanceDue').text();

  //   $('#tblSalesOrderLine > tbody > tr').each(function () {
  //     var lineID = this.id;
  //     let tdproduct = $('#' + lineID + " .lineProductName").val();
  //     let tddescription = $('#' + lineID + " .lineProductDesc").text();
  //     let tdQty = $('#' + lineID + " .lineQty").val();
  //     let tdunitprice = $('#' + lineID + " .colUnitPriceExChange").val();
  //     let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
  //     let tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || loggedTaxCodeSalesInc;
  //     let tdlineamt = $('#' + lineID + " .lineAmt").text();

  //     let targetRow = $('#' + lineID);
  //     let targetTaxCode = targetRow.find('.lineTaxCode').val();
  //     let qty = targetRow.find(".lineQty").val() || 0
  //     let price = targetRow.find('.colUnitPriceExChange').val() || 0;
  //     const taxDetail = templateObject.taxcodes.get().find((v) => v.CodeName === targetTaxCode);

  //     if (taxDetail) {
  //       let priceTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, ""));
  //       let taxTotal = priceTotal * parseFloat(taxDetail.Rate);
  //       if (taxDetail.Lines) {
  //         taxDetail.Lines.map((line) => {
  //           let taxCode = line.SubTaxCode;
  //           let amount = priceTotal * line.Percentage / 100;
  //           if (taxItems[taxCode]) {
  //             taxItems[taxCode] += amount;
  //           }
  //           else {
  //             taxItems[taxCode] = amount;
  //           }
  //         });
  //       }
  //       else {
  //         // taxItems[targetTaxCode] = taxTotal;
  //       }
  //     }

  //     lineItemObj = {
  //       description: tddescription || '',
  //       quantity: tdQty || 0,
  //       unitPrice: tdunitprice.toLocaleString(undefined, {
  //         minimumFractionDigits: 2
  //       }) || 0
  //     }

  //     lineItems.push(lineItemObj);
  //   });

  //   $("#html-2-pdfwrapper #subtotal_totalPrint").html(subtotal);
  //   $("#html-2-pdfwrapper #grandTotalPrint").html(grandTotal);
  //   $("#html-2-pdfwrapper #totalpaidamount").html(totalPaidAmt);
  //   $("#html-2-pdfwrapper #totalBalanceDuePrint").html(totalBalanceDue);


  //   let company = localStorage.getItem('vs1companyName');
  //   let vs1User = localStorage.getItem('mySession');
  //   let customerEmail = $('#edtCustomerEmail').val();
  //   let id = $('.printID').attr("id");
  //   let currencyname = (CountryAbbr).toLowerCase();
  //   stringQuery = "?";
  //   var customerID = $('#edtCustomerEmail').attr('customerid');
  //   for (let l = 0; l < lineItems.length; l++) {
  //     stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
  //   }
  //   stringQuery = stringQuery + "tax=" + tax + "&total=" + total + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + invoiceData.id + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Sales Order&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;
  //   // var pdf = new jsPDF('p', 'pt', 'a4');
  //   // pdf.setFontSize(18);
  //   $(".linkText").attr("href", stripeGlobalURL + stringQuery);
  //   $('#html-2-pdfwrapper').css('display', 'block');

  //   if (taxItems && Object.keys(taxItems).length > 0) {
  //     $("#html-2-pdfwrapper #tax_list_print").html("");
  //     Object.keys(taxItems).map((code) => {
  //       let html = `
  //                       <div style="width: 100%; display: flex;">
  //                           <div style="padding-right: 16px; width: 50%;">
  //                               <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
  //                                   ${code}</p>
  //                           </div>
  //                           <div style="padding-left: 16px; width: 50%;">
  //                               <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
  //                                   $${taxItems[code].toFixed(3)}</p>
  //                           </div>
  //                       </div>
  //                   `;
  //       $("#html-2-pdfwrapper #tax_list_print").append(html);
  //     });
  //   } else {
  //     $("#html-2-pdfwrapper #tax_list_print").remove();
  //   }

  //   var source = document.getElementById('html-2-pdfwrapper');

  //   let file = "Sales Order.pdf";
  //   if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
  //     file = 'Sales Order-' + id + '.pdf';
  //   }

  //   var opt = {
  //     margin: 0,
  //     filename: file,
  //     image: {
  //       type: 'jpeg',
  //       quality: 0.98
  //     },
  //     html2canvas: {
  //       scale: 2
  //     },
  //     jsPDF: {
  //       unit: 'in',
  //       format: 'a4',
  //       orientation: 'portrait'
  //     }
  //   };
  //   html2pdf().set(opt).from(source).save().then(function (dataObject) {

  //     if ($('.printID').attr('id') == undefined || $('.printID').attr('id') == "") {
  //       $('#html-2-pdfwrapper').css('display', 'none');
  //       $(".btnSave").trigger("click");
  //     } else {
  //       $('#html-2-pdfwrapper').css('display', 'none');
  //       LoadingOverlay.hide();
  //     }
  //   });

  //   // pdf.addHTML(source, function () {

  //   //     pdf.setFontSize(10);
  //   //     pdf.setTextColor(255, 255, 255);
  //   //      pdf.textWithLink('Pay Now', 505, 113, { url: 'https://www.depot.vs1cloud.com/stripe/' + stringQuery });

  //   //     if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
  //   //         pdf.save('Sales Order-' + id + '.pdf');
  //   //     } else {
  //   //         pdf.save('Sales Order.pdf');
  //   //     }
  //   //     $('#html-2-pdfwrapper').css('display', 'none');
  //   //     LoadingOverlay.hide();
  //   // });

  // };


  setTimeout(function () {

    var x = window.matchMedia("(max-width: 1024px)")

    function mediaQuery(x) {
      if (x.matches) {

        $("#colInvnoReference").removeClass("col-auto");
        $("#colInvnoReference").addClass("col-6");

        $("#colTermsVia").removeClass("col-auto");
        $("#colTermsVia").addClass("col-6");

        $("#colStatusDepartment").removeClass("col-auto");
        $("#colStatusDepartment").addClass("col-6");

        $("#colBillingAddress").removeClass("col-auto");
        $("#colBillingAddress").addClass("col-6");

        $("#colOrderDue").removeClass("col-auto");
        $("#colOrderDue").addClass("col-6");

        $("#fieldwidth").removeClass("billaddressfield");
        $("#fieldwidth").addClass("billaddressfield2");

      }
    }
    mediaQuery(x)
    x.addListener(mediaQuery)
  }, 10);
  setTimeout(function () {

    var x = window.matchMedia("(max-width: 420px)")

    function mediaQuery(x) {
      if (x.matches) {

        $("#colInvnoReference").removeClass("col-auto");
        $("#colInvnoReference").addClass("col-12");

        $("#colTermsVia").removeClass("col-auto");
        $("#colTermsVia").addClass("col-12");

        $("#colStatusDepartment").removeClass("col-auto");
        $("#colStatusDepartment").addClass("col-12");

        $("#colBillingAddress").removeClass("col-auto");
        $("#colBillingAddress").addClass("col-12");

        $("#colOrderDue").removeClass("col-auto");
        $("#colOrderDue").addClass("col-12");

        $("#colSupplierName").removeClass("col-auto");
        $("#colSupplierName").addClass("col-12");

        $("#colSupplierEmail").removeClass("col-auto");
        $("#colSupplierEmail").addClass("col-12");

        $("#fieldwidth").removeClass("billaddressfield");
        $("#fieldwidth").addClass("billaddressfield2");

      }
    }
    mediaQuery(x)
    x.addListener(mediaQuery)
  }, 10);

  FxGlobalFunctions.handleChangedCurrency($('.transheader > .sltCurrency').val(), defaultCurrencyCode);

});

Template.new_salesorder_temp.onRendered(function () {
   let templateObject = Template.instance();
  
  // this.loadProducts = async (refresh = false) => {
  //   let data = await CachedHttp.get(erpObject.TProductVS1, async () => {
  //     return await productService.getNewProductListVS1();
  //   }, {
  //     forceOverride: refresh,
  //     validate: (cachedResponse) => {
  //       return true;
  //     }
  //   });
  //   data = data.response;
  //   let products = data.tproductvs1;
  //   await this.products.set(products);
  // }

  // this.addLine = () => {
  //   let saleOrder = this.saleOrder.get();
  //   let lines = saleOrder.fields.Lines || [];
  //   // This will ad an empty line
  //   lines.push({
  //     vId: Random.id(),
  //     type: "TSalesOrderLine",
  //     fields: {
  //     }
  //   });
  //   saleOrder.fields.Lines = lines;
  //   this.saleOrder.set(saleOrder);
  //   return lines;
  // }

  // this.removeLine = (id = 0) => {
  //   let saleOrder = this.saleOrder.get();
  //   let lines = saleOrder.fields.Lines || [];

  //   let lineToRemove = lines.find(l => l.fields.ID == id);

  //   lines = lines.filter(l => {
  //     if (l.vId != undefined) {
  //       // it is local virtual id
  //       return l.vId != id;
  //     } else if (l.fields.ID != undefined) {
  //       return l.fields.ID != id;
  //     }
  //   });

  //   saleOrder.fields.Lines = lines;

  //   this.saleOrder.set(saleOrder);

  //   return lines;
  // }
  // this.addProductToVid = async (vId, productId) => {
  //   let saleOrder = await this.saleOrder.get();
  //   let lines = saleOrder.fields.Lines;
  //   const findProductById = async (pId) => {
  //     let products = await this.products.get();
  //     products = products.map(p => p.fields);

  //     return products.find(p => p.ID == pId);
  //   }
  //   await GlobalFunctions.asyncForEach(lines, async (line, i) => {
  //     if (line.vId == vId) {
  //       lines[i].fields = await findProductById(productId);

  //     }
  //   })
  //   saleOrder.fields.Lines = lines;
  //   await this.saleOrder.set(saleOrder);
  // }
  // this.initPage = async (refresh = false) => {
  //   await this.loadProducts(refresh);
  // }

  

  

  templateObject.updateSOTemp = async function(objDetails) {
    return new Promise( (resolve, reject) => {
      let currentTemp = templateObject.temporaryfiles.get();
      let newTemp = [...currentTemp, objDetails];
      templateObject.temporaryfiles.set(newTemp);
       addVS1Data('TSalesOrderTemp', JSON.stringify({tsalesordertemp:newTemp})).then(function(){resolve()})
    })
  }
  // this.initPage();
})

Template.new_salesorder_temp.helpers({
  oneExAPIName: function () {
    let salesService = new SalesBoardService();
    return salesService.getOneSalesOrderdataEx;
  },

  service: () => {
    let salesService = new SalesBoardService();
    return salesService;
  },

  listapiservice: function () {
    return sideBarService
  },

  listapifunction: function () {
    return sideBarService.getAllTSalesOrderListData
  },

  saveapifunction: function () {
    return salesService.saveSalesOrderEx
  },

  setTransData: () => {
    let templateObject = Template.instance();
    return function (data) {
      let dataReturn = templateObject.setOneSalesordersData(data)
      return dataReturn;
    }
  },

  initialRecords: () => {
    let templateObject = Template.instance();
    return function (data) {
      let dataReturn = templateObject.initialRecords(data)
      return dataReturn
    }
  },

  headerfields: () => {
    return Template.instance().headerfields.get()
  },

  headerbuttons: () => {
    return Template.instance().headerbuttons.get()
  },

  footerFields: function () {
    return Template.instance().tranasctionfooterfields.get()
  },

  printOptions: () => {
    return Template.instance().printOptions.get()
  },

  printfields: ()=> {
    return Template.instance().printfields.get();
  },

  saveTransaction: function () {
    let templateObject = Template.instance();
    return function (data) {
      templateObject.saveSalesOrderData(data)
    }
  },

  updateTransactionTemp:  function() {
    let templateObject = Template.instance();
    return async function(data) {
      await templateObject.updateSOTemp(data)
    }
  },

  sendEmail:() => {
    let templateObject = Template.instance();
    return async function() {
      let dataReturn = await templateObject.sendEmail();
      return dataReturn;
    }
  },

  isCurrencyEnable: () => FxGlobalFunctions.isCurrencyEnabled(),
  getTemplateList: function () {
    return template_list;
  },

  getTemplateNumber: function () {
    let template_numbers = ["1", "2", "3"];
    return template_numbers;
  },

  isBatchSerialNoTracking: () => {
    return localStorage.getItem('CloudShowSerial') || false;
  },
  vs1companyBankName: () => {
    return localStorage.getItem('vs1companyBankName') || '';
  },
  bsbRegionName: () => {
    return bsbCodeName;
  },
  vs1companyBankAccountName: () => {
    return localStorage.getItem('vs1companyBankAccountName') || '';
  },
  vs1companyBankAccountNo: () => {
    return localStorage.getItem('vs1companyBankAccountNo') || '';
  },
  vs1companyBankBSB: () => {
    return localStorage.getItem('vs1companyBankBSB') || '';
  },
  vs1companyBankSwiftCode: () => {
    return localStorage.getItem('vs1companyBankSwiftCode') || '';
  },
  vs1companyBankRoutingNo: () => {
    return localStorage.getItem('vs1companyBankRoutingNo') || '';
  },


  custfield1: () => {
    return localStorage.getItem('custfield1salesorder') || 'Custom Field 1';
  },
  custfield2: () => {
    return localStorage.getItem('custfield2salesorder') || 'Custom Field 2';
  },
  custfield3: () => {
    return localStorage.getItem('custfield3salesorder') || 'Custom Field 3';
  },
  salesorderrecord: () => {
    return Template.instance().salesorderrecord.get();
  },
  deptrecords: () => {
    return Template.instance().deptrecords.get().sort(function (a, b) {
      if (a.department == 'NA') {
        return 1;
      } else if (b.department == 'NA') {
        return -1;
      }
      return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
    });
  },
  termrecords: () => {
    return Template.instance().termrecords.get().sort(function (a, b) {
      if (a.termsname == 'NA') {
        return 1;
      } else if (b.termsname == 'NA') {
        return -1;
      }
      return (a.termsname.toUpperCase() > b.termsname.toUpperCase()) ? 1 : -1;
    });
  },
  clientrecords: () => {
    return Template.instance().clientrecords.get().sort(function (a, b) {
      if (a.customername == 'NA') {
        return 1;
      } else if (b.customername == 'NA') {
        return -1;
      }
      return (a.customername.toUpperCase() > b.customername.toUpperCase()) ? 1 : -1;
    });
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem('mycloudLogonID'),
      PrefName: 'new_salesorder'
    });
  },
  salesCloudGridPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem('mycloudLogonID'),
      PrefName: 'tblSalesOrderLine'
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
    return Template.instance().statusrecords.get().sort(function (a, b) {
      if (a.orderstatus == 'NA') {
        return 1;
      } else if (b.orderstatus == 'NA') {
        return -1;
      }
      return (a.orderstatus.toUpperCase() > b.orderstatus.toUpperCase()) ? 1 : -1;
    });
  },
  record: () => {
    return Template.instance().record.get();
  },

  customerRecord: () => {
    return Template.instance().customerRecord.get();
  },

  companyaddress1: () => {
    return localStorage.getItem('vs1companyaddress1');
  },
  companyaddress2: () => {
    return localStorage.getItem('vs1companyaddress2');
  },
  city: () => {
    return localStorage.getItem('vs1companyCity');
  },
  state: () => {
    return localStorage.getItem('companyState');
  },
  poBox: () => {
    return localStorage.getItem('vs1companyPOBox');
  },
  companyphone: () => {
    let phone = "Phone: " + localStorage.getItem('vs1companyPhone');
    return phone;
  },
  companyabn: () => { //Update Company ABN
    let countryABNValue = localStorage.getItem("vs1companyABN");
    return countryABNValue;
  },
  companyReg: () => { //Add Company Reg
    let countryRegValue = '';
    if (LoggedCountry == "South Africa") {
      countryRegValue = "Reg No: " + localStorage.getItem('vs1companyReg');
    }

    return countryRegValue;
  },
  organizationname: () => {
    return localStorage.getItem('vs1companyName');
  },
  organizationurl: () => {
    return localStorage.getItem('vs1companyURL');
  },
  isMobileDevices: () => {
    var isMobile = false; //initiate as false
    // device detection
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
      isMobile = true;
    }

    return isMobile;
  },
  currentDate: () => {
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    return begunDate;
  },

  isForeignEnabled: () => {
    return Template.instance().isForeignEnabled.get();
  },
  getDefaultCurrency: () => {
    return defaultCurrencyCode;
  },
  convertToForeignAmount: (amount) => {
    return convertToForeignAmount(amount, $('#exchange_rate').val(), getCurrentCurrencySymbol());
  },

  displayFieldColspan: (displayfield) => {
    if (foreignCols.includes(displayfield.custfieldlabel)) {
      if (Template.instance().isForeignEnabled.get() == true) {
        return 2
      }
      return 1;
    }
    return 1;
  },

  subHeaderForeign: (displayfield) => {
    if (foreignCols.includes(displayfield.custfieldlabel)) {
      return true;
    }
    return false;
  },
  abletomakeworkorder: () => {
    return Template.instance().abletomakeworkorder.get()
  },

  saleOrder: () => {
    let _saleOrder = Template.instance().saleOrder.get();

    return _saleOrder.fields;
  },
  saleOrderLines: () => {
    let _saleOrder = Template.instance().saleOrder.get();

    return _saleOrder.fields.Lines;
  },

  
});

Template.new_salesorder_temp.events({

 
  
  
 
  // 'click .btnSaveSettings': function (event) {
  //   playSaveAudio();
  //   setTimeout(function () {
  //     $('#myModal4').modal('toggle');
  //   }, delayTimeAfterSound);
  // },
 
  // 'click .btnResetSettings': function (event) {
  //   var getcurrentCloudDetails = CloudUser.findOne({
  //     _id: localStorage.getItem('mycloudLogonID'),
  //     clouddatabaseID: localStorage.getItem('mycloudLogonDBID')
  //   });
  //   if (getcurrentCloudDetails) {
  //     if (getcurrentCloudDetails._id.length > 0) {
  //       var clientID = getcurrentCloudDetails._id;
  //       var checkPrefDetails = CloudPreference.findOne({
  //         userid: clientID,
  //         PrefName: 'new_salesorder'
  //       });
  //       if (checkPrefDetails) {
  //         CloudPreference.remove({
  //           _id: checkPrefDetails._id
  //         }, function (err, idTag) {
  //           if (err) {

  //           } else {
  //             Meteor._reload.reload();
  //           }
  //         });

  //       }
  //     }
  //   }
  // },
  
  
  
  'click .save-to-library': function (event, ui) {
    $('.confirm-delete-attachment').trigger('click');
  },
  
  'click .payNow': function () {
    let templateObject = Template.instance();
    let stripe_id = templateObject.accountID.get() || '';
    let stripe_fee_method = templateObject.stripe_fee_method.get();
    if (stripe_id != "") {
      var url = FlowRouter.current().path;
      let invoiceData = templateObject.salesorderrecord.get();
      var id_available = url.includes("?id=");
      if (id_available == true) {
        let lineItems = [];
        let total = $('#grandTotal').html() || 0;
        let tax = $('#subtotal_tax').html() || 0;
        let customer = $('#edtCustomerName').val();
        let name = $('#firstname').val();
        let surname = $('#lastname').val();
        $('#tblSalesOrderLine > tbody > tr').each(function () {
          var lineID = this.id;
          let tddescription = $('#' + lineID + " .lineProductDesc").text();
          let tdQty = $('#' + lineID + " .lineQty").val();
          let tdunitprice = $('#' + lineID + " .colUnitPriceExChange").val();

          const lineItemObj = {
            description: tddescription || '',
            quantity: tdQty || 0,
            unitPrice: tdunitprice.toLocaleString(undefined, {
              minimumFractionDigits: 2
            }) || 0
          }

          lineItems.push(lineItemObj);
        });
        var erpGet = erpDb();
        let company = localStorage.getItem('vs1companyName');
        let vs1User = localStorage.getItem('mySession');
        let customerEmail = $('#edtCustomerEmail').val();
        let currencyname = (CountryAbbr).toLowerCase();
        let stringQuery = "?";
        for (let l = 0; l < lineItems.length; l++) {
          stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
        }
        stringQuery = stringQuery + "tax=" + tax + "&total=" + total + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + invoiceData.id + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Sales Order&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&currency=" + currencyname;
        window.open(stripeGlobalURL + stringQuery, '_self');

      } else {
        let customername = $('#edtCustomerName');
        let name = $('#edtCustomerEmail').attr('customerfirstname');
        let surname = $('#edtCustomerEmail').attr('customerlastname');
        let salesService = new SalesBoardService();
        let termname = $('.transheader > #sltTerms_fromtransactionheader').val() || '';
        if (termname === '') {
          swal('Terms has not been selected!', '', 'warning');
          event.preventDefault();
          return false;
        }
        if (customername.val() === '') {
          swal('Customer has not been selected!', '', 'warning');
          e.preventDefault();
        } else {
          LoadingOverlay.show();
          var splashLineArray = new Array();
          var erpGet = erpDb();
          let lineItemsForm = [];
          let lineItemObjForm = {};
          var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
          var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

          let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
          let dueDate = duedateTime.getFullYear() + "-" + (duedateTime.getMonth() + 1) + "-" + duedateTime.getDate();
          $('#tblSalesOrderLine > tbody > tr').each(function () {
            var lineID = this.id;
            let tdproduct = $('#' + lineID + " .lineProductName").val();
            let tddescription = $('#' + lineID + " .lineProductDesc").text();
            let tdQty = $('#' + lineID + " .lineQty").val();
            let tdunitprice = $('#' + lineID + " .colUnitPriceExChange").val();
            let tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || loggedTaxCodeSalesInc;
            if (tdproduct != "") {
              lineItemObjForm = {
                type: "TSalesOrderLine",
                fields: {
                  ProductName: tdproduct || '',
                  ProductDescription: tddescription || '',
                  UOMQtySold: parseFloat(tdQty) || 0,
                  UOMQtyShipped: parseFloat(tdQty) || 0,
                  LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                  Headershipdate: saleDate,
                  LineTaxCode: tdtaxCode || '',
                  DiscountPercent: parseFloat($('#' + lineID + " .lineDiscount").text()) || 0
                }
              };
              lineItemsForm.push(lineItemObjForm);
              splashLineArray.push(lineItemObjForm);
            }
          });

          let getchkcustomField1 = true;
          let getchkcustomField2 = true;
          let getcustomField1 = $('.customField1Text').html();
          let getcustomField2 = $('.customField2Text').html();
          if ($('#formCheck-one').is(':checked')) {
            getchkcustomField1 = false;
          }
          if ($('#formCheck-two').is(':checked')) {
            getchkcustomField2 = false;
          }

          let customer = $('#edtCustomerName').val();
          let customerEmail = $('#edtCustomerEmail').val();
          let billingAddress = $('#txabillingAddress').val();


          let poNumber = $('#ponumber').val();
          let reference = $('#edtRef').val();

          let departement = $('#sltDept').val();
          let shippingAddress = $('#txaShipingInfo').val();
          let comments = $('#txaComment').val();
          let pickingInfrmation = $('#txapickmemo').val();
          let total = $('#totalBalanceDue').html() || 0;
          let tax = $('#subtotal_tax').html() || 0;
          let saleCustField1 = $('#edtSaleCustField1').val() || '';
          let saleCustField2 = $('#edtSaleCustField2').val() || '';
          let saleCustField3 = $('#edtSaleCustField3').val() || '';
          var url = FlowRouter.current().path;
          var getso_id = url.split('?id=');
          var currentSalesOrder = getso_id[getso_id.length - 1];
          let uploadedItems = templateObject.uploadedFiles.get();
          var currencyCode = $(".transheader > .sltCurrency").val() || CountryAbbr;
          let ForeignExchangeRate = $('#exchange_rate').val() || 0;
          let foreignCurrencyFields = {}
          if (FxGlobalFunctions.isCurrencyEnabled()) {
            foreignCurrencyFields = {
              ForeignExchangeCode: currencyCode,
              ForeignExchangeRate: parseFloat(ForeignExchangeRate),
            }
          }
          var objDetails = '';
          if (getso_id[1]) {
            currentSalesOrder = parseInt(currentSalesOrder);
            objDetails = {
              type: "TSalesOrderEx",
              fields: {
                ID: currentSalesOrder,
                CustomerName: customer,
                ...foreignCurrencyFields,
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
                SalesStatus: $('.transheader > #sltStatus_fromtransactionheader').val()
              }
            };
          } else {
            objDetails = {
              type: "TSalesOrderEx",
              fields: {
                CustomerName: customer,
                ...foreignCurrencyFields,
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
                SalesStatus: $('.transheader > #sltStatus_fromtransactionheader').val()
              }
            };
          }

          setTimeout(function () {
            let currentsotemp = templateObject.temporaryfiles.get();
            let newsotemp= [...currentsotemp, objDetails];
            templateObject.temporaryfiles.set(newsotemp);
            // salesService.saveSalesOrderEx(objDetails).then(function (data) {
              addVS1Data('TSalesOrderTemp', JSON.stringify({tsalesordertemp: newsotemp})).then(function(){
            
              let company = localStorage.getItem('vs1companyName');
              let vs1User = localStorage.getItem('mySession');
              var customerID = $('#edtCustomerEmail').attr('customerid');
              let currencyname = (CountryAbbr).toLowerCase();
              let stringQuery = "?";
              var customerID = $('#edtCustomerEmail').attr('customerid');
              for (let l = 0; l < lineItemsForm.length; l++) {
                stringQuery = stringQuery + "product" + l + "=" + lineItemsForm[l].fields.ProductName + "&price" + l + "=" + lineItemsForm[l].fields.LinePrice + "&qty" + l + "=" + lineItemsForm[l].fields.UOMQtySold + "&";
              }
              stringQuery = stringQuery + "tax=" + tax + "&total=" + total + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + objDetails.fields.ID + "&transid=" + stripe_id + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Sales Order&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + departement + "&currency=" + currencyname;
              // Send Email

              let url = stripeGlobalURL + stringQuery;
              $('#html-2-pdfwrapper').css('display', 'block');
              $('.pdfCustomerName').html($('#edtCustomerName').val());
              $('.pdfCustomerAddress').html($('#txabillingAddress').val().replace(/[\r\n]/g, "<br />"));

              let htmlmailBody = generateHtmlMailBody(objDetails.fields.ID || '',stringQuery);
              addAttachment("Sales Order", "Customer", objDetails.fields.ID || '', htmlmailBody, 'salesorderslist', 77,  'html-SalesOrder-pdfwrapper', stringQuery, false, 'blob')
              
              // End Send Email
              var getcurrentCloudDetails = CloudUser.findOne({
                _id: localStorage.getItem('mycloudLogonID'),
                clouddatabaseID: localStorage.getItem('mycloudLogonDBID')
              });
              if (getcurrentCloudDetails) {
                if (getcurrentCloudDetails._id.length > 0) {
                  var clientID = getcurrentCloudDetails._id;
                  var clientUsername = getcurrentCloudDetails.cloudUsername;
                  var clientEmail = getcurrentCloudDetails.cloudEmail;
                  var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: 'new_salesorder'
                  });
                  if (checkPrefDetails) {
                    CloudPreference.update({
                      _id: checkPrefDetails._id
                    }, {
                      $set: {
                        username: clientUsername,
                        useremail: clientEmail,
                        PrefGroup: 'salesform',
                        PrefName: 'new_salesorder',
                        published: true,
                        customFields: [{
                          index: '1',
                          label: getcustomField1,
                          hidden: getchkcustomField1
                        }, {
                          index: '2',
                          label: getcustomField2,
                          hidden: getchkcustomField2
                        }],
                        updatedAt: new Date()
                      }
                    }, function (err, idTag) {
                      if (err) {
                        if (FlowRouter.current().queryParams.trans) {
                          FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                        } else {
                          FlowRouter.go('/salesorderslist?success=true');
                        };
                      } else {
                        if (FlowRouter.current().queryParams.trans) {
                          FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                        } else {
                          FlowRouter.go('/salesorderslist?success=true');
                        };
                      }
                    });
                  } else {
                    CloudPreference.insert({
                      userid: clientID,
                      username: clientUsername,
                      useremail: clientEmail,
                      PrefGroup: 'salesform',
                      PrefName: 'new_salesorder',
                      published: true,
                      customFields: [{
                        index: '1',
                        label: getcustomField1,
                        hidden: getchkcustomField1
                      }, {
                        index: '2',
                        label: getcustomField2,
                        hidden: getchkcustomField2
                      }],
                      createdAt: new Date()
                    }, function (err, idTag) {
                      if (err) {
                        if (FlowRouter.current().queryParams.trans) {
                          FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                        } else {
                          FlowRouter.go('/salesorderslist?success=true');
                        };
                      } else {
                        if (FlowRouter.current().queryParams.trans) {
                          FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                        } else {
                          FlowRouter.go('/salesorderslist?success=true');
                        };
                      }
                    });
                  }
                }
              }
            }).catch(function (err) {
              swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
              }).then((result) => {
                if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
              });
              LoadingOverlay.hide();
            });
          }, 500);
        }

      }
    } else {
      swal({
        title: 'WARNING',
        text: "Don't have a Stripe account yet, Please click Ok to set up Stripe.",
        type: 'warning',
        showCancelButton: false,
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.value) {
          window.open('paymentmethodSettings', '_self');
        }
      });
    }
  },
  'click #btnPayment': function () {
    let templateObject = Template.instance();
    let customername = $('#edtCustomerName');
    let salesService = new SalesBoardService();
    let termname = $('.transheader > #sltTerms_fromtransactionheader').val() || '';
    if (termname === '') {
      swal('Terms has not been selected!', '', 'warning');
      event.preventDefault();
      return false;
    }
    if (customername.val() === '') {
      swal('Customer has not been selected!', '', 'warning');
      e.preventDefault();
    } else {
      LoadingOverlay.show();
      var splashLineArray = new Array();
      let lineItemsForm = [];
      let lineItemObjForm = {};
      var saledateTime = new Date($("#dtSODate").datepicker("getDate"));

      let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
      $('#tblSalesOrderLine > tbody > tr').each(function () {
        var lineID = this.id;
        let tdproduct = $('#' + lineID + " .lineProductName").val();
        let tddescription = $('#' + lineID + " .lineProductDesc").text();
        let tdQty = $('#' + lineID + " .lineQty").val();
        let tdunitprice = $('#' + lineID + " .colUnitPriceExChange").val();
        let tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || loggedTaxCodeSalesInc;
        if (tdproduct != "") {
          lineItemObjForm = {
            type: "TSalesOrderLine",
            fields: {
              ProductName: tdproduct || '',
              ProductDescription: tddescription || '',
              UOMQtySold: parseFloat(tdQty) || 0,
              UOMQtyShipped: parseFloat(tdQty) || 0,
              LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
              Headershipdate: saleDate,
              LineTaxCode: tdtaxCode || '',
              DiscountPercent: parseFloat($('#' + lineID + " .lineDiscount").text()) || 0
            }
          };
          lineItemsForm.push(lineItemObjForm);
          splashLineArray.push(lineItemObjForm);
        }
      });
      let getchkcustomField1 = true;
      let getchkcustomField2 = true;
      let getcustomField1 = $('.customField1Text').html();
      let getcustomField2 = $('.customField2Text').html();
      if ($('#formCheck-one').is(':checked')) {
        getchkcustomField1 = false;
      }
      if ($('#formCheck-two').is(':checked')) {
        getchkcustomField2 = false;
      }

      let customer = $('#edtCustomerName').val();
      let billingAddress = $('#txabillingAddress').val();

      let poNumber = $('#ponumber').val();
      let reference = $('#edtRef').val();

      let departement = $('#sltDept').val();
      let shippingAddress = $('#txaShipingInfo').val();
      let comments = $('#txaComment').val();
      let pickingInfrmation = $('#txapickmemo').val();

      let saleCustField1 = $('#edtSaleCustField1').val() || '';
      let saleCustField2 = $('#edtSaleCustField2').val() || '';
      let saleCustField3 = $('#edtSaleCustField3').val() || '';
      var url = FlowRouter.current().path;
      var getso_id = url.split('?id=');
      var currentSalesOrder = getso_id[getso_id.length - 1];
      let uploadedItems = templateObject.uploadedFiles.get();
      var currencyCode = $(".transheader > .sltCurrency").val() || CountryAbbr;
      let ForeignExchangeRate = $('#exchange_rate').val() || 0;
      let foreignCurrencyFields = {}
      if (FxGlobalFunctions.isCurrencyEnabled()) {
        foreignCurrencyFields = {
          ForeignExchangeCode: currencyCode,
          ForeignExchangeRate: parseFloat(ForeignExchangeRate),
        }
      }
      var objDetails = '';
      if (getso_id[1]) {
        currentSalesOrder = parseInt(currentSalesOrder);
        objDetails = {
          type: "TSalesOrderEx",
          fields: {
            ID: currentSalesOrder,
            CustomerName: customer,
            ...foreignCurrencyFields,
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
            SalesStatus: $('.transheader > #sltStatus_fromtransactionheader').val()
          }
        };
      } else {
        objDetails = {
          type: "TSalesOrderEx",
          fields: {
            CustomerName: customer,
            ...foreignCurrencyFields,
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
            SalesStatus: $('.transheader > #sltStatus_fromtransactionheader').val()
          }
        };
      }
      let currentsotemp = templateObject.temporaryfiles.get();
      let newsotemp= [...currentsotemp, objDetails];
      templateObject.temporaryfiles.set(newsotemp);
      // salesService.saveSalesOrderEx(objDetails).then(function (data) {
        addVS1Data('TSalesOrderTemp', JSON.stringify({tsalesordertemp: newsotemp})).then(function(){
        let linesave = objDetails.fields.ID;

        var getcurrentCloudDetails = CloudUser.findOne({
          _id: localStorage.getItem('mycloudLogonID'),
          clouddatabaseID: localStorage.getItem('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
          if (getcurrentCloudDetails._id.length > 0) {
            var clientID = getcurrentCloudDetails._id;
            var clientUsername = getcurrentCloudDetails.cloudUsername;
            var clientEmail = getcurrentCloudDetails.cloudEmail;
            var checkPrefDetails = CloudPreference.findOne({
              userid: clientID,
              PrefName: 'new_salesorder'
            });
            if (checkPrefDetails) {
              CloudPreference.update({
                _id: checkPrefDetails._id
              }, {
                $set: {
                  username: clientUsername,
                  useremail: clientEmail,
                  PrefGroup: 'salesform',
                  PrefName: 'new_salesorder',
                  published: true,
                  customFields: [{
                    index: '1',
                    label: getcustomField1,
                    hidden: getchkcustomField1
                  }, {
                    index: '2',
                    label: getcustomField2,
                    hidden: getchkcustomField2
                  }],
                  updatedAt: new Date()
                }
              }, function (err, idTag) {
                if (err) {
                  window.open('/paymentcard?soid=' + linesave, '_self');
                } else {
                  window.open('/paymentcard?soid=' + linesave, '_self');

                }
              });
            } else {
              CloudPreference.insert({
                userid: clientID,
                username: clientUsername,
                useremail: clientEmail,
                PrefGroup: 'salesform',
                PrefName: 'new_salesorder',
                published: true,
                customFields: [{
                  index: '1',
                  label: getcustomField1,
                  hidden: getchkcustomField1
                }, {
                  index: '2',
                  label: getcustomField2,
                  hidden: getchkcustomField2
                }],
                createdAt: new Date()
              }, function (err, idTag) {
                if (err) {
                  window.open('/paymentcard?soid=' + linesave, '_self');
                } else {
                  window.open('/paymentcard?soid=' + linesave, '_self');
                }
              });
            }
          }
        }
      }).catch(function (err) {
        swal({
          title: 'Oooops...',
          text: err,
          type: 'error',
          showCancelButton: false,
          confirmButtonText: 'Try Again'
        }).then((result) => {
          if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } }
        });
        LoadingOverlay.hide();
      });
    }

  },
  'click .btnBack': function (event) {
    playCancelAudio();
    event.preventDefault();
    setTimeout(function () {
      if (FlowRouter.current().queryParams.trans) {
        FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
      } else {
        history.back(1);
      };
    }, delayTimeAfterSound);
  },
  'click #btnCopyInvoice': async function () {
    playCopyAudio();
    let salesService = new SalesBoardService();
    let i = 0;
    setTimeout(async function () {
      $("#basedOnFrequency").prop('checked', true);
      $("#formCheck-monday").prop('checked', true);
      $('#edtFrequencyDetail').css('display', 'flex');
      $(".ofMonthList input[type=checkbox]").each(function () {
        $(this).prop('checked', false);
      });
      // $(".selectDays input[type=checkbox]").each(function () {
      //   $(this).prop('checked', false);
      // });
      var url = FlowRouter.current().path;
      var getso_id = url.split("?id=");
      var currentInvoice = getso_id[getso_id.length - 1];
      if (getso_id[1]) {
        currentInvoice = parseInt(currentInvoice);
        var soData = await salesService.getOneSalesOrderdataEx(currentInvoice);
        var frequencyVal = soData.fields.SaleCustField8;
        var startDate = soData.fields.SaleCustField9;
        var finishDate = soData.fields.SaleCustField10;
        var subStartDate = startDate.substring(0, 10);
        var subFinishDate = finishDate.substring(0, 10);
        var convertedStartDate = subStartDate ? subStartDate.split('-')[2] + '/' + subStartDate.split('-')[1] + '/' + subStartDate.split('-')[0] : '';
        var convertedFinishDate = subFinishDate ? subFinishDate.split('-')[2] + '/' + subFinishDate.split('-')[1] + '/' + subFinishDate.split('-')[0] : '';
        var arrFrequencyVal = frequencyVal.split("@");
        var radioFrequency = arrFrequencyVal[0];
        $("#" + radioFrequency).prop('checked', true);
        if (radioFrequency == "frequencyMonthly") {
          document.getElementById("monthlySettings").style.display = "block";
          document.getElementById("weeklySettings").style.display = "none";
          document.getElementById("dailySettings").style.display = "none";
          document.getElementById("oneTimeOnlySettings").style.display = "none";
          var monthDate = arrFrequencyVal[1];
          $("#sltDay").val('day' + monthDate);
          var arrOfMonths = [];
          if (ofMonths != "" && ofMonths != undefined && ofMonths != null)
            arrOfMonths = ofMonths.split(",");
          var arrOfMonths = ofMonths.split(",");
          for (i = 0; i < arrOfMonths.length; i++) {
            $("#formCheck-" + arrOfMonths[i]).prop('checked', true);
          }
          $('#edtMonthlyStartDate').val(convertedStartDate);
          $('#edtMonthlyFinishDate').val(convertedFinishDate);
        } else if (radioFrequency == "frequencyWeekly") {
          document.getElementById("weeklySettings").style.display = "block";
          document.getElementById("monthlySettings").style.display = "none";
          document.getElementById("dailySettings").style.display = "none";
          document.getElementById("oneTimeOnlySettings").style.display = "none";
          var everyWeeks = arrFrequencyVal[1];
          $("#weeklyEveryXWeeks").val(everyWeeks);
          var selectDays = arrFrequencyVal[2];
          var arrSelectDays = selectDays.split(",");
          for (i = 0; i < arrSelectDays.length; i++) {
            if (parseInt(arrSelectDays[i]) == 0)
              $("#formCheck-sunday").prop('checked', false);
            if (parseInt(arrSelectDays[i]) == 1)
              $("#formCheck-monday").prop('checked', true);
            if (parseInt(arrSelectDays[i]) == 2)
              $("#formCheck-tuesday").prop('checked', true);
            if (parseInt(arrSelectDays[i]) == 3)
              $("#formCheck-wednesday").prop('checked', false);
            if (parseInt(arrSelectDays[i]) == 4)
              $("#formCheck-thursday").prop('checked', true);
            if (parseInt(arrSelectDays[i]) == 5)
              $("#formCheck-friday").prop('checked', true);
            if (parseInt(arrSelectDays[i]) == 6)
              $("#formCheck-saturday").prop('checked', true);
          }
          $('#edtWeeklyStartDate').val(convertedStartDate);
          $('#edtWeeklyFinishDate').val(convertedFinishDate);
        } else if (radioFrequency == "frequencyDaily") {
          document.getElementById("dailySettings").style.display = "block";
          document.getElementById("monthlySettings").style.display = "none";
          document.getElementById("weeklySettings").style.display = "none";
          document.getElementById("oneTimeOnlySettings").style.display = "none";
          var dailyRadioOption = arrFrequencyVal[1];
          $("#" + dailyRadioOption).prop('checked', true);
          var everyDays = arrFrequencyVal[2];
          $("#dailyEveryXDays").val(everyDays);
          $('#edtDailyStartDate').val(convertedStartDate);
          $('#edtDailyFinishDate').val(convertedFinishDate);
        } else if (radioFrequency == "frequencyOnetimeonly") {
          document.getElementById("oneTimeOnlySettings").style.display = "block";
          document.getElementById("monthlySettings").style.display = "none";
          document.getElementById("weeklySettings").style.display = "none";
          document.getElementById("dailySettings").style.display = "none";
          $('#edtOneTimeOnlyDate').val(convertedStartDate);
          $('#edtOneTimeOnlyTimeError').css('display', 'none');
          $('#edtOneTimeOnlyDateError').css('display', 'none');
        }
      }
      $("#copyFrequencyModal").modal("toggle");
    }, delayTimeAfterSound);
  },
 
  'click .chkEmailCopy': function (event) {
    $('#edtCustomerEmail').val($('#edtCustomerEmail').val().replace(/\s/g, ''));
    if ($(event.target).is(':checked')) {
      let checkEmailData = $('#edtCustomerEmail').val();
      if (checkEmailData.replace(/\s/g, '') === '') {
        swal('Customer Email cannot be blank!', '', 'warning');
        event.preventDefault();
      } else {
        function isEmailValid(mailTo) {
          return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(mailTo);
        };
        if (!isEmailValid(checkEmailData)) {
          swal('The email field must be a valid email address !', '', 'warning');
          event.preventDefault();
          return false;
        }
      }
    }
  },
  "focusout .lineQty": function (event) {
    // $(".fullScreenSpin").css("display", "inline-block");
    var target = event.target;
    let selectedunit = $(target).closest("tr").find(".lineQty").val();
    localStorage.setItem("productItem", selectedunit);
    let selectedProductName = $(target).closest("tr").find(".lineProductName").val();
    localStorage.setItem("selectedProductName", selectedProductName);

    let productService = new ProductService();
    const templateObject = Template.instance();
    let existProduct = false;
    if (parseInt($(target).val()) > 0) {
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
                if (selectedLot != undefined && selectedLot != "") {
                  shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                }
                else {
                  shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                }
                setTimeout(function () {
                  var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                  $("#availableLotNumberModal").attr("data-row", row + 1);
                  $("#availableLotNumberModal").modal("show");
                }, 200);
              } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                if (selectedSN != undefined && selectedSN != "") {
                  shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                }
                else {
                  shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                }
                setTimeout(function () {
                  var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                  $("#availableSerialNumberModal").attr("data-row", row + 1);
                  $('#availableSerialNumberModal').modal('show');
                  if (data.tproductvs1[0].CUSTFLD13 == 'true') {
                    $("#availableSerialNumberModal .btnSNCreate").show();
                  }
                  else {
                    $("#availableSerialNumberModal .btnSNCreate").hide();
                  }
                }, 200);
              }
            });
          }
          else {
            let data = JSON.parse(dataObject[0].data);
            let existProductInfo = false;
            for (let i = 0; i < data.tproductqtylist.length; i++) {
              if (data.tproductqtylist[i].ProductName == selectedProductName) {
                existProductInfo = true;
                if (data.tproductqtylist[i].batch == false && data.tproductqtylist[i].SNTracking == false) {
                  return false;
                } else if (data.tproductqtylist[i].batch == true && data.tproductqtylist[i].SNTracking == false) {
                  let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                  if (selectedLot != undefined && selectedLot != "") {
                    shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                  }
                  else {
                    shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                  }
                  setTimeout(function () {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $("#availableLotNumberModal").attr("data-row", row + 1);
                    $("#availableLotNumberModal").modal("show");
                  }, 200);
                } else if (data.tproductqtylist[i].batch == false && data.tproductqtylist[i].SNTracking == true) {
                  let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                  if (selectedSN != undefined && selectedSN != "") {
                    shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                  }
                  else {
                    shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                  }
                  setTimeout(function () {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $("#availableSerialNumberModal").attr("data-row", row + 1);
                    $('#availableSerialNumberModal').modal('show');
                    if (data.tproductqtylist[i].CUSTFLD13 == 'true') {
                      $("#availableSerialNumberModal .btnSNCreate").show();
                    }
                    else {
                      $("#availableSerialNumberModal .btnSNCreate").hide();
                    }
                  }, 200);
                }
              }
            }

            if (!existProductInfo) {
              productService.getProductStatus(selectedProductName).then(async function (data) {
                if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
                  return false;
                } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                  let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                  if (selectedLot != undefined && selectedLot != "") {
                    shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                  }
                  else {
                    shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                  }
                  setTimeout(function () {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $("#availableLotNumberModal").attr("data-row", row + 1);
                    $("#availableLotNumberModal").modal("show");
                  }, 200);
                } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                  let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                  if (selectedSN != undefined && selectedSN != "") {
                    shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                  }
                  else {
                    shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                  }
                  setTimeout(function () {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $("#availableSerialNumberModal").attr("data-row", row + 1);
                    $('#availableSerialNumberModal').modal('show');
                    if (data.tproductvs1[0].CUSTFLD13 == 'true') {
                      $("#availableSerialNumberModal .btnSNCreate").show();
                    }
                    else {
                      $("#availableSerialNumberModal .btnSNCreate").hide();
                    }
                  }, 200);
                }
              });
            }
          }
        }).catch(function (err) {
          productService.getProductStatus(selectedProductName).then(async function (data) {
            if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == false) {
              return false;
            } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
              let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
              if (selectedLot != undefined && selectedLot != "") {
                shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
              }
              else {
                shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
              }
              setTimeout(function () {
                var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                $("#availableLotNumberModal").attr("data-row", row + 1);
                $("#availableLotNumberModal").modal("show");
              }, 200);
            } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
              let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
              if (selectedSN != undefined && selectedSN != "") {
                shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
              }
              else {
                shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
              }
              setTimeout(function () {
                var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                $("#availableSerialNumberModal").attr("data-row", row + 1);
                $('#availableSerialNumberModal').modal('show');
                if (data.tproductvs1[0].CUSTFLD13 == 'true') {
                  $("#availableSerialNumberModal .btnSNCreate").show();
                }
                else {
                  $("#availableSerialNumberModal .btnSNCreate").hide();
                }
              }, 200);
            }
          });
        });
      }
    }
  },
  'click .btnSnLotmodal': function (event) {
    // LoadingOverlay.show();
    const target = event.target;
    let selectedProductName = $(target).closest('tr').find('.lineProductName').val();
    let selectedunit = $(target).closest('tr').find('.lineQty').val();
    localStorage.setItem('productItem', selectedunit);
    let productService = new ProductService();

    const templateObject = Template.instance();
    if (parseInt(selectedunit) > 0) {
      if (selectedProductName == "") {
        swal("You have to select Product.", "", "info");
        event.preventDefault();
        return false;
      } else {
        $(".fullScreenSpin").css("display", "inline-block");
        getVS1Data("TProductQtyList").then(function (dataObject) {
          if (dataObject.length == 0) {
            productService.getProductStatus(selectedProductName).then(async function (data) {
              $(".fullScreenSpin").css("display", "none");
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
                    $('#trackSN').on('click', function () {
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
                    $('#trackLN').on('click', function () {
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
                    $('#trackCancel').on('click', function () {
                      swal.close();
                    });
                  }
                });
              } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                if (selectedLot != undefined && selectedLot != "") {
                  shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                }
                else {
                  shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                }
                setTimeout(function () {
                  var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                  $("#availableLotNumberModal").attr("data-row", row + 1);
                  $("#availableLotNumberModal").modal("show");
                }, 200);
              } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                if (selectedSN != undefined && selectedSN != "") {
                  shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                }
                else {
                  shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                }
                setTimeout(function () {
                  var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                  $("#availableSerialNumberModal").attr("data-row", row + 1);
                  $('#availableSerialNumberModal').modal('show');
                  if (data.tproductvs1[0].CUSTFLD13 == 'true') {
                    $("#availableSerialNumberModal .btnSNCreate").show();
                  }
                  else {
                    $("#availableSerialNumberModal .btnSNCreate").hide();
                  }
                }, 200);
              }
            });
          }
          else {
            let data = JSON.parse(dataObject[0].data);
            let existProductInfo = false;
            for (let i = 0; i < data.tproductqtylist.length; i++) {
              if (data.tproductqtylist[i].ProductName == selectedProductName) {
                $(".fullScreenSpin").css("display", "none");
                existProductInfo = true;
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
                      $('#trackSN').on('click', function () {
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
                      $('#trackLN').on('click', function () {
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
                      $('#trackCancel').on('click', function () {
                        swal.close();
                      });
                    }
                  });
                } else if (data.tproductqtylist[i].batch == true && data.tproductqtylist[i].SNTracking == false) {
                  let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                  if (selectedLot != undefined && selectedLot != "") {
                    shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                  }
                  else {
                    shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                  }
                  setTimeout(function () {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $("#availableLotNumberModal").attr("data-row", row + 1);
                    $("#availableLotNumberModal").modal("show");
                  }, 200);
                } else if (data.tproductqtylist[i].batch == false && data.tproductqtylist[i].SNTracking == true) {
                  let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                  if (selectedSN != undefined && selectedSN != "") {
                    shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                  }
                  else {
                    shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                  }
                  setTimeout(function () {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $("#availableSerialNumberModal").attr("data-row", row + 1);
                    $('#availableSerialNumberModal').modal('show');
                    if (data.tproductqtylist[i].CUSTFLD13 == 'true') {
                      $("#availableSerialNumberModal .btnSNCreate").show();
                    }
                    else {
                      $("#availableSerialNumberModal .btnSNCreate").hide();
                    }
                  }, 200);
                }
              }
            }
            if (!existProductInfo) {
              productService.getProductStatus(selectedProductName).then(async function (data) {
                $(".fullScreenSpin").css("display", "none");
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
                      $('#trackSN').on('click', function () {
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
                      $('#trackLN').on('click', function () {
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
                      $('#trackCancel').on('click', function () {
                        swal.close();
                      });
                    }
                  });
                } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
                  let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
                  if (selectedLot != undefined && selectedLot != "") {
                    shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
                  }
                  else {
                    shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
                  }
                  setTimeout(function () {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $("#availableLotNumberModal").attr("data-row", row + 1);
                    $("#availableLotNumberModal").modal("show");
                  }, 200);
                } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                  let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
                  if (selectedSN != undefined && selectedSN != "") {
                    shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                  }
                  else {
                    shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                  }
                  setTimeout(function () {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $("#availableSerialNumberModal").attr("data-row", row + 1);
                    $('#availableSerialNumberModal').modal('show');
                    if (data.tproductvs1[0].CUSTFLD13 == 'true') {
                      $("#availableSerialNumberModal .btnSNCreate").show();
                    }
                    else {
                      $("#availableSerialNumberModal .btnSNCreate").hide();
                    }
                  }, 200);
                }
              });
            }
          }
        }).catch(function (err) {
          productService.getProductStatus(selectedProductName).then(async function (data) {
            $(".fullScreenSpin").css("display", "none");
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
                  $('#trackSN').on('click', function () {
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
                  $('#trackLN').on('click', function () {
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
                  $('#trackCancel').on('click', function () {
                    swal.close();
                  });
                }
              });
            } else if (data.tproductvs1[0].Batch == true && data.tproductvs1[0].SNTracking == false) {
              let selectedLot = $(target).closest("tr").find(".colSerialNo").attr('data-lotnumbers');
              if (selectedLot != undefined && selectedLot != "") {
                shareFunctionByName.initTable(selectedLot, "tblAvailableLotCheckbox");
              }
              else {
                shareFunctionByName.initTable("empty", "tblAvailableLotCheckbox");
              }
              setTimeout(function () {
                var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                $("#availableLotNumberModal").attr("data-row", row + 1);
                $("#availableLotNumberModal").modal("show");
              }, 200);
            } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
              let selectedSN = $(target).closest("tr").find(".colSerialNo").attr('data-serialnumbers');
              if (selectedSN != undefined && selectedSN != "") {
                shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
              }
              else {
                shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
              }
              setTimeout(function () {
                var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                $("#availableSerialNumberModal").attr("data-row", row + 1);
                $('#availableSerialNumberModal').modal('show');
                if (data.tproductvs1[0].CUSTFLD13 == 'true') {
                  $("#availableSerialNumberModal .btnSNCreate").show();
                }
                else {
                  $("#availableSerialNumberModal .btnSNCreate").hide();
                }
              }, 200);
            }
          });
        });
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

  'click #btnMakeWorkOrder': async function (event) {
    let templateObject = Template.instance();
    let productService = new ProductService();
    async function getAllWorkorder() {
      return new Promise((resolve, reject) => {
        getVS1Data('TVS1Workorder').then(function (dataObject) {
          if (dataObject.length == 0) {
            resolve([])
          } else {
            let data = JSON.parse(dataObject[0].data);
            resolve(data.tvs1workorder)
          }
        })
      })
    }
    let workorderList = await getAllWorkorder();

    // //await function to get all work order list data
    // let temp = localStorage.getItem('TWorkorders');
    // workorderList = temp?JSON.parse(temp): [];


    //end get work order list data

    if (!FlowRouter.current().queryParams.id) {
      swal({
        title: 'Oooops...',
        text: "This sales order has not been saved yet, will save it first and then try again",
        type: 'error',
        showCancelButton: false,
        confirmButtonText: 'Ok'
      }).then((result) => {
        if (result.value) { $('.btnSave').trigger('click') }
        else if (result.dismiss === 'cancel') {
          return;
        }
      });
    } else {
      let salesOrderRecord = templateObject.salesorderrecord.get();
      let lines = templateObject.salesorderrecord.get().LineItems;
      let lineTable = $('#tblSalesOrderLine');
      let orderlines = $(lineTable).find('tbody tr')
      let changeAble = true
      if (lines.length != orderlines.length) {
        changeAble = false
        swal({
          title: 'Oooops...',
          text: "Changes for lines has not been saved yet, will save it first and then try again",
          type: 'error',
          showCancelButton: true,
          confirmButtonText: 'Ok'
        }).then((result) => {
          if (result.value) { $('.btnSave').trigger('click'); return }
          else if (result.dismiss === 'cancel') {
            return
          }
        });
      } else {
        let lineProducts = [];
        for (let k = 0; k < lines.length; k++) {
          lineProducts.push(lines[k].item)
        }
        // let retValue = true;
        for (let j = 0; j < orderlines.length; j++) {
          if (lineProducts.indexOf($(orderlines[j]).find('.lineProductName').val()) == -1) {
            changeAble = false
            swal({
              title: 'Oooops...',
              text: "Changes for lines has not been saved yet, will save it first and then try again",
              type: 'error',
              showCancelButton: true,
              confirmButtonText: 'Ok'
            }).then((result) => {
              if (result.value) { $('.btnSave').trigger('click') }
              else if (result.dismiss === 'cancel') {
                return
              }
            });
          }
        }
      }
      if (changeAble == true) {
        async function getBOMProducts() {
          return new Promise(async (resolve, reject) => {
            getVS1Data('TProcTree').then(function (dataObject) {
              if (dataObject.length == 0) {
                productService.getAllBOMProducts(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TProcTree', JSON.parse(data)).then(function () {
                    resolve(data.tproctree)
                  })
                })
              } else {
                let data = JSON.parse(dataObject[0].data);
                resolve(data.tproctree)
              }
            }).catch(function (e) {
              productService.getAllBOMProducts(initialBaseDataLoad, 0).then(function (data) {
                addVS1Data('TProcTree', JSON.parse(data)).then(function () {
                  resolve(data.tproctree)
                })
              })
            })
          })
        }
        let bomProducts = await getBOMProducts();
        let isAvailable = true;
        if (lines.length == 0) {
          isAvailable = false
        } else {
          for (let i = 0; i < lines.length; i++) {
            let isBOMProduct = false;
            let isExisting = false;
            let index = bomProducts.findIndex(product => {
              return product.Caption == lines[i].item
            })
            if (index > -1) {
              isBOMProduct = true;
            } else {
              await productService.getOneBOMProductByName(lines[i].item).then(function (data) {
                if (data.tproctree.length > 0) {
                  isBOMProduct = true;
                }
              })
            }

            if (isBOMProduct == true) {
              //check if the workorder is already exists
              workorderList.map(order => {
                if (order.fields.SaleID == salesOrderRecord.id && order.fields.ProductName == lines[i].item) {
                  isExisting = true
                  isAvailable = false;
                }
              })

              if (isExisting == false) {
                FlowRouter.go('/workordercard?salesorderid=' + FlowRouter.current().queryParams.id + '&lineId=' + i);
                return;
              }
            }

          }
        }

        if (isAvailable == false) {
          swal('No available data to make work order!', '', 'warning');
        }
      }

    }
  },


  // add to custom field
  "click #edtSaleCustField1": function (e) {
    $("#clickedControl").val("one");
  },

  // add to custom field
  "click #edtSaleCustField2": function (e) {
    $("#clickedControl").val("two");
  },

  // add to custom field
  "click #edtSaleCustField3": function (e) {
    $("#clickedControl").val("three");
  },
  // 'change .transheader > .sltCurrency': (e, ui) => {
  //   if ($(".transheader > .sltCurrency").val() && $(".sltCurrency").val() != defaultCurrencyCode) {
  //     $(".foreign-currency-js").css("display", "block");
  //     ui.isForeignEnabled.set(true);
  //     FxGlobalFunctions.toggleVisbilityOfValuesToConvert(true);

  //   } else {
  //     $(".foreign-currency-js").css("display", "none");
  //     ui.isForeignEnabled.set(false);
  //     FxGlobalFunctions.toggleVisbilityOfValuesToConvert(false);

  //   }
  // },

  // 'change .exchange-rate-js, change #tblSalesOrderLine tbody input': (e, ui) => {
  //   FxGlobalFunctions.convertToForeignEveryFieldsInTableId("#tblSalesOrderLine");
  // },
});

Template.registerHelper('equals', function (a, b) {
  return a === b;
});
