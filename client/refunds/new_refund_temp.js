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
import LoadingOverlay from "../LoadingOverlay";
import { saveCurrencyHistory } from "../packages/currency/CurrencyWidget";
import { convertToForeignAmount } from "../payments/paymentcard/supplierPaymentcard";
import { getCurrentCurrencySymbol } from "../popUps/currnecypopup";
import FxGlobalFunctions from "../packages/currency/FxGlobalFunctions";
import { Template } from 'meteor/templating';
import '../refunds/frm_refund_temp.html'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

const sideBarService = new SideBarService();
const utilityService = new UtilityService();
const salesService = new SalesBoardService();
const clientsService = new SalesBoardService();
const accountService = new SalesBoardService();
const contactService = new ContactService();

let times = 0;
let clickedInput = "";
var template_list = ["Refunds"];
var noHasTotals = [
  "Customer Payment",
  "Customer Statement",
  "Supplier Payment",
  "Statement",
  "Delivery Docket",
  "Journal Entry",
  "Deposit",
];
let defaultCurrencyCode = CountryAbbr;

function generateHtmlMailBody(erpInvoiceId) {
  let mailFromName = localStorage.getItem("vs1companyName");
  let mailFrom =
    localStorage.getItem("VS1OrgEmail") ||
    localStorage.getItem("VS1AdminUserName");
  let customerEmailName = $("#edtCustomerName").val();

  let amountDueEmail = $("#totalBalanceDue").html();
  let emailDueDate = $("#dtDueDate").val();

  let html =
    '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
    "    <tr>" +
    '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
    '            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
    "        </td>" +
    "    </tr>" +
    "    <tr>" +
    '        <td style="padding: 40px 30px 40px 30px;">' +
    '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
    "                <tr>" +
    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
    "                        Hello there <span>" +
    customerEmailName +
    "</span>," +
    "                    </td>" +
    "                </tr>" +
    "                <tr>" +
    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
    "                        Please find refund <span>" +
    erpInvoiceId +
    "</span> attached below." +
    "                    </td>" +
    "                </tr>" +
    "                <tr>" +
    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
    "                        The amount outstanding of <span>" +
    amountDueEmail +
    "</span> is due on <span>" +
    emailDueDate +
    "</span>" +
    "                    </td>" +
    "                </tr>" +
    "                <tr>" +
    '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 30px 0;">' +
    "                        Kind regards," +
    "                        <br>" +
    "                        " +
    mailFromName +
    "" +
    "                    </td>" +
    "                </tr>" +
    "            </table>" +
    "        </td>" +
    "    </tr>" +
    "    <tr>" +
    '        <td bgcolor="#00a3d3" style="padding: 30px 30px 30px 30px;">' +
    '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
    "                <tr>" +
    '                    <td width="50%" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">' +
    "                        If you have any question, please do not hesitate to contact us." +
    "                    </td>" +
    '                    <td align="right">' +
    '                        <a style="border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #4CAF50;" href="mailto:' +
    mailFrom +
    '">Contact Us</a>' +
    "                    </td>" +
    "                </tr>" +
    "            </table>" +
    "        </td>" +
    "    </tr>" +
    "</table>";

  return html;
}

