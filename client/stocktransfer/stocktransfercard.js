import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    CoreService
} from '../js/core-service';
import {
    EmployeeProfileService
} from "../js/profile-service";
import {
    StockTransferService
} from "../inventory/stockadjust-service";
import {
    AccountService
} from "../accounts/account-service";
import {
    UtilityService
} from "../utility-service";
import {
    SideBarService
} from '../js/sidebar-service';
import {
    ProductService
} from "../product/product-service";
import {
    PurchaseBoardService
} from '../js/purchase-service';
import '../lib/global/indexdbstorage.js';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';
import {
    Random
} from 'meteor/random';
import 'jquery-editable-select';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import "./stocktransfercard.html"
import "../lib/global/globalStockTransfer.js";
import LoadingOverlay from '../LoadingOverlay';

const _ = require('lodash');
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
var times = 0;
Template.stocktransfercard.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.includeInvoiceAttachment = new ReactiveVar();
    templateObject.includeInvoiceAttachment.set(false);
    templateObject.includeDocketAttachment = new ReactiveVar();
    templateObject.includeDocketAttachment.set(false);

    templateObject.includeIsPrintInvoice = new ReactiveVar();
    templateObject.includeIsPrintInvoice.set(false);
    templateObject.includeIsPrintDocket = new ReactiveVar();
    templateObject.includeIsPrintDocket.set(false);
    templateObject.includeBothPrint = new ReactiveVar();
    templateObject.hasPrintPrint = new ReactiveVar();
    templateObject.record = new ReactiveVar({});
    templateObject.stocktransferrecord = new ReactiveVar({});
    templateObject.originstocktransferrecord = new ReactiveVar({});
    templateObject.shipviarecords = new ReactiveVar();

    templateObject.productquantityrecord = new ReactiveVar([]);
    templateObject.availserialrecord = new ReactiveVar([]);

    templateObject.availableserialnumberlist = new ReactiveVar([]);
    templateObject.availableserialnumberqty = new ReactiveVar();

    templateObject.isProccessed = new ReactiveVar();
    templateObject.isProccessed.set(false);

    templateObject.accountID = new ReactiveVar();
    templateObject.stripe_fee_method = new ReactiveVar();


    templateObject.generatePdfForMail = async (invoiceId) => {
        let stripe_id = templateObject.accountID.get() || "";
        let file = "Invoice-" + invoiceId + ".pdf";
        let stringQuery = '?';
        return new Promise((resolve, reject) => {
          var source = document.getElementById("html-2-pdfwrapper_invoice");
            let height = $(source).find('.invoice_wrapper').height();
            let width = $(source).find('.invoice_wrapper').width();

            let heightCM = height / 35.35 + 1.6;
            let widthCM = width / 35.35 + 2.2;
            var opt = {
                margin: 1,
                filename: file,
                html2canvas: { dpi: 192, letterRendering: true },
                jsPDF: {
                    unit: "cm",
                    format: [widthCM, heightCM],
                    orientation: "portrait",
                },
            };
          resolve(
            html2pdf().set(opt).from(source).toPdf().output("datauristring")
          );
        });
      }
    
    templateObject.addAttachment = async (objDetails, isforced = false) => {
    let attachment = [];
    let invoiceId = objDetails.fields.ID;
    let encodedPdf = await templateObject.generatePdfForMail(invoiceId);
    let pdfObject = "";
    let base64data = encodedPdf.split(",")[1];
    pdfObject = {
        filename: "invoice-" + invoiceId + ".pdf",
        content: base64data,
        encoding: "base64",
    };
    attachment.push(pdfObject);
    let erpInvoiceId = objDetails.fields.ID;

    let mailFromName = localStorage.getItem("vs1companyName");
    let mailFrom =
        localStorage.getItem("VS1OrgEmail") ||
        localStorage.getItem("VS1AdminUserName");
    let customerEmailName = $("#edtCustomerName").val();
    let checkEmailData = $("#edtCustomerEmail").val();
    let grandtotal = $("#grandTotal").html();
    let emailDueDate = $("#dtDueDate").val();
    let customerBillingAddress = $("#txabillingAddress").val();
    let customerTerms = $("#sltTerms").val();

    let customerSubtotal = $("#subtotal_total").html();
    let customerTax = $("#subtotal_tax").html();
    let customerNett = $("#subtotal_nett").html();
    let customerTotal = $("#grandTotal").html();

    const stringQuery = "";
    const stripeGlobalURL = ""

    let mailSubject =
        "Invoice " +
        erpInvoiceId +
        " from " +
        mailFromName +
        " for " +
        customerEmailName;
    var htmlmailBody =
        '<table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate;mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">' +
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
        '                                            <p style="font-weight: 700; font-size: 16px; color: #363a3b; margin-bottom: 6px;">DUE ' +
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
        '                                                    <p style="font-size: 16px;">' +
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

    if (
        $(".chkEmailCopy").is(":checked") &&
        $(".chkEmailRep").is(":checked")
    ) {
        Meteor.call(
        "sendEmail", {
        from: "" + mailFromName + " <" + mailFrom + ">",
        to: checkEmailData,
        subject: mailSubject,
        text: "",
        html: htmlmailBody,
        attachments: attachment,
        },
        function (error, result) {
            if (error && error.error === "error") {
            } else {
            $("#html-Invoice-pdfwrapper").css("display", "none");
            swal({
                title: "SUCCESS",
                text: "Email Sent To Customer: " + checkEmailData + " ",
                type: "success",
                showCancelButton: false,
                confirmButtonText: "OK",
            }).then((result) => {
            });
            }
        }
        );

        Meteor.call(
        "sendEmail", {
        from: "" + mailFromName + " <" + mailFrom + ">",
        to: mailFrom,
        subject: mailSubject,
        text: "",
        html: htmlmailBody,
        attachments: attachment,
        },
        function (error, result) {
            if (error && error.error === "error") {

            } else {
            $("#html-Invoice-pdfwrapper").css("display", "none");
            swal({
                title: "SUCCESS",
                text: "Email Sent To Customer: " +
                checkEmailData +
                " and User: " +
                mailFrom +
                "",
                type: "success",
                showCancelButton: false,
                confirmButtonText: "OK",
            }).then((result) => {
                if (result.value) {
                window.open(url, "_self");
                } else if (result.dismiss === "cancel") { }
            });
            }
        }
        );
    } else if ($(".chkEmailCopy").is(":checked") || isforced) {
        Meteor.call(
        "sendEmail", {
        from: "" + mailFromName + " <" + mailFrom + ">",
        to: checkEmailData,
        subject: mailSubject,
        text: "",
        html: htmlmailBody,
        attachments: attachment,
        },
        function (error, result) {
            if (error && error.error === "error") {
            } else {
            $("#html-Invoice-pdfwrapper").css("display", "none");
            swal({
                title: "SUCCESS",
                text: "Email Sent To Customer: " + checkEmailData + " ",
                type: "success",
                showCancelButton: false,
                confirmButtonText: "OK",
            }).then((result) => {
            });
            }
        }
        );
    } else if ($(".chkEmailRep").is(":checked")) {
        Meteor.call(
        "sendEmail", {
        from: "" + mailFromName + " <" + mailFrom + ">",
        to: mailFrom,
        subject: mailSubject,
        text: "",
        html: htmlmailBody,
        attachments: attachment,
        },
        function (error, result) {
            if (error && error.error === "error") {
            } else {
            $("#html-Invoice-pdfwrapper").css("display", "none");
            swal({
                title: "SUCCESS",
                text: "Email Sent To User: " + mailFrom + " ",
                type: "success",
                showCancelButton: false,
                confirmButtonText: "OK",
            });
            }
        }
        );
    } else {
        // window.open(url, "_self");
    }
    }
    
    templateObject.sendEmail = async (isforced = false) => {
    var splashLineArray = new Array();
    let lineItemsForm = [];
    let lineItems = [];
    let lineItemObjForm = {};
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
        const tdSalesLineCustField1 = $(this).find(".lineSalesLinesCustField1").val();

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

    let departement = $("#sltDept").val();
    let shippingAddress = $("#txaShipingInfo").val();
    let comments = $("#txaComment").val();
    let pickingInfrmation = $("#txapickmemo").val();
    let saleCustField1 = $("#edtSaleCustField1").val() || "";
    let saleCustField2 = $("#edtSaleCustField2").val() || "";
    let saleCustField3 = $("#edtSaleCustField3").val() || "";
    const billingAddress  = $("#txabillingAddress").val();
    var url = FlowRouter.current().path;
    var getso_id = url.split("?id=");
    var currentInvoice = getso_id[getso_id.length - 1];
    let uploadedItems = templateObject.uploadedFiles.get();
    var currencyCode = $("#sltCurrency").val() || CountryAbbr;
    let ForeignExchangeRate = $('#exchange_rate').val() || 0;
    var objDetails = "";
    let termname = $('#sltTerms').val() || '';
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
            SalesStatus: $("#sltStatus").val(),
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
            SalesStatus: $("#sltStatus").val(),
        },
        };
    }
    await templateObject.addAttachment(objDetails, isforced);
    }
    
    templateObject.print = async (_template = '') => {
    LoadingOverlay.show();
    setTimeout(async function () {
        var printTemplate = [];
        $("#html-2-pdfwrapper").css("display", "block");
        var invoices = $('input[name="Invoices"]:checked').val();
        let emid = localStorage.getItem("mySessionEmployeeLoggedID");

        if(_template !== ''){
            const _templateNumber = $(`input[name="${_template}"]:checked`).val();
            await templateObject.exportSalesToPdf(_template, _templateNumber);
            return;
        }

        $(".pdfCustomerName").html($("#edtCustomerName").val());
        $(".pdfCustomerAddress").html(
        $("#txabillingAddress")
            .val()
            .replace(/[\r\n]/g, "<br />")
        );
        $("#printcomment").html(
        $("#txaComment")
            .val()
            .replace(/[\r\n]/g, "<br />")
        );
       

        if(printTemplate.length === 0) {
            printTemplate.push("Stock Transfer");
        }

        var template_number = 1;
        if (printTemplate.length > 0) {
        for (var i = 0; i < printTemplate.length; i++) {
            if (printTemplate[i] == "Invoices") {
            template_number = $("input[name=Invoices]:checked").val();
            } else if (printTemplate[i] == "Delivery Docket") {
            template_number = $(
                'input[name="Delivery Docket"]:checked'
            ).val();
            } else if (printTemplate[i] == "Invoice Back Orders") {
            template_number = $(
                'input[name="Invoice Back Orders"]:checked'
            ).val();
            } else { }

            let result = await templateObject.exportSalesToPdf(
            printTemplate[i],
            template_number
            );
            if (result == true) { }
        }
        }
        const isCheckedEmail = $("#printModal").find("#emailSend").is(":checked");
        if(isCheckedEmail){
        if ($("#edtCustomerEmail").val() != "") {
            await templateObject.sendEmail();
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
        }
        $("#printModal").modal('hide');
        LoadingOverlay.hide();

    }, delayTimeAfterSound);
    }
    templateObject.exportSalesToPdf = function() {
        let margins = {
            top: 0,
            bottom: 0,
            left: 0,
            width: 100
        };
        let id = $('.printID').attr("id");
        var source = document.getElementById('html-2-pdfwrapper');
        let file = "Stock Transer.pdf";
        if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
            file = 'Stock Transfer-' + id + '.pdf';
        }

        var opt = {
            margin: 0,
            filename: file,
            image: {
                type: 'jpeg',
                quality: 0.98
            },
            html2canvas: {
                scale: 2
            },
            jsPDF: {
                unit: 'in',
                format: 'a4',
                orientation: 'portrait'
            }
        };
        html2pdf().set(opt).from(source).save().then(function(dataObject) {
            $('.fullScreenSpin').css('display', 'none');
            $('#html-2-pdfwrapper').css('display', 'none');
        });

    };
});

