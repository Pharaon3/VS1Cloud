import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import { Template } from 'meteor/templating';
import './deposit_list.html';
import './frm_deposit.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import moment from "moment";
import { PurchaseBoardService } from '../js/purchase-service';

let utilityService = new UtilityService();
let sideBarService = new SideBarService();
Template.depositlist.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.custfields = new ReactiveVar([]);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.temporaryfiles = new ReactiveVar([]);


    templateObject.getDataTableList = function(data) {
        var dataList = [
            data.DepositID || '',
            data.DepositDate !=''? moment(data.DepositDate).format("DD/MM/YYYY"): data.DepositDate,
            data.AccountName || '',
            data.DepositClassName || '',
            data.DepositID || '',
            utilityService.modifynegativeCurrencyFormat(data.Deposit) || 0.00,
            data.EmployeeName || '',
            data.Notes || '',
            data.Deleted ? "Deleted" : "",
        ];
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: 'ID', class:'colID', active: false, display: false, width: "10" },
        { index: 1, label: "Deposit Date", class: "colDepositDate", active: true, display: true, width: "80" },
        { index: 2, label: "Account Name", class: "colAccountName", active: true, display: true, width: "200" },
        { index: 3, label: "Department", class: "colDepartment", active: true, display: true, width: "200" },
        { index: 4, label: "Entry No", class: "colEntryNo", active: true, display: true, width: "110" },
        { index: 5, label: "Amount", class: "colAmount", active: true, display: true, width: "110" },
        { index: 6, label: "Employee", class: "colEmployee", active: true, display: true, width: "200" },
        { index: 7, label: "Reference No", class: "colReferenceNo", active: true, display: true, width: "500" },
        { index: 8, label: "Status", class: "colStatus", active: true, display: true, width: "120" }
    ];
    templateObject.tableheaderrecords.set(headerStructure);
    
    getVS1Data('TDepositTemp').then(function(dataObject) {
        if(dataObject.length == 0) {
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.tdeposittemp;
          if(useData.length > 0) {
              templateObject.temporaryfiles.set(useData);
            $(".btnRefresh").addClass("btnRefreshAlert");
          }
        }
      })
});

Template.depositlist.onRendered(function() {
    $('#tblDepositList tbody').on( 'click', 'tr', function () {
        var listData = $(this).closest('tr').find('.colID').text();
        if(listData){
            FlowRouter.go('/depositcard?id=' + listData);
        }
    });
});

Template.depositlist.events({
    'click .btnRefresh': async function () {
        $('.fullScreenSpin').css('display','inline-block');
        let templateObject = Template.instance();
        let purchaseService = new PurchaseBoardService()
        let tempfiles = templateObject.temporaryfiles.get()
        async function sendPostRequest  () {
        return new Promise((resolve, reject) => {
            for(let i=0; i< tempfiles.length; i++) {
            // return
            purchaseService.saveBankDeposit(tempfiles[i]).then(function() {
                let newTemp = tempfiles.slice(i+1, tempfiles.length);
                addVS1Data('TDepositTemp', JSON.stringify({tdeposittemp: newTemp})).then(function() {
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
        getVS1Data('TDepositTemp').then(function(dataObject) {
        if(dataObject.length ==0) {
            $('.btnRefresh').removeClass('btnRefreshAlert');
        } else {
        }
        }).catch(function(e) {
        $('.btnRefresh').removeClass('btnRefreshAlert');
        })

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

        sideBarService.getAllTBankDepositListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function(data) {
            addVS1Data('TBankDepositList',JSON.stringify(data)).then(function (datareturn) {
                sideBarService.getAllTVS1BankDepositData(initialDataLoad,0).then(function(data) {
                    addVS1Data('TVS1BankDeposit',JSON.stringify(data)).then(function (datareturn) {
                        window.open('/depositlist','_self');
                    }).catch(function (err) {
                        window.open('/depositlist','_self');
                    });
                }).catch(function(err) {
                    window.open('/depositlist','_self');
                });
            }).catch(function (err) {
                sideBarService.getAllTVS1BankDepositData(initialDataLoad,0).then(function(data) {
                    addVS1Data('TVS1BankDeposit',JSON.stringify(data)).then(function (datareturn) {
                        window.open('/depositlist','_self');
                    }).catch(function (err) {
                        window.open('/depositlist','_self');
                    });
                }).catch(function(err) {
                    window.open('/depositlist','_self');
                });
            });
        }).catch(function(err) {
            window.open('/depositlist','_self');
        });


    },
    'click .btnNewDepositEnrty' : function(event){
        FlowRouter.go('/depositcard');
    },
});

Template.depositlist.helpers({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.depositdate == 'NA') {
                return 1;
            }
            else if (b.depositdate == 'NA') {
                return -1;
            }
            return (a.depositdate.toUpperCase() > b.depositdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:localStorage.getItem('mycloudLogonID'),PrefName:'tblDepositList'});
    },
    currentdate : () => {
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        return begunDate;
    },
    // custom fields displaysettings
    displayfields: () => {
        return Template.instance().displayfields.get();
    },

    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getAllTBankDepositListData;
    },

    searchAPI: function() {
        return sideBarService.getAllTBankDepositListByName;
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