Template.new_refund_temp.onCreated(() => {
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
  // templateObject.deptrecords = new ReactiveVar();
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
  // templateObject.statusrecords = new ReactiveVar([]);
  templateObject.productextrasellrecords = new ReactiveVar([]);
  templateObject.defaultsaleterm = new ReactiveVar();
  templateObject.subtaxcodes = new ReactiveVar([]);
  templateObject.hasFollow = new ReactiveVar(false);
  templateObject.customerRecord = new ReactiveVar();

  templateObject.includeBOnShippedQty = new ReactiveVar();
  templateObject.includeBOnShippedQty.set(true);
  templateObject.headerfields = new ReactiveVar([]);
  templateObject.headerbuttons = new ReactiveVar([]);

  templateObject.currencyData = new ReactiveVar([]);

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

  function formatDate (date) {
    return moment(date).format('DD/MM/YYYY');
  }

  let transactionheaderfields = [
    { label: "Sales Date", type: "date", readonly: false, value: formatDate(new Date()), divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader", },
    { label: "P.O.Number", type: 'default', id: 'ponumber', value: '', readonly: false, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
    { label: 'Terms', type: 'search', id: 'sltTerms', listModalId: 'termsList_modal', listModalTemp: 'termlistpop', colName: 'colName', editModalId: 'newTerms_modal', editModalTemp: 'newtermspop', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
    { label: 'Status', type: 'search', id: 'sltStatus', listModalId: 'statusPop_modal', listModalTemp: 'statuspop', colName: 'colStatusName', editModalId: 'newStatusPop_modal', editModalTemp: 'newstatuspop', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
    { label: 'Reference', type: 'default', id: 'edtRef', value: '', readonly: false, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
    { label: 'Department', type: 'search', id: 'sltDept', listModalId: 'department_modal', listModalTemp: 'departmentpop', colName: 'colDeptName', editModalId: 'newDepartment_modal', editModalTemp: 'newdepartmentpop', editable: true, divClass: "col-12 col-md-6 col-lg-4 col-xl-2 transheader" },
  ]
  templateObject.headerfields.set(transactionheaderfields);

  let transactionfooterfields = [
    { label: 'Comments', id: "txaComment", name: "txaComment", row: 6 },
    { label: 'Picking Instructions', id: "txapickmemo", name: "txapickmemo", row: 6 },
  ];

  templateObject.tranasctionfooterfields.set(transactionfooterfields);

  getVS1Data('TRefundTemp').then(function(dataObject){
    if(dataObject.length == 0) {
      templateObject.temporaryfiles.set([]);
    } else {
      let data = JSON.parse(dataObject[0].data);
      let useData = data.trefundtemp;
      templateObject.temporaryfiles.set(useData)
    }
  }).catch(function(e){
    templateObject.temporaryfiles.set([])
  })

  templateObject.getDefaultTerm = function () {
    const termrecords = [];
    getVS1Data("TTermsVS1")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          salesService.getTermVS1().then(function (data) {
            for (let i in data.ttermsvs1) {
              if (data.ttermsvs1[i].isSalesdefault == true) {
                localStorage.setItem(
                    "ERPTermsSales",
                    data.ttermsvs1[i].TermsName || "COD"
                );
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
      })
      .catch(function (err) {
        salesService.getTermVS1().then(function (data) {
          for (let i in data.ttermsvs1) {
            if (data.ttermsvs1[i].isSalesdefault == true) {
              localStorage.setItem(
                  "ERPTermsSales",
                  data.ttermsvs1[i].TermsName || "COD"
              );
              templateObject.defaultsaleterm.set(data.ttermsvs1[i].TermsName);
            }
          }
        });
      });
  };

  templateObject.getDefaultTerm()

  templateObject.initialRecords = function () {
    LoadingOverlay.hide();
    let lineItems = [];
    let lineItemObj = {};
    lineItemObj = {
      lineID: Random.id(),
      item: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      unitPriceInc: 0,
      TotalAmt: 0,
      TotalAmtInc: 0,
      taxRate: "",
      taxCode: "",
      curTotalAmt: 0,
      TaxTotal: 0,
      TaxRate: 0,
    };
   
    lineItems.push(lineItemObj);
    const currentDate = new Date();
    const begunDate = moment(currentDate).format("DD/MM/YYYY");
    let invoicerecord = {
      id: "",
      lid: "Refund",
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
      CustomerID: 0,
      isRepeated: false
    };
    if (FlowRouter.current().queryParams.customerid) {
      getCustomerData(FlowRouter.current().queryParams.customerid);
    } else {
      $("#edtCustomerName").val("");
    }
    let getPaymentMethodVal = localStorage.getItem("paymentmethod") || "Cash";
    setTimeout(function () {
      $(".transheader > #sltDept_fromtransactionheader").val(defaultDept);
      $("#sltPaymentMethod").val(getPaymentMethodVal);
      $(".transheader > #sltTerms_fromtransactionheader").val(
        invoicerecord.termsName || templateObject.defaultsaleterm.get() || ""
      );
    }, 200);
    templateObject.invoicerecord.set(invoicerecord);
    if (templateObject.invoicerecord.get()) {
      Meteor.call(
        "readPrefMethod",
        localStorage.getItem("mycloudLogonID"),
        "tblRefundLine",
        function (error, result) {
          if (error) {
          } else {
            if (result) {
              for (let i = 0; i < result.customFields.length; i++) {
                let customcolumn = result.customFields;
                let columData = customcolumn[i].label;
                let columHeaderUpdate = customcolumn[i].thclass;
                let hiddenColumn = customcolumn[i].hidden;
                let columnClass = columHeaderUpdate.substring(
                  columHeaderUpdate.indexOf(".") + 1
                );
                let columnWidth = customcolumn[i].width;

                $("" + columHeaderUpdate + "").html(columData);
                if (columnWidth != 0) {
                  $("" + columHeaderUpdate + "").css(
                    "width",
                    columnWidth + "%"
                  );
                }
                if (hiddenColumn == true) {
                  $("." + columnClass + "").addClass("hiddenColumn");
                  $("." + columnClass + "").removeClass("showColumn");
                } else if (hiddenColumn == false) {
                  $("." + columnClass + "").removeClass("hiddenColumn");
                  $("." + columnClass + "").addClass("showColumn");
                }
              }
            }
          }
        }
      );
    }
    return invoicerecord
  };

 
  templateObject.saveRefundData = function (data) {

    playSaveAudio();
    let salesService = new SalesBoardService();
    let uploadedItems = templateObject.uploadedFiles.get();
    setTimeout(function () {
      saveCurrencyHistory();
      let customername = $("#edtCustomerName");
      let termname = $(".transheader > #sltTerms_fromtransactionheader").val() || "";
      let payMethod = $("#sltPaymentMethod").val() || "Cash";
      localStorage.setItem("paymentmethod", payMethod);
      if (termname === "") {
        swal("Terms has not been selected!", "", "warning");
        event.preventDefault();
        return false;
      }

      if (customername.val() === "") {
        swal("Customer has not been selected!", "", "warning");
        e.preventDefault();
      } else {
        LoadingOverlay.show();
        var splashLineArray = new Array();
        let lineItemsForm = [];
        let lineItemObjForm = {};
        var saledateTime = new Date($("#dtSODate").datepicker("getDate"));

        var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

        let saleDate =
          saledateTime.getFullYear() +
          "-" +
          (saledateTime.getMonth() + 1) +
          "-" +
          saledateTime.getDate();
        $("#tblInvoiceLine > tbody > tr").each(function () {
          var lineID = this.id;
          let tdproduct = $("#" + lineID + " .lineProductName").val();
          let tddescription = $("#" + lineID + " .lineProductDesc").text();
          let tdQty = $("#" + lineID + " .lineQty").val();
          let tdunitprice = $("#" + lineID + " .colUnitPriceExChange").val();
          let tdtaxCode =
            $("#" + lineID + " .lineTaxCode").val() || loggedTaxCodeSalesInc;
          let tdSerialNumber = $("#" + lineID + " .colSerialNo").attr(
            "data-serialnumbers"
          );
          let tdLotNumber = $("#" + lineID + " .colSerialNo").attr(
            "data-lotnumbers"
          );
          let tdLotExpiryDate = $("#" + lineID + " .colSerialNo").attr(
            "data-expirydates"
          );

          if (tdproduct != "") {
            lineItemObjForm = {
              type: "TRefundSaleLine",
              fields: {
                ProductName: tdproduct || "",
                ProductDescription: tddescription || "",
                UOMOrderQty: -parseFloat(tdQty) || 0,
                UOMQtySold: -parseFloat(tdQty) || 0,
                UOMQtyShipped: -parseFloat(tdQty) || 0,
                LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                Headershipdate: saleDate,
                LineTaxCode: tdtaxCode || "",
                DiscountPercent:
                  parseFloat($("#" + lineID + " .lineDiscount").text()) || 0,
              },
            };

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
            if (tdLotNumber) {
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
                      parseInt(dates[2]),
                      parseInt(dates[1]) - 1,
                      parseInt(dates[0])
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

        let saleCustField1 = $("#edtSaleCustField1").val() || "";
        let saleCustField2 = $("#edtSaleCustField2").val() || "";
        let saleCustField3 = $("#edtSaleCustField3").val() || "";
        var url = FlowRouter.current().path;
        var getso_id = url.split("?id=");
        var currentInvoice = getso_id[getso_id.length - 1];
        var showingFx = $("#toggleShowFx").prop('checked') == true? 'true': 'false';
        var showingSN = $('#toggleShowSN').prop('checked')==true? 'true': 'false';

        var currencyCode = $(".transheader > .sltCurrency").val() || CountryAbbr;
        let ForeignExchangeRate = $("#exchange_rate").val() || 0;
        let foreignCurrencyFields = {};
        if (FxGlobalFunctions.isCurrencyEnabled()) {
          foreignCurrencyFields = {
            ForeignExchangeCode: currencyCode,
            ForeignExchangeRate: parseFloat(ForeignExchangeRate),
          };
        }
        var objDetails = "";
        if (getso_id[1]) {
          currentInvoice = parseInt(currentInvoice);
          objDetails = {
            type: "TRefundSale",
            fields: {
              ID: currentInvoice,
              CustomerName: customer,
              ...foreignCurrencyFields,
              Lines: splashLineArray,
              InvoiceToDesc: billingAddress,
              SaleDate: saleDate,
              CustPONumber: poNumber,
              TermsName: termname,
              PayMethod: payMethod || "Cash",
              SaleClassName: departement,
              ShipToDesc: shippingAddress,
              Comments: comments,
              SaleCustField1: saleCustField1,
              SaleCustField2: saleCustField2,
              SaleCustField3: saleCustField3,
              PickMemo: pickingInfrmation,
              SalesStatus: $(".transheader > #sltStatus_fromtransactionheader").val(),
              SaleCustField8: showingSN,
              SaleCustField10: showingFx
            },
          };
        } else {
          objDetails = {
            type: "TRefundSale",
            fields: {
              CustomerName: customer,
              ...foreignCurrencyFields,
              Lines: splashLineArray,
              InvoiceToDesc: billingAddress,
              SaleDate: saleDate,
              CustPONumber: poNumber,
              TermsName: termname,
              PayMethod: payMethod || "Cash",
              SaleClassName: departement,
              ShipToDesc: shippingAddress,
              Comments: comments,
              SaleCustField1: saleCustField1,
              SaleCustField2: saleCustField2,
              SaleCustField3: saleCustField3,
              PickMemo: pickingInfrmation,
              SalesStatus: $(".transheader > #sltStatus_fromtransactionheader").val(),
              SaleCustField8: showingSN,
              SaleCustField10: showingFx
            },
          };
        }showSimpleMessageTransaction();
        playSaveAudio();
        let currentrefundtemp = templateObject.temporaryfiles.get();
        let newrefundtemp= [...currentrefundtemp, objDetails];
        templateObject.temporaryfiles.set(newrefundtemp);
        addVS1Data('TRefundTemp', JSON.stringify({trefundtemp: newrefundtemp})).then(function(){
          // .then(function (objDetails) {
            if (localStorage.getItem("enteredURL") != null) {
              FlowRouter.go(localStorage.getItem("enteredURL"));
              localStorage.removeItem("enteredURL");
              return;
            }
            var customerID = $("#edtCustomerEmail").attr("customerid");
            $("#html-2-pdfwrapper").css("display", "block");
            $(".pdfCustomerName").html($("#edtCustomerName").val());
            $(".pdfCustomerAddress").html(
              $("#txabillingAddress")
                .val()
                .replace(/[\r\n]/g, "<br />")
            );
           
            var htmlmailBody = generateHtmlMailBody(objDetails.fields.ID || '')
            addAttachment("Refund", "Customer", objDetails.fields.ID || '', htmlmailBody, 'refundlist', 74, 'html-2-pdfwrapper', '', true)

          
            var getcurrentCloudDetails = CloudUser.findOne({
              _id: localStorage.getItem("mycloudLogonID"),
              clouddatabaseID: localStorage.getItem("mycloudLogonDBID"),
            });
            if (getcurrentCloudDetails) {
              if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                  userid: clientID,
                  PrefName: "refundcard",
                });
                if (checkPrefDetails) {
                  CloudPreference.update(
                    {
                      _id: checkPrefDetails._id,
                    },
                    {
                      $set: {
                        username: clientUsername,
                        useremail: clientEmail,
                        PrefGroup: "salesform",
                        PrefName: "refundcard",
                        published: true,
                        customFields: [
                          {
                            index: "1",
                            label: getcustomField1,
                            hidden: getchkcustomField1,
                          },
                          {
                            index: "2",
                            label: getcustomField2,
                            hidden: getchkcustomField2,
                          },
                        ],
                        updatedAt: new Date(),
                      },
                    },
                    function (err, idTag) {
                      if (err) {
                      } else {
                      }
                    }
                  );
                } else {
                  CloudPreference.insert(
                    {
                      userid: clientID,
                      username: clientUsername,
                      useremail: clientEmail,
                      PrefGroup: "salesform",
                      PrefName: "refundcard",
                      published: true,
                      customFields: [
                        {
                          index: "1",
                          label: getcustomField1,
                          hidden: getchkcustomField1,
                        },
                        {
                          index: "2",
                          label: getcustomField2,
                          hidden: getchkcustomField2,
                        },
                      ],
                      createdAt: new Date(),
                    },
                    function (err, idTag) {
                      if (err) {
                      } else {
                      }
                    }
                  );
                }
              }
            }
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
              } else if (result.dismiss === "cancel") {
              }
            });

            LoadingOverlay.hide();
          });
      }
    }, delayTimeAfterSound);

  }
});

Template.new_refund_temp.onRendered(() => {
  const templateObject = Template.instance();

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

  const clientList = [];



  LoadingOverlay.show();
 

  templateObject.getOrganisationDetails = function () {
    let account_id = localStorage.getItem("vs1companyStripeID") || "";
    let stripe_fee = localStorage.getItem("vs1companyStripeFeeMethod") || "apply";
    templateObject.accountID.set(account_id);
    templateObject.stripe_fee_method.set(stripe_fee);
  };

  templateObject.getOrganisationDetails()

  templateObject.setRefundData = function (data) {
    let lineItems = [];
    let lineItemObj = {};
    let lineItemTableObj = {};
    let exchangeCode = data.fields.ForeignExchangeCode;
    let currencySymbol = Currency;
    let total =   currencySymbol + "" + data.fields.TotalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, });
    let totalInc = currencySymbol + "" + data.fields.TotalAmountInc.toLocaleString(undefined, {minimumFractionDigits: 2,});
    let totalDiscount = currencySymbol + "" + data.fields.TotalDiscount.toLocaleString(undefined, {minimumFractionDigits: 2,});

    let subTotal = currencySymbol + "" + data.fields.TotalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, });
    let totalTax = currencySymbol + "" + data.fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2, });
    let totalBalance = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {minimumFractionDigits: 2,});

    let totalPaidAmount = currencySymbol + "" + data.fields.TotalPaid.toLocaleString(undefined, {minimumFractionDigits: 2, });

    if (data.fields.Lines.length) {
      for (let i = 0; i < data.fields.Lines.length; i++) {
        let AmountGbp = currencySymbol + "" + data.fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {minimumFractionDigits: 2,});
        let currencyAmountGbp = currencySymbol + "" + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
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
        lineItemObj = {
          lineID: Random.id(),
          id: data.fields.Lines[i].fields.ID || "",
          item: data.fields.Lines[i].fields.ProductName || "",
          description: data.fields.Lines[i].fields.ProductDescription || "",
          quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
          qtyordered: data.fields.Lines[i].fields.UOMOrderQty || 0,
          qtyshipped: data.fields.Lines[i].fields.UOMQtyShipped || 0,
          qtybo: data.fields.Lines[i].fields.UOMQtyBackOrder || 0,
          unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, {minimumFractionDigits: 2, }) || 0,
          unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, {minimumFractionDigits: 2, }) || 0,
          TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, {minimumFractionDigits: 2,}) || 0,
          TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, {minimumFractionDigits: 2,}) || 0,
          lineCost: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCost).toLocaleString(undefined, {minimumFractionDigits: 2,}) || 0,
          taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
          taxCode: data.fields.Lines[i].fields.LineTaxCode || "",
          //TotalAmt: AmountGbp || 0,
          curTotalAmt: currencyAmountGbp || currencySymbol + "0",
          TaxTotal: TaxTotalGbp || 0,
          TaxRate: TaxRateGbp || 0,
          DiscountPercent: data.fields.Lines[i].fields.DiscountPercent ||0,
          pqaseriallotdata: data.fields.Lines[i].fields.PQA || "",
          serialnumbers: serialno,
          lotnumbers: lotno,
          expirydates: expirydate
        };
       
        lineItems.push(lineItemObj);
      }
    } else {
      let AmountGbp = useData[
        d
      ].fields.Lines.fields.TotalLineAmountInc.toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
        }
      );
      let currencyAmountGbp =
        currencySymbol +
        "" +
        data.fields.Lines.fields.TotalLineAmount.toFixed(2);
      let TaxTotalGbp =
        utilityService.modifynegativeCurrencyFormat(
          data.fields.Lines.fields.LineTaxTotal
        );
      let TaxRateGbp =
        currencySymbol +
        "" +
        data.fields.Lines.fields.LineTaxRate;
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
      lineItemObj = {
        lineID: Random.id(),
        id: data.fields.Lines.fields.ID || "",
        description: data.fields.Lines.fields.ProductDescription || "",
        quantity: data.fields.Lines.fields.UOMOrderQty || 0,
        unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, {minimumFractionDigits: 2,}) || 0,
        unitPriceInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePriceInc).toLocaleString(undefined, {minimumFractionDigits: 2, }) || 0,
        TotalAmt: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmount).toLocaleString(undefined, {minimumFractionDigits: 2,}) || 0,
        TotalAmtInc: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.TotalLineAmountInc).toLocaleString(undefined, {minimumFractionDigits: 2,}) || 0,
        lineCost: data.fields.Lines.fields.LineCost.toLocaleString(undefined,{minimumFractionDigits: 2,}) || 0,
        taxRate: data.fields.Lines.fields.LineTaxRate || 0,
        taxCode: data.fields.Lines.fields.LineTaxCode || "",
        //TotalAmt: AmountGbp || 0,
        curTotalAmt: currencyAmountGbp || currencySymbol + "0",
        TaxTotal: TaxTotalGbp || 0,
        TaxRate: TaxRateGbp || 0,
        DiscountPercent: data.fields.Lines.fields.DiscountPercent || 0,
        pqaseriallotdata: data.fields.Lines.fields.PQA || "",
        serialnumbers: serialno,
        lotnumbers: lotno,
        expirydates: expirydate
      };
      lineItems.push(lineItemObj);
    }

    let invoicerecord = {
      id: data.fields.ID,
      lid: "Refund" + " " + data.fields.ID,
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
      ispaid: data.fields.IsPaid,
      CustomerID: data.fields.CustomerID,
      isRepeated: data.fields.RepeatedFrom,
      showingFx: data.fields.SaleCustField10 == "true"?true: false,
      showingSN: data.fields.SaleCustField8 == 'true'? true: false
    };

    $("#edtCustomerName").val(data.fields.CustomerName);
    $(".transheader > #sltTerms_fromtransactionheader").val(data.fields.TermsName);
    $(".transheader > #sltDept_fromtransactionheader").val(data.fields.SaleClassName);
    $(".transheader > .sltCurrency").val(data.fields.ForeignExchangeCode);
    $(".transheader > #sltStatus_fromtransactionheader").val(data.fields.SalesStatus);
    templateObject.CleintName.set(data.fields.CustomerName);
    $(".transheader > .sltCurrency").val(data.fields.ForeignExchangeCode);
    $("#sltPaymentMethod").val(data.fields.PayMethod);
    FxGlobalFunctions.handleChangedCurrency(
      $(".transheader > .sltCurrency").val(),
      defaultCurrencyCode
    );
    /* START attachment */
    templateObject.attachmentCount.set(0);
    if (data.fields.Attachments) {
      if (data.fields.Attachments.length) {
        templateObject.attachmentCount.set(
          data.fields.Attachments.length
        );
        templateObject.uploadedFiles.set(
          data.fields.Attachments
        );
      }
    }
    /* END  attachment */
    var checkISCustLoad = false;
    setTimeout(function () {
      if (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          if (
            clientList[i].customername == data.fields.CustomerName
          ) {
            checkISCustLoad = true;
            invoicerecord.firstname =
              clientList[i].firstname || "";
            invoicerecord.lastname = clientList[i].lastname || "";
            templateObject.invoicerecord.set(invoicerecord);
            $("#edtCustomerEmail").val(clientList[i].customeremail);
            $("#edtCustomerEmail").attr("customerid",clientList[i].customerid);
            $("#edtCustomerName").attr("custid",clientList[i].customerid);
            $("#edtCustomerEmail").attr("customerfirstname",clientList[i].firstname);
            $("#edtCustomerEmail").attr("customerlastname",clientList[i].lastname);
            $("#customerType").text(clientList[i].clienttypename || "Default");
            $("#customerDiscount").text(clientList[i].discount + "%" || 0 + "%");
            $("#edtCustomerUseType").val(clientList[i].clienttypename || "Default");
            $("#edtCustomerUseDiscount").val(clientList[i].discount || 0);
          }
        }
      }

      if (data.fields.IsPaid === true) {
        $("#edtCustomerName").attr("readonly", true);

        $(".btn-primary").attr("disabled", "disabled");
        $("#edtCustomerName").css("background-color", "#eaecf4");

        $("#btnViewPayment").removeAttr("disabled", "disabled");
        $(".btnSave").attr("disabled", "disabled");
        $("#btnBack").removeAttr("disabled", "disabled");
        $(".printConfirm").removeAttr("disabled", "disabled");
        $(".tblRefundLine tbody tr").each(function () {
          var $tblrow = $(this);
          $tblrow.find("td").attr("contenteditable", false);
          //$tblrow.find("td").removeClass("lineProductName");
          $tblrow.find("td").removeClass("lineTaxRate");
          $tblrow.find("td").removeClass("lineTaxCode");

          $tblrow.find("td").attr("readonly", true);
          $tblrow.find("td").attr("disabled", "disabled");
          $tblrow.find("td").css("background-color", "#eaecf4");
          $tblrow.find("td .table-remove").removeClass("btnRemove");
        });
      }

      // if (!checkISCustLoad) {
      //   sideBarService.getCustomersDataByName(data.fields.CustomerName).then(function (dataClient) {
      //       for (
      //         var c = 0;
      //         c < dataClient.tcustomervs1.length;
      //         c++
      //       ) {
      //         var customerrecordObj = {
      //           customerid: dataClient.tcustomervs1[c].Id || " ",
      //           firstname:
      //             dataClient.tcustomervs1[c].FirstName || " ",
      //           lastname:
      //             dataClient.tcustomervs1[c].LastName || " ",
      //           customername:
      //             dataClient.tcustomervs1[c].ClientName || " ",
      //           customeremail:
      //             dataClient.tcustomervs1[c].Email || " ",
      //           street: dataClient.tcustomervs1[c].Street || " ",
      //           street2:
      //             dataClient.tcustomervs1[c].Street2 || " ",
      //           street3:
      //             dataClient.tcustomervs1[c].Street3 || " ",
      //           suburb: dataClient.tcustomervs1[c].Suburb || " ",
      //           statecode:
      //             dataClient.tcustomervs1[c].State +
      //             " " +
      //             dataClient.tcustomervs1[c].Postcode || " ",
      //           country:
      //             dataClient.tcustomervs1[c].Country || " ",
      //           termsName:
      //             dataClient.tcustomervs1[c].TermsName || "",
      //           taxCode:
      //             dataClient.tcustomervs1[c].TaxCodeName || "E",
      //           clienttypename:
      //             dataClient.tcustomervs1[c].ClientTypeName ||
      //             "Default",
      //           discount:
      //             dataClient.tcustomervs1[c].Discount || 0,
      //         };
      //         clientList.push(customerrecordObj);

      //         invoicerecord.firstname =
      //           dataClient.tcustomervs1[c].FirstName || "";
      //         invoicerecord.lastname =
      //           dataClient.tcustomervs1[c].LastName || "";
      //         $("#edtCustomerEmail").val(
      //           dataClient.tcustomervs1[c].Email
      //         );
      //         $("#edtCustomerEmail").attr(
      //           "customerid",
      //           clientList[c].customerid
      //         );
      //         $("#edtCustomerName").attr(
      //           "custid",
      //           dataClient.tcustomervs1[c].Id
      //         );
      //         $("#edtCustomerEmail").attr(
      //           "customerfirstname",
      //           dataClient.tcustomervs1[c].FirstName
      //         );
      //         $("#edtCustomerEmail").attr(
      //           "customerlastname",
      //           dataClient.tcustomervs1[c].LastName
      //         );
      //         $("#customerType").text(
      //           dataClient.tcustomervs1[c].ClientTypeName ||
      //           "Default"
      //         );
      //         $("#customerDiscount").text(
      //           dataClient.tcustomervs1[c].Discount + "%" ||
      //           0 + "%"
      //         );
      //         $("#edtCustomerUseType").val(
      //           dataClient.tcustomervs1[c].ClientTypeName ||
      //           "Default"
      //         );
      //         $("#edtCustomerUseDiscount").val(
      //           dataClient.tcustomervs1[c].Discount || 0
      //         );
      //       }

      //       templateObject.clientrecords.set(
      //         clientList.sort(function (a, b) {
      //           if (a.customername == "NA") {
      //             return 1;
      //           } else if (b.customername == "NA") {
      //             return -1;
      //           }
      //           return a.customername.toUpperCase() >
      //             b.customername.toUpperCase()
      //             ? 1
      //             : -1;
      //         })
      //       );
      //     });
      // }
    }, 100);

    templateObject.invoicerecord.set(invoicerecord);

    templateObject.selectedCurrency.set(invoicerecord.currency);
    templateObject.inputSelectedCurrency.set(
      invoicerecord.currency
    );
    if (templateObject.invoicerecord.get()) {
      Meteor.call(
        "readPrefMethod",
        localStorage.getItem("mycloudLogonID"),
        "tblInvoiceLine",
        function (error, result) {
          if (error) {
          } else {
            if (result) {
              for (
                let i = 0;
                i < result.customFields.length;
                i++
              ) {
                let customcolumn = result.customFields;
                let columData = customcolumn[i].label;
                let columHeaderUpdate = customcolumn[i].thclass;
                let hiddenColumn = customcolumn[i].hidden;
                let columnClass = columHeaderUpdate.substring(
                  columHeaderUpdate.indexOf(".") + 1
                );
                let columnWidth = customcolumn[i].width;

                $("" + columHeaderUpdate + "").html(columData);
                if (columnWidth != 0) {
                  $("" + columHeaderUpdate + "").css(
                    "width",
                    columnWidth + "%"
                  );
                }

                if (hiddenColumn == true) {
                  $("." + columnClass + "").addClass(
                    "hiddenColumn"
                  );
                  $("." + columnClass + "").removeClass(
                    "showColumn"
                  );
                } else if (hiddenColumn == false) {
                  $("." + columnClass + "").removeClass(
                    "hiddenColumn"
                  );
                  $("." + columnClass + "").addClass(
                    "showColumn"
                  );
                }
              }
            }
          }
        }
      );
    }

    return {record: invoicerecord, attachmentCount: templateObject.attachmentCount.get(), uploadedFiles: templateObject.uploadedFiles.get(), selectedCurrency: invoicerecord.currency};

  };
   

  
  $(document).on("click", "#custListType tbody tr", function (e) {
    if (clickedInput == "one") {
      $("#edtSaleCustField1").val($(this).find(".colFieldName").text());
    } else if (clickedInput == "two") {
      $("#edtSaleCustField2").val($(this).find(".colFieldName").text());
    } else if (clickedInput == "three") {
      $("#edtSaleCustField3").val($(this).find(".colFieldName").text());
    }
    $("#customFieldList").modal("toggle");
  });


  templateObject.updateRefundTemp = async function(objDetails) {
    return new Promise( (resolve, reject) => {
      let currentTemp = templateObject.temporaryfiles.get();
      let newTemp = [...currentTemp, objDetails];
      templateObject.temporaryfiles.set(newTemp);
       addVS1Data('TRefundTemp', JSON.stringify({trefundtemp:newTemp})).then(function(){resolve()})
    })
  }


});