Template.stocktransfercard.onRendered(function() {
    var erpGet = erpDb();
    var url = window.location.href;
    var getsale_id = url.split('?id=');
    var salesID = FlowRouter.current().queryParams.id;
    let clientsService = new PurchaseBoardService();
    let stockTransferService = new StockTransferService();
    $('.fullScreenSpin').css('display', 'inline-block');
    const templateObject = Template.instance();
    let printDeliveryDocket = localStorage.getItem('CloudPrintDeliveryDocket');
    let printInvoice = localStorage.getItem('CloudPrintInvoice');
    const records = [];
    const viarecords = [];

    $("#date-input,#dtShipDate,#dtDueDate").datepicker({
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

    setTimeout(function() {
        $('.fullScreenSpin').css('display', 'none');
    }, 3000);

    templateObject.getAllStocktransfer = function() {
        clientsService.getAllStockTransferEntry1().then(function(data) {
            let newTransferID = 1;
            let newDepartmentData = '';
            if (data.tstocktransferentry) {
                if (data.tstocktransferentry.length > 0) {
                    lastTransfer = data.tstocktransferentry[data.tstocktransferentry.length - 1]
                    newTransferID = parseInt(lastTransfer.Id) + 1;
                    newDepartmentData = lastTransfer.TransferFromClassName || '';
                } else {
                    newTransferID = 1;
                    newDepartmentData = '';
                }
            } else {
                newTransferID = 1;
                newDepartmentData = '';
            }
            $('#txtTransfer').val(newTransferID);
            if(newDepartmentData != ''){
            setTimeout(function() {
                $('#sltDepartment').val(newDepartmentData);
                setTimeout(function() {
                    getVS1Data('TDeptClass').then(function(dataObject) {
                        if (dataObject.length == 0) {

                            sideBarService.getDepartment().then(function(data) {
                                for (let i = 0; i < data.tdeptclass.length; i++) {
                                    if (data.tdeptclass[i].DeptClassName === newDepartmentData) {
                                        $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                    }
                                }

                            }).catch(function(err) {

                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.tdeptclass;
                            for (let i = 0; i < data.tdeptclass.length; i++) {
                                if (data.tdeptclass[i].DeptClassName === newDepartmentData) {
                                    //$('#' +randomID+' .colDepartment').attr('linedeptid',data.tdeptclass[i].Id);
                                    $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                }
                            }

                        }
                    }).catch(function(err) {

                        sideBarService.getDepartment().then(function(data) {
                            for (let i = 0; i < data.tdeptclass.length; i++) {
                                if (data.tdeptclass[i].DeptClassName === newDepartmentData) {
                                    $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                }
                            }

                        }).catch(function(err) {

                        });
                    });
                }, 400);
            }, 200);

           }

            $('.shippingHeader').html('New Stock Transfer #' + newTransferID + '<a role="button" class="btn btn-success" data-toggle="modal" href="#supportModal" style="margin-left: 12px;">Help <i class="fa fa-question-circle-o" style="font-size: 20px;"></i></a> ');

        });
    }

    templateObject.getAllAvailableSerialNumber = function() {
        stockTransferService.getSerialNumberList().then(function(dataSerialNumber) {
            templateObject.availserialrecord.set(dataSerialNumber);
        });
    }
    if (localStorage.getItem('CloudShowSerial')) {
        templateObject.getAllAvailableSerialNumber();
    }
    stockTransferService.getProductClassQuantitys().then(function(dataProductQty) {
        templateObject.productquantityrecord.set(dataProductQty);
    });
    templateObject.getProductQty = function(id, productname) {
        let totalAvailQty = 0;
        let totalInStockQty = 0;
        let deptName = $('#sltDepartment').val() || defaultDept;
        let dataValue = templateObject.productquantityrecord.get();
        let serialList = [];
        var splashLineArrayserialList = new Array();
        // templateObject.availableserialnumberlist.set([]);
        $('table tr').css('background', 'transparent');
        $('#serailscanlist').find('tbody').remove();
        $('input[name="salesLineRow"]').val(id);
        if (dataValue.tproductclassquantity) {
            for (let i = 0; i < dataValue.tproductclassquantity.length; i++) {
                let dataObj = {};

                let prodQtyName = dataValue.tproductclassquantity[i].ProductName;
                let deptQtyName = dataValue.tproductclassquantity[i].DepartmentName;
                if (productname == prodQtyName && deptQtyName == deptName) {
                    //if(productname == prodQtyName){
                    let availQty = dataValue.tproductclassquantity[i].AvailableQty;
                    let inStockQty = dataValue.tproductclassquantity[i].InStockQty;

                    totalAvailQty += parseFloat(availQty);
                    totalInStockQty += parseFloat(inStockQty);
                }
            }

            $('#' + id + " .colOrdered").val(totalAvailQty);

            //Serial Number functionality
            $('#' + id).css('background', 'rgba(0,163,211,0.1)');

            var $tblrow = $("#tblStocktransfer tbody tr");
            var prodPQALine = "";
            var dataListRet = "";

            var productName = $('#' + id + " .lineProductName").val() || '';
            prodPQALine = $('#' + id + " .lineID").text();
            $('input[name="prodID"]').val($('#' + id + " .ProductID").text());
            $('input[name="orderQty"]').val($('#' + id + " .colOrdered").val());
            var segsSerial = prodPQALine.split(',');
            let productID = $('#' + id + " .ProductID").text() || '';
            let countSerialBarcode = 0;
            if(segsSerial){
            for (let s = 0; s < segsSerial.length; s++) {
               countSerialBarcode++;
               let scannedCode = "PSN-" + productID + "-" + segsSerial[s];
               let htmlAppend = '<tr class="dnd-moved"><td class="form_id">' + countSerialBarcode + '</td><td>' + '' +
                   '</td><td>' + '</td>' +
                   '<td>' + '<input type="text" style="text-align: left !important;" name="serialNoBOM" id="serialNoBOM" class="highlightInput " value="' + scannedCode + '" readonly>' + '</td><td class="hiddenColumn"><input type="text" style="text-align: left !important;" name="serialNo" id="serialNo" class="highlightInput " value="' + segsSerial[s] + '" readonly></td><td style="width: 1%;"><span class=" removesecondtablebutton"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 "><i class="fa fa-remove"></i></button></span></td>' +
                   '</tr>';
               if (segsSerial[s] != '') {
                   $("#serailscanlist").append(htmlAppend);
               }

           };
         }


            // $('input[name="deptID"]').val($tblrow.find(".linedeptid").text());
            let countSerial = 0;
            setTimeout(function() {
                let dataAvailableValue = templateObject.availserialrecord.get();
                if (dataAvailableValue) {
                    serialList = [];
                    for (let s = 0; s < dataAvailableValue.tserialnumberlistcurrentreport.length; s++) {

                        if (dataAvailableValue.tserialnumberlistcurrentreport[s].SerialNumber.replace(/\s/g, '') != '') {
                            if ((productName == dataAvailableValue.tserialnumberlistcurrentreport[s].ProductName) &&
                                (deptName == dataAvailableValue.tserialnumberlistcurrentreport[s].DepartmentName) &&
                                (dataAvailableValue.tserialnumberlistcurrentreport[s].AllocType == "In-Stock")) {
                                let addshowclass = "";
                                countSerial++;
                                if (countSerial > 4) {
                                    addshowclass = "hiddenColumn";
                                }
                                templateObject.availableserialnumberqty.set(countSerial);
                                let serialFormat = dataAvailableValue.tserialnumberlistcurrentreport[s].BOMSerialNumber.toLowerCase();
                                let dataObject = {
                                    rowid: countSerial,
                                    partid: dataAvailableValue.tserialnumberlistcurrentreport[s].PartsID || ' ',
                                    serialnumber: dataAvailableValue.tserialnumberlistcurrentreport[s].SerialNumber || ' ',
                                    domserialnumber: dataAvailableValue.tserialnumberlistcurrentreport[s].BOMSerialNumber || ' ',
                                    domserialnumberFormat: serialFormat.replace(/\s/g, '') || '',
                                    checkclass: addshowclass
                                };
                                serialList.push(dataObject);
                            }

                        }
                    }
                    templateObject.availableserialnumberlist.set(serialList);
                } else {
                    templateObject.availableserialnumberlist.set([]);
                }
            }, 400);
            setTimeout(function() {
                $("#allocBarcode").focus();

            }, 200);


        } else {
            stockTransferService.getProductClassQuantitysByDept(productname, deptName).then(function(data) {
                for (let i = 0; i < data.tproductclassquantity.length; i++) {
                    let dataObj = {};

                    let prodQtyName = data.tproductclassquantity[i].ProductName;
                    let deptQtyName = data.tproductclassquantity[i].DepartmentName;
                    if (productname == prodQtyName && deptQtyName == deptName) {
                        //if(productname == prodQtyName){
                        let availQty = data.tproductclassquantity[i].AvailableQty;
                        let inStockQty = data.tproductclassquantity[i].InStockQty;

                        totalAvailQty += parseFloat(availQty);
                        totalInStockQty += parseFloat(inStockQty);
                    }
                }

                $('#' + id + " .colOrdered").val(totalAvailQty);

                //Serial Number functionality
                $('#' + id).css('background', 'rgba(0,163,211,0.1)');
                var $tblrow = $("#tblStocktransfer tbody tr");
                var prodPQALine = "";
                var dataListRet = "";

                var productName = $('#' + id + " .lineProductName").val() || '';
                let productID = $('#' + id + " .ProductID").text() || '';
                prodPQALine = $('#' + id + " .lineID").text();
                $('input[name="prodID"]').val($('#' + id + " .ProductID").text());
                $('input[name="orderQty"]').val($('#' + id + " .colOrdered").val());
                // $('input[name="deptID"]').val($tblrow.find(".linedeptid").text());
                var segsSerial = prodPQALine.split(',');
                let countSerialBarcode = 0;
                if(segsSerial){
                for (let s = 0; s < segsSerial.length; s++) {
                   countSerialBarcode++;
                   let scannedCode = "PSN-" + productID + "-" + segsSerial[s];
                   let htmlAppend = '<tr class="dnd-moved"><td class="form_id">' + countSerialBarcode + '</td><td>' + '' +
                       '</td><td>' + '</td>' +
                       '<td>' + '<input type="text" style="text-align: left !important;" name="serialNoBOM" id="serialNoBOM" class="highlightInput " value="' + scannedCode + '" readonly>' + '</td><td class="hiddenColumn"><input type="text" style="text-align: left !important;" name="serialNo" id="serialNo" class="highlightInput " value="' + segsSerial[s] + '" readonly></td><td style="width: 1%;"><span class=" removesecondtablebutton"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 "><i class="fa fa-remove"></i></button></span></td>' +
                       '</tr>';
                   if (segsSerial[s] != '') {
                       $("#serailscanlist").append(htmlAppend);
                   }

               };
             }

                let countSerial = 0;
                setTimeout(function() {
                    let dataAvailableValue = templateObject.availserialrecord.get();
                    if (dataAvailableValue) {
                        serialList = [];
                        for (let s = 0; s < dataAvailableValue.tserialnumberlistcurrentreport.length; s++) {

                            if (dataAvailableValue.tserialnumberlistcurrentreport[s].SerialNumber.replace(/\s/g, '') != '') {
                                if ((productName == dataAvailableValue.tserialnumberlistcurrentreport[s].ProductName) &&
                                    (deptName == dataAvailableValue.tserialnumberlistcurrentreport[s].DepartmentName) &&
                                    (dataAvailableValue.tserialnumberlistcurrentreport[s].AllocType == "In-Stock")) {
                                    let addshowclass = "";
                                    countSerial++;
                                    if (countSerial > 4) {
                                        addshowclass = "hiddenColumn";
                                    }
                                    templateObject.availableserialnumberqty.set(countSerial);
                                    let serialFormat = dataAvailableValue.tserialnumberlistcurrentreport[s].BOMSerialNumber.toLowerCase();
                                    let dataObject = {
                                        rowid: countSerial,
                                        partid: dataAvailableValue.tserialnumberlistcurrentreport[s].PartsID || ' ',
                                        serialnumber: dataAvailableValue.tserialnumberlistcurrentreport[s].SerialNumber || ' ',
                                        domserialnumber: dataAvailableValue.tserialnumberlistcurrentreport[s].BOMSerialNumber || ' ',
                                        domserialnumberFormat: serialFormat.replace(/\s/g, '') || '',
                                        checkclass: addshowclass
                                    };
                                    serialList.push(dataObject);
                                }

                            }
                        }
                        templateObject.availableserialnumberlist.set(serialList);
                    } else {
                        templateObject.availableserialnumberlist.set([]);
                    }
                }, 400);

                setTimeout(function() {
                    $("#allocBarcode").focus();
                }, 200);

            });
        }


    };

    var url = FlowRouter.current().path;
    if (url.indexOf('?id=') > 0) {
        var getso_id = url.split('?id=');
        var currentStockTransfer = getso_id[getso_id.length - 1];
        if (getso_id[1]) {
            currentStockTransfer = parseInt(currentStockTransfer);

            templateObject.getStockTransferData = function() {
                //getOneQuotedata

                getVS1Data('TStockTransferEntry').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        stockTransferService.getOneStockTransferData(currentStockTransfer).then(function(data) {
                            $('.fullScreenSpin').css('display', 'none');
                            let previuosProductName = '';
                            let lineItems = [];
                            let lineItemObj = {};
                            let lineItemsTable = [];
                            let lineItemTableObj = {};
                            let initialTransferData = 0;
                          if(data.fields.Lines != null){
                            if (data.fields.Lines.length) {
                                for (let i = 0; i < data.fields.Lines.length; i++) {
                                    if (previuosProductName !== data.fields.Lines[i].fields.ProductName) {
                                        const filterProducts = useData[d].fields.Lines.filter(product => product.fields.ProductId === useData[d].fields.Lines[i].fields.ProductId);
                                        const serialNumbers = filterProducts.map(product => product.fields.SerialNumber).join(',');
                                        const transferSerialNumbers = filterProducts.map(product => product.fields.TransferSerialnos).join(',');
                                        const lotNumbers = filterProducts.map(product => product.fields.BatchNoFrom).join(',');
                                        const transferLotNumbers = filterProducts.map(product => product.fields.BatchNoTo).join(',');
                                        lineItemObj = {
                                            lineID: Random.id(),
                                            id: useData[d].fields.Lines[i].fields.ID || '',
                                            pqa: useData[d].fields.Lines[i].fields.TransferSerialnos || '',
                                            serialnumbers: serialNumbers || '',
                                            transferserialnumbers: transferSerialNumbers || '',
                                            lotnumbers: lotNumbers || '',
                                            transferlotnumbers: transferLotNumbers || '',
                                            productname: useData[d].fields.Lines[i].fields.ProductName || '',
                                            item: useData[d].fields.Lines[i].fields.ProductName || '',
                                            productid: useData[d].fields.Lines[i].fields.ProductID || '',
                                            productbarcode: useData[d].fields.Lines[i].fields.PartBarcode || '',
                                            description: useData[d].fields.Lines[i].fields.ProductDesc || '',
                                            department: useData[d].fields.Lines[0].fields.ClassNameTo || defaultDept,
                                            qtyordered: useData[d].fields.Lines[i + filterProducts.length - 1].fields.AvailableQty || 0,
                                            qtyshipped: filterProducts.length || 0,
                                            initaltransfer: useData[d].fields.Lines[i].fields.TransferQty || 0,
                                            qtybo: useData[d].fields.Lines[i].fields.BOQty || 0

                                        };
                                        lineItems.push(lineItemObj);
                                    }
                                    lineItemTableObj = {
                                        lineID: Random.id(),
                                        id: data.fields.Lines[i].fields.ID || '',
                                        pqa: data.fields.Lines[i].fields.TransferSerialnos || '',
                                        serialnumber: useData[d].fields.Lines[i].fields.SerialNumber || '',
                                        batchNumberFrom: useData[d].fields.Lines[i].fields.BatchNoFrom || '',
                                        batchNumberTo: useData[d].fields.Lines[i].fields.BatchNoTo || '',
                                        transferSerialnos: useData[d].fields.Lines[i].fields.TransferSerialnos || '',
                                        productname: data.fields.Lines[i].fields.ProductName || '',
                                        item: data.fields.Lines[i].fields.ProductName || '',
                                        productid: data.fields.Lines[i].fields.ProductID || '',
                                        productbarcode: data.fields.Lines[i].fields.PartBarcode || '',
                                        description: data.fields.Lines[i].fields.ProductDesc || '',
                                        department: data.fields.Lines[0].fields.ClassNameTo || defaultDept,
                                        qtyordered: data.fields.Lines[i].fields.AvailableQty || 0,
                                        qtyshipped: data.fields.Lines[i].fields.TransferQty || 0,
                                        initaltransfer: initialTransferData || 0,
                                        qtybo: data.fields.Lines[i].fields.BOQty || 0
                                    }
                                    lineItemsTable.push(lineItemTableObj);
                                    previuosProductName = data.fields.Lines[i].fields.ProductName;
                                }
                            }
                          }
                            let record = {
                                id: data.fields.ID,
                                lid: 'Edit Stock Transfer' + ' ' + data.fields.ID,
                                LineItems: lineItems,
                                accountname: data.fields.AccountName,
                                department: data.fields.TransferFromClassName || defaultDept,
                                notes: data.fields.Notes,
                                descriptions: data.fields.Description,
                                transdate: data.fields.DateTransferred ? moment(data.fields.DateTransferred).format('DD/MM/YYYY') : ""
                            };

                            templateObject.originstocktransferrecord.set({
                                id: data.fields.ID,
                                lid: 'Edit Stock Transfer' + ' ' + data.fields.ID,
                                LineItems: lineItemsTable,
                                accountname: data.fields.AccountName,
                                department: data.fields.TransferFromClassName || defaultDept,
                                notes: data.fields.Notes,
                                descriptions: data.fields.Description,
                                transdate: data.fields.DateTransferred ? moment(data.fields.DateTransferred).format('DD/MM/YYYY') : ""
                            });

                            let getDepartmentVal = data.fields.Lines[0].fields.TransferFromClassName || defaultDept;

                            setTimeout(function() {
                                $('#sltDepartment').val(record.department);
                                $('#edtCustomerName').val(data.fields.Lines[0].fields.CustomerName);
                                $('#sltBankAccountName').val(data.fields.AccountName);
                                $('#shipvia').val(data.fields.Shipping);
                                // $('#tblStocktransfer .lineOrdered').trigger("click");
                                $('#tblStocktransfer tr:first-child .lineOrdered').trigger("click");
                                setTimeout(function() {
                                    getVS1Data('TDeptClass').then(function(dataObject) {
                                        if (dataObject.length == 0) {

                                            sideBarService.getDepartment().then(function(data) {
                                                for (let i = 0; i < data.tdeptclass.length; i++) {
                                                    if (data.tdeptclass[i].DeptClassName === record.department) {
                                                        $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                                    }
                                                }

                                            }).catch(function(err) {

                                            });
                                        } else {
                                            let data = JSON.parse(dataObject[0].data);
                                            let useData = data.tdeptclass;
                                            for (let i = 0; i < data.tdeptclass.length; i++) {
                                                if (data.tdeptclass[i].DeptClassName === record.department) {
                                                    //$('#' +randomID+' .colDepartment').attr('linedeptid',data.tdeptclass[i].Id);
                                                    $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                                }
                                            }

                                        }
                                    }).catch(function(err) {

                                        sideBarService.getDepartment().then(function(data) {
                                            for (let i = 0; i < data.tdeptclass.length; i++) {
                                                if (data.tdeptclass[i].DeptClassName === record.department) {
                                                    $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                                }
                                            }

                                        }).catch(function(err) {

                                        });
                                    });
                                }, 400);
                            }, 200);

                            if (data.fields.Processed == true) {
                                templateObject.isProccessed.set(true);
                                $('.colProcessed').css('display', 'block');
                                $("#form :input").prop("disabled", true);
                                $(".btnDeleteStock").prop("disabled", false);
                                $(".btnDeleteStockTransfer").prop("disabled", false);
                                $(".btnDeleteFollowingStocks").prop("disabled", false);
                                $(".printConfirm").prop("disabled", false);
                                $(".btnBack").prop("disabled", false);
                                $(".btnDeleteProduct").prop("disabled", false);
                            }

                            templateObject.stocktransferrecord.set(record);

                            if (templateObject.stocktransferrecord.get()) {


                                Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblStocktransfer', function(error, result) {
                                    if (error) {

                                        //Bert.alert('<strong>Error:</strong> user-not-found, no user found please try again!', 'danger');
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

                                                    //$("."+columnClass+"").css('display','none');
                                                    $("." + columnClass + "").addClass('hiddenColumn');
                                                    $("." + columnClass + "").removeClass('showColumn');
                                                } else if (hiddenColumn == false) {
                                                    $("." + columnClass + "").removeClass('hiddenColumn');
                                                    $("." + columnClass + "").addClass('showColumn');
                                                    //$("."+columnClass+"").css('display','table-cell');
                                                    //$("."+columnClass+"").css('padding','.75rem');
                                                    //$("."+columnClass+"").css('vertical-align','top');
                                                }

                                            }
                                        }

                                    }
                                });
                            }
                        }).catch(function(err) {

                            swal({
                                title: 'Oooops...',
                                text: err,
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {
                                    Meteor._reload.reload();
                                } else if (result.dismiss === 'cancel') {}
                            });
                            $('.fullScreenSpin').css('display', 'none');
                            // Meteor._reload.reload();
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tstocktransferentry;
                        var added = false;
                        for (let d = 0; d < useData.length; d++) {
                            if (parseInt(useData[d].fields.ID) === currentStockTransfer) {
                                added = true;
                                $('.fullScreenSpin').css('display', 'none');
                                let lineItems = [];
                                let lineItemsTable = [];
                                let lineItemTableObj = {};
                                let initialTransferData = 0;
                                let previuosProductName = '';
                                let previousProductNumber = 1;
                                if (useData[d].fields.Lines.length) {
                                    for (let i = 0; i < useData[d].fields.Lines.length; i++) {
                                        if (previuosProductName !== useData[d].fields.Lines[i].fields.ProductName) {
                                            const filterProducts = useData[d].fields.Lines.filter(product => product.fields.ProductID === useData[d].fields.Lines[i].fields.ProductID);
                                            let serialNumbers = filterProducts.map(product => product.fields.SerialNumber);
                                            let transferSerialNumbers = filterProducts.map(product => product.fields.TransferSerialnos);
                                            let lotNumbers = filterProducts.map(product => product.fields.BatchNoTo);
                                            let transferLotNumbers = filterProducts.map(product => product.fields.BatchNoFrom);
                                            let expiryDates = filterProducts.map(product => {
                                                if (product.fields.ExpiryDateTo) {
                                                    let expiryDate = product.fields.ExpiryDateTo.split(' ')[0].split('-');
                                                    return `${expiryDate[2]}/${expiryDate[1]}/${expiryDate[0]}`;
                                                } else return '';
                                            });
                                            let transferExpiryDates = filterProducts.map(product => {
                                                if (product.fields.ExpiryDateFrom) {
                                                    let expiryDate = product.fields.ExpiryDateFrom.split(' ')[0].split('-');
                                                    return `${expiryDate[2]}/${expiryDate[1]}/${expiryDate[0]}`;
                                                } else return '';
                                            });
                                            if (serialNumbers[0] === '') serialNumbers = '';
                                            if (lotNumbers[0] === '') lotNumbers = '';
                                            if (transferSerialNumbers[0] === '') transferSerialNumbers = '';
                                            if (transferLotNumbers[0] === '') transferLotNumbers = '';
                                            lineItemObj = {
                                                lineID: Random.id(),
                                                id: useData[d].fields.Lines[i].fields.ID || '',
                                                pqa: useData[d].fields.Lines[i].fields.TransferSerialnos || '',
                                                serialnumbers: serialNumbers !== '' ? serialNumbers.join(',') : '',
                                                transferserialnumbers: transferSerialNumbers !== '' ? transferSerialNumbers.join(',') : '',
                                                lotnumbers: lotNumbers !== '' ? lotNumbers.join(',') : '',
                                                transferlotnumbers: transferLotNumbers !== '' ? transferLotNumbers.join(',') : '',
                                                expirydates: lotNumbers !== '' ? expiryDates.join(',') : '',
                                                transferexpirydates: lotNumbers !== '' ? transferExpiryDates.join(',') : '',
                                                productname: useData[d].fields.Lines[i].fields.ProductName || '',
                                                item: useData[d].fields.Lines[i].fields.ProductName || '',
                                                productid: useData[d].fields.Lines[i].fields.ProductID || '',
                                                productbarcode: useData[d].fields.Lines[i].fields.PartBarcode || '',
                                                description: useData[d].fields.Lines[i].fields.ProductDesc || '',
                                                department: useData[d].fields.Lines[0].fields.ClassNameTo || defaultDept,
                                                qtyordered: useData[d].fields.Lines[i + filterProducts.length - 1].fields.AvailableQty || 0,
                                                qtyshipped: filterProducts.length || 0,
                                                initaltransfer: useData[d].fields.Lines[i].fields.TransferQty || 0,
                                                qtybo: useData[d].fields.Lines[i].fields.BOQty || 0,
                                            };

                                            lineItems.push(lineItemObj);
                                        } else {
                                            previousProductNumber++;
                                        }
                                        lineItemTableObj = {
                                            lineID: Random.id(),
                                            id: useData[d].fields.Lines[i].fields.ID || '',
                                            pqa: useData[d].fields.Lines[i].fields.TransferSerialnos || '',
                                            serialnumber: useData[d].fields.Lines[i].fields.SerialNumber || '',
                                            batchNumberFrom: useData[d].fields.Lines[i].fields.BatchNoFrom || '',
                                            batchNumberTo: useData[d].fields.Lines[i].fields.BatchNoTo || '',
                                            transferSerialnos: useData[d].fields.Lines[i].fields.TransferSerialnos || '',
                                            productname: useData[d].fields.Lines[i].fields.ProductName || '',
                                            item: useData[d].fields.Lines[i].fields.ProductName || '',
                                            productid: useData[d].fields.Lines[i].fields.ProductID || '',
                                            productbarcode: useData[d].fields.Lines[i].fields.PartBarcode || '',
                                            description: useData[d].fields.Lines[i].fields.ProductDesc || '',
                                            department: useData[d].fields.Lines[0].fields.ClassNameTo || defaultDept,
                                            qtyordered: useData[d].fields.Lines[i].fields.AvailableQty || 0,
                                            qtyshipped: useData[d].fields.Lines[i].fields.TransferQty || 0,
                                            initaltransfer: initialTransferData || 0,
                                            qtybo: useData[d].fields.Lines[i].fields.BOQty || 0,
                                            batchnofrom: useData[d].fields.Lines[i].fields.BatchNoFrom,
                                            batchnoto: useData[d].fields.Lines[i].fields.BatchNoTo,
                                            expirydatefrom: useData[d].fields.Lines[i].fields.ExpiryDateFrom,
                                            expirydateto: useData[d].fields.Lines[i].fields.ExpiryDateTo,
                                        }
                                        lineItemsTable.push(lineItemTableObj);
                                        previuosProductName = useData[d].fields.Lines[i].fields.ProductName;
                                    }
                                } else {
                                    lineItemObj = {
                                        lineID: Random.id(),
                                        id: useData[d].fields.Lines.fields.ID || '',
                                        pqa: useData[d].fields.Lines.fields.TransferSerialnos || '',
                                        serialnumber: useData[d].fields.Lines.fields.SerialNumber || '',
                                        batchNumberFrom: useData[d].fields.Lines.fields.BatchNoFrom || '',
                                        batchNumberTo: useData[d].fields.Lines.fields.BatchNoTo || '',
                                        transferSerialnos: useData[d].fields.Lines.fields.TransferSerialnos || '',
                                        productname: useData[d].fields.Lines.fields.ProductName || '',
                                        item: useData[d].fields.Lines.fields.ProductName || '',
                                        productid: useData[d].fields.Lines.fields.ProductID || '',
                                        productbarcode: useData[d].fields.Lines.fields.PartBarcode || '',
                                        description: useData[d].fields.Lines.fields.ProductDesc || '',
                                        department: useData[d].fields.Lines.fields.ClassNameTo || defaultDept,
                                        qtyordered: useData[d].fields.Lines.fields.AvailableQty || 0,
                                        qtyshipped: useData[d].fields.Lines.fields.TransferQty || 0,
                                        initaltransfer: initialTransferData || 0,
                                        qtybo: useData[d].fields.Lines.fields.BOQty || 0,
                                        batchnofrom: useData[d].fields.Lines[i].fields.BatchNoFrom,
                                        batchnoto: useData[d].fields.Lines[i].fields.BatchNoTo,
                                        expirydatefrom: useData[d].fields.Lines[i].fields.ExpiryDateFrom,
                                        expirydateto: useData[d].fields.Lines[i].fields.ExpiryDateTo,
                                    };
                                    lineItems.push(lineItemObj);
                                }


                                let record = {
                                    id: useData[d].fields.ID,
                                    lid: 'Edit Stock Transfer' + ' ' + useData[d].fields.ID,
                                    LineItems: lineItems,
                                    accountname: useData[d].fields.AccountName,
                                    department: useData[d].fields.TransferFromClassName || defaultDept,
                                    notes: useData[d].fields.Notes,
                                    descriptions: useData[d].fields.Description,
                                    transdate: useData[d].fields.DateTransferred ? moment(useData[d].fields.DateTransferred).format('DD/MM/YYYY') : ""
                                };

                                templateObject.originstocktransferrecord.set({
                                    id: useData[d].fields.ID,
                                    lid: 'Edit Stock Transfer' + ' ' + useData[d].fields.ID,
                                    LineItems: lineItemsTable,
                                    accountname: useData[d].fields.AccountName,
                                    department: useData[d].fields.TransferFromClassName || defaultDept,
                                    notes: useData[d].fields.Notes,
                                    descriptions: useData[d].fields.Description,
                                    transdate: useData[d].fields.DateTransferred ? moment(useData[d].fields.DateTransferred).format('DD/MM/YYYY') : ""
                                });

                                let getDepartmentVal = useData[d].fields.Lines[0].fields.TransferFromClassName || defaultDept;
                                $('.shippingHeader').html('Edit Stock Transfer #' + useData[d].fields.ID + '<a role="button" class="btn btn-success" data-toggle="modal" href="#supportModal" style="margin-left: 12px;">Help <i class="fa fa-question-circle-o" style="font-size: 20px;"></i></a>');
                                setTimeout(function() {
                                    $('#sltDepartment').val(record.department);
                                    $('#edtCustomerName').val(useData[d].fields.Lines[0].fields.CustomerName);
                                    $('#sltBankAccountName').val(useData[d].fields.AccountName);
                                    $('#shipvia').val(useData[d].fields.Shipping);
                                    // $('#tblStocktransfer .lineOrdered').trigger("click");
                                    $('#tblStocktransfer tr:first-child .lineOrdered').trigger("click");

                                    setTimeout(function() {
                                        getVS1Data('TDeptClass').then(function(dataObject) {
                                            if (dataObject.length == 0) {

                                                sideBarService.getDepartment().then(function(data) {
                                                    for (let i = 0; i < data.tdeptclass.length; i++) {
                                                        if (data.tdeptclass[i].DeptClassName === record.department) {
                                                            $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                                        }
                                                    }

                                                }).catch(function(err) {

                                                });
                                            } else {
                                                let data = JSON.parse(dataObject[0].data);
                                                let useData = data.tdeptclass;
                                                for (let i = 0; i < data.tdeptclass.length; i++) {
                                                    if (data.tdeptclass[i].DeptClassName === record.department) {
                                                        //$('#' +randomID+' .colDepartment').attr('linedeptid',data.tdeptclass[i].Id);
                                                        $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                                    }
                                                }

                                            }
                                        }).catch(function(err) {

                                            sideBarService.getDepartment().then(function(data) {
                                                for (let i = 0; i < data.tdeptclass.length; i++) {
                                                    if (data.tdeptclass[i].DeptClassName === record.department) {
                                                        $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                                    }
                                                }

                                            }).catch(function(err) {

                                            });
                                        });
                                    }, 400);

                                }, 200);



                                //
                                // $("#form :input").prop("disabled", true);
                                // $(".btnDeleteStock").prop("disabled", false);
                                // $(".btnDeleteStockAdjust").prop("disabled", false);
                                // $(".printConfirm").prop("disabled", false);
                                // $(".btnBack").prop("disabled", false);

                                if (useData[d].fields.Processed == true) {
                                    templateObject.isProccessed.set(true);
                                    $('.colProcessed').css('display', 'block');
                                    $("#form :input").prop("disabled", true);
                                    $(".btnDeleteStock").prop("disabled", false);
                                    $(".btnDeleteStockTransfer").prop("disabled", false);
                                    $(".btnDeleteFollowingStocks").prop("disabled", false);
                                    $(".printConfirm").prop("disabled", false);
                                    $(".btnBack").prop("disabled", false);
                                    $(".btnDeleteProduct").prop("disabled", false);
                                }

                                templateObject.stocktransferrecord.set(record);
                                $(".btnDeleteLine").prop("disabled", false);
                                $(".btnDeleteProduct").prop("disabled", false);
                                $(".close").prop("disabled", false);
                                if (templateObject.stocktransferrecord.get()) {
                                    Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblStocktransfer', function(error, result) {
                                        if (error) {} else {
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

                                                        //$("."+columnClass+"").css('display','none');
                                                        $("." + columnClass + "").addClass('hiddenColumn');
                                                        $("." + columnClass + "").removeClass('showColumn');
                                                    } else if (hiddenColumn == false) {
                                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                                        $("." + columnClass + "").addClass('showColumn');
                                                        //$("."+columnClass+"").css('display','table-cell');
                                                        //$("."+columnClass+"").css('padding','.75rem');
                                                        //$("."+columnClass+"").css('vertical-align','top');
                                                    }

                                                }
                                            }

                                        }
                                    });
                                }
                                setTimeout(function() {
                                    $(".btnRemove").prop("disabled", true);
                                }, 1000);

                            }

                        }
                        if (!added) {
                            stockTransferService.getOneStockTransferData(currentStockTransfer).then(function(data) {
                                $('.fullScreenSpin').css('display', 'none');
                                let lineItems = [];
                                let lineItemObj = {};
                                let lineItemsTable = [];
                                let lineItemTableObj = {};
                                let initialTransferData = 0;
                              if(data.fields.Lines != null){
                                if (data.fields.Lines.length) {
                                    for (let i = 0; i < data.fields.Lines.length; i++) {
                                      if(data.fields.Lines[i].fields.TransferSerialnos){

                                      }else{
                                        initialTransferData = data.fields.Lines[i].fields.TransferQty || 0;
                                      }
                                        lineItemObj = {
                                            lineID: Random.id(),
                                            id: data.fields.Lines[i].fields.ID || '',
                                            pqa: data.fields.Lines[i].fields.TransferSerialnos || '',
                                            serialnumber: data.fields.Lines[i].fields.TransferSerialnos || '',
                                            productname: data.fields.Lines[i].fields.ProductName || '',
                                            item: data.fields.Lines[i].fields.ProductName || '',
                                            productid: data.fields.Lines[i].fields.ProductID || '',
                                            productbarcode: data.fields.Lines[i].fields.PartBarcode || '',
                                            description: data.fields.Lines[i].fields.ProductDesc || '',
                                            department: data.fields.Lines[0].fields.ClassNameTo || defaultDept,
                                            qtyordered: data.fields.Lines[i].fields.AvailableQty || 0,
                                            qtyshipped: data.fields.Lines[i].fields.TransferQty || 0,
                                            initaltransfer: initialTransferData || 0,
                                            qtybo: data.fields.Lines[i].fields.BOQty || 0,
                                            batchnofrom: useData[d].fields.Lines[i].fields.BatchNoFrom,
                                            batchnoto: useData[d].fields.Lines[i].fields.BatchNoTo,
                                            expirydatefrom: useData[d].fields.Lines[i].fields.ExpiryDateFrom,
                                            expirydateto: useData[d].fields.Lines[i].fields.ExpiryDateTo,
                                        };

                                        lineItems.push(lineItemObj);
                                    }
                                }
                              }
                                let record = {
                                    id: data.fields.ID,
                                    lid: 'Edit Stock Transfer' + ' ' + data.fields.ID,
                                    LineItems: lineItems,
                                    accountname: data.fields.AccountName,
                                    department: data.fields.TransferFromClassName || defaultDept,
                                    notes: data.fields.Notes,
                                    descriptions: data.fields.Description,
                                    transdate: data.fields.DateTransferred ? moment(data.fields.DateTransferred).format('DD/MM/YYYY') : ""
                                };

                                let getDepartmentVal = data.fields.Lines[0].fields.TransferFromClassName || defaultDept;

                                setTimeout(function() {
                                    $('#sltDepartment').val(record.department);
                                    $('#edtCustomerName').val(data.fields.Lines[0].fields.CustomerName);
                                    $('#sltBankAccountName').val(data.fields.AccountName);
                                    $('#shipvia').val(data.fields.Shipping);
                                    // $('#tblStocktransfer .lineOrdered').trigger("click");
                                    $('#tblStocktransfer tr:first-child .lineOrdered').trigger("click");

                                    setTimeout(function() {
                                        getVS1Data('TDeptClass').then(function(dataObject) {
                                            if (dataObject.length == 0) {

                                                sideBarService.getDepartment().then(function(data) {
                                                    for (let i = 0; i < data.tdeptclass.length; i++) {
                                                        if (data.tdeptclass[i].DeptClassName === record.department) {
                                                            $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                                        }
                                                    }

                                                }).catch(function(err) {

                                                });
                                            } else {
                                                let data = JSON.parse(dataObject[0].data);
                                                let useData = data.tdeptclass;
                                                for (let i = 0; i < data.tdeptclass.length; i++) {
                                                    if (data.tdeptclass[i].DeptClassName === record.department) {
                                                        //$('#' +randomID+' .colDepartment').attr('linedeptid',data.tdeptclass[i].Id);
                                                        $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                                    }
                                                }

                                            }
                                        }).catch(function(err) {

                                            sideBarService.getDepartment().then(function(data) {
                                                for (let i = 0; i < data.tdeptclass.length; i++) {
                                                    if (data.tdeptclass[i].DeptClassName === record.department) {
                                                        $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                                    }
                                                }

                                            }).catch(function(err) {

                                            });
                                        });
                                    }, 400);

                                }, 200);

                                if (data.fields.Processed == true) {
                                    templateObject.isProccessed.set(true);
                                    $('.colProcessed').css('display', 'block');
                                    $("#form :input").prop("disabled", true);
                                    $(".btnDeleteStock").prop("disabled", false);
                                    $(".btnDeleteStockTransfer").prop("disabled", false);
                                    $(".btnDeleteFollowingStocks").prop("disabled", false);
                                    $(".printConfirm").prop("disabled", false);
                                    $(".btnBack").prop("disabled", false);
                                    $(".btnDeleteProduct").prop("disabled", false);
                                }

                                templateObject.stocktransferrecord.set(record);

                                if (templateObject.stocktransferrecord.get()) {


                                    Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblStocktransfer', function(error, result) {
                                        if (error) {

                                            //Bert.alert('<strong>Error:</strong> user-not-found, no user found please try again!', 'danger');
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

                                                        //$("."+columnClass+"").css('display','none');
                                                        $("." + columnClass + "").addClass('hiddenColumn');
                                                        $("." + columnClass + "").removeClass('showColumn');
                                                    } else if (hiddenColumn == false) {
                                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                                        $("." + columnClass + "").addClass('showColumn');
                                                        //$("."+columnClass+"").css('display','table-cell');
                                                        //$("."+columnClass+"").css('padding','.75rem');
                                                        //$("."+columnClass+"").css('vertical-align','top');
                                                    }

                                                }
                                            }

                                        }
                                    });
                                }
                            }).catch(function(err) {

                                swal({
                                    title: 'Oooops...',
                                    text: err,
                                    type: 'error',
                                    showCancelButton: false,
                                    confirmButtonText: 'Try Again'
                                }).then((result) => {
                                    if (result.value) {
                                        Meteor._reload.reload();
                                    } else if (result.dismiss === 'cancel') {}
                                });
                                $('.fullScreenSpin').css('display', 'none');
                                // Meteor._reload.reload();
                            });
                        }
                        //here
                    }
                }).catch(function(err) {

                    stockTransferService.getOneStockTransferData(currentStockTransfer).then(function(data) {
                        $('.fullScreenSpin').css('display', 'none');
                        let lineItems = [];
                        let lineItemObj = {};
                        let lineItemsTable = [];
                        let lineItemTableObj = {};
                        let initialTransferData = 0;
                        if(data.fields.Lines != null){
                            if (data.fields.Lines.length) {
                                for (let i = 0; i < data.fields.Lines.length; i++) {
                                if(data.fields.Lines[i].fields.TransferSerialnos){

                                }else{
                                    initialTransferData = data.fields.Lines[i].fields.TransferQty || 0;
                                }
                                    lineItemObj = {
                                        lineID: Random.id(),
                                        id: data.fields.Lines[i].fields.ID || '',
                                        pqa: data.fields.Lines[i].fields.TransferSerialnos || '',
                                        serialnumber: data.fields.Lines[i].fields.TransferSerialnos || '',
                                        productname: data.fields.Lines[i].fields.ProductName || '',
                                        item: data.fields.Lines[i].fields.ProductName || '',
                                        productid: data.fields.Lines[i].fields.ProductID || '',
                                        productbarcode: data.fields.Lines[i].fields.PartBarcode || '',
                                        description: data.fields.Lines[i].fields.ProductDesc || '',
                                        department: data.fields.Lines[0].fields.ClassNameTo || defaultDept,
                                        qtyordered: data.fields.Lines[i].fields.AvailableQty || 0,
                                        qtyshipped: data.fields.Lines[i].fields.TransferQty || 0,
                                        initaltransfer: initialTransferData || 0,
                                        qtybo: data.fields.Lines[i].fields.BOQty || 0

                                    };

                                    lineItems.push(lineItemObj);
                                }
                            }
                        }
                        let record = {
                            id: data.fields.ID,
                            lid: 'Edit Stock Transfer' + ' ' + data.fields.ID,
                            LineItems: lineItems,
                            accountname: data.fields.AccountName,
                            department: data.fields.TransferFromClassName || defaultDept,
                            notes: data.fields.Notes,
                            descriptions: data.fields.Description,
                            transdate: data.fields.DateTransferred ? moment(data.fields.DateTransferred).format('DD/MM/YYYY') : ""
                        };

                        let getDepartmentVal = data.fields.Lines[0].fields.TransferFromClassName || defaultDept;

                        setTimeout(function() {
                            $('#sltDepartment').val(record.department);
                            $('#edtCustomerName').val(data.fields.Lines[0].fields.CustomerName);
                            $('#sltBankAccountName').val(data.fields.AccountName);
                            $('#shipvia').val(data.fields.Shipping);

                            setTimeout(function() {
                                getVS1Data('TDeptClass').then(function(dataObject) {
                                    if (dataObject.length == 0) {

                                        sideBarService.getDepartment().then(function(data) {
                                            for (let i = 0; i < data.tdeptclass.length; i++) {
                                                if (data.tdeptclass[i].DeptClassName === record.department) {
                                                    $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                                }
                                            }

                                        }).catch(function(err) {

                                        });
                                    } else {
                                        let data = JSON.parse(dataObject[0].data);
                                        let useData = data.tdeptclass;
                                        for (let i = 0; i < data.tdeptclass.length; i++) {
                                            if (data.tdeptclass[i].DeptClassName === record.department) {
                                                //$('#' +randomID+' .colDepartment').attr('linedeptid',data.tdeptclass[i].Id);
                                                $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                            }
                                        }

                                    }
                                }).catch(function(err) {

                                    sideBarService.getDepartment().then(function(data) {
                                        for (let i = 0; i < data.tdeptclass.length; i++) {
                                            if (data.tdeptclass[i].DeptClassName === record.department) {
                                                $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                            }
                                        }

                                    }).catch(function(err) {

                                    });
                                });
                            }, 400);

                        }, 200);

                        if (data.fields.Processed == true) {
                            templateObject.isProccessed.set(true);
                            $('.colProcessed').css('display', 'block');
                            $("#form :input").prop("disabled", true);
                            $(".btnDeleteStock").prop("disabled", false);
                            $(".btnDeleteStockTransfer").prop("disabled", false);
                            $(".btnDeleteFollowingStocks").prop("disabled", false);
                            $(".printConfirm").prop("disabled", false);
                            $(".btnBack").prop("disabled", false);
                            $(".btnDeleteProduct").prop("disabled", false);
                        }

                        templateObject.stocktransferrecord.set(record);

                        if (templateObject.stocktransferrecord.get()) {


                            Meteor.call('readPrefMethod', localStorage.getItem('mycloudLogonID'), 'tblStocktransfer', function(error, result) {
                                if (error) {

                                    //Bert.alert('<strong>Error:</strong> user-not-found, no user found please try again!', 'danger');
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

                                                //$("."+columnClass+"").css('display','none');
                                                $("." + columnClass + "").addClass('hiddenColumn');
                                                $("." + columnClass + "").removeClass('showColumn');
                                            } else if (hiddenColumn == false) {
                                                $("." + columnClass + "").removeClass('hiddenColumn');
                                                $("." + columnClass + "").addClass('showColumn');
                                                //$("."+columnClass+"").css('display','table-cell');
                                                //$("."+columnClass+"").css('padding','.75rem');
                                                //$("."+columnClass+"").css('vertical-align','top');
                                            }

                                        }
                                    }

                                }
                            });
                        }
                    }).catch(function(err) {

                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {}
                        });
                        $('.fullScreenSpin').css('display', 'none');
                        // Meteor._reload.reload();
                    });
                });

            };

            templateObject.getStockTransferData();
            $('.fullScreenSpin').css('display', 'none');
        }
        setTimeout(function() {
            $('#edtSupplierEmail').val(localStorage.getItem('mySession'));
        }, 200);
    } else {
        $('.fullScreenSpin').css('display', 'none');

        templateObject.getAllStocktransfer();
        let lineItems = [];
        let lineItemsTable = [];
        let lineItemObj = {};
        let randomID = Random.id();
        //for (let i = 0; i < 2; i++) {
        lineItemObj = {
            lineID: randomID,
            item: '',
            accountname: '',
            accountno: '',
            memo: '',
            department: defaultDept,
            creditex: '',
            debitex: '',
            taxCode: ''
        };
        lineItems.push(lineItemObj);
        //}
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        let record = {
            id: '',
            lid: 'New Stock Transfer',
            accountname: '',
            memo: '',
            department: defaultDept,
            entryno: '',
            transdate: begunDate,
            LineItems: lineItems,
            isReconciled: false

        };
        setTimeout(function() {
            $('#sltDepartment').val(defaultDept);
            $('#sltBankAccountName').val('Stock Transfer');
            $('#edtSupplierEmail').val(localStorage.getItem('mySession'));
            setTimeout(function() {
                getVS1Data('TDeptClass').then(function(dataObject) {
                    if (dataObject.length == 0) {

                        sideBarService.getDepartment().then(function(data) {
                            for (let i = 0; i < data.tdeptclass.length; i++) {
                                if (data.tdeptclass[i].DeptClassName === defaultDept) {
                                    $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                                }
                            }

                        }).catch(function(err) {

                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tdeptclass;
                        for (let i = 0; i < data.tdeptclass.length; i++) {
                            if (data.tdeptclass[i].DeptClassName === defaultDept) {
                                //$('#' +randomID+' .colDepartment').attr('linedeptid',data.tdeptclass[i].Id);
                                $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                            }
                        }

                    }
                }).catch(function(err) {

                    sideBarService.getDepartment().then(function(data) {
                        for (let i = 0; i < data.tdeptclass.length; i++) {
                            if (data.tdeptclass[i].DeptClassName === defaultDept) {
                                $('input[name="deptID"]').val(data.tdeptclass[i].Id);
                            }
                        }

                    }).catch(function(err) {

                    });
                });
            }, 400);
        }, 200);
        templateObject.stocktransferrecord.set(record);

    }

    if (FlowRouter.current().queryParams.id) {

        // setTimeout(function() {
        //     $('#tblStocktransfer tr:first-child .lineOrdered').trigger("click");
        // }, 400);
    } else {
        setTimeout(function() {
            $('#tblStocktransfer .lineProductName').trigger("click");
        }, 200);
    }

    templateObject.getShpVias = function() {
        getVS1Data('TShippingMethod').then(function(dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getShippingMethodData().then(function(data) {
                    addVS1Data('TShippingMethod', JSON.stringify(data));
                    for (let i in data.tshippingmethod) {

                        let viarecordObj = {
                            shippingmethod: data.tshippingmethod[i].ShippingMethod || ' ',
                        };

                        viarecords.push(viarecordObj);
                        templateObject.shipviarecords.set(viarecords);

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

                    templateObject.shipviarecords.set(viarecords);

                }

            }
        }).catch(function(err) {

            sideBarService.getShippingMethodData().then(function(data) {
                addVS1Data('TShippingMethod', JSON.stringify(data));

                for (let i in data.tshippingmethod) {

                    let viarecordObj = {
                        shippingmethod: data.tshippingmethod[i].ShippingMethod || ' ',
                    };

                    viarecords.push(viarecordObj);
                    templateObject.shipviarecords.set(viarecords);

                }
            });
        });

    }
    templateObject.getShpVias();

    StockTransferRow();
    $("#btnsaveallocline").click(function() {
        playSaveAudio();
        setTimeout(function(){
        $('#tblStocktransfer tr:eq(' + rowIndex + ')').find("[id=pqa]").text("");
        var splashLineArrayAlloc = new Array();
        let lineItemObjFormAlloc = {};

        $('#serailscanlist > tbody > tr').each(function() {
            var $tblrowAlloc = $(this);
            let tdSerialNumber = $tblrowAlloc.find("#serialNo").val() || 0;

            splashLineArrayAlloc.push(tdSerialNumber);
        });

        var departmentID = $('input[name="deptID"]').val() || 0;
        var pqaID = $('input[name="pqaID"]').val();
        var AllocLineObjDetails = splashLineArrayAlloc.join(',');
        // {
        //     type: "TPQA",
        //     fields: {
        //         DepartmentID: parseInt(departmentID),
        //         PQABatch: null,
        //         PQABins: null,
        //         ID: parseInt(pqaID),
        //         PQASN: splashLineArrayAlloc
        //     }
        // };
        var rowIndex = $('input[name="salesLineRow"]').val();
        let initialTransfer = $('#' + rowIndex + " #InitTransfer").text()||0;
        var qtyShipped = $('#serailscanlist tbody tr').length;
        // if(initialTransfer != 0){
        //   qtyShipped = qtyShipped + parseInt(initialTransfer);
        // }

        var qtyOrder = parseInt($('#' + rowIndex + " #Ordered").val());
        // parseInt($('#tblStocktransfer tr:eq(' + rowIndex + ')').find("[id=Ordered]").val());
        var qtyBackOrder = qtyOrder - qtyShipped;

        $('#' + rowIndex + " #pqa").text(AllocLineObjDetails);
        $('#' + rowIndex + " #lineID").text(AllocLineObjDetails);
        // $('#' + rowIndex + " #UOMQtyShipped").val(qtyShipped);
        $('#' + rowIndex + " #UOMQtyBackOrder").text(qtyBackOrder);
    }, delayTimeAfterSound);
    });

  
    $(document).ready(function() {

        $('#tblEmployeelist tbody').on('click', 'tr', function(event) {
            $('#edtSupplierEmail').val($(event.target).closest("tr").find('.colEmail').text());
            $('#employeeList').modal('hide');
            $('#edtSupplierEmail').val($('#edtSupplierEmail').val().replace(/\s/g, ''));
            if ($('.chkEmailCopy').is(':checked')) {
                let checkEmailData = $('#edtSupplierEmail').val();
                if (checkEmailData.replace(/\s/g, '') === '') {
                    $('.chkEmailCopy').prop('checked', false);
                    swal('Employee Email cannot be blank!', '', 'warning');
                    event.preventDefault();
                } else {

                    function isEmailValid(mailTo) {
                        return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(mailTo);
                    };
                    if (!isEmailValid(checkEmailData)) {
                        $('.chkEmailCopy').prop('checked', false);
                        swal('The email field must be a valid email address !', '', 'warning');

                        event.preventDefault();
                        return false;
                    } else {}
                }
            } else {}
        })

        $("#edtSupplierEmail").on('dblclick', function(e) {
            $('#employeeList').modal('show');
        });
        $('#addRow').on('click', function() {
            var rowData = $('#tblStocktransfer tbody>tr:last').clone(true);
            var rowData1 = $('.stock_print tbody>tr:last').clone(true);
            let tokenid = Random.id();
            $(".lineProductName", rowData).val("");
            // $(".lineProductBarCode", rowData).text("");
            $(".lineDescription", rowData).text("");
            $(".lineOrdered", rowData).val("");
            $(".ID", rowData).text("");
            $(".pqa", rowData).text("");
            $(".lineID", rowData).text("");
            $(".lineProductBarCode", rowData).text("");
            $(".UOMQtyShipped", rowData).val("");
            $(".UOMQtyBackOrder", rowData).text("");
            $(".ProductID", rowData).text("");
            rowData.attr('id', tokenid);
            $("#tblStocktransfer tbody").append(rowData);

            $(".lineProductNamePrint", rowData1).text("");
            $(".lineProductBarCodePrint", rowData1).text("");
            $(".lineDescriptionPrint", rowData1).text("");
            $(".lineTransferPrint", rowData1).text("");
            $(".lineAvailablePrint", rowData1).text("");
            $(".lineAdjustQtyPrint", rowData1).text("");
            // $(".lineAmt", rowData).text("");
            rowData1.attr('id', tokenid);
            $(".stock_print tbody").append(rowData1);
            $('#' + tokenid).css('background', 'transparent');


            setTimeout(function() {
                $('#' + tokenid + " .lineProductName").trigger('click');
            }, 200);
        });
        $('#scanNewRowMobile').on('click', function() {
            var rowData = $('#tblStocktransfer tbody>tr:last').clone(true);
            var rowData1 = $('.stock_print tbody>tr:last').clone(true);
            let tokenid = Random.id();
            $(".lineProductName", rowData).val("");
            // $(".lineProductBarCode", rowData).text("");
            $(".lineDescription", rowData).text("");
            $(".lineOrdered", rowData).val("");
            $(".ID", rowData).text("");
            $(".pqa", rowData).text("");
            $(".lineID", rowData).text("");
            $(".lineProductBarCode", rowData).text("");
            $(".UOMQtyShipped", rowData).val("");
            $(".UOMQtyBackOrder", rowData).text("");
            $(".ProductID", rowData).text("");
            rowData.attr('id', tokenid);
            $("#tblStocktransfer tbody").append(rowData);

            $(".lineProductNamePrint", rowData1).text("");
            $(".lineProductBarCodePrint", rowData1).text("");
            $(".lineDescriptionPrint", rowData1).text("");
            $(".lineTransferPrint", rowData1).text("");
            $(".lineAvailablePrint", rowData1).text("");
            $(".lineAdjustQtyPrint", rowData1).text("");
            // $(".lineAmt", rowData).text("");
            rowData1.attr('id', tokenid);
            $(".stock_print tbody").append(rowData1);
            $('#' + tokenid).css('background', 'transparent');


            // setTimeout(function() {
            //     $('#' + tokenid + " .lineProductName").trigger('click');
            // }, 200);
        });
    });
        /* On click Customer List */

    $(document).on("click", ".chkEmailCopy", function(e) {
        if ($(event.target).is(':checked')) {
            $('#employeeList').modal('show');
            setTimeout(function () {
                $('#tblEmployeelist_filter .form-control-sm').get(0).focus()
              }, 500);

        }
    });

    $(document).on("blur", ".lineUOMQtyShipped", function(event) {
        var targetID = $(event.target).closest('tr').attr('id');
        $('#' + targetID + " .lineAdjustQtyPrint").text($('#' + targetID + " .lineUOMQtyShipped").val());
    });

    /* On clik Inventory Line */
    $(document).on("click", ".tblInventory tbody tr", function(e) {
        $(".colProductName").removeClass('boldtablealertsborder');
        let selectLineID = $('#selectLineID').val();
        var table = $(this);
        let utilityService = new UtilityService();
        let $tblrows = $("#tblStocktransfer tbody tr");
        let transferDepartment = $('#sltDepartment').val() || defaultDept;

        if (selectLineID) {
            let lineProductName = table.find(".productName").text();
            let lineProductDesc = table.find(".productDesc").text();
            let lineUnitPrice = table.find(".salePrice").text();
            let lineExtraSellPrice = JSON.parse(table.find(".colExtraSellPrice").text()) || null;
            let lineAvailQty = table.find(".prdqty").text() || 0;
            let lineBarcode = table.find(".colBarcode").text();
            let lineProductID = table.find(".colProuctPOPID").text();

            $('#' + selectLineID + " .lineProductName").val(lineProductName);
            // $('#' + selectLineID + " .lineProductName").attr("prodid", table.find(".colProuctPOPID").text());
            $('#' + selectLineID + " .colDescription").text(lineProductDesc);
            $('#' + selectLineID + " .lineProductBarCode").text(lineBarcode);
            $('#' + selectLineID + " .colOrdered").val(lineAvailQty);
            $('#' + selectLineID + " .lineUOMQtyShipped").val(0);
            $('#' + selectLineID + " .ProductID").text(lineProductID);
            if (lineProductName != '') {
                templateObject.getProductQty(selectLineID, lineProductName);
            }

            $('.stock_print #' + selectLineID + " .lineProductNamePrint").text(lineProductName);
            $('#' + selectLineID + " .lineDescriptionPrint").text(lineProductDesc);
            $('#' + selectLineID + " .lineProductBarCodePrint ").text(lineBarcode);
            $('#' + selectLineID + " .lineTransferPrint").text(transferDepartment);
            $('#' + selectLineID + " .lineAvailablePrint").text(lineAvailQty);
            $('#' + selectLineID + " .lineAdjustQtyPrint").text(0);
            let lineDepartmentVal = $('#' + selectLineID + " .lineDepartment").val() || defaultDept;
            $('#productListModal').modal('toggle');


        }

        $('#tblInventory_filter .form-control-sm').val('');
        setTimeout(function() {
            //$('#tblCustomerlist_filter .form-control-sm').focus();
            $('.btnRefreshProduct').trigger('click');
            $('.fullScreenSpin').css('display', 'none');
        }, 1000);
    });

    var isMobile = false;
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
        isMobile = true;
    }
    if (isMobile != true) {
        setTimeout(function() {
            document.getElementById("scanBarcodeModalHidden").style.display = "none";
            document.getElementById("scanResult").style.display = "block";
            document.getElementById("mobileScanResult").style.display = "none";
        }, 500);
    }
    if (isMobile == true) {
      setTimeout(function() {
        document.getElementById("scanResult").style.display = "none";
        document.getElementById("mobileScanResult").style.display = "block";
      }, 500);

    }
    setTimeout(function() {
        var html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader", {
                fps: 10,
                qrbox: 250,
                rememberLastUsedCamera: true
            });
        html5QrcodeScanner.render(onScanSuccess);
    }, 500);

    function onScanSuccess(decodedText, decodedResult) {
        var barcodeScanner = decodedText.toUpperCase();
        $('#scanBarcodeModal').modal('toggle');
        if (barcodeScanner != '') {

            // setTimeout(function() {
            //     $('#tblSearchOverview_filter .form-control-sm').val(barcodeScanner);
            // }, 200);
            // templateObject.getAllGlobalSearch(barcodeScanner);
        }
    };


    function onScanSuccessStockTransfer(decodedText, decodedResult) {
        var barcodeScannerStockTransfer = decodedText.toUpperCase();
        $('#scanBarcodeModalStockTransfer').modal('toggle');
        if (barcodeScannerStockTransfer != '') {
            setTimeout(function() {
                $('#allocBarcode').val(barcodeScannerStockTransfer);
                $('#allocBarcode').trigger("input");
            }, 200);


        }
    }


    var html5QrcodeScannerStockTransfer = new Html5QrcodeScanner(
        "qr-reader-stocktransfer", {
            fps: 10,
            qrbox: 250,
            rememberLastUsedCamera: true
        });
    html5QrcodeScannerStockTransfer.render(onScanSuccessStockTransfer);

    $(document).on("click", ".templateItem .btnPreviewTemplate", function (e) {
        title = $(this).parent().attr("data-id");
        number = $(this).parent().attr("data-template-id");//e.getAttribute("data-template-id");
        templateObject.generateInvoiceData(title, number);
    });

    templateObject.generateInvoiceData = async function (template_title, number) {

        object_invoce = [];
        switch (template_title) {

            case "Stock Transfer":
                showStockTransfer(template_title, number, false);
                break;
        }

        await applyDisplaySettings(template_title, number);
    };

    function showStockTransfer(template_title, number, bprint) {

        let invoice_data = templateObject.record.get();
        var array_data = [];
        object_invoce = [];
        let stripe_id = templateObject.accountID.get() || '';
        let stripe_fee_method = templateObject.stripe_fee_method.get();
        let lineItems = [];
        let total = $('#totalBalanceDue').html() || 0;
        let tax = $('#subtotal_tax').html() || 0;
        let customer = $('#edtCustomerName').val();
        let name = $('#firstname').val();
        let surname = $('#lastname').val();
        if (name == undefined)
            name = customer;
        if (surname == undefined)
            surname = "";
        let dept = $('#sltDepartment').val();
        if (dept == "Default" || dept == undefined)
            dept = "";
        var erpGet = erpDb();
        let fx = $('#sltCurrency').val();


        var txaNotes = $('#txaNotes').val();


        var customfield1 = $('#edtSaleCustField1').val() || '  ';
        var customfield2 = $('#edtSaleCustField2').val() || '  ';
        var customfield3 = $('#edtSaleCustField3').val() || '  ';

        var customfieldlabel1 = $('.lblCustomField1').first().text() || 'Custom Field 1';
        var customfieldlabel2 = $('.lblCustomField2').first().text() || 'Custom Field 2';
        var customfieldlabel3 = $('.lblCustomField3').first().text() || 'Custom Field 3';
        var ref_daa = $('#edtReference').val() || '-';
        var applied = $('.appliedAmount').text();

        if (ref_daa == " " || ref_daa == "") {
            ref_daa = "  ";
        }

        var dtPaymentDate = $('#dtPaymentDate').val() || '  ';


        $('#tblStocktransfer > tbody > tr').each(function () {
            var lineID = this.id;

            let lineProductName = $('#' + lineID + " .lineProductName").text();
            let lineDescription = $('#' + lineID + " .lineDescription").text();
            let lineInStockQty = $('#' + lineID + " .lineInStockQty").text();


            array_data.push([
                lineProductName,
                lineDescription,
                lineInStockQty

            ]);


        });
        let company = localStorage.getItem('vs1companyName');
        let vs1User = localStorage.getItem('mySession');
        let customerEmail = $('#edtCustomerEmail').val();
        let id = $('.printID').attr("id") || "new";
        let currencyname = (CountryAbbr).toLowerCase();
        stringQuery = "?";
        var customerID = $('#edtCustomerEmail').attr('customerid');
        for (let l = 0; l < lineItems.length; l++) {
            stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
        }
        stringQuery = stringQuery + "tax=" + tax + "&total=" + total + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + invoice_data.id + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Invoice&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;
        $(".linkText").attr("href", stripeGlobalURL + stringQuery);

        let item_payments = '';


        if (number == 1) {
            item_payments = {
                o_url: localStorage.getItem('vs1companyURL'),
                o_name: localStorage.getItem('vs1companyName'),
                o_address: localStorage.getItem('vs1companyaddress1'),
                o_city: localStorage.getItem('vs1companyCity'),
                o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
                o_reg: Template.paymentcard.__helpers.get('companyReg').call(),
                o_abn: Template.paymentcard.__helpers.get('companyabn').call(),
                o_phone: Template.paymentcard.__helpers.get('companyphone').call(),
                title: "Stock Transfer",
                value: invoice_data.lid,
                date: dtPaymentDate,
                invoicenumber: "",
                refnumber: ref_daa,
                pqnumber: '',
                duedate: '',
                paylink: "",
                supplier_type: "Customer",
                supplier_name: customer,
                supplier_addr: customer + "\r\n" + name + " " + surname + "\r\n" + customerEmail + "\r\n" + dept,
                fields: {
                    "Product_Name": ["30", "left", true],
                    "Description": ["30", "left", true],
                    "Qty": ["20", "left", true],
                },
                subtotal: "",
                gst: "",
                total: "",
                paid_amount: "",
                bal_due: "",
                bsb: '',
                account: '',
                swift: '',
                data: array_data,
                applied: applied,
                customfield1: 'NA',
                customfield2: 'NA',
                customfield3: 'NA',
                customfieldlabel1: 'NA',
                customfieldlabel2: 'NA',
                customfieldlabel3: 'NA',
                showFX: "",
                comment: "",

            };

        } else if (number == 2) {
            item_payments = {
                o_url: localStorage.getItem('vs1companyURL'),
                o_name: localStorage.getItem('vs1companyName'),
                o_address: localStorage.getItem('vs1companyaddress1'),
                o_city: localStorage.getItem('vs1companyCity'),
                o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
                o_reg: Template.paymentcard.__helpers.get('companyReg').call(),
                o_abn: Template.paymentcard.__helpers.get('companyabn').call(),
                o_phone: Template.paymentcard.__helpers.get('companyphone').call(),
                title: "Stock Transfer",
                value: invoice_data.lid,
                date: dtPaymentDate,
                invoicenumber: "",
                refnumber: ref_daa,
                pqnumber: '',
                duedate: '',
                paylink: "",
                supplier_type: "Customer",
                supplier_name: customer,
                supplier_addr: customer + "\r\n" + name + " " + surname + "\r\n" + customerEmail + "\r\n" + dept,
                fields: {
                    "Product_Name": ["30", "left", true],
                    "Description": ["30", "left", true],
                    "Qty": ["20", "left", true],
                },
                subtotal: "",
                gst: "",
                total: "",
                paid_amount: "",
                bal_due: "",
                bsb: '',
                account: '',
                swift: '',
                data: array_data,
                applied: applied,
                customfield1: customfield1,
                customfield2: customfield2,
                customfield3: customfield3,
                customfieldlabel1: customfieldlabel1,
                customfieldlabel2: customfieldlabel2,
                customfieldlabel3: customfieldlabel3,
                showFX: "",
                comment: "",

            };

        } else {

            if (fx == '') {
                fx = '  ';
            }
            item_payments = {
                o_url: localStorage.getItem('vs1companyURL'),
                o_name: localStorage.getItem('vs1companyName'),
                o_address: localStorage.getItem('vs1companyaddress1'),
                o_city: localStorage.getItem('vs1companyCity'),
                o_state: localStorage.getItem('companyState') + ' ' + localStorage.getItem('vs1companyPOBox'),
                o_reg: Template.paymentcard.__helpers.get('companyReg').call(),
                o_abn: Template.paymentcard.__helpers.get('companyabn').call(),
                o_phone: Template.paymentcard.__helpers.get('companyphone').call(),
                title: "Stock Transfer",
                value: invoice_data.lid,
                date: dtPaymentDate,
                invoicenumber: "",
                refnumber: ref_daa,
                pqnumber: '',
                duedate: '',
                paylink: "",
                supplier_type: "Customer",
                supplier_name: customer,
                supplier_addr: customer + "\r\n" + name + " " + surname + "\r\n" + customerEmail + "\r\n" + dept,
                fields: {
                    "Product_Name": ["30", "left", true],
                    "Description": ["30", "left", true],
                    "Qty": ["20", "left", true],
                },
                subtotal: "",
                gst: "",
                total: "",
                paid_amount: "",
                bal_due: "",
                bsb: '',
                account: '',
                swift: '',
                data: array_data,
                applied: applied,
                customfield1: customfield1,
                customfield2: customfield2,
                customfield3: customfield3,
                customfieldlabel1: customfieldlabel1,
                customfieldlabel2: customfieldlabel2,
                customfieldlabel3: customfieldlabel3,
                showFX: fx,
                comment: "",

            };


        }


        object_invoce.push(item_payments);

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

        saveTemplateFields("fields" + template_title, object_invoce[0]["fields"])
    }

    function loadTemplateBody1(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        const data = object_invoce[0]["data"];
        const fieldKeys = Object.keys(object_invoce[0]["fields"]);
        var length = data.length;
        var i = 0;
        for (item of data) {
            var html = '';
            if (i == length - 1) {
                html += "<tr style=''>";
            } else {
                html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            }

            var count = 0;
            for (item_temp of item) {
                if (count == 1) {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='color:#00a3d3; padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else if (count > 2) {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                }
                count++;
            }
            html += "</tr>";
            tbl_content.append(html);
            i++;

        }


        // total amount
        if (noHasTotals.includes(object_invoce[0]["title"])) {
            $("#templatePreviewModal .field_amount").hide();
            $("#templatePreviewModal .field_payment").css("borderRight", "0px solid black");
        } else {
            $("#templatePreviewModal .field_amount").show();
            $("#templatePreviewModal .field_payment").css("borderRight", "1px solid black");
        }

        $('#templatePreviewModal #subtotal_total').text("Sub total");
        $("#templatePreviewModal #subtotal_totalPrint").text(object_invoce[0]["subtotal"]);
        $('#templatePreviewModal #grandTotal').text("Grand total");
        $("#templatePreviewModal #grandTotalPrint").text(object_invoce[0]["total"]);
        $("#templatePreviewModal #totalBalanceDuePrint").text(object_invoce[0]["bal_due"]);
        $("#templatePreviewModal #paid_amount").text(object_invoce[0]["paid_amount"]);

    }

    function loadTemplateBody2(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        const data = object_invoce[0]["data"];
        const fieldKeys = Object.keys(object_invoce[0]["fields"]);
        var length = data.length;
        var i = 0;
        for (item of data) {
            var html = '';
            if (i == length - 1) {
                html += "<tr style=''>";
            } else {
                html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            }

            var count = 0;
            for (item_temp of item) {
                if (count == 1) {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='color:#00a3d3; padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else if (count > 2) {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                }
                count++;
            }
            html += "</tr>";
            tbl_content.append(html);
            i++;

        }


        // total amount
        if (noHasTotals.includes(object_invoce[0]["title"])) {
            $(".subtotal2").hide();
        } else {
            $(".subtotal2").show();
        }

        $("#templatePreviewModal #subtotal_totalPrint2").text(
            object_invoce[0]["subtotal"]
        );
        $("#templatePreviewModal #grandTotalPrint2").text(
            object_invoce[0]["total"]
        );
        $("#templatePreviewModal #totalBalanceDuePrint2").text(
            object_invoce[0]["bal_due"]
        );
        $("#templatePreviewModal #paid_amount2").text(
            object_invoce[0]["paid_amount"]
        );

    }

    function loadTemplateBody3(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        const data = object_invoce[0]["data"];
        const fieldKeys = Object.keys(object_invoce[0]["fields"]);
        var length = data.length;
        var i = 0;
        for (item of data) {
            var html = '';
            if (i == length - 1) {
                html += "<tr style=''>";
            } else {
                html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>";
            }

            var count = 0;
            for (item_temp of item) {
                if (count == 1) {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='color:#00a3d3; padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else if (count > 2) {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                } else {
                    html = html + "<td class=\"" + fieldKeys[i] + "\" style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
                }
                count++;
            }
            html += "</tr>";
            tbl_content.append(html);
            i++;

        }

        // total amount
        if (noHasTotals.includes(object_invoce[0]["title"])) {
            $(".subtotal3").hide();
        } else {
            $(".subtotal3").show();
        }

        $("#templatePreviewModal #subtotal_totalPrint3").text(
            object_invoce[0]["subtotal"]
        );
        $("#templatePreviewModal #totalTax_totalPrint3").text(
            object_invoce[0]["gst"]
        );
        $("#templatePreviewModal #totalBalanceDuePrint3").text(
            object_invoce[0]["bal_due"]
        );

    }

    function updateTemplate1(object_invoce, bprint) {
        initTemplateHeaderFooter1();
        $("#html-2-pdfwrapper").show();
        $("#html-2-pdfwrapper2").hide();
        $("#html-2-pdfwrapper3").hide();
        if (bprint == false)
            $("#templatePreviewModal").modal("toggle");
        loadTemplateHeaderFooter1(object_invoce);
        loadTemplateBody1(object_invoce);
    }

    function updateTemplate2(object_invoce, bprint) {
        initTemplateHeaderFooter2();
        $("#html-2-pdfwrapper").hide();
        $("#html-2-pdfwrapper2").show();
        $("#html-2-pdfwrapper3").hide();
        if (bprint == false)
            $("#templatePreviewModal").modal("toggle");
        loadTemplateHeaderFooter2(object_invoce);
        loadTemplateBody2(object_invoce);
    }

    function updateTemplate3(object_invoce, bprint) {
        initTemplateHeaderFooter3();
        $("#html-2-pdfwrapper").hide();
        $("#html-2-pdfwrapper2").hide();
        $("#html-2-pdfwrapper3").show();
        if (bprint == false)
            $("#templatePreviewModal").modal("toggle");
        loadTemplateHeaderFooter3(object_invoce);
        loadTemplateBody3(object_invoce);
    }

    function saveTemplateFields(key, value) {
        localStorage.setItem(key, value)
    }
});

