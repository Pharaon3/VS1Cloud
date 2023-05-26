import { Template } from 'meteor/templating';
import './transaction_card.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveVar } from 'meteor/reactive-var';
import 'jquery-ui-dist/external/jquery/jquery';
import { SideBarService } from '../../../js/sidebar-service';
import { ContactService } from '../../../contacts/contact-service';
import { UtilityService } from '../../../utility-service';
import { ProductService } from '../../../product/product-service';
import { TaxRateService } from '../../../settings/settings-service';
import { PurchaseBoardService } from '../../../js/purchase-service';
import FxGlobalFunctions from "../../../packages/currency/FxGlobalFunctions";
import { cloneDeep } from 'lodash';
import { SalesBoardService } from '../../../js/sales-service';
import { FixedAssetService } from '../../../fixedassets/fixedasset-service';
import LoadingOverlay from '../../../LoadingOverlay';
import { Random } from "meteor/random";
import { setCurrentCurrencySymbol, getCurrencySymbol } from '../../../popUps/currnecypopup';

let sideBarService = new SideBarService();
let contactService = new ContactService();
let utilityService = new UtilityService();
let salesService = new SalesBoardService();
let fixedAssetService = new FixedAssetService();
let clientsService = new PurchaseBoardService();
let taxRateService = new TaxRateService();
var noHasTotals = ["Customer Payment", "Customer Statement", "Supplier Payment", "Statement", "Delivery Docket", "Journal Entry", "Deposit"];
var times = 0;
Template.transaction_card.onCreated(function () {
  let templateObject = Template.instance();
  templateObject.transactionrecord = new ReactiveVar();
  templateObject.hasFollow = new ReactiveVar();
  templateObject.accountID = new ReactiveVar();
  templateObject.stripe_fee_method = new ReactiveVar();
  templateObject.clientrecords = new ReactiveVar();
  templateObject.clientrecord = new ReactiveVar();
  templateObject.selectedLineId = new ReactiveVar('');
  templateObject.taxraterecords = new ReactiveVar();
  templateObject.taxcodes = new ReactiveVar();
  templateObject.attachmentCount = new ReactiveVar();
  templateObject.uploadedFiles = new ReactiveVar([]);
  templateObject.selectedCurrency = new ReactiveVar();
  templateObject.defaultsaleterm = new ReactiveVar();
  templateObject.termrecords = new ReactiveVar();
  templateObject.includeBOnShippedQty = new ReactiveVar();
  templateObject.includeBOnShippedQty.set(true);
  templateObject.assetCostTypes = new ReactiveVar();
  templateObject.currentLineID = new ReactiveVar();
  templateObject.showFx = new ReactiveVar(false);
  templateObject.fxEnabled = new ReactiveVar(false);
  templateObject.followingTransactions = new ReactiveVar([]);
  templateObject.showDelivery = new ReactiveVar(false);
  templateObject.selectedLine = new ReactiveVar();
  
  let isBOnShippedQty = localStorage.getItem("CloudSalesQtyOnly")||false;
  if(JSON.parse(isBOnShippedQty)) {
    templateObject.includeBOnShippedQty.set(false);
  }
})

