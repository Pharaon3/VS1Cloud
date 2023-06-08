import { SalesBoardService } from '../js/sales-service';
import { PurchaseBoardService } from '../js/purchase-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { DashBoardService } from "../Dashboard/dashboard-service";
import { UtilityService } from "../utility-service";
import { ProductService } from "../product/product-service";
import { AccountService } from "../accounts/account-service";
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import { Random } from 'meteor/random';
import { jsPDF } from 'jspdf';
import 'jQuery.print/jQuery.print.js';
import { autoTable } from 'jspdf-autotable';
import 'jquery-editable-select';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import { ContactService } from "../contacts/contact-service";
import { TaxRateService } from "../settings/settings-service";
import LoadingOverlay from '../LoadingOverlay';
import { saveCurrencyHistory } from '../packages/currency/CurrencyWidget';
import { getCurrentCurrencySymbol } from '../popUps/currnecypopup';
import { convertToForeignAmount } from '../payments/paymentcard/supplierPaymentcard';
import FxGlobalFunctions from '../packages/currency/FxGlobalFunctions';

import { Template } from 'meteor/templating';
import '../bills/frmbill_card_temp.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

var template_list = [
    "Bills",
];
var noHasTotals = ["Customer Payment", "Customer Statement", "Supplier Payment", "Statement", "Delivery Docket", "Journal Entry", "Deposit"];

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let purchaseService = new PurchaseBoardService();
let clientsService = new PurchaseBoardService();
let productsService = new PurchaseBoardService();
const contactService = new ContactService();

var times = 0;
let purchaseDefaultTerms = "";

let defaultCurrencyCode = CountryAbbr;

function generateHtmlMailBody(ID, stringQuery) {
    let erpInvoiceId = ID;
    let mailFromName = localStorage.getItem('vs1companyName');
    let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
    let customerEmailName = $('#edtSupplierName').val();
    let grandtotal = $('#grandTotal').html();
    let amountDueEmail = $('#totalBalanceDue').html();
    let emailDueDate = $("#dtDueDate").val();
    let html = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
        '    <tr>' +
        '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
        '        <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
        '        </td>' +
        '    </tr>' +
        '    <tr>' +
        '        <td style="padding: 40px 30px 40px 30px;">' +
        '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
        '                <tr>' +
        '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
        '                        Hello there <span>' + customerEmailName + '</span>,' +
        '                    </td>' +
        '                </tr>' +
        '                <tr>' +
        '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
        '                        Please find bill <span>' + erpInvoiceId + '</span> attached below.' +
        '                    </td>' +
        '                </tr>' +
        '                <tr>' +
        '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
        '                        The amount outstanding of <span>' + amountDueEmail + '</span> is due on <span>' + emailDueDate + '</span>' +
        '                    </td>' +
        '                </tr>' +
        '                <tr>' +
        '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
        '                        Kind regards,' +
        '                        <br>' +
        '                        ' + mailFromName + '' +
        '                    </td>' +
        '                </tr>' +
        '            </table>' +
        '        </td>' +
        '    </tr>' +
        '    <tr>' +
        '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
        '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
        '                <tr>' +
        '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
        '                        If you have any question, please do not hesitate to contact us.' +
        '                    </td>' +
        '                    <td align="right">' +
        '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' + mailFrom + '">Contact Us</a>' +
        '                    </td>' +
        '                </tr>' +
        '            </table>' +
        '        </td>' +
        '    </tr>' +
        '</table>';

    return html;
}

Template.billcard_temp.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.isForeignEnabled = new ReactiveVar(false);

    templateObject.records = new ReactiveVar();
    templateObject.CleintName = new ReactiveVar();
    templateObject.Department = new ReactiveVar();
    templateObject.Date = new ReactiveVar();
    templateObject.DueDate = new ReactiveVar();
    templateObject.BillNo = new ReactiveVar();
    templateObject.RefNo = new ReactiveVar();
    templateObject.Branding = new ReactiveVar();
    templateObject.Currency = new ReactiveVar();
    templateObject.Total = new ReactiveVar();
    templateObject.Subtotal = new ReactiveVar();
    templateObject.TotalTax = new ReactiveVar();
    templateObject.billrecord = new ReactiveVar({});
    templateObject.taxrateobj = new ReactiveVar();
    templateObject.Accounts = new ReactiveVar([]);
    templateObject.BillId = new ReactiveVar();
    templateObject.selectedCurrency = new ReactiveVar([]);
    templateObject.inputSelectedCurrency = new ReactiveVar([]);
    templateObject.currencySymbol = new ReactiveVar([]);
    // templateObject.deptrecords = new ReactiveVar();
    templateObject.viarecords = new ReactiveVar();
    templateObject.termrecords = new ReactiveVar();
    templateObject.clientrecords = new ReactiveVar([]);
    templateObject.taxraterecords = new ReactiveVar([]);
    templateObject.taxcodes = new ReactiveVar([]);
    templateObject.datatablerecords = new ReactiveVar([]);

    templateObject.selectedsupplierpayrecords = new ReactiveVar([]);

    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();

    templateObject.address = new ReactiveVar();
    templateObject.abn = new ReactiveVar();
    templateObject.referenceNumber = new ReactiveVar();
    templateObject.accountID = new ReactiveVar();
    templateObject.stripe_fee_method = new ReactiveVar();
    
    templateObject.subtaxcodes = new ReactiveVar([]);

    templateObject.hasFollow = new ReactiveVar(false);

    templateObject.supplierRecord = new ReactiveVar();
    templateObject.currencyData = new ReactiveVar();

    templateObject.headerfields = new ReactiveVar();
    templateObject.headerbuttons = new ReactiveVar();
    templateObject.tranasctionfooterfields = new ReactiveVar();
    templateObject.printOptions = new ReactiveVar();

    templateObject.temporaryfiles = new ReactiveVar([]);

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
        { label: "Order Date", type: "date", readonly: false, value: formatDate(new Date()), divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader", },
        { label: "Supplier Invoice #", type: 'default', id: 'ponumber', value: '', readonly: false, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: 'Via', type: 'search', id: 'sltShipVia', listModalId: 'shipVia_modal', listModalTemp: 'shipviapop', colName: 'colShipName', editModalId: 'newShipVia_modal', editModalTemp: 'newshipvia', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: 'Terms', type: 'search', id: 'sltTerms', listModalId: 'termsList_modal', listModalTemp: 'termlistpop', colName: 'colName', editModalId: 'newTerms_modal', editModalTemp: 'newtermspop', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: 'Status', type: 'search', id: 'sltStatus', listModalId: 'statusPop_modal', listModalTemp: 'statuspop', colName: 'colStatusName', editModalId: 'newStatusPop_modal', editModalTemp: 'newstatuspop', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: 'Reference', type: 'default', id: 'edtRef', value: '', readonly: false, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
        { label: 'Department', type: 'search', id: 'sltDept', listModalId: 'department_modal', listModalTemp: 'departmentpop', colName: 'colDeptName', editModalId: 'newDepartment_modal', editModalTemp: 'newdepartmentpop', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
    ]
    templateObject.headerfields.set(transactionheaderfields);

    let transactionheaderbuttons = [
        { label: "Pay Now", class: 'btnTransaction payNow', id: 'btnPayNow', bsColor: 'success', icon: 'dollar-sign' },
        { label: "Payment", class: 'btnTransaction btnMakePayment', id: 'btnPayment', bsColor: 'primary' },
        { label: "Copy Bill", class: 'btnTransaction copyPO', id: 'btnCopyInvoice', bsColor: 'primary' }
    ]
    templateObject.headerbuttons.set(transactionheaderbuttons)

    let transactionfooterfields = [
        { label: 'Comments', id: "txaComment", name: "txaComment", row: 6 },
        { label: 'Picking Instructions', id: "txapickmemo", name: "txapickmemo", row: 6 },
    ];

    templateObject.initialRecords = (data) => {

        LoadingOverlay.hide();
        let lineItems = [];
        let lineItemsTable = [];
        let lineItemObj = {};

        lineItemObj = {
            lineID: Random.id(),
            item: '',
            accountname: '',
            memo: '',
            description: '',
            quantity: '',
            unitPrice: 0,
            unitPriceInc: 0,
            taxRate: 0,
            taxCode: '',
            TotalAmt: 0,
            curTotalAmt: 0,
            TaxTotal: 0,
            TaxRate: 0,

        };
        
        lineItems.push(lineItemObj);
        const currentDate = new Date();
        const begunDate = moment(currentDate).format("DD/MM/YYYY");
        let billrecord = {
            id: '',
            lid: 'New Bill',
            accountname: '',
            memo: '',
            sosupplier: '',
            billto: '',
            shipto: '',
            shipping: '',
            docnumber: '',
            custPONumber: '',
            saledate: begunDate,
            duedate: '',
            employeename: '',
            status: '',
            invoicenumber: '',
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
            termsName: '',
            Total: Currency + '' + 0.00,
            LineItems: lineItems,
            TotalTax: Currency + '' + 0.00,
            SubTotal: Currency + '' + 0.00,
            balanceDue: Currency + '' + 0.00,
            saleCustField1: '',
            saleCustField2: '',
            totalPaid: Currency + '' + 0.00,
            ispaid: false,
            isPartialPaid: false,
            CustomerID: 0
        };
        if (FlowRouter.current().queryParams.supplierid) {
            templateObject.getSupplierData(FlowRouter.current().queryParams.supplierid);
        } else {
            $('#edtSupplierName').val('');
        }
        
        setTimeout(function () {
            $('.transheader > #sltDept_fromtransactionheader').val(defaultDept);
            templateObject.getLastBillData();
        }, 200);
        templateObject.billrecord.set(billrecord);
        return billrecord;

    }

    templateObject.tranasctionfooterfields.set(transactionfooterfields);
});