Template.stocktransfercard.events({

    'click .lineProductBarCode, click .lineDescription, click .lineOrdered': function(event) {
        let templateObject = Template.instance();


            var $tblrow = $("#tblStocktransfer tbody tr");
            var targetID = $(event.target).closest('tr').attr('id');
            var prodPQALine = "";
            var dataListRet = "";

            var productName = $('#' + targetID + " .lineProductName").val() || '';
            var productID = $('#' + targetID + " .ProductID").text() || '';
            prodPQALine = $('#' + targetID + " .lineID").text();
            /*
          if (FlowRouter.current().queryParams.id) {
            $('input[name="prodID"]').val($('#' + targetID + " .ProductID").text());
            $('input[name="orderQty"]').val($('#' + targetID + " .colOrdered").val());
            let countSerial = 0;
            //$('table tr').css('background','#ffffff');
            $('table tr').css('background', 'transparent');
            $('#serailscanlist').find('tbody').remove();

            $('input[name="salesLineRow"]').val(targetID);
            prodPQALine = $('#' + targetID + " .lineID").text();
            var segsSerial = prodPQALine.split(',');
            $('#' + targetID).css('background', 'rgba(0,163,211,0.1)');
            for (let s = 0; s < segsSerial.length; s++) {
                countSerial++;
                let scannedCode = "PSN-" + productID + "-" + segsSerial[s];
                let htmlAppend = '<tr class="dnd-moved"><td class="form_id">' + countSerial + '</td><td>' + '' +
                    '</td><td>' + '</td>' +
                    '<td>' + '<input type="text" style="text-align: left !important;" name="serialNoBOM" id="serialNoBOM" class="highlightInput " value="' + scannedCode + '" readonly>' + '</td><td class="hiddenColumn"><input type="text" style="text-align: left !important;" name="serialNo" id="serialNo" class="highlightInput " value="' + segsSerial[s] + '" readonly></td><td style="width: 1%;"><span class=" removesecondtablebutton"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 "><i class="fa fa-remove"></i></button></span></td>' +
                    '</tr>';
                if (segsSerial[s] != '') {
                    //$("#serailscanlist").append(htmlAppend);
                }

            }

            //templateObject.getProductQty(targetID, productName);

        }
        */
        if (productName != '') {
            templateObject.getProductQty(targetID, productName);
        }
    },
    'click #includeInvoiceAttachment': function(e) {
        let templateObject = Template.instance();
        if ($('#includeInvoiceAttachment').prop('checked')) {
            templateObject.includeInvoiceAttachment.set(true);
            $(".btnprintDockets").attr("data-toggle", "modal");
            $(".btnprintDockets").attr("data-target", "#print-dockets");
            $(".btnprintDockets").attr("data-dismiss", "modal");
        } else {
            templateObject.includeInvoiceAttachment.set(false);
            let isInvoice = templateObject.includeInvoiceAttachment.get();
            let isShippingDocket = templateObject.includeDocketAttachment.get();
            if (!(isInvoice) && !(isShippingDocket)) {
                $(".btnprintDockets").removeAttr("data-toggle");
                $(".btnprintDockets").removeAttr("data-target");
                $(".btnprintDockets").removeAttr("data-dismiss");
            }
        }
    },
    'click #includeDocketAttachment': function(e) {
        let templateObject = Template.instance();

        if ($('#includeDocketAttachment').prop('checked')) {
            templateObject.includeDocketAttachment.set(true);
            $(".btnprintDockets").attr("data-toggle", "modal");
            $(".btnprintDockets").attr("data-target", "#print-dockets");
            $(".btnprintDockets").attr("data-dismiss", "modal");
        } else {
            templateObject.includeDocketAttachment.set(false);
            let isInvoice = templateObject.includeInvoiceAttachment.get();
            let isShippingDocket = templateObject.includeDocketAttachment.get();
            if (!(isInvoice) && !(isShippingDocket)) {
                $(".btnprintDockets").removeAttr("data-toggle");
                $(".btnprintDockets").removeAttr("data-target");
                $(".btnprintDockets").removeAttr("data-dismiss");
            }

        }
    },
    'click .btnprintDockets': function(e) {
        playPrintAudio();
        let templateObject = Template.instance();
        setTimeout(function(){
        let invoiceID = parseInt($("#SalesId").val());

        let isInvoice = templateObject.includeInvoiceAttachment.get();
        let isShippingDocket = templateObject.includeDocketAttachment.get();

        if (invoiceID) {
            if ((isInvoice) && (isShippingDocket)) {
                let templateObject = Template.instance();
                let printType = "InvoiceANDDeliveryDocket";
                templateObject.SendShippingDetails(printType);

            }
            if ((isInvoice) && !(isShippingDocket)) {
                let templateObject = Template.instance();
                let printType = "InvoiceOnly";
                templateObject.SendShippingDetails(printType);
            }
            if ((isShippingDocket) && !(isInvoice)) {
                let templateObject = Template.instance();
                let printType = "DeliveryDocketsOnly";
                templateObject.SendShippingDetails(printType);
            }
        }
    }, delayTimeAfterSound);
    },
    'click .btnprintInvoice': function(e) {
        playPrintAudio();
        let templateObject = Template.instance();
        setTimeout(function(){

        let printType = "InvoiceOnly";
        templateObject.SendShippingDetails(printType);
    }, delayTimeAfterSound);
    },
    'click .btnprintDelDocket': function(e) {
        playPrintAudio();
        let templateObject = Template.instance();
        setTimeout(function(){

        let printType = "DeliveryDocketsOnly";
        templateObject.SendShippingDetails(printType);
    }, delayTimeAfterSound);
    },
    'click #printDockets': function(e) {
        const templateObject = Template.instance();
    },
    'click .viewMoreSerialNo': function(e) {
        $('#tblAvailableSerialNo .hiddenColumn').addClass('showHiddenColumn');
        $('#tblAvailableSerialNo .hiddenColumn').removeClass('hiddenColumn');
        $('.viewMoreSerialNo').css('display', 'none');
        $('.viewLessSerialNo').css('display', 'inline-block');
    },
    'click .viewLessSerialNo': function(e) {
        $('#tblAvailableSerialNo .showHiddenColumn').addClass('hiddenColumn');
        $('#tblAvailableSerialNo .showHiddenColumn').removeClass('showHiddenColumn');
        $('.viewMoreSerialNo').css('display', 'inline-block');
        $('.viewLessSerialNo').css('display', 'none');
    },
    'click .btnBack': function(event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function(){
        history.back(1);
        }, delayTimeAfterSound);
    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        setTimeout(function(){
      $('.fullScreenSpin').css('display', 'inline-block');
        $('#html-2-pdfwrapper').css('display', 'block');
        $('.pdfCustomerName').html($('#sltDepartment').val());
        $('.pdfCustomerAddress').html($('#txabillingAddress').val());
        $('#printcomment').html($('#txtNotes').val().replace(/[\r\n]/g, "<br />"));
        let isReadyToSave  = false;
        $('#tblStocktransfer > tbody > tr').each(function() {
            var lineID = this.id;
            let tdproduct = $('#' + lineID + " .lineProductName").val();
            let tdproductID = $('#' + lineID + " .lineProductName").attr('productid');
            let tdproductCost = $('#' + lineID + " .lineProductName").attr('productcost');
            let tdbarcode = $('#' + lineID + " .lineProductBarCode").html();
            let tddescription = $('#' + lineID + " .lineDescription").html() || '';
            let tdserialNumber = $('#' + lineID + " .pqa").text() || '';
            var segsSerialLenght = tdserialNumber.split(',');
            let tdDepartment = $('#' + lineID + " .lineDepartment").val();

            let tdavailqty = $('#' + lineID + " .lineOrdere").val();
            let tdtransferqty = $('#' + lineID + " .lineUOMQtyShipped").val();
            if (tdproduct != "") {
              if(segsSerialLenght.length == tdtransferqty){

                isReadyToSave = true;
              }else{
                isReadyToSave = false;
                Bert.alert('<strong>WARNING:</strong> Your serial number scanned quantity does not match your transfer quantity. Please scan in the correct quantity.', 'now-danger');
                DangerSound();
                $('.fullScreenSpin').css('display', 'none');
                event.preventDefault();
                return false;
              }
            }
        });
        if(isReadyToSave){
        exportSalesToPdf();
      }else{
        $('#html-2-pdfwrapper').css('display', 'none');
        $('.fullScreenSpin').css('display', 'none');
      }
    }, delayTimeAfterSound);
    },
    'click .btnProcess': function(event) {
         if ($('.chkEmailCopy').is(':checked')) {
        $('#html-2-pdfwrapper').css('display', 'block');
        }
        let templateObject = Template.instance();
        //let customername = $('#edtCustomerName').val() || '';
        // let shippingaddress = $('#txaShipingInfo').val() || '';
        let transferFrom = $('#sltDepartment').val() || '';
        let shipVia = $('#shipvia').val() || '';
        let conNote = $('#shipcomments').val() || '';
        let toAccount = $('#sltBankAccountName').val() || '';
        let stockTransferService = new StockTransferService();
        //$('.loginSpinner').css('display','inline-block');
        $('.fullScreenSpin').css('display', 'inline-block');
        var splashLineArray = new Array();
        let lineItemsForm = [];
        let lineItemObjForm = {};
        let isReadyToSave  = false;
        $('#tblStocktransfer > tbody > tr').each(function() {
            var lineID = this.id;
            let tdproduct = $('#' + lineID + " .lineProductName").val();
            let tdproductID = $('#' + lineID + " .lineProductName").attr('productid');
            let tdproductCost = $('#' + lineID + " .lineProductName").attr('productcost');
            let tdbarcode = $('#' + lineID + " .lineProductBarCode").html();
            let tddescription = $('#' + lineID + " .lineDescription").html() || '';
            let tdserialNumber = $('#' + lineID + " .pqa").text() || '';
            var segsSerialLenght = tdserialNumber.split(',');
            // let tdfinalqty = $('#' + lineID + " .lineFinalQty").val();
            // let tdadjustqty = $('#' + lineID + " .lineAdjustQty").val();
            let tdDepartment = $('#' + lineID + " .lineDepartment").val();

            let tdavailqty = $('#' + lineID + " .lineOrdere").val();
            let tdtransferqty = $('#' + lineID + " .lineUOMQtyShipped").val();
            let transferSerialNos = $('#' + lineID + ' .colSerialFrom').attr('data-serialnumbers');
            let newSerialNos = $('#' + lineID + ' .colSerialTo').attr('data-serialnumbers');
            let transferLotNos = $('#' + lineID + " .colSerialFrom").attr('data-lotnumbers');
            let newLotNos = $('#' + lineID + " .colSerialTo").attr('data-lotnumbers');
            let transferExpiryDates = $('#' + lineID + " .colSerialFrom").attr('data-expirydates');
            let newExpiryDates = $('#' + lineID + " .colSerialTo").attr('data-expirydates');

            if (tdproduct != "") {
                if (newSerialNos) {
                    newSerialNos = newSerialNos.split(',');
                    for (let i = 0; i < newSerialNos.length; i++) {
                        lineItemObjForm = {
                            type: "TSTELinesFlat",
                            fields: {
                                ProductName: tdproduct || '',
                                AccountName: 'Inventory Asset',
                                TransferQty: parseInt(tdtransferqty) || 0,
                                ClassNameTo: tdDepartment || defaultDept,
                                PartBarcode: tdbarcode || '',
                                OrderQty: parseInt(tdtransferqty) || 0,
                            }
                        };
                        lineItemObjForm.fields.SerialNumber = newSerialNos[i];
                        if (transferSerialNos) {
                            lineItemObjForm.fields.TransferSerialnos = transferSerialNos.split(',')[i] || '';
                        }
                        splashLineArray.push(lineItemObjForm);
                    }
                } else if (newLotNos || transferLotNos) {
                    newLotNos = newLotNos.split(',');
                    newExpiryDates = newExpiryDates.split(',');
                    transferExpiryDates = transferExpiryDates.split(',');
                    for (let i = 0; i< newLotNos.length; i++) {
                        lineItemObjForm = {
                            type: "TSTELinesFlat",
                            fields: {
                                ProductName: tdproduct || '',
                                AccountName: 'Inventory Asset',
                                TransferQty: parseInt(tdtransferqty) || 0,
                                ClassNameTo: tdDepartment || defaultDept,
                                PartBarcode: tdbarcode || '',
                                OrderQty: parseInt(tdtransferqty) || 0,
                            }
                        };
                        let newExpiryDate = newExpiryDates[i].split('/');
                        let transferExpiryDate = transferExpiryDates[i].split('/');
                        lineItemObjForm.fields.BatchNoTo = newLotNos[i] || '';
                        lineItemObjForm.fields.ExpiryDateTo = new Date(`${newExpiryDate[2]}-${newExpiryDate[1]}-${newExpiryDate[0]}`).toISOString() || '';
                        if (transferLotNos) {
                            lineItemObjForm.fields.BatchNoFrom = transferLotNos.split(',')[i] || '';
                            lineItemObjForm.fields.ExpiryDateFrom = new Date(`${transferExpiryDate[2]}-${transferExpiryDate[1]}-${transferExpiryDate[0]}`).toISOString() || '';
                        }
                        splashLineArray.push(lineItemObjForm);
                    }
                } else {
                    lineItemObjForm = {
                        type: "TSTELinesFlat",
                        fields: {
                            ProductName: tdproduct || '',
                            AccountName: 'Inventory Asset',
                            TransferQty: parseInt(tdtransferqty) || 0,
                            ClassNameTo: tdDepartment || defaultDept,
                            PartBarcode: tdbarcode || '',
                            OrderQty: parseInt(tdtransferqty) || 0,
                        }
                    };
                    splashLineArray.push(lineItemObjForm);
                }

                isReadyToSave = true;
            }

            // }else{
            //   isReadyToSave = false;
            //   swal('', 'Your serial number scanned quantity does not match your transfer quantity. Please scan in the correct quantity.', 'danger');
            //   $('.fullScreenSpin').css('display', 'none');
            //   event.preventDefault();
            //   return false;
            // }
        });

        let selectAccount = $('#sltAccountName').val();

        let notes = $('#shipcomments').val() || '';
        let reason = $('#txtNotes').val() || '';
        var creationdateTime = new Date($("#dtShipDate").datepicker("getDate"));
        let creationDate = creationdateTime.getFullYear() + "-" + (creationdateTime.getMonth() + 1) + "-" + creationdateTime.getDate();
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentStock = getso_id[getso_id.length - 1];
        // let uploadedItems = templateObject.uploadedFiles.get();
        var objDetails = '';
        if (getso_id[1]) {
            currentStock = parseInt(currentStock);
            objDetails = {
                type: "TStockTransferEntry",
                fields: {
                    ID: currentStock,
                    AccountName: selectAccount,
                    TransferFromClassName: transferFrom,
                    DateTransferred: creationDate,
                    DoProcessonSave: true,
                    Transfertype: "Gen",
                    EnforceUOM: false,
                    Lines: splashLineArray,
                    EmployeeName: localStorage.getItem('mySessionEmployee'),
                    Shipping: shipVia,
                    Notes: notes,
                    Description: reason

                }
            };
        } else {
            objDetails = {
                type: "TStockTransferEntry",
                fields: {
                    AccountName: selectAccount,
                    TransferFromClassName: transferFrom,
                    DateTransferred: creationDate,
                    DoProcessonSave: true,
                    Transfertype: "Gen",
                    EnforceUOM: false,
                    Lines: splashLineArray,
                    EmployeeName: localStorage.getItem('mySessionEmployee'),
                    Shipping: shipVia,
                    Notes: notes,
                    Description: reason
                }
            };
        }
        if(isReadyToSave){
        stockTransferService.saveStockTransfer(objDetails).then(function(objDetails) {
            function generatePdfForMail(invoiceId) {
                let file = "Invoice-" + invoiceId + ".pdf"
                return new Promise((resolve, reject) => {
                    let templateObject = Template.instance();
                    let completeTabRecord;
                    let doc = new jsPDF('p', 'pt', 'a4');
                    var source = document.getElementById('html-2-pdfwrapper');
                    var opt = {
                        margin: 0,
                        filename: file,
                        image: {
                            type: 'jpeg',
                            quality: 0.98
                        },
                        html2canvas: {
                            scale: 2
                        },
                        jsPDF: {
                            unit: 'in',
                            format: 'a4',
                            orientation: 'portrait'
                        }
                    }
                    resolve(html2pdf().set(opt).from(source).toPdf().output('datauristring'));

                });
            }

            async function addAttachment() {
                let attachment = [];
                let templateObject = Template.instance();

                let invoiceId = objDetails.fields.ID;
                let encodedPdf = await generatePdfForMail(invoiceId);
                // var base64data = reader.result;
                let base64data = encodedPdf.split(',')[1];
                pdfObject = {
                    filename: 'Stock Transfer-' + invoiceId + '.pdf',
                    content: base64data,
                    encoding: 'base64'
                };
                attachment.push(pdfObject);
                let erpInvoiceId = objDetails.fields.ID;

                let mailFromName = localStorage.getItem('vs1companyName');
                let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                //let customerEmailName = $('#edtCustomerName').val();
                let checkEmailData = $('#edtSupplierEmail').val();
                // let grandtotal = $('#grandTotal').html();
                // let amountDueEmail = $('#totalBalanceDue').html();
                // let emailDueDate = $("#dtDueDate").val();
                // let customerBillingAddress = $('#txabillingAddress').val();
                // let customerTerms = $('#sltTerms').val();

                // let customerSubtotal = $('#subtotal_total').html();
                // let customerTax = $('#subtotal_tax').html();
                // let customerNett = $('#subtotal_nett').html();
                // let customerTotal = $('#grandTotal').html();
                let mailSubject = 'Stock Transfer ' + erpInvoiceId + ' from ' + mailFromName;
                let mailBody = "Hi " + ",\n\n Here's Stock Transfer " + erpInvoiceId + " from  " + mailFromName;

                var htmlmailBody = '    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate;mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">' +
                    '        <tr>' +
                    '            <td class="container" style="display: block; margin: 0 auto !important; max-width: 650px; padding: 10px; width: 650px;">' +
                    '                <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 650px; padding: 10px;">' +
                    '                    <table class="main">' +
                    '                        <tr>' +
                    '                            <td class="wrapper">' +
                    '                                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">' +
                    '                                    <tr>' +
                    '                                        <td class="content-block" style="text-align: center; letter-spacing: 2px;">' +
                    '                                            <span class="doc-details" style="color: #999999; font-size: 12px; text-align: center; margin: 0 auto; text-transform: uppercase;">Stock Transfer No. ' + erpInvoiceId + ' Details</span>' +
                    '                                        </td>' +
                    '                                    </tr>' +
                    '                                    <tr style="height: 16px;"></tr>' +
                    '                                    <tr>' +
                    '                                        <td>' +
                    '                                            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%;" />' +
                    '                                        </td>' +
                    '                                    </tr>' +
                    '                                    <tr style="height: 48px;"></tr>' +
                    '                                    <tr>' +
                    '                                        <td class="content-block" style="padding: 16px 32px;">' +
                    '                                            <p style="font-size: 18px;">Hi </p>' +
                    '                                            <p style="font-size: 18px; margin: 34px 0px;">Please find the Stock Transfer attached to this email.</p>' +
                    '                                            <p style="font-size: 18px; margin-bottom: 8px;">Thanks you</p>' +
                    '                                            <p style="font-size: 18px;">' + mailFromName + '</p>' +
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
                    '                                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Company Inc, 3 Abbey Road, San Francisco CA 90210</span>' +
                    '                                    <br>' +
                    '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Privacy</a>' +
                    '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Security</a>' +
                    '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Terms of Service</a>' +
                    '                                </td>' +
                    '                            </tr>' +
                    '                        </table>' +
                    '                    </div>' +
                    '                </div>' +
                    '            </td>' +
                    '        </tr>' +
                    '    </table>';

                if ($('.chkEmailCopy').is(':checked')) {

                    $('#html-2-pdfwrapper').css('display', 'none');
                    Meteor.call('sendEmail', {
                        from: "" + mailFromName + " <" + mailFrom + ">",
                        to: checkEmailData,
                        subject: mailSubject,
                        text: '',
                        html: htmlmailBody,
                        attachments: attachment
                    }, function(error, result) {
                        if (error && error.error === "error") {
                            FlowRouter.go('/stocktransferlist?success=true');

                        } else {
                            swal({
                                title: 'SUCCESS',
                                text: "Email Sent To Employee: " + checkEmailData + " ",
                                type: 'success',
                                showCancelButton: false,
                                confirmButtonText: 'OK'
                            }).then((result) => {
                                if (result.value) {
                                    FlowRouter.go('/stocktransferlist?success=true');
                                } else if (result.dismiss === 'cancel') {}
                            });

                            $('.fullScreenSpin').css('display', 'none');
                        }
                    });

                } else {
                    FlowRouter.go('/stocktransferlist?success=true');
                };

            }
            addAttachment();

            $('.modal-backdrop').css('display', 'none');

        }).catch(function(err) {
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                    Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {}
            });
            //$('.loginSpinner').css('display','none');
            $('.fullScreenSpin').css('display', 'none');
        });
      }else{
        $('.fullScreenSpin').css('display', 'none');
      }


    },
    'click .btnHold': function(event) {
      if ($('.chkEmailCopy').is(':checked')) {
      $('#html-2-pdfwrapper').css('display', 'block');
      }
      let templateObject = Template.instance();
      //let customername = $('#edtCustomerName').val() || '';
      //let shippingaddress = $('#txaShipingInfo').val() || '';
      let transferFrom = $('#sltDepartment').val() || '';
      let shipVia = $('#shipvia').val() || '';
      let conNote = $('#shipcomments').val() || '';
      let toAccount = $('#sltBankAccountName').val() || '';
      // let department = $('#sltDepartment').val();
      let stockTransferService = new StockTransferService();
      //$('.loginSpinner').css('display','inline-block');
      $('.fullScreenSpin').css('display', 'inline-block');
      var splashLineArray = new Array();
      let lineItemsForm = [];
      let lineItemObjForm = {};
      let isReadyToSave  = false;
      $('#tblStocktransfer > tbody > tr').each(function() {
          var lineID = this.id;
          let tdproduct = $('#' + lineID + " .lineProductName").val();
          let tdproductID = $('#' + lineID + " .lineProductName").attr('productid');
          let tdproductCost = $('#' + lineID + " .lineProductName").attr('productcost');
          let tdbarcode = $('#' + lineID + " .lineProductBarCode").html();
          let tddescription = $('#' + lineID + " .lineDescription").html() || '';
          let tdserialNumber = $('#' + lineID + " .pqa").text();
          var segsSerialLenght = tdserialNumber.split(',');
          // let tdfinalqty = $('#' + lineID + " .lineFinalQty").val();
          // let tdadjustqty = $('#' + lineID + " .lineAdjustQty").val();
          let tdDepartment = $('#' + lineID + " .lineDepartment").val();

          let tdavailqty = $('#' + lineID + " .lineOrdere").val();
          let tdtransferqty = $('#' + lineID + " .lineUOMQtyShipped").val() || 0;
          let tdInitialTransfer = $('#' + lineID + " .InitTransfer").text()||0;
          let transferSerialNos = $('#' + lineID + ' .colSerialFrom').attr('data-serialnumbers');
        let newSerialNos = $('#' + lineID + ' .colSerialTo').attr('data-serialnumbers');

        if (tdproduct != "") {
            if (newSerialNos) {
                newSerialNos = newSerialNos.split(',');
                for (let i = 0; i < newSerialNos.length; i++) {
                    lineItemObjForm = {
                        type: "TSTELinesFlat",
                        fields: {
                            ProductName: tdproduct || '',
                            AccountName: 'Inventory Asset',
                            TransferQty: parseInt(tdtransferqty) || 0,
                            ClassNameTo: tdDepartment || defaultDept,
                            PartBarcode: tdbarcode || '',
                            OrderQty: parseInt(tdtransferqty) || 0,
                        }
                    };
                    lineItemObjForm.fields.SerialNumber = newSerialNos[i];
                    if (transferSerialNos) {
                        lineItemObjForm.fields.TransferSerialnos = transferSerialNos.split(',')[i] || '';
                    }
                    splashLineArray.push(lineItemObjForm);
                }
            } else {
                lineItemObjForm = {
                    type: "TSTELinesFlat",
                    fields: {
                        ProductName: tdproduct || '',
                        AccountName: 'Inventory Asset',
                        TransferQty: parseInt(tdtransferqty) || 0,
                        ClassNameTo: tdDepartment || defaultDept,
                        PartBarcode: tdbarcode || '',
                        OrderQty: parseInt(tdtransferqty) || 0,
                    }
                };
                splashLineArray.push(lineItemObjForm);
            }

            isReadyToSave = true;
        }

        // }else{
        //   isReadyToSave = false;
        //   swal('', 'Your serial number scanned quantity does not match your transfer quantity. Please scan in the correct quantity.', 'danger');
        //   $('.fullScreenSpin').css('display', 'none');
        //   event.preventDefault();
        //   return false;
        // }
      });

      let selectAccount = $('#sltAccountName').val();

      let notes = $('#shipcomments').val();
      let reason = $('#txtNotes').val() || '';
      var creationdateTime = new Date($("#dtShipDate").datepicker("getDate"));
      let creationDate = creationdateTime.getFullYear() + "-" + (creationdateTime.getMonth() + 1) + "-" + creationdateTime.getDate();
      var url = FlowRouter.current().path;
      var getso_id = url.split('?id=');
      var currentStock = getso_id[getso_id.length - 1];
      // let uploadedItems = templateObject.uploadedFiles.get();
      var objDetails = '';
      if (getso_id[1]) {
          currentStock = parseInt(currentStock);
          objDetails = {
              type: "TStockTransferEntry",
              fields: {
                  ID: currentStock,
                  AccountName: selectAccount,
                  DateTransferred: creationDate,
                  // AdjustmentOnInStock: true,
                  // AdjustType: "Gen",
                  // Approved: false,
                  CreationDate: creationDate,
                  //Deleted: false,
                  EmployeeName: localStorage.getItem('mySessionEmployee'),
                  EnforceUOM: false,
                  //ISEmpty:false,
                  //IsStockTake:false,
                  Lines: splashLineArray,
                  DoProcessonSave: false,
                  Notes: notes,
                  Description: reason,
                  // SalesRef: conNote,
                  TransferFromClassName: transferFrom,
                  Transfertype: "Gen",
                  Shipping: shipVia

              }
          };
      } else {
          objDetails = {
              type: "TStockTransferEntry",
              fields: {
                  AccountName: selectAccount,
                  DateTransferred: creationDate,
                  // AdjustmentOnInStock: true,
                  // AdjustType: "Gen",
                  // Approved: false,
                  CreationDate: creationDate,
                  //Deleted: false,
                  EmployeeName: localStorage.getItem('mySessionEmployee'),
                  EnforceUOM: false,
                  //ISEmpty:false,
                  //IsStockTake:false,
                  Lines: splashLineArray,
                  DoProcessonSave: false,
                  Notes: notes,
                  Description: reason,
                  // SalesRef: conNote,
                  TransferFromClassName: transferFrom,
                  Transfertype: "Gen",
                  Shipping: shipVia
              }
          };
      }
      if(isReadyToSave){
      stockTransferService.saveStockTransfer(objDetails).then(function(objDetails) {
          function generatePdfForMail(invoiceId) {
              let file = "Invoice-" + invoiceId + ".pdf"
              return new Promise((resolve, reject) => {
                  let templateObject = Template.instance();
                  let completeTabRecord;
                  let doc = new jsPDF('p', 'pt', 'a4');
                  var source = document.getElementById('html-2-pdfwrapper');
                  var opt = {
                      margin: 0,
                      filename: file,
                      image: {
                          type: 'jpeg',
                          quality: 0.98
                      },
                      html2canvas: {
                          scale: 2
                      },
                      jsPDF: {
                          unit: 'in',
                          format: 'a4',
                          orientation: 'portrait'
                      }
                  }
                  resolve(html2pdf().set(opt).from(source).toPdf().output('datauristring'));

              });
          }

          async function addAttachment() {
              let attachment = [];
              let templateObject = Template.instance();

              let invoiceId = objDetails.fields.ID;
              let encodedPdf = await generatePdfForMail(invoiceId);
              // var base64data = reader.result;
              let base64data = encodedPdf.split(',')[1];
              pdfObject = {
                  filename: 'Stock Transfer-' + invoiceId + '.pdf',
                  content: base64data,
                  encoding: 'base64'
              };
              attachment.push(pdfObject);
              let erpInvoiceId = objDetails.fields.ID;

              let mailFromName = localStorage.getItem('vs1companyName');
              let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
              //let customerEmailName = $('#edtCustomerName').val();
              let checkEmailData = $('#edtSupplierEmail').val();
              // let grandtotal = $('#grandTotal').html();
              // let amountDueEmail = $('#totalBalanceDue').html();
              // let emailDueDate = $("#dtDueDate").val();
              // let customerBillingAddress = $('#txabillingAddress').val();
              // let customerTerms = $('#sltTerms').val();

              // let customerSubtotal = $('#subtotal_total').html();
              // let customerTax = $('#subtotal_tax').html();
              // let customerNett = $('#subtotal_nett').html();
              // let customerTotal = $('#grandTotal').html();
              let mailSubject = 'Stock Transfer ' + erpInvoiceId + ' from ' + mailFromName;
              let mailBody = "Hi " + ",\n\n Here's Stock Transfer " + erpInvoiceId + " from  " + mailFromName;

              var htmlmailBody = '    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate;mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">' +
                  '        <tr>' +
                  '            <td class="container" style="display: block; margin: 0 auto !important; max-width: 650px; padding: 10px; width: 650px;">' +
                  '                <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 650px; padding: 10px;">' +
                  '                    <table class="main">' +
                  '                        <tr>' +
                  '                            <td class="wrapper">' +
                  '                                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">' +
                  '                                    <tr>' +
                  '                                        <td class="content-block" style="text-align: center; letter-spacing: 2px;">' +
                  '                                            <span class="doc-details" style="color: #999999; font-size: 12px; text-align: center; margin: 0 auto; text-transform: uppercase;">Stock Transfer No. ' + erpInvoiceId + ' Details</span>' +
                  '                                        </td>' +
                  '                                    </tr>' +
                  '                                    <tr style="height: 16px;"></tr>' +
                  '                                    <tr>' +
                  '                                        <td>' +
                  '                                            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%;" />' +
                  '                                        </td>' +
                  '                                    </tr>' +
                  '                                    <tr style="height: 48px;"></tr>' +
                  '                                    <tr>' +
                  '                                        <td class="content-block" style="padding: 16px 32px;">' +
                  '                                            <p style="font-size: 18px;">Hi </p>' +
                  '                                            <p style="font-size: 18px; margin: 34px 0px;">Please find the Stock Transfer attached to this email.</p>' +
                  '                                            <p style="font-size: 18px; margin-bottom: 8px;">Thanks you</p>' +
                  '                                            <p style="font-size: 18px;">' + mailFromName + '</p>' +
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
                  '                                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Company Inc, 3 Abbey Road, San Francisco CA 90210</span>' +
                  '                                    <br>' +
                  '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Privacy</a>' +
                  '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Security</a>' +
                  '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Terms of Service</a>' +
                  '                                </td>' +
                  '                            </tr>' +
                  '                        </table>' +
                  '                    </div>' +
                  '                </div>' +
                  '            </td>' +
                  '        </tr>' +
                  '    </table>';


              if ($('.chkEmailCopy').is(':checked')) {

                  $('#html-2-pdfwrapper').css('display', 'none');
                  Meteor.call('sendEmail', {
                      from: "" + mailFromName + " <" + mailFrom + ">",
                      to: checkEmailData,
                      subject: mailSubject,
                      text: '',
                      html: htmlmailBody,
                      attachments: attachment
                  }, function(error, result) {
                      if (error && error.error === "error") {
                          FlowRouter.go('/stocktransferlist?success=true');

                      } else {
                          swal({
                              title: 'SUCCESS',
                              text: "Email Sent To Employee: " + checkEmailData + " ",
                              type: 'success',
                              showCancelButton: false,
                              confirmButtonText: 'OK'
                          }).then((result) => {
                              if (result.value) {
                                  FlowRouter.go('/stocktransferlist?success=true');
                              } else if (result.dismiss === 'cancel') {}
                          });

                          $('.fullScreenSpin').css('display', 'none');
                      }
                  });

              } else {
                  FlowRouter.go('/stocktransferlist?success=true');
              };

          }
          addAttachment();
          $('.modal-backdrop').css('display', 'none');

      }).catch(function(err) {
          swal({
              title: 'Oooops...',
              text: err,
              type: 'error',
              showCancelButton: false,
              confirmButtonText: 'Try Again'
          }).then((result) => {
              if (result.value) {
                  Meteor._reload.reload();
              } else if (result.dismiss === 'cancel') {}
          });
          //$('.loginSpinner').css('display','none');
          $('.fullScreenSpin').css('display', 'none');
      });
    }else{
      $('.fullScreenSpin').css('display', 'none');
    }

    },
    'click .btnSave': function(event) {
        playSaveAudio();
        let templateObject = Template.instance();
        // let uploadedItems = templateObject.uploadedFiles.get();
        setTimeout(function(){
        if ($('.chkEmailCopy').is(':checked')) {
        $('#html-2-pdfwrapper').css('display', 'block');
        }

        //let customername = $('#edtCustomerName').val() || '';
        //let shippingaddress = $('#txaShipingInfo').val() || '';
        let transferFrom = $('#sltDepartment').val() || '';
        let shipVia = $('#shipvia').val() || '';
        let conNote = $('#shipcomments').val() || '';
        let toAccount = $('#sltBankAccountName').val() || '';
        // let department = $('#sltDepartment').val();
        let stockTransferService = new StockTransferService();
        //$('.loginSpinner').css('display','inline-block');
        $('.fullScreenSpin').css('display', 'inline-block');
        var splashLineArray = new Array();
        let lineItemsForm = [];
        let lineItemObjForm = {};
        let isReadyToSave  = false;
        $('#tblStocktransfer > tbody > tr').each(function() {
            var lineID = this.id;
            let tdproduct = $('#' + lineID + " .lineProductName").val();
            let tdproductID = $('#' + lineID + " .lineProductName").attr('productid');
            let tdproductCost = $('#' + lineID + " .lineProductName").attr('productcost');
            let tdbarcode = $('#' + lineID + " .lineProductBarCode").html();
            let tddescription = $('#' + lineID + " .lineDescription").html() || '';
            let tdserialNumber = $('#' + lineID + " .pqa").text();
            var segsSerialLenght = tdserialNumber.split(',');
            // let tdfinalqty = $('#' + lineID + " .lineFinalQty").val();
            // let tdadjustqty = $('#' + lineID + " .lineAdjustQty").val();
            let tdDepartment = $('#' + lineID + " .lineDepartment").val();

            let tdavailqty = $('#' + lineID + " .lineOrdere").val();
            let tdtransferqty = $('#' + lineID + " .lineUOMQtyShipped").val() || 0;
            let tdInitialTransfer = $('#' + lineID + " .InitTransfer").text()||0;

            let transferSerialNos = $('#' + lineID + ' .colSerialFrom').attr('data-serialnumbers');
            let newSerialNos = $('#' + lineID + ' .colSerialTo').attr('data-serialnumbers');

            if (tdproduct != "") {
                if (newSerialNos) {
                    newSerialNos = newSerialNos.split(',');
                    for (let i = 0; i < newSerialNos.length; i++) {
                        lineItemObjForm = {
                            type: "TSTELinesFlat",
                            fields: {
                                ProductName: tdproduct || '',
                                AccountName: 'Inventory Asset',
                                TransferQty: parseInt(tdtransferqty) || 0,
                                ClassNameTo: tdDepartment || defaultDept,
                                PartBarcode: tdbarcode || '',
                                OrderQty: parseInt(tdtransferqty) || 0,
                            }
                        };
                        lineItemObjForm.fields.SerialNumber = newSerialNos[i];
                        if (transferSerialNos) {
                            lineItemObjForm.fields.TransferSerialnos = transferSerialNos.split(',')[i] || '';
                        }
                        splashLineArray.push(lineItemObjForm);
                    }
                } else {
                    lineItemObjForm = {
                        type: "TSTELinesFlat",
                        fields: {
                            ProductName: tdproduct || '',
                            AccountName: 'Inventory Asset',
                            TransferQty: parseInt(tdtransferqty) || 0,
                            ClassNameTo: tdDepartment || defaultDept,
                            PartBarcode: tdbarcode || '',
                            OrderQty: parseInt(tdtransferqty) || 0,
                        }
                    };
                    splashLineArray.push(lineItemObjForm);
                }

                isReadyToSave = true;
            }

            // }else{
            //   isReadyToSave = false;
            //   swal('', 'Your serial number scanned quantity does not match your transfer quantity. Please scan in the correct quantity.', 'danger');
            //   $('.fullScreenSpin').css('display', 'none');
            //   event.preventDefault();
            //   return false;
            // }
        });

        let selectAccount = $('#sltAccountName').val();

        let notes = $('#shipcomments').val();
        let reason = $('#txtNotes').val() || '';
        var creationdateTime = new Date($("#dtShipDate").datepicker("getDate"));
        let creationDate = creationdateTime.getFullYear() + "-" + (creationdateTime.getMonth() + 1) + "-" + creationdateTime.getDate();
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentStock = getso_id[getso_id.length - 1];

        var objDetails = '';
        if (getso_id[1]) {
            currentStock = parseInt(currentStock);
            objDetails = {
                type: "TStockTransferEntry",
                fields: {
                    ID: currentStock,
                    AccountName: selectAccount,
                    DateTransferred: creationDate,
                    // AdjustmentOnInStock: true,
                    // AdjustType: "Gen",
                    // Approved: false,
                    CreationDate: creationDate,
                    //Deleted: false,
                    EmployeeName: localStorage.getItem('mySessionEmployee'),
                    EnforceUOM: false,
                    //ISEmpty:false,
                    //IsStockTake:false,
                    Lines: splashLineArray,
                    DoProcessonSave: false,
                    Notes: notes,
                    Description: reason,
                    // SalesRef: conNote,
                    TransferFromClassName: transferFrom,
                    Transfertype: "Gen",
                    Shipping: shipVia

                }
            };
        } else {
            objDetails = {
                type: "TStockTransferEntry",
                fields: {
                    AccountName: selectAccount,
                    DateTransferred: creationDate,
                    // AdjustmentOnInStock: true,
                    // AdjustType: "Gen",
                    // Approved: false,
                    CreationDate: creationDate,
                    //Deleted: false,
                    EmployeeName: localStorage.getItem('mySessionEmployee'),
                    EnforceUOM: false,
                    //ISEmpty:false,
                    //IsStockTake:false,
                    Lines: splashLineArray,
                    DoProcessonSave: false,
                    Notes: notes,
                    Description: reason,
                    // SalesRef: conNote,
                    TransferFromClassName: transferFrom,
                    Transfertype: "Gen",
                    Shipping: shipVia
                }
            };
        }
        if(isReadyToSave){
        stockTransferService.saveStockTransfer(objDetails).then(function(objDetails) {
            function generatePdfForMail(invoiceId) {
                let file = "Invoice-" + invoiceId + ".pdf"
                return new Promise((resolve, reject) => {
                    let templateObject = Template.instance();
                    let completeTabRecord;
                    let doc = new jsPDF('p', 'pt', 'a4');
                    var source = document.getElementById('html-2-pdfwrapper');
                    var opt = {
                        margin: 0,
                        filename: file,
                        image: {
                            type: 'jpeg',
                            quality: 0.98
                        },
                        html2canvas: {
                            scale: 2
                        },
                        jsPDF: {
                            unit: 'in',
                            format: 'a4',
                            orientation: 'portrait'
                        }
                    }
                    resolve(html2pdf().set(opt).from(source).toPdf().output('datauristring'));

                });
            }

            async function addAttachment() {
                let attachment = [];
                let templateObject = Template.instance();

                let invoiceId = objDetails.fields.ID;
                let encodedPdf = await generatePdfForMail(invoiceId);
                // var base64data = reader.result;
                let base64data = encodedPdf.split(',')[1];
                pdfObject = {
                    filename: 'Stock Transfer-' + invoiceId + '.pdf',
                    content: base64data,
                    encoding: 'base64'
                };
                attachment.push(pdfObject);
                let erpInvoiceId = objDetails.fields.ID;

                let mailFromName = localStorage.getItem('vs1companyName');
                let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
                //let customerEmailName = $('#edtCustomerName').val();
                let checkEmailData = $('#edtSupplierEmail').val();
                // let grandtotal = $('#grandTotal').html();
                // let amountDueEmail = $('#totalBalanceDue').html();
                // let emailDueDate = $("#dtDueDate").val();
                // let customerBillingAddress = $('#txabillingAddress').val();
                // let customerTerms = $('#sltTerms').val();

                // let customerSubtotal = $('#subtotal_total').html();
                // let customerTax = $('#subtotal_tax').html();
                // let customerNett = $('#subtotal_nett').html();
                // let customerTotal = $('#grandTotal').html();
                let mailSubject = 'Stock Transfer ' + erpInvoiceId + ' from ' + mailFromName;
                let mailBody = "Hi " + ",\n\n Here's Stock Transfer " + erpInvoiceId + " from  " + mailFromName;

                var htmlmailBody = '    <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate;mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">' +
                    '        <tr>' +
                    '            <td class="container" style="display: block; margin: 0 auto !important; max-width: 650px; padding: 10px; width: 650px;">' +
                    '                <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 650px; padding: 10px;">' +
                    '                    <table class="main">' +
                    '                        <tr>' +
                    '                            <td class="wrapper">' +
                    '                                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">' +
                    '                                    <tr>' +
                    '                                        <td class="content-block" style="text-align: center; letter-spacing: 2px;">' +
                    '                                            <span class="doc-details" style="color: #999999; font-size: 12px; text-align: center; margin: 0 auto; text-transform: uppercase;">Stock Transfer No. ' + erpInvoiceId + ' Details</span>' +
                    '                                        </td>' +
                    '                                    </tr>' +
                    '                                    <tr style="height: 16px;"></tr>' +
                    '                                    <tr>' +
                    '                                        <td>' +
                    '                                            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%;" />' +
                    '                                        </td>' +
                    '                                    </tr>' +
                    '                                    <tr style="height: 48px;"></tr>' +
                    '                                    <tr>' +
                    '                                        <td class="content-block" style="padding: 16px 32px;">' +
                    '                                            <p style="font-size: 18px;">Hi </p>' +
                    '                                            <p style="font-size: 18px; margin: 34px 0px;">Please find the Stock Transfer attached to this email.</p>' +
                    '                                            <p style="font-size: 18px; margin-bottom: 8px;">Thanks you</p>' +
                    '                                            <p style="font-size: 18px;">' + mailFromName + '</p>' +
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
                    '                                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Company Inc, 3 Abbey Road, San Francisco CA 90210</span>' +
                    '                                    <br>' +
                    '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Privacy</a>' +
                    '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Security</a>' +
                    '                                    <a href="#" style="color: #999999; font-size: 12px; text-align: center;">Terms of Service</a>' +
                    '                                </td>' +
                    '                            </tr>' +
                    '                        </table>' +
                    '                    </div>' +
                    '                </div>' +
                    '            </td>' +
                    '        </tr>' +
                    '    </table>';


                if ($('.chkEmailCopy').is(':checked')) {

                    $('#html-2-pdfwrapper').css('display', 'none');
                    Meteor.call('sendEmail', {
                        from: "" + mailFromName + " <" + mailFrom + ">",
                        to: checkEmailData,
                        subject: mailSubject,
                        text: '',
                        html: htmlmailBody,
                        attachments: attachment
                    }, function(error, result) {
                        if (error && error.error === "error") {
                            FlowRouter.go('/stocktransferlist?success=true');

                        } else {
                            swal({
                                title: 'SUCCESS',
                                text: "Email Sent To Employee: " + checkEmailData + " ",
                                type: 'success',
                                showCancelButton: false,
                                confirmButtonText: 'OK'
                            }).then((result) => {
                                if (result.value) {
                                    FlowRouter.go('/stocktransferlist?success=true');
                                } else if (result.dismiss === 'cancel') {}
                            });

                            $('.fullScreenSpin').css('display', 'none');
                        }
                    });

                } else {
                    FlowRouter.go('/stocktransferlist?success=true');
                };

            }
            addAttachment();
            $('.modal-backdrop').css('display', 'none');

        }).catch(function(err) {
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                    Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {}
            });
            //$('.loginSpinner').css('display','none');
            $('.fullScreenSpin').css('display', 'none');
        });
      }else{
        $('.fullScreenSpin').css('display', 'none');
      }
    }, delayTimeAfterSound);

    },
    'click .btnDeleteFollowingStocks': async function(event) {
        playDeleteAudio();
        var currentDate = new Date();
        let templateObject = Template.instance();
        let stockTransferService = new StockTransferService();
        setTimeout(async function(){
        swal({
            title: 'You are deleting ' + $("#following_cnt").val() + ' Transfer',
            text: "Do you wish to delete this transaction and all others associated with it moving forward?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
        cancelButtonText: 'No'
        }).then(async (result) => {
            if (result.value) {
                var url = FlowRouter.current().path;
                var getso_id = url.split('?id=');
                var currentInvoice = getso_id[getso_id.length - 1];
                var objDetails = '';
                if (getso_id[1]) {
                    $('.deleteloadingbar').css('width', ('0%')).attr('aria-valuenow', 0);
                    $("#deleteLineModal").modal('hide');
                    $("#deleteprogressbar").css('display', 'block');
                    $("#deleteprogressbar").modal('show');
                    currentInvoice = parseInt(currentInvoice);
                    var stockData = await stockTransferService.getOneStockTransferData(currentInvoice);
                    var transferDate = stockData.fields.DateTransferred;
                    var fromDate = transferDate.substring(0, 10);
                    var toDate = currentDate.getFullYear() + '-' + ("0" + (currentDate.getMonth() + 1)).slice(-2) + '-' + ("0" + (currentDate.getDate())).slice(-2);
                    var followingStocks = await sideBarService.getAllStockTransferEntry("All", stockData.fields.Recno);//initialDataLoad
                    var stockList = followingStocks.tstocktransferentry;
                    var j = 0;
                    for (var i=0; i < stockList.length; i++) {
                        var objDetails = {
                            type: "TStockTransferEntry",
                            fields: {
                                ID: stockList[i].fields.ID,
                                Deleted: true
                            }
                        };
                        j ++;
                        document.getElementsByClassName("deleteprogressBarInner")[0].innerHTML = j + '';
                        $('.deleteloadingbar').css('width', ((100/stockList.length*j)) + '%').attr('aria-valuenow', ((100/stockList.length*j)));
                        var result = await stockTransferService.saveStockTransfer(objDetails);
                    }
                }
                $("#deletecheckmarkwrapper").removeClass('hide');
                $('.modal-backdrop').css('display', 'none');
                $("#deleteprogressbar").modal('hide');
                $("#btn_data").click();
            }
        });
    }, delayTimeAfterSound);
    },
    'click .btnDeleteStock': function(event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let stockTransferService = new StockTransferService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        var url = FlowRouter.current().path;
        var getso_id = url.split('?id=');
        var currentInvoice = getso_id[getso_id.length - 1];
        var objDetails = '';
        if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);
            var objDetails = {
                type: "TStockTransferEntry",
                fields: {
                    ID: currentInvoice,
                    Deleted: true
                }
            };

            stockTransferService.saveStockTransfer(objDetails).then(function(objDetails) {
                FlowRouter.go('/stocktransferlist?success=true');
                $('.modal-backdrop').css('display', 'none');
            }).catch(function(err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            FlowRouter.go('/stocktransferlist?success=true');
            $('.modal-backdrop').css('display', 'none');
        }
        $('#deleteLineModal').modal('toggle');
    }, delayTimeAfterSound);
    },
    'click .btnDeleteStockTransfer': function(event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let stockTransferService = new StockTransferService();
        setTimeout(function(){
        swal({
            title: 'Delete Stock Transfer',
            text: "Are you sure you want to Delete Stock Transfer?",
            type: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.value) {
                $('.fullScreenSpin').css('display', 'inline-block');
                var url = FlowRouter.current().path;
                var getso_id = url.split('?id=');
                var currentInvoice = getso_id[getso_id.length - 1];
                var objDetails = '';
                if (getso_id[1]) {
                    currentInvoice = parseInt(currentInvoice);
                    var objDetails = {
                        type: "TStockTransferEntry",
                        fields: {
                            ID: currentInvoice,
                            Deleted: true
                        }
                    };

                    stockTransferService.saveStockTransfer(objDetails).then(function(objDetails) {
                        FlowRouter.go('/stocktransferlist?success=true');
                        $('.modal-backdrop').css('display', 'none');

                    }).catch(function(err) {
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {}
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });
                } else {
                    FlowRouter.go('/stocktransferlist?success=true');
                    $('.modal-backdrop').css('display', 'none');
                }
                //$('#deleteLineModal').modal('toggle');
            } else {}
        });
    }, delayTimeAfterSound);
    },
    'click .btnDeleteLine': function(event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        setTimeout(function(){
        let selectLineID = $('#selectDeleteLineID').val();
        if ($('#tblStocktransfer tbody>tr').length > 1) {
            this.click;

            $('#' + selectLineID).closest('tr').remove();
            //event.preventDefault();
            let $tblrows = $("#tblStocktransfer tbody tr");
            //if(selectLineID){
            let lineAmount = 0;
            let subGrandTotal = 0;
            let taxGrandTotal = 0;
            //return false;

        } else {
            this.click;
            // $(event.target).closest('tr').remove();
            $('#' + selectLineID + " .lineProductName").val('');
            $('#' + selectLineID + " .lineDescription").text('');
            $('#' + selectLineID + " .lineProductBarCode").text('');
            $('#' + selectLineID + " .lineInStockQty").text('');
            $('#' + selectLineID + " .lineDepartment").val('');
            $('#' + selectLineID + " .ID").text('');
            $('#' + selectLineID + " .pqa").text('');
            $('#' + selectLineID + " .lineID").text('');
            $('#' + selectLineID + " .lineProductBarCode").text('');
            $('#' + selectLineID + " .UOMQtyBackOrder").text('');
            $('#' + selectLineID + " .ProductID").text('');
            $('#' + selectLineID + " .lineOrdered").val('');
            $('#' + selectLineID + " .lineUOMQtyShipped").val('');

            //event.preventDefault();

        }

        $('#deleteLineModal').modal('toggle');
    }, delayTimeAfterSound);
    },
    'click .btnRemove': function(event) {
        let templateObject = Template.instance();
        var clicktimes = 0;
        var targetID = $(event.target).closest('tr').attr('id');
        $('#selectDeleteLineID').val(targetID);
        if(targetID != undefined) {
            times++;
            if (times == 1) {
                $('#deleteLineModal').modal('toggle');
            } else {
                    if ($('#tblStocktransfer tbody>tr').length > 1) {
                        this.click;
                        $(event.target).closest('tr').remove();
                        event.preventDefault();
                        return false;

                    } else {
                        $('#deleteLineModal').modal('toggle');
                    }

                }
        }else {
            $('#footerDeleteModal1').modal('toggle');
        }
    },
    'click #tdBarcodeScannerMobile': function(event) {
        setTimeout(function() {
            document.getElementById("scanBarcodeModalInput").focus();
        }, 500);
    },
    'click #scanNewRowMobile': function(event) {
        setTimeout(function() {
            document.getElementById("scanBarcodeModalInput").focus();
        }, 500);
    },
    'click .btnSnLotmodal': function(event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        const snLotType = $(event.target).closest('td').hasClass('colSerialFrom') ? "from" : "to";
        var target=event.target;
        let selectedProductName = $(target).closest('tr').find('.lineProductName').val();
        let selectedunit = $(target).closest('tr').find('.lineUOMQtyShipped').val();
        localStorage.setItem('productItem', selectedunit);
        localStorage.setItem('selectedProductName', selectedProductName);
        let productService = new ProductService();
        const serialNumbers = $(event.target).closest('td').attr('data-serialnumbers');
        const lotNumbers = $(event.target).closest('td').attr('data-lotnumbers');
        const expiryDates = $(event.target).closest('td').attr('data-expirydates');
        if (selectedProductName == '') {
            $('.fullScreenSpin').css('display', 'none');
            swal('You have to select Product.', '', 'info');
            event.preventDefault();
            return false;
        } else {
            productService.getProductStatus(selectedProductName).then(function(data) {
                $('.fullScreenSpin').css('display', 'none');
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
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $('#lotNumberModal').attr('data-row', row + 1);
                    $('#lotNumberModal').attr('data-type', snLotType);
                    if (lotNumbers) {
                        lotNumbers = lotNumbers.split(',');
                        expiryDates = expiryDates.split(',');
                        let shtml = '';
                        shtml += `<tr><td rowspan="2"></td><td colspan="3" class="text-center">Allocate Lot Numbers</td></tr>
                        <tr><td class="text-start">#</td><td class="text-start">Lot Number</td><td class="text-start">Expiry Date</td></tr>
                        `;
                        for (let k = 0; k < lotNumbers.length; k++) {
                            if (k === 0) {
                                shtml += `
                                <tr>
                                    <td></td>
                                    <td>${k + 1}</td><td contenteditable="true" class="lineLotnumbers" id="first-lot-number">${lotNumbers[k]}</td>
                                    <td class="lotExpiryDate" id="first-lot-expiry-date">
                                        <div class="form-group m-0">
                                            <div class="input-group date" style="cursor: pointer;">
                                                <input type="text" class="form-control" style="height: 25px;" value="${expiryDates[k]}">
                                                <div class="input-group-addon">
                                                    <span class="glyphicon glyphicon-th" style="cursor: pointer;"></span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                `;
                            } else {
                                shtml += `
                                <tr>
                                    <td></td>
                                    <td>${k + 1}</td><td contenteditable="true" class="lineLotnumbers">${lotNumbers[k]}</td>
                                    <td class="lotExpiryDate">
                                        <div class="form-group m-0">
                                            <div class="input-group date" style="cursor: pointer;">
                                                <input type="text" class="form-control" style="height: 25px;" value="${expiryDates[k]}">
                                                <div class="input-group-addon">
                                                    <span class="glyphicon glyphicon-th" style="cursor: pointer;"></span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                `;
                            }
                        }
                        $('#tblLotlist tbody').html(shtml);
                    } else {
                        let shtml = `<tr><td rowspan="2"></td><td colspan="3" class="text-center">Allocate Lot Numbers</td></tr>
                        <tr><td class="text-start">#</td><td class="text-start">Lot Number</td><td class="text-start">Expiry Date</td></tr>
                        <tr>
                            <td></td>
                            <td>*</td><td contenteditable="true" class="lineLotnumbers" id="first-lot-number"></td>
                            <td class="lotExpiryDate" id="first-lot-expiry-date">
                                <div class="form-group m-0">
                                    <div class="input-group date" style="cursor: pointer;">
                                        <input type="text" class="form-control" style="height: 25px;">
                                        <div class="input-group-addon">
                                            <span class="glyphicon glyphicon-th" style="cursor: pointer;"></span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        `;
                        $('#tblLotlist tbody').html(shtml);
                    }
                    $('.lotExpiryDate input').datepicker({
                        showOn: 'focus',
                        buttonImageOnly: false,
                        dateFormat: 'dd/mm/yy',
                        showOtherMonths: true,
                        selectOtherMonths: true,
                        changeMonth: true,
                        changeYear: true,
                        yearRange: "-90:+10",
                    });
                    $('#lotNumberModal').modal('show');
                } else if (data.tproductvs1[0].Batch == false && data.tproductvs1[0].SNTracking == true) {
                    var row = $(target).parent().parent().parent().children().index($(target).parent().parent());
                    $('#serialNumberModal').attr('data-row', row + 1);
                    $('#serialNumberModal').attr('data-type', snLotType);
                    if (serialNumbers) {
                        const sns = serialNumbers.split(',');
                        let shtml = `
                            <tr><td rowspan="2"></td><td colspan="2" class="text-center">Allocate Serial Numbers</td></tr>
                            <tr><td class="text-start">#</td><td class="text-start">Serial number</td></tr>
                        `;
                        for (let i = 0; i < sns.length; i++) {
                            if (i === 0) {
                                shtml += `
                                <tr><td></td><td class="lineNo">${i + 1}</td><td contenteditable="true" class="lineSerialnumbers" id="first-serial-number">${sns[i]}</td></tr>
                                `;
                            } else {
                                shtml += `
                                <tr><td></td><td class="lineNo">${i + 1}</td><td contenteditable="true" class="lineSerialnumbers">${sns[i]}</td></tr>
                                `;
                            }
                        }
                        $('#tblSeriallist tbody').html(shtml);
                    } else {
                        let shtml = `
                            <tr><td rowspan="2"></td><td colspan="2" class="text-center">Allocate Serial Numbers</td></tr>
                            <tr><td class="text-start">#</td><td class="text-start">Serial number</td></tr>
                            <tr><td></td><td class="serialNo">*</td><td contenteditable="true" class="lineSerialnumbers" id="first-serial-number"></td></tr>
                        `;
                        $('#tblSeriallist tbody').html(shtml);
                    }
                    $('#serialNumberModal').modal('show');
                }
            });
        }
    },

    // Print Modal Events
    "click #printModal .btn-check-template": function (event) {
        const template = $(event.target).data('template');
        const templateObject = Template.instance()
        templateObject.print(template)
    },
    "click #printModal #btnSendEmail" : async function (event) {
        const templateObject = Template.instance()
        const checkedPrintOptions = $("#printModal").find(".chooseTemplateBtn:checked")
        if ($("#edtCustomerEmail").val() != "") {
            LoadingOverlay.show();
            await templateObject.sendEmail(true);
            LoadingOverlay.hide();
        } else {
            swal({
            title: "Customer Email Required",
            text: "Please enter customer email",
            type: "error",
            showCancelButton: false,
            confirmButtonText: "OK",
            })
        }
    },
    "click .printConfirm": async function (event) {
        const checkedPrintOptions = $("#printModal").find(".chooseTemplateBtn:checked")
        playPrintAudio();
        const templateObject = Template.instance();
        templateObject.print()
    },
});