Template.transaction_card.onRendered(async function () {
  LoadingOverlay.show();
  let templateObject = Template.instance();

  templateObject.getClientDetail = async function (data) {
    return new Promise((resolve, reject) => {
      let client = ""
      if(templateObject.data.clientType == 'Customer') {
        client ={
         customerid: data.tcustomer[0].fields.ID || " ",
         firstname: data.tcustomer[0].fields.FirstName || " ",
         lastname: data.tcustomer[0].fields.LastName || " ",
         customername: data.tcustomer[0].fields.ClientName || " ",
         customeremail: data.tcustomer[0].fields.Email || " ",
         street: data.tcustomer[0].fields.Street || " ",
         street2: data.tcustomer[0].fields.Street2 || " ",
         street3: data.tcustomer[0].fields.Street3 || " ",
         suburb: data.tcustomer[0].fields.Suburb || " ",
         statecode: data.tcustomer[0].fields.State +
           " " +
           data.tcustomer[0].fields.Postcode || " ",
         country: data.tcustomer[0].fields.Country || " ",
         termsName: data.tcustomer[0].fields.TermsName || "",
         taxCode: data.tcustomer[0].fields.TaxCodeName || "E",
         clienttypename: data.tcustomer[0].fields.ClientTypeName || "Default",
         discount: data.tcustomer[0].fields.Discount || 0,
       }
      } else if (templateObject.data.clientType == 'Supplier') {
        client = {
          supplierid: data.tsupplier[0].ID || ' ',
          suppliername: data.tsupplier[0].ClientName || ' ',
          supplieremail: data.tsupplier[0].Email || ' ',
          street: data.tsupplier[0].Street || ' ',
          street2: data.tsupplier[0].Street2 || ' ',
          street3: data.tsupplier[0].Street3 || ' ',
          suburb: data.tsupplier[0].Suburb || ' ',
          statecode: data.tsupplier[0].State + ' ' + data.tsupplier[0].Postcode || ' ',
          country: data.tsupplier[0].Country || ' ',
          termsName: data.tsupplier[0].TermsName || ''
      }
      }
      resolve(client);
    })
  }

  templateObject.getClientDetailById = function (clientId) {
    let clients = templateObject.clientrecords.get();
    return new Promise((resolve, reject)=> {
      let client;
      let clientIndex = clients.findIndex(item=>{
        return item.customerid == clientId;
      })
      if(clientIndex != -1) {
        resolve(clients[clientIndex])
      } else {
        if(templateObject.data.clientType == 'Customer') {
          contactService.getOneCustomerDataEx(clientId).then(data=> {
            resolve(templateObject.getClientDetail(data))
            
          }).catch(function(err) {resolve('')})
        } else if(templateObject.data.clientType == 'Supplier') {
          contactService.getOneSupplierDataEx(clientId).then (data => {
            templateObject.getClientDetail(data)
          }).catch(function(err) {resolve('')})
        }
      }
    })
  }

  templateObject.getClientDetailByName = async function (clientname) {
    let clients = templateObject.clientrecords.get();
    return new Promise((resolve, reject)=> {
      let client;
      let clientIndex = clients.findIndex(item=>{
        if(templateObject.data.clientType == 'Customer') {
          return item.customername == clientname;
        } else if(templateObject.data.clientType == 'Supplier') {
          return item.suppliername == clientname
        }
      })
      if(clientIndex != -1) {
        resolve(clients[clientIndex])
      } else {
        if(templateObject.data.clientType == 'Customer') {
          contactService.getOneCustomerDataExByName(clientname).then(data=> {
            resolve(templateObject.getClientDetail(data))
            
          }).catch(function(err) {resolve('')})
        } else if(templateObject.data.clientType == 'Supplier') {
          contactService.getOneSupplierDataExByName(clientname).then (data => {
            resolve(templateObject.getClientDetail(data))
          }).catch(function(err) {resolve('')})
        }
      }
    })
  }
  templateObject.getDayNumber = function (day) {
    day = day.toLowerCase();
    if (day == "") {
      return;
    }
    if (day == "monday") {
      return 1;
    }
    if (day == "tuesday") {
      return 2;
    }
    if (day == "wednesday") {
      return 3;
    }
    if (day == "thursday") {
      return 4;
    }
    if (day == "friday") {
      return 5;
    }
    if (day == "saturday") {
      return 6;
    }
    if (day == "sunday") {
      return 0;
    }
  }
  templateObject.setClientVS1 = function(data) {
    if(templateObject.data.clientType == 'Customer') {
      const clientList = [];
      for (let i in data.tcustomervs1) {
        if (data.tcustomervs1.hasOwnProperty(i)) {
          let customerrecordObj = {
            customerid: data.tcustomervs1[i].fields.ID || " ",
            firstname: data.tcustomervs1[i].fields.FirstName || " ",
            lastname: data.tcustomervs1[i].fields.LastName || " ",
            customername: data.tcustomervs1[i].fields.ClientName || " ",
            customeremail: data.tcustomervs1[i].fields.Email || " ",
            street: data.tcustomervs1[i].fields.Street || " ",
            street2: data.tcustomervs1[i].fields.Street2 || " ",
            street3: data.tcustomervs1[i].fields.Street3 || " ",
            suburb: data.tcustomervs1[i].fields.Suburb || " ",
            statecode: data.tcustomervs1[i].fields.State +
              " " +
              data.tcustomervs1[i].fields.Postcode || " ",
            country: data.tcustomervs1[i].fields.Country || " ",
            termsName: data.tcustomervs1[i].fields.TermsName || "",
            taxCode: data.tcustomervs1[i].fields.TaxCodeName || "E",
            clienttypename: data.tcustomervs1[i].fields.ClientTypeName || "Default",
            discount: data.tcustomervs1[i].fields.Discount || 0,
          };
          clientList.push(customerrecordObj);
        }
      }
      templateObject.clientrecords.set(clientList);
      if (!(FlowRouter.current().queryParams.id ||
        FlowRouter.current().queryParams.customerid ||
        FlowRouter.current().queryParams.copyquid ||
        FlowRouter.current().queryParams.copyinvid ||
        FlowRouter.current().queryParams.copysoid)
      ) {
        setTimeout(function () {
          $("#edtCustomerName").trigger("click");
        }, 500);
      }
    } else if(templateObject.data.clientType == 'Supplier') {
      let clientList = [];
      for (let i in data.tsuppliervs1) {
        if (data.tsuppliervs1.hasOwnProperty(i)) {
            let supplierrecordObj = {
                supplierid: data.tsuppliervs1[i].ID || data.tsuppliervs1[i].fields.ID || ' ',
                suppliername: data.tsuppliervs1[i].ClientName || data.tsuppliervs1[i].fields.ClientName || ' ',
                supplieremail: data.tsuppliervs1[i].Email || data.tsuppliervs1[i].fields.Email || ' ',
                street: data.tsuppliervs1[i].Street || data.tsuppliervs1[i].fields.Street || ' ',
                street2: data.tsuppliervs1[i].Street2 || data.tsuppliervs1[i].fields.Street2 || ' ',
                street3: data.tsuppliervs1[i].Street3 || data.tsuppliervs1[i].fields.Street3 || ' ',
                suburb: data.tsuppliervs1[i].Suburb || data.tsuppliervs1[i].fields.Suburb || ' ',
                statecode: data.tsuppliervs1[i].State + ' ' + data.tsuppliervs1[i].Postcode|| data.tsuppliervs1[i].fields.State + ' ' + data.tsuppliervs1[i].fields.Postcode || ' ',
                country: data.tsuppliervs1[i].Country || data.tsuppliervs1[i].fields.Country || ' ',
                termsName: data.tsuppliervs1[i].TermsName || data.tsuppliervs1[i].fields.TermsName || ''
            };
            clientList.push(supplierrecordObj);
        }
    }
      templateObject.clientrecords.set(clientList);
      for (let i = 0; i < clientList.length; i++) {
          //$('#edtSupplierName').editableSelect('add', clientList[i].customername);
      }
      if (FlowRouter.current().queryParams.id || FlowRouter.current().queryParams.supplierid || FlowRouter.current().queryParams.copypoid) {

      } else {
          setTimeout(function() {
              $('#edtSupplierName').trigger("click");
          }, 500);
      }
    } 
  }
  templateObject.getAllClients = function () {
    if(templateObject.data.clientType == 'Customer') {
      getVS1Data("TCustomerVS1")
        .then(function (dataObject) {
          if (dataObject.length === 0) {
            sideBarService.getAllCustomersDataVS1("All").then(function (data) {
              templateObject.setClientVS1(data);
            });
          } else {
            let data = JSON.parse(dataObject[0].data);
            templateObject.setClientVS1(data);
          }
        })
        .catch(function (err) {
          sideBarService.getAllCustomersDataVS1("All").then(function (data) {
            templateObject.setClientVS1(data);
          });
        });
    }else if(templateObject.data.clientType == 'Supplier') {
      getVS1Data('TSupplierVS1').then(function(dataObject) {
        if (dataObject.length === 0) {
            clientsService.getSupplierVS1().then(function(data) {
              templateObject.setClientVS1(data.tsuppliervs);
            });
        } else {
            let data = JSON.parse(dataObject[0].data);
            templateObject.setClientVS1(data);
        }
    }).catch(function(err) {
        clientsService.getSupplierVS1().then(function(data) {
            templateObject.setClientVS1(data);
        });
    });
    }
  }
  templateObject.getAllClients();

  templateObject.getTerms = function () {
    const termrecords = [];
    getVS1Data("TTermsVS1")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          salesService.getTermVS1().then(function (data) {
            for (let i in data.ttermsvs1) {
              let termrecordObj = {
                termsname: data.ttermsvs1[i].TermsName || " ",
                isSalesdefault: data.ttermsvs1[i].isSalesdefault || ""
              };

              if (data.ttermsvs1[i].isSalesdefault == true) {
                localStorage.setItem(
                  "ERPTermsSales",
                  data.ttermsvs1[i].TermsName || "COD"
                );
                templateObject.defaultsaleterm.set(data.ttermsvs1[i].TermsName);
              }

              termrecords.push(termrecordObj);
              templateObject.termrecords.set(termrecords);
            }
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.ttermsvs1;
          for (let i in useData) {
            let termrecordObj = {
              termsname: useData[i].TermsName || " ",
              isSalesdefault: useData[i].isSalesdefault || ""
            };
            if (useData[i].isSalesdefault == true) {
              templateObject.defaultsaleterm.set(useData[i].TermsName);
            }

            termrecords.push(termrecordObj);
            templateObject.termrecords.set(termrecords);
          }
        }
      })
      .catch(function (err) {
        salesService.getTermVS1().then(function (data) {
          for (let i in data.ttermsvs1) {
            let termrecordObj = {
              termsname: data.ttermsvs1[i].TermsName || " ",
              isSalesdefault: data.ttermsvs1[i].isSalesdefault || ""
            };
            if (data.ttermsvs1[i].isSalesdefault == true) {
              localStorage.setItem(
                "ERPTermsSales",
                data.ttermsvs1[i].TermsName || "COD"
              );
              templateObject.defaultsaleterm.set(data.ttermsvs1[i].TermsName);
            }
            termrecords.push(termrecordObj);
            templateObject.termrecords.set(termrecords);
          }
        });
      });
  };

  templateObject.getTerms();
  
  templateObject.getOrganisationDetails = function () {
    let account_id = localStorage.getItem("vs1companyStripeID") || "";
    let stripe_fee = localStorage.getItem("vs1companyStripeFeeMethod") || "apply";
    templateObject.accountID.set(account_id);
    templateObject.stripe_fee_method.set(stripe_fee);
  };
  templateObject.getOrganisationDetails()
  /**
   * Get Invoice Data from indexedb
   */
  async function getTransDataFromIndexedDB(trans_id) {
    let exIndexDBName = templateObject.data.exIndexDBName;
    let exLowercaseName = templateObject.data.exLowercaseName
    try {
      const dataObject = await getVS1Data(exIndexDBName);
      if (dataObject.length === 0) {
        return undefined;
      }
      const transactions = JSON.parse(dataObject[0].data)[exLowercaseName];
      const currentTransactionData = transactions.find(trans => trans.fields.ID === trans_id);
      return currentTransactionData
    } catch (error) {
      return undefined;
    }
  }
  /**
   * Get invoice data from server
   * @param trans_id
   */
  async function getTransDataFromServer(trans_id) {
    try {
      let that = templateObject.data.service;
      const dataObject = await templateObject.data.oneExAPIName.apply(that, [trans_id]);
      return dataObject;
    } catch (error) {
      swal({
        title: "Oooops...",
        text: error,
        type: "error",
        showCancelButton: false,
        confirmButtonText: "Try Again",
      }).then((result) => {
        if (result.value) {
          // if (error === checkResponseError) {
            // window.open("/", "_self");
          // }
        } else if (result.dismiss === "cancel") { }
      });
      $(".fullScreenSpin").css("display", "none");
    }
  }

  templateObject.getTransactionData = async function(trans_id) {
    let data = await getTransDataFromIndexedDB(trans_id)
    if (data === undefined) {
      data = await getTransDataFromServer(trans_id)
    }
    $(".fullScreenSpin").css("display", "none");
    if(data) {
      let record = templateObject.data.setTransData(data);
      templateObject.transactionrecord.set(record.record);
      if(record) {
        templateObject.hasFollow.set(record.record.isRepeated)
        let currentCurrencySymbol = await FxGlobalFunctions.getCurrencySymbol(record.record.currency)
        setCurrentCurrencySymbol(currentCurrencySymbol)
        let clientID = '';
        let clientName = '';
        if(templateObject.data.clientType == 'Customer') {
          clientID = record.record.CustomerID;
          clientName = record.record.socustomer
        } else if(templateObject.data.clientType == 'Supplier') {
          clientID = record.record.SupplierID;
          clientName = record.record.sosupplier
        }
        if(clientID != '' && clientName != '') {
          let clientList = templateObject.clientrecords.get();
          let index = -1;
          if(templateObject.data.clientType == 'Customer') {
            index =  clientList.findIndex(client => {
              return client.customerid == clientID && client.customername == clientName
            }) 
          } else if(templateObject.data.clientType == 'Supplier') {
            index =  clientList.findIndex(client => {
              return client.supplierid == clientID && client.suppliername == clientName
            }) 
          }
          if(index > -1) {
            if(templateObject.data.clientType == 'Customer') {
              $('.transheader > #edtCustomerEmail').val(clientList[index].customeremail);
            } else if(templateObject.data.clientType == 'Supplier'){
              $('.transheader > #edtSupplierEmail').val(clientList[index].supplieremail)
            }
          } else {
            if(templateObject.data.clientType == 'Customer') {
              contactService.getOneCustomerDataEx(clientID).then(function(data){
                let customeremail = data.fields.Email;
                $('.transheader > #edtCustomerEmail').val(customeremail)
              }).catch(function(err){
              })
            } else if(templateObject.data.clientType == 'Supplier') {
              contactService.getOneSupplierDataEx(clientID).then(function(data) {
                let supplierEmail = data.fields.Email;
                $('.transheader > #edtSupplierEmail').val(supplierEmail)
              })

            }
          }
        }
      }
      LoadingOverlay.hide();
      templateObject.selectedCurrency.set(record.record.currency)
      if(record.attachmentCount) {
        templateObject.attachmentCount.set(record.attachmentCount);
      }
      if(record.uploadedFiles) {
        templateObject.uploadedFiles.set(record.uploadedFiles)
      }
    }
  }

  templateObject.checkFollowingTransactions = async function() {
    let followingtransactions = [];
    /** some indexedDB code and api code here */
    templateObject.followingTransactions.set(followingtransactions);
  }

  templateObject.checkFollowingTransactions();

  function loadTemplateBody1(object_invoce) {
    if (object_invoce[0]["taxItems"]) {
      let taxItems = object_invoce[0]["taxItems"];
      if (taxItems && Object.keys(taxItems).length > 0) {
        $("#templatePreviewModal #tax_list_print").html("");
        Object.keys(taxItems).map((code) => {
          let html = `
              <div style="width: 100%; display: flex;">
                  <div style="padding-right: 16px; width: 50%;">
                      <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
                          ${code}</p>
                  </div>
                  <div style="padding-left: 16px; width: 50%;">
                      <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
                          $${taxItems[code].toFixed(3)}</p>
                  </div>
              </div>
          `;
          $("#templatePreviewModal #tax_list_print").append(html);
        });
      } else {
        $("#templatePreviewModal #tax_list_print").remove();
      }
    }


    // table content
    var tbl_content = $("#templatePreviewModal .tbl_content");
    tbl_content.empty();
    const data = object_invoce[0]["data"];
    let idx = 0;
    for (item of data) {
      idx = 0;
      var html = "";
      html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, 0.1);'>";
      for (item_temp of item) {
        if (idx > 1)
          html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
        else
          html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
        idx++;
      }

      html += "</tr>";
      tbl_content.append(html);
    }


    // total amount
    if (noHasTotals.includes(object_invoce[0]["title"])) {
      $("#templatePreviewModal .field_amount").hide();
      $("#templatePreviewModal .field_payment").css("borderRight", "0px solid black");
    } else {
      $("#templatePreviewModal .field_amount").show();
      $("#templatePreviewModal .field_payment").css("borderRight", "1px solid black");
    }

    $("#templatePreviewModal #subtotal_total").text("Sub total");
    $("#templatePreviewModal #subtotal_totalPrint").text(
      object_invoce[0]["subtotal"]
    );

    $("#templatePreviewModal #grandTotal").text("Grand total");
    $("#templatePreviewModal #totalTax_totalPrint").text(
      object_invoce[0]["gst"]
    );

    $("#templatePreviewModal #grandTotalPrint").text(
      object_invoce[0]["total"]
    );

    $("#templatePreviewModal #totalBalanceDuePrint").text(
      object_invoce[0]["bal_due"]
    );

    $("#templatePreviewModal #paid_amount").text(
      object_invoce[0]["paid_amount"]
    );
  }

  function loadTemplateBody2(object_invoce) {
    if (object_invoce[0]["taxItems"]) {
      let taxItems = object_invoce[0]["taxItems"];
      if (taxItems && Object.keys(taxItems).length > 0) {
        $("#templatePreviewModal #tax_list_print").html("");
        Object.keys(taxItems).map((code) => {
          let html = `
                        <div style="width: 100%; display: flex;">
                            <div style="padding-right: 16px; width: 50%;">
                                <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
                                    ${code}</p>
                            </div>
                            <div style="padding-left: 16px; width: 50%;">
                                <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
                                    $${taxItems[code].toFixed(3)}</p>
                            </div>
                        </div>
                    `;
          $("#templatePreviewModal #tax_list_print").append(html);
        });
      } else {
        $("#templatePreviewModal #tax_list_print").remove();
      }
    }


    // table content
    var tbl_content = $("#templatePreviewModal .tbl_content");
    tbl_content.empty();
    const data = object_invoce[0]["data"];
    let idx = 0;
    for (item of data) {
      idx = 0;
      var html = "";
      html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, 0.1);'>";
      for (item_temp of item) {
        if (idx > 1)
          html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
        else
          html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
        idx++;
      }

      html += "</tr>";
      tbl_content.append(html);
    }


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
    if (object_invoce[0]["taxItems"]) {
      let taxItems = object_invoce[0]["taxItems"];
      if (taxItems && Object.keys(taxItems).length > 0) {
        $("#templatePreviewModal #tax_list_print").html("");
        Object.keys(taxItems).map((code) => {
          let html = `
                        <div style="width: 100%; display: flex;">
                            <div style="padding-right: 16px; width: 50%;">
                                <p style="font-weight: 600; text-align: left; margin-bottom: 8px; color: rgb(0 0 0);">
                                    ${code}</p>
                            </div>
                            <div style="padding-left: 16px; width: 50%;">
                                <p style="font-weight: 600; text-align: right; margin-bottom: 8px; color: rgb(0 0 0);">
                                    $${taxItems[code].toFixed(3)}</p>
                            </div>
                        </div>
                    `;
            $("#templatePreviewModal #tax_list_print").append(html);
          });
        } else {
          $("#templatePreviewModal #tax_list_print").remove();
        }
      }


      // table content
      var tbl_content = $("#templatePreviewModal .tbl_content");
      tbl_content.empty();
      const data = object_invoce[0]["data"];
      let idx = 0;
      for (item of data) {
        idx = 0;
        var html = "";
        html += "<tr style='border-bottom: 1px solid rgba(0, 0, 0, 0.1);'>";
        for (item_temp of item) {
          if (idx > 1)
            html = html + "<td style='text-align: right; padding-right: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
          else
            html = html + "<td style='padding-left: " + firstIndentLeft + "px;'>" + item_temp + "</td>";
          idx++;
        }

        html += "</tr>";
        tbl_content.append(html);
      }

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

  function saveTemplateFields(key, value){
    localStorage.setItem(key, value)
  }

  templateObject.showTemplate1 = async function(template_title, number, bprint){
    var array_data = [];
    let lineItems = [];
    let taxItems = {};
    let object_invoce = [];
    let item_transactions = "";

    let trans_data =  templateObject.transactionrecord.get();
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
    if(templateObject.data.clientType == 'Supplier') {
        customer = $('#edtSupplierName').val();
    }
    let name = $("#firstname").val();
    let surname = $("#lastname").val();
    let dept = $("#sltDept").val();
    let fx = $("#sltCurrency").val();
    var comment = $("#txaComment").val();
    var subtotal_tax = $("#subtotal_tax").html() || Currency+ 0;
    var total_paid = $("#totalPaidAmt").html() || Currency+ 0 ;
    var ref = $("#edtRef").val() || "-";
    var txabillingAddress = $("#txabillingAddress").val() || "";
    txabillingAddress = txabillingAddress.replace(/\n/g, '<br/>');
    var dtSODate = $("#dtSODate").val();
    var subtotal_total = $("#subtotal_total").text() || Currency+ 0;
    var grandTotal = $("#grandTotal").text() || Currency+ 0;
    var duedate = $("#dtDueDate").val();
    var po = $("#ponumber").val() || ".";


    $("#"+templateObject.data.gridTableId+" > tbody > tr").each(function () {
        var lineID = this.id;
        let tdproduct = $("#" + lineID + " .lineProductName").val();
        let tddescription = $("#" + lineID + " .lineProductDesc").text();
        let tdpqa = $("#" + lineID + " .lineProductDesc").attr("data-pqa");
        if(tdpqa){
            tddescription += " " + tdpqa;
        }

        let tdQty = $("#" + lineID + " .lineQty").val();
        let tdunitprice = $("#" + lineID + " .colUnitPriceExChange").val();
        let tdtaxrate = $("#" + lineID + " .lineTaxRate").text();
        let tdlineamt = $("#" + lineID + " .colAmountEx").first().text();
        let taxAmount = $("#"+ lineID+ " .colTaxAmount").first().text();

        let targetRow = $("#" + lineID);
        let targetTaxCode = targetRow.find(".lineTaxCode").val();
        let qty = targetRow.find(".lineQty").val() || 0
        let price = targetRow.find(".colUnitPriceExChange").val() || 0;
        const taxDetail = templateObject.taxcodes.get().find((v) => v.CodeName === targetTaxCode);

        if (taxDetail) {
            let priceTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, ""));
            if (taxDetail.Lines) {
                taxDetail.Lines.map((line) => {
                    let taxCode = line.SubTaxCode;
                    let amount = priceTotal * line.Percentage / 100;
                    if (taxItems[taxCode]) {
                        taxItems[taxCode] += amount;
                    }
                    else {
                        taxItems[taxCode] = amount;
                    }
                });
            }
            else {
                // taxItems[targetTaxCode] = taxTotal;
            }
        }

        array_data.push([
            tdproduct,
            tddescription,
            tdQty,
            tdunitprice,
            taxAmount,
            tdlineamt,
        ]);

        const lineItemObj = {
            description: tddescription || "",
            quantity: tdQty || 0,
            unitPrice: tdunitprice?.toLocaleString(undefined, {
                minimumFractionDigits: 2
            }) || 0,
            tax: tdtaxrate || 0,
            amount: tdlineamt || 0,
        }

        lineItems.push(lineItemObj);
    });


    let company = localStorage.getItem("vs1companyName");
    let vs1User = localStorage.getItem("mySession");
    let customerEmail = $("#edtCustomerEmail").val();
    let currencyname = (CountryAbbr).toLowerCase();
    let stringQuery = "?";
    for (let l = 0; l < lineItems.length; l++) {
        stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
    }

    stringQuery = stringQuery + "tax=" + tax + "&total=" + grandTotal + "&customer=" + customer + "&name=" + name + "&surname=" + surname + "&quoteid=" + trans_data.id + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + customerEmail + "&type=Invoice&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;

    if (stripe_id != "") {
        $(".linkText").attr("href", stripeGlobalURL + stringQuery);
    } else {
        $('.linkText').attr('href', '#');
    }

    item_transactions = {
      o_url: localStorage.getItem("vs1companyURL"),
      o_name: localStorage.getItem("vs1companyName"),
      o_address: localStorage.getItem("vs1companyaddress1"),
      o_city: localStorage.getItem("vs1companyCity"),
      o_state: localStorage.getItem("companyState") + " " + localStorage.getItem("vs1companyPOBox"),
      o_reg: Template.new_invoice.__helpers.get("companyReg").call(),
      o_abn: Template.new_invoice.__helpers.get("companyabn").call(),
      o_phone:Template.new_invoice.__helpers.get("companyphone").call(),
      title: templateObject.data.printName,
      value:trans_data.id,
      date: dtSODate,
      invoicenumber:trans_data.id,
      refnumber: ref,
      pqnumber: po,
      duedate: duedate,
      paylink: "",
      supplier_type: templateObject.data.clientType,
      supplier_name : customer,
      supplier_addr : txabillingAddress,
      fields: {
        "Product Name": ["25", "left"],
        "Description": ["30", "left"],
        "Qty": ["7", "right"],
        "Unit Price": ["15", "right"],
        "Tax": ["7", "right"],
        "Amount": ["15", "right"],
      },
      subtotal :subtotal_total,
      gst : subtotal_tax,
      total : grandTotal,
      paid_amount : total_paid,
      bal_due : balancedue,
      bsb : Template.new_invoice.__helpers.get("vs1companyBankBSB").call(),
      account : Template.new_invoice.__helpers
          .get("vs1companyBankAccountNo")
          .call(),
      swift : Template.new_invoice.__helpers
          .get("vs1companyBankSwiftCode")
          .call(),
      data: array_data,
      customfield1:"NA",
      customfield2:"NA",
      customfield3:"NA",
      customfieldlabel1:"NA",
      customfieldlabel2:"NA",
      customfieldlabel3:"NA",
      applied : "",
      showFX:"",
      comment:comment,
    };
    if(number !== 1) {
      item_transactions.customfield1 = customfield1
      item_transactions.customfield2 = customfield2
      item_transactions.customfield3 = customfield3
      item_transactions.customfieldlabel1 = customfieldlabel1
      item_transactions.customfieldlabel2 = customfieldlabel2
      item_transactions.customfieldlabel3 = customfieldlabel3
      if(number !== 2) {
        item_transactions.showFX = fx
      }
    }

    item_transactions.taxItems = taxItems;

    object_invoce.push(item_transactions);

    $("#templatePreviewModal .field_payment").show();
    $("#templatePreviewModal .field_amount").show();

    if (bprint == false) {
        
        $("#"+templateObject.data.printWrapPrefix).css("width", "90%");
        $("#"+templateObject.data.printWrapPrefix+"2").css("width", "90%");
        $("#"+templateObject.data.printWrapPrefix+"3").css("width", "90%");
    } else {
        $("#"+templateObject.data.printWrapPrefix).css("width", "210mm");
        $("#"+templateObject.data.printWrapPrefix+"2").css("width", "210mm");
        $("#"+templateObject.data.printWrapPrefix+"3").css("width", "210mm");
    }
    if (number == 1) {
        updateTemplate1(object_invoce, bprint);
    } else if (number == 2) {
        updateTemplate2(object_invoce, bprint);
    } else {
        updateTemplate3(object_invoce, bprint);
    }

    saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);


  }

  templateObject.showDeliveryDocket1 = function(template_title, number, bprint) {
    var array_data = [];
    let lineItems = [];
    let taxItems = {};
    let object_invoce = [];
    let item_transactions = "";

    let transaction_data = templateObject.transactionrecord.get();
    let stripe_id = templateObject.accountID.get() || "";
    let stripe_fee_method = templateObject.stripe_fee_method.get();
    var erpGet = erpDb();

    var customfield1 = $("#edtSaleCustField_1").val() || "  ";
    var customfield2 = $("#edtSaleCustField_2").val() || "  ";
    var customfield3 = $("#edtSaleCustField_3").val() || "  ";

    var customfieldlabel1 = $(".lblCustomField1").first().text() || "Custom Field 1";
    var customfieldlabel2 =
      $(".lblCustomField2").first().text() || "Custom Field 2";
    var customfieldlabel3 =
      $(".lblCustomField3").first().text() || "Custom Field 3";
    let balancedue = $("#totalBalanceDue").html() || 0;
    let tax = $("#subtotal_tax").html() || 0;
    let customer = $("#edtCustomerName").val();
    let name = $("#firstname").val();
    let surname = $("#lastname").val();
    let dept = $("#sltDept").val();
    var comment = $("#txaComment").val();
    var ref = $("#edtRef").val() || "-";
    var txabillingAddress = $("#txabillingAddress").val() || "";
    var dtSODate = $("#dtSODate").val();
    var grandTotal = $("#grandTotal").text() || Currency + 0;
    var duedate = $("#dtDueDate").val();
    var po = $("#ponumber").val() || ".";

    $("#"+templateObject.data.gridTableId+" > tbody > tr").each(function () {
      const tdproduct = $(this).find(".lineProductName").val();
      const tddescription = $(this).find('.lineProductDesc').text();
      const tdQty = $(this).find('.lineQty').val();
      const tdunitprice = $(this).find('.colUnitPriceExChange').val();
      const tdtaxrate = $(this).find(".lineTaxRate").val();
      const taxamount = $(this).find('.colTaxAmount').val();
      const tdlineamt = $(this).find(".colAmountInc").text();

      array_data.push([tdproduct, tddescription, tdQty]);

      let lineItemObj = {
        description: tddescription || "",
        quantity: tdQty || 0,
        unitPrice: tdunitprice.toLocaleString(undefined, {minimumFractionDigits: 2,}) || 0,
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
      stringQuery = stringQuery + "product" + l + "=" + lineItems[l].description + "&price" + l + "=" + lineItems[l].unitPrice + "&qty" + l + "=" + lineItems[l].quantity + "&";
    }
    stringQuery = stringQuery + "tax=" + tax + "&total=" + grandTotal + "&customer=" + customer + "&name=" +
      name + "&surname=" + surname + "&quoteid=" + transaction_data.id + "&transid=" + stripe_id +
      "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User +
      "&customeremail=" + customerEmail + "&type=Invoice&url=" + window.location.href + "&server=" +
      erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword +
      "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept + "&currency=" + currencyname;
    if (stripe_id != "") {
      $(".linkText").attr("href", stripeGlobalURL + stringQuery);
    } else {
      $(".linkText").attr("href", "#");
    }

    item_transactions = {
      o_url: localStorage.getItem("vs1companyURL"),
      o_name: localStorage.getItem("vs1companyName"),
      o_address: localStorage.getItem("vs1companyaddress1"),
      o_city: localStorage.getItem("vs1companyCity"),
      o_state: localStorage.getItem("companyState") + " " + localStorage.getItem("vs1companyPOBox"),
      o_reg: Template.new_invoice.__helpers.get("companyReg").call(),
      o_abn: Template.new_invoice.__helpers.get("companyabn").call(),
      o_phone: Template.new_invoice.__helpers.get("companyphone").call(),
      title: "Delivery Docket",
      value: transaction_data.id,
      date: dtSODate,
      invoicenumber: transaction_data.id,
      refnumber: ref,
      pqnumber: po,
      duedate: duedate,
      paylink: "Pay Now",
      supplier_type: "Customer",
      supplier_name: customer,
      supplier_addr: txabillingAddress,
      fields: {
        "Product Name": ["40", "left"],
        "Description": ["40", "left"],
        "Qty": ["20", "right"]
      },
      subtotal: "",
      gst: "",
      total: "",
      paid_amount: "",
      bal_due: "",
      bsb: "",
      account: "",
      swift: "",
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
    if (number !== 1) {
      item_transactions.customfield1 = customfield1
      item_transactions.customfield2 = customfield2
      item_transactions.customfield3 = customfield3
      item_transactions.customfieldlabel1 = customfieldlabel1
      item_transactions.customfieldlabel2 = customfieldlabel2
      item_transactions.customfieldlabel3 = customfieldlabel3
    } 

    if (stripe_id == "") {
      item_transactions.paylink = "";
    }

    object_invoce.push(item_transactions);

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
  }

  templateObject.generateInvoiceData = async function (template_title,number) {
    let object_invoce = [];
    switch (template_title) {
        case templateObject.data.printName:
            templateObject.showTemplate1(template_title, number, false);
            break;
        case templateObject.data.deliveryDocketName:
            templateObject.showDeliveryDocket1(template_title, number, false)
            break;
    }
    await applyDisplaySettings(template_title, number);

    let printSettings = await getPrintSettings(template_title, number);
    for (key in printSettings) {
      $('.' + key).css('display', printSettings[key][2] ? 'revert' : 'none');
    }

  };

  templateObject.getAllTaxCodes = function () {
    const splashArrayTaxRateList = [];
    const taxCodesList = [];
    getVS1Data("TTaxcodeVS1")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          salesService.getTaxCodesDetailVS1().then(function (data) {
            const taxCodes = data.ttaxcodevs1;
            templateObject.taxcodes.set(taxCodes);
            for (let i = 0; i < data.ttaxcodevs1.length; i++) {
              let taxRate = (data.ttaxcodevs1[i].fields.Rate * 100).toFixed(2);
              let dataList = [
                data.ttaxcodevs1[i].fields.ID || "",
                data.ttaxcodevs1[i].fields.CodeName || "",
                data.ttaxcodevs1[i].fields.Description || "-",
                taxRate || 0,
              ];

              let taxcoderecordObj = {
                codename: data.ttaxcodevs1[i].fields.CodeName || " ",
                coderate: taxRate || " ",
              };
              taxCodesList.push(taxcoderecordObj);
              splashArrayTaxRateList.push(dataList);
            }
            templateObject.taxraterecords.set(taxCodesList);
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.ttaxcodevs1;
          const taxCodes = data.ttaxcodevs1;
          templateObject.taxcodes.set(taxCodes);
          for (let i = 0; i < useData.length; i++) {
            let taxRate = (useData[i].fields.Rate * 100).toFixed(2);
            var dataList = [
              useData[i].fields.ID || "",
              useData[i].fields.CodeName || "",
              useData[i].fields.Description || "-",
              taxRate || 0,
            ];

            let taxcoderecordObj = {
              codename: useData[i].fields.CodeName || " ",
              coderate: taxRate || " ",
            };
            taxCodesList.push(taxcoderecordObj);
            splashArrayTaxRateList.push(dataList);
          }
          templateObject.taxraterecords.set(taxCodesList);
        }
      })
      .catch(function () {
        salesService.getTaxCodesDetailVS1().then(function (data) {
          taxCodes = data.ttaxcodevs1;
          templateObject.taxcodes.set(taxCodes);
          for (let i = 0; i < data.ttaxcodevs1.length; i++) {
            let taxRate = (data.ttaxcodevs1[i].fields.Rate * 100).toFixed(2);
            var dataList = [
              data.ttaxcodevs1[i].fields.ID || "",
              data.ttaxcodevs1[i].fields.CodeName || "",
              data.ttaxcodevs1[i].fields.Description || "-",
              taxRate || 0,
            ];
            splashArrayTaxRateList.push(dataList);
          }
          templateObject.taxraterecords.set(taxCodesList);
        });
      });
  };

  templateObject.getAllTaxCodes();

  templateObject.getSubTaxCodes = function () {
    let subTaxTableList = [];
    getVS1Data("TSubTaxVS1")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          taxRateService.getSubTaxCode().then(function (data) {
            for (let i = 0; i < data.tsubtaxcode.length; i++) {
              var dataList = {
                id: data.tsubtaxcode[i].Id || "",
                codename: data.tsubtaxcode[i].Code || "-",
                description: data.tsubtaxcode[i].Description || "-",
                category: data.tsubtaxcode[i].Category || "-",
              };
              subTaxTableList.push(dataList);
            }
            templateObject.subtaxcodes.set(subTaxTableList);
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.tsubtaxcode;
          for (let i = 0; i < useData.length; i++) {
            var dataList = {
              id: useData[i].Id || "",
              codename: useData[i].Code || "-",
              description: useData[i].Description || "-",
              category: useData[i].Category || "-",
            };
            subTaxTableList.push(dataList);
          }
          templateObject.subtaxcodes.set(subTaxTableList);
        }
      })
      .catch(function (err) {
        taxRateService.getSubTaxCode().then(function (data) {
          for (let i = 0; i < data.tsubtaxcode.length; i++) {
            var dataList = {
              id: data.tsubtaxcode[i].Id || "",
              codename: data.tsubtaxcode[i].Code || "-",
              description: data.tsubtaxcode[i].Description || "-",
              category: data.tsubtaxcode[i].Category || "-",
            };
            subTaxTableList.push(dataList);
          }
          templateObject.subtaxcodes.set(subTaxTableList);
        });
      });
  };

  templateObject.exportSalesToPdf = async function (template_title, number) {
    if (template_title == templateObject.data.printName) {
      await templateObject.showTemplate1(template_title, number, true);
    } else if (template_title == templateObject.data.deliveryDocketName){
      await templateObject.showDeliveryDocket1(template_title, number, true);
    }

    await applyDisplaySettings(template_title, number);
    
    let transactionData = templateObject.transactionrecord.get();
    // let lowerCasePrintName = templateObject.data.TranascationType.toLowerCase()
    var source;
    if (number == 1) {
      $("#html-2-pdfwrapper").show();
      $("#html-2-pdfwrapper2").hide();
      $("#html-2-pdfwrapper3").hide();
      source = document.getElementById("html-2-pdfwrapper");
    } else if (number == 2) {
      $("#html-2-pdfwrapper").hide();
      $("#html-2-pdfwrapper2").show();
      $("#html-2-pdfwrapper3").hide();
      source = document.getElementById("html-2-pdfwrapper2");
    } else {
      $("#html-2-pdfwrapper").hide();
      $("#html-2-pdfwrapper2").hide();
      $("#html-2-pdfwrapper3").show();
      source = document.getElementById("html-2-pdfwrapper3");
    }

    setTimeout(()=>{let file = templateObject.data.printName +".pdf";
    if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
      if (template_title == templateObject.data.printName) {
        file = template_title + '-' + transactionData.id + '.pdf';
      }
    }
    // const opt = {
    //   margin: 0,
    //   filename: file,
    //   image: {
    //     type: 'jpeg',
    //     quality: 0.98
    //   },
    //   html2canvas: {
    //     scale: 2
    //   },
    //   jsPDF: {
    //     unit: 'in',
    //     format: 'a4',
    //     orientation: 'portrait'
    //   }
    // };

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
    html2pdf().set(opt).from(source).toPdf().output('datauristring').then(data => {
      let attachment = [];
      let base64data = data.split(',')[1];
      let chequeId = FlowRouter.current().queryParams.id ? FlowRouter.current().queryParams.id : ''
      let pdfObject = {
        filename: templateObject.data.printName + '-' + chequeId + '.pdf',
        content: base64data,
        encoding: 'base64'
      };
      attachment.push(pdfObject);
      let values = [];
      let basedOnTypeStorages = Object.keys(localStorage);
      basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
        let employeeId = storage.split('_')[2];
        return storage.includes('BasedOnType_');
      });
      let j = basedOnTypeStorages.length;
      if (j > 0) {
        while (j--) {
          values.push(localStorage.getItem(basedOnTypeStorages[j]));
        }
      }
      if (values.length > 0) {
        values.forEach(value => {
          let reportData = JSON.parse(value);
          let temp = { ...reportData };
          temp.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
          reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
          temp.attachments = attachment;
          if (temp.BasedOnType.includes("P")) {
            if (temp.FormID == 1) {
              let formIds = temp.FormIDs.split(',');
              if (formIds.includes(templateObject.data.transreportindex.toString())) {
                temp.FormID = templateObject.data.transreportindex;
                Meteor.call('sendNormalEmail', temp);
              }
            } else {
              if (temp.FormID == templateObject.data.transreportindex.toString())
                Meteor.call('sendNormalEmail', temp);
            }
          }
        });
      }
    });



    html2pdf().set(opt).from(source).save().then(function (dataObject) {
      if ($('.printID').attr('id') == undefined || $('.printID').attr('id') == "") {
        $('.fullScreenSpin').css("display", "none");
      } else {
        $('#html-2-pdfwrapper_new').css('display', 'none');
        $('#html-2-pdfwrapper').css('display', 'none');
        $("#html-2-pdfwrapper").hide();
        $("#html-2-pdfwrapper2").hide();
        $("#html-2-pdfwrapper3").hide();
        $('.fullScreenSpin').css("display", "none");
      }
    });}, 2000)
    return true;
    // }
  }

  templateObject.sendEmailWithAttachment = async () => {
    let data = await templateObject.data.sendEmail();
    templateObject.addAttachment(data)
  }

  templateObject.generatePdfForMail = async (invoiceId) => {
    let stripe_id = templateObject.accountID.get() || "";
    let file = templateObject.data.printName + "-" + invoiceId + ".pdf";
    let stringQuery = '?';
    return new Promise((resolve, reject) => {
      var source = document.getElementById("html-2-pdfwrapper");
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


  templateObject.addAttachment = async(objDetails) => {
    let attachment = [];
    let invoiceId = objDetails.fields.ID;
    let encodedPdf = await templateObject.generatePdfForMail(invoiceId);
    let base64data = encodedPdf.split(',')[1];
    let pdfObject = {
        filename: templateObject.data.printName + '-' + invoiceId + '.pdf',
        content: base64data,
        encoding: 'base64'
    };
    attachment.push(pdfObject);
    let erpInvoiceId = objDetails.fields.ID;
    let mailFromName = localStorage.getItem('vs1companyName');
    let mailFrom = localStorage.getItem('VS1OrgEmail') || localStorage.getItem('VS1AdminUserName');
    let customerEmailName = $('#edtSupplierName').val();
    let checkEmailData = $('#edtSupplierEmail').val();
    let mailSubject = templateObject.data.printName +' ' + erpInvoiceId + ' from ' + mailFromName + ' for ' + customerEmailName;
    
    var htmlmailBody = templateObject.data.mailHtml(objDetails);
    if (($('.chkEmailCopy').is(':checked')) && ($('.chkEmailRep').is(':checked'))) {
        Meteor.call('sendEmail', {
            from: "" + mailFromName + " <" + mailFrom + ">",
            to: checkEmailData,
            subject: mailSubject,
            text: '',
            html: htmlmailBody,
            attachments: attachment
        }, function(error, result) {
            if (error && error.error === "error") {
                if(isBORedirect == true){
                }else{
                };
            } else {
            }
        });
  
        Meteor.call('sendEmail', {
            from: "" + mailFromName + " <" + mailFrom + ">",
            to: mailFrom,
            subject: mailSubject,
            text: '',
            html: htmlmailBody,
            attachments: attachment
        }, function(error, result) {
            if (error && error.error === "error") {
                if(isBORedirect == true){
                }else{
                };
            } else {
                $('#html-2-pdfwrapper').css('display', 'none');
                swal({
                    title: 'SUCCESS',
                    text: "Email Sent To Supplier: " + checkEmailData + " and User: " + mailFrom + "",
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if(FlowRouter.current().queryParams.trans){
                        }else{
                            if(isBORedirect == true){
                            }else{
                            };
                        };
                    } else if (result.dismiss === 'cancel') {
  
                    }
                });
  
                $('.fullScreenSpin').css('display', 'none');
            }
        });
  
        // templateObject.chkEmailFrequencySetting()
  
    } else if (($('.chkEmailCopy').is(':checked'))) {
        Meteor.call('sendEmail', {
            from: "" + mailFromName + " <" + mailFrom + ">",
            to: checkEmailData,
            subject: mailSubject,
            text: '',
            html: htmlmailBody,
            attachments: attachment
        }, function(error, result) {
            if (error && error.error === "error") {
  
            } else {
                $('#html-2-pdfwrapper').css('display', 'none');
                swal({
                    title: 'SUCCESS',
                    text: "Email Sent To Supplier: " + checkEmailData + " ",
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if(FlowRouter.current().queryParams.trans){
                        }else{
                        };
                    } else if (result.dismiss === 'cancel') {
  
                    }
                });
  
                $('.fullScreenSpin').css('display', 'none');
            }
        });
  
        // templateObject.chkEmailFrequencySetting()
  
    } else if (($('.chkEmailRep').is(':checked'))) {
        Meteor.call('sendEmail', {
            from: "" + mailFromName + " <" + mailFrom + ">",
            to: mailFrom,
            subject: mailSubject,
            text: '',
            html: htmlmailBody,
            attachments: attachment
        }, function(error, result) {
            if (error && error.error === "error") {
            } else {
                $('#html-2-pdfwrapper').css('display', 'none');
                swal({
                    title: 'SUCCESS',
                    text: "Email Sent To User: " + mailFrom + " ",
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if(FlowRouter.current().queryParams.trans){
                        }else{
                        };
                    } else if (result.dismiss === 'cancel') {
  
                    }
                });
  
                $('.fullScreenSpin').css('display', 'none');
            }
        });
  
        // templateObject.chkEmailFrequencySetting()
  
    } else {
  
        // templateObject.chkEmailFrequencySetting()
        
  
        if(FlowRouter.current().queryParams.trans){
        }else{

        };
    };
  }

  // templateObject.chkEmailFrequencySetting = async () => {
  //   let values = [];
  //   let basedOnTypeStorages = Object.keys(localStorage);
  //   basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
  //       let employeeId = storage.split('_')[2];
  //       return storage.includes('BasedOnType_')
  //   });
  //   let i = basedOnTypeStorages.length;
  //   if (i > 0) {
  //       while (i--) {
  //           values.push(localStorage.getItem(basedOnTypeStorages[i]));
  //       }
  //   }
  //   values.forEach(value => {
  //       let reportData = JSON.parse(value);
  //       reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
  //       reportData.attachments = attachment;
  //       if (reportData.BasedOnType.includes("S")) {
  //           if (reportData.FormID == 1) {
  //               let formIds = reportData.FormIDs.split(',');
  //               if (formIds.includes(templateObject.data.transreportindex.toString())) {
  //                   reportData.FormID = templateObject.data.transreportindex;
  //                   Meteor.call('sendNormalEmail', reportData);
  //               }
  //           } else {
  //               if (reportData.FormID == templateObject.data.transreportindex)
  //                   Meteor.call('sendNormalEmail', reportData);
  //           }
  //       }
  //   });

  // }

  // templateObject.hasFollowings = async function() {
  //   var url = FlowRouter.current().path;
  //   var getso_id = url.split('?id=');
  //   var currentInvoice = getso_id[getso_id.length - 1];
  //   // if (getso_id[1]) {
  //   //     currentInvoice = parseInt(currentInvoice);
  //   //     let transData;
  //   //     getVS1Data(templateObject.data.exIndexDBName).then(function(dataObject) {

  //   //     })
  //   //           let that = templateObject.data.service;
  //   //     transData = await templateObject.data.oneExAPIName.apply(that, [currentInvoice])
  //   //     var isRepeated = transData.fields.RepeatedFrom;
  //   //     templateObject.hasFollow.set(isRepeated);
  //   // }

  //   let transData = templateObject.transactionrecord.get();
  //   console.log("has followings", transData)
  // }
  // templateObject.hasFollowings();

  templateObject.getAllCostTypes = function () {
    getVS1Data("TCostTypes").then(function (dataObject) {
        if (dataObject.length == 0) {
            fixedAssetService.getCostTypeList().then(function (data) {
                templateObject.setAssetCostList(data);
            }).catch(function (err) {
            $(".fullScreenSpin").css("display", "none");
            });
        } else {
            let data = JSON.parse(dataObject[0].data);
            templateObject.setAssetCostList(data);
        }
    }).catch(function (err) {
        fixedAssetService.getCostTypeList().then(function (data) {
            templateObject.setAssetCostList(data);
        }).catch(function (err) {
            $(".fullScreenSpin").css("display", "none");
        });
    });
}
templateObject.setAssetCostList = function (data) {
    addVS1Data('TCostTypes', JSON.stringify(data));
    let type_record = new Array();
    for (let i = 0; i < data.tcosttypes.length; i ++) {
        const costType = data.tcosttypes[i];
        const typeField = {
            id: costType.fields.ID,
            typeName: costType.fields.TypeName
        };
        type_record.push(typeField);
        $('#costTypeLine').editableSelect('add', function(){
            $(this).val(typeField.id);
            $(this).text(typeField.typeName);
        });
    }
    templateObject.assetCostTypes.set(type_record);
};
templateObject.getAllCostTypes();

  templateObject.print = async (_template = '') => {
    LoadingOverlay.show();
    setTimeout(async function () {
      var printTemplate = [];
      // $("#html-2-pdfwrapper1").css("display", "block");
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
      var ponumber = $("#ponumber").val() || ".";
      $(".po").text(ponumber);

      var invoice_type = FlowRouter.current().queryParams.type;
      if (invoice_type == "bo") {
        if (
          $("#print_"+templateObject.data.printName+"_back_orders").is(":checked") ||
          $("#print_"+templateObject.data.printName+"_back_orders_second").is(":checked")
        ) {
          printTemplate.push(templateObject.data.printName + " Back Orders");
        }
      } else {
        if (
          $("#"+templateObject.data.printTemplateId).is(":checked") ||
          $("#"+templateObject.data.printTemplateId+"_second").is(":checked")
        ) {
          printTemplate.push(templateObject.data.printName);
        }
        if (
          $("#print_delivery_docket").is(":checked") ||
          $("#print_delivery_docket_second").is(":checked")
        ) {
          printTemplate.push("Delivery Docket");
        }
      }

      if(printTemplate.length === 0) {
        printTemplate.push(templateObject.data.printName);
      }

      var template_number = 1;
      if (printTemplate.length > 0) {
        for (var i = 0; i < printTemplate.length; i++) {
          if (printTemplate[i] == templateObject.data.printName) {
            template_number = $("input[name=Invoices]:checked").val();
          } else if (printTemplate[i] == "Delivery Docket") {
            template_number = $(
              'input[name="Delivery Docket"]:checked'
            ).val();
          } else if (printTemplate[i] == templateObject.data.printName + " Back Orders") {
            template_number = $(
              'input[name='+templateObject.data.printName+'" Back Orders"]:checked'
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

        if(templateObject.data.clientType == 'Customer') {
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
        } else if(templateObject.data.clientType == 'Supplier') {
          if ($("#edtCustomerEmail").val() != "") {
            await templateObject.sendEmail();
          } else {
            swal({
              title: "Supplier Email Required",
              text: "Please enter supplier email",
              type: "error",
              showCancelButton: false,
              confirmButtonText: "OK",
            }).then((result) => {
              if (result.value) { } else if (result.dismiss === "cancel") { }
            });
          }
        }
      }
      $("#printModal").modal('hide');
      LoadingOverlay.hide();

    }, delayTimeAfterSound);
  }

  $(document).on("click", ".templateItem .btnPreviewTemplate", function(e) {
    title = $(this).parent().attr("data-id");
    let number =  $(this).parent().attr("data-template-id");//e.getAttribute("data-template-id");
    templateObject.generateInvoiceData(title,number);
  });

  $(document).on('mouseover', '#'+templateObject.data.tablename +' >tbody >tr', function(e) {
    templateObject.selectedLineId.set('');
    let targetRowId = $(e.target).closest('tr').attr('id');
    templateObject.selectedLineId.set(targetRowId);
  });

  templateObject.copyTransaction = async function()  {
      playSaveAudio();

      let startDate = '';
      let finishDate = '';
      let convertedStartDate = '';
      let convertedFinishDate = '';
      let monthDate = '';
      let ofMonths = '';
      let isFirst = true;
      let everyWeeks = '';
      let selectDays = '';
      let dailyRadioOption = '';
      let everyDays = '';
  
      let basedOnTypeAttr = 'F,';
      var erpGet = erpDb();
      let sDate2 = '';
      let fDate2 = '';
      setTimeout(async function () {
        let radioFrequency = $('input[type=radio][name=frequencyRadio]:checked').attr('id');
        frequencyVal = radioFrequency + '@';
        const values = basedOnTypeAttr.split(',');
        if (values.includes('F')) {
          if (radioFrequency == "frequencyMonthly") {
            isFirst = true;
            monthDate = $("#sltDay").val().replace('day', '');
            $(".ofMonthList input[type=checkbox]:checked").each(function () {
              ofMonths += isFirst ? $(this).val() : ',' + $(this).val();
              isFirst = false;
            });
            startDate = $('#edtMonthlyStartDate').val();
            finishDate = $('#edtMonthlyFinishDate').val();
            frequencyVal += monthDate + '@' + ofMonths;
          } else if (radioFrequency == "frequencyWeekly") {
            isFirst = true;
            everyWeeks = $("#weeklyEveryXWeeks").val();
            let sDay = -1;
            $(".selectDays input[type=checkbox]:checked").each(function () {
              sDay = templateObject.getDayNumber($(this).val());
              selectDays += isFirst ? sDay : ',' + sDay;
              isFirst = false;
            });
            startDate = $('#edtWeeklyStartDate').val();
            finishDate = $('#edtWeeklyFinishDate').val();
            frequencyVal += everyWeeks + '@' + selectDays;
          } else if (radioFrequency == "frequencyDaily") {
            dailyRadioOption = $('#dailySettings input[type=radio]:checked').attr('id');
            everyDays = $("#dailyEveryXDays").val();
            startDate = $('#edtDailyStartDate').val();
            finishDate = $('#edtDailyFinishDate').val();
            frequencyVal += dailyRadioOption + '@' + everyDays;
          } else if (radioFrequency == "frequencyOnetimeonly") {
            startDate = $('#edtOneTimeOnlyDate').val();
            finishDate = $('#edtOneTimeOnlyDate').val();
            $('#edtOneTimeOnlyTimeError').css('display', 'none');
            $('#edtOneTimeOnlyDateError').css('display', 'none');
            frequencyVal = radioFrequency;
          }
        }
        $('#copyFrequencyModal').modal('toggle');
        convertedStartDate = startDate ? startDate.split('/')[2] + '-' + startDate.split('/')[1] + '-' + startDate.split('/')[0] : '';
        convertedFinishDate = finishDate ? finishDate.split('/')[2] + '-' + finishDate.split('/')[1] + '-' + finishDate.split('/')[0] : '';
        sDate = convertedStartDate ? moment(convertedStartDate + ' ' + copyStartTime).format("YYYY-MM-DD HH:mm") : moment().format("YYYY-MM-DD HH:mm");
        fDate = convertedFinishDate ? moment(convertedFinishDate + ' ' + copyStartTime).format("YYYY-MM-DD HH:mm") : moment().format("YYYY-MM-DD HH:mm");
        sDate2 = convertedStartDate ? moment(convertedStartDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        fDate2 = convertedFinishDate ? moment(convertedFinishDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        $(".fullScreenSpin").css("display", "inline-block");
        var url = FlowRouter.current().path;

        function postVS1Repeat (dayObj) {
          var myString = '"JsonIn"' + ":" + JSON.stringify(dayObj);
          var oPost = new XMLHttpRequest();
          oPost.open(
            "POST",
            URLRequest +
            erpGet.ERPIPAddress +
            ":" +
            erpGet.ERPPort +
            "/" +
            'erpapi/VS1_Cloud_Task/Method?Name="VS1_RepeatTrans"',
            true
          );
          oPost.setRequestHeader("database", erpGet.ERPDatabase);
          oPost.setRequestHeader("username", erpGet.ERPUsername);
          oPost.setRequestHeader("password", erpGet.ERPPassword);
          oPost.setRequestHeader("Accept", "application/json");
          oPost.setRequestHeader("Accept", "application/html");
          oPost.setRequestHeader("Content-type", "application/json");
          oPost.send(myString);

          oPost.onreadystatechange = function () {
            if (oPost.readyState == 4 && oPost.status == 200) {
              var myArrResponse = JSON.parse(oPost.responseText);
            } else if (oPost.readyState == 4 && oPost.status == 403) {

            } else if (oPost.readyState == 4 && oPost.status == 406) {

            } else if (oPost.readyState == "") {

            }
            $(".fullScreenSpin").css("display", "none");
          };
        }
        if (
          url.indexOf("?id=") > 0 ||
          url.indexOf("?copyquid=") > 0 ||
          url.indexOf("?copyinvid=")
        ) {
          var getso_id = url.split("?id=");
          var currentInvoice = getso_id[getso_id.length - 1];
          if (getso_id[1]) {
            currentInvoice = parseInt(currentInvoice);
            let period = ""; // 0
            let days = [];
            let i = 0;
            let frequency2 = 0;
            let weekdayObj = {
              saturday: 0,
              sunday: 0,
              monday: 0,
              tuesday: 0,
              wednesday: 0,
              thursday: 0,
              friday: 0,
            };
            let repeatMonths = [];
            let repeatDates = [];
            if (radioFrequency == "frequencyDaily" || radioFrequency == "frequencyOnetimeonly") {
              period = "Daily"; // 0
              if (radioFrequency == "frequencyDaily") {
                frequency2 = parseInt(everyDays);
                if (dailyRadioOption == "dailyEveryDay") {
                  for (i = 0; i < 7; i++) {
                    days.push(i);
                  }
                }
                if (dailyRadioOption == "dailyWeekdays") {
                  for (i = 1; i < 6; i++) {
                    days.push(i);
                  }
                }
                if (dailyRadioOption == "dailyEvery") {
  
                }
              } else {
                repeatDates.push({
                  "Dates": sDate2
                })
                frequency2 = 1;
              }
            }
            if (radioFrequency == "frequencyWeekly") {
              period = "Weekly"; // 1
              frequency2 = parseInt(everyWeeks);
              let arrSelectDays = selectDays.split(",");
              for (i = 0; i < arrSelectDays.length; i++) {
                days.push(arrSelectDays[i]);
                if (parseInt(arrSelectDays[i]) == 0)
                  weekdayObj.sunday = 1;
                if (parseInt(arrSelectDays[i]) == 1)
                  weekdayObj.monday = 1;
                if (parseInt(arrSelectDays[i]) == 2)
                  weekdayObj.tuesday = 1;
                if (parseInt(arrSelectDays[i]) == 3)
                  weekdayObj.wednesday = 1;
                if (parseInt(arrSelectDays[i]) == 4)
                  weekdayObj.thursday = 1;
                if (parseInt(arrSelectDays[i]) == 5)
                  weekdayObj.friday = 1;
                if (parseInt(arrSelectDays[i]) == 6)
                  weekdayObj.saturday = 1;
              }
            }
            if (radioFrequency == "frequencyMonthly") {
              period = "Monthly"; // 0
              repeatMonths = convertStrMonthToNum(ofMonths);
              repeatDates = getRepeatDates(sDate2, fDate2, repeatMonths, monthDate);
              frequency2 = parseInt(monthDate);
            }

            let objectTemp = {
              Name: "VS1_RepeatTrans",
              Params: {
                CloudUserName: erpGet.ERPUsername,
                CloudPassword: erpGet.ERPPassword,
                TransID: currentInvoice,
                TransType: templateObject.data.TranascationType,
                Repeat_Frequency: frequency2,
                Repeat_Period: period,
                Repeat_BaseDate: sDate2,
                Repeat_finalDateDate: fDate2,
                Repeat_Saturday: weekdayObj.saturday,
                Repeat_Sunday: weekdayObj.sunday,
                Repeat_Monday: weekdayObj.monday,
                Repeat_Tuesday: weekdayObj.tuesday,
                Repeat_Wednesday: weekdayObj.wednesday,
                Repeat_Thursday: weekdayObj.thursday,
                Repeat_Friday: weekdayObj.friday,
                Repeat_Holiday: 0,
                Repeat_Weekday: 0,
                Repeat_MonthOffset: 0,
              },
            };
            if (days.length > 0) {
              for (let x = 0; x < days.length; x++) {
                let dayObj = cloneDeep(objectTemp);
                dayObj.fields.Repeat_Weekday = parseInt(days[x].toString());
                postVS1Repeat(dayObj) 
              }
            } else {
              let dayObj = {};
              if (radioFrequency == "frequencyOnetimeonly" || radioFrequency == "frequencyMonthly") {
                dayObj = cloneDeep(objectTemp);
                dayObj.Repeat_Dates =  repeatDates;
              } else {
                dayObj = cloneDeep(objectTemp);
              }
              postVS1Repeat(dayObj)
            }
          }
        } else {
          window.open("/invoicecard", "_self");
        }
        FlowRouter.go("/invoicelist?success=true");
        $('.modal-backdrop').css('display', 'none');
      }, delayTimeAfterSound);
  
  }

  // $(document).on('mouseleave', '#'+templateObject.data.tablename +' tbody tr', function(e) {
  //   templateObject.selectedLineId.set('')
  // })

  templateObject.updateTransactionLine = function(lid) {
    LoadingOverlay.show()
    let tablename = templateObject.data.gridTableId;
    if(templateObject.data.custid) {
      tablename = tablename + "_" + templateObject.data.custid
    }
    FxGlobalFunctions.convertToForeignEveryFieldsInTableId("#"+tablename, new UtilityService());
    setTimeout(async ()=>{
      let rate = $("#exchange_rate").val();
      let cloneRecord  = cloneDeep(templateObject.transactionrecord.get());
      let lineItems = cloneRecord.LineItems;
      // let lid = $(e.target).closest('tr').attr('id')
      let lineIndex = lineItems.findIndex(line =>{
        return line.lineID == lid
      })

      lineItems[lineIndex].item = $("#"+tablename+" tr#"+lid).find('.colProductName .lineProductName').val();
      lineItems[lineIndex].description = $("#"+tablename+" tr#"+lid).find('.lineProductDesc').text();

      lineItems[lineIndex].lineCost = $("#"+tablename+" tr#"+lid).find('.colCostPrice .colCostPrice').val();
  
      lineItems[lineIndex].unitPrice = $("#"+tablename+" tr#"+lid).find('.colUnitPriceEx .colUnitPriceEx').val();
  
      lineItems[lineIndex].TotalAmt = $("#"+tablename+" tr#"+lid).find('.colAmountEx.lineAmount').text();
  
  
      cloneRecord.LineItems = lineItems;
      $("#"+tablename+" tr#"+lid).find('.lineProductDesc').text('');
      $("#"+tablename+" tr#"+lid).find('.colAmountEx.lineAmount').text('');
      templateObject.transactionrecord.set(cloneRecord);

      LoadingOverlay.hide()
    }, 500)
  }


  templateObject.updateLine = function (isEx = true) {
    var $tblrows = $("#"+templateObject.data.gridTableId+" tbody tr")
    var $printrows = $("."+templateObject.data.printTableId+" tbody tr");
    let taxcodeList = templateObject.taxraterecords.get();
    let subDiscountTotal = 0;
    let subGrandTotalNet = 0
    let taxGrandTotal = 0;
    let taxGrandTotalNet = 0;
    let subGrandTotal = 0;
    let taxGrandTotalPrint = 0;
    $tblrows.each(function (index) {
      var $tblrow = $(this);
      let tdproduct = $tblrow.find(".lineProductName").val() || "";
      let tdaccount = $tblrow.find(".lineAccountName")?.val() || "";
      if (tdproduct != "" || tdaccount != "") {
        var qty = $tblrow.find(".lineQty").val() || "0";
        var price = $tblrow.find(".colUnitPriceExChange").val() || "0";
        if(isEx == false) {
          price = $tblrow.find('.colUnitPriceIncChange').val();
        }
        var taxRate = $tblrow.find(".lineTaxCode").val();
        var amount = $tblrow.find('.colAmountEx').text() || "0";

        var taxrateamount = 0;
        if (taxcodeList) {
          for (var i = 0; i < taxcodeList.length; i++) {
            if (taxcodeList[i].codename == taxRate) {
              taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
            }
          }
        }

        let taxRateAmountCalc = (parseFloat(taxrateamount) + 100) / 100;
        var subTotal = templateObject.data.transCategory == 'Accounting'?parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0 
                :parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
        var taxTotal = templateObject.data.transCategory == 'Accounting'?parseFloat(amount.replace(/[^0-9.-]+/g, "")) *
                   parseFloat(taxrateamount):
                   parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);

        var subTotalExQty = templateObject.data.transCategory == 'Accounting'?parseFloat(amount.replace(/[^0-9.-]+/g, "")) / taxRateAmountCalc || 0:parseFloat(price.replace(/[^0-9.-]+/g, "")) / taxRateAmountCalc || 0;
        var taxTotalExQty = templateObject.data.transCategory == 'Accounting'?parseFloat(amount.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotalExQty) || 0: parseFloat(price.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotalExQty) || 0;

        var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").val()) || 0; // New Discount
        let lineTotalAmount = subTotal + taxTotal;
        let lineDiscountTotal = lineDiscountPerc / 100;
        var discountTotal = lineTotalAmount * lineDiscountTotal;
        var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
        var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
        var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
        var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
        if (!isNaN(discountTotal)) {
          subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;
          if(document.getElementById("subtotal_discount") != null) {
            document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
          }
        }
        $tblrow.find(".lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

        let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
        let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, "")) || 0;
        let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc || 0;

        if(isEx == false) {
          lineUnitPriceIncVal = Number(price.replace(/[^0-9.-]+/g, ""));
          lineUnitPriceExVal = lineUnitPriceIncVal - taxTotalExQty || 0;
        }
        $tblrow.find(".colUnitPriceExChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
        $tblrow.find(".colUnitPriceIncChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

        if (!isNaN(subTotal)) {
          $tblrow.find(".colAmountEx").text(utilityService.modifynegativeCurrencyFormat(subTotal));
          $tblrow.find(".colAmountInc").text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
          subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
          subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
          document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
        }

        if (!isNaN(taxTotal)) {
          taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
          taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
          document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
        }

        if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
          let GrandTotal = parseFloat(subGrandTotal) + parseFloat(taxGrandTotal);
          let GrandTotalNet = parseFloat(subGrandTotalNet) + parseFloat(taxGrandTotalNet);
          document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
          document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
          document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
          document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
        }
      } 
    });

    if(isEx == false) {
      $("#" + selectLineID + " #lineUnitPrice").text(
        $("#" + selectLineID + " .colUnitPriceExChange").val()
      );  
    }

    $printrows.each(function (index) {
      var $printrows = $(this);
      var qty = $printrows.find("#lineQty").text() || 0;
      var amount = $printrows.find("#lineAmount").text() || "0";
      var price = $printrows.find("#lineUnitPrice").text() || "0";
      var taxrateamount = 0;
      var taxcode = $printrows.find("#lineTaxCode").text();
      if (taxcodeList) {
        for (var i = 0; i < taxcodeList.length; i++) {
          if (taxcodeList[i].codename == taxcode) {
            taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
          }
        }
      }
      var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
      var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
      if(templateObject.data.transCategory == 'Accounting') {
        subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
        taxTotal =  parseFloat(amount.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
      }
      $printrows.find("#lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotal));
      if (!isNaN(subTotal)) {
        $printrows.find("#lineAmt").text(utilityService.modifynegativeCurrencyFormat(subTotal));
        subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
        document.getElementById("subtotal_totalPrint").innerHTML = $("#subtotal_total").text();
      }

      if (!isNaN(taxTotal)) {
        taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
        document.getElementById("totalTax_totalPrint").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
      }
      if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
        document.getElementById("grandTotalPrint").innerHTML = $("#grandTotal").text();
        document.getElementById("totalBalanceDuePrint").innerHTML = $("#totalBalanceDue").text();
      }
    });

  }
 

  $('#edtFrequencyDetail').css('display', 'none');
  

  $("#serialNumberModal .btnSelect").removeClass("d-none");
  $("#serialNumberModal .btnAutoFill").addClass("d-none");
  $("#choosetemplate").attr("checked", true);
  

  let url = FlowRouter.current().path;
  if (url.indexOf("?id=") > 0) {
    let getso_id = url.split("?id=");
    getso_id = getso_id[1].split("&");
    currentInvoice = parseInt(getso_id[0]);
    $(".printID").attr("id", currentInvoice);
    if (currentInvoice && currentInvoice !== NaN) {
      templateObject.getTransactionData(currentInvoice);
    }
  } else {
    let initialRecords = templateObject.data.initialRecords();
    templateObject.transactionrecord.set(initialRecords);
    setCurrentCurrencySymbol(Currency)
    let clientId = ''
    if (FlowRouter.current().queryParams.customerid) {
      clientId = FlowRouter.current().queryParams.customerid;
    } else if (FlowRouter.current().queryParams.supplierid) {
      clientId = FlowRouter.current().queryParams.supplierid;
    }

    if(clientId != '') {
      let clientData = await templateObject.getClientDetailById(clientId);
      templateObject.clientrecord.set(clientData)
      if(clientData != '') {
        if(templateObject.clientType == 'Customer') {
          $("#edtCustomerEmail").val(clientData.customeremail);
          $("#edtCustomerEmail").attr("customerid", clientData.customerid);
          $("#edtCustomerName").attr("custid", clientData.customerid);
          $("#edtCustomerEmail").attr("customerfirstname", clientData.firstname);
          $("#edtCustomerEmail").attr("customerlastname",clientData.lastname);
          $("#customerType").text(clientData.clienttypename || "Default");
          $("#customerDiscount").text(clientData.discount + "%" || 0 + "%");
          $("#edtCustomerUseType").val(clientData.clienttypename || "Default");
          $("#edtCustomerUseDiscount").val(clientData.discount || 0);
          let postalAddress = clientData.customername + 
            "\n" +
            clientData.street +
            "\n" +
            clientData.street2 +
            " " +
            clientData.statecode +
            "\n" +
            clientData.country;
          $("#txabillingAddress").val(postalAddress);
          $("#pdfCustomerAddress").html(postalAddress);
          $(".pdfCustomerAddress").text(postalAddress);
          $("#txaShipingInfo").val(postalAddress);
          $("#sltTerms_fromtransactionheader").val(clientData.termsName || "");
        } else if (templateObject.data.clientType == 'Supplier') {
          $('#edtSupplierName').val(clientData.suppliername);
          $('#edtSupplierName').attr("suppid", clientData.supplierid);
          $('#edtSupplierEmail').val(clientData.supplieremail);
          $('#edtSupplierEmail').attr('customerid', clientData.supplierId);
          $('#edtSupplierName').attr('suppid', clientData.supplierId);
  
          let postalAddress = clientData.suppliername + '\n' + clientData.street + '\n' + clientData.street2 + ' ' + clientData.statecode + '\n' + clientData.country;
          $('#txabillingAddress').val(postalAddress);
          $('#pdfSupplierAddress').html(postalAddress);
          $('.pdfSupplierAddress').text(postalAddress);
          $('#txaShipingInfo').val(postalAddress);
          $('#sltTerms_fromtransactionheader').val(clientData.termsName);
        }
      } else {
        // templateObject.initialRecords
      }
    } else {
      // setTimeout(()=>{
      //   if(templateObject.data.clientType == 'Customer') {
      //     $('.edtCustomerName').trigger('click')
      //   } else if(templateObject.data.clientType == 'Supplier') {
      //     $('.edtSupplierName').trigger('click')
      //   } else if (templateObject.data.clientType == 'Account') {
      //     $("#account_fromtransactionheader").trigger('click')
      //   }
      // },200)
    }
  }
  
  $(document).on("click", ".tblInventory tbody tr", async function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(".colProductName").removeClass("boldtablealertsborder");
    let selectLineID = templateObject.selectedLine.get();
    let taxcodeList = await templateObject.taxraterecords.get();
    let customers = await templateObject.clientrecords.get();
    var table = $(e.target).closest('tr');
    var $printrows = $("."+templateObject.data.printTableId+" tbody tr");
    let $tblrows = $("#"+templateObject.data.gridTableId+" tbody tr");
    let taxcode1 = "";

    let selectedCust = $("#edtCustomerName").val();
    if(templateObject.data.clientType == 'Supplier') {
      selectedCust = $('#edtSupplierName').val()
    }
    let getCustDetails = "";
    let lineTaxRate = "";
    let taxRate = "";
    getCustDetails = await templateObject.getClientDetailByName(selectedCust)
    if (getCustDetails !=  '') {
      taxRate = taxcodeList.filter((taxrate) => {
        return taxrate.codename == getCustDetails.taxCode || "";
      });
      if (taxRate.length > 0) {
        if (taxRate[0].codename != "") {
          lineTaxRate = taxRate[0].codename;
        } else {
          lineTaxRate = table.find(".taxrate").text();
        }
      } else {
        lineTaxRate = table.find(".coltaxrate").text();
      }

      taxcode1 = getCustDetails.taxCode || "";
    } else {
      var customerTaxCode =
        $("#edtCustomerName").attr("custtaxcode").replace(/\s/g, "") || "";
      taxRate = taxcodeList.filter((taxrate) => {
        return taxrate.codename == customerTaxCode || "";
      });
      if (taxRate.length > 0) {
        if (taxRate.codename != "") {
          lineTaxRate = taxRate[0].codename;
        } else {
          lineTaxRate = table.find(".taxrate").text();
        }
      } else {
        lineTaxRate = table.find(".coltaxrate").text();
      }

      taxcode1 = customerTaxCode || "";
    }
    if (selectLineID) {
      let lineProductName = table.find(".colproductName").text();
      let lineProductDesc = table.find(".colproductDesc").text();
      let lineUnitPrice = table.find(".colsalePrice").text();
      let lineCostPrice = table.find('.colcostPrice').text();
      let lineExtraSellPrice = null;
      if(table.find(".colExtraSellPrice").text()&& table.find(".colExtraSellPrice").text() != ''&&table.find(".colExtraSellPrice").text() !=null) {
        lineExtraSellPrice = JSON.parse(table.find(".colExtraSellPrice").text()) || null;
      }
      let getCustomerClientTypeName =
        $("#edtCustomerUseType").val() || "Default";
      let getCustomerDiscount =
        parseFloat($("#edtCustomerUseDiscount").val()) || 0;
      let getCustomerProductDiscount = 0;
      let discountAmount = getCustomerDiscount;
      if (lineExtraSellPrice != null) {
        for (let e = 0; e < lineExtraSellPrice.length; e++) {
          if (
            lineExtraSellPrice[e].fields.ClientTypeName ===
            getCustomerClientTypeName
          ) {
            getCustomerProductDiscount =
              parseFloat(lineExtraSellPrice[e].fields.QtyPercent1) || 0;
            if (getCustomerProductDiscount > getCustomerDiscount) {
              discountAmount = getCustomerProductDiscount;
            }
          }
        }
      } else {
        discountAmount = getCustomerDiscount;
      }
      $("#" + selectLineID + " .lineDiscount").val(discountAmount);
      let lineAmount = 0;
      let subGrandTotal = 0;
      let taxGrandTotal = 0;

      let subDiscountTotal = 0; // New Discount
      let taxGrandTotalPrint = 0;
      if (taxcodeList) {
        for (var i = 0; i < taxcodeList.length; i++) {
          if (taxcodeList[i].codename == lineTaxRate) {
            $("#" + selectLineID + " .lineTaxRate").text(
              taxcodeList[i].coderate
            );
          }
        }
      }
      $("#" + selectLineID + " .lineProductName").val(lineProductName);
      $("#" + selectLineID + " .lineProductDesc").text(lineProductDesc);
      $("#" + selectLineID + " .lineOrdered").val(1);
      $("#" + selectLineID + " .lineQty").val(1);
      $("#" + selectLineID + " .lineBackOrder").val(0);
      $("#" + selectLineID + " .lineUnitPrice").val(lineUnitPrice);
      $("#" + selectLineID + " .lineCostPrice").val(lineCostPrice);


      if (
        $(".printID").attr("id") == undefined ||
        $(".printID").attr("id") != undefined ||
        $(".printID").attr("id") != ""
      ) {
        // $("#" + selectLineID + " .lineProductName").val(lineProductName);
        // $("#" + selectLineID + " .lineProductDesc").text(lineProductDesc);
        // $("#" + selectLineID + " #lineOrdered").text(1);
        // $("#" + selectLineID + " #lineQty").text(1);
        // $("#" + selectLineID + " #lineBackOrder").text(0);
        // $("#" + selectLineID + " #lineUnitPrice").text(lineUnitPrice);
        var rowData1 = $("."+templateObject.data.printTableId+" tbody>tr:last").clone(true);
        $(".lineProductName", rowData1).val(lineProductName);
        $(".lineProductDesc", rowData1).text(lineProductDesc);
        $(".lineOrdered", rowData1).text(1);
        $(".lineQty", rowData1).text(1);
        $(".lineBackOrder", rowData1).text(0);
        $(".lineUnitPrice", rowData1).text(lineUnitPrice);
        $("."+templateObject.data.printTableId+" tbody").append(rowData1);
      }

      if (lineTaxRate == "NT") {
        lineTaxRate = "E";
        $("#" + selectLineID + " .lineTaxCode").val(lineTaxRate);
        if (
          $(".printID").attr("id") != undefined ||
          $(".printID").attr("id") != ""
        ) {
          $("#" + selectLineID + " .lineTaxCode").text(lineTaxRate);
        }
      } else {
        $("#" + selectLineID + " .lineTaxCode").val(lineTaxRate);
        if (
          $(".printID").attr("id") != undefined ||
          $(".printID").attr("id") != ""
        ) {
          $("#" + selectLineID + " .lineTaxCode").text(lineTaxRate);
        }
      }

      lineAmount = 1 * Number(lineUnitPrice.replace(/[^0-9.-]+/g, "")) || 0;
      $("#" + selectLineID + " .lineAmt").text(
        utilityService.modifynegativeCurrencyFormat(lineAmount)
      );
      if (
        $(".printID").attr("id") == undefined ||
        $(".printID").attr("id") != undefined ||
        $(".printID").attr("id") != ""
      ) {
        $("#" + selectLineID + " #lineAmt").text(
          utilityService.modifynegativeCurrencyFormat(lineAmount)
        );
      }
      $("#productListModal").modal("hide");
      let subGrandTotalNet = 0;
      let taxGrandTotalNet = 0;
      // $tblrows.each(function (index) {
      //   var $tblrow = $(this);
      //   let tdproduct = $tblrow.find(".lineProductName").val() || "";
      //   if (tdproduct != "") {
      //     var qty = $tblrow.find(".lineQty").val() || 0;
      //     var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
      //     var taxRate = $tblrow.find(".lineTaxCode").val();
      //     var taxrateamount = 0;
      //     if (taxcodeList) {
      //       for (var i = 0; i < taxcodeList.length; i++) {
      //         if (taxcodeList[i].codename == taxRate) {
      //           taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
      //         }
      //       }
      //     }

      //     var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
      //     var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
      //     var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").val()) || 0; // New Discount
      //     let lineTotalAmount = subTotal + taxTotal;

      //     let lineDiscountTotal = lineDiscountPerc / 100;

      //     var discountTotal = lineTotalAmount * lineDiscountTotal;
      //     var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
      //     var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
      //     var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
      //     var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
      //     if (!isNaN(discountTotal)) {
      //       subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

      //       document.getElementById("subtotal_discount").innerHTML =
      //         utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
      //     }
      //     $tblrow.find(".lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

      //     let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
      //     let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, "")) || 0;
      //     let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc || 0;
      //     $tblrow.find(".colUnitPriceExChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
      //     $tblrow.find(".colUnitPriceIncChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

      //     if (!isNaN(subTotal)) {
      //       $tblrow.find(".colAmountEx").text(utilityService.modifynegativeCurrencyFormat(subTotal));
      //       $tblrow.find(".colAmountInc").text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
      //       subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
      //       subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
      //       document.getElementById("subtotal_total").innerHTML =utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
      //     }

      //     if (!isNaN(taxTotal)) {
      //       taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
      //       taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
      //       document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
      //     }

      //     if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
      //       let GrandTotal = parseFloat(subGrandTotal) + parseFloat(taxGrandTotal);
      //       let GrandTotalNet = parseFloat(subGrandTotalNet) + parseFloat(taxGrandTotalNet);
      //       document.getElementById("subtotal_nett").innerHTML =utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
      //       document.getElementById("grandTotal").innerHTML =utilityService.modifynegativeCurrencyFormat(GrandTotal);
      //       document.getElementById("balanceDue").innerHTML =utilityService.modifynegativeCurrencyFormat(GrandTotal);
      //       document.getElementById("totalBalanceDue").innerHTML =utilityService.modifynegativeCurrencyFormat(GrandTotal);
      //     }
      //   }
      // });
      templateObject.updateLine()

      // $printrows.each(function (index) {
      //   var $printrows = $(this);
      //   var qty = $printrows.find("#lineQty").text() || 0;
      //   var price = $printrows.find("#lineUnitPrice").text() || "0";
      //   var taxrateamount = 0;
      //   var taxRate = $printrows.find("#lineTaxCode").text();
      //   if (taxcodeList) {
      //     for (var i = 0; i < taxcodeList.length; i++) {
      //       if (taxcodeList[i].codename == taxRate) {
      //         taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
      //       }
      //     }
      //   }

      //   var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
      //   var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
      //   $printrows.find("#lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotal));
      //   if (!isNaN(subTotal)) {$printrows.find("#lineAmt").text(utilityService.modifynegativeCurrencyFormat(subTotal));
      //     subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
      //     document.getElementById("subtotal_totalPrint").innerHTML = $("#subtotal_total").text();
      //   }

      //   if (!isNaN(taxTotal)) {
      //     taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
      //     document.getElementById("totalTax_totalPrint").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
      //   }
      //   if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
      //     document.getElementById("grandTotalPrint").innerHTML = $("#grandTotal").text();
      //     document.getElementById("totalBalanceDuePrint").innerHTML = $("#totalBalanceDue").text();
      //   }
      //   e.stopImmediatePropagation();
      // });

      templateObject.updateTransactionLine(selectLineID)
    }

    $("#tblInventory_filter .form-control-sm").val("");
    $(".fullScreenSpin").css("display", "none");
  });

  $(window).on("load", function () {
    const win = $(this); //this = window
    if (win.width() <= 1024 && win.width() >= 450) {
      $("#colBalanceDue").addClass("order-12");
    }
    if (win.width() <= 926) {
      $("#totalSection").addClass("offset-md-6");
    }
  });


  $(document).on("click", ".tblTaxRate tbody tr", function (e) {
    let selectLineID = $(e.target).closest('tr').attr('id');
    let taxcodeList = templateObject.taxraterecords.get();
    var table = $(this);
    let utilityService = new UtilityService();
    let $tblrows = $("#"+templateObject.data.gridTableId+" tbody tr");
    var $printrows = $("."+templateObject.data.printTableId+" tbody tr");
    if (selectLineID) {
      let lineTaxCode = table.find(".taxName").text();
      let lineTaxRate = table.find(".taxRate").text();
      let subGrandTotal = 0;
      let taxGrandTotal = 0;
      let subDiscountTotal = 0; // New Discount
      let taxGrandTotalPrint = 0;

      $("#" + selectLineID + " .lineTaxRate").text(lineTaxRate || 0);
      $("#" + selectLineID + " .lineTaxCode").val(lineTaxCode);
      if (
        $(".printID").attr("id") != undefined ||
        $(".printID").attr("id") != ""
      ) {
        $("#" + selectLineID + " #lineTaxCode").text(lineTaxCode);
      }

      $(e.target).closest('.modal.fade').modal("toggle");
      let subGrandTotalNet = 0;
      let taxGrandTotalNet = 0;
      // $tblrows.each(function (index) {
      //   var $tblrow = $(this);
      //   let tdproduct = $tblrow.find(".lineProductName").val() || "";
      //   let tdaccount = $tblrow.find(".lineAccountName")?.val() || "";
      //   if (tdproduct != "" || tdaccount != "") {
      //     var qty = $tblrow.find(".lineQty").val() || "0";
      //     var price = $tblrow.find(".colUnitPriceExChange").val() || "0";
      //     var taxRate = $tblrow.find(".lineTaxCode").val();
      //     var amount = $tblrow.find('.colAmountEx').text() || "0";

      //     var taxrateamount = 0;
      //     if (taxcodeList) {
      //       for (var i = 0; i < taxcodeList.length; i++) {
      //         if (taxcodeList[i].codename == taxRate) {
      //           taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
      //         }
      //       }
      //     }
      //     var subTotal = templateObject.data.transCategory == 'Accounting'?parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0 
      //             :parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
      //     var taxTotal = templateObject.data.transCategory == 'Accounting'?parseFloat(amount.replace(/[^0-9.-]+/g, "")) *
      //                parseFloat(taxrateamount):
      //                parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
      //     var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").val()) || 0; // New Discount
      //     let lineTotalAmount = subTotal + taxTotal;
      //     let lineDiscountTotal = lineDiscountPerc / 100;
      //     var discountTotal = lineTotalAmount * lineDiscountTotal;
      //     var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
      //     var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
      //     var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
      //     var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
      //     if (!isNaN(discountTotal)) {
      //       subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;
      //       if(document.getElementById("subtotal_discount") != null) {
      //         document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
      //       }
      //     }
      //     $tblrow.find(".lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

      //     let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
      //     let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, "")) || 0;
      //     let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc || 0;
      //     $tblrow.find(".colUnitPriceExChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
      //     $tblrow.find(".colUnitPriceIncChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

      //     if (!isNaN(subTotal)) {
      //       $tblrow.find(".colAmountEx").text(utilityService.modifynegativeCurrencyFormat(subTotal));
      //       $tblrow.find(".colAmountInc").text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
      //       subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
      //       subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
      //       document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
      //     }

      //     if (!isNaN(taxTotal)) {
      //       taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
      //       taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
      //       document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
      //     }

      //     if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
      //       let GrandTotal = parseFloat(subGrandTotal) + parseFloat(taxGrandTotal);
      //       let GrandTotalNet = parseFloat(subGrandTotalNet) + parseFloat(taxGrandTotalNet);
      //       document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
      //       document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
      //       document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
      //       document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
      //     }
      //   } 
      // });
      templateObject.updateLine()

      // $printrows.each(function () {
      //   var $printrows = $(this);
      //   var qty = $printrows.find("#lineQty").text() || 0;
      //   var price = $printrows.find("#lineUnitPrice").text() || "0";
      //   var taxrateamount = 0;
      //   var taxRate = $printrows.find("#lineTaxCode").text();
      //   if (taxcodeList) {
      //     for (var i = 0; i < taxcodeList.length; i++) {
      //       if (taxcodeList[i].codename == taxRate) {
      //         taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
      //       }
      //     }
      //   }
      //   var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
      //   var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
      //   $printrows.find("#lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotal));
      //   if (!isNaN(subTotal)) {
      //     $printrows.find("#lineAmt").text(utilityService.modifynegativeCurrencyFormat(subTotal));
      //     subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
      //     document.getElementById("subtotal_totalPrint").innerHTML = $("#subtotal_total").text();
      //   }

      //   if (!isNaN(taxTotal)) {
      //     taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
      //     document.getElementById("totalTax_totalPrint").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
      //   }
      //   if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
      //     document.getElementById("grandTotalPrint").innerHTML = $("#grandTotal").text();
      //     document.getElementById("totalBalanceDuePrint").innerHTML = $("#totalBalanceDue").text();
      //   }
      // });

      // templateObject.updateTransactionLine(selectLineID)
    }
  });

  


  $(document).on('change', '.transheader .sltCurrency', function(event) {
    if(CountryAbbr == $(event.target).val()) {
      templateObject.showFx.set(false)
    } else if($(event.target).val() !== '') {
      templateObject.showFx.set(true)
      templateObject.fxEnabled.set(true)
    }
  });

  $('#costTypeLine').editableSelect()
    .on('select.editable-select', function (e, li) {
    if (li) {
        const lineID = templateObject.currentLineID.get();
        const transactionData = templateObject.transactionrecord.get();
        const lineItems = transactionData.LineItems;
        const index = lineItems.findIndex((item) => item.lineID === lineID);
        transactionData.LineItems[index].costTypeID = parseInt(li.val()) || 0;
        transactionData.LineItems[index].costTypeName = li.html();
        templateObject.transactionrecord.set(transactionData);
    }
    });

  templateObject.removeTransaction = function (removeFollowing = false) {
    playDeleteAudio();
    setTimeout(function () {
      LoadingOverlay.show();
      var url = FlowRouter.current().path;
      var getso_id = url.split("?id=");
      var currentTransaction = getso_id[getso_id.length - 1];
      var objDetails = "";
      if (getso_id[1]) {
        currentTransaction = parseInt(currentTransaction);
        var objDetails = {
          type: templateObject.data.exIndexDBName,
          fields: {
            ID: currentTransaction,
            Deleted: true,
          },
        };
        let service = templateObject.data.service;
        templateObject.data.saveapifunction.apply(service, [objDetails]).then(async function(objDetails){
          if(removeFollowing == true) {
            await templateObject.removeFollowingTransactions(currentTransaction)
          }
          if (FlowRouter.current().queryParams.trans) {
            FlowRouter.go("/customerscard?id=" +FlowRouter.current().queryParams.trans +"&transTab=active");
          } else {
            FlowRouter.go("/"+templateObject.data.listroute+"?success=true");
          }
        }).catch(function (err) {
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
          LoadingOverlay.hide();
        });
      } else {
        if (FlowRouter.current().queryParams.trans) {
          FlowRouter.go("/customerscard?id=" +FlowRouter.current().queryParams.trans +"&transTab=active");
        } else {
          FlowRouter.go("/"+templateObject.data.listroute+"?success=true");
        }
      }
      $("#deleteLineModal").modal("hide");
      $('.modal-backdrop').css('display', 'none');
    }, delayTimeAfterSound);
  }

  templateObject.removeFollowingTransactions = async function (transactionId) {
    return new Promise(async (resolve, reject)=> {
      $('.deleteloadingbar').css('width', ('0%')).attr('aria-valuenow', 0);
      $("#deleteLineModal").modal('hide');
      $("#deleteprogressbar").css('display', 'block');
      $("#deleteprogressbar").modal('show');
      
      var transList = templateObject.followingTransactions.get();
      var j = 0;
      for (var i = 0; i < transList.length; i++) {
        var objDetails = {
          type: templateObject.data.exIndexDBName,
          fields: {
            ID: transList[i],
            Deleted: true,
          },
        };
        j ++;
        document.getElementsByClassName("deleteprogressBarInner")[0].innerHTML = j + '';
        $('.deleteloadingbar').css('width', ((100/transList.length*j)) + '%').attr('aria-valuenow', ((100/transList.length*j)));
        // var result = await salesService.saveInvoiceEx(objDetails);
        // let service = templateObject.data.service;
        templateObject.data.saveapifunction.apply(service, [objDetails]).then(function() {
          if(i == transList.length -1) {
            $("#deletecheckmarkwrapper").removeClass('hide');
            $('.modal-backdrop').css('display', 'none');
            $("#deleteprogressbar").modal('hide');
            resolve();
          }
        })
      }
    })
  }
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

})

Template.transaction_card.helpers({
  isBatchSerialNoTracking: () => {
    return localStorage.getItem("CloudShowSerial") || false;
  },
  transactionrecord: ()=> {
    return Template.instance().transactionrecord.get()
  },
  
  selectedLineId: ()=>{
    return Template.instance().selectedLineId.get();
  },

  currency: ()=> {
    return Template.instance().selectedCurrency.get();
  },

  includeBOnShippedQty:()=> {
    return Template.instance().includeBOnShippedQty.get()
  },

  AttachmentCount:()=> {
    return Template.instance().attachmentCount.get()
  },

  showFx:()=> {
    return Template.instance().showFx.get();
  },

  fxEnabled: () => {
    return Template.instance().fxEnabled.get();
  },

})

Template.transaction_card.events({
  'change #toggleShowFx': function(event) {
    let templateObject = Template.instance();
    templateObject.fxEnabled.set($(event.target).is(':checked'))
  },

  'change #toggleShowDelivery': function(event) {
    let templateObject = Template.instance();
    let record = cloneDeep(templateObject.transactionrecord.get());
    record.showDelivery = $(event.target).is(':checked')
    templateObject.transactionrecord.set(record)
  },
  "click .new_attachment_btn": function (event) {
    $("#attachment-upload_fromtransactionfooter").trigger("click");
  },

  'change #attachment-upload_fromtransactionfooter': function(e) {
    let templateObj = Template.instance();
    let saveToTAttachment = false;
    let lineIDForAttachment = false;
    let uploadedFilesArray = templateObj.uploadedFiles.get();

    let myFiles = $('#attachment-upload_fromtransactionfooter')[0].files;
    let uploadData = utilityService.attachmentUpload(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment, 'fromtransactionfooter');
    templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
    templateObj.attachmentCount.set(uploadData.totalAttachments);
  },

  "click .img_new_attachment_btn": function (event) {
    $("#img-attachment-upload_fromtransactionfooter").trigger("click");
  },
  "change #img-attachment-upload_fromtransactionfooter": function (e) {
    let templateObj = Template.instance();
    let saveToTAttachment = false;
    let lineIDForAttachment = false;
    let uploadedFilesArray = templateObj.uploadedFiles.get();

    let myFiles = $("#img-attachment-upload_fromtransactionfooter")[0].files;
    let uploadData = utilityService.attachmentUpload(
      uploadedFilesArray,
      myFiles,
      saveToTAttachment,
      lineIDForAttachment
    );
    templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
    templateObj.attachmentCount.set(uploadData.totalAttachments);
  },

  'click .remove-attachment': function(event, ui) {
    let tempObj = Template.instance();
    let attachmentID = parseInt(event.target.id.split('remove-attachment-')[1]);
    if (tempObj.$("#confirm-action-" + attachmentID).length) {
        tempObj.$("#confirm-action-" + attachmentID).remove();
    } else {
        let actionElement = '<div class="confirm-action" id="confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-' + attachmentID + '">' +
            'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
        tempObj.$('#attachment-name-' + attachmentID).append(actionElement);
    }
    tempObj.$("#new-attachment2-tooltip").show();

  },

  "click .file-name": function (event) {
    let attachmentID = parseInt(event.currentTarget.parentNode.id.split("attachment-name-")[1] );
    let templateObj = Template.instance();
    let uploadedFiles = templateObj.uploadedFiles.get();
    $("#myModalAttachment").modal("hide");
    let previewFile = {};
    let input = uploadedFiles[attachmentID].fields.Description;
    previewFile.link = "data:" + input +  ";base64," + uploadedFiles[attachmentID].fields.Attachment;
    previewFile.name = uploadedFiles[attachmentID].fields.AttachmentName;
    let type = uploadedFiles[attachmentID].fields.Description;
    if (type === "application/pdf") {
      previewFile.class = "pdf-class";
    } else if ( type === "application/msword" || type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ) {
      previewFile.class = "docx-class";
    } else if ( type === "application/vnd.ms-excel" || type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ) {
      previewFile.class = "excel-class";
    } else if ( type === "application/vnd.ms-powerpoint" || type === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
      previewFile.class = "ppt-class";
    } else if ( type === "application/vnd.oasis.opendocument.formula" || type === "text/csv" || type === "text/plain" || type === "text/rtf") {
      previewFile.class = "txt-class";
    } else if ( type === "application/zip" || type === "application/rar" || type === "application/x-zip-compressed" || type === "application/x-zip,application/x-7z-compressed" ) {
      previewFile.class = "zip-class";
    } else {
      previewFile.class = "default-class";
    }

    if (type.split("/")[0] === "image") {
      previewFile.image = true;
    } else {
      previewFile.image = false;
    }
    templateObj.uploadedFile.set(previewFile);

    $("#files_view").modal("show");

    return;
  },

  "click .confirm-delete-attachment": function (event, ui) {
    let tempObj = Template.instance();
    tempObj.$("#new-attachment2-tooltip").show();
    let attachmentID = parseInt(event.target.id.split("delete-attachment-")[1]);
    let uploadedArray = tempObj.uploadedFiles.get();
    let attachmentCount = tempObj.attachmentCount.get();
    $("#attachment-upload").val("");
    uploadedArray.splice(attachmentID, 1);
    tempObj.uploadedFiles.set(uploadedArray);
    attachmentCount--;
    if (attachmentCount === 0) {
      let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>'; 
      $("#file-display_fromtransactionfooter").html(elementToAdd);
    }
    tempObj.attachmentCount.set(attachmentCount);
    if (uploadedArray.length > 0) {
      let utilityService = new UtilityService();
      utilityService.showUploadedAttachment(uploadedArray, 'fromtransactionfooter');
    } else {
      $(".attchment-tooltip").show();
    }
  },

  'click #btn_Attachment': function() {
    let templateObject = Template.instance();
    let uploadedFileArray = templateObject.uploadedFiles.get();
    if (uploadedFileArray.length > 0) {
        let utilityService = new UtilityService();
        utilityService.showUploadedAttachment(uploadedFileArray);
    } else {
        $(".attchment-tooltip").show();
    }
  },

  "click .chkEmailCopy": function (event) {
    let templateObject = Template.instance();
    let targetElement;
    if(templateObject.data.clientType == 'Customer') {
      targetElement = $('#edtCustomerEmail')
    } else if(clientType == 'Supplier') {
      targetElement = $('#edtSupplierEmail')
    }
    $(targetElement).val($(targetElement).val().replace(/\s/g, ""));
    if ($(event.target).is(":checked")) {
      let checkEmailData = $(targetElement).val();

      if (checkEmailData.replace(/\s/g, "") === "") {
        if(templateObject.data.clientType == 'Customer') {
          swal("Customer Email cannot be blank!", "", "warning");
        } else if(templateObject.data.clientType == 'Supplier') {
          swal("Supplier Email cannot be blank!", "", "warning");
        }
        event.preventDefault();
      } else {
        function isEmailValid(mailTo) {
          return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(mailTo);
        }
        if (!isEmailValid(checkEmailData)) {
          swal(
            "The email field must be a valid email address !",
            "",
            "warning"
          );

          event.preventDefault();
          return false;
        } else { }
      }
    } else { }
  },

   // add to custom field
   "click #edtSaleCustField_1": function (e) {
    $("#clickedControl").val("one");
  },

  // add to custom field
  "click #edtSaleCustField_2": function (e) {
    $("#clickedControl").val("two");
  },

  // add to custom field
  "click #edtSaleCustField_3": function (e) {
    $("#clickedControl").val("three");
  },

  "click #printModal .btn-check-template": function (event) {
    const template = $(event.target).data('template');
    const templateObject = Template.instance()
    // $("#" + checkboxID).trigger("click");
    templateObject.print(template)
  },


  "click #printModal #btnSendEmail" : async function (event) {
    const templateObject = Template.instance()
    const checkedPrintOptions = $("#printModal").find(".chooseTemplateBtn:checked")
    if(templateObject.data.clientType == 'Customer') {
      if ($("#edtCustomerEmail").val() != "") {
        LoadingOverlay.show();
        await templateObject.sendEmailWithAttachment();
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
    } else if(templateObject.data.clientType == 'Supplier') {
      if ($("#edtSupplierEmail").val() != "") {
        LoadingOverlay.show();
        await templateObject.sendEmailWithAttachment();
        LoadingOverlay.hide();
      } else {
        swal({
          title: "Supplier Email Required",
          text: "Please enter supplier email",
          type: "error",
          showCancelButton: false,
          confirmButtonText: "OK",
        })
      }
    }
  },

  "click .printConfirm": async function (event) {
    // const checkedPrintOptions = $("#printModal").find(".chooseTemplateBtn:checked")
    // console.log("checked print options", checkedPrintOptions)
    // // if(checkedPrintOptions.length == 0){
    // //   return;
    // // }
    // playPrintAudio();
    // const templateObject = Template.instance();
    // templateObject.print()



    if (localStorage.getItem("confirmPrintStatus") == 'print') {
      localStorage.setItem("confirmPrintStatus", "idle");
      playPrintAudio();
      const templateObject = Template.instance();
      templateObject.print();
    } else {
      let checkedTemplate =$(event.target).parents('.modal-content').find('.chooseTemplateBtn:checked').first();
      if (checkedTemplate.length > 0) {
        let defaultTemplates = $('.chooseTemplateModal .chkGlobalSettings:checked');
        for (let i = 0; i < defaultTemplates.length; i++) {
          let template_name = defaultTemplates[i].id.substr(0, defaultTemplates[i].id.lastIndexOf('_'));
          if ($(checkedTemplate[0]).data('id') == template_name) {
            localStorage.setItem("confirmPrintStatus", "preview");
            let previewButton = $(defaultTemplates[i]).parents('.templateItem').children('.btnPreviewTemplate');
            previewButton.trigger('click');
            $('#closeTemplatePreview').data('template', template_name);
            break;
          }
        }
      }
    }
  },

  'click .btnSave:not(.btnSaveGridSettings)': function (event) {
    event.preventDefault();
    event.stopPropagation();
    let templateObject = Template.instance();
    let uploadedData = templateObject.uploadedFiles.get();
    let accountId = templateObject.accountID.get();
    let stripe_fee_method = templateObject.stripe_fee_method.get();
    let obj = {
      uploadedData: uploadedData,
      accoundId: accountId,
      stripe_fee_method: stripe_fee_method
    }
    templateObject.data.saveTransaction(obj)
  },

  "blur .lineQty, blur .lineOrdered": function (event) {
    let templateObject = Template.instance();
    let taxcodeList = templateObject.taxraterecords.get();
    let utilityService = new UtilityService();
    let $tblrows = $("#"+templateObject.data.gridTableId+" tbody tr");
    let $printrows = $(".invoice_print tbody tr");
    let isBOnShippedQty = templateObject.includeBOnShippedQty.get();
    var targetID = $(event.target).closest("tr").attr("id");
    if (isBOnShippedQty == true) {
      let qtyOrdered = $("#" + targetID + " .lineOrdered").val();
      let qtyShipped = $("#" + targetID + " .lineQty").val();
      let boValue = "";

      if (qtyOrdered == "" || isNaN(qtyOrdered)) {
        qtyOrdered = 0;
      }
      if (parseInt(qtyOrdered) < parseInt(qtyShipped)) {
        $("#" + targetID + " .lineQty").val(qtyOrdered);
        $("#" + targetID + " .lineBackOrder").val(0);
      } else if (parseInt(qtyShipped) <= parseInt(qtyOrdered)) {
        boValue = parseInt(qtyOrdered) - parseInt(qtyShipped);
        $("#" + targetID + " .lineBackOrder").val(boValue);
      }
    }

    let subGrandTotal = 0;
    let taxGrandTotal = 0;
    let subDiscountTotal = 0; // New Discount
    let taxGrandTotalPrint = 0;

    if ($('.printID').attr('id') != undefined || $('.printID').attr('id') != "") {
      $('#' + targetID + " #lineQty").text($('#' + targetID + " .lineQty").val());
    }
    
    let subGrandTotalNet = 0;
    let taxGrandTotalNet = 0;
    // $tblrows.each(function (index) {
    //   var $tblrow = $(this);
    //   let tdproduct = $tblrow.find(".lineProductName").val() || "";
    //   if (tdproduct != "") {
    //     var qty = $tblrow.find(".lineQty").val() || 0;
    //     var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
    //     var taxRate = $tblrow.find(".lineTaxCode").val();
    //     var taxrateamount = 0;
    //     if (taxcodeList) {
    //       for (var i = 0; i < taxcodeList.length; i++) {
    //         if (taxcodeList[i].codename == taxRate) {
    //           taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
    //         }
    //       }
    //     }

    //     var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //     var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    //     var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").val()) || 0; // New Discount
    //     let lineTotalAmount = subTotal + taxTotal;

    //     let lineDiscountTotal = lineDiscountPerc / 100;

    //     var discountTotal = lineTotalAmount * lineDiscountTotal;
    //     var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
    //     var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
    //     var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
    //     var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
    //     if (!isNaN(discountTotal)) {
    //       subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;
    //       document.getElementById("subtotal_discount").innerHTML = 
    //         utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
    //     }
    //     $tblrow.find(".lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

    //     let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
    //     let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //     let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc || 0;
    //     $tblrow.find(".colUnitPriceExChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
    //     $tblrow.find(".colUnitPriceIncChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

    //     if (!isNaN(subTotal)) {
    //       $tblrow.find(".colAmountEx").text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //       $tblrow.find(".colAmountInc").text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
    //       subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
    //       subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
    //       document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
    //     }

    //     if (!isNaN(taxTotal)) {
    //       taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
    //       taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
    //       document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
    //     }

    //     if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //       let GrandTotal = parseFloat(subGrandTotal) + parseFloat(taxGrandTotal);
    //       let GrandTotalNet = parseFloat(subGrandTotalNet) + parseFloat(taxGrandTotalNet);
    //       document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
    //       document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //       document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //       document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //     }
    //   }
    // });

    templateObject.updateLine();

    // $printrows.each(function (index) {
    //   var $printrows = $(this);
    //   var qty = $printrows.find("#lineQty").text() || 0;
    //   var price = $printrows.find("#lineUnitPrice").text() || "0";
    //   var taxrateamount = 0;
    //   var taxcode = $printrows.find("#lineTaxCode").text();
    //   if (taxcodeList) {
    //     for (var i = 0; i < taxcodeList.length; i++) {
    //       if (taxcodeList[i].codename == taxcode) {
    //         taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
    //       }
    //     }
    //   }
    //   var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //   var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) *parseFloat(taxrateamount);
    //   $printrows.find("#lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //   if (!isNaN(subTotal)) {
    //     $printrows.find("#lineAmt").text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //     subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //     document.getElementById("subtotal_totalPrint").innerHTML = $("#subtotal_total").text();
    //   }

    //   if (!isNaN(taxTotal)) {
    //     taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
    //     document.getElementById("totalTax_totalPrint").innerHTML =
    //       utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
    //   }
    //   if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //     document.getElementById("grandTotalPrint").innerHTML =
    //       $("#grandTotal").text();
    //     document.getElementById("totalBalanceDuePrint").innerHTML =
    //       $("#totalBalanceDue").text();
    //   }
    // });
  },
  "blur .lineOrdered": function (event) {
    let templateObject = Template.instance();
    let taxcodeList = templateObject.taxraterecords.get();
    let utilityService = new UtilityService();
    let $tblrows = $("#tblInvoiceLine tbody tr");
    let isBOnShippedQty = templateObject.includeBOnShippedQty.get();
    var targetID = $(event.target).closest("tr").attr("id");
    if (isBOnShippedQty == true) {
      let qtyOrdered = $("#" + targetID + " .lineOrdered").val();
      let qtyShipped = $("#" + targetID + " .lineQty").val();
      let boValue = "";

      if (qtyOrdered == "" || isNaN(qtyOrdered)) {
        qtyOrdered = 0;
      }
      if (parseInt(qtyOrdered) < parseInt(qtyShipped)) {
        $("#" + targetID + " .lineQty").val(qtyOrdered);
        $("#" + targetID + " .lineBackOrder").val(0);
      } else if (parseInt(qtyShipped) <= parseInt(qtyOrdered)) {
        boValue = parseInt(qtyOrdered) - parseInt(qtyShipped);
        $("#" + targetID + " .lineBackOrder").val(boValue);
      }
    }

    let subGrandTotal = 0;
    let taxGrandTotal = 0;
    let subDiscountTotal = 0; // New Discount

    let subGrandTotalNet = 0;
    let taxGrandTotalNet = 0;
    // $tblrows.each(function (index) {
    //   var $tblrow = $(this);
    //   let tdproduct = $tblrow.find(".lineProductName").val() || "";
    //   if (tdproduct != "") {
    //     var qty = $tblrow.find(".lineQty").val() || 0;
    //     var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
    //     var taxRate = $tblrow.find(".lineTaxCode").val();
    //     var taxrateamount = 0;
    //     if (taxcodeList) {
    //       for (var i = 0; i < taxcodeList.length; i++) {
    //         if (taxcodeList[i].codename == taxRate) {
    //           taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
    //         }
    //       }
    //     }

    //     var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //     var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    //     var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").val()) || 0; // New Discount
    //     let lineTotalAmount = subTotal + taxTotal;

    //     let lineDiscountTotal = lineDiscountPerc / 100;

    //     var discountTotal = lineTotalAmount * lineDiscountTotal;
    //     var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
    //     var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
    //     var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
    //     var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
    //     if (!isNaN(discountTotal)) {
    //       subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

    //       document.getElementById("subtotal_discount").innerHTML =
    //         utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
    //     }
    //     $tblrow.find(".lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

    //     let unitPriceIncCalc =Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) ||0;
    //     let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //     let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc || 0;
    //     $tblrow.find(".colUnitPriceExChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
    //     $tblrow.find(".colUnitPriceIncChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

    //     if (!isNaN(subTotal)) {
    //       $tblrow.find(".colAmountEx").text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //       $tblrow.find(".colAmountInc").text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
    //       subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ?0 :subTotalWithDiscountTotalLine;
    //       subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
    //       document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
    //     }

    //     if (!isNaN(taxTotal)) {
    //       taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 :taxTotalWithDiscountTotalLine;
    //       taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
    //       document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
    //     }

    //     if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //       let GrandTotal = parseFloat(subGrandTotal) + parseFloat(taxGrandTotal);
    //       let GrandTotalNet = parseFloat(subGrandTotalNet) + parseFloat(taxGrandTotalNet);
    //       document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
    //       document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //       document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //       document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //     }
    //   }
    // });
    templateObject.updateLine()
  },
  "blur .lineDiscount": function (event) {
    let templateObject = Template.instance();
    let taxcodeList = templateObject.taxraterecords.get();
    let utilityService = new UtilityService();
    let $tblrows = $("#tblInvoiceLine tbody tr");
    let $printrows = $(".invoice_print tbody tr");
    let subGrandTotal = 0;
    let taxGrandTotal = 0;
    let subDiscountTotal = 0; // New Discount
    let taxGrandTotalPrint = 0;

    let subGrandTotalNet = 0;
    let taxGrandTotalNet = 0;
    // $tblrows.each(function (index) {
    //   var $tblrow = $(this);
    //   let tdproduct = $tblrow.find(".lineProductName").val() || "";
    //   if (tdproduct != "") {
    //     var qty = $tblrow.find(".lineQty").val() || 0;
    //     var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
    //     var taxRate = $tblrow.find(".lineTaxCode").val();
    //     var taxrateamount = 0;
    //     if (taxcodeList) {
    //       for (var i = 0; i < taxcodeList.length; i++) {
    //         if (taxcodeList[i].codename == taxRate) {
    //           taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
    //         }
    //       }
    //     }

    //     var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //     var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    //     var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").val()) || 0; // New Discount
    //     let lineTotalAmount = subTotal + taxTotal;

    //     let lineDiscountTotal = lineDiscountPerc / 100;

    //     var discountTotal = lineTotalAmount * lineDiscountTotal;
    //     var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
    //     var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
    //     var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
    //     var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
    //     if (!isNaN(discountTotal)) {
    //       subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

    //       document.getElementById("subtotal_discount").innerHTML =
    //         utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
    //     }
    //     $tblrow.find(".lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

    //     let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
    //     let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //     let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc || 0;
    //     $tblrow.find(".colUnitPriceExChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
    //     $tblrow.find(".colUnitPriceIncChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

    //     if (!isNaN(subTotal)) {
    //       $tblrow.find(".colAmountEx").text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //       $tblrow.find(".colAmountInc").text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
    //       subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ? 0 : subTotalWithDiscountTotalLine;
    //       subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
    //       document.getElementById("subtotal_total").innerHTML =
    //         utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
    //     }

    //     if (!isNaN(taxTotal)) {
    //       taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
    //       taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
    //       document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
    //     }

    //     if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //       let GrandTotal = parseFloat(subGrandTotal) + parseFloat(taxGrandTotal);
    //       let GrandTotalNet = parseFloat(subGrandTotalNet) + parseFloat(taxGrandTotalNet);
    //       document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
    //       document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //       document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //       document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //     }
    //   }
    // });

    templateObject.updateLine()

    // $printrows.each(function (index) {
    //   var $printrows = $(this);
    //   var qty = $printrows.find("#lineQty").text() || 0;
    //   var price = $printrows.find("#lineUnitPrice").text() || "0";
    //   var taxrateamount = 0;
    //   var taxcode = $printrows.find("#lineTaxCode").text();
    //   if (taxcodeList) {
    //     for (var i = 0; i < taxcodeList.length; i++) {
    //       if (taxcodeList[i].codename == taxcode) {
    //         taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
    //       }
    //     }
    //   }
    //   var subTotal =
    //     parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //   var taxTotal =
    //     parseFloat(qty, 10) *
    //     Number(price.replace(/[^0-9.-]+/g, "")) *
    //     parseFloat(taxrateamount);
    //   $printrows
    //     .find("#lineTaxAmount")
    //     .text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //   if (!isNaN(subTotal)) {
    //     $printrows
    //       .find("#lineAmt")
    //       .text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //     subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //     document.getElementById("subtotal_totalPrint").innerHTML =
    //       $("#subtotal_total").text();
    //   }

    //   if (!isNaN(taxTotal)) {
    //     taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
    //     document.getElementById("totalTax_totalPrint").innerHTML =
    //       utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
    //   }
    //   if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //     document.getElementById("grandTotalPrint").innerHTML =
    //       $("#grandTotal").text();
    //     document.getElementById("totalBalanceDuePrint").innerHTML =
    //       $("#totalBalanceDue").text();
    //   }
    // });
  },
  "change .colUnitPriceExChange": function (event) {
    let utilityService = new UtilityService();
    let inputUnitPrice = 0;
    if (!isNaN($(event.target).val())) {
      inputUnitPrice = parseFloat($(event.target).val()) || 0;
      $(event.target).val(
        utilityService.modifynegativeCurrencyFormat(inputUnitPrice)
      );
    } else {
      inputUnitPrice =
        Number(
          $(event.target)
            .val()
            .replace(/[^0-9.-]+/g, "")
        ) || 0;

      $(event.target).val(
        utilityService.modifynegativeCurrencyFormat(inputUnitPrice)
      );
    }
    let templateObject = Template.instance();
    let taxcodeList = templateObject.taxraterecords.get();
    let $tblrows = $("#tblInvoiceLine tbody tr");
    let $printrows = $(".invoice_print tbody tr");
    var targetID = $(event.target).closest("tr").attr("id"); // table row ID
    let subGrandTotal = 0;
    let taxGrandTotal = 0;
    let subDiscountTotal = 0; // New Discount
    let taxGrandTotalPrint = 0;

    $("#" + targetID + " #lineUnitPrice").text(
      $("#" + targetID + " .colUnitPriceExChange").val()
    );

    let subGrandTotalNet = 0;
    let taxGrandTotalNet = 0;
    // $tblrows.each(function (index) {
    //   var $tblrow = $(this);
    //   let tdproduct = $tblrow.find(".lineProductName").val() || "";
    //   if (tdproduct != "") {
    //     var qty = $tblrow.find(".lineQty").val() || 0;
    //     var price = $tblrow.find(".colUnitPriceExChange").val() || 0;
    //     var taxRate = $tblrow.find(".lineTaxCode").val();
    //     var taxrateamount = 0;
    //     if (taxcodeList) {
    //       for (var i = 0; i < taxcodeList.length; i++) {
    //         if (taxcodeList[i].codename == taxRate) {
    //           taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100 || 0;
    //         }
    //       }
    //     }

    //     var subTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //     var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount);
    //     var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").val()) || 0; // New Discount
    //     let lineTotalAmount = subTotal + taxTotal;

    //     let lineDiscountTotal = lineDiscountPerc / 100;

    //     var discountTotal = lineTotalAmount * lineDiscountTotal;
    //     var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
    //     var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
    //     var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
    //     var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
    //     if (!isNaN(discountTotal)) {
    //       subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

    //       document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
    //     }
    //     $tblrow.find(".lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

    //     let unitPriceIncCalc = Number(price.replace(/[^0-9.-]+/g, "")) * parseFloat(taxrateamount) || 0;
    //     let lineUnitPriceExVal = Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //     let lineUnitPriceIncVal = lineUnitPriceExVal + unitPriceIncCalc || 0;
    //     $tblrow.find(".colUnitPriceExChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
    //     $tblrow.find(".colUnitPriceIncChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

    //     if (!isNaN(subTotal)) {
    //       $tblrow.find(".colAmountEx").text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //       $tblrow.find(".colAmountInc").text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
    //       subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ?0 :subTotalWithDiscountTotalLine;
    //       subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
    //       document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
    //     }

    //     if (!isNaN(taxTotal)) {
    //       taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ? 0 : taxTotalWithDiscountTotalLine;
    //       taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
    //       document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
    //     }

    //     if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //       let GrandTotal = parseFloat(subGrandTotal) + parseFloat(taxGrandTotal);
    //       let GrandTotalNet = parseFloat(subGrandTotalNet) + parseFloat(taxGrandTotalNet);
    //       document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
    //       document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //       document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //       document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //     }
    //   }
    // });

    templateObject.updateLine()

    // $printrows.each(function (index) {
    //   var $printrows = $(this);
    //   var qty = $printrows.find("#lineQty").text() || 0;
    //   var price = $printrows.find("#lineUnitPrice").text() || "0";
    //   var taxrateamount = 0;
    //   var taxRate = $printrows.find("#lineTaxCode").text();
    //   if (taxcodeList) {
    //     for (var i = 0; i < taxcodeList.length; i++) {
    //       if (taxcodeList[i].codename == taxRate) {
    //         taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
    //       }
    //     }
    //   }

    //   var subTotal =
    //     parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //   var taxTotal =
    //     parseFloat(qty, 10) *
    //     Number(price.replace(/[^0-9.-]+/g, "")) *
    //     parseFloat(taxrateamount);
    //   $printrows
    //     .find("#lineTaxAmount")
    //     .text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //   if (!isNaN(subTotal)) {
    //     $printrows
    //       .find("#lineAmt")
    //       .text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //     subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //     document.getElementById("subtotal_totalPrint").innerHTML =
    //       $("#subtotal_total").text();
    //   }

    //   if (!isNaN(taxTotal)) {
    //     taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
    //     document.getElementById("totalTax_totalPrint").innerHTML =
    //       utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
    //   }
    //   if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //     document.getElementById("grandTotalPrint").innerHTML =
    //       $("#grandTotal").text();
    //     document.getElementById("totalBalanceDuePrint").innerHTML =
    //       $("#totalBalanceDue").text();
    //   }
    // });
  },
  "change .colUnitPriceIncChange": function (event) {
    let utilityService = new UtilityService();
    let inputUnitPrice = 0;
    if (!isNaN($(event.target).val())) {
      inputUnitPrice = parseFloat($(event.target).val()) || 0;
      $(event.target).val(
        utilityService.modifynegativeCurrencyFormat(inputUnitPrice)
      );
    } else {
      inputUnitPrice =
        Number(
          $(event.target)
            .val()
            .replace(/[^0-9.-]+/g, "")
        ) || 0;

      $(event.target).val(
        utilityService.modifynegativeCurrencyFormat(inputUnitPrice)
      );
    }
    let templateObject = Template.instance();
    let taxcodeList = templateObject.taxraterecords.get();
    let $tblrows = $("#tblInvoiceLine tbody tr");
    let $printrows = $(".invoice_print tbody tr");
    var targetID = $(event.target).closest("tr").attr("id"); // table row ID
    let subGrandTotal = 0;
    let taxGrandTotal = 0;
    let subDiscountTotal = 0; // New Discount
    let taxGrandTotalPrint = 0;

    let subGrandTotalNet = 0;
    let taxGrandTotalNet = 0;
    // $tblrows.each(function (index) {
    //   var $tblrow = $(this);
    //   let tdproduct = $tblrow.find(".lineProductName").val() || "";
    //   if (tdproduct != "") {
    //     var qty = $tblrow.find(".lineQty").val() || 0;
    //     var price = $tblrow.find(".colUnitPriceIncChange").val() || 0;
    //     var taxRate = $tblrow.find(".lineTaxCode").val();
    //     var taxrateamount = 0;
    //     if (taxcodeList) {
    //       for (var i = 0; i < taxcodeList.length; i++) {
    //         if (taxcodeList[i].codename == taxRate) {
    //           taxrateamount = taxcodeList[i].coderate.replace("%", "");
    //         }
    //       }
    //     }

    //     let taxRateAmountCalc = (parseFloat(taxrateamount) + 100) / 100;

    //     var subTotal = (parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, ""))) / taxRateAmountCalc || 0;
    //     var taxTotal = parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotal) || 0;

    //     var subTotalExQty = parseFloat(price.replace(/[^0-9.-]+/g, "")) / taxRateAmountCalc || 0;
    //     var taxTotalExQty = parseFloat(price.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotalExQty) || 0;

    //     var lineDiscountPerc = parseFloat($tblrow.find(".lineDiscount").val()) || 0; // New Discount
    //     let lineTotalAmount = subTotal + taxTotal;

    //     let lineDiscountTotal = lineDiscountPerc / 100;

    //     var discountTotal = lineTotalAmount * lineDiscountTotal;
    //     var subTotalWithDiscount = subTotal * lineDiscountTotal || 0;
    //     var subTotalWithDiscountTotalLine = subTotal - subTotalWithDiscount || 0;
    //     var taxTotalWithDiscount = taxTotal * lineDiscountTotal || 0;
    //     var taxTotalWithDiscountTotalLine = taxTotal - taxTotalWithDiscount;
    //     if (!isNaN(discountTotal)) {
    //       subDiscountTotal += isNaN(discountTotal) ? 0 : discountTotal;

    //       document.getElementById("subtotal_discount").innerHTML = utilityService.modifynegativeCurrencyFormat(subDiscountTotal);
    //     }
    //     $tblrow.find(".lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotalWithDiscountTotalLine));

    //     let lineUnitPriceIncVal = Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //     let lineUnitPriceExVal = lineUnitPriceIncVal - taxTotalExQty || 0;
    //     $tblrow.find(".colUnitPriceExChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceExVal));
    //     $tblrow.find(".colUnitPriceIncChange").val(utilityService.modifynegativeCurrencyFormat(lineUnitPriceIncVal));

    //     if (!isNaN(subTotal)) {
    //       $tblrow.find(".colAmountEx").text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //       $tblrow.find(".colAmountInc").text(utilityService.modifynegativeCurrencyFormat(lineTotalAmount));
    //       subGrandTotal += isNaN(subTotalWithDiscountTotalLine) ?0 :subTotalWithDiscountTotalLine;
    //       subGrandTotalNet += isNaN(subTotal) ? 0 : subTotal;
    //       document.getElementById("subtotal_total").innerHTML = utilityService.modifynegativeCurrencyFormat(subGrandTotalNet);
    //     }

    //     if (!isNaN(taxTotal)) {
    //       taxGrandTotal += isNaN(taxTotalWithDiscountTotalLine) ?0 :taxTotalWithDiscountTotalLine;
    //       taxGrandTotalNet += isNaN(taxTotal) ? 0 : taxTotal;
    //       document.getElementById("subtotal_tax").innerHTML = utilityService.modifynegativeCurrencyFormat(taxGrandTotalNet);
    //     }

    //     if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //       let GrandTotal = parseFloat(subGrandTotal) + parseFloat(taxGrandTotal);
    //       let GrandTotalNet = parseFloat(subGrandTotalNet) + parseFloat(taxGrandTotalNet);
    //       document.getElementById("subtotal_nett").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotalNet);
    //       document.getElementById("grandTotal").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //       document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //       document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //     }
    //   }
    // });
    templateObject.updateLine(false)

    $("#" + targetID + " #lineUnitPrice").text(
      $("#" + targetID + " .colUnitPriceExChange").val()
    );

    // $printrows.each(function (index) {
    //   var $printrows = $(this);
    //   var qty = $printrows.find("#lineQty").text() || 0;
    //   var price = $printrows.find("#lineUnitPrice").text() || "0";
    //   var taxrateamount = 0;
    //   var taxRate = $printrows.find("#lineTaxCode").text();
    //   if (taxcodeList) {
    //     for (var i = 0; i < taxcodeList.length; i++) {
    //       if (taxcodeList[i].codename == taxRate) {
    //         taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100;
    //       }
    //     }
    //   }

    //   var subTotal =
    //     parseFloat(qty, 10) * Number(price.replace(/[^0-9.-]+/g, "")) || 0;
    //   var taxTotal =
    //     parseFloat(qty, 10) *
    //     Number(price.replace(/[^0-9.-]+/g, "")) *
    //     parseFloat(taxrateamount);
    //   $printrows
    //     .find("#lineTaxAmount")
    //     .text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //   if (!isNaN(subTotal)) {
    //     $printrows
    //       .find("#lineAmt")
    //       .text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //     subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //     document.getElementById("subtotal_totalPrint").innerHTML =
    //       $("#subtotal_total").text();
    //   }

    //   if (!isNaN(taxTotal)) {
    //     taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
    //     document.getElementById("totalTax_totalPrint").innerHTML =
    //       utilityService.modifynegativeCurrencyFormat(taxGrandTotalPrint);
    //   }
    //   if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //     document.getElementById("grandTotalPrint").innerHTML =
    //       $("#grandTotal").text();
    //     document.getElementById("totalBalanceDuePrint").innerHTML =
    //       $("#totalBalanceDue").text();
    //   }
    // });
  },

  "click .lineProductName, keydown .lineProductName": function (event) {
    let templateObject = Template.instance();
    templateObject.selectedLineId.set($(event.target).closest('tr').attr('id'))
    templateObject.selectedLine.set($(event.target).closest('tr').attr('id'))
    if(templateObject.data.clientType == 'Customer') {
      if($('#edtCustomerName').val() == '') {
        swal("Customer has not been selected!", "", "warning");
        event.stopImmediatePropagation();
        return false;
      } 
    } else if(templateObject.data.clientType == 'Supplier') {
      if($('#edtCustomerName').val() == '') {
        swal("Supplier has not been selected!", "", "warning");
        event.stopImmediatePropagation();
        return false;
      } 
    }
    var targetID = $(event.target).closest("tr").attr("id");
    $("#selectLineID").val(targetID);
    templateObject.selectedLine.set(targetID)
  },

  "keydown .lineQty, keydown .lineUnitPrice, keydown .lineOrdered": function (
    event
  ) {
    if (
      $.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
      (event.keyCode === 65 &&
        (event.ctrlKey === true || event.metaKey === true)) ||
      (event.keyCode >= 35 && event.keyCode <= 40)
    ) {
      return;
    }

    if (event.shiftKey == true) {
      event.preventDefault();
    }

    if (
      (event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 96 && event.keyCode <= 105) ||
      event.keyCode == 8 ||
      event.keyCode == 9 ||
      event.keyCode == 37 ||
      event.keyCode == 39 ||
      event.keyCode == 46 ||
      event.keyCode == 190 ||
      event.keyCode == 189 ||
      event.keyCode == 109
    ) { } else {
      event.preventDefault();
    }
  },

  'click #addRow': function(event) {
    let templateObject = Template.instance();
    let tokenid = Random.id();
    let rows = $('#'+templateObject.data.gridTableId + '> tbody >tr');
    for(let i = 0; i< rows.length; i++) {
      if($(rows[i]).find('td> .lineProductName').val() == '') {
        swal("You have to select Product.", "", "info");
        return false
      }
    }
    let tempRecord = cloneDeep(templateObject.transactionrecord.get());
    let lineItems = tempRecord.LineItems;
    lineItems.push({
      DiscountPercent: 0,
      SalesLinesCustField1: "",
      TaxRate: "",
      TaxTotal: "",
      TotalAmt: "",
      TotalAmtInc: "",
      UnitOfMeasure: "",
      curTotalAmt: "",
      description: "",
      expirydates:"",
      item: "",
      lineCost: "",
      lineID: tokenid,
      lotnumbers: "",
      qtybo: 0,
      qtyordered: 0,
      qtyshipped: 0,
      quantity: 1,
      serialnumbers: "",
      taxCode: "",
      taxRate: "",
      unitPrice: "",
      unitPriceInc: "" ,
      weight: 0,
      weightUnit:'kg',
      volume: 0,
      volumeUnit:'m3' 
    })
    tempRecord.LineItems = lineItems;
    templateObject.transactionrecord.set(tempRecord);
    templateObject.selectedLine.set(tokenid)
    setTimeout(()=>{
      $('#'+templateObject.data.gridTableId+ '>tbody>tr:last').attr('id', tokenid);
      // $("#selectLineID").val(tokenid);
      $('#'+templateObject.data.gridTableId+ '>tbody>tr:last >td> input.lineProductName').trigger('click')
    }, 10000  )
  },

  "click .btnSnLotmodal": function (event) {
    var target = event.target;
    // let selectedShipped = $(target).closest("tr").find(".lineShipped").val();
    const templateObject = Template.instance();
    let lineId = $(target).closest("div").attr('line-id')
    let selectedunit = $('#'+templateObject.data.gridTableId+ ' tr#'+lineId).find('.lineOrdered').val()
    // let selectedunit = $(target).closest("tr").find(".lineOrdered").val();
    if(templateObject.includeBOnShippedQty.get() == false) {
      selectedunit = $('#'+templateObject.data.gridTableId+ ' tr#'+lineId).find(".lineQty").val();
    }
    localStorage.setItem("productItem", selectedunit);
    let selectedProductName = $('#'+templateObject.data.gridTableId+ ' tr#'+lineId).find(".lineProductName").val();
    localStorage.setItem("selectedProductName", selectedProductName);

    let productService = new ProductService();
    
    const transactionData = templateObject.transactionrecord.get();
    let existProduct = false;
    if(parseInt(selectedunit) > 0){
      transactionData.LineItems.forEach(async (element) => {
        if (element.item == selectedProductName) {
          existProduct = true;
        }
      });
      // if (!existProduct) {
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
                  let selectedLot = $('#'+templateObject.data.gridTableId+ ' tr#'+lineId).find(".colSerialNo").attr('data-lotnumbers');
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
                  let selectedSN = $('#'+templateObject.data.gridTableId+ ' tr#'+lineId).find(".colSerialNo").attr('data-serialnumbers');
                  if(selectedSN != undefined && selectedSN != ""){
                    shareFunctionByName.initTable(selectedSN, "tblAvailableSNCheckbox");
                  }
                  else{
                    shareFunctionByName.initTable("empty", "tblAvailableSNCheckbox");
                  }
                  setTimeout(function () {
                    var row = $('#'+templateObject.data.gridTableId+ ' tbody').children().index($('#'+templateObject.data.gridTableId+ ' tr#'+lineId));
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
              let existProductInfo = false;
              for (let i = 0; i < data.tproductqtylist.length; i++) {
                if(data.tproductqtylist[i].ProductName == selectedProductName){
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

              if(!existProductInfo){
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
      // }
    }
  },

  'click .btnFixedAsset': function(e) {
    $('#FixedAssetLineAddModal').modal();
  },

  "click table tbody tr .btnFixedAsset": function(e) {
    let templateObject = Template.instance();
    const lineId = $(e.target).closest('tr').attr('id');
    const assetName = $(e.target).parent().attr('assetname');
    const costTypeName = $(e.target).parent().attr('costtypename');
    templateObject.currentLineID.set(lineId);
    $('#fixedAssetLine').val(assetName);
    $('#costTypeLine').val(costTypeName);
  },

  "click .btnRemove": async function (event) {
    $("#footerDeleteModal2").modal("show");
  },

  'click .btnRemoveLine': async function (event) {
    let templateObject = Template.instance();
    let lineid = $(event.target).closest('tr').attr('id');
    templateObject.selectedLineId.set(lineid);
    $("#deleteLineModal").modal("show");
  },

  'click .btnDeleteLine': async function(event) {
    let templateObject = Template.instance();
    let lineId = templateObject.selectedLineId.get();
    $('#'+templateObject.data.tablename+' >tbody >tr#'+lineId).remove();
    $("#"+ templateObject.data.printTableId + "tbody>tr#"+lineId).remove();
    let transactionrecord = cloneDeep(templateObject.transactionrecord.get());
    let cloneLineItems = transactionrecord.LineItems;
    let lineIndex = cloneLineItems.findIndex(line=>{
      return line.lineID == lineId
    })
    if(lineIndex > -1){
      cloneLineItems.splice(lineIndex, 1)
    }
    transactionrecord.LineItems = cloneLineItems;
    templateObject.transactionrecord.set(transactionrecord);
    $("#deleteLineModal").modal('hide')
  },

  "click .btnDeleteFollowingTransaction": async function(event) {
    playDeleteAudio();
    var currentDate = new Date();
    let templateObject = Template.instance();
    setTimeout(async function () {
      swal({
        title: 'You are deleting ' + $("#following_cnt").val() + ' '+ templateObject.data.TransactionType,
        text: "Do you wish to delete this transaction and all others associated with it moving forward?",
        type: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      }).then(async (result) => {
        if (result.value) {
          templateObject.removeTransaction(true);
          
          // $("#btn_data").click();
        }
      });
    }, delayTimeAfterSound);
  },

  "click #footerDeleteModal2 .btnDeleteTransaction": function (event) {
    let templateObject = Template.instance();
    templateObject.removeTransaction()
  },

  "click .btnBack": function (event) {
    playCancelAudio();
    event.preventDefault();
    setTimeout(function () {
      if (FlowRouter.current().queryParams.trans) {
        FlowRouter.go("/customerscard?id=" +FlowRouter.current().queryParams.trans +"&transTab=active");
      } else {
        history.back(1);
      }
    }, delayTimeAfterSound);
  },

  'click #choosetemplate': function (event) {
    if ($('#choosetemplate').is(':checked')) {
      $('#templateselection').modal('show');
    }
    else {
      $('#templateselection').modal('hide');
    }

  },

  'click .btnSaveFrequency': async function () {
    let templateObject = Template.instance();
    templateObject.copyTransaction()
  },

  'click .btnCopyTransaction': function(e) {
    playCopyAudio();
    setTimeout(async function () {
      $('#edtFrequencyDetail').css('display', 'flex');
     
      $("#copyFrequencyModal").modal("toggle");
    }, delayTimeAfterSound);
  },

  'click input[name="frequencyRadio"]': function (event) {
    if (event.target.id == "frequencyMonthly") {
      document.getElementById("monthlySettings").style.display = "block";
      document.getElementById("weeklySettings").style.display = "none";
      document.getElementById("dailySettings").style.display = "none";
      document.getElementById("oneTimeOnlySettings").style.display = "none";
    } else if (event.target.id == "frequencyWeekly") {
      document.getElementById("weeklySettings").style.display = "block";
      document.getElementById("monthlySettings").style.display = "none";
      document.getElementById("dailySettings").style.display = "none";
      document.getElementById("oneTimeOnlySettings").style.display = "none";
    } else if (event.target.id == "frequencyDaily") {
      document.getElementById("dailySettings").style.display = "block";
      document.getElementById("monthlySettings").style.display = "none";
      document.getElementById("weeklySettings").style.display = "none";
      document.getElementById("oneTimeOnlySettings").style.display = "none";
    } else if (event.target.id == "frequencyOnetimeonly") {
      document.getElementById("oneTimeOnlySettings").style.display = "block";
      document.getElementById("monthlySettings").style.display = "none";
      document.getElementById("weeklySettings").style.display = "none";
      document.getElementById("dailySettings").style.display = "none";
    } else {
      $("#copyFrequencyModal").modal('toggle');
    }
  },
  'click input[name="settingsMonthlyRadio"]': function (event) {
    if (event.target.id == "settingsMonthlyEvery") {
      $('.settingsMonthlyEveryOccurence').attr('disabled', false);
      $('.settingsMonthlyDayOfWeek').attr('disabled', false);
      $('.settingsMonthlySpecDay').attr('disabled', true);
    } else if (event.target.id == "settingsMonthlyDay") {
      $('.settingsMonthlySpecDay').attr('disabled', false);
      $('.settingsMonthlyEveryOccurence').attr('disabled', true);
      $('.settingsMonthlyDayOfWeek').attr('disabled', true);
    } else {
      $("#frequencyModal").modal('toggle');
    }
  },
  'click input[name="dailyRadio"]': function (event) {
    if (event.target.id == "dailyEveryDay") {
      $('.dailyEveryXDays').attr('disabled', true);
    } else if (event.target.id == "dailyWeekdays") {
      $('.dailyEveryXDays').attr('disabled', true);
    } else if (event.target.id == "dailyEvery") {
      $('.dailyEveryXDays').attr('disabled', false);
    } else {
      $("#frequencyModal").modal('toggle');
    }
  },

  'click .btnShippingTotals': function() {
    $('#addDeliveryModal').modal('show')
  },
  "blur .colAmountEx": function (event) {
    let templateObject = Template.instance();
    let taxcodeList = templateObject.taxraterecords.get();
    let utilityService = new UtilityService();
    var targetID = $(event.target).closest("tr").attr("id");
    if (!isNaN($(event.target).val())) {
      let inputUnitPrice = parseFloat($(event.target).val()) || 0;
      $(event.target).val(
        utilityService.modifynegativeCurrencyFormat(inputUnitPrice)
      );
    } else {
      let inputUnitPrice =
        Number(
          $(event.target)
            .val()
            .replace(/[^0-9.-]+/g, "")
        ) || 0;

      $(event.target).val(
        utilityService.modifynegativeCurrencyFormat(inputUnitPrice)
      );
    }
    let $tblrows = $("#tblChequeLine tbody tr");
    let $printrows = $(".cheque_print tbody tr");

    if ($(".printID").val() == "") {
      $("#" + targetID + " #lineAmount").text(
        $("#" + targetID + " .colAmountEx").val()
      );
      $("#" + targetID + " #lineTaxCode").text(
        $("#" + targetID + " .lineTaxCode").val()
      );
    }

    let lineAmount = 0;
    let subGrandTotal = 0;
    let taxGrandTotal = 0;
    let taxGrandTotalPrint = 0;

    // $tblrows.each(function (index) {
    //   var $tblrow = $(this);
    //   var amount = $tblrow.find(".colAmountEx").text() || "0";
    //   var taxcode = $tblrow.find(".lineTaxCode").val() || "";
    //   var taxrateamount = 0;
    //   if (taxcodeList) {
    //     for (var i = 0; i < taxcodeList.length; i++) {
    //       if (taxcodeList[i].codename == taxcode) {
    //         taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100 || 0;
    //       }
    //     }
    //   }
    //   console.log("tax rate amount", taxrateamount)
    //   var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
    //   var taxTotal =
    //     parseFloat(amount.replace(/[^0-9.-]+/g, "")) *
    //     parseFloat(taxrateamount) || 0;
    //   $tblrow
    //     .find(".lineTaxAmount")
    //     .text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //   if (!isNaN(subTotal)) {
    //     $tblrow
    //       .find(".colAmountEx")
    //       .val(
    //         utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2))
    //       );
    //     let totalAmountInc = parseFloat(subTotal) + parseFloat(taxTotal) || 0;
    //     $tblrow
    //       .find(".colAmountInc")
    //       .val(
    //         utilityService.modifynegativeCurrencyFormat(
    //           totalAmountInc.toFixed(2)
    //         )
    //       );
    //     subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //     document.getElementById("subtotal_total").innerHTML =
    //       utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
    //   }

    //   if (!isNaN(taxTotal)) {
    //     taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
    //     document.getElementById("subtotal_tax").innerHTML =
    //       utilityService.modifynegativeCurrencyFormat(taxGrandTotal);
    //   }

    //   if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //     let GrandTotal =
    //       parseFloat(subGrandTotal) + parseFloat(taxGrandTotal) || 0;
    //     document.getElementById("grandTotal").innerHTML =
    //       utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //     //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //     //document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //   }
    // });
    templateObject.updateLine();

    // if ($(".printID").val() == "") {
    //   $printrows.each(function (index) {
    //     var $printrow = $(this);
    //     var amount = $printrow.find("#lineAmount").text() || "0";
    //     var taxcode = $printrow.find("#lineTaxCode").text() || "E";

    //     var taxrateamount = 0;
    //     if (taxcodeList) {
    //       for (var i = 0; i < taxcodeList.length; i++) {
    //         if (taxcodeList[i].codename == taxcode) {
    //           taxrateamount = taxcodeList[i].coderate.replace("%", "") / 100 || 0;
    //         }
    //       }
    //     }
    //     var subTotal =
    //      parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
    //     var taxTotal =
    //      parseFloat(amount.replace(/[^0-9.-]+/g, "")) *
    //       parseFloat(taxrateamount);
    //     $printrow .find("#lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //     if (!isNaN(subTotal)) {
    //       $printrow.find("#lineAmt").text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //       subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //       document.getElementById("subtotal_totalPrint").innerHTML = $("#subtotal_total").text();
    //     }

    //     if (!isNaN(taxTotal)) {
    //       taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
    //     }
    //     if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //       let GrandTotal = parseFloat(subGrandTotal) + parseFloat(taxGrandTotal);
    //       document.getElementById("grandTotalPrint").innerHTML = $("#grandTotal").text();
    //       document.getElementById("totalTax").innerHTML = $("#subtotal_tax").text();
    //       //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //       document.getElementById("totalBalanceDuePrint").innerHTML = $("#totalBalanceDue").text();
    //     }
    //   });
    // }
  },

  "blur .colAmountInc": function (event) {
    let templateObject = Template.instance();
    let taxcodeList = templateObject.taxraterecords.get();
    let utilityService = new UtilityService();
    var targetID = $(event.target).closest("tr").attr("id");
    if (!isNaN($(event.target).val())) {
      let inputUnitPrice = parseFloat($(event.target).val()) || 0;
      $(event.target).val(
        utilityService.modifynegativeCurrencyFormat(inputUnitPrice)
      );
    } else {
      let inputUnitPrice =
        Number(
          $(event.target)
            .val()
            .replace(/[^0-9.-]+/g, "")
        ) || 0;

      $(event.target).val(
        utilityService.modifynegativeCurrencyFormat(inputUnitPrice)
      );
    }
    let $tblrows = $("#tblChequeLine tbody tr");
    let $printrows = $(".cheque_print tbody tr");

    let lineAmount = 0;
    let subGrandTotal = 0;
    let taxGrandTotal = 0;
    let taxGrandTotalPrint = 0;

    // $tblrows.each(function (index) {
    //   var $tblrow = $(this);
    //   var amount = $tblrow.find(".colAmountInc").val() || "0";
    //   var taxcode = $tblrow.find(".lineTaxCode").val() || 0;
    //   var taxrateamount = 0;
    //   if (taxcodeList) {
    //     for (var i = 0; i < taxcodeList.length; i++) {
    //       if (taxcodeList[i].codename == taxcode) {
    //         taxrateamount = taxcodeList[i].coderate.replace("%", "");
    //       }
    //     }
    //   }

    //   let taxRateAmountCalc = (parseFloat(taxrateamount) + 100) / 100;
    //   var subTotal =
    //     parseFloat(amount.replace(/[^0-9.-]+/g, "")) / taxRateAmountCalc || 0;
    //   var taxTotal =
    //     parseFloat(amount.replace(/[^0-9.-]+/g, "")) - parseFloat(subTotal) ||
    //     0;
    //   $tblrow
    //     .find(".lineTaxAmount")
    //     .text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //   if (!isNaN(subTotal)) {
    //     $tblrow
    //       .find(".colAmountEx")
    //       .val(
    //         utilityService.modifynegativeCurrencyFormat(subTotal.toFixed(2))
    //       );
    //     let totalAmountInc = parseFloat(subTotal) + parseFloat(taxTotal) || 0;
    //     $tblrow
    //       .find(".colAmountInc")
    //       .val(
    //         utilityService.modifynegativeCurrencyFormat(
    //           totalAmountInc.toFixed(2)
    //         )
    //       );
    //     subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //     document.getElementById("subtotal_total").innerHTML =
    //       utilityService.modifynegativeCurrencyFormat(subGrandTotal.toFixed(2));
    //   }

    //   if (!isNaN(taxTotal)) {
    //     taxGrandTotal += isNaN(taxTotal) ? 0 : taxTotal;
    //     document.getElementById("subtotal_tax").innerHTML =
    //       utilityService.modifynegativeCurrencyFormat(taxGrandTotal.toFixed(2));
    //   }

    //   if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //     let GrandTotal = parseFloat(subGrandTotal) + parseFloat(taxGrandTotal);
    //     document.getElementById("grandTotal").innerHTML =
    //       utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));

    //     //document.getElementById("totalBalanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal.toFixed(2));
    //   }
    // });

    // if ($(".printID").val() == "") {
    //   $printrows.each(function (index) {
    //     var $printrow = $(this);
    //     var amount = $printrow.find("#lineAmount").text() || "0";
    //     var taxcode = $printrow.find("#lineTaxCode").text() || "E";

    //     var taxrateamount = 0;
    //     if (taxcodeList) {
    //       for (var i = 0; i < taxcodeList.length; i++) {
    //         if (taxcodeList[i].codename == taxcode) {
    //           taxrateamount =
    //             taxcodeList[i].coderate.replace("%", "") / 100 || 0;
    //         }
    //       }
    //     }
    //     var subTotal = parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
    //     var taxTotal =
    //       parseFloat(amount.replace(/[^0-9.-]+/g, "")) *
    //       parseFloat(taxrateamount);
    //     $printrow
    //       .find("#lineTaxAmount")
    //       .text(utilityService.modifynegativeCurrencyFormat(taxTotal));
    //     if (!isNaN(subTotal)) {
    //       $printrow
    //         .find("#lineAmt")
    //         .text(utilityService.modifynegativeCurrencyFormat(subTotal));
    //       subGrandTotal += isNaN(subTotal) ? 0 : subTotal;
    //       document.getElementById("subtotal_totalPrint").innerHTML =
    //         $("#subtotal_total").text();
    //     }

    //     if (!isNaN(taxTotal)) {
    //       taxGrandTotalPrint += isNaN(taxTotal) ? 0 : taxTotal;
    //     }
    //     if (!isNaN(subGrandTotal) && !isNaN(taxGrandTotal)) {
    //       let GrandTotal =
    //         parseFloat(subGrandTotal) + parseFloat(taxGrandTotal);
    //       document.getElementById("grandTotalPrint").innerHTML =
    //         $("#grandTotal").text();
    //       //document.getElementById("balanceDue").innerHTML = utilityService.modifynegativeCurrencyFormat(GrandTotal);
    //       document.getElementById("totalBalanceDuePrint").innerHTML =
    //         $("#totalBalanceDue").text();
    //     }
    //   });
    // }
    templateObject.updateLine()
  },



  'click #tblCustomerlist tbody tr, click #tblSupplierlist tbody tr': function(event) {
    let templateObject = Template.instance();
    let tableid = templateObject.data.gridTableId;
    let rows = $('#'+tableid).find('tr');
    let lastrow = rows[rows.length-1];
    // console.log($(lastrow).find('.lineProductName'))
    // console.log($(lastrow).find('.lineAccountName'))
    let id = $('#'+templateObject.data.gridTableId+ '>tbody>tr:last').attr('id');
    // $("#selectLineID").val(id)
    if(templateObject.data.transCategory == 'Accounting') {
      templateObject.selectedLine.set(id)
      if($('#'+templateObject.data.gridTableId+ '>tbody>tr:last >td .lineAccountName').val() == '') {
        $('#'+templateObject.data.gridTableId+ '>tbody>tr:last >td .lineAccountName').trigger('click')
      }
    } else {
      if($('#'+templateObject.data.gridTableId+ '>tbody>tr:last >td .lineProductName').val() == '') {
        templateObject.selectedLine.set(id)
        $('#'+templateObject.data.gridTableId+ '>tbody>tr:last >td .lineProductName').trigger('click')
      }
    }
  }


})
