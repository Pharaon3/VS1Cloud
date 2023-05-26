import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import "./lotnumberlist.html"
import GlobalFunctions from "../GlobalFunctions";

let sideBarService = new SideBarService();
Template.lotnumberlist.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    //
    let dateFrom = $("#dateFrom").val();
    let dateTo = $("#dateTo").val();

    let splashArrayTimeSheetList = new Array();
    let productname = "";
    let department = "";
    let salsedes = "";
    let barcode = "";
    let binnumber = "";
    let lotnumber = "";
    let status = "";
    let qty = "";
    let transaction = "";
    let expirydate = "";
    let url = FlowRouter.current().path;
    let getso_id = url.split("?ln=");
    let currentLN = parseInt(getso_id[getso_id.length - 1]) || 0;

    templateObject.getDataTableList = function (data) {
        if(data && data.fields) data = data.fields;

        if(!data.Batchno) {
            return [];
        }

        let deleteFilter = false;

        let dataList = [];

        let expireDate = data.ExpiryDate;

        if(expireDate && new Date(expireDate).getFullYear() == '1899'){
            data.ExpiryDate = '';
            expireDate = '';
        }

        let pattern = /(\d{2})\/(\d{2})\/(\d{4})/;

        if(expireDate && dateFrom && (new Date(dateFrom.replace(pattern,'$3-$2-$1')) > new Date(expireDate)
            || new Date(dateTo.replace(pattern,'$3-$2-$1')) < new Date(expireDate))){
            return [];
        }

        let tclass = '';
        if(data.Alloctype == "OUT"){
            tclass="text-sold";
        }else if(data.Alloctype == ""){
            tclass="text-instock";
        }else{
            tclass='';
        }

        let alloctype = data.Alloctype == "" ? "In-Stock" : data.Alloctype == "IN" ? "In-Stock" : "Sold";

        if(currentLN > 0){
            if(data.Batchno == currentLN && data.Alloctype == ""){
                productname = data.PARTNAME != '' ? data.PARTNAME : 'Unknown';
                let classname = data.classname != '' ? data.classname : 'Unknown';
                department = "<label style='width:100%;'>"+classname+"</label>";
                salsedes = data.QtyDescription;
                barcode = "";
                binnumber = "";
                lotnumber = data.Batchno;
                status = "<label class='" + tclass + "' style='width:100%; text-align:center'>" + alloctype + "</label>";
                qty = "<label style='width:100%; text-align:right'>" + data.Qty + "</label>";
                transaction = "";
                expirydate = data.ExpiryDate !=''? moment(data.ExpiryDate).format("YYYY/MM/DD") : data.ExpiryDate;
            }
            else if(data.Batchno == currentLN && data.Alloctype == "OUT"){
                status += "<label class='" + tclass + "' style='width:100%; text-align:center'>" + alloctype + "</label>";
                qty += "<label style='width:100%; text-align:right'>" + Math.abs(data.Qty) + "</label>";
                let classname = data.classname != '' ? data.classname : 'Unknown';
                department += "<label style='width:100%;'>" + classname + "</label>";
                if(data.Transtype == "TPurchaseOrderLine"){
                    transaction += "<label style='width:100%;'>PO-" + data.transid + "</label>";
                }
                else if(data.Transtype == "TInvoiceLine"){
                    transaction += "<label style='width:100%;'>Inv-" + data.transid + "</label>";
                }
                else{
                    transaction += "<label style='width:100%;'>" + data.Transtype + "-" + data.transid + "</label>";
                }
            }
            else if(data.Batchno == currentLN && data.Alloctype == "IN"){
                qty += "<label style='width:100%; text-align:right'>" + data.Qty + "</label>";
                if(data.Transtype == "TPurchaseOrderLine"){
                    transaction = "<label style='width:100%;'>PO-" + data.transid + "</label>" + transaction;
                }
                else if(data.Transtype == "TInvoiceLine"){
                    transaction = "<label style='width:100%;'>Inv-" + data.transid + "</label>" + transaction;
                }
                else{
                    transaction = "<label style='width:100%;'>" + data.Transtype + "-" + data.transid + "</label>" + transaction;
                }

                dataList = [
                    expirydate ? formatDateByCountry(expirydate) : '',
                    lotnumber,
                    productname,
                    salsedes,
                    qty,
                    transaction,
                    department,
                    binnumber,
                    barcode,
                    status,
                ];

                if($("#tblDepartmentCheckbox") != undefined){
                    if($("#tblDepartmentCheckbox #formCheck-" + data.ClassId).prop("checked") == true){
                        // return dataList;
                    }
                }
                else{
                    // return dataList;
                }
            }
        }
        else{
            if(data.Batchno != "" && data.Alloctype == ""){
                productname = data.PARTNAME != '' ? data.PARTNAME : 'Unknown';
                let classname = data.classname != '' ? data.classname : 'Unknown';
                department = "<label style='width:100%;'>" + classname + "</label>";
                salsedes = data.QtyDescription;
                barcode = "";
                binnumber = "";
                lotnumber = data.Batchno;
                status = "<label class='" + tclass + "' style='width:100%; text-align:center'>" + alloctype + "</label>";
                qty = "<label style='width:100%; text-align:right'>" + data.Qty + "</label>";
                transaction = "";
                expirydate = data.ExpiryDate !=''? moment(data.ExpiryDate).format("YYYY/MM/DD") : data.ExpiryDate;
            }
            else if(data.Batchno != "" && data.Alloctype == "OUT" && deleteFilter){
                status += "<label class='" + tclass + "' style='width:100%; text-align:center'>" + alloctype + "</label>";
                qty += "<label style='width:100%; text-align:right'>" + Math.abs(data.Qty) + "</label>";
                let classname = data.classname != '' ? data.classname : 'Unknown';
                department += "<label style='width:100%;'>"+classname+"</label>";
                if(data.Transtype == "TPurchaseOrderLine"){
                    transaction += "<label style='width:100%;'>PO-" + data.transid + "</label>";
                }
                else if(data.Transtype == "TInvoiceLine"){
                    transaction += "<label style='width:100%;'>Inv-" + data.transid + "</label>";
                }
                else{
                    transaction += "<label style='width:100%;'>" + data.Transtype + "-" + data.transid + "</label>";
                }
            }
            else if(data.Batchno != "" && data.Alloctype == "IN"){
                qty += "<label style='width: 100%;text-align: right;'>" + data.Qty + "</label><span class=\"spliter\"></span>";
                if(data.Transtype == "TPurchaseOrderLine"){
                    transaction = "<label style='width:100%;'>PO-" + data.transid + "</label>" + transaction;
                }
                else if(data.Transtype == "TInvoiceLine"){
                    transaction = "<label style='width:100%;'>Inv-" + data.transid + "</label>" + transaction;
                }
                else{
                    transaction = "<label style='width:100%;'>" + data.Transtype + "-"+data.transid + "</label>" + transaction;
                }

                dataList = [
                    expirydate ? formatDateByCountry(expirydate) : '',
                    lotnumber,
                    productname,
                    salsedes,
                    qty,
                    transaction,
                    department,
                    binnumber,
                    barcode,
                    status,
                ];

                if($("#tblDepartmentCheckbox") != undefined){
                    if($("#tblDepartmentCheckbox #formCheck-" + data.ClassId).prop("checked") == true){
                        // return dataList;
                    }
                }else{
                    // return dataList;
                }
            }
        }
        return dataList;
    }

    let headerStructure = [
        { index: 0, label: 'Expiry Date', class: 'colExpiryDate', active: true, display: true, width: "80" },
        { index: 1, label: 'Lot Number', class: 'colSerialNumber', active: true, display: true, width: "110" },
        { index: 2, label: 'Product Name', class: 'colProductName', active: true, display: true, width: "200" },
        { index: 3, label: 'Sales Description', class: 'colDescription', active: true, display: true, width: "500" },
        { index: 4, label: 'Qty', class: 'colQty', active: true, display: true, width: "110" },
        { index: 5, label: 'Transaction', class: 'colTransaction', active: true, display: true, width: "110" },
        { index: 6, label: 'Department', class: 'colDepartment', active: true, display: true, width: "110" },
        { index: 7, label: 'Bin', class: 'colBin', active: true, display: true, width: "110" },
        { index: 8, label: 'Barcode', class: 'colBarcode', active: true, display: true, width: "200" },
        { index: 9, label: "Status", class: "colStatus", active: true, display: true, width: "120"}
    ];
    templateObject.tableheaderrecords.set(headerStructure);
});

Template.lotnumberlist.onRendered(function() {
});

Template.lotnumberlist.events({
});

Template.lotnumberlist.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.orderdate == 'NA') {
                return 1;
            } else if (b.orderdate == 'NA') {
                return -1;
            }
            return (a.orderdate.toUpperCase() > b.orderdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },

    apiFunction: function () {
        let sideBarService = new SideBarService();
        return sideBarService.getProductBatchesList;
    },

    searchAPI: function () {
        return sideBarService.getProductBatchesByName;
    },

    service: () => {
        let sideBarService = new SideBarService();
        return sideBarService;

    },

    datahandler: function () {
        let templateObject = Template.instance();
        return function (data) {
            let dataReturn = templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    exDataHandler: function () {
        let templateObject = Template.instance();
        return function (data) {
            let dataReturn = templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    apiParams: function () {
        return ["limitCount", "limitFrom", "deleteFilter"];
    },
});

Template.registerHelper("equals", function(a, b) {
    return a === b;
});