Template.stocktransfercard.helpers({
    isBatchSerialNoTracking: () => {
        return localStorage.getItem('CloudShowSerial') || false;
    },
    isPrintInvoice: () => {
        return Template.instance().includeIsPrintInvoice.get();
    },
    isPrintDeliveryDocket: () => {
        return Template.instance().includeIsPrintDocket.get();
    },
    includeBothPrint: () => {
        return Template.instance().includeBothPrint.get();
    },
    hasPrintPrint: () => {
        return Template.instance().hasPrintPrint.get();
    },
    stocktransferrecord: () => {
        return Template.instance().stocktransferrecord.get();
    },
    shipviarecords: () => {
        return Template.instance().shipviarecords.get().sort(function(a, b) {
            if (a.shippingmethod == 'NA') {
                return 1;
            } else if (b.shippingmethod == 'NA') {
                return -1;
            }
            return (a.shippingmethod.toUpperCase() > b.shippingmethod.toUpperCase()) ? 1 : -1;
        });
    },
    availableserialnumberlist: () => {
        return Template.instance().availableserialnumberlist.get();
    },
    showSerial: () => {
        return localStorage.getItem('CloudShowSerial') || false;
    },
    availableserialnumberqty: () => {
        let availaLegnt = false;
        if (parseInt(Template.instance().availableserialnumberqty.get()) > 5) {
            availaLegnt = true;
        }
        return availaLegnt;
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
        return localStorage.getItem('vs1companyPhone');
    },
    companyabn: () => {
        return localStorage.getItem('vs1companyABN');
    },
    organizationname: () => {
        return localStorage.getItem('vs1companyName');
    },
    organizationurl: () => {
        return localStorage.getItem('vs1companyURL');
    },
    concat: (options) => {
        return Array.prototype.slice.call(options, 0, -1).join('');
    }
});