Template.new_refund_temp.helpers({
  oneExAPIName: function () {
    let salesService = new SalesBoardService();
    return salesService.getRefundSales;
  },

  service: () => {
    let salesService = new SalesBoardService();
    return salesService;
  },

  listapiservice: function () {
    return sideBarService
  },

  listapifunction: function () {
    return sideBarService.getAllTRefundSaleListData
  },

  saveapifunction:function () {
    return salesService.saveRefundSale
  },

  setTransData: () => {
    let templateObject = Template.instance();
    return function (data) {
      let dataReturn = templateObject.setRefundData(data)
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

  includeBOnShippedQty: () => {
    return Template.instance().includeBOnShippedQty.get();
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
      templateObject.saveRefundData(data)
    }
  },


  updateTransactionTemp:  function() {
    let templateObject = Template.instance();
    return async function(data) {
      await templateObject.updateRefundTemp(data)
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

  bsbRegionName: () => {
    return bsbCodeName;
  },

  isBatchSerialNoTracking: () => {
    return localStorage.getItem("CloudShowSerial") || false;
  },
  invoicerecord: () => {
    return Template.instance().invoicerecord.get();
  },

  customerRecord: () => {
    return Template.instance().customerRecord.get();
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
  custfield1: () => {
    return localStorage.getItem("custfield1sales") || "Custom Field 1";
  },
  custfield2: () => {
    return localStorage.getItem("custfield2sales") || "Custom Field 2";
  },
  custfield3: () => {
    return localStorage.getItem("custfield3sales") || "Custom Field 3";
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
        return a.customername.toUpperCase() > b.customername.toUpperCase()
          ? 1
          : -1;
      });
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: localStorage.getItem("mycloudLogonID"),
      PrefName: "refundcard",
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
  // statusrecords: () => {
  //   return Template.instance()
  //     .statusrecords.get()
  //     .sort(function (a, b) {
  //       if (a.orderstatus == "NA") {
  //         return 1;
  //       } else if (b.orderstatus == "NA") {
  //         return -1;
  //       }
  //       return a.orderstatus.toUpperCase() > b.orderstatus.toUpperCase()
  //         ? 1
  //         : -1;
  //     });
  // },
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

  isForeignEnabled: () => {
    return Template.instance().isForeignEnabled.get();
  },
  getDefaultCurrency: () => {
    return defaultCurrencyCode;
  },

});

Template.new_refund_temp.events({
  "click .btnRefreshCustomField": function (event) {
    LoadingOverlay.show();
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
        LoadingOverlay.hide();
      })
      .catch(function (err) {
        LoadingOverlay.hide();
      });
  },

  
  
  
 
  "click .btnSaveSettings": function (event) {
    playSaveAudio();
    setTimeout(function () {
      $("#myModal4").modal("toggle");
    }, delayTimeAfterSound);
  },
 
  "click #btnPayment": function () {
    let templateObject = Template.instance();
    let customername = $("#edtCustomerName");
    let salesService = new SalesBoardService();
    let termname = $(".transheader > #sltTerms_fromtransactionheader").val() || "";
    if (termname === "") {
      swal("Terms has not been selected!", "", "warning");
      event.preventDefault();
      return false;
    }
    if (customername.val() === "") {
      swal("Customer has not been selected!", "", "warning");
      e.preventDefault();
    } else {
      LoadingOverlay.show();
      var splashLineArray = new Array();
      let lineItemsForm = [];
      let lineItemObjForm = {};
      var saledateTime = new Date($("#dtSODate").datepicker("getDate"));
      var duedateTime = new Date($("#dtDueDate").datepicker("getDate"));

      let saleDate =
        saledateTime.getFullYear() +
        "-" +
        (saledateTime.getMonth() + 1) +
        "-" +
        saledateTime.getDate();
      $("#tblInvoiceLine > tbody > tr").each(function () {
        var lineID = this.id;
        let tdproduct = $("#" + lineID + " .lineProductName").val();
        let tddescription = $("#" + lineID + " .lineProductDesc").text();
        let tdQty = $("#" + lineID + " .lineQty").val();
        let tdunitprice = $("#" + lineID + " .colUnitPriceExChange").val();
        let tdtaxCode =
          $("#" + lineID + " .lineTaxCode").val() || loggedTaxCodeSalesInc;

        if (tdproduct != "") {
          lineItemObjForm = {
            type: "TRefundSaleLine",
            fields: {
              ProductName: tdproduct || "",
              ProductDescription: tddescription || "",
              UOMOrderQty: parseFloat(tdQty) || 0,
              UOMQtySold: parseFloat(tdQty) || 0,
              UOMQtyShipped: parseFloat(tdQty) || 0,
              LinePrice: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
              Headershipdate: saleDate,
              LineTaxCode: tdtaxCode || "",
              DiscountPercent:
                parseFloat($("#" + lineID + " .lineDiscount").text()) || 0,
            },
          };
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

      let saleCustField1 = $("#edtSaleCustField1").val() || "";
      let saleCustField2 = $("#edtSaleCustField2").val() || "";
      let saleCustField3 = $("#edtSaleCustField3").val() || "";
      var url = FlowRouter.current().path;
      var getso_id = url.split("?id=");
      var currentInvoice = getso_id[getso_id.length - 1];
      let uploadedItems = templateObject.uploadedFiles.get();
      var currencyCode = $(".transheader > .sltCurrency").val() || CountryAbbr;
      let ForeignExchangeRate = $("#exchange_rate").val() || 0;
      let foreignCurrencyFields = {};
      if (FxGlobalFunctions.isCurrencyEnabled()) {
        foreignCurrencyFields = {
          ForeignExchangeCode: currencyCode,
          ForeignExchangeRate: parseFloat(ForeignExchangeRate),
        };
      }
      var objDetails = "";
      if (getso_id[1]) {
        currentInvoice = parseInt(currentInvoice);
        objDetails = {
          type: "TRefundSale",
          fields: {
            ID: currentInvoice,
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
            SalesStatus: $(".transheader > #sltStatus_fromtransactionheader").val(),
          },
        };
      } else {
        objDetails = {
          type: "TRefundSale",
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
            SalesStatus: $(".transheader > #sltStatus_fromtransactionheader").val(),
          },
        };
      }


      let currentrefundtemp = templateObject.temporaryfiles.get();
      let newrefundtemp= [...currentrefundtemp, objDetails];
      templateObject.temporaryfiles.set(newrefundtemp);
      addVS1Data('TRefundTemp', JSON.stringify({trefundtemp: newrefundtemp})).then(function(){
      // salesService
      //   .saveRefundSale(objDetails)
      //   .then(function (objDetails) {
          var customerID = $("#edtCustomerEmail").attr("customerid");
          if (customerID !== " ") {
            let customerEmailData = {
              type: "TCustomer",
              fields: {
                ID: customerID,
                Email: customerEmail,
              },
            };
          }
          let linesave = objDetails.fields.ID;
          var getcurrentCloudDetails = CloudUser.findOne({
            _id: localStorage.getItem("mycloudLogonID"),
            clouddatabaseID: localStorage.getItem("mycloudLogonDBID"),
          });
          if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
              var clientID = getcurrentCloudDetails._id;
              var clientUsername = getcurrentCloudDetails.cloudUsername;
              var clientEmail = getcurrentCloudDetails.cloudEmail;
              var checkPrefDetails = CloudPreference.findOne({
                userid: clientID,
                PrefName: "refundcard",
              });

              if (checkPrefDetails) {
                CloudPreference.update(
                  {
                    _id: checkPrefDetails._id,
                  },
                  {
                    $set: {
                      username: clientUsername,
                      useremail: clientEmail,
                      PrefGroup: "salesform",
                      PrefName: "refundcard",
                      published: true,
                      customFields: [
                        {
                          index: "1",
                          label: getcustomField1,
                          hidden: getchkcustomField1,
                        },
                        {
                          index: "2",
                          label: getcustomField2,
                          hidden: getchkcustomField2,
                        },
                      ],
                      updatedAt: new Date(),
                    },
                  },
                  function (err, idTag) {
                    if (err) {
                      window.open("/paymentcard?invid=" + linesave, "_self");
                    } else {
                      window.open("/paymentcard?invid=" + linesave, "_self");
                    }
                  }
                );
              } else {
                CloudPreference.insert(
                  {
                    userid: clientID,
                    username: clientUsername,
                    useremail: clientEmail,
                    PrefGroup: "salesform",
                    PrefName: "refundcard",
                    published: true,
                    customFields: [
                      {
                        index: "1",
                        label: getcustomField1,
                        hidden: getchkcustomField1,
                      },
                      {
                        index: "2",
                        label: getcustomField2,
                        hidden: getchkcustomField2,
                      },
                    ],
                    createdAt: new Date(),
                  },
                  function (err, idTag) {
                    if (err) {
                      window.open("/paymentcard?invid=" + linesave, "_self");
                    } else {
                      window.open("/paymentcard?invid=" + linesave, "_self");
                    }
                  }
                );
              }
            }
          }
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
            } else if (result.dismiss === "cancel") {
            }
          });

          LoadingOverlay.hide();
        });
    }
  },
  "click #btnViewPayment": function () {
    var url = FlowRouter.current().path;
    var getso_id = url.split("?id=");
    var currentInvoice = getso_id[getso_id.length - 1];

    let customer = $("#edtCustomerName").val();
    window.open(
      "/paymentcard?custname=" + customer + "&from=" + currentInvoice,
      "_self"
    );
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

});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});
