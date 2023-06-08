import '../lib/global/indexdbstorage.js';
import { CoreService } from '../js/core-service';
import { ReactiveVar } from 'meteor/reactive-var';
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import {AccountService} from "../accounts/account-service";
import {PurchaseBoardService} from '../js/purchase-service';
import {EmployeeProfileService} from "../js/profile-service";

import { Template } from 'meteor/templating';
import './credit_list.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let sideBarService = new SideBarService();
let purchaseService = new PurchaseBoardService();
let utilityService = new UtilityService();
Template.creditlist.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.custfields = new ReactiveVar([]);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.temporaryfiles = new ReactiveVar([]);

    templateObject.getDataTableList = function(data) {
        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.TotalAmount)|| 0.00;
        let totalTax = utilityService.modifynegativeCurrencyFormat(data.TotalTax) || 0.00;
        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.TotalAmountInc)|| 0.00;
        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.Payment)|| 0.00;
        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.Balance)|| 0.00;
        let orderstatus = data.OrderStatus || '';
        if(data.Deleted == true){
            orderstatus = "Deleted";
        }else if(data.SupplierName == ''){
            orderstatus = "Deleted";
        }

        var dataList = [
            '<span style="display:none;">' + (data.OrderDate !=''? moment(data.OrderDate).format("YYYY/MM/DD"): data.OrderDate) + '</span>' +
                (data.OrderDate !=''? moment(data.OrderDate).format("DD/MM/YYYY"): data.OrderDate),
            data.PurchaseOrderID || '',
            data.SupplierName || '',
            totalAmountEx || 0.00,
            totalTax || 0.00,
            totalAmount || 0.00,
            totalPaid || 0.00,
            totalOutstanding || 0.00,
            data.EmployeeName || '',
            data.Comments || '',
            orderstatus || '',
        ];
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: "Order Date", class: "colOrderDate", active: true, display: true, width: "80" },
        { index: 1, label: "Credit No.", class: "colPurchaseNo", active: true, display: true, width: "100" },
        { index: 2, label: "Supplier", class: "colSupplier", active: true, display: true, width: "200" },
        { index: 3, label: "Amount (Ex)", class: "colAmountEx", active: true, display: true, width: "80" },
        { index: 4, label: "Tax", class: "colTax", active: true, display: true, width: "80" },
        { index: 5, label: "Amount (Inc)", class: "colAmount", active: true, display: true, width: "110" },
        { index: 6, label: "Paid", class: "colPaid", active: true, display: true, width: "110" },
        { index: 7, label: "Outstanding", class: "colBalanceOutstanding", active: false, display: true, width: "110" },
        { index: 8, label: "Employee", class: "colEmployee", active: true, display: true, width: "200" },
        { index: 9, label: "Comments", class: "colComments", active: true, display: true, width: "500" },
        { index: 10, label: "Status", class: "colStatus", active: true, display: true, width: "120" },
    ];
    templateObject.tableheaderrecords.set(headerStructure);

    getVS1Data('TCreditTemp').then(function(dataObject) {
        if(dataObject.length == 0) {
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.tcredittemp;
          if(useData.length > 0) {
              templateObject.temporaryfiles.set(useData);
            $(".btnRefresh").addClass("btnRefreshAlert");
          }
        }
    })
});

Template.creditlist.onRendered(function() {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();

    $('table.tblcreditlist tbody').on( 'click', 'tr', function () {
        var listData = $(this).closest('tr').attr('id');
        var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
        if(listData){
            if(checkDeleted == "Deleted"){
                swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
            }else{
                FlowRouter.go('/creditcard?id=' + listData);
            }
        }
    });
});

