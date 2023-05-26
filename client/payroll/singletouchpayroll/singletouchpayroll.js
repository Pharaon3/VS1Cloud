import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    CoreService
} from '../../js/core-service';
import {
    UtilityService
} from "../../utility-service";
import {
    ContactService
} from "../../contacts/contact-service";
import {
    ProductService
} from "../../product/product-service";
import {
    SideBarService
} from '../../js/sidebar-service';
import 'jquery-editable-select';
import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/ostrio:flow-router-extra';
import moment from 'moment';
import './singletouchpayroll.html';
let utilityService = new UtilityService();
let sideBarService = new SideBarService();
Template.singletouchpayroll.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.tableheaderrecords = new ReactiveVar();
    templateObject.datatablerecords = new ReactiveVar([]);

    templateObject.getDataTableList = function(data){
        let dataList = [ 
            data.ClientID || "",
            moment(data.CreationDate).format('DD/MM/YYYY') || "",
            utilityService.modifynegativeCurrencyFormat(data.ARBalance) || 0.0,
            data.Payg || "",
            data.Superannuation || "",
            data.NetPay || "",
            data.Active == true ? '' : 'In-Active'
        ];
        return dataList;
    }

    let headerStructure  = [
        { index: 0, label: "ID", class: "colTaskID", active: false, display: true, width: "10" },
        { index: 1, label: "Date", class: "colDate", active: true, display: true, width: "150" },
        { index: 2, label: "Earnings", class: "colEarnings", active: true, display: true, width: "150" },
        { index: 3, label: "PAYG", class: "colPayg", active: true, display: true, width: "200" },
        { index: 4, label: "Superannuation", class: "colSuperannuation", active: true, display: true, width: "200" },
        { index: 5, label: "Net Pay", class: "colNetPay", active: true, display: true, width: "150" },
        { index: 6, label: "Status", class: "colStatus", active: true, display: true, width: "120" },
   ];

    templateObject.tableheaderrecords.set(headerStructure);
});

Template.singletouchpayroll.onRendered(function() {
    $("#date-input,#dateTo,#dateFrom").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
    });
});

Template.singletouchpayroll.events({
    'click #btnClose': function(event) {
        $('.modal-backdrop').css('display', 'none');
        FlowRouter.go('/payrun');
    }
});

Template.singletouchpayroll.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.code == 'NA') {
                return 1;
            } else if (b.code == 'NA') {
                return -1;
            }
            return (a.code.toUpperCase() > b.code.toUpperCase()) ? 1 : -1;
        });
    },

    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    apiFunction:function() {
        return sideBarService.getAllLeadDataList;
    },
    searchAPI: function() {
        return sideBarService.getSingleTouchPayrollByName;
    },
    service: ()=>{
        return sideBarService;
    },
    datahandler: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data);
            return dataReturn;
        }
    },
    exDataHandler: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data);
            return dataReturn;
        }
    },
    apiParams: ()=>{
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },
    tablename: () => {
        let templateObject = Template.instance();
        let accCustID = templateObject.data.custid ? templateObject.data.custid : '';
        return 'tblSingleTouchPayroll'+ accCustID;
    },
});
