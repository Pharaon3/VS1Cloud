import { ContactService } from "./contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { UtilityService } from "../utility-service";
import { Random } from 'meteor/random';
import { SideBarService } from '../js/sidebar-service';
import {OrganisationService} from '../js/organisation-service';
import '../lib/global/indexdbstorage.js';
import { jsPDF } from 'jspdf';
import 'jQuery.print/jQuery.print.js';
import { autoTable } from 'jspdf-autotable';

import './statementlist.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let contactService = new ContactService();

let statementMailObj = {};

Template.statementlist.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.datatablerecords1 = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.statmentprintrecords = new ReactiveVar([]);
    templateObject.multiplepdfemail = new ReactiveVar([]);
    templateObject.pdfData = new ReactiveVar([]);
    templateObject.accountID = new ReactiveVar();
    templateObject.stripe_fee_method = new ReactiveVar();
    templateObject.custfields = new ReactiveVar([]);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.convertedStatus = new ReactiveVar();

    templateObject.getDataTableList = function(data){
        if(data && data.fields) data = data.fields;

        let balance = utilityService.modifynegativeCurrencyFormat(data.amount)|| 0.00;

        let chkBox = '<div class="custom-control custom-switch chkBox pointer text-center">' +
            '<input name="pointer" class="custom-control-input chkBox notevent pointer" type="checkbox" id="f-' + data.ClientID + '" name="' + data.ClientID + '">' +
            '<label class="custom-control-label chkBox pointer" for="f--' + data.ClientID +
            '"></label></div>'; //switchbox

        let lineStatus = data.OrderStatus || '';
        if (data.Deleted == true) {
            lineStatus = "Deleted";
        }

        let dataList = [
            chkBox,
            data.ClientID,
            data.Customername || '',
            data.Jobname || '',
            balance || '',
            '',
            lineStatus
        ];
        return dataList;
    }

    let checkBoxHeader = `<div class="custom-control custom-switch colChkBoxAll pointer text-center">
        <input name="pointer" class="custom-control-input colChkBoxAll pointer" type="checkbox" id="colChkBoxAll" value="0">
        <label class="custom-control-label colChkBoxAll" for="colChkBoxAll"></label>
        </div>`;

    let headerStructure = [
        { index: 0, label: checkBoxHeader, class: 'colCheckBox', active: true, display: false, width: "40" },
        { index: 1, label: 'ID', class:'colCustomerID', active: false, display: true, width: "10" },
        { index: 2, label: "Company", class: "colCompany", active: true, display: true, width: "200" },
        { index: 3, label: "Job Name", class: "colJobName", active: true, display: true, width: "200" },
        { index: 4, label: "Balance", class: "colBalance", active: true, display: true, width: "110" },
        { index: 5, label: "Notes", class: "colNotes", active: true, display: true, width: "500" },
        { index: 6, label: "Status", class: "colStatus", active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.statementlist.onRendered(function () {
    const templateObject = Template.instance();

    // For send email
    templateObject.getStatementPdfData = function (clientID) {
        //getOneInvoicedata
        let objectData = {};
        let objectDataArray = []

        $('#printstatmentdesign').css('display', 'block');

        return new Promise((resolve, reject) => {
            contactService.getCustomerStatementPrintData(clientID).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                let lineItemsTable = [];
                let lineItemTableObj = {};
                let id = 0;
                let object = {};
                let balance = data.tstatementforcustomer[0].closingBalance;
                let stripe_id = templateObject.accountID.get();
                let stripe_fee_method = templateObject.stripe_fee_method.get();
                var erpGet = erpDb();
                let company = localStorage.getItem('vs1companyName');
                let vs1User = localStorage.getItem('mySession');
                let dept = "Head Office";
                if (data.tstatementforcustomer.length) {
                    let customerName = data.tstatementforcustomer[0].CustomerName;
                    let openingbalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[0].OpeningBalance);
                    let closingbalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[0].closingBalance);
                    let customerphone = data.tstatementforcustomer[0].Phone || '';
                    let customername = data.tstatementforcustomer[0].ClientName || '';
                    let billaddress = data.tstatementforcustomer[0].BillStreet || '';
                    let billstate = data.tstatementforcustomer[0].BillState || '';
                    let billcountry = data.tstatementforcustomer[0].BillCountry || '';
                    let statementId = data.tstatementforcustomer[0].SaleID || '';
                    let email = data.tstatementforcustomer[0].Email || '';
                    let invoiceId = data.tstatementforcustomer[0].SaleID || '';
                    let date = moment(data.tstatementforcustomer[0].transdate).format('DD/MM/YYYY') || '';
                    let datedue = moment(data.tstatementforcustomer[0].Duedate).format('DD/MM/YYYY') || '';
                    let paidAmt = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[0].Paidamt).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                    });
                    let stringQuery = "?";
                    for (let i = 0; i < data.tstatementforcustomer.length; i++) {
                        id = data.tstatementforcustomer[i].SaleID;
                        let transdate =  moment(data.tstatementforcustomer[i].transdate).format('DD/MM/YYYY') ? moment(data.tstatementforcustomer[i].transdate).format('DD/MM/YYYY') : "";
                        let type = data.tstatementforcustomer[i].Transtype;
                        let status = '';
                        // let type = data.tstatementforcustomer[i].Transtype;
                        let total = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let balance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].closingBalance).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });

                        lineItemObj = {
                            lineID: id,
                            id: id || '',
                            date: transdate || '',
                            duedate: datedue,
                            type: type || '',
                            total: total || 0,
                            paidamt: paidAmt || 0,
                            balance: balance || 0

                        };

                        lineItems.push(lineItemObj);
                    }

                    if (balance > 0) {
                        for (let l = 0; l < lineItems.length; l++) {
                            stringQuery = stringQuery + "product" + l + "=" + lineItems[l].type + "&price" + l + "=" + lineItems[l].balance + "&qty" + l + "=" + 1 + "&";
                        }
                        stringQuery = stringQuery + "tax=0" + "&total=" + closingbalance + "&customer=" + customerName + "&name=" + customerName + "&surname=" + customerName + "&quoteid=" + invoiceId + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + email + "&type=Statement&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept;
                        $(".linkText").attr("href", stripeGlobalURL + stringQuery);
                    }

                    var currentDate = new Date();
                    var begunDate = moment(currentDate).format("DD/MM/YYYY");
                    let statmentrecord = {
                        id: statementId,
                        printdate: begunDate,
                        customername: customerName,
                        LineItems: lineItems,
                        phone: customerphone,
                        billaddress: billaddress,
                        billstate: billstate,
                        billcountry: billcountry,
                        email: email,
                        openingBalance: openingbalance,
                        closingBalance: closingbalance
                    };
                    templateObject.statmentprintrecords.set(statmentrecord);
                    if (templateObject.statmentprintrecords.get()) {
                        if (balance > 0) {
                            $('.link').css('display', 'block');
                            $('.linklabel').css('display', 'block');
                        } else {
                            $('.link').css('display', 'none');
                            $('.linklabel').css('display', 'none');
                        }
                        let file = "Statement-" + invoiceId + ".pdf"
                        let templateObject = Template.instance();
                        let completeTabRecord;

                        setTimeout(function () {
                            var source = document.getElementById('printstatmentdesign');
                            var opt1 = {
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
                            statementMailObj = {
                                Id: statementId,
                                customer_name: customerName,
                                openingBalance: openingbalance,
                                email: email,
                                link: stringQuery
                            };

                            resolve(html2pdf().set(opt1).from(source).toPdf().output('datauristring'))
                        }, 2000);
                        $('#printstatmentdesign').css('display', 'none');

                    }
                }

            });
        })
    }

    templateObject.emailMultipleStatementPdf = async function (listIds) {
        let multiPDF = [];
        let doc = new jsPDF();
        for (let j = 0; j < listIds.length; j++) {
            let data = await templateObject.getStatementPdfData(listIds[j]);
            let object = {
                Id: statementMailObj.Id,
                customer_name: statementMailObj.customer_name,
                pdfObj: data,
                openingBalance: statementMailObj.openingBalance,
                email: statementMailObj.email,
                link: statementMailObj.link
            }
            multiPDF.push(object);
        }
        return multiPDF;
    }

    templateObject.base64data = function (file) {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onerror = reject;
            fr.onload = function () {
                resolve(fr.result);
            }
            fr.readAsDataURL(file);
        })
    };
});

