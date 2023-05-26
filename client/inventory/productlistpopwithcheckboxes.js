import {ReactiveVar} from "meteor/reactive-var";
import {UtilityService} from "../utility-service";
import "../lib/global/erp-objects";
import "jquery-ui-dist/external/jquery/jquery";
import "jquery-ui-dist/jquery-ui";
import "jQuery.print/jQuery.print.js";
import "jquery-editable-select";
import {SideBarService} from "../js/sidebar-service";
import "../lib/global/indexdbstorage.js";
import {Template} from 'meteor/templating';
import './productlistpopwithcheckboxes.html';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.productlistpopwithcheckboxes.onCreated(() => {
    const templateObject = Template.instance();

    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    //
    templateObject.getDataTableList = function(data) {
        if(data && data.fields) data = data.fields;
        let linestatus = '';
        let chkBox = '<div class="custom-control custom-switch chkBox pointer text-center"><input name="pointer" class="custom-control-input chkBox chkServiceCard notevent pointer" type="checkbox" id="f-' + data.PARTSID + '" name="' + data.PARTSID + '"><label class="custom-control-label chkBox pointer" for="f-' + data.PARTSID +
            '"></label></div>';
        // let chkBox = '<div class="custom-control custom-switch chkBox pointer text-center">' +
        //     '<input name="pointer" class="custom-control-input chkBox notevent pointer" type="checkbox" id="f-' + data.ClassID + '" name="' + data.ClassID + '">' +
        //     '<label class="custom-control-label chkBox pointer" for="f--' + data.ClassID +
        //     '"></label></div>'; //switchbox

        if (data.Active == true) {
            linestatus = "";
        } else if (data.Active == false) {
            linestatus = "In-Active";
        }

        let costprice = utilityService.modifynegativeCurrencyFormat(Math.floor(data.CostExA * 100) / 100); //Cost Price
        let sellprice = utilityService.modifynegativeCurrencyFormat(Math.floor(data.PriceExA * 100) / 100); //Sell Price

        let dataList = [
            chkBox,
            data.PARTSID || "",
            data.ProductName || "",
            data.SalesDescription || "",
            data.BARCODE || "",
            costprice,
            sellprice,
            data.InstockQty,
            data.PurchaseTaxcode || "",
            data.PRODUCTCODE || "",
            data.Ex_Works || null,
            linestatus,
        ];

        return dataList;
    }

    let checkBoxHeader = `<div class="custom-control custom-switch colChkBoxAll pointer text-center">
        <input name="pointer" class="custom-control-input colChkBoxAll pointer" type="checkbox" id="colChkBoxAll" value="0">
        <label class="custom-control-label colChkBoxAll" for="colChkBoxAll"></label>
        </div>`;

    let headerStructure = [
        { index: 0, label: checkBoxHeader, class: 'colCheckBox', active: true, display: false, width: "40" },
        { index: 1, label: "ID", class: 'colID', active: false, display: false, width: "10" },
        { index: 2, label: 'Product Name', class: 'colProductName', active: true, display: true, width: "200" },
        { index: 3, label: 'Sales Description', class: 'colSalesDescription', active: true, display: true, width: "500" },
        { index: 4, label: 'Barcode', class: 'colBarcode', active: true, display: true, width: "200" },
        { index: 5, label: 'Cost Price', class: 'colCostPrice', active: true, display: true, width: "110" },
        { index: 6, label: 'Sales Price', class: 'colSalesPrice', active: true, display: true, width: "110" },
        { index: 7, label: 'Quantity', class: 'colQty', active: true, display: true, width: "110" },
        { index: 8, label: 'Tax Rate', class: 'colTax', active: true, display: true, width: "80" },
        { index: 9, label: 'Product Pop ID', class: 'colProuctPOPID', active: false, display: false, width: "10" },
        { index: 10, label: 'Extra Sell Price', class: 'colExtraSellPrice', active: false, display: true, width: "110" },
        { index: 11, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },
    ];

    templateObject.tableheaderrecords.set(headerStructure);
});

Template.productlistpopwithcheckboxes.onRendered(function() {
});

Template.productlistpopwithcheckboxes.events({
});


Template.productlistpopwithcheckboxes.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get();
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    apiFunction:function() {
        let sideBarService = new SideBarService();
        return sideBarService.getProductListVS1;
    },
    searchAPI: function() {
        let sideBarService = new SideBarService();
        return sideBarService.getProductListVS1ByName;
    },
    service: ()=>{
        return new SideBarService();
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
    },
    apiParams: function() {
        return ['limitCount', 'limitFrom', 'deleteFilter'];
    },
    tablename: () => {
        let templateObject = Template.instance();
        let accCustID = templateObject.data.custid ? templateObject.data.custid : '';

        return 'tblProductListWithCheckbox'+ accCustID;
    },
});