Template.billcard_temp.onRendered(() => {
    let templateObject = Template.instance();
    let tempObj = Template.instance();
    let utilityService = new UtilityService();
    let productService = new ProductService();
    let accountService = new AccountService();
    let purchaseService = new PurchaseBoardService();
    const taxRateService = new TaxRateService();
    let tableProductList;
    var splashArrayProductList = new Array();
    var splashArrayTaxRateList = new Array();
    const taxCodesList = [];
    let taxCodes = new Array();

    templateObject.getCurrencies = async function () {
        let currencyData = [];
        let dataObject = await getVS1Data("TCurrencyList");
        if (dataObject.length == 0) {
            taxRateService.getCurrencies().then(function (data) {
                for (let i in data.tcurrencylist) {
                    let currencyObj = {
                        id: data.tcurrencylist[i].CurrencyID || "",
                        currency: data.tcurrencylist[i].Currency || "",
                        currencySellRate: data.tcurrencylist[i].SellRate || "",
                        currencyBuyRate: data.tcurrencylist[i].BuyRate || "",
                        currencyCode: data.tcurrencylist[i].Code || "",
                    };

                    currencyData.push(currencyObj);
                }
                templateObject.currencyData.set(currencyData);
            });
        } else {
            let data = JSON.parse(dataObject[0].data);
            let useData = data.tcurrencylist;
            for (let i in useData) {
                let currencyObj = {
                    id: data.tcurrencylist[i].CurrencyID || "",
                    currency: data.tcurrencylist[i].Currency || "",
                    currencySellRate: data.tcurrencylist[i].SellRate || "",
                    currencyBuyRate: data.tcurrencylist[i].BuyRate || "",
                    currencyCode: data.tcurrencylist[i].Code || "",
                };

                currencyData.push(currencyObj)
            }
            templateObject.currencyData.set(currencyData);
        }
    }
    templateObject.getCurrencies();
    templateObject.getCurrencyRate = (currency, type) => {
        let currencyData = templateObject.currencyData.get();
        for (let i = 0; i < currencyData.length; i++) {
            if (currencyData[i].currencyCode == currency || currencyData[i].currency == currency) {
                if (type == 0) return currencyData[i].currencySellRate;
                else return currencyData[i].currencyBuyRate;
            }
        };
    };


    templateObject.setSupplierInfo = () => {
        if (!FlowRouter.current().queryParams.supplierid) {
            // $('#supplierListModal').modal('toggle');
        }
        let utilityService = new UtilityService();
        let taxcodeList = templateObject.taxraterecords.get();
        let $tblrows = $("#tblBillLine tbody tr");
        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let taxGrandTotalPrint = 0;
        $tblrows.each(function (index) {
            let taxTotal;
            const $tblrow = $(this);
            const amount = $tblrow.find(".colAmountExChange").val() || 0;
            const taxcode = $tblrow.find(".lineTaxCode").val() || '';
            if ($tblrow.find(".lineAccountName").val() === '') {
                $tblrow.find(".colAccountName").addClass('boldtablealertsborder');
            }
            let taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename === taxcode) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                    }
                }
            }
            const subTotal = parseFloat(amount) || 0;
            if ((taxrateamount === '') || (taxrateamount === ' ')) {
                taxTotal = 0;
            } else {
                taxTotal = parseFloat(amount) * parseFloat(taxrateamount);
            }
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
            if (!isNaN(subTotal)) {
                $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
                let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
                $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
            }
            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
            }
            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
            }
        });
        $('#tblSupplierlist_filter .form-control-sm').val('');
        setTimeout(function () {
            $('.btnRefreshSupplier').trigger('click');
            LoadingOverlay.hide();
        }, 1000);
    }

    templateObject.setSupplierByID = (data) => {
        $('#edtSupplierName').val(data.fields.ClientName);
        $('#edtSupplierName').attr("suppid", data.fields.ID);
        $('#edtSupplierEmail').val(data.fields.Email);
        $('#edtSupplierEmail').attr('customerid', data.fields.ID);
        $('#edtSupplierName').attr('suppid', data.fields.ID);

        let postalAddress = data.fields.Companyname + '\n' + data.fields.Street + '\n' + data.fields.Street2 + ' ' + data.fields.State + ' ' + data.fields.Postcode + '\n' + data.fields.Country;
        $('#txabillingAddress').val(postalAddress);
        $('#pdfSupplierAddress').html(postalAddress);
        $('.pdfSupplierAddress').text(postalAddress);
        $('#txaShipingInfo').val(postalAddress);
        $('.transheader > #sltTerms_fromtransactionheader').val(data.fields.TermsName || purchaseDefaultTerms);
        templateObject.setSupplierInfo();
    }

    templateObject.getSupplierData = async (supplierID) => {
        getVS1Data('TSupplierVS1').then(function (dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneSupplierDataEx(supplierID).then(function (data) {
                    templateObject.setSupplierByID(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsuppliervs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(supplierID)) {
                        added = true;
                        templateObject.setSupplierByID(useData[i]);
                    }
                }
                if (!added) {
                    contactService.getOneSupplierDataEx(supplierID).then(function (data) {
                        templateObject.setSupplierByID(data);
                    });
                }
            }
        }).catch(function (err) {
            contactService.getOneSupplierDataEx(supplierID).then(function (data) {
                LoadingOverlay.hide();
                templateObject.setSupplierByID(data);
            });
        });
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

    templateObject.getMonths = function (startDate, endDate) {
        let dateone = "";
        let datetwo = "";
        if (startDate != "") {
            dateone = moment(startDate).format('M');
        }
        if (endDate != "") {
            datetwo = parseInt(moment(endDate).format('M')) + 1;
        }
        if (dateone != "" && datetwo != "") {
            for (let x = dateone; x < datetwo; x++) {
                if (x == 1) {
                    $("#formCheck-january").prop('checked', true);
                }
                if (x == 2) {
                    $("#formCheck-february").prop('checked', true);
                }
                if (x == 3) {
                    $("#formCheck-march").prop('checked', true);
                }
                if (x == 4) {
                    $("#formCheck-april").prop('checked', true);
                }
                if (x == 5) {
                    $("#formCheck-may").prop('checked', true);
                }
                if (x == 6) {
                    $("#formCheck-june").prop('checked', true);
                }
                if (x == 7) {
                    $("#formCheck-july").prop('checked', true);
                }
                if (x == 8) {
                    $("#formCheck-august").prop('checked', true);
                }
                if (x == 9) {
                    $("#formCheck-september").prop('checked', true);
                }
                if (x == 10) {
                    $("#formCheck-october").prop('checked', true);
                }
                if (x == 11) {
                    $("#formCheck-november").prop('checked', true);
                }
                if (x == 12) {
                    $("#formCheck-december").prop('checked', true);
                }
            }
        }
        if (dateone == "") {
            $("#formCheck-january").prop('checked', true);
        }
    }

    templateObject.getLastBillData = async function () {
        let lastBankAccount = "Bank";
        let lastDepartment = defaultDept || "";
        purchaseService.getLastBillID().then(function (data) {
            let latestBillId;
            if (data.tbill.length > 0) {
                lastBill = data.tbill[data.tbill.length - 1]
                latestBillId = (lastBill.Id);
            } else {
                latestBillId = 0;
            }
            newBillId = (latestBillId + 1);
            setTimeout(function () {
                $('.transheader > #sltDept_fromtransactionheader').val(lastDepartment);
                if (FlowRouter.current().queryParams.id) {

                } else {
                    // $(".heading").html("New Bill " +newBillId +'<a role="button" class="btn btn-success" data-toggle="modal" href="#supportModal" style="margin-left: 12px;">Help <i class="fa fa-question-circle-o" style="font-size: 20px;"></i></a>');
                };
            }, 50);
        }).catch(function (err) {
            $('.transheader > #sltDept_fromtransactionheader').val(lastDepartment);
        });
    };

    const dataListTable = [
        ' ' || '',
        ' ' || '',
        0 || 0,
        0.00 || 0.00,
        ' ' || '',
        0.00 || 0.00,
        '<span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 btnRemove"><i class="fa fa-remove"></i></button></span>'
    ];
    $(window).on('load', function () {
        var win = $(this); //this = window
        if (win.width() <= 1024 && win.width() >= 450) {
            $("#colBalanceDue").addClass("order-12");
        }
        if (win.width() <= 926) {
            $("#totalSection").addClass("offset-md-6");
        }



    });

    let imageData = (localStorage.getItem("Image"));
    if (imageData) {
        $('.uploadedImage').attr('src', imageData);
    }
    const records = [];
    const clientList = [];
    const productsList = [];
    const accountsList = [];
    // const deptrecords = [];
    const viarecords = [];
    const termrecords = [];
    const statusList = [];
    const dataTableList = [];

    $(document).ready(function () {

        $('#formCheck-one').click(function () {

            if ($(event.target).is(':checked')) {
                $('.checkbox1div').css('display', 'block');
            } else {
                $('.checkbox1div').css('display', 'none');
            }
        });
        $('#formCheck-two').click(function () {

            if ($(event.target).is(':checked')) {
                $('.checkbox2div').css('display', 'block');
            } else {
                $('.checkbox2div').css('display', 'none');
            }
        });

        $('.customField1Text').blur(function () {
            var inputValue1 = $('.customField1Text').text();
            $('.lblCustomField1').text(inputValue1);
        });

        $('.customField2Text').blur(function () {
            var inputValue2 = $('.customField2Text').text();
            $('.lblCustomField2').text(inputValue2);
        });


    });
    $('.fullScreenSpin').css('display', 'inline-block');

    templateObject.getAllSelectPaymentData = function () {
        let supplierNamer = $('#edtSupplierName').val() || '';
        purchaseService.getCheckPaymentDetailsByName(supplierNamer).then(function (data) {
            let lineItems = [];
            let lineItemObj = {};
            for (let i = 0; i < data.tsupplierpayment.length; i++) {
                let amount = utilityService.modifynegativeCurrencyFormat(data.tsupplierpayment[i].fields.Amount) || 0.00;
                let applied = utilityService.modifynegativeCurrencyFormat(data.tsupplierpayment[i].fields.Applied) || 0.00;
                // Currency+''+data.tsupplierpayment[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                let balance = utilityService.modifynegativeCurrencyFormat(data.tsupplierpayment[i].fields.Balance) || 0.00;
                let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsupplierpayment[i].fields.TotalPaid) || 0.00;
                let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsupplierpayment[i].fields.TotalBalance) || 0.00;
                var dataList = {
                    id: data.tsupplierpayment[i].fields.ID || '',
                    sortdate: data.tsupplierpayment[i].fields.PaymentDate != '' ? moment(data.tsupplierpayment[i].fields.PaymentDate).format("YYYY/MM/DD") : data.tsupplierpayment[i].fields.PaymentDate,
                    paymentdate: data.tsupplierpayment[i].fields.PaymentDate != '' ? moment(data.tsupplierpayment[i].fields.PaymentDate).format("DD/MM/YYYY") : data.tsupplierpayment[i].fields.PaymentDate,
                    customername: data.tsupplierpayment[i].fields.CompanyName || '',
                    paymentamount: amount || 0.00,
                    applied: applied || 0.00,
                    balance: balance || 0.00,
                    lines: data.tsupplierpayment[i].fields.Lines,
                    bankaccount: data.tsupplierpayment[i].fields.AccountName || '',
                    department: data.tsupplierpayment[i].fields.DeptClassName || '',
                    refno: data.tsupplierpayment[i].fields.ReferenceNo || '',
                    paymentmethod: data.tsupplierpayment[i].fields.PaymentMethodName || '',
                    notes: data.tsupplierpayment[i].fields.Notes || ''
                };

                if (data.tsupplierpayment[i].fields.Lines != null) {
                    if (data.tsupplierpayment[i].fields.Lines.length) {
                        dataTableList.push(dataList);
                    }
                }
            }
            templateObject.selectedsupplierpayrecords.set(dataTableList);
        }).catch(function (err) {

        });

    };

    templateObject.getShpVias = function () {
        getVS1Data('TShippingMethod').then(function (dataObject) {
            if (dataObject.length == 0) {
                purchaseService.getShpVia().then(function (data) {
                    for (let i in data.tshippingmethod) {

                        let viarecordObj = {
                            shippingmethod: data.tshippingmethod[i].ShippingMethod || ' ',
                        };

                        viarecords.push(viarecordObj);
                        templateObject.viarecords.set(viarecords);

                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tshippingmethod;
                for (let i in useData) {

                    let viarecordObj = {
                        shippingmethod: useData[i].ShippingMethod || ' ',
                    };

                    viarecords.push(viarecordObj);
                    templateObject.viarecords.set(viarecords);

                }

            }
        }).catch(function (err) {
            purchaseService.getShpVia().then(function (data) {
                for (let i in data.tshippingmethod) {

                    let viarecordObj = {
                        shippingmethod: data.tshippingmethod[i].ShippingMethod || ' ',
                    };

                    viarecords.push(viarecordObj);
                    templateObject.viarecords.set(viarecords);

                }
            });
        });

    };

    templateObject.getShpVias();
    //templateObject.getTerms();
    // templateObject.getDepartments();


    let table;
    $(document).ready(function () {
        $('#edtSupplierName').editableSelect();
        $('#edtSupplierName').val('');
        $('.transheader > .sltCurrency').editableSelect();
        $('.transheader > #sltTerms_fromtransactionheader').editableSelect();
        $('.transheader > #sltDept_fromtransactionheader').editableSelect();
        $('.transheader > #sltStatus_fromtransactionheader').editableSelect();
        $('#shipvia').editableSelect();
    });

    $(document).on('click', '#edtSupplierName', function (e, li) {
        var $earch = $(this);
        var offset = $earch.offset();
        $('#edtSupplierPOPID').val('');
        var supplierDataName = e.target.value || '';
        var supplierDataID = $('#edtSupplierName').attr('suppid').replace(/\s/g, '') || '';
        if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#supplierListModal').modal();
            setTimeout(function () {
                $('#tblSupplierlist_filter .form-control-sm').focus();
                $('#tblSupplierlist_filter .form-control-sm').val('');
                $('#tblSupplierlist_filter .form-control-sm').trigger("input");
                var datatable = $('#tblSupplierlist').DataTable();
                datatable.draw();
                $('#tblSupplierlist_filter .form-control-sm').trigger("input");
            }, 500);
        } else {
            if (supplierDataName.replace(/\s/g, '') != '') {
                getVS1Data('TSupplierVS1').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getOneSupplierDataExByName(supplierDataName).then(function (data) {
                            LoadingOverlay.hide();
                            let lineItems = [];

                            $('#add-supplier-title').text('Edit Supplier');
                            let popSupplierID = data.tsupplier[0].fields.ID || '';
                            let popSupplierName = data.tsupplier[0].fields.ClientName || '';
                            let popSupplierEmail = data.tsupplier[0].fields.Email || '';
                            let popSupplierTitle = data.tsupplier[0].fields.Title || '';
                            let popSupplierFirstName = data.tsupplier[0].fields.FirstName || '';
                            let popSupplierMiddleName = data.tsupplier[0].fields.CUSTFLD10 || '';
                            let popSupplierLastName = data.tsupplier[0].fields.LastName || '';
                            let popSuppliertfn = '' || '';
                            let popSupplierPhone = data.tsupplier[0].fields.Phone || '';
                            let popSupplierMobile = data.tsupplier[0].fields.Mobile || '';
                            let popSupplierFaxnumber = data.tsupplier[0].fields.Faxnumber || '';
                            let popSupplierSkypeName = data.tsupplier[0].fields.SkypeName || '';
                            let popSupplierURL = data.tsupplier[0].fields.URL || '';
                            let popSupplierStreet = data.tsupplier[0].fields.Street || '';
                            let popSupplierStreet2 = data.tsupplier[0].fields.Street2 || '';
                            let popSupplierState = data.tsupplier[0].fields.State || '';
                            let popSupplierPostcode = data.tsupplier[0].fields.Postcode || '';
                            let popSupplierCountry = data.tsupplier[0].fields.Country || LoggedCountry;
                            let popSupplierbillingaddress = data.tsupplier[0].fields.BillStreet || '';
                            let popSupplierbcity = data.tsupplier[0].fields.BillStreet2 || '';
                            let popSupplierbstate = data.tsupplier[0].fields.BillState || '';
                            let popSupplierbpostalcode = data.tsupplier[0].fields.BillPostcode || '';
                            let popSupplierbcountry = data.tsupplier[0].fields.Billcountry || LoggedCountry;
                            let popSuppliercustfield1 = data.tsupplier[0].fields.CUSTFLD1 || '';
                            let popSuppliercustfield2 = data.tsupplier[0].fields.CUSTFLD2 || '';
                            let popSuppliercustfield3 = data.tsupplier[0].fields.CUSTFLD3 || '';
                            let popSuppliercustfield4 = data.tsupplier[0].fields.CUSTFLD4 || '';
                            let popSuppliernotes = data.tsupplier[0].fields.Notes || '';
                            let popSupplierpreferedpayment = data.tsupplier[0].fields.PaymentMethodName || '';
                            let popSupplierterms = data.tsupplier[0].fields.TermsName || '';
                            let popSupplierdeliverymethod = data.tsupplier[0].fields.ShippingMethodName || '';
                            let popSupplieraccountnumber = data.tsupplier[0].fields.ClientNo || '';
                            let popSupplierisContractor = data.tsupplier[0].fields.Contractor || false;
                            let popSupplierissupplier = data.tsupplier[0].fields.IsSupplier || false;
                            let popSupplieriscustomer = data.tsupplier[0].fields.IsCustomer || false;

                            $('#edtSupplierCompany').val(popSupplierName);
                            $('#edtSupplierPOPID').val(popSupplierID);
                            $('#edtSupplierCompanyEmail').val(popSupplierEmail);
                            $('#edtSupplierTitle').val(popSupplierTitle);
                            $('#edtSupplierFirstName').val(popSupplierFirstName);
                            $('#edtSupplierMiddleName').val(popSupplierMiddleName);
                            $('#edtSupplierLastName').val(popSupplierLastName);
                            $('#edtSupplierPhone').val(popSupplierPhone);
                            $('#edtSupplierMobile').val(popSupplierMobile);
                            $('#edtSupplierFax').val(popSupplierFaxnumber);
                            $('#edtSupplierSkypeID').val(popSupplierSkypeName);
                            $('#edtSupplierWebsite').val(popSupplierURL);
                            $('#edtSupplierShippingAddress').val(popSupplierStreet);
                            $('#edtSupplierShippingCity').val(popSupplierStreet2);
                            $('#edtSupplierShippingState').val(popSupplierState);
                            $('#edtSupplierShippingZIP').val(popSupplierPostcode);
                            $('#sedtCountry').val(popSupplierCountry);
                            $('#txaNotes').val(popSuppliernotes);
                            $('#sltPreferedPayment').val(popSupplierpreferedpayment);
                            $('.transheader > #sltTerms_fromtransactionheader').val(popSupplierterms);
                            $('#suppAccountNo').val(popSupplieraccountnumber);
                            $('#edtCustomeField1').val(popSuppliercustfield1);
                            $('#edtCustomeField2').val(popSuppliercustfield2);
                            $('#edtCustomeField3').val(popSuppliercustfield3);
                            $('#edtCustomeField4').val(popSuppliercustfield4);

                            if ((data.tsupplier[0].fields.Street == data.tsupplier[0].fields.BillStreet) && (data.tsupplier[0].fields.Street2 == data.tsupplier[0].fields.BillStreet2) &&
                                (data.tsupplier[0].fields.State == data.tsupplier[0].fields.BillState) && (data.tsupplier[0].fields.Postcode == data.tsupplier[0].fields.Postcode) &&
                                (data.tsupplier[0].fields.Country == data.tsupplier[0].fields.Billcountry)) {
                                //templateObject.isSameAddress.set(true);
                                $('#chkSameAsShipping').attr("checked", "checked");
                            }
                            if (data.tsupplier[0].fields.Contractor == true) {
                                // $('#isformcontractor')
                                $('#isformcontractor').attr("checked", "checked");
                            } else {
                                $('#isformcontractor').removeAttr("checked");
                            }
                            let supplierRecord = {
                                id: popSupplierID,
                                company: popSupplierName,
                                email: popSupplierEmail,
                                title: popSupplierTitle,
                                firstname: popSupplierFirstName,
                                middlename: popSupplierMiddleName,
                                lastname: popSupplierLastName,
                                tfn: '' || '',
                                phone: popSupplierPhone,
                                mobile: popSupplierMobile,
                                fax: popSupplierFaxnumber,
                                skype: popSupplierSkypeName,
                                website: popSupplierURL,
                                shippingaddress: popSupplierStreet,
                                scity: popSupplierStreet2,
                                sstate: popSupplierState,
                                spostalcode: popSupplierPostcode,
                                scountry: popSupplierCountry,
                                billingaddress: popSupplierbillingaddress,
                                bcity: popSupplierbcity,
                                bstate: popSupplierbstate,
                                bpostalcode: popSupplierbpostalcode,
                                bcountry: popSupplierbcountry,
                                custfield1: popSuppliercustfield1,
                                custfield2: popSuppliercustfield2,
                                custfield3: popSuppliercustfield3,
                                custfield4: popSuppliercustfield4,
                                notes: popSuppliernotes,
                                preferedpayment: popSupplierpreferedpayment,
                                terms: popSupplierterms,
                                deliverymethod: popSupplierdeliverymethod,
                                accountnumber: popSupplieraccountnumber,
                                isContractor: popSupplierisContractor,
                                issupplier: popSupplierissupplier,
                                iscustomer: popSupplieriscustomer,
                                bankName: data.tsuppliervs1[0].fields.BankName || '',
                                swiftCode: data.tsuppliervs1[0].fields.SwiftCode || '',
                                routingNumber: data.tsuppliervs1[0].fields.RoutingNumber || '',
                                bankAccountName: data.tsuppliervs1[0].fields.BankAccountName || '',
                                bankAccountBSB: data.tsuppliervs1[0].fields.BankAccountBSB || '',
                                bankAccountNo: data.tsuppliervs1[0].fields.BankAccountNo || '',
                                foreignExchangeCode: data.tsuppliervs1[0].fields.ForeignExchangeCode || CountryAbbr,
                                // openingbalancedate: data.tsuppliervs1[0].fields.RewardPointsOpeningDate ? moment(data.tsuppliervs1[0].fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
                                // taxcode:data.tsuppliervs1[0].fields.TaxCodeName || templateObject.defaultsaletaxcode.get()
                            };
                            templateObject.supplierRecord.set(supplierRecord);
                            setTimeout(function () {
                                $('#addSupplierModal').modal('show');
                            }, 200);



                        }).catch(function (err) {

                            LoadingOverlay.hide();
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tsuppliervs1;
                        var added = false;
                        for (let i = 0; i < data.tsuppliervs1.length; i++) {
                            if ((data.tsuppliervs1[i].fields.ClientName) === supplierDataName) {
                                added = true;
                                LoadingOverlay.hide();
                                let lineItems = [];
                                $('#add-supplier-title').text('Edit Supplier');
                                let popSupplierID = data.tsuppliervs1[i].fields.ID || '';
                                let popSupplierName = data.tsuppliervs1[i].fields.ClientName || '';
                                let popSupplierEmail = data.tsuppliervs1[i].fields.Email || '';
                                let popSupplierTitle = data.tsuppliervs1[i].fields.Title || '';
                                let popSupplierFirstName = data.tsuppliervs1[i].fields.FirstName || '';
                                let popSupplierMiddleName = data.tsuppliervs1[i].fields.CUSTFLD10 || '';
                                let popSupplierLastName = data.tsuppliervs1[i].fields.LastName || '';
                                let popSuppliertfn = '' || '';
                                let popSupplierPhone = data.tsuppliervs1[i].fields.Phone || '';
                                let popSupplierMobile = data.tsuppliervs1[i].fields.Mobile || '';
                                let popSupplierFaxnumber = data.tsuppliervs1[i].fields.Faxnumber || '';
                                let popSupplierSkypeName = data.tsuppliervs1[i].fields.SkypeName || '';
                                let popSupplierURL = data.tsuppliervs1[i].fields.URL || '';
                                let popSupplierStreet = data.tsuppliervs1[i].fields.Street || '';
                                let popSupplierStreet2 = data.tsuppliervs1[i].fields.Street2 || '';
                                let popSupplierState = data.tsuppliervs1[i].fields.State || '';
                                let popSupplierPostcode = data.tsuppliervs1[i].fields.Postcode || '';
                                let popSupplierCountry = data.tsuppliervs1[i].fields.Country || LoggedCountry;
                                let popSupplierbillingaddress = data.tsuppliervs1[i].fields.BillStreet || '';
                                let popSupplierbcity = data.tsuppliervs1[i].fields.BillStreet2 || '';
                                let popSupplierbstate = data.tsuppliervs1[i].fields.BillState || '';
                                let popSupplierbpostalcode = data.tsuppliervs1[i].fields.BillPostcode || '';
                                let popSupplierbcountry = data.tsuppliervs1[i].fields.Billcountry || LoggedCountry;
                                let popSuppliercustfield1 = data.tsuppliervs1[i].fields.CUSTFLD1 || '';
                                let popSuppliercustfield2 = data.tsuppliervs1[i].fields.CUSTFLD2 || '';
                                let popSuppliercustfield3 = data.tsuppliervs1[i].fields.CUSTFLD3 || '';
                                let popSuppliercustfield4 = data.tsuppliervs1[i].fields.CUSTFLD4 || '';
                                let popSuppliernotes = data.tsuppliervs1[i].fields.Notes || '';
                                let popSupplierpreferedpayment = data.tsuppliervs1[i].fields.PaymentMethodName || '';
                                let popSupplierterms = data.tsuppliervs1[i].fields.TermsName || '';
                                let popSupplierdeliverymethod = data.tsuppliervs1[i].fields.ShippingMethodName || '';
                                let popSupplieraccountnumber = data.tsuppliervs1[i].fields.ClientNo || '';
                                let popSupplierisContractor = data.tsuppliervs1[i].fields.Contractor || false;
                                let popSupplierissupplier = data.tsuppliervs1[i].fields.IsSupplier || false;
                                let popSupplieriscustomer = data.tsuppliervs1[i].fields.IsCustomer || false;

                                $('#edtSupplierCompany').val(popSupplierName);
                                $('#edtSupplierPOPID').val(popSupplierID);
                                $('#edtSupplierCompanyEmail').val(popSupplierEmail);
                                $('#edtSupplierTitle').val(popSupplierTitle);
                                $('#edtSupplierFirstName').val(popSupplierFirstName);
                                $('#edtSupplierMiddleName').val(popSupplierMiddleName);
                                $('#edtSupplierLastName').val(popSupplierLastName);
                                $('#edtSupplierPhone').val(popSupplierPhone);
                                $('#edtSupplierMobile').val(popSupplierMobile);
                                $('#edtSupplierFax').val(popSupplierFaxnumber);
                                $('#edtSupplierSkypeID').val(popSupplierSkypeName);
                                $('#edtSupplierWebsite').val(popSupplierURL);
                                $('#edtSupplierShippingAddress').val(popSupplierStreet);
                                $('#edtSupplierShippingCity').val(popSupplierStreet2);
                                $('#edtSupplierShippingState').val(popSupplierState);
                                $('#edtSupplierShippingZIP').val(popSupplierPostcode);
                                $('#sedtCountry').val(popSupplierCountry);
                                $('#txaNotes').val(popSuppliernotes);
                                $('#sltPreferedPayment').val(popSupplierpreferedpayment);
                                $('.transheader > #sltTerms_fromtransactionheader').val(popSupplierterms);
                                $('#suppAccountNo').val(popSupplieraccountnumber);
                                $('#edtCustomeField1').val(popSuppliercustfield1);
                                $('#edtCustomeField2').val(popSuppliercustfield2);
                                $('#edtCustomeField3').val(popSuppliercustfield3);
                                $('#edtCustomeField4').val(popSuppliercustfield4);

                                if ((data.tsuppliervs1[i].fields.Street == data.tsuppliervs1[i].fields.BillStreet) && (data.tsuppliervs1[i].fields.Street2 == data.tsuppliervs1[i].fields.BillStreet2) &&
                                    (data.tsuppliervs1[i].fields.State == data.tsuppliervs1[i].fields.BillState) && (data.tsuppliervs1[i].fields.Postcode == data.tsuppliervs1[i].fields.Postcode) &&
                                    (data.tsuppliervs1[i].fields.Country == data.tsuppliervs1[i].fields.Billcountry)) {
                                    //templateObject.isSameAddress.set(true);
                                    $('#chkSameAsShipping').attr("checked", "checked");
                                }
                                if (data.tsuppliervs1[i].fields.Contractor == true) {
                                    // $('#isformcontractor')
                                    $('#isformcontractor').attr("checked", "checked");
                                } else {
                                    $('#isformcontractor').removeAttr("checked");
                                }
                                let supplierRecord = {
                                    id: popSupplierID,
                                    company: popSupplierName,
                                    email: popSupplierEmail,
                                    title: popSupplierTitle,
                                    firstname: popSupplierFirstName,
                                    middlename: popSupplierMiddleName,
                                    lastname: popSupplierLastName,
                                    tfn: '' || '',
                                    phone: popSupplierPhone,
                                    mobile: popSupplierMobile,
                                    fax: popSupplierFaxnumber,
                                    skype: popSupplierSkypeName,
                                    website: popSupplierURL,
                                    shippingaddress: popSupplierStreet,
                                    scity: popSupplierStreet2,
                                    sstate: popSupplierState,
                                    spostalcode: popSupplierPostcode,
                                    scountry: popSupplierCountry,
                                    billingaddress: popSupplierbillingaddress,
                                    bcity: popSupplierbcity,
                                    bstate: popSupplierbstate,
                                    bpostalcode: popSupplierbpostalcode,
                                    bcountry: popSupplierbcountry,
                                    custfield1: popSuppliercustfield1,
                                    custfield2: popSuppliercustfield2,
                                    custfield3: popSuppliercustfield3,
                                    custfield4: popSuppliercustfield4,
                                    notes: popSuppliernotes,
                                    preferedpayment: popSupplierpreferedpayment,
                                    terms: popSupplierterms,
                                    deliverymethod: popSupplierdeliverymethod,
                                    accountnumber: popSupplieraccountnumber,
                                    isContractor: popSupplierisContractor,
                                    issupplier: popSupplierissupplier,
                                    iscustomer: popSupplieriscustomer,
                                    bankName: data.tsuppliervs1[i].fields.BankName || '',
                                    swiftCode: data.tsuppliervs1[i].fields.SwiftCode || '',
                                    routingNumber: data.tsuppliervs1[i].fields.RoutingNumber || '',
                                    bankAccountName: data.tsuppliervs1[i].fields.BankAccountName || '',
                                    bankAccountBSB: data.tsuppliervs1[i].fields.BankAccountBSB || '',
                                    bankAccountNo: data.tsuppliervs1[i].fields.BankAccountNo || '',
                                    foreignExchangeCode: data.tsuppliervs1[i].fields.ForeignExchangeCode || CountryAbbr,
                                    // openingbalancedate: data.tsuppliervs1[i].fields.RewardPointsOpeningDate ? moment(data.tsuppliervs1[i].fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
                                    // taxcode:data.tsuppliervs1[i].fields.TaxCodeName || templateObject.defaultsaletaxcode.get()
                                };
                                templateObject.supplierRecord.set(supplierRecord);
                                setTimeout(function () {
                                    $('#addSupplierModal').modal('show');
                                }, 200);
                            }
                        }

                        if (!added) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getOneSupplierDataExByName(supplierDataName).then(function (data) {
                                LoadingOverlay.hide();
                                let lineItems = [];

                                $('#add-supplier-title').text('Edit Supplier');
                                let popSupplierID = data.tsupplier[0].fields.ID || '';
                                let popSupplierName = data.tsupplier[0].fields.ClientName || '';
                                let popSupplierEmail = data.tsupplier[0].fields.Email || '';
                                let popSupplierTitle = data.tsupplier[0].fields.Title || '';
                                let popSupplierFirstName = data.tsupplier[0].fields.FirstName || '';
                                let popSupplierMiddleName = data.tsupplier[0].fields.CUSTFLD10 || '';
                                let popSupplierLastName = data.tsupplier[0].fields.LastName || '';
                                let popSuppliertfn = '' || '';
                                let popSupplierPhone = data.tsupplier[0].fields.Phone || '';
                                let popSupplierMobile = data.tsupplier[0].fields.Mobile || '';
                                let popSupplierFaxnumber = data.tsupplier[0].fields.Faxnumber || '';
                                let popSupplierSkypeName = data.tsupplier[0].fields.SkypeName || '';
                                let popSupplierURL = data.tsupplier[0].fields.URL || '';
                                let popSupplierStreet = data.tsupplier[0].fields.Street || '';
                                let popSupplierStreet2 = data.tsupplier[0].fields.Street2 || '';
                                let popSupplierState = data.tsupplier[0].fields.State || '';
                                let popSupplierPostcode = data.tsupplier[0].fields.Postcode || '';
                                let popSupplierCountry = data.tsupplier[0].fields.Country || LoggedCountry;
                                let popSupplierbillingaddress = data.tsupplier[0].fields.BillStreet || '';
                                let popSupplierbcity = data.tsupplier[0].fields.BillStreet2 || '';
                                let popSupplierbstate = data.tsupplier[0].fields.BillState || '';
                                let popSupplierbpostalcode = data.tsupplier[0].fields.BillPostcode || '';
                                let popSupplierbcountry = data.tsupplier[0].fields.Billcountry || LoggedCountry;
                                let popSuppliercustfield1 = data.tsupplier[0].fields.CUSTFLD1 || '';
                                let popSuppliercustfield2 = data.tsupplier[0].fields.CUSTFLD2 || '';
                                let popSuppliercustfield3 = data.tsupplier[0].fields.CUSTFLD3 || '';
                                let popSuppliercustfield4 = data.tsupplier[0].fields.CUSTFLD4 || '';
                                let popSuppliernotes = data.tsupplier[0].fields.Notes || '';
                                let popSupplierpreferedpayment = data.tsupplier[0].fields.PaymentMethodName || '';
                                let popSupplierterms = data.tsupplier[0].fields.TermsName || '';
                                let popSupplierdeliverymethod = data.tsupplier[0].fields.ShippingMethodName || '';
                                let popSupplieraccountnumber = data.tsupplier[0].fields.ClientNo || '';
                                let popSupplierisContractor = data.tsupplier[0].fields.Contractor || false;
                                let popSupplierissupplier = data.tsupplier[0].fields.IsSupplier || false;
                                let popSupplieriscustomer = data.tsupplier[0].fields.IsCustomer || false;

                                $('#edtSupplierCompany').val(popSupplierName);
                                $('#edtSupplierPOPID').val(popSupplierID);
                                $('#edtSupplierCompanyEmail').val(popSupplierEmail);
                                $('#edtSupplierTitle').val(popSupplierTitle);
                                $('#edtSupplierFirstName').val(popSupplierFirstName);
                                $('#edtSupplierMiddleName').val(popSupplierMiddleName);
                                $('#edtSupplierLastName').val(popSupplierLastName);
                                $('#edtSupplierPhone').val(popSupplierPhone);
                                $('#edtSupplierMobile').val(popSupplierMobile);
                                $('#edtSupplierFax').val(popSupplierFaxnumber);
                                $('#edtSupplierSkypeID').val(popSupplierSkypeName);
                                $('#edtSupplierWebsite').val(popSupplierURL);
                                $('#edtSupplierShippingAddress').val(popSupplierStreet);
                                $('#edtSupplierShippingCity').val(popSupplierStreet2);
                                $('#edtSupplierShippingState').val(popSupplierState);
                                $('#edtSupplierShippingZIP').val(popSupplierPostcode);
                                $('#sedtCountry').val(popSupplierCountry);
                                $('#txaNotes').val(popSuppliernotes);
                                $('#sltPreferedPayment').val(popSupplierpreferedpayment);
                                $('.transheader > #sltTerms_fromtransactionheader').val(popSupplierterms);
                                $('#suppAccountNo').val(popSupplieraccountnumber);
                                $('#edtCustomeField1').val(popSuppliercustfield1);
                                $('#edtCustomeField2').val(popSuppliercustfield2);
                                $('#edtCustomeField3').val(popSuppliercustfield3);
                                $('#edtCustomeField4').val(popSuppliercustfield4);

                                if ((data.tsupplier[0].fields.Street == data.tsupplier[0].fields.BillStreet) && (data.tsupplier[0].fields.Street2 == data.tsupplier[0].fields.BillStreet2) &&
                                    (data.tsupplier[0].fields.State == data.tsupplier[0].fields.BillState) && (data.tsupplier[0].fields.Postcode == data.tsupplier[0].fields.Postcode) &&
                                    (data.tsupplier[0].fields.Country == data.tsupplier[0].fields.Billcountry)) {
                                    //templateObject.isSameAddress.set(true);
                                    $('#chkSameAsShipping').attr("checked", "checked");
                                }
                                if (data.tsupplier[0].fields.Contractor == true) {
                                    // $('#isformcontractor')
                                    $('#isformcontractor').attr("checked", "checked");
                                } else {
                                    $('#isformcontractor').removeAttr("checked");
                                }
                                let supplierRecord = {
                                    id: popSupplierID,
                                    company: popSupplierName,
                                    email: popSupplierEmail,
                                    title: popSupplierTitle,
                                    firstname: popSupplierFirstName,
                                    middlename: popSupplierMiddleName,
                                    lastname: popSupplierLastName,
                                    tfn: '' || '',
                                    phone: popSupplierPhone,
                                    mobile: popSupplierMobile,
                                    fax: popSupplierFaxnumber,
                                    skype: popSupplierSkypeName,
                                    website: popSupplierURL,
                                    shippingaddress: popSupplierStreet,
                                    scity: popSupplierStreet2,
                                    sstate: popSupplierState,
                                    spostalcode: popSupplierPostcode,
                                    scountry: popSupplierCountry,
                                    billingaddress: popSupplierbillingaddress,
                                    bcity: popSupplierbcity,
                                    bstate: popSupplierbstate,
                                    bpostalcode: popSupplierbpostalcode,
                                    bcountry: popSupplierbcountry,
                                    custfield1: popSuppliercustfield1,
                                    custfield2: popSuppliercustfield2,
                                    custfield3: popSuppliercustfield3,
                                    custfield4: popSuppliercustfield4,
                                    notes: popSuppliernotes,
                                    preferedpayment: popSupplierpreferedpayment,
                                    terms: popSupplierterms,
                                    deliverymethod: popSupplierdeliverymethod,
                                    accountnumber: popSupplieraccountnumber,
                                    isContractor: popSupplierisContractor,
                                    issupplier: popSupplierissupplier,
                                    iscustomer: popSupplieriscustomer,
                                    bankName: data.tsuppliervs1[0].fields.BankName || '',
                                    swiftCode: data.tsuppliervs1[0].fields.SwiftCode || '',
                                    routingNumber: data.tsuppliervs1[0].fields.RoutingNumber || '',
                                    bankAccountName: data.tsuppliervs1[0].fields.BankAccountName || '',
                                    bankAccountBSB: data.tsuppliervs1[0].fields.BankAccountBSB || '',
                                    bankAccountNo: data.tsuppliervs1[0].fields.BankAccountNo || '',
                                    foreignExchangeCode: data.tsuppliervs1[0].fields.ForeignExchangeCode || CountryAbbr,
                                    // openingbalancedate: data.tsuppliervs1[0].fields.RewardPointsOpeningDate ? moment(data.tsuppliervs1[0].fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
                                    // taxcode:data.tsuppliervs1[0].fields.TaxCodeName || templateObject.defaultsaletaxcode.get()
                                };
                                templateObject.supplierRecord.set(supplierRecord);
                                setTimeout(function () {
                                    $('#addSupplierModal').modal('show');
                                }, 200);
                            }).catch(function (err) {

                                LoadingOverlay.hide();
                            });
                        }
                    }
                }).catch(function (err) {

                    sideBarService.getOneSupplierDataExByName(supplierDataName).then(function (data) {
                        LoadingOverlay.hide();
                        let lineItems = [];

                        $('#add-supplier-title').text('Edit Supplier');
                        let popSupplierID = data.tsupplier[0].fields.ID || '';
                        let popSupplierName = data.tsupplier[0].fields.ClientName || '';
                        let popSupplierEmail = data.tsupplier[0].fields.Email || '';
                        let popSupplierTitle = data.tsupplier[0].fields.Title || '';
                        let popSupplierFirstName = data.tsupplier[0].fields.FirstName || '';
                        let popSupplierMiddleName = data.tsupplier[0].fields.CUSTFLD10 || '';
                        let popSupplierLastName = data.tsupplier[0].fields.LastName || '';
                        let popSuppliertfn = '' || '';
                        let popSupplierPhone = data.tsupplier[0].fields.Phone || '';
                        let popSupplierMobile = data.tsupplier[0].fields.Mobile || '';
                        let popSupplierFaxnumber = data.tsupplier[0].fields.Faxnumber || '';
                        let popSupplierSkypeName = data.tsupplier[0].fields.SkypeName || '';
                        let popSupplierURL = data.tsupplier[0].fields.URL || '';
                        let popSupplierStreet = data.tsupplier[0].fields.Street || '';
                        let popSupplierStreet2 = data.tsupplier[0].fields.Street2 || '';
                        let popSupplierState = data.tsupplier[0].fields.State || '';
                        let popSupplierPostcode = data.tsupplier[0].fields.Postcode || '';
                        let popSupplierCountry = data.tsupplier[0].fields.Country || LoggedCountry;
                        let popSupplierbillingaddress = data.tsupplier[0].fields.BillStreet || '';
                        let popSupplierbcity = data.tsupplier[0].fields.BillStreet2 || '';
                        let popSupplierbstate = data.tsupplier[0].fields.BillState || '';
                        let popSupplierbpostalcode = data.tsupplier[0].fields.BillPostcode || '';
                        let popSupplierbcountry = data.tsupplier[0].fields.Billcountry || LoggedCountry;
                        let popSuppliercustfield1 = data.tsupplier[0].fields.CUSTFLD1 || '';
                        let popSuppliercustfield2 = data.tsupplier[0].fields.CUSTFLD2 || '';
                        let popSuppliercustfield3 = data.tsupplier[0].fields.CUSTFLD3 || '';
                        let popSuppliercustfield4 = data.tsupplier[0].fields.CUSTFLD4 || '';
                        let popSuppliernotes = data.tsupplier[0].fields.Notes || '';
                        let popSupplierpreferedpayment = data.tsupplier[0].fields.PaymentMethodName || '';
                        let popSupplierterms = data.tsupplier[0].fields.TermsName || '';
                        let popSupplierdeliverymethod = data.tsupplier[0].fields.ShippingMethodName || '';
                        let popSupplieraccountnumber = data.tsupplier[0].fields.ClientNo || '';
                        let popSupplierisContractor = data.tsupplier[0].fields.Contractor || false;
                        let popSupplierissupplier = data.tsupplier[0].fields.IsSupplier || false;
                        let popSupplieriscustomer = data.tsupplier[0].fields.IsCustomer || false;

                        $('#edtSupplierCompany').val(popSupplierName);
                        $('#edtSupplierPOPID').val(popSupplierID);
                        $('#edtSupplierCompanyEmail').val(popSupplierEmail);
                        $('#edtSupplierTitle').val(popSupplierTitle);
                        $('#edtSupplierFirstName').val(popSupplierFirstName);
                        $('#edtSupplierMiddleName').val(popSupplierMiddleName);
                        $('#edtSupplierLastName').val(popSupplierLastName);
                        $('#edtSupplierPhone').val(popSupplierPhone);
                        $('#edtSupplierMobile').val(popSupplierMobile);
                        $('#edtSupplierFax').val(popSupplierFaxnumber);
                        $('#edtSupplierSkypeID').val(popSupplierSkypeName);
                        $('#edtSupplierWebsite').val(popSupplierURL);
                        $('#edtSupplierShippingAddress').val(popSupplierStreet);
                        $('#edtSupplierShippingCity').val(popSupplierStreet2);
                        $('#edtSupplierShippingState').val(popSupplierState);
                        $('#edtSupplierShippingZIP').val(popSupplierPostcode);
                        $('#sedtCountry').val(popSupplierCountry);
                        $('#txaNotes').val(popSuppliernotes);
                        $('#sltPreferedPayment').val(popSupplierpreferedpayment);
                        $('.transheader > #sltTerms_fromtransactionheader').val(popSupplierterms);
                        $('#suppAccountNo').val(popSupplieraccountnumber);
                        $('#edtCustomeField1').val(popSuppliercustfield1);
                        $('#edtCustomeField2').val(popSuppliercustfield2);
                        $('#edtCustomeField3').val(popSuppliercustfield3);
                        $('#edtCustomeField4').val(popSuppliercustfield4);

                        if ((data.tsupplier[0].fields.Street == data.tsupplier[0].fields.BillStreet) && (data.tsupplier[0].fields.Street2 == data.tsupplier[0].fields.BillStreet2) &&
                            (data.tsupplier[0].fields.State == data.tsupplier[0].fields.BillState) && (data.tsupplier[0].fields.Postcode == data.tsupplier[0].fields.Postcode) &&
                            (data.tsupplier[0].fields.Country == data.tsupplier[0].fields.Billcountry)) {
                            //templateObject.isSameAddress.set(true);
                            $('#chkSameAsShipping').attr("checked", "checked");
                        }
                        if (data.tsupplier[0].fields.Contractor == true) {
                            // $('#isformcontractor')
                            $('#isformcontractor').attr("checked", "checked");
                        } else {
                            $('#isformcontractor').removeAttr("checked");
                        }
                        let supplierRecord = {
                            id: popSupplierID,
                            company: popSupplierName,
                            email: popSupplierEmail,
                            title: popSupplierTitle,
                            firstname: popSupplierFirstName,
                            middlename: popSupplierMiddleName,
                            lastname: popSupplierLastName,
                            tfn: '' || '',
                            phone: popSupplierPhone,
                            mobile: popSupplierMobile,
                            fax: popSupplierFaxnumber,
                            skype: popSupplierSkypeName,
                            website: popSupplierURL,
                            shippingaddress: popSupplierStreet,
                            scity: popSupplierStreet2,
                            sstate: popSupplierState,
                            spostalcode: popSupplierPostcode,
                            scountry: popSupplierCountry,
                            billingaddress: popSupplierbillingaddress,
                            bcity: popSupplierbcity,
                            bstate: popSupplierbstate,
                            bpostalcode: popSupplierbpostalcode,
                            bcountry: popSupplierbcountry,
                            custfield1: popSuppliercustfield1,
                            custfield2: popSuppliercustfield2,
                            custfield3: popSuppliercustfield3,
                            custfield4: popSuppliercustfield4,
                            notes: popSuppliernotes,
                            preferedpayment: popSupplierpreferedpayment,
                            terms: popSupplierterms,
                            deliverymethod: popSupplierdeliverymethod,
                            accountnumber: popSupplieraccountnumber,
                            isContractor: popSupplierisContractor,
                            issupplier: popSupplierissupplier,
                            iscustomer: popSupplieriscustomer,
                            bankName: data.tsuppliervs1[0].fields.BankName || '',
                            swiftCode: data.tsuppliervs1[0].fields.SwiftCode || '',
                            routingNumber: data.tsuppliervs1[0].fields.RoutingNumber || '',
                            bankAccountName: data.tsuppliervs1[0].fields.BankAccountName || '',
                            bankAccountBSB: data.tsuppliervs1[0].fields.BankAccountBSB || '',
                            bankAccountNo: data.tsuppliervs1[0].fields.BankAccountNo || '',
                            foreignExchangeCode: data.tsuppliervs1[0].fields.ForeignExchangeCode || CountryAbbr,
                            // openingbalancedate: data.tsuppliervs1[0].fields.RewardPointsOpeningDate ? moment(data.tsuppliervs1[0].fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
                            // taxcode:data.tsuppliervs1[0].fields.TaxCodeName || templateObject.defaultsaletaxcode.get()
                        };
                        templateObject.supplierRecord.set(supplierRecord);
                        setTimeout(function () {
                            $('#addSupplierModal').modal('show');
                        }, 200);


                    }).catch(function (err) {

                        LoadingOverlay.hide();
                    });
                });
                //FlowRouter.go('/supplierscard?name=' + e.target.value);
            } else {
                $('#supplierListModal').modal();
                setTimeout(function () {
                    $('#tblSupplierlist_filter .form-control-sm').focus();
                    $('#tblSupplierlist_filter .form-control-sm').val('');
                    $('#tblSupplierlist_filter .form-control-sm').trigger("input");
                    var datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblSupplierlist_filter .form-control-sm').trigger("input");
                }, 500);
            }
        }
    })


    $(document).on("click", "#tblSupplierlist tbody tr", function (e) {
        const tableSupplier = $(this);
        $('#edtSupplierName').val(tableSupplier.find(".colCompany").text());
        $('#edtSupplierName').attr("suppid", tableSupplier.find(".colID").text());
        $('#edtSupplierEmail').val(tableSupplier.find(".colEmail").text());
        $('#edtSupplierEmail').attr('customerid', tableSupplier.find(".colID").text());
        $('#edtSupplierName').attr('suppid', tableSupplier.find(".colID").text());

        let postalAddress = tableSupplier.find(".colCompany").text() + '\n' + tableSupplier.find(".colStreetAddress").text() + '\n' + tableSupplier.find(".colCity").text() + ' ' + tableSupplier.find(".colState").text() + ' ' + tableSupplier.find(".colZipCode").text() + '\n' + tableSupplier.find(".colCountry").text();
        $('#txabillingAddress').val(postalAddress);
        $('#pdfSupplierAddress').html(postalAddress);
        $('.pdfSupplierAddress').text(postalAddress);
        $('#txaShipingInfo').val(postalAddress);
        $('.transheader > #sltTerms_fromtransactionheader').val(tableSupplier.find(".colSupplierTermName").text() || purchaseDefaultTerms);
        templateObject.setSupplierInfo();
        $('#supplierListModal').modal('hide');
    });

    setTimeout(function () {

        var x = window.matchMedia("(max-width: 1024px)")

        function mediaQuery(x) {
            if (x.matches) {

                $("#colInvnoReference").removeClass("col-auto");
                $("#colInvnoReference").addClass("col-4");

                $("#colTermsVia").removeClass("col-auto");
                $("#colTermsVia").addClass("col-4");

                $("#colStatusDepartment").removeClass("col-auto");
                $("#colStatusDepartment").addClass("col-4");

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

    templateObject.setOneBillData = (data) => {
        LoadingOverlay.hide();
        let lineItems = [];
        let lineItemObj = {};
        let lineItemsTable = [];
        let lineItemTableObj = {};
        let exchangeCode = data.fields.ForeignExchangeCode;
        let currencySymbol = Currency;
        let total = currencySymbol + '' + data.fields.TotalAmount.toFixed(2);
        let totalInc = currencySymbol + '' + data.fields.TotalAmountInc.toFixed(2);
        let subTotal = currencySymbol + '' + data.fields.TotalAmount.toFixed(2);
        let totalTax = currencySymbol + '' + data.fields.TotalTax.toFixed(2);
        let totalBalance = currencySymbol + '' + data.fields.TotalBalance.toFixed(2);
        let totalPaidAmount = currencySymbol + '' + data.fields.TotalPaid.toFixed(2);
        if (data.fields.Lines.length) {
            for (let i = 0; i < data.fields.Lines.length; i++) {
                let AmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
                let currencyAmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
                let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
                let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
                lineItemObj = {
                    lineID: Random.id(),
                    id: data.fields.Lines[i].fields.ID || '',
                    accountname: data.fields.Lines[i].fields.AccountName || '',
                    memo: data.fields.Lines[i].fields.ProductDescription || '',
                    item: data.fields.Lines[i].fields.ProductName || '',
                    description: data.fields.Lines[i].fields.ProductDescription || '',
                    quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
                    unitPrice: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
                    unitPriceInc: currencySymbol + '' + data.fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
                    lineCost: currencySymbol + '' + data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
                    taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                    taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
                    TotalAmt: AmountGbp || 0,
                    customerJob: data.fields.Lines[i].fields.CustomerJob || '',
                    curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                    TaxTotal: TaxTotalGbp || 0,
                    TaxRate: TaxRateGbp || 0,

                };

                lineItemsTable.push(dataListTable);
                lineItems.push(lineItemObj);
            }
        } else {
            let AmountGbp = data.fields.Lines.fields.TotalLineAmountInc.toFixed(2);
            let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
            let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines.fields.LineTaxTotal);
            let TaxRateGbp = currencySymbol + '' + data.fields.Lines.fields.LineTaxRate;
            lineItemObj = {
                lineID: Random.id(),
                id: data.fields.Lines.fields.ID || '',
                accountname: data.fields.Lines.fields.AccountName || '',
                memo: data.fields.Lines.fields.ProductDescription || '',
                description: data.fields.Lines.fields.ProductDescription || '',
                quantity: data.fields.Lines.fields.UOMOrderQty || 0,
                unitPrice: data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
                unitPriceInc: data.fields.Lines[i].fields.LineCostInc.toFixed(2) || 0,
                lineCost: data.fields.Lines[i].fields.LineCost.toFixed(2) || 0,
                taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
                TotalAmt: AmountGbp || 0,
                customerJob: data.fields.Lines[i].fields.CustomerJob || '',
                curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                TaxTotal: TaxTotalGbp || 0,
                TaxRate: TaxRateGbp || 0
            };
            lineItems.push(lineItemObj);
        }

        let isPartialPaid = false;
        if (data.fields.TotalPaid > 0) {
            isPartialPaid = true;
        }

        let billrecord = {
            id: data.fields.ID,
            lid: 'Edit Bill' + ' ' + data.fields.ID,
            sosupplier: data.fields.SupplierName,
            billto: data.fields.OrderTo,
            shipto: data.fields.ShipTo,
            shipping: data.fields.Shipping,
            docnumber: data.fields.DocNumber,
            custPONumber: data.fields.CustPONumber,
            saledate: data.fields.OrderDate ? moment(data.fields.OrderDate).format('DD/MM/YYYY') : "",
            duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
            employeename: data.fields.EmployeeName,
            status: data.fields.OrderStatus,
            invoicenumber: data.fields.SupplierInvoiceNumber,
            comments: data.fields.Comments,
            pickmemo: data.fields.SalesComments,
            ponumber: data.fields.CustPONumber,
            via: data.fields.Shipping,
            connote: data.fields.ConNote,
            reference: data.fields.CustPONumber,
            currency: data.fields.ForeignExchangeCode,
            branding: data.fields.MedType,
            invoiceToDesc: data.fields.OrderTo,
            shipToDesc: data.fields.ShipTo,
            termsName: data.fields.TermsName,
            Total: totalInc,
            LineItems: lineItems,
            TotalTax: totalTax,
            SubTotal: subTotal,
            balanceDue: totalBalance,
            saleCustField1: data.fields.SaleLineRef,
            saleCustField2: data.fields.SalesComments,
            totalPaid: totalPaidAmount,
            ispaid: data.fields.IsPaid,
            isPartialPaid: isPartialPaid,
            department: data.fields.Lines[0].fields.LineClassName || defaultDept,
            CustomerID: data.fields.SupplierId
        };
        templateObject.getSupplierData(data.fields.SupplierId)

        $('#edtSupplierName').val(data.fields.SupplierName);
        $('.transheader > #sltTerms_fromtransactionheader').val(data.fields.TermsName);
        $('.transheader > #sltDept_fromtransactionheader').val(data.fields.Lines[0].fields.LineClassName);
        $('.transheader > #sltStatus_fromtransactionheader').val(data.fields.OrderStatus);
        $('.transheader > #sltShipVia_fromtransactionheader').val(data.fields.Shipping)
        templateObject.CleintName.set(data.fields.SupplierName);
        $('#shipvia').val(data.fields.Shipping);
        $('.transheader > .sltCurrency').val(data.fields.ForeignExchangeCode);
        //$('#exchange_rate').val(data.fields.ForeignExchangeRate);
        //let currencyRate = templateObject.getCurrencyRate(data.fields.ForeignExchangeCode, 0);
        $('#exchange_rate').val(templateObject.getCurrencyRate(data.fields.ForeignExchangeCode, 0));
        FxGlobalFunctions.handleChangedCurrency(data.fields.ForeignExchangeCode, defaultCurrencyCode);

        templateObject.attachmentCount.set(0);
        if (data.fields.Attachments) {
            if (data.fields.Attachments.length) {
                templateObject.attachmentCount.set(data.fields.Attachments.length);
                templateObject.uploadedFiles.set(data.fields.Attachments);
            }
        }

        setTimeout(function () {
            if (clientList) {
                for (var i = 0; i < clientList.length; i++) {
                    if (clientList[i].suppliername == data.fields.SupplierName) {
                        $('#edtSupplierEmail').val(clientList[i].supplieremail);
                        $('#edtSupplierEmail').attr('supplierid', clientList[i].supplierid);
                    }
                }
            }


            if (data.fields.IsPaid === true) {
                $('#edtSupplierName').attr('readonly', true);
                $('#btnViewPayment').removeAttr('disabled', 'disabled');
                $('#addRow').attr('disabled', 'disabled');
                $('#edtSupplierName').css('background-color', '#eaecf4');
                $('.btnSave').attr('disabled', 'disabled');
                $('#btnBack').removeAttr('disabled', 'disabled');
                $('.printConfirm').removeAttr('disabled', 'disabled');
                $('.tblBillLine tbody tr').each(function () {
                    var $tblrow = $(this);
                    $tblrow.find("td").attr('contenteditable', false);
                    //$tblrow.find("td").removeClass("lineProductName");
                    $tblrow.find("td").removeClass("lineTaxAmount");
                    $tblrow.find("td").removeClass("lineTaxCode");

                    $tblrow.find("td").attr('readonly', true);
                    $tblrow.find("td").attr('disabled', 'disabled');
                    $tblrow.find("td").css('background-color', '#eaecf4');
                    $tblrow.find("td .table-remove").removeClass("btnRemove");
                });
            }

        }, 100);



        templateObject.billrecord.set(billrecord);

        templateObject.selectedCurrency.set(billrecord.currency);
        templateObject.inputSelectedCurrency.set(billrecord.currency);
        if (templateObject.billrecord.get()) {


            Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblBillLine', function (error, result) {
                if (error) {

                } else {
                    if (result) {
                        for (let i = 0; i < result.customFields.length; i++) {
                            let customcolumn = result.customFields;
                            let columData = customcolumn[i].label;
                            let columHeaderUpdate = customcolumn[i].thclass;
                            let hiddenColumn = customcolumn[i].hidden;
                            let columnClass = columHeaderUpdate.substring(columHeaderUpdate.indexOf(".") + 1);
                            let columnWidth = customcolumn[i].width;


                            $("" + columHeaderUpdate + "").html(columData);
                            if (columnWidth != 0) {
                                $("" + columHeaderUpdate + "").css('width', columnWidth + '%');
                            }

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
        }

        return {record: billrecord, attachmentCount: templateObject.attachmentCount.get(), uploadedFiles: templateObject.uploadedFiles.get(), selectedCurrency: billrecord.currency}
    }

    templateObject.saveBills = (data) => {
        let uploadedItems = templateObject.uploadedFiles.get();
        setTimeout(function () {
            saveCurrencyHistory();

            let suppliername = $('#edtSupplierName');

            let termname = $('.transheader > #sltTerms_fromtransactionheader').val() || '';
            if (termname === '') {
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
            if (suppliername.val() === '') {
                swal({
                    title: "Supplier has not been selected!",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('#edtSupplierName').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                e.preventDefault();
            } else {
                $('.fullScreenSpin').css('display', 'inline-block');
                var splashLineArray = new Array();
                let lineItemsForm = [];
                let lineItemObjForm = {};
                $('#tblBillLine > tbody > tr').each(function () {
                    var lineID = this.id;
                    let tdaccount = $('#' + lineID + " .lineAccountName").val();
                    let tddmemo = $('#' + lineID + " .lineMemo").text();
                    
                    let tdamount = $('#' + lineID + " .lineAmount").text();
                   
                    let tdCustomerJob = $('#' + lineID + " .lineCustomerJob").val();
                    let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
                    let tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || "NT";

                    if (tdaccount != "") {

                        lineItemObjForm = {
                            type: "TBillLine",
                            fields: {
                                AccountName: tdaccount || '',
                                ProductDescription: tddmemo || '',
                                CustomerJob: tdCustomerJob || '',
                                LineCost: Number(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
                                LineTaxCode: tdtaxCode || '',
                                LineClassName: $('.transheader > #sltDept_fromtransactionheader').val() || defaultDept
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

                let supplier = $('#edtSupplierName').val();
                let supplierEmail = $('#edtSupplierEmail').val();
                let billingAddress = $('#txabillingAddress').val();

                var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
                var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

                let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
                let dueDate = duedateTime.getFullYear() + "-" + (duedateTime.getMonth() + 1) + "-" + duedateTime.getDate();

                let poNumber = $('#ponumber').val();
                let reference = $('#edtRef').val();

                let departement = $('.transheader > #sltStatus_fromtransactionheader').val();
                let shippingAddress = $('#txaShipingInfo').val();
                let comments = $('#txaComment').val();
                let pickingInfrmation = $('#txapickmemo').val();

                let saleCustField1 = $('#edtSaleCustField1').val();
                let saleCustField2 = $('#edtSaleCustField2').val();
                let orderStatus = $('#edtStatus').val();
                let billTotal = $('#grandTotal').text();

                var url = FlowRouter.current().path;
                var getso_id = url.split('?id=');
                var currentBill = getso_id[getso_id.length - 1];

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
                if ($('.transheader > #sltDept_fromtransactionheader').val() === '') {
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
                    LoadingOverlay.hide();
                    event.preventDefault();
                    return false;
                }
                if (getso_id[1]) {
                    currentBill = parseInt(currentBill);
                    objDetails = {
                        type: "TBillEx",
                        fields: {
                            ID: currentBill,
                            SupplierName: supplier,
                            // ForeignExchangeCode: currencyCode,
                            // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                            ...foreignCurrencyFields,
                            Lines: splashLineArray,
                            OrderTo: billingAddress,
                            Deleted: false,

                            OrderDate: saleDate,

                            SupplierInvoiceNumber: poNumber,
                            ConNote: reference,
                            TermsName: termname,
                            Shipping: departement,
                            ShipTo: shippingAddress,
                            Comments: comments,


                            SalesComments: pickingInfrmation,
                            Attachments: uploadedItems,
                            OrderStatus: $('.transheader > #sltStatus_fromtransactionheader').val(),
                            BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
                            TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
                        }
                    };
                } else {
                    objDetails = {
                        type: "TBillEx",
                        fields: {
                            SupplierName: supplier,
                            // ForeignExchangeCode: currencyCode,
                            // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                            ...foreignCurrencyFields,
                            Lines: splashLineArray,
                            OrderTo: billingAddress,
                            OrderDate: saleDate,
                            Deleted: false,

                            SupplierInvoiceNumber: poNumber,
                            ConNote: reference,
                            TermsName: termname,
                            Shipping: departement,
                            ShipTo: shippingAddress,
                            Comments: comments,


                            SalesComments: pickingInfrmation,
                            Attachments: uploadedItems,
                            OrderStatus: $('.transheader > #sltStatus_fromtransactionheader').val(),
                            BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
                            TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
                        }
                    };
                }
                if (splashLineArray.length > 0) {

                } else {
                    // swal('Account name has not been selected!', '', 'warning');
                    // LoadingOverlay.hide();
                    // event.preventDefault();
                    // return false;
                };

                showSimpleMessageTransaction();
                playSaveAudio();

                let currentBilltemp = templateObject.temporaryfiles.get();
                let newBilltemp = [...currentBilltemp, objDetails];
                templateObject.temporaryfiles.set(newBilltemp);

                addVS1Data('TBillTemp', JSON.stringify({tbilltemp: newBilltemp})).then(function () {
                    if (localStorage.getItem("enteredURL") != null) {
                        FlowRouter.go(localStorage.getItem("enteredURL"));
                        localStorage.removeItem("enteredURL");
                        return;
                    }

                    var supplierID = $('#edtSupplierEmail').attr('supplierid');


                    $('#html-2-pdfwrapper').css('display', 'block');
                    $('.pdfCustomerName').html($('#edtSupplierEmail').val());
                    $('.pdfCustomerAddress').html(
                        $('#txabillingAddress')
                        .val().replace(/[\r\n]/g, "<br />")
                    );
                    var ponumber = $('#ponumber').val() || '.';
                    $('.po').text(ponumber);
                    // async function addAttachment() {
                    //     let attachment = [];
                    //     let invoiceId = objDetails.fields.ID;
                    //     FlowRouter.go('/billlist?success=true');
                    //     let encodedPdf = await generatePdfForMail(invoiceId);
                    //     let pdfObject = "";

                    //     let base64data = encodedPdf.split(',')[1];
                    //     pdfObject = {
                    //         filename: 'Bill-' + invoiceId + '.pdf',
                    //         content: base64data,
                    //         encoding: 'base64'
                    //     };
                    //     attachment.push(pdfObject);
                    //     let erpInvoiceId = objDetails.fields.ID;
                    //     let mailFromName = localStorage.getItem('vs1companyName');
                    //     let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                    //     let customerEmailName = $('#edtSupplierName').val();
                    //     let checkEmailData = $('#edtSupplierEmail').val();
                    //     // let grandtotal = $('#grandTotal').html();
                    //     // let amountDueEmail = $('#totalBalanceDue').html();
                    //     // let emailDueDate = $("#dtDueDate").val();
                    //     let mailSubject = 'Bill ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
                    //     // let mailBody = "Hi " + customerEmailName + ",\n\n Here's bill " + erpInvoiceId + " for  " + grandtotal + "." +
                    //     //     "\n\nThe amount outstanding of " + amountDueEmail + " is due on " + emailDueDate + "." +
                    //     //     "\n\nIf you have any questions, please let us know : " + mailFrom + ".\n\nThanks,\n" + mailFromName;
                    //     var htmlmailBody = generateHtmlMailBody(erpInvoiceId);

                    //     if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
                    //         Meteor.call('sendEmail', {
                    //             from: "" + mailFromName + " <" + mailFrom + ">",
                    //             to: checkEmailData,
                    //             subject: mailSubject,
                    //             text: '',
                    //             html: htmlmailBody,
                    //             attachments: attachment
                    //         }, function (error, result) {
                    //             if (error && error.error === "error") {


                    //             } else {

                    //             }
                    //         });

                    //         Meteor.call('sendEmail', {
                    //             from: "" + mailFromName + " <" + mailFrom + ">",
                    //             to: mailFrom,
                    //             subject: mailSubject,
                    //             text: '',
                    //             html: htmlmailBody,
                    //             attachments: attachment
                    //         }, function (error, result) {
                    //             if (error && error.error === "error") {
                    //                 if (FlowRouter.current().queryParams.trans) {
                    //                     FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans);
                    //                 } else {
                    //                     FlowRouter.go('/billlist?success=true');
                    //                 };
                    //             } else {
                    //                 $('#html-2-pdfwrapper').css('display', 'none');
                    //                 swal({
                    //                     title: 'SUCCESS',
                    //                     text: "Email Sent To Supplier: " + checkEmailData + " and User: " + mailFrom + "",
                    //                     type: 'success',
                    //                     showCancelButton: false,
                    //                     confirmButtonText: 'OK'
                    //                 }).then((result) => {
                    //                     if (result.value) {
                    //                         if (FlowRouter.current().queryParams.trans) {
                    //                             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans);
                    //                         } else {
                    //                             FlowRouter.go('/billlist?success=true');
                    //                         };
                    //                     } else if (result.dismiss === 'cancel') {

                    //                     }
                    //                 });

                    //                 LoadingOverlay.hide();
                    //             }
                    //         });

                    //         let values = [];
                    //         let basedOnTypeStorages = Object.keys(localStorage);
                    //         basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                    //             let employeeId = storage.split('_')[2];
                    //             // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
                    //             return storage.includes('BasedOnType_');
                    //         });
                    //         let i = basedOnTypeStorages.length;
                    //         if (i > 0) {
                    //             while (i--) {
                    //                 values.push(localStorage.getItem(basedOnTypeStorages[i]));
                    //             }
                    //         }
                    //         values.forEach(value => {
                    //             let reportData = JSON.parse(value);
                    //             let temp = { ...reportData };

                    //             temp.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    //             reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    //             temp.attachments = attachment;
                    //             if (temp.BasedOnType.includes("S")) {
                    //                 if (temp.FormID == 1) {
                    //                     let formIds = temp.FormIDs.split(',');
                    //                     if (formIds.includes("12")) {
                    //                         temp.FormID = 12;
                    //                         Meteor.call('sendNormalEmail', temp);
                    //                     }
                    //                 } else {
                    //                     if (temp.FormID == 12)
                    //                         Meteor.call('sendNormalEmail', temp);
                    //                 }
                    //             }
                    //         });

                    //     } else if (($('.chkEmailCopy').is(':checked'))) {
                    //         Meteor.call('sendEmail', {
                    //             from: "" + mailFromName + " <" + mailFrom + ">",
                    //             to: checkEmailData,
                    //             subject: mailSubject,
                    //             text: '',
                    //             html: htmlmailBody,
                    //             attachments: attachment
                    //         }, function (error, result) {
                    //             if (error && error.error === "error") {
                    //                 FlowRouter.go('/billlist?success=true');
                    //             } else {
                    //                 $('#html-2-pdfwrapper').css('display', 'none');
                    //                 swal({
                    //                     title: 'SUCCESS',
                    //                     text: "Email Sent To Supplier: " + checkEmailData + " ",
                    //                     type: 'success',
                    //                     showCancelButton: false,
                    //                     confirmButtonText: 'OK'
                    //                 }).then((result) => {
                    //                     if (result.value) {
                    //                         if (FlowRouter.current().queryParams.trans) {
                    //                             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                    //                         } else {
                    //                             FlowRouter.go('/billlist?success=true');
                    //                         };
                    //                     } else if (result.dismiss === 'cancel') {

                    //                     }
                    //                 });

                    //                 LoadingOverlay.hide();
                    //             }
                    //         });

                    //         let values = [];
                    //         let basedOnTypeStorages = Object.keys(localStorage);
                    //         basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                    //             let employeeId = storage.split('_')[2];
                    //             // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
                    //             return storage.includes('BasedOnType_')
                    //         });
                    //         let i = basedOnTypeStorages.length;
                    //         if (i > 0) {
                    //             while (i--) {
                    //                 values.push(localStorage.getItem(basedOnTypeStorages[i]));
                    //             }
                    //         }
                    //         values.forEach(value => {
                    //             let reportData = JSON.parse(value);
                    //             reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    //             reportData.attachments = attachment;
                    //             if (reportData.BasedOnType.includes("S")) {
                    //                 if (reportData.FormID == 1) {
                    //                     let formIds = reportData.FormIDs.split(',');
                    //                     if (formIds.includes("12")) {
                    //                         reportData.FormID = 12;
                    //                         Meteor.call('sendNormalEmail', reportData);
                    //                     }
                    //                 } else {
                    //                     if (reportData.FormID == 12)
                    //                         Meteor.call('sendNormalEmail', reportData);
                    //                 }
                    //             }
                    //         });

                    //     } else if (($('.chkEmailRep').is(':checked'))) {
                    //         Meteor.call('sendEmail', {
                    //             from: "" + mailFromName + " <" + mailFrom + ">",
                    //             to: mailFrom,
                    //             subject: mailSubject,
                    //             text: '',
                    //             html: htmlmailBody,
                    //             attachments: attachment
                    //         }, function (error, result) {
                    //             if (error && error.error === "error") {
                    //                 FlowRouter.go('/billlist?success=true');
                    //             } else {
                    //                 $('#html-2-pdfwrapper').css('display', 'none');
                    //                 swal({
                    //                     title: 'SUCCESS',
                    //                     text: "Email Sent To User: " + mailFrom + " ",
                    //                     type: 'success',
                    //                     showCancelButton: false,
                    //                     confirmButtonText: 'OK'
                    //                 }).then((result) => {
                    //                     if (result.value) {
                    //                         if (FlowRouter.current().queryParams.trans) {
                    //                             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                    //                         } else {
                    //                             FlowRouter.go('/billlist?success=true');
                    //                         };
                    //                     } else if (result.dismiss === 'cancel') {

                    //                     }
                    //                 });

                    //                 LoadingOverlay.hide();
                    //             }
                    //         });

                    //         let values = [];
                    //         let basedOnTypeStorages = Object.keys(localStorage);
                    //         basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                    //             let employeeId = storage.split('_')[2];
                    //             return storage.includes('BasedOnType_');
                    //             // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
                    //         });
                    //         let i = basedOnTypeStorages.length;
                    //         if (i > 0) {
                    //             while (i--) {
                    //                 values.push(localStorage.getItem(basedOnTypeStorages[i]));
                    //             }
                    //         }
                    //         values.forEach(value => {
                    //             let reportData = JSON.parse(value);
                    //             reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    //             reportData.attachments = attachment;
                    //             if (reportData.BasedOnType.includes("S")) {
                    //                 if (reportData.FormID == 1) {
                    //                     let formIds = reportData.FormIDs.split(',');
                    //                     if (formIds.includes("12")) {
                    //                         reportData.FormID = 12;
                    //                         Meteor.call('sendNormalEmail', reportData);
                    //                     }
                    //                 } else {
                    //                     if (reportData.FormID == 12)
                    //                         Meteor.call('sendNormalEmail', reportData);
                    //                 }
                    //             }
                    //         });

                    //     } else {


                    //         let values = [];
                    //         let basedOnTypeStorages = Object.keys(localStorage);
                    //         basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                    //             let employeeId = storage.split('_')[2];
                    //             return storage.includes('BasedOnType_');
                    //             // return storage.includes('BasedOnType_') && employeeId == localStorage.getItem('mySessionEmployeeLoggedID')
                    //         });
                    //         let i = basedOnTypeStorages.length;
                    //         if (i > 0) {
                    //             while (i--) {
                    //                 values.push(localStorage.getItem(basedOnTypeStorages[i]));
                    //             }
                    //         }
                    //         values.forEach(value => {
                    //             let reportData = JSON.parse(value);
                    //             reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
                    //             reportData.attachments = attachment;
                    //             if (reportData.BasedOnType.includes("S")) {
                    //                 if (reportData.FormID == 1) {
                    //                     let formIds = reportData.FormIDs.split(',');
                    //                     if (formIds.includes("12")) {
                    //                         reportData.FormID = 12;
                    //                         Meteor.call('sendNormalEmail', reportData);
                    //                     }
                    //                 } else {
                    //                     if (reportData.FormID == 12)
                    //                         Meteor.call('sendNormalEmail', reportData);
                    //                 }
                    //             }
                    //         });
                    //         if (FlowRouter.current().queryParams.trans) {
                    //             FlowRouter.go('/customerscard?id=' + FlowRouter.current().queryParams.trans + '&transTab=active');
                    //         } else {
                    //             FlowRouter.go('/billlist?success=true');
                    //         };
                    //     };

                    // }
                    // addAttachment();
                    var htmlmailBody = generateHtmlMailBody(objDetails.fields.ID || '', '') 
                    addAttachment("Bill", "Customer", objDetails.fields.ID || '', htmlmailBody, 'billlist', 12,  'html-2-pdfwrapper', '', true)

                    // function generatePdfForMail(invoiceId) {
                    //     let file = "Bill-" + invoiceId + ".pdf"
                    //     return new Promise((resolve, reject) => {
                    //         let completeTabRecord;
                    //         let doc = new jsPDF('p', 'pt', 'a4');
                    //         var source = document.getElementById('html-2-pdfwrapper');
                    //         var opt = {
                    //             margin: 0,
                    //             filename: file,
                    //             image: {
                    //                 type: 'jpeg',
                    //                 quality: 0.98
                    //             },
                    //             html2canvas: {
                    //                 scale: 2
                    //             },
                    //             jsPDF: {
                    //                 unit: 'in',
                    //                 format: 'a4',
                    //                 orientation: 'portrait'
                    //             }
                    //         }
                    //         resolve(html2pdf().set(opt).from(source).toPdf().output('datauristring'));

                    //     });
                    // }
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
                    LoadingOverlay.hide();
                });
            }
        }, delayTimeAfterSound);

    }

    templateObject.updateBillTemp = async function(objDetails) {
        return new Promise( (resolve, reject) => {
          let currentTemp = templateObject.temporaryfiles.get();
          let newTemp = [...currentTemp, objDetails];
          templateObject.temporaryfiles.set(newTemp);
           addVS1Data('TBillTemp', JSON.stringify({tbilltemp:newTemp})).then(function(){resolve()})
        })
    }

});

Template.billcard_temp.helpers({
    oneExAPIName: function () {
        let purchaseBoardService = new PurchaseBoardService();
        return purchaseBoardService.getOneBilldataEx;
    },

    service: () => {
        let purchaseBoardService = new PurchaseBoardService();
        return purchaseBoardService;
    },

    listapiservice: function () {
        return sideBarService
    },

    listapifunction: function () {
        return sideBarService.getAllBillListData
    },

    setTransData: () => {
        let templateObject = Template.instance();
        return function (data) {
            let dataReturn = templateObject.setOneBillData(data)
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

    printOptions: () => {
        return Template.instance().printOptions.get()
    },

    footerFields: function () {
        return Template.instance().tranasctionfooterfields.get()
    },

    saveTransaction: function () {
        let templateObject = Template.instance();
        return function (data) {
            templateObject.saveBills(data)
        }
    },

    getTemplateList: function () {
        return template_list;
    },
    getTemplateNumber: function () {
        let template_numbers = ["1", "2", "3"];
        return template_numbers;
    },
    billrecord: () => {
        return Template.instance().billrecord.get();
    },

    supplierRecord: () => {
        return Template.instance().supplierRecord.get();
    },

    // deptrecords: () => {
    //     return Template.instance().deptrecords.get().sort(function (a, b) {
    //         if (a.department == 'NA') {
    //             return 1;
    //         } else if (b.department == 'NA') {
    //             return -1;
    //         }
    //         return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
    //     });
    // },
    viarecords: () => {
        return Template.instance().viarecords.get().sort(function (a, b) {
            if (a.shippingmethod == 'NA') {
                return 1;
            } else if (b.shippingmethod == 'NA') {
                return -1;
            }
            return (a.shippingmethod.toUpperCase() > b.shippingmethod.toUpperCase()) ? 1 : -1;
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
            if (a.suppliername == 'NA') {
                return 1;
            } else if (b.suppliername == 'NA') {
                return -1;
            }
            return (a.suppliername.toUpperCase() > b.suppliername.toUpperCase()) ? 1 : -1;
        });
    },
    purchaseCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: localStorage.getItem('mycloudLogonID'),
            PrefName: 'billcard'
        });
    },
    purchaseCloudGridPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: localStorage.getItem('mycloudLogonID'),
            PrefName: 'tblBillLine'
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
    // statusrecords: () => {
    //     return Template.instance().statusrecords.get().sort(function (a, b) {
    //         if (a.orderstatus == 'NA') {
    //             return 1;
    //         } else if (b.orderstatus == 'NA') {
    //             return -1;
    //         }
    //         return (a.orderstatus.toUpperCase() > b.orderstatus.toUpperCase()) ? 1 : -1;
    //     });
    // },
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
        return "Phone: " + localStorage.getItem('vs1companyPhone');
    },
    companyabn: () => { //Update Company ABN
        let countryABNValue = localStorage.getItem("vs1companyABN");
        // if (LoggedCountry == "South Africa") {
        //     countryABNValue = "Vat No: " + localStorage.getItem("vs1companyABN");
        // }
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
        var isMobile = false;

        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }

        return isMobile;
    },

    // custom field displaysettings


    isForeignEnabled: () => {
        return Template.instance().isForeignEnabled.get();
    },
    getDefaultCurrency: () => {
        return defaultCurrencyCode;
    },

    updateTransactionTemp:  function() {
        let templateObject = Template.instance();
        return async function(data) {
          await templateObject.updateBillTemp(data)
        }
    },

    isCurrencyEnable: () => FxGlobalFunctions.isCurrencyEnabled()
});

Template.billcard_temp.events({
    'click #btnCopyInvoice': function () {
        playCopyAudio();
        let i = 0;
        setTimeout(async function () {
            $("#basedOnFrequency").prop('checked', true);
            $('#edtFrequencyDetail').css('display', 'flex');
            $(".ofMonthList input[type=checkbox]").each(function () {
                $(this).prop('checked', false);
            });
            $(".selectDays input[type=checkbox]").each(function () {
                $(this).prop('checked', false);
            });
            // var url = FlowRouter.current().path;
            // var getso_id = url.split("?id=");
            // var currentInvoice = getso_id[getso_id.length - 1];
            // if (getso_id[1]) {
            //     currentInvoice = parseInt(currentInvoice);
            //     var billData = await purchaseService.getOneBilldataEx(currentInvoice);
            //     var selectedType = billData.fields.TypeOfBasedOn;
            //     var frequencyVal = billData.fields.FrequenctyValues;
            //     var startDate = billData.fields.CopyStartDate;
            //     var finishDate = billData.fields.CopyFinishDate;
            //     var subStartDate = startDate.substring(0, 10);
            //     var subFinishDate = finishDate.substring(0, 10);
            //     var convertedStartDate = subStartDate ? subStartDate.split('-')[2] + '/' + subStartDate.split('-')[1] + '/' + subStartDate.split('-')[0] : '';
            //     var convertedFinishDate = subFinishDate ? subFinishDate.split('-')[2] + '/' + subFinishDate.split('-')[1] + '/' + subFinishDate.split('-')[0] : '';
            //     var arrFrequencyVal = frequencyVal.split("@");
            //     var radioFrequency = arrFrequencyVal[0];
            //     $("#" + radioFrequency).prop('checked', true);
            //     if (radioFrequency == "frequencyMonthly") {
            //     document.getElementById("monthlySettings").style.display = "block";
            //     document.getElementById("weeklySettings").style.display = "none";
            //     document.getElementById("dailySettings").style.display = "none";
            //     document.getElementById("oneTimeOnlySettings").style.display = "none";
            //     var monthDate = arrFrequencyVal[1];
            //     $("#sltDay").val('day' + monthDate);
            //     var ofMonths = arrFrequencyVal[2];
            //     var arrOfMonths = [];
            //     if (ofMonths != "" && ofMonths != undefined && ofMonths != null)
            //         arrOfMonths = ofMonths.split(",");
            //     for (i=0; i<arrOfMonths.length; i++) {
            //         $("#formCheck-" + arrOfMonths[i]).prop('checked', true);
            //     }
            //     $('#edtMonthlyStartDate').val(convertedStartDate);
            //     $('#edtMonthlyFinishDate').val(convertedFinishDate);
            //     } else if (radioFrequency == "frequencyWeekly") {
            //     document.getElementById("weeklySettings").style.display = "block";
            //     document.getElementById("monthlySettings").style.display = "none";
            //     document.getElementById("dailySettings").style.display = "none";
            //     document.getElementById("oneTimeOnlySettings").style.display = "none";
            //     var everyWeeks = arrFrequencyVal[1];
            //     $("#weeklyEveryXWeeks").val(everyWeeks);
            //     var selectDays = arrFrequencyVal[2];
            //     var arrSelectDays = selectDays.split(",");
            //     for (i=0; i<arrSelectDays.length; i++) {
            //         if (parseInt(arrSelectDays[i]) == 0)
            //         $("#formCheck-sunday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 1)
            //         $("#formCheck-monday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 2)
            //         $("#formCheck-tuesday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 3)
            //         $("#formCheck-wednesday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 4)
            //         $("#formCheck-thursday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 5)
            //         $("#formCheck-friday").prop('checked', true);
            //         if (parseInt(arrSelectDays[i]) == 6)
            //         $("#formCheck-saturday").prop('checked', true);
            //     }
            //     $('#edtWeeklyStartDate').val(convertedStartDate);
            //     $('#edtWeeklyFinishDate').val(convertedFinishDate);
            //     } else if (radioFrequency == "frequencyDaily") {
            //     document.getElementById("dailySettings").style.display = "block";
            //     document.getElementById("monthlySettings").style.display = "none";
            //     document.getElementById("weeklySettings").style.display = "none";
            //     document.getElementById("oneTimeOnlySettings").style.display = "none";
            //     var dailyRadioOption = arrFrequencyVal[1];
            //     $("#" + dailyRadioOption).prop('checked', true);
            //     var everyDays = arrFrequencyVal[2];
            //     $("#dailyEveryXDays").val(everyDays);
            //     $('#edtDailyStartDate').val(convertedStartDate);
            //     $('#edtDailyFinishDate').val(convertedFinishDate);
            //     } else if (radioFrequency == "frequencyOnetimeonly") {
            //     document.getElementById("oneTimeOnlySettings").style.display = "block";
            //     document.getElementById("monthlySettings").style.display = "none";
            //     document.getElementById("weeklySettings").style.display = "none";
            //     document.getElementById("dailySettings").style.display = "none";
            //     $('#edtOneTimeOnlyDate').val(convertedStartDate);
            //     $('#edtOneTimeOnlyTimeError').css('display', 'none');
            //     $('#edtOneTimeOnlyDateError').css('display', 'none');
            //     }
            // }
            $("#copyFrequencyModal").modal("toggle");
        }, delayTimeAfterSound);
    },
    
    'click #edtSupplierName': function (event) {
        $('#edtSupplierName').select();
        $('#edtSupplierName').editableSelect();
    },
    
    'change .transheader > #sltStatus_fromtransactionheader': function () {
        let status = $('.transheader > #sltStatus_fromtransactionheader').find(":selected").val();
        if (status == "newstatus") {
            $('#statusModal').modal();
        }
    },
    'blur .lineMemo': function (event) {
        var targetID = $(event.target).closest('tr').attr('id');
        $('#' + targetID + " #lineMemo").text($('#' + targetID + " .lineMemo").text());
    },
    'blur .colAmountExChange': function (event) {
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();
        var targetID = $(event.target).closest('tr').attr('id');
        if (!isNaN($(event.target).val())) {
            let inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        } else {
            let inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;

            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));


        }
        let $tblrows = $("#tblBillLine tbody tr");
        let $printrows = $(".bill_print tbody tr");

        if ($('.printID').val() == "") {
            $('#' + targetID + " #lineAmount").text($('#' + targetID + " .colAmountExChange").val());
            $('#' + targetID + " #lineTaxCode").text($('#' + targetID + " .lineTaxCode").val());

        }

        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let taxGrandTotalPrint = 0;

        $tblrows.each(function (index) {
            var $tblrow = $(this);
            var amount = $tblrow.find(".colAmountExChange").val() || "0";
            var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxcode) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                    }
                }
            }


            var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
            var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
            if (!isNaN(subTotal)) {
                $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
                let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
                $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
            }

            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
            }


            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

            }
        });

        if ($(".printID").val() == "") {
            $printrows.each(function (index) {
                var $printrow = $(this);
                var amount = $printrow.find("#lineAmount").text() || "0";
                var taxcode = $printrow.find("#lineTaxCode").text() || "E";

                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxcode) {
                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                        }
                    }
                }
                var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                $printrow.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                if (!isNaN(subTotal)) {
                    $printrow.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                    subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                }
                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                    //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                }
            });
        }
    },
    'blur .colAmountIncChange': function (event) {
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();
        var targetID = $(event.target).closest('tr').attr('id');
        if (!isNaN($(event.target).val())) {
            let inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        } else {
            let inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;

            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));


        }
        let $tblrows = $("#tblBillLine tbody tr");
        let $printrows = $(".bill_print tbody tr");

        let lineAmount = 0;
        let subGrandTotal = 0;
        let taxGrandTotal = 0;
        let taxGrandTotalPrint = 0;

        $tblrows.each(function (index) {
            var $tblrow = $(this);
            var amount = $tblrow.find(".colAmountIncChange").val() || "0";
            var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
            var taxrateamount = 0;
            if (taxcodeList) {
                for (var i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == taxcode) {
                        taxrateamount = taxcodeList[i].coderate.replace('%', "");
                    }
                }
            }

            let taxRateAmountCalc = (parseFloat(taxrateamount) + 100) / 100;
            var subTotal = (parseFloat(amount.replace(/[^0-9.-]+/g, "")) / (taxRateAmountCalc)) || 0;
            var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotal) || 0;
            $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
            if (!isNaN(subTotal)) {
                $tblrow.find('.colAmountExChange').val(utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2)));
                let totalAmountInc = (parseFloat(subTotal)) + (parseFloat(taxTotal)) || 0;
                $tblrow.find('.colAmountIncChange').val(utilityService.modifynegativeCurrencyFormat(totalAmountInc.toFixed(2)));
                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
            }

            if (!isNaN(taxTotal)) {
                taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
            }


            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

            }
        });

        if ($(".printID").val() == "") {
            $printrows.each(function (index) {
                var $printrow = $(this);
                var amount = $printrow.find("#lineAmount").text() || "0";
                var taxcode = $printrow.find("#lineTaxCode").text() || "E";

                var taxrateamount = 0;
                if (taxcodeList) {
                    for (var i = 0; i < taxcodeList.length; i++) {
                        if (taxcodeList[i].codename == taxcode) {
                            taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                        }
                    }
                }
                var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                $printrow.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                if (!isNaN(subTotal)) {
                    $printrow.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                    subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                    document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                }

                if (!isNaN(taxTotal)) {
                    taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                }
                if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                    let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                    document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                    //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                    document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                }
            });
        }



    },
    
    'click .lineAccountName, keydown .lineAccountName': function (event) {
        var $earch = $(event.currentTarget);
        var offset = $earch.offset();
        $('#edtAccountID').val('');
        $('#add-account-title').text('Add New Account');
        let suppliername = $('#edtSupplierName').val();
        let accountService = new AccountService();
        const accountTypeList = [];
        if (suppliername === '') {
            swal('Supplier has not been selected!', '', 'warning');
            event.preventDefault();
        } else {
            var accountDataName = $(event.target).val() || '';
            if (event.pageX > offset.left + $earch.width() - 10) { // X button 16px wide?
                $('#accountListModal').modal('toggle');
                var targetID = $(event.target).closest('tr').attr('id');
                $('#selectLineID').val(targetID);
                setTimeout(function () {
                    $('#tblAccount_filter .form-control-sm').focus();
                    $('#tblAccount_filter .form-control-sm').val('');
                    $('#tblAccount_filter .form-control-sm').trigger("input");

                    var datatable = $('#tblInventory').DataTable();
                    datatable.draw();
                    $('#tblAccount_filter .form-control-sm').trigger("input");

                }, 500);
            } else {
                if (accountDataName.replace(/\s/g, '') != '') {
                    //$('#edtAccountID').val($(event.target).text());

                    getVS1Data('TAccountVS1').then(function (dataObject) {
                        if (dataObject.length == 0) {
                            accountService.getOneAccountByName(accountDataName).then(function (data) {
                                let lineItems = [];
                                let lineItemObj = {};
                                let fullAccountTypeName = '';
                                let accBalance = '';
                                $('#add-account-title').text('Edit Account Details');
                                $('#edtAccountName').attr('readonly', true);
                                $('#sltAccountType').attr('readonly', true);
                                $('#sltAccountType').attr('disabled', 'disabled');
                                if (accountTypeList) {
                                    for (var h = 0; h < accountTypeList.length; h++) {

                                        if (data.taccountvs1[0].fields.AccountTypeName === accountTypeList[h].accounttypename) {

                                            fullAccountTypeName = accountTypeList[h].description || '';

                                        }
                                    }

                                }

                                $('#add-account-title').text('Edit Account Details');
                                $('#edtAccountName').attr('readonly', true);
                                $('#sltAccountType').attr('readonly', true);
                                $('#sltAccountType').attr('disabled', 'disabled');

                                var accountid = data.taccountvs1[0].fields.ID || '';
                                var accounttype = fullAccountTypeName || data.taccountvs1[0].fields.AccountTypeName;
                                var accountname = data.taccountvs1[0].fields.AccountName || '';
                                var accountno = data.taccountvs1[0].fields.AccountNumber || '';
                                var taxcode = data.taccountvs1[0].fields.TaxCode || '';
                                var accountdesc = data.taccountvs1[0].fields.Description || '';
                                var bankaccountname = data.taccountvs1[0].fields.BankAccountName || '';
                                var bankbsb = data.taccountvs1[0].fields.BSB || '';
                                var bankacountno = data.taccountvs1[0].fields.BankAccountNumber || '';

                                var swiftCode = data.taccountvs1[0].fields.Extra || '';
                                var routingNo = data.taccountvs1[0].fields.BankCode || '';

                                var showTrans = data.taccountvs1[0].fields.IsHeader || false;

                                var cardnumber = data.taccountvs1[0].fields.CarNumber || '';
                                var cardcvc = data.taccountvs1[0].fields.CVC || '';
                                var cardexpiry = data.taccountvs1[0].fields.ExpiryDate || '';

                                if ((accounttype === "BANK")) {
                                    $('.isBankAccount').removeClass('isNotBankAccount');
                                    $('.isCreditAccount').addClass('isNotCreditAccount');
                                } else if ((accounttype === "CCARD")) {
                                    $('.isCreditAccount').removeClass('isNotCreditAccount');
                                    $('.isBankAccount').addClass('isNotBankAccount');
                                } else {
                                    $('.isBankAccount').addClass('isNotBankAccount');
                                    $('.isCreditAccount').addClass('isNotCreditAccount');
                                }

                                $('#edtAccountID').val(accountid);
                                $('#sltAccountType').val(accounttype);
                                $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
                                $('#edtAccountName').val(accountname);
                                $('#edtAccountNo').val(accountno);
                                $('#sltTaxCode').val(taxcode);
                                $('#txaAccountDescription').val(accountdesc);
                                $('#edtBankAccountName').val(bankaccountname);
                                $('#edtBSB').val(bankbsb);
                                $('#edtBankAccountNo').val(bankacountno);
                                $('#swiftCode').val(swiftCode);
                                $('#routingNo').val(routingNo);
                                $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

                                $('#edtCardNumber').val(cardnumber);
                                $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
                                $('#edtCvc').val(cardcvc);

                                if (showTrans == 'true') {
                                    $('.showOnTransactions').prop('checked', true);
                                } else {
                                    $('.showOnTransactions').prop('checked', false);
                                }

                                setTimeout(function () {
                                    $('#addNewAccount').modal('show');
                                }, 500);

                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.taccountvs1;
                            var added = false;
                            let lineItems = [];
                            let lineItemObj = {};
                            let fullAccountTypeName = '';
                            let accBalance = '';
                            $('#add-account-title').text('Edit Account Details');
                            $('#edtAccountName').attr('readonly', true);
                            $('#sltAccountType').attr('readonly', true);
                            $('#sltAccountType').attr('disabled', 'disabled');
                            for (let a = 0; a < data.taccountvs1.length; a++) {

                                if ((data.taccountvs1[a].fields.AccountName) === accountDataName) {
                                    added = true;
                                    if (accountTypeList) {
                                        for (var h = 0; h < accountTypeList.length; h++) {

                                            if (data.taccountvs1[a].fields.AccountTypeName === accountTypeList[h].accounttypename) {

                                                fullAccountTypeName = accountTypeList[h].description || '';

                                            }
                                        }

                                    }



                                    var accountid = data.taccountvs1[a].fields.ID || '';
                                    var accounttype = fullAccountTypeName || data.taccountvs1[a].fields.AccountTypeName;
                                    var accountname = data.taccountvs1[a].fields.AccountName || '';
                                    var accountno = data.taccountvs1[a].fields.AccountNumber || '';
                                    var taxcode = data.taccountvs1[a].fields.TaxCode || '';
                                    var accountdesc = data.taccountvs1[a].fields.Description || '';
                                    var bankaccountname = data.taccountvs1[a].fields.BankAccountName || '';
                                    var bankbsb = data.taccountvs1[a].fields.BSB || '';
                                    var bankacountno = data.taccountvs1[a].fields.BankAccountNumber || '';

                                    var swiftCode = data.taccountvs1[a].fields.Extra || '';
                                    var routingNo = data.taccountvs1[a].BankCode || '';

                                    var showTrans = data.taccountvs1[a].fields.IsHeader || false;

                                    var cardnumber = data.taccountvs1[a].fields.CarNumber || '';
                                    var cardcvc = data.taccountvs1[a].fields.CVC || '';
                                    var cardexpiry = data.taccountvs1[a].fields.ExpiryDate || '';

                                    if ((accounttype === "BANK")) {
                                        $('.isBankAccount').removeClass('isNotBankAccount');
                                        $('.isCreditAccount').addClass('isNotCreditAccount');
                                    } else if ((accounttype === "CCARD")) {
                                        $('.isCreditAccount').removeClass('isNotCreditAccount');
                                        $('.isBankAccount').addClass('isNotBankAccount');
                                    } else {
                                        $('.isBankAccount').addClass('isNotBankAccount');
                                        $('.isCreditAccount').addClass('isNotCreditAccount');
                                    }

                                    $('#edtAccountID').val(accountid);
                                    $('#sltAccountType').val(accounttype);
                                    $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
                                    $('#edtAccountName').val(accountname);
                                    $('#edtAccountNo').val(accountno);
                                    $('#sltTaxCode').val(taxcode);
                                    $('#txaAccountDescription').val(accountdesc);
                                    $('#edtBankAccountName').val(bankaccountname);
                                    $('#edtBSB').val(bankbsb);
                                    $('#edtBankAccountNo').val(bankacountno);
                                    $('#swiftCode').val(swiftCode);
                                    $('#routingNo').val(routingNo);
                                    $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

                                    $('#edtCardNumber').val(cardnumber);
                                    $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
                                    $('#edtCvc').val(cardcvc);

                                    if (showTrans == 'true') {
                                        $('.showOnTransactions').prop('checked', true);
                                    } else {
                                        $('.showOnTransactions').prop('checked', false);
                                    }

                                    setTimeout(function () {
                                        $('#addNewAccount').modal('show');
                                    }, 500);

                                }
                            }
                            if (!added) {
                                accountService.getOneAccountByName(accountDataName).then(function (data) {
                                    let lineItems = [];
                                    let lineItemObj = {};
                                    let fullAccountTypeName = '';
                                    let accBalance = '';
                                    $('#add-account-title').text('Edit Account Details');
                                    $('#edtAccountName').attr('readonly', true);
                                    $('#sltAccountType').attr('readonly', true);
                                    $('#sltAccountType').attr('disabled', 'disabled');
                                    if (accountTypeList) {
                                        for (var h = 0; h < accountTypeList.length; h++) {

                                            if (data.taccountvs1[0].fields.AccountTypeName === accountTypeList[h].accounttypename) {

                                                fullAccountTypeName = accountTypeList[h].description || '';

                                            }
                                        }

                                    }

                                    var accountid = data.taccountvs1[0].fields.ID || '';
                                    var accounttype = fullAccountTypeName || data.taccountvs1[0].fields.AccountTypeName;
                                    var accountname = data.taccountvs1[0].fields.AccountName || '';
                                    var accountno = data.taccountvs1[0].fields.AccountNumber || '';
                                    var taxcode = data.taccountvs1[0].fields.TaxCode || '';
                                    var accountdesc = data.taccountvs1[0].fields.Description || '';
                                    var bankaccountname = data.taccountvs1[0].fields.BankAccountName || '';
                                    var bankbsb = data.taccountvs1[0].fields.BSB || '';
                                    var bankacountno = data.taccountvs1[0].fields.BankAccountNumber || '';

                                    var swiftCode = data.taccountvs1[0].fields.Extra || '';
                                    var routingNo = data.taccountvs1[0].fields.BankCode || '';

                                    var showTrans = data.taccountvs1[0].fields.IsHeader || false;

                                    var cardnumber = data.taccountvs1[0].fields.CarNumber || '';
                                    var cardcvc = data.taccountvs1[0].fields.CVC || '';
                                    var cardexpiry = data.taccountvs1[0].fields.ExpiryDate || '';

                                    if ((accounttype === "BANK")) {
                                        $('.isBankAccount').removeClass('isNotBankAccount');
                                        $('.isCreditAccount').addClass('isNotCreditAccount');
                                    } else if ((accounttype === "CCARD")) {
                                        $('.isCreditAccount').removeClass('isNotCreditAccount');
                                        $('.isBankAccount').addClass('isNotBankAccount');
                                    } else {
                                        $('.isBankAccount').addClass('isNotBankAccount');
                                        $('.isCreditAccount').addClass('isNotCreditAccount');
                                    }

                                    $('#edtAccountID').val(accountid);
                                    $('#sltAccountType').val(accounttype);
                                    $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
                                    $('#edtAccountName').val(accountname);
                                    $('#edtAccountNo').val(accountno);
                                    $('#sltTaxCode').val(taxcode);
                                    $('#txaAccountDescription').val(accountdesc);
                                    $('#edtBankAccountName').val(bankaccountname);
                                    $('#edtBSB').val(bankbsb);
                                    $('#edtBankAccountNo').val(bankacountno);
                                    $('#swiftCode').val(swiftCode);
                                    $('#routingNo').val(routingNo);
                                    $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

                                    $('#edtCardNumber').val(cardnumber);
                                    $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
                                    $('#edtCvc').val(cardcvc);

                                    if (showTrans == 'true') {
                                        $('.showOnTransactions').prop('checked', true);
                                    } else {
                                        $('.showOnTransactions').prop('checked', false);
                                    }

                                    setTimeout(function () {
                                        $('#addNewAccount').modal('show');
                                    }, 500);

                                }).catch(function (err) {
                                    LoadingOverlay.hide();
                                });
                            }

                        }
                    }).catch(function (err) {
                        accountService.getOneAccountByName(accountDataName).then(function (data) {
                            let lineItems = [];
                            let lineItemObj = {};
                            let fullAccountTypeName = '';
                            let accBalance = '';
                            $('#add-account-title').text('Edit Account Details');
                            $('#edtAccountName').attr('readonly', true);
                            $('#sltAccountType').attr('readonly', true);
                            $('#sltAccountType').attr('disabled', 'disabled');
                            if (accountTypeList) {
                                for (var h = 0; h < accountTypeList.length; h++) {

                                    if (data.taccountvs1[0].fields.AccountTypeName === accountTypeList[h].accounttypename) {

                                        fullAccountTypeName = accountTypeList[h].description || '';

                                    }
                                }

                            }

                            $('#add-account-title').text('Edit Account Details');
                            $('#edtAccountName').attr('readonly', true);
                            $('#sltAccountType').attr('readonly', true);
                            $('#sltAccountType').attr('disabled', 'disabled');

                            var accountid = data.taccountvs1[0].fields.ID || '';
                            var accounttype = fullAccountTypeName || data.taccountvs1[0].fields.AccountTypeName;
                            var accountname = data.taccountvs1[0].fields.AccountName || '';
                            var accountno = data.taccountvs1[0].fields.AccountNumber || '';
                            var taxcode = data.taccountvs1[0].fields.TaxCode || '';
                            var accountdesc = data.taccountvs1[0].fields.Description || '';
                            var bankaccountname = data.taccountvs1[0].fields.BankAccountName || '';
                            var bankbsb = data.taccountvs1[0].fields.BSB || '';
                            var bankacountno = data.taccountvs1[0].fields.BankAccountNumber || '';

                            var swiftCode = data.taccountvs1[0].fields.Extra || '';
                            var routingNo = data.taccountvs1[0].fields.BankCode || '';

                            var showTrans = data.taccountvs1[0].fields.IsHeader || false;

                            var cardnumber = data.taccountvs1[0].fields.CarNumber || '';
                            var cardcvc = data.taccountvs1[0].fields.CVC || '';
                            var cardexpiry = data.taccountvs1[0].fields.ExpiryDate || '';

                            if ((accounttype === "BANK")) {
                                $('.isBankAccount').removeClass('isNotBankAccount');
                                $('.isCreditAccount').addClass('isNotCreditAccount');
                            } else if ((accounttype === "CCARD")) {
                                $('.isCreditAccount').removeClass('isNotCreditAccount');
                                $('.isBankAccount').addClass('isNotBankAccount');
                            } else {
                                $('.isBankAccount').addClass('isNotBankAccount');
                                $('.isCreditAccount').addClass('isNotCreditAccount');
                            }

                            $('#edtAccountID').val(accountid);
                            $('#sltAccountType').val(accounttype);
                            $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
                            $('#edtAccountName').val(accountname);
                            $('#edtAccountNo').val(accountno);
                            $('#sltTaxCode').val(taxcode);
                            $('#txaAccountDescription').val(accountdesc);
                            $('#edtBankAccountName').val(bankaccountname);
                            $('#edtBSB').val(bankbsb);
                            $('#edtBankAccountNo').val(bankacountno);
                            $('#swiftCode').val(swiftCode);
                            $('#routingNo').val(routingNo);
                            $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

                            $('#edtCardNumber').val(cardnumber);
                            $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
                            $('#edtCvc').val(cardcvc);

                            if (showTrans == 'true') {
                                $('.showOnTransactions').prop('checked', true);
                            } else {
                                $('.showOnTransactions').prop('checked', false);
                            }

                            setTimeout(function () {
                                $('#addNewAccount').modal('show');
                            }, 500);

                        }).catch(function (err) {
                            LoadingOverlay.hide();
                        });

                    });
                    $('#addAccountModal').modal('toggle');

                } else {
                    $('#accountListModal').modal('toggle');
                    var targetID = $(event.target).closest('tr').attr('id');
                    $('#selectLineID').val(targetID);
                    setTimeout(function () {
                        $('#tblAccount_filter .form-control-sm').focus();
                        $('#tblAccount_filter .form-control-sm').val('');
                        $('#tblAccount_filter .form-control-sm').trigger("input");

                        var datatable = $('#tblInventory').DataTable();
                        datatable.draw();
                        $('#tblAccount_filter .form-control-sm').trigger("input");

                    }, 500);
                }

            }
        }
    },
    'click #accountListModal #refreshpagelist': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1PurchaseAccountList', '');
        Meteor._reload.reload();
        //templateObject.getAllProducts();
    },
    
    'click .lineCustomerJob, keydown .lineCustomerJob': function (event) {
        var $earch = $(event.currentTarget);
        var offset = $earch.offset();
        var targetID = $(event.target).closest('tr').attr('id');
        $('#customerSelectLineID').val(targetID);
        $('#edtCustomerPOPID').val('');
        $('#add-customer-title').text('Add New Customer');
        var customerDataName = $(event.target).val() || '';
        if (event.pageX > offset.left + $earch.width() - 10) { // X button 16px wide?
            $('#customerListModal').modal('toggle');
            var targetID = $(event.target).closest('tr').attr('id');
            $('#customerSelectLineID').val(targetID);
            setTimeout(function () {
                $('#tblCustomerlist_filter .form-control-sm').focus();
                $('#tblCustomerlist_filter .form-control-sm').val('');
                $('#tblCustomerlist_filter .form-control-sm').trigger("input");

                var datatable = $('#tblCustomerlist').DataTable();
                datatable.draw();
                $('#tblCustomerlist_filter .form-control-sm').trigger("input");

            }, 500);
        } else {
            if (customerDataName.replace(/\s/g, '') != '') {

                $('#edtCustomerPOPID').val('');
                getVS1Data('TCustomerVS1').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
                            LoadingOverlay.hide();
                            let lineItems = [];
                            $('#add-customer-title').text('Edit Customer');
                            let popCustomerID = data.tcustomer[0].fields.ID || '';
                            let popCustomerName = data.tcustomer[0].fields.ClientName || '';
                            let popCustomerEmail = data.tcustomer[0].fields.Email || '';
                            let popCustomerTitle = data.tcustomer[0].fields.Title || '';
                            let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
                            let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
                            let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
                            let popCustomertfn = '' || '';
                            let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
                            let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
                            let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
                            let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
                            let popCustomerURL = data.tcustomer[0].fields.URL || '';
                            let popCustomerStreet = data.tcustomer[0].fields.Street || '';
                            let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
                            let popCustomerState = data.tcustomer[0].fields.State || '';
                            let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
                            let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
                            let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
                            let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
                            let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
                            let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
                            let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
                            let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
                            let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
                            let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
                            let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
                            let popCustomernotes = data.tcustomer[0].fields.Notes || '';
                            let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
                            let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
                            let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
                            let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
                            let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
                            let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
                            let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
                            let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
                            let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
                            let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
                            //$('#edtCustomerCompany').attr('readonly', true);
                            $('#edtCustomerCompany').val(popCustomerName);
                            $('#edtCustomerPOPID').val(popCustomerID);
                            $('#edtCustomerPOPEmail').val(popCustomerEmail);
                            $('#edtTitle').val(popCustomerTitle);
                            $('#edtFirstName').val(popCustomerFirstName);
                            $('#edtMiddleName').val(popCustomerMiddleName);
                            $('#edtLastName').val(popCustomerLastName);
                            $('#edtCustomerPhone').val(popCustomerPhone);
                            $('#edtCustomerMobile').val(popCustomerMobile);
                            $('#edtCustomerFax').val(popCustomerFaxnumber);
                            $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                            $('#edtCustomerWebsite').val(popCustomerURL);
                            $('#edtCustomerShippingAddress').val(popCustomerStreet);
                            $('#edtCustomerShippingCity').val(popCustomerStreet2);
                            $('#edtCustomerShippingState').val(popCustomerState);
                            $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                            $('#sedtCountry').val(popCustomerCountry);
                            $('#txaNotes').val(popCustomernotes);
                            $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                            $('#sltTermsPOP').val(popCustomerterms);
                            $('#sltCustomerType').val(popCustomerType);
                            $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                            $('#edtCustomeField1').val(popCustomercustfield1);
                            $('#edtCustomeField2').val(popCustomercustfield2);
                            $('#edtCustomeField3').val(popCustomercustfield3);
                            $('#edtCustomeField4').val(popCustomercustfield4);

                            $('#sltTaxCode').val(popCustomerTaxCode);

                            if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
                                (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
                                (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
                                $('#chkSameAsShipping2').attr("checked", "checked");
                            }

                            if (data.tcustomer[0].fields.IsSupplier == true) {
                                // $('#isformcontractor')
                                $('#chkSameAsSupplier').attr("checked", "checked");
                            } else {
                                $('#chkSameAsSupplier').removeAttr("checked");
                            }

                            setTimeout(function () {
                                $('#addCustomerModal').modal('show');
                            }, 200);
                        }).catch(function (err) {
                            LoadingOverlay.hide();
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tcustomervs1;

                        var added = false;
                        for (let i = 0; i < data.tcustomervs1.length; i++) {
                            if (data.tcustomervs1[i].fields.ClientName === customerDataName) {
                                let lineItems = [];
                                added = true;
                                LoadingOverlay.hide();
                                $('#add-customer-title').text('Edit Customer');
                                let popCustomerID = data.tcustomervs1[i].fields.ID || '';
                                let popCustomerName = data.tcustomervs1[i].fields.ClientName || '';
                                let popCustomerEmail = data.tcustomervs1[i].fields.Email || '';
                                let popCustomerTitle = data.tcustomervs1[i].fields.Title || '';
                                let popCustomerFirstName = data.tcustomervs1[i].fields.FirstName || '';
                                let popCustomerMiddleName = data.tcustomervs1[i].fields.CUSTFLD10 || '';
                                let popCustomerLastName = data.tcustomervs1[i].fields.LastName || '';
                                let popCustomertfn = '' || '';
                                let popCustomerPhone = data.tcustomervs1[i].fields.Phone || '';
                                let popCustomerMobile = data.tcustomervs1[i].fields.Mobile || '';
                                let popCustomerFaxnumber = data.tcustomervs1[i].fields.Faxnumber || '';
                                let popCustomerSkypeName = data.tcustomervs1[i].fields.SkypeName || '';
                                let popCustomerURL = data.tcustomervs1[i].fields.URL || '';
                                let popCustomerStreet = data.tcustomervs1[i].fields.Street || '';
                                let popCustomerStreet2 = data.tcustomervs1[i].fields.Street2 || '';
                                let popCustomerState = data.tcustomervs1[i].fields.State || '';
                                let popCustomerPostcode = data.tcustomervs1[i].fields.Postcode || '';
                                let popCustomerCountry = data.tcustomervs1[i].fields.Country || LoggedCountry;
                                let popCustomerbillingaddress = data.tcustomervs1[i].fields.BillStreet || '';
                                let popCustomerbcity = data.tcustomervs1[i].fields.BillStreet2 || '';
                                let popCustomerbstate = data.tcustomervs1[i].fields.BillState || '';
                                let popCustomerbpostalcode = data.tcustomervs1[i].fields.BillPostcode || '';
                                let popCustomerbcountry = data.tcustomervs1[i].fields.Billcountry || LoggedCountry;
                                let popCustomercustfield1 = data.tcustomervs1[i].fields.CUSTFLD1 || '';
                                let popCustomercustfield2 = data.tcustomervs1[i].fields.CUSTFLD2 || '';
                                let popCustomercustfield3 = data.tcustomervs1[i].fields.CUSTFLD3 || '';
                                let popCustomercustfield4 = data.tcustomervs1[i].fields.CUSTFLD4 || '';
                                let popCustomernotes = data.tcustomervs1[i].fields.Notes || '';
                                let popCustomerpreferedpayment = data.tcustomervs1[i].fields.PaymentMethodName || '';
                                let popCustomerterms = data.tcustomervs1[i].fields.TermsName || '';
                                let popCustomerdeliverymethod = data.tcustomervs1[i].fields.ShippingMethodName || '';
                                let popCustomeraccountnumber = data.tcustomervs1[i].fields.ClientNo || '';
                                let popCustomerisContractor = data.tcustomervs1[i].fields.Contractor || false;
                                let popCustomerissupplier = data.tcustomervs1[i].fields.IsSupplier || false;
                                let popCustomeriscustomer = data.tcustomervs1[i].fields.IsCustomer || false;
                                let popCustomerTaxCode = data.tcustomervs1[i].fields.TaxCodeName || '';
                                let popCustomerDiscount = data.tcustomervs1[i].fields.Discount || 0;
                                let popCustomerType = data.tcustomervs1[i].fields.ClientTypeName || '';
                                //$('#edtCustomerCompany').attr('readonly', true);
                                $('#edtCustomerCompany').val(popCustomerName);
                                $('#edtCustomerPOPID').val(popCustomerID);
                                $('#edtCustomerPOPEmail').val(popCustomerEmail);
                                $('#edtTitle').val(popCustomerTitle);
                                $('#edtFirstName').val(popCustomerFirstName);
                                $('#edtMiddleName').val(popCustomerMiddleName);
                                $('#edtLastName').val(popCustomerLastName);
                                $('#edtCustomerPhone').val(popCustomerPhone);
                                $('#edtCustomerMobile').val(popCustomerMobile);
                                $('#edtCustomerFax').val(popCustomerFaxnumber);
                                $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                                $('#edtCustomerWebsite').val(popCustomerURL);
                                $('#edtCustomerShippingAddress').val(popCustomerStreet);
                                $('#edtCustomerShippingCity').val(popCustomerStreet2);
                                $('#edtCustomerShippingState').val(popCustomerState);
                                $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                                $('#sedtCountry').val(popCustomerCountry);
                                $('#txaNotes').val(popCustomernotes);
                                $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                                $('#sltTermsPOP').val(popCustomerterms);
                                $('#sltCustomerType').val(popCustomerType);
                                $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                                $('#edtCustomeField1').val(popCustomercustfield1);
                                $('#edtCustomeField2').val(popCustomercustfield2);
                                $('#edtCustomeField3').val(popCustomercustfield3);
                                $('#edtCustomeField4').val(popCustomercustfield4);

                                $('#sltTaxCode').val(popCustomerTaxCode);

                                if ((data.tcustomervs1[i].fields.Street == data.tcustomervs1[i].fields.BillStreet) && (data.tcustomervs1[i].fields.Street2 == data.tcustomervs1[i].fields.BillStreet2) &&
                                    (data.tcustomervs1[i].fields.State == data.tcustomervs1[i].fields.BillState) && (data.tcustomervs1[i].fields.Postcode == data.tcustomervs1[i].fields.BillPostcode) &&
                                    (data.tcustomervs1[i].fields.Country == data.tcustomervs1[i].fields.Billcountry)) {
                                    $('#chkSameAsShipping2').attr("checked", "checked");
                                }

                                if (data.tcustomervs1[i].fields.IsSupplier == true) {
                                    // $('#isformcontractor')
                                    $('#chkSameAsSupplier').attr("checked", "checked");
                                } else {
                                    $('#chkSameAsSupplier').removeAttr("checked");
                                }

                                setTimeout(function () {
                                    $('#addCustomerModal').modal('show');
                                }, 200);

                            }
                        }
                        if (!added) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
                                LoadingOverlay.hide();
                                let lineItems = [];
                                $('#add-customer-title').text('Edit Customer');
                                let popCustomerID = data.tcustomer[0].fields.ID || '';
                                let popCustomerName = data.tcustomer[0].fields.ClientName || '';
                                let popCustomerEmail = data.tcustomer[0].fields.Email || '';
                                let popCustomerTitle = data.tcustomer[0].fields.Title || '';
                                let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
                                let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
                                let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
                                let popCustomertfn = '' || '';
                                let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
                                let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
                                let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
                                let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
                                let popCustomerURL = data.tcustomer[0].fields.URL || '';
                                let popCustomerStreet = data.tcustomer[0].fields.Street || '';
                                let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
                                let popCustomerState = data.tcustomer[0].fields.State || '';
                                let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
                                let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
                                let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
                                let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
                                let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
                                let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
                                let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
                                let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
                                let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
                                let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
                                let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
                                let popCustomernotes = data.tcustomer[0].fields.Notes || '';
                                let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
                                let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
                                let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
                                let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
                                let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
                                let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
                                let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
                                let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
                                let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
                                let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
                                //$('#edtCustomerCompany').attr('readonly', true);
                                $('#edtCustomerCompany').val(popCustomerName);
                                $('#edtCustomerPOPID').val(popCustomerID);
                                $('#edtCustomerPOPEmail').val(popCustomerEmail);
                                $('#edtTitle').val(popCustomerTitle);
                                $('#edtFirstName').val(popCustomerFirstName);
                                $('#edtMiddleName').val(popCustomerMiddleName);
                                $('#edtLastName').val(popCustomerLastName);
                                $('#edtCustomerPhone').val(popCustomerPhone);
                                $('#edtCustomerMobile').val(popCustomerMobile);
                                $('#edtCustomerFax').val(popCustomerFaxnumber);
                                $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                                $('#edtCustomerWebsite').val(popCustomerURL);
                                $('#edtCustomerShippingAddress').val(popCustomerStreet);
                                $('#edtCustomerShippingCity').val(popCustomerStreet2);
                                $('#edtCustomerShippingState').val(popCustomerState);
                                $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                                $('#sedtCountry').val(popCustomerCountry);
                                $('#txaNotes').val(popCustomernotes);
                                $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                                $('#sltTermsPOP').val(popCustomerterms);
                                $('#sltCustomerType').val(popCustomerType);
                                $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                                $('#edtCustomeField1').val(popCustomercustfield1);
                                $('#edtCustomeField2').val(popCustomercustfield2);
                                $('#edtCustomeField3').val(popCustomercustfield3);
                                $('#edtCustomeField4').val(popCustomercustfield4);

                                $('#sltTaxCode').val(popCustomerTaxCode);

                                if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
                                    (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
                                    (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
                                    $('#chkSameAsShipping2').attr("checked", "checked");
                                }

                                if (data.tcustomer[0].fields.IsSupplier == true) {
                                    // $('#isformcontractor')
                                    $('#chkSameAsSupplier').attr("checked", "checked");
                                } else {
                                    $('#chkSameAsSupplier').removeAttr("checked");
                                }

                                setTimeout(function () {
                                    $('#addCustomerModal').modal('show');
                                }, 200);
                            }).catch(function (err) {
                                LoadingOverlay.hide();
                            });
                        }
                    }
                }).catch(function (err) {
                    sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
                        LoadingOverlay.hide();
                        let lineItems = [];
                        $('#add-customer-title').text('Edit Customer');
                        let popCustomerID = data.tcustomer[0].fields.ID || '';
                        let popCustomerName = data.tcustomer[0].fields.ClientName || '';
                        let popCustomerEmail = data.tcustomer[0].fields.Email || '';
                        let popCustomerTitle = data.tcustomer[0].fields.Title || '';
                        let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
                        let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
                        let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
                        let popCustomertfn = '' || '';
                        let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
                        let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
                        let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
                        let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
                        let popCustomerURL = data.tcustomer[0].fields.URL || '';
                        let popCustomerStreet = data.tcustomer[0].fields.Street || '';
                        let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
                        let popCustomerState = data.tcustomer[0].fields.State || '';
                        let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
                        let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
                        let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
                        let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
                        let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
                        let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
                        let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
                        let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
                        let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
                        let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
                        let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
                        let popCustomernotes = data.tcustomer[0].fields.Notes || '';
                        let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
                        let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
                        let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
                        let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
                        let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
                        let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
                        let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
                        let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
                        let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
                        let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
                        //$('#edtCustomerCompany').attr('readonly', true);
                        $('#edtCustomerCompany').val(popCustomerName);
                        $('#edtCustomerPOPID').val(popCustomerID);
                        $('#edtCustomerPOPEmail').val(popCustomerEmail);
                        $('#edtTitle').val(popCustomerTitle);
                        $('#edtFirstName').val(popCustomerFirstName);
                        $('#edtMiddleName').val(popCustomerMiddleName);
                        $('#edtLastName').val(popCustomerLastName);
                        $('#edtCustomerPhone').val(popCustomerPhone);
                        $('#edtCustomerMobile').val(popCustomerMobile);
                        $('#edtCustomerFax').val(popCustomerFaxnumber);
                        $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                        $('#edtCustomerWebsite').val(popCustomerURL);
                        $('#edtCustomerShippingAddress').val(popCustomerStreet);
                        $('#edtCustomerShippingCity').val(popCustomerStreet2);
                        $('#edtCustomerShippingState').val(popCustomerState);
                        $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                        $('#sedtCountry').val(popCustomerCountry);
                        $('#txaNotes').val(popCustomernotes);
                        $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                        $('#sltTermsPOP').val(popCustomerterms);
                        $('#sltCustomerType').val(popCustomerType);
                        $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                        $('#edtCustomeField1').val(popCustomercustfield1);
                        $('#edtCustomeField2').val(popCustomercustfield2);
                        $('#edtCustomeField3').val(popCustomercustfield3);
                        $('#edtCustomeField4').val(popCustomercustfield4);

                        $('#sltTaxCode').val(popCustomerTaxCode);

                        if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
                            (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
                            (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
                            $('#chkSameAsShipping2').attr("checked", "checked");
                        }

                        if (data.tcustomer[0].fields.IsSupplier == true) {
                            // $('#isformcontractor')
                            $('#chkSameAsSupplier').attr("checked", "checked");
                        } else {
                            $('#chkSameAsSupplier').removeAttr("checked");
                        }

                        setTimeout(function () {
                            $('#addCustomerModal').modal('show');
                        }, 200);
                    }).catch(function (err) {
                        LoadingOverlay.hide();
                    });
                });

            } else {
                $('#customerListModal').modal('toggle');
                var targetID = $(event.target).closest('tr').attr('id');
                $('#customerSelectLineID').val(targetID);
                setTimeout(function () {
                    $('#tblCustomerlist_filtertblCustomerlist_filter .form-control-sm').focus();
                    $('#tblCustomerlist_filter .form-control-sm').val('');
                    $('#tblCustomerlist_filter .form-control-sm').trigger("input");

                    var datatable = $('#tblTaxRate').DataTable();
                    datatable.draw();
                    $('#tblCustomerlist_filter .form-control-sm').trigger("input");

                }, 500);
            }

        }
    },

    'keydown .lineQty, keydown .lineUnitPrice, keydown .lineAmount': function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||

            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||

            (event.keyCode >= 35 && event.keyCode <= 40)) {

            return;
        }

        if (event.shiftKey == true) {
            event.preventDefault();
        }

        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189 || event.keyCode == 109) { } else {
            event.preventDefault();
        }
    },
    'click .btnRemove': async function (event) {
        let taxcodeList = templateObject.taxraterecords.get();
        let utilityService = new UtilityService();
        var targetID = $(event.target).closest('tr').attr('id');
        $('#selectDeleteLineID').val(targetID);
        if (targetID != undefined) {
            times++;
            if (times == 1) {
                $('#deleteLineModal').modal('toggle');
            } else {
                if ($('#tblBillLine tbody>tr').length > 1) {
                    this.click;
                    $(event.target).closest('tr').remove();
                    $(".bill_print #" + targetID).remove();
                    event.preventDefault();
                    let $tblrows = $("#tblBillLine tbody tr");
                    let $printrows = $(".bill_print tbody tr");


                    let lineAmount = 0;
                    let subGrandTotal = 0;
                    let taxGrandTotal = 0;
                    let taxGrandTotalPrint = 0;

                    $tblrows.each(function (index) {
                        var $tblrow = $(this);
                        var amount = $tblrow.find(".colAmountExChange").val() || 0;
                        var taxcode = $tblrow.find(".lineTaxCode").val() || 0;

                        var taxrateamount = 0;
                        if (taxcodeList) {
                            for (var i = 0; i < taxcodeList.length; i++) {
                                if (taxcodeList[i].codename == taxcode) {
                                    taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100;
                                }
                            }
                        }


                        var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                        var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                        $tblrow.find('.lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal));
                        if (!isNaN(subTotal)) {
                            subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                            document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
                        }

                        if (!isNaN(taxTotal)) {
                            taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
                            document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
                        }

                        if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                            let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                            document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                            document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
                            document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

                        }
                    });

                    if ($(".printID").val() == "") {
                        $printrows.each(function (index) {
                            var $printrows = $(this);
                            var amount = $printrows.find("#lineAmount").text() || "0";
                            var taxcode = $printrows.find("#lineTaxCode").text() || 0;

                            var taxrateamount = 0;
                            if (taxcodeList) {
                                for (var i = 0; i < taxcodeList.length; i++) {
                                    if (taxcodeList[i].codename == taxcode) {
                                        taxrateamount = taxcodeList[i].coderate.replace('%', "") / 100 || 0;
                                    }
                                }
                            }


                            var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
                            var taxTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
                            $printrows.find('#lineTaxAmount').text(utilityService.modifynegativeCurrencyFormat(taxTotal))

                            if (!isNaN(subTotal)) {
                                $printrows.find('#lineAmt').text(utilityService.modifynegativeCurrencyFormat(subTotal));
                                subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
                                document.getElementById("subtotal_totalPrint").innerHTML = $('#subtotal_total').text();
                            }

                            if (!isNaN(taxTotal)) {
                                taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
                            }
                            if (!isNaN(subGrandTotal) && (!isNaN(taxGrandTotal))) {
                                let GrandTotal = (parseFloat(subGrandTotal)) + (parseFloat(taxGrandTotal));
                                document.getElementById("grandTotalPrint").innerHTML = $('#grandTotal').text();
                                //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
                                document.getElementById("totalBalanceDuePrint").innerHTML = $('#totalBalanceDue').text();

                            }
                        });
                    }
                    return false;

                } else {
                    $('#deleteLineModal').modal('toggle');
                }
            }
        } else {
            if (templateObject.hasFollow.get()) $("#footerDeleteModal2").modal("toggle");
            else $("#footerDeleteModal1").modal("toggle");
        }
    },
    
    'click .btnSaveSettings': function (event) {
        playSaveAudio();
        setTimeout(function () {
            $('#myModal4').modal('toggle');
        }, delayTimeAfterSound);
    },
    
    'click .chkAccountName': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colAccountName').addClass('showColumn');
            $('.colAccountName').removeClass('hiddenColumn');
        } else {
            $('.colAccountName').addClass('hiddenColumn');
            $('.colAccountName').removeClass('showColumn');
        }
    },
    'click .chkMemo': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colMemo').addClass('showColumn');
            $('.colMemo').removeClass('hiddenColumn');
        } else {
            $('.colMemo').addClass('hiddenColumn');
            $('.colMemo').removeClass('showColumn');
        }
    },
    'click .chkCustomerJob': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colCustomerJob').addClass('showColumn');
            $('.colCustomerJob').removeClass('hiddenColumn');
        } else {
            $('.colCustomerJob').addClass('hiddenColumn');
            $('.colCustomerJob').removeClass('showColumn');
        }
    },
    'click .chkCustomField1': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colCustomField1').addClass('showColumn');
            $('.colCustomField1').removeClass('hiddenColumn');
        } else {
            $('.colCustomField1').addClass('hiddenColumn');
            $('.colCustomField1').removeClass('showColumn');
        }
    },
    'click .chkCustomField2': function (event) {
        if ($(event.target).is(':checked')) {
            $('.colCustomField2').addClass('showColumn');
            $('.colCustomField2').removeClass('hiddenColumn');
        } else {
            $('.colCustomField2').addClass('hiddenColumn');
            $('.colCustomField2').removeClass('showColumn');
        }
    },
    
    'change .rngRangeAccountName': function (event) {

        let range = $(event.target).val();
        $(".spWidthAccountName").html(range);
        $('.colAccountName').css('width', range);

    },
    'change .rngRangeMemo': function (event) {

        let range = $(event.target).val();
        $(".spWidthMemo").html(range);
        $('.colMemo').css('width', range);

    },
    
    'change .rngRangeCustomField1': function (event) {

        let range = $(event.target).val();
        $(".spWidthCustomField1").html(range);
        $('.colCustomField1').css('width', range);

    },
    'change .rngRangeCustomField2': function (event) {

        let range = $(event.target).val();
        $(".spWidthCustomField2").html(range);
        $('.colCustomField2').css('width', range);

    },
    'change .rngRangeCustomerJob': function (event) {

        let range = $(event.target).val();
        $(".spWidthCustomerJob").html(range);
        $('.colCustomerJob').css('width', range);

    },
    
    'click #btnPayment': function () {
        var currenturl = window.location.href;
        var getcurrent_id = currenturl.split('?id=');
        var currentId = getcurrent_id[getcurrent_id.length - 1];

        if (getcurrent_id[1]) {
            window.open('/supplierpaymentcard?billid=' + currentId, '_self');
        } else {
            let suppliername = $('#edtSupplierName');
            let purchaseService = new PurchaseBoardService();
            let termname = $('.transheader > #sltTerms_fromtransaction').val() || '';
            if (termname === '') {
                swal('Terms has not been selected!', '', 'warning');
                event.preventDefault();
                return false;
            }
            if (suppliername.val() === '') {
                swal('Supplier has not been selected!', '', 'warning');
                e.preventDefault();
            } else {

                $('.fullScreenSpin').css('display', 'inline-block');
                var splashLineArray = new Array();
                let lineItemsForm = [];
                let lineItemObjForm = {};
                $('#tblBillLine > tbody > tr').each(function () {
                    var lineID = this.id;
                    let tdaccount = $('#' + lineID + " .lineAccountName").val();
                    let tddmemo = $('#' + lineID + " .lineMemo").text();
                    let tdamount = $('#' + lineID + " .lineAmount").val();
                    let tdCustomerJob = $('#' + lineID + " .lineCustomerJob").val();
                    let tdtaxrate = $('#' + lineID + " .lineTaxRate").text();
                    let tdtaxCode = $('#' + lineID + " .lineTaxCode").val() || "NT";

                    if (tdaccount != "") {

                        lineItemObjForm = {
                            type: "TBillLine",
                            fields: {
                                AccountName: tdaccount || '',
                                ProductDescription: tddmemo || '',
                                CustomerJob: tdCustomerJob || '',


                                LineCost: Number(tdamount.replace(/[^0-9.-]+/g, "")) || 0,
                                LineTaxCode: tdtaxCode || '',
                                LineClassName: $('.transheader > #sltDept_fromtransactionheader').val() || defaultDept
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

                let supplier = $('#edtSupplierName').val();
                let supplierEmail = $('#edtSupplierEmail').val();
                let billingAddress = $('#txabillingAddress').val();


                var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
                var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

                let saleDate = saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate();
                let dueDate = duedateTime.getFullYear() + "-" + (duedateTime.getMonth() + 1) + "-" + duedateTime.getDate();

                let poNumber = $('#ponumber').val();
                let reference = $('#edtRef').val();

                let departement = $('.transheader > #sltShipVia_fromtransactionheader').val();
                let shippingAddress = $('#txaShipingInfo').val();
                let comments = $('#txaComment').val();
                let pickingInfrmation = $('#txapickmemo').val();
                let billTotal = $('#grandTotal').text();

                let saleCustField1 = $('#edtSaleCustField1').val();
                let saleCustField2 = $('#edtSaleCustField2').val();
                var url = FlowRouter.current().path;
                var getso_id = url.split('?id=');
                var currentBill = getso_id[getso_id.length - 1];
                let uploadedItems = templateObject.uploadedFiles.get();
                var currencyCode = $(".transheader > .sltCurrency").val() || CountryAbbr;
                let ForeignExchangeRate = $('#exchange_rate').val() || 0;
                var objDetails = '';
                if (getso_id[1]) {
                    currentBill = parseInt(currentBill);
                    objDetails = {
                        type: "TBillEx",
                        fields: {
                            ID: currentBill,
                            SupplierName: supplier,
                            // ForeignExchangeCode: currencyCode,
                            // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                            ...foreignCurrencyFields,
                            Lines: splashLineArray,
                            OrderTo: billingAddress,
                            OrderDate: saleDate,
                            DueDate: dueDate,
                            SupplierInvoiceNumber: poNumber,
                            ConNote: reference,
                            TermsName: termname,
                            Shipping: departement,
                            ShipTo: shippingAddress,
                            Comments: comments,
                            Deleted: false,


                            SalesComments: pickingInfrmation,
                            Attachments: uploadedItems,
                            OrderStatus: $('.transheader > #sltStatus_fromtransactionheader').val(),
                            BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
                            TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
                        }
                    };
                } else {
                    objDetails = {
                        type: "TBillEx",
                        fields: {
                            SupplierName: supplier,
                            // ForeignExchangeCode: currencyCode,
                            // ForeignExchangeRate: parseFloat(ForeignExchangeRate),
                            ...foreignCurrencyFields,
                            Lines: splashLineArray,
                            OrderTo: billingAddress,
                            OrderDate: saleDate,
                            Deleted: false,

                            SupplierInvoiceNumber: poNumber,
                            ConNote: reference,
                            TermsName: termname,
                            Shipping: departement,
                            ShipTo: shippingAddress,
                            Comments: comments,


                            SalesComments: pickingInfrmation,
                            Attachments: uploadedItems,
                            OrderStatus: $('.transheader > #sltStatus_fromtransactionheader').val(),
                            BillTotal: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0,
                            TotalAmountInc: Number(billTotal.replace(/[^0-9.-]+/g, "")) || 0
                        }
                    };
                }

                if (splashLineArray.length > 0) {

                } else {
                    // swal('Account name has not been selected!', '', 'warning');
                    // LoadingOverlay.hide();
                    // event.preventDefault();
                    // return false;
                }

                purchaseService.saveBillEx(objDetails).then(function (objDetails) {
                    var supplierID = $('#edtSupplierEmail').attr('supplierid');
                    if (supplierID !== " ") {
                        let supplierEmailData = {
                            type: "TSupplier",
                            fields: {
                                ID: supplierID,
                                Email: supplierEmail
                            }
                        }
                        purchaseService.saveSupplierEmail(supplierEmailData).then(function (supplierEmailData) {

                        });
                    };
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
                                PrefName: 'billcard'
                            });
                            if (checkPrefDetails) {
                                CloudPreference.update({
                                    _id: checkPrefDetails._id
                                }, {
                                    $set: {
                                        username: clientUsername,
                                        useremail: clientEmail,
                                        PrefGroup: 'purchaseform',
                                        PrefName: 'billcard',
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

                                    } else {


                                    }
                                });
                            } else {
                                CloudPreference.insert({
                                    userid: clientID,
                                    username: clientUsername,
                                    useremail: clientEmail,
                                    PrefGroup: 'purchaseform',
                                    PrefName: 'billcard',
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

                                    } else {


                                    }
                                });
                            }
                        }
                    }

                    sideBarService.getAllBillExList(initialDataLoad, 0).then(function (dataUpdate) {
                        addVS1Data('TBillEx', JSON.stringify(dataUpdate)).then(function (datareturn) {
                            window.open('/supplierpaymentcard?billid=' + linesave, '_self');
                        }).catch(function (err) {
                            window.open('/supplierpaymentcard?billid=' + linesave, '_self');
                        });
                    }).catch(function (err) {
                        window.open('/supplierpaymentcard?billid=' + linesave, '_self');
                    });
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

                    LoadingOverlay.hide();
                });
            }


        }

    },
    
    'click #btnViewPayment': async function () {
        let purchaseService = new PurchaseBoardService();
        $('.fullScreenSpin').css('display', 'inline-block');
        let paymentID = "";
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentBill = getso_id[getso_id.length - 1];
        let paymentData = await purchaseService.getCheckPaymentLineByTransID(currentBill) || '';

        if (paymentData) {
            for (let x = 0; x < paymentData.tsupplierpaymentline.length; x++) {
                if (paymentData.tsupplierpaymentline.length > 1) {
                    paymentID = paymentData.tsupplierpaymentline[x].fields.Payment_ID;
                    window.open('/supplierpaymentcard?id=' + paymentID, '_self');
                } else {
                    paymentID = paymentData.tsupplierpaymentline[0].fields.Payment_ID;
                    window.open('/supplierpaymentcard?id=' + paymentID, '_self');
                }
            }

        } else {
            LoadingOverlay.hide();
        }

    },
    'click .btnTransactionPaid': async function () {
        let purchaseService = new PurchaseBoardService();
        $('.fullScreenSpin').css('display', 'inline-block');
        let selectedSupplierPaymentID = [];
        let paymentID = "";
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentBill = getso_id[getso_id.length - 1];
        let suppliername = $('#edtSupplierName').val() || '';
        let paymentData = await purchaseService.getCheckPaymentLineByTransID(currentBill) || '';
        if (paymentData) {
            for (let x = 0; x < paymentData.tsupplierpaymentline.length; x++) {
                if (paymentData.tsupplierpaymentline.length > 1) {
                    paymentID = paymentData.tsupplierpaymentline[x].fields.Payment_ID;
                    selectedSupplierPaymentID.push(paymentID);
                } else {
                    paymentID = paymentData.tsupplierpaymentline[0].fields.Payment_ID;
                    window.open('/supplierpaymentcard?id=' + paymentID, '_self');
                }
            }

            setTimeout(function () {
                let selectPayID = selectedSupplierPaymentID;
                window.open('/supplierpayment?payment=' + selectPayID + '&name=' + suppliername, '_self');
            }, 500);
        } else {
            LoadingOverlay.hide();
        }
    },
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