Template.creditlist.events({
    'click #btnNewCredit':function(event){
        FlowRouter.go('/creditcard');
    },
    'click .btnRefresh': async function () {
        $(".fullScreenSpin").css("display", "inline-block");

        let templateObject = Template.instance();
        let tempfiles = templateObject.temporaryfiles.get()
        async function sendPostRequest  () {
        return new Promise((resolve, reject) => {
            for(let i=0; i< tempfiles.length; i++) {
            // return
            purchaseService.saveCredit(tempfiles[i]).then(function() {
                let newTemp = tempfiles.slice(i+1, tempfiles.length);
                addVS1Data('TCreditTemp', JSON.stringify({tcredittemp: newTemp})).then(function() {
                if(i == tempfiles.length -1) {
                    resolve()
                }
                })
            }).catch(function(e) {
                resolve();
            })
            }
        })
        }
        if(tempfiles&&tempfiles.length) {
        await sendPostRequest();
        }
        getVS1Data('TCreditTemp').then(function(dataObject) {
        if(dataObject.length ==0) {
            $('.btnRefresh').removeClass('btnRefreshAlert');
        } else {
        }
        }).catch(function(e) {
        $('.btnRefresh').removeClass('btnRefreshAlert');
        })
        let currentDate = new Date();
        let hours = currentDate.getHours(); //returns 0-23
        let minutes = currentDate.getMinutes(); //returns 0-59
        let seconds = currentDate.getSeconds(); //returns 0-59
        let month = currentDate.getMonth() + 1;
        let days = currentDate.getDate();

        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = currentBeginDate.getMonth() + 1;
        let fromDateDay = currentBeginDate.getDate();
        if (currentBeginDate.getMonth() + 1 < 10) {
        fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
        fromDateMonth = currentBeginDate.getMonth() + 1;
        }

        if (currentBeginDate.getDate() < 10) {
        fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDate =
        currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
        let prevMonth11Date = moment().subtract(reportsloadMonths, "months").format("YYYY-MM-DD");


        sideBarService.getTCreditListData(prevMonth11Date,toDate,true,initialReportLoad,0).then(function (dataCredit) {
            addVS1Data("TCreditList", JSON.stringify(dataCredit)).then(function (datareturn) {
                sideBarService.getAllCreditList(initialDataLoad, 0).then(function (dataCredit) {
                    addVS1Data("TCreditEx", JSON.stringify(dataCredit)).then(function (datareturn) {
                        window.open("/creditlist", "_self");
                    }).catch(function (err) {
                        window.open("/creditlist", "_self");
                    });
                    }).catch(function (err) {
                    window.open("/creditlist", "_self");
                    });
            }).catch(function (err) {
                window.open("/creditlist", "_self");
            });
        }).catch(function (err) {
            window.open("/creditlist", "_self");
        });
    //     $('.fullScreenSpin').css('display','inline-block');
    //     let currentDate = new Date();
    //     let hours = currentDate.getHours(); //returns 0-23
    //     let minutes = currentDate.getMinutes(); //returns 0-59
    //     let seconds = currentDate.getSeconds(); //returns 0-59
    //     let month = (currentDate.getMonth()+1);
    //     let days = currentDate.getDate();

    //     if((currentDate.getMonth()+1) < 10){
    //         month = "0" + (currentDate.getMonth()+1);
    //     }

    //     if(currentDate.getDate() < 10){
    //         days = "0" + currentDate.getDate();
    //     }
    //     let currenctTodayDate = currentDate.getFullYear() + "-" + month + "-" + days + " "+ hours+ ":"+ minutes+ ":"+ seconds;
    //     let templateObject = Template.instance();

    //     var currentBeginDate = new Date();
    //     var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    //     let fromDateMonth = (currentBeginDate.getMonth() + 1);
    //     let fromDateDay = currentBeginDate.getDate();
    //     if((currentBeginDate.getMonth()+1) < 10){
    //         fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
    //     }else{
    //         fromDateMonth = (currentBeginDate.getMonth()+1);
    //     }

    //     if(currentBeginDate.getDate() < 10){
    //         fromDateDay = "0" + currentBeginDate.getDate();
    //     }
    //     var toDate = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
    //     let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

    //     sideBarService.getTCreditListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function(dataCredit) {
    //         addVS1Data('TCreditList',JSON.stringify(dataCredit)).then(function (datareturn) {
    //             sideBarService.getAllCreditList(initialDataLoad,0).then(function(data) {
    //                 addVS1Data('TCredit',JSON.stringify(data)).then(function (datareturn) {
    //                     sideBarService.getAllPurchaseOrderListAll(prevMonth11Date,toDate,true,initialReportLoad,0).then(function (data) {
    //                         addVS1Data("TbillReport", JSON.stringify(data)).then(function (datareturn) {
    //                             sideBarService.getAllPurchasesList(prevMonth11Date,toDate,true,initialReportLoad,0).then(function (dataPList) {
    //                                 addVS1Data("TPurchasesList", JSON.stringify(dataPList)).then(function (datareturnPlist) {
    //                                     window.open('/creditlist','_self');
    //                                 }).catch(function (err) {
    //                                     window.open('/creditlist','_self');
    //                                 });
    //                             }).catch(function (err) {
    //                                 window.open('/creditlist','_self');
    //                             });
    //                         }).catch(function (err) {
    //                             sideBarService.getAllPurchasesList(prevMonth11Date,toDate,true,initialReportLoad,0).then(function (dataPList) {
    //                                 addVS1Data("TPurchasesList", JSON.stringify(dataPList)).then(function (datareturnPlist) {
    //                                     window.open('/creditlist','_self');
    //                                 }).catch(function (err) {
    //                                     window.open('/creditlist','_self');
    //                                 });
    //                             }).catch(function (err) {
    //                                 window.open('/creditlist','_self');
    //                             });
    //                         });
    //                     }).catch(function (err) {
    //                         sideBarService.getAllPurchasesList(prevMonth11Date,toDate,true,initialReportLoad,0).then(function (dataPList) {
    //                             addVS1Data("TPurchasesList", JSON.stringify(dataPList)).then(function (datareturnPlist) {
    //                                 window.open('/creditlist','_self');
    //                             }).catch(function (err) {
    //                                 window.open('/creditlist','_self');
    //                             });
    //                         }).catch(function (err) {
    //                             window.open('/creditlist','_self');
    //                         });
    //                     });
    //                 }).catch(function (err) {
    //                     window.open('/creditlist','_self');
    //                 });
    //             }).catch(function(err) {
    //                 window.open('/creditlist','_self');
    //             });
    //         }).catch(function (err) {
    //             sideBarService.getAllCreditList(initialDataLoad,0).then(function(data) {
    //                 addVS1Data('TCredit',JSON.stringify(data)).then(function (datareturn) {
    //                     window.open('/creditlist','_self');
    //                 }).catch(function (err) {
    //                     window.open('/creditlist','_self');
    //                 });
    //             }).catch(function(err) {
    //                 window.open('/creditlist','_self');
    //             });
    //         });
    //     }).catch(function(err) {
    //         window.open('/creditlist','_self');
    //     });

    },
});

Template.creditlist.helpers({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.orderdate == 'NA') {
                return 1;
            }
            else if (b.orderdate == 'NA') {
                return -1;
            }
            return (a.orderdate.toUpperCase() > b.orderdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    purchasesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:localStorage.getItem('mycloudLogonID'),PrefName:'tblcreditlist'});
    },

  // custom fields displaysettings
  custfields: () => {
    return Template.instance().custfields.get();
  },

  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },

    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getTCreditListData;
    },

    searchAPI: function() {
        return sideBarService.getTCreditListByName;
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