Template.statementlist.events({
    'click .btnRefresh': function () {
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
        sideBarService.getAllCustomerStatementData(prevMonth11Date,toDate, false).then(function (data) {
            addVS1Data('TStatementList', JSON.stringify(data)).then(function (datareturn) {
                window.open('/statementlist', '_self');
            }).catch(function (err) {
                window.open('/statementlist', '_self');
            });
        }).catch(function (err) {
            window.open('/statementlist', '_self');
        });
    },
    'click #emailinvoice': async function () {
        playEmailAudio();
        let templateObject = Template.instance();
        setTimeout(async function(){
            $('.fullScreenSpin').css('display', 'inline-block');
            $('#printstatmentdesign').css('display', 'block');

            let listIds = [];
            $('.chkBox').each(function () {
                if ($(this).is(':checked')) {
                    var targetID = $(this).closest('tr').attr('id');
                    listIds.push(targetID);
                } else {}
            });

            if (listIds != '') {
                let data = await templateObject.emailMultipleStatementPdf(listIds);
                let customerData = templateObject.statmentprintrecords.get();
                async function addAttachment() {
                    let attachment = [];
                    let pdfObject = "";
                    let count = 0;
                    let email = [];
                    for (let x = 0; x < data.length; x++) {

                        if (data[x].pdfObj != undefined || data[x].pdfObj != null) {
                            let base64data = data[x].pdfObj;
                            // setTimeout(function() {
                            base64data = base64data.split(',')[1];
                            pdfObject = {
                                filename: 'statement-' + data[x].Id + '.pdf',
                                content: base64data,
                                encoding: 'base64'
                            };
                            attachment.push(pdfObject);
                            let mailFromName = localStorage.getItem('vs1companyName');
                            let mailFrom = localStorage.getItem('EUserName');
                            let customerEmailName = data[x].customer_name;
                            // let mailCC = templateObject.mailCopyToUsr.get();
                            let grandtotal = $('#grandTotal').html();
                            let amountDueEmail = $('#totalBalanceDue').html();
                            let emailDueDate = $("#dtDueDate").val();
                            let mailSubject = 'Statement ' + data[x].Id + ' from ' + mailFromName + ' for ' + customerEmailName;
                            // emailTo = emails[count].toString();
                            let attachmentIndex = attachment[count];
                            count++;
                            var htmlmailBody = '<table align="center" border="0" cellpadding="0" cellspacing="0" width="600">' +
                                '    <tr>' +
                                '        <td align="center" bgcolor="#54c7e2" style="padding: 40px 0 30px 0;">' +
                                '            <img src="https://sandbox.vs1cloud.com/assets/VS1logo.png" class="uploadedImage" alt="VS1 Cloud" width="250px" style="display: block;" />' +
                                '        </td>' +
                                '    </tr>' +
                                '    <tr>' +
                                '        <td style="padding: 40px 30px 40px 30px;">' +
                                '            <table border="0" cellpadding="0" cellspacing="0" width="100%">' +
                                '                <tr>' +
                                '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 20px 0;">' +
                                '                        Hi <span>' + customerEmailName + '</span>.' +
                                '                    </td>' +
                                '                </tr>' +
                                '                <tr>' +
                                '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                                '                        Please find attached Statement <span>' + data[x].Id + '</span>' +
                                '                    </td>' +
                                '                </tr>' +
                                '                 <tr>' +
                                '                    <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                                '                        Simply click on <a style="border: none; color: white; padding: 6px 12px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; background-color: #5cb85c; border-color: #4cae4c; border-radius: 10px;" href="'+stripeGlobalURL+''+ data[x].link + '">Make Payment</a> to pay now.' +
                                '                    </td>' +
                                '                </tr>' +
                                '                <tr>' +
                                '                     <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px; padding: 20px 0 10px 0;">' +
                                '                        Thank you again for business' +
                                '                    </td>' +
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

                            if (data[x].email != "") {
                                Meteor.call('sendEmail', {
                                    from: "" + mailFromName + " <" + mailFrom + ">",
                                    to: data[x].email,
                                    subject: mailSubject,
                                    text: '',
                                    html: htmlmailBody,
                                    attachments: attachmentIndex
                                }, function (error, result) {
                                    $('.fullScreenSpin').css('display', 'none');
                                    $('#printstatmentdesign').css('display', 'none');
                                    if (error && error.error === "error") {
                                        // window.open('/statementlist', '_self');
                                    } else {
                                        $('.fullScreenSpin').css('display', 'none');
                                        $('#printstatmentdesign').css('display', 'none');
                                        swal({
                                            title: 'SUCCESS',
                                            text: "Email Sent To User " + data[x].email,
                                            type: 'success',
                                            showCancelButton: false,
                                            confirmButtonText: 'OK'
                                        }).then((result) => {
                                            if (result.value) {
                                            } else if (result.dismiss === 'cancel') {}
                                        });

                                    }
                                });
                            } else {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#printstatmentdesign').css('display', 'none');
                                swal({
                                    title: 'WARNING',
                                    text: "Customer Does Not Have a Email Address, Please Add One for This Customer ",
                                    type: 'warning',
                                    showCancelButton: false,
                                    confirmButtonText: 'OK'
                                }).then((result) => {
                                    if (result.value) {
                                        // window.open('/statementlist', '_self');
                                    } else if (result.dismiss === 'cancel') {}
                                });

                            }
                        }
                    }
                }
                await addAttachment();
            } else {
                $('.fullScreenSpin').css('display', 'none');
            }
        }, delayTimeAfterSound);
    },
});

Template.statementlist.helpers({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get();
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:localStorage.getItem('mycloudLogonID'),PrefName:'tblStatementlist'});
    },
    // custom fields displaysettings
    custfields: () => {
      return Template.instance().custfields.get();
    },

    // custom fields displaysettings
    displayfields: () => {
      return Template.instance().displayfields.get();
    },

    convertedStatus: () => {
      return Template.instance().convertedStatus.get()
    },

    apiFunction:function() { // do not use arrow function
      return sideBarService.getAllCustomerStatementData
    },

    searchAPI: function() {
      return sideBarService.getAllCustomerStatementDataByName
    },

    apiParams: function() {
      return ['dateFrom', 'dateTo', 'ignoredate', 'limitCount', 'limitFrom', 'deleteFilter'];
    },

    service: ()=>{
      return sideBarService;
    },

    datahandler: function () {
      let templateObject = Template.instance();
      return function(data) {
          return templateObject.getDataTableList(data);
      }
    },

    exDataHandler: function() {
      let templateObject = Template.instance();
      return function(data) {
        return templateObject.getDataTableList(data);
      }
    }
});
