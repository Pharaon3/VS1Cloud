import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { EmployeeProfileService } from "../js/profile-service";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import { ReportService } from "../reports/report-service";
import '../lib/global/indexdbstorage.js';
import LoadingOverlay from '../LoadingOverlay';
import GlobalFunctions from '../GlobalFunctions';
import { TaxRateService } from '../settings/settings-service';
import FxGlobalFunctions from '../packages/currency/FxGlobalFunctions';
import moment from 'moment';
import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './basreturn_list.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let utilityService = new UtilityService();
let sideBarService = new SideBarService();
let taxRateService = new TaxRateService();
let reportService = new ReportService();

let defaultCurrencyCode = CountryAbbr;

const months = [];
months["January"] = "01";
months["February"] = "02";
months["March"] = "03";
months["April"] = "04";
months["May"] = "05";
months["June"] = "06";
months["July"] = "07";
months["August"] = "08";
months["September"] = "09";
months["October"] = "10";
months["November"] = "11";
months["December"] = "12";

Template.basreturnlist.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    // Currency related vars //
    FxGlobalFunctions.initVars(templateObject);

    templateObject.getDataTableList = function(data) {
        let tab1startDate = "";
        let tab1endDate = "";
        let tab2startDate = "";
        let tab2endDate = "";
        let tab3startDate = "";
        let tab3endDate = "";

        if(data && data.fields) data = data.fields;

        if (data.Tab1_Year > 0 && data.Tab1_Month != "") {
            tab1startDate = data.Tab1_Year + "-" + months[data.Tab1_Month] + "-01";
            var endMonth = (data.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.Tab1_Month]) / 3) * 3) : (months[data.Tab1_Month]);
            tab1endDate = new Date(data.Tab1_Year, (parseInt(endMonth)), 0);
            tab1endDate = moment(tab1endDate).format("YYYY-MM-DD");
        }
        if (data.Tab2_Year > 0 && data.Tab2_Month != "") {
            tab2startDate = data.Tab2_Year + "-" + months[data.Tab2_Month] + "-01";
            var endMonth = (data.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.Tab2_Month]) / 3) * 3) : (months[data.Tab2_Month]);
            tab2endDate = new Date(data.Tab2_Year, (parseInt(endMonth)), 0);
            tab2endDate = moment(tab2endDate).format("YYYY-MM-DD");
        }
        if (data.Tab3_Year > 0 && data.Tab3_Month != "") {
            tab3startDate = data.Tab3_Year + "-" + months[data.Tab3_Month] + "-01";
            var endMonth = (data.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.Tab3_Month]) / 3) * 3) : (months[data.Tab3_Month]);
            tab3endDate = new Date(data.Tab3_Year, (parseInt(endMonth)), 0);
            tab3endDate = moment(tab3endDate).format("YYYY-MM-DD");
        }

        let dataList = [
            '<span style="display:none;">'+(data.MsTimeStamp !=''? moment(data.MsTimeStamp).format("YYYY/MM/DD"): data.OrderDate)+'</span>'+(data.MsTimeStamp !=''? moment(data.MsTimeStamp).format("DD/MM/YYYY"): data.MsTimeStamp),
            data.ID || '',
            data.BasSheetDesc || '',
            data.Tab1_Type,
            moment(tab1startDate).format("DD/MM/YYYY"),
            moment(tab1endDate).format("DD/MM/YYYY"),
            (tab2startDate && tab2endDate) ? data.Tab2_Type : "",
            (tab2startDate) ? moment(tab2startDate).format("DD/MM/YYYY") : "",
            (tab2endDate) ? moment(tab2endDate).format("DD/MM/YYYY") : "",
            (tab3startDate && tab3endDate) ? data.Tab3_Type : "",
            (tab3startDate) ? moment(tab3startDate).format("DD/MM/YYYY") : "",
            (tab3endDate) ? moment(tab3endDate).format("DD/MM/YYYY") : "",
            data.Active ? "" : "In-Active",
        ];

        return dataList;
    }

    let headerStructure = [
        { index: 0, label: "Date", class: "colDate", width: "80", active: true, display: true },
        { index: 1, label: "BAS Number", class: "colBasNumber", width: "110", active: true, display: true },
        { index: 2, label: "Description", class: "colBasName", width: "250", active: true, display: true },
        { index: 3, label: "GST Period", class: "t1Period", width: "100", active: true, display: true },
        { index: 4, label: "GST From", class: "t1From", width: "120", active: true, display: true },
        { index: 5, label: "GST To", class: "t1To", width: "120", active: true, display: true },
        { index: 6, label: "Withheld Period", class: "t2Period", width: "110", active: true, display: true },
        { index: 7, label: "Withheld From", class: "t2From", width: "80", active: true, display: true },
        { index: 8, label: "Withheld To", class: "t2To", width: "80", active: true, display: true },
        { index: 9, label: "instalment Period", class: "t3Period", width: "110", active: true, display: true },
        { index: 10, label: "instalment From", class: "t3From", width: "80", active: true, display: true },
        { index: 11, label: "instalment To", class: "t3To", width: "80", active: true, display: true },
        { index: 12, label: "Status", class: "colStatus", width: "120", active: true, display: true },
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.basreturnlist.onRendered(function() {
    $('#tblBASReturnList tbody').on('click', 'tr', function() {
        var listData = $(this).closest('tr').find(".colBasNumber").text();
        var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';

        if (listData) {
            if (checkDeleted == "Deleted") {
                swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
            } else {
                FlowRouter.go('/basreturn?id=' + listData);
            }
        }
    });
});

Template.basreturnlist.events({
    "click .btnRefresh": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        reportService.getAllBASReturn().then(function(data) {
            addVS1Data("TBASReturn", JSON.stringify(data)).then(function(datareturn) {}).catch(function(err) {
                window.open("/basreturnlist", "_self");
            }).catch(function(err) {
                window.open("/basreturnlist", "_self");
            });
        }).catch(function(err) {
            window.open("/basreturnlist", "_self");
        });
    },
    "click #btnNewBasReturn": function(event) {
        FlowRouter.go("/basreturn");
    },
});

Template.basreturnlist.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get()
    },

    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: localStorage.getItem("mycloudLogonID"), PrefName: "tblJournalList" });
    },
    currentdate: () => {
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        return begunDate;
    },
    // FX Module
    convertAmount: (amount, currencyData) => {
        let currencyList = Template.instance().tcurrencyratehistory.get(); // Get tCurrencyHistory

        if (isNaN(amount)) {
            if (!amount || amount.trim() == "") {
                return "";
            }
            amount = utilityService.convertSubstringParseFloat(amount); // This will remove all currency symbol
        }
        // if (currencyData.code == defaultCurrencyCode) {
        //    default currency
        //   return amount;
        // }

        // Lets remove the minus character
        const isMinus = amount < 0;
        if (isMinus == true)
            amount = amount * -1; // make it positive for now

        //  get default currency symbol
        // let _defaultCurrency = currencyList.filter(
        //   (a) => a.Code == defaultCurrencyCode
        // )[0];

        // amount = amount.replace(_defaultCurrency.symbol, "");

        // amount =
        //   isNaN(amount) == true
        //     ? parseFloat(amount.substring(1))
        //     : parseFloat(amount);

        // Get the selected date
        let dateTo = $("#dateTo").val();
        const day = dateTo.split("/")[0];
        const m = dateTo.split("/")[1];
        const y = dateTo.split("/")[2];
        dateTo = new Date(y, m, day);
        dateTo.setMonth(dateTo.getMonth() - 1); // remove one month (because we added one before)

        // Filter by currency code
        currencyList = currencyList.filter(a => a.Code == currencyData.code);

        // Sort by the closest date
        currencyList = currencyList.sort((a, b) => {
            a = GlobalFunctions.timestampToDate(a.MsTimeStamp);
            a.setHours(0);
            a.setMinutes(0);
            a.setSeconds(0);

            b = GlobalFunctions.timestampToDate(b.MsTimeStamp);
            b.setHours(0);
            b.setMinutes(0);
            b.setSeconds(0);

            var distancea = Math.abs(dateTo - a);
            var distanceb = Math.abs(dateTo - b);
            return distancea - distanceb; // sort a before b when the distance is smaller

            // const adate= new Date(a.MsTimeStamp);
            // const bdate = new Date(b.MsTimeStamp);

            // if(adate < bdate) {
            //   return 1;
            // }
            // return -1;
        });

        const [firstElem] = currencyList; // Get the firest element of the array which is the closest to that date

        let rate = currencyData.code == defaultCurrencyCode ?
            1 :
            firstElem.BuyRate; // Must used from tcurrecyhistory

        amount = parseFloat(amount * rate); // Multiply by the rate
        amount = Number(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }); // Add commas

        let convertedAmount = isMinus == true ?
            `- ${currencyData.symbol} ${amount}` :
            `${currencyData.symbol} ${amount}`;

        return convertedAmount;
    },
    count: array => {
        return array.length;
    },
    countActive: array => {
        if (array.length == 0) {
            return 0;
        }
        let activeArray = array.filter(c => c.active == true);
        return activeArray.length;
    },
    currencyList: () => {
        return Template.instance().currencyList.get();
    },
    isNegativeAmount(amount) {
        if (Math.sign(amount) === -1) {
            return true;
        }
        return false;
    },
    isOnlyDefaultActive() {
        const array = Template.instance().currencyList.get();
        if (array.length == 0) {
            return false;
        }
        let activeArray = array.filter(c => c.active == true);

        if (activeArray.length == 1) {
            if (activeArray[0].code == defaultCurrencyCode) {
                return !true;
            } else {
                return !false;
            }
        } else {
            return !false;
        }
    },
    isCurrencyListActive() {
        const array = Template.instance().currencyList.get();
        let activeArray = array.filter(c => c.active == true);

        return activeArray.length > 0;
    },
    isObject(variable) {
        return typeof variable === "object" && variable !== null;
    },
    currency: () => {
        return Currency;
    },
    // for Datatablelist template
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    apiFunction:function() {
        return sideBarService.getAllBASReturn;
    },
    searchAPI: function() {
        return sideBarService.getBASReturnByName;
    },
    service: ()=>{
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
