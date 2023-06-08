import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './barcodebutton.html';
import { ReactiveVar } from 'meteor/reactive-var';
import { ProductService } from "../../product/product-service";
import { SideBarService } from "../../js/sidebar-service";

let productService = new ProductService();
let sideBarService = new SideBarService();

function warnMessage(){
    swal({
        title: "Please Note:",
        text: "This function is only available on mobile devices!",
        type: "warning",
    });
}
Template.barcodebutton.onCreated(function(){
    let templateObject = Template.instance();
    templateObject.mobileDevice = new ReactiveVar();

    templateObject.mobileDeviceCheck = function() {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            templateObject.mobileDevice.set(true);
        }
        else{
            templateObject.mobileDevice.set(false);
        }
    }
    templateObject.mobileDeviceCheck();


    templateObject.getAllGlobalSearch = function (searchName) {
        $('.fullScreenSpin').css('display', 'inline-block');

        function checkStockColor() {
            $('td.colTransStatus').each(function () {
                if ($(this).text() == "Processed") {
                    $(this).addClass('isProcessedColumn');
                } else if ($(this).text() == "On Hold") {
                    $(this).addClass('isOnHoldColumn');
                }

            });
        };



        if (searchName.length <= 2) {
            productService.getGlobalSearchReport(searchName).then(function (data) {
                let dataSelectID = '';
                let isProcessed = '';
                var splashArrayList = new Array();
                var splashArrayListDupp = new Array();
                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function () {
                    $('#tblSearchOverview_filter .form-control-sm').val(searchName);
                }, 200);
                let dataTableList = [];
                let dataTableListDupp = [];
                for (let i = 0; i < data.tglobalsearchreport.length; i++) {
                    if (data.tglobalsearchreport[i].Type === "Purchase Order") {
                        dataSelectID = data.tglobalsearchreport[i].PurchaseOrderID;
                    } else if (data.tglobalsearchreport[i].Type === "Bill") {
                        dataSelectID = data.tglobalsearchreport[i].PurchaseOrderID;
                    } else if (data.tglobalsearchreport[i].Type === "Credit") {
                        dataSelectID = data.tglobalsearchreport[i].PurchaseOrderID;
                    } else if (data.tglobalsearchreport[i].Type === "Customer Payment") {
                        dataSelectID = data.tglobalsearchreport[i].PaymentID;
                    } else if (data.tglobalsearchreport[i].Type === "Supplier Payment") {
                        dataSelectID = data.tglobalsearchreport[i].PaymentID;
                    } else if (data.tglobalsearchreport[i].Type === "Invoice") {
                        dataSelectID = data.tglobalsearchreport[i].SaleID;
                    } else if (data.tglobalsearchreport[i].Type === "PO") {
                        dataSelectID = data.tglobalsearchreport[i].PurchaseOrderID;
                    } else if (data.tglobalsearchreport[i].Type === "Cheque") {
                        dataSelectID = data.tglobalsearchreport[i].PurchaseOrderID;
                    } else if (data.tglobalsearchreport[i].Type === "Customer") {
                        dataSelectID = data.tglobalsearchreport[i].ClientId;
                    } else if (data.tglobalsearchreport[i].Type === "Sales Order") {
                        dataSelectID = data.tglobalsearchreport[i].SaleID;
                    } else if (data.tglobalsearchreport[i].Type === "Quote") {
                        dataSelectID = data.tglobalsearchreport[i].SaleID;
                    } else if (data.tglobalsearchreport[i].Type === "Employee") {
                        dataSelectID = data.tglobalsearchreport[i].ID;
                    } else if (data.tglobalsearchreport[i].Type === "Product") {
                        dataSelectID = data.tglobalsearchreport[i].PartsID;
                    } else if (data.tglobalsearchreport[i].Type === "Refund") {
                        dataSelectID = data.tglobalsearchreport[i].SaleID;
                    } else if (data.tglobalsearchreport[i].Type === "INV-BO") {
                        dataSelectID = data.tglobalsearchreport[i].SaleID;
                    } else if (data.tglobalsearchreport[i].Type === "Account") {
                        dataSelectID = data.tglobalsearchreport[i].AccountsID;
                    } else if (data.tglobalsearchreport[i].Type === "Stock Adjustment") {
                        dataSelectID = data.tglobalsearchreport[i].StockAdjustID;
                        if (data.tglobalsearchreport[i].IsProcessed) {
                            isProcessed = "Processed";
                        } else {
                            isProcessed = "On Hold";
                        }
                    } else if (data.tglobalsearchreport[i].Type === "Stock Transfer") {
                        dataSelectID = data.tglobalsearchreport[i].TransId;
                        if (data.tglobalsearchreport[i].IsProcessed) {
                            isProcessed = "Processed";
                        } else {
                            isProcessed = "On Hold";
                        }
                    } else {
                        dataSelectID = data.tglobalsearchreport[i].ID;
                    }
                    var dataList = {
                        catg: data.tglobalsearchreport[i].Catg || '',
                        catgdesc: data.tglobalsearchreport[i].Catgdesc || '',
                        ClientId: data.tglobalsearchreport[i].ClientId || '',
                        id: dataSelectID || '',
                        type: data.tglobalsearchreport[i].Type || '',
                        company: data.tglobalsearchreport[i].Company || '',
                        globalref: data.tglobalsearchreport[i].Globalref || '',
                        transDate: data.tglobalsearchreport[i].TransDate != '' ? moment(data.tglobalsearchreport[i].TransDate).format("YYYY/MM/DD") : data.tglobalsearchreport[i].TransDate,
                        transId: data.tglobalsearchreport[i].TransId || '',
                        saleID: data.tglobalsearchreport[i].SaleID || '',
                        purchaseOrderID: data.tglobalsearchreport[i].PurchaseOrderID || '',
                        paymentID: data.tglobalsearchreport[i].PaymentID || '',
                        prepaymentID: data.tglobalsearchreport[i].PrepaymentID || '',
                        fixedAssetID: data.tglobalsearchreport[i].FixedAssetID || '',
                        partsID: data.tglobalsearchreport[i].PartsID || ''

                    };

                    var dataListNew = [
                        dataSelectID || '',
                        data.tglobalsearchreport[i].Company || '',
                        data.tglobalsearchreport[i].Type || '',
                        data.tglobalsearchreport[i].Globalref || '',
                        isProcessed

                    ];
                    //if(dataSelectID != ""){
                    dataTableList.push(dataList);
                    splashArrayList.push(dataListNew);
                    //}
                }



                setTimeout(function () {
                    $('#searchPOP').modal('toggle');

                    $('#tblSearchOverview').DataTable({
                        data: splashArrayList,
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        paging: true,
                        "aaSorting": [],
                        "orderMulti": true,
                        columnDefs: [{
                            className: "colId",
                            "targets": [0]
                        },
                            {
                                className: "colName",
                                "targets": [1]
                            },
                            {
                                className: "colType",
                                "targets": [2]
                            },
                            {
                                className: "colTransGlobal",
                                "targets": [3]
                            },
                            {
                                className: "colTransStatus",
                                "targets": [4]
                            }

                        ],
                        rowId: 0,
                        select: true,
                        destroy: true,
                        // colReorder: true,
                        colReorder: {
                            fixedColumnsLeft: 1
                        },

                        pageLength: initialReportDatatableLoad,
                        lengthMenu: [
                            [initialReportDatatableLoad, -1],
                            [initialReportDatatableLoad, "All"]
                        ],
                        info: true,
                        responsive: true,
                        language: { search: "", searchPlaceholder: "Search List..." },
                        "fnDrawCallback": function (oSettings) {
                            var searchDataValue = $('.txtGlobalSearch').val().toLowerCase();
                            $('#tblSearchOverview_wrapper .paginate_button.page-item').removeClass('disabled');
                            $('#tblSearchOverview_ellipsis').addClass('disabled');
                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {
                                    $('#tblSearchOverview_wrapper .paginate_button.page-item.previous').addClass('disabled');
                                    $('#tblSearchOverview_wrapper .paginate_button.page-item.next').addClass('disabled');
                                }
                            } else {

                            }
                            if (oSettings.fnRecordsDisplay() < initialReportLoad) {
                                $('#tblSearchOverview_wrapper .paginate_button.page-item.next').addClass('disabled');
                            }
                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                .on('click', function () {
                                    $('.fullScreenSpin').css('display', 'inline-block');
                                    let dataLenght = oSettings._iDisplayLength;


                                    sideBarService.getGlobalSearchReport(searchDataValue, initialReportLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                        // templateObject.resetData(objCombineData);
                                        let dataOld = splashArrayList;
                                        for (let i = 0; i < dataObjectnew.tglobalsearchreport.length; i++) {
                                            if (dataObjectnew.tglobalsearchreport[i].Type === "Purchase Order") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].PurchaseOrderID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Bill") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].PurchaseOrderID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Credit") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].PurchaseOrderID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Customer Payment") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].PaymentID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Supplier Payment") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].PaymentID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Invoice") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].SaleID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "PO") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].PurchaseOrderID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Cheque") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].PurchaseOrderID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Customer") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].ClientId;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Sales Order") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].SaleID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Quote") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].SaleID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Employee") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].ID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Product") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].PartsID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Refund") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].SaleID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "INV-BO") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].SaleID;
                                            } else if (dataObjectnew.tglobalsearchreport[i].Type === "Account") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].AccountsID;
                                            } else if (data.tglobalsearchreport[i].Type === "Stock Adjustment") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].StockAdjustID;
                                                if (data.tglobalsearchreport[i].IsProcessed) {
                                                    isProcessed = "Processed";
                                                } else {
                                                    isProcessed = "On Hold";
                                                }
                                            } else if (data.tglobalsearchreport[i].Type === "Stock Transfer") {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].TransId;
                                                if (data.tglobalsearchreport[i].IsProcessed) {
                                                    isProcessed = "Processed";
                                                } else {
                                                    isProcessed = "On Hold";
                                                }
                                            } else {
                                                dataSelectID = dataObjectnew.tglobalsearchreport[i].ID;
                                            }
                                            var dataListDupp = {
                                                catg: dataObjectnew.tglobalsearchreport[i].Catg || '',
                                                catgdesc: dataObjectnew.tglobalsearchreport[i].Catgdesc || '',
                                                ClientId: dataObjectnew.tglobalsearchreport[i].ClientId || '',
                                                id: dataSelectID || '',
                                                type: dataObjectnew.tglobalsearchreport[i].Type || '',
                                                company: dataObjectnew.tglobalsearchreport[i].Company || '',
                                                globalref: dataObjectnew.tglobalsearchreport[i].Globalref || '',
                                                transDate: dataObjectnew.tglobalsearchreport[i].TransDate != '' ? moment(dataObjectnew.tglobalsearchreport[i].TransDate).format("YYYY/MM/DD") : dataObjectnew.tglobalsearchreport[i].TransDate,
                                                transId: dataObjectnew.tglobalsearchreport[i].TransId || '',
                                                saleID: dataObjectnew.tglobalsearchreport[i].SaleID || '',
                                                purchaseOrderID: dataObjectnew.tglobalsearchreport[i].PurchaseOrderID || '',
                                                paymentID: dataObjectnew.tglobalsearchreport[i].PaymentID || '',
                                                prepaymentID: dataObjectnew.tglobalsearchreport[i].PrepaymentID || '',
                                                fixedAssetID: dataObjectnew.tglobalsearchreport[i].FixedAssetID || '',
                                                partsID: dataObjectnew.tglobalsearchreport[i].PartsID || ''

                                            };

                                            var dataListNewDupp = [
                                                dataSelectID || '',
                                                dataObjectnew.tglobalsearchreport[i].Company || '',
                                                dataObjectnew.tglobalsearchreport[i].Type || '',
                                                dataObjectnew.tglobalsearchreport[i].Globalref || '',
                                                isProcessed

                                            ];
                                            dataTableListDupp.push(dataListDupp);
                                            splashArrayListDupp.push(dataListNewDupp);
                                        }
                                        var thirdaryData = $.merge($.merge([], splashArrayListDupp), splashArrayList);
                                        let uniqueChars = [...new Set(thirdaryData)];
                                        var datatable = $('#tblSearchOverview').DataTable();
                                        datatable.clear();
                                        datatable.rows.add(uniqueChars);
                                        datatable.draw(false);
                                        // let objCombineData = {
                                        //   tglobalsearchreport:thirdaryData
                                        // }
                                        $('.fullScreenSpin').css('display', 'none');

                                    }).catch(function (err) {
                                        $('.fullScreenSpin').css('display', 'none');
                                    });

                                });
                            setTimeout(function () {
                                checkStockColor();
                            }, 100);
                        }

                    }).on('page', function () {

                    });
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                }, 0);

                $('#tblSearchOverview tbody').on('click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    var transactiontype = $(event.target).closest("tr").find(".colType").text();
                    if ((listData) && (transactiontype)) {
                        if (transactiontype === 'Purchase Order') {
                            window.open('/purchaseordercard?id=' + listData, '_self');
                        } else if (transactiontype === 'Bill') {
                            window.open('/billcard?id=' + listData, '_self');
                        } else if (transactiontype === 'Credit') {
                            window.open('/creditcard?id=' + listData, '_self');
                        } else if (transactiontype === 'Customer Payment') {
                            window.open('/paymentcard?id=' + listData, '_self');
                        } else if (transactiontype === 'Supplier Payment') {
                            window.open('/supplierpaymentcard?id=' + listData, '_self');
                        } else if (transactiontype === 'Invoice') {
                            window.open('/invoicecard?id=' + listData, '_self');
                        } else if (transactiontype === 'PO') {
                            window.open('/purchaseordercard?id=' + listData, '_self');
                        } else if (transactiontype === 'Cheque') {
                            window.open('/chequecard?id=' + listData, '_self');
                        } else if (transactiontype === 'Customer') {
                            window.open('/customerscard?id=' + listData, '_self');
                        } else if (transactiontype === 'Sales Order') {
                            window.open('/salesordercard?id=' + listData, '_self');
                        } else if (transactiontype === 'Quote') {
                            window.open('/quotecard?id=' + listData, '_self');
                        } else if (transactiontype === 'Employee') {
                            window.open('/employeescard?id=' + listData, '_self');
                        } else if (transactiontype === 'Product') {
                            window.open('/productview?id=' + listData, '_self');
                        } else if (transactiontype === 'Refund') {
                            window.open('/refundcard?id=' + listData, '_self');
                        } else if (transactiontype === 'INV-BO') {
                            window.open('/invoicecard?id=' + listData, '_self');
                        } else if (transactiontype === 'Account') {
                            window.open('/accountsoverview?id=' + listData, '_self');
                        } else if (transactiontype === 'Stock Adjustment') {
                            window.open('/stockadjustmentcard?id=' + listData, '_self');
                        } else if (transactiontype === 'Stock Transfer') {
                            window.open('/stocktransfercard?id=' + listData, '_self');
                        } else {

                        }

                    }


                });


            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            var barcode = searchName.toUpperCase();
            var segs = barcode.split('-');
            if (segs[0] == Barcode_Prefix_Sale) {
                var sales_ID = segs[1];
                var erpGet = erpDb();
                var oReqSID = new XMLHttpRequest();
                oReqSID.open("GET", 'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/SaleGroup?SaleID=' + sales_ID, true);
                oReqSID.setRequestHeader("database", erpGet.ERPDatabase);
                oReqSID.setRequestHeader("username", erpGet.ERPUsername);
                oReqSID.setRequestHeader("password", erpGet.ERPPassword);
                oReqSID.send();

                oReqSID.timeout = 30000;
                oReqSID.onreadystatechange = function () {
                    if (oReqSID.readyState == 4 && oReqSID.status == 200) {
                        var dataListRet = JSON.parse(oReqSID.responseText)
                        for (var event in dataListRet) {
                            var dataCopy = dataListRet[event];
                            for (var data in dataCopy) {
                                var mainData = dataCopy[data];
                                var salesType = mainData.TransactionType;
                                var salesID = mainData.SaleID;
                            }
                        }
                        if (salesType == "Invoice") {
                            window.open('/shippingdocket?id=' + salesID, '_self');
                        } else {
                            $('.fullScreenSpin').css('display', 'none');

                            swal('No record with that exact number "' + barcode + '"', '', 'warning');
                            DangerSound();
                            e.preventDefault();
                        }


                    }

                    AddUERP(oReqSID.responseText);
                }


            } else if (segs[0] == Barcode_Prefix_SalesLine) {
                var salesLine_ID = segs[1];
                var erpGet = erpDb();
                var oReqSLineID = new XMLHttpRequest();
                oReqSLineID.open("GET", 'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/SaleGroup?SaleLineID=' + salesLine_ID, true);
                oReqSLineID.setRequestHeader("database", erpGet.ERPDatabase);
                oReqSLineID.setRequestHeader("username", erpGet.ERPUsername);
                oReqSLineID.setRequestHeader("password", erpGet.ERPPassword);
                oReqSLineID.send();

                oReqSLineID.timeout = 30000;
                oReqSLineID.onreadystatechange = function () {
                    if (oReqSLineID.readyState == 4 && oReqSLineID.status == 200) {
                        var dataListRet = JSON.parse(oReqSLineID.responseText)
                        for (var event in dataListRet) {
                            var dataCopy = dataListRet[event];
                            for (var data in dataCopy) {
                                var mainData = dataCopy[data];
                                var salesType = mainData.TransactionType;
                                var salesID = mainData.SaleID;
                            }
                        }
                        if (salesType == "Invoice") {
                            window.open('/shippingdocket?id=' + salesID, '_self');

                        } else {
                            $('.fullScreenSpin').css('display', 'none');
                            swal('No record with that exact number "' + barcode + '"', '', 'warning');
                            e.preventDefault();
                        }


                    }

                    AddUERP(oReqSID.responseText);
                }



            } else if (segs[0] == Barcode_Prefix_StockTransfer) {
                productService.getGlobalSearchReportByType(segs[1], "Stock Transfer").then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    if (data.tglobalsearchreport.length > 0) {
                        for (let i = 0; i < data.tglobalsearchreport.length; i++) {
                            if (data.tglobalsearchreport[i].Type === "Stock Transfer") {
                                dataSelectID = segs[1] || data.tglobalsearchreport[i].TransId || '';
                                if (dataSelectID != '') {
                                    window.open('/stocktransfercard?id=' + dataSelectID, '_self');
                                } else {
                                    swal('No record with that exact number "' + barcode + '"', '', 'warning');
                                }
                            } else {
                                swal('No record with that exact number "' + barcode + '"', '', 'warning');
                                $('.fullScreenSpin').css('display', 'none');
                            }
                        }
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_StockAdjust) {

                productService.getGlobalSearchStockAdjust(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.tstockadjustentry.length > 0) {
                        window.open('/stockadjustmentcard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_Employee) {

                productService.getGlobalSearchEmployee(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.temployee.length > 0) {
                        window.open('/employeescard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_Invoice || segs[0] == Barcode_Prefix_Invoice2) {
                productService.getGlobalSearchReportByType(segs[1], "Invoice").then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    if (data.tglobalsearchreport.length > 0) {
                        for (let i = 0; i < data.tglobalsearchreport.length; i++) {
                            if (data.tglobalsearchreport[i].Type === "Invoice") {
                                dataSelectID = data.tglobalsearchreport[i].TransId || '';
                                if (dataSelectID != '' && dataSelectID == segs[1]) {
                                    window.open('/invoicecard?id=' + dataSelectID, '_self');
                                }
                            } else {
                                swal('No record with that exact number "' + barcode + '"', '', 'warning');
                                $('.fullScreenSpin').css('display', 'none');
                            }
                        }
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                    }
                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_SalesOrder) {
                productService.getGlobalSearchReportByType(segs[1], "Sales Order").then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    if (data.tglobalsearchreport.length > 0) {
                        for (let i = 0; i < data.tglobalsearchreport.length; i++) {
                            if (data.tglobalsearchreport[i].Type === "Sales Order") {
                                dataSelectID = data.tglobalsearchreport[i].TransId || '';
                                if (dataSelectID != '' && dataSelectID == segs[1]) {
                                    window.open('/salesordercard?id=' + dataSelectID, '_self');
                                }
                            } else {
                                swal('No record with that exact number "' + barcode + '"', '', 'warning');
                                $('.fullScreenSpin').css('display', 'none');
                            }
                        }
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                    }
                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_Quote) {
                productService.getGlobalSearchReportByType(segs[1], "Quote").then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    if (data.tglobalsearchreport.length > 0) {
                        for (let i = 0; i < data.tglobalsearchreport.length; i++) {
                            if (data.tglobalsearchreport[i].Type === "Quote") {
                                dataSelectID = data.tglobalsearchreport[i].TransId || '';
                                if (dataSelectID != '' && dataSelectID == segs[1]) {
                                    window.open('/quotecard?id=' + dataSelectID, '_self');
                                } else {
                                    swal('No record with that exact number "' + barcode + '"', '', 'warning');
                                    $('.fullScreenSpin').css('display', 'none');
                                }
                            } else {
                                swal('No record with that exact number "' + barcode + '"', '', 'warning');
                                $('.fullScreenSpin').css('display', 'none');
                            }
                        }
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                    }
                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });

            } else if (segs[0] == Barcode_Prefix_Refund) {

                productService.getGlobalSearchRefund(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.trefundsale.length > 0) {
                        window.open('/refundcard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_Payment) {
                /*productService.getGlobalSearchReportByType(segs[1], "General Ledger").then(function(data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    for (let i = 0; i < data.tglobalsearchreport.length; i++) {
                        if (data.tglobalsearchreport[i].Type === "Customer Payment") {
                            dataSelectID = data.tglobalsearchreport[i].TransId || '';
                            if(dataSelectID != ''){
                              window.open('/paymentcard?id=' + dataSelectID, '_self');
                            }
                        }else if (data.tglobalsearchreport[i].Type === "Supplier Payment") {
                            dataSelectID = data.tglobalsearchreport[i].TransId || '';
                            if(dataSelectID != ''){
                              window.open('/supplierpaymentcard?id=' + dataSelectID, '_self');
                            }
                        } else {
                          $('.fullScreenSpin').css('display', 'none');
                        }
                    }

                }).catch(function(err) {
                    $('.fullScreenSpin').css('display', 'none');
                }); */

                productService.getGlobalSearchPayment(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.tpaymentlist.length > 0) {
                        for (let i = 0; i < data.tpaymentlist.length; i++) {
                            if (data.tpaymentlist[i].TYPE == "Customer Payment" && data.tpaymentlist[i].PaymentID == dataSelectID) {
                                window.open('/paymentcard?id=' + dataSelectID, '_self');
                            } else if (data.tpaymentlist[i].TYPE == "Supplier Payment" && data.tpaymentlist[i].PaymentID == dataSelectID) {
                                window.open('/supplierpaymentcard?id=' + dataSelectID, '_self');
                            } else {
                                //window.open('/paymentoverview', '_self');
                                swal('No record with that exact number "' + barcode + '"', '', 'warning');
                            }
                        }

                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_Bill) {

                productService.getGlobalSearchBill(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.tbillex.length > 0) {
                        window.open('/billcard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_PurchaseOrder) {

                productService.getGlobalSearchPO(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.tpurchaseorderex.length > 0) {
                        window.open('/purchaseordercard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_Journal) {

                productService.getGlobalSearchJournalEntry(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.tjournalentry.length > 0) {
                        window.open('/journalentrycard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_TimeSheet) {
                productService.getGlobalSearchTimeSheet(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.ttimesheet.length > 0) {
                        window.open('/timesheet?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_Customer) {

                productService.getGlobalSearchCustomer(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.tcustomervs1.length > 0) {
                        window.open('/customerscard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_Supplier) {
                productService.getGlobalSearchSupplier(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.tsuppliervs1.length > 0) {
                        window.open('/supplierscard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_Product) {
                productService.getGlobalSearchProduct(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.tproductvs1.length > 0) {
                        window.open('/productview?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_Account) {
                productService.getGlobalSearchAccount(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.taccountvs1.length > 0) {
                        window.open('/accountsoverview?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_Check) {
                productService.getGlobalSearchCheck(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.tchequeex.length > 0) {
                        window.open('/chequecard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] == Barcode_Prefix_Shipping) {
                productService.getGlobalSearchShipping(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    dataSelectID = segs[1] || '';
                    if (data.tinvoice.length > 0) {
                        window.open('/shippingdocket?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] === Barcode_Prefix_Appointment) {
                productService.getGlobalSearchAppointment(segs[1]).then(function (data) {//Done Vladyslav
                    let dataSelectID = '';
                    $('.fullScreenSpin').css('display', 'none');
                    dataSelectID = segs[1] || '';
                    if (data.tappointmentex.length > 0) {
                        window.open('/appointmentlist?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] === Barcode_Prefix_Credit) {//Done Vladyslav
                productService.getGlobalSearchCredit(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    $('.fullScreenSpin').css('display', 'none');
                    dataSelectID = segs[1] || '';
                    if (data.tcreditlist.length > 0) {
                        window.open('/creditcard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] === Barcode_Prefix_CRM) {
                productService.getGlobalSearchCRM(segs[1]).then(function (data) {//
                    let dataSelectID = '';
                    $('.fullScreenSpin').css('display', 'none');
                    dataSelectID = segs[1] || '';
                    if (data.tprojecttaskslist.length > 0) {
                        window.open('/crmoverview?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] === Barcode_Prefix_Deposit) {//Done Vladyslav
                productService.getGlobalSearchDeposit(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    $('.fullScreenSpin').css('display', 'none');
                    dataSelectID = segs[1] || '';
                    if (data.tbankdepositlist.length > 0) {
                        window.open('/depositcard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] === Barcode_Prefix_FixedAsset) {//Done Vladyslav
                productService.getGlobalSearchFixedAssets(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    $('.fullScreenSpin').css('display', 'none');
                    dataSelectID = segs[1] || '';
                    if (data.tfixedassets.length > 0) {
                        window.open('/fixedassetcard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });

            } else if (segs[0] === Barcode_Prefix_ReceiptClaim) {
                productService.getGlobalSearchReceiptClaims(segs[1]).then(function (data) {// DONE Vladyslav
                    let dataSelectID = '';
                    $('.fullScreenSpin').css('display', 'none');
                    dataSelectID = segs[1] || '';
                    if (data.texpenseclaimlist.length > 0) {
                        window.open('/receiptsoverview?id='+dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] === Barcode_Prefix_Task) {
                productService.getGlobalSearchTasks(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    $('.fullScreenSpin').css('display', 'none');
                    dataSelectID = segs[1] || '';
                    if (data.tprojecttaskslist.length > 0) {
                        window.open('/crmoverview?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });

            } else if (segs[0] === Barcode_Prefix_WorkOrder) {
                productService.getGlobalSearchWorkOrders(segs[1]).then(function (data) {
                    let dataSelectID = '';
                    $('.fullScreenSpin').css('display', 'none');
                    dataSelectID = segs[1] || '';
                    if (data.tworkorderlist.length > 0) {
                        window.open('/workordercard?id=' + dataSelectID, '_self');
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                    }

                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });

            } else if (segs[0] === Barcode_Prefix_Serial) {
                sideBarService.getAllSerialNumber().then(async function (data) {
                    await addVS1Data('TSerialNumberListCurrentReport', JSON.stringify(data));
                    $('.fullScreenSpin').css('display', 'none');
                    for (let i = 0; i < data.tserialnumberlistcurrentreport.length; i++) {
                        if(data.tserialnumberlistcurrentreport[i].SerialNumber == segs[1]){
                            window.open('/serialnumberlist?sn=' + segs[1], '_self');
                        }
                    }
                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (segs[0] === Barcode_Prefix_LOT) {
                productService.getProductBatches().then(async function (data) {
                    await addVS1Data('TProductBatches', JSON.stringify(data));
                    $('.fullScreenSpin').css('display', 'none');
                    for (let i = 0; i < data.tproductbatches.length; i++) {
                        if(data.tproductbatches[i].Batchno == segs[1]){
                            window.open('/lotnumberlist?ln=' + segs[1], '_self');
                        }
                    }
                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                productService.getGlobalSearchReport(searchName).then(function (data) {
                    let dataSelectID = '';
                    let isProcessed = '';
                    var splashArrayList = new Array();
                    var splashArrayListDupp = new Array();
                    $('.fullScreenSpin').css('display', 'none');
                    setTimeout(function () {
                        $('#tblSearchOverview_filter .form-control-sm').val(searchName);
                    }, 200);
                    let dataTableList = [];
                    let dataTableListDupp = [];
                    if (data.tglobalsearchreport.length > 0) {
                        for (let i = 0; i < data.tglobalsearchreport.length; i++) {
                            if (data.tglobalsearchreport[i].Type === "Purchase Order") {
                                dataSelectID = data.tglobalsearchreport[i].PurchaseOrderID;
                            } else if (data.tglobalsearchreport[i].Type === "Bill") {
                                dataSelectID = data.tglobalsearchreport[i].PurchaseOrderID;
                            } else if (data.tglobalsearchreport[i].Type === "Credit") {
                                dataSelectID = data.tglobalsearchreport[i].PurchaseOrderID;
                            } else if (data.tglobalsearchreport[i].Type === "Customer Payment") {
                                dataSelectID = data.tglobalsearchreport[i].PaymentID;
                            } else if (data.tglobalsearchreport[i].Type === "Supplier Payment") {
                                dataSelectID = data.tglobalsearchreport[i].PaymentID;
                            } else if (data.tglobalsearchreport[i].Type === "Invoice") {
                                dataSelectID = data.tglobalsearchreport[i].SaleID;
                            } else if (data.tglobalsearchreport[i].Type === "PO") {
                                dataSelectID = data.tglobalsearchreport[i].PurchaseOrderID;
                            } else if (data.tglobalsearchreport[i].Type === "Cheque") {
                                dataSelectID = data.tglobalsearchreport[i].PurchaseOrderID;
                            } else if (data.tglobalsearchreport[i].Type === "Customer") {
                                dataSelectID = data.tglobalsearchreport[i].ClientId;
                            } else if (data.tglobalsearchreport[i].Type === "Sales Order") {
                                dataSelectID = data.tglobalsearchreport[i].SaleID;
                            } else if (data.tglobalsearchreport[i].Type === "Quote") {
                                dataSelectID = data.tglobalsearchreport[i].SaleID;
                            } else if (data.tglobalsearchreport[i].Type === "Employee") {
                                dataSelectID = data.tglobalsearchreport[i].ID;
                            } else if (data.tglobalsearchreport[i].Type === "Product") {
                                dataSelectID = data.tglobalsearchreport[i].PartsID;
                            } else if (data.tglobalsearchreport[i].Type === "Refund") {
                                dataSelectID = data.tglobalsearchreport[i].SaleID;
                            } else if (data.tglobalsearchreport[i].Type === "INV-BO") {
                                dataSelectID = data.tglobalsearchreport[i].SaleID;
                            } else if (data.tglobalsearchreport[i].Type === "Account") {
                                dataSelectID = data.tglobalsearchreport[i].AccountsID;
                            } else if (data.tglobalsearchreport[i].Type === "Stock Adjustment") {
                                dataSelectID = data.tglobalsearchreport[i].StockAdjustID;
                                if (data.tglobalsearchreport[i].IsProcessed) {
                                    isProcessed = "Processed";
                                } else {
                                    isProcessed = "On Hold";
                                }
                            } else if (data.tglobalsearchreport[i].Type === "Stock Transfer") {
                                dataSelectID = data.tglobalsearchreport[i].TransId;
                                if (data.tglobalsearchreport[i].IsProcessed) {
                                    isProcessed = "Processed";
                                } else {
                                    isProcessed = "On Hold";
                                }
                            } else {
                                dataSelectID = data.tglobalsearchreport[i].ID;
                            }
                            var dataList = {
                                catg: data.tglobalsearchreport[i].Catg || '',
                                catgdesc: data.tglobalsearchreport[i].Catgdesc || '',
                                ClientId: data.tglobalsearchreport[i].ClientId || '',
                                id: dataSelectID || '',
                                type: data.tglobalsearchreport[i].Type || '',
                                company: data.tglobalsearchreport[i].Company || '',
                                globalref: data.tglobalsearchreport[i].Globalref || '',
                                transDate: data.tglobalsearchreport[i].TransDate != '' ? moment(data.tglobalsearchreport[i].TransDate).format("YYYY/MM/DD") : data.tglobalsearchreport[i].TransDate,
                                transId: data.tglobalsearchreport[i].TransId || '',
                                saleID: data.tglobalsearchreport[i].SaleID || '',
                                purchaseOrderID: data.tglobalsearchreport[i].PurchaseOrderID || '',
                                paymentID: data.tglobalsearchreport[i].PaymentID || '',
                                prepaymentID: data.tglobalsearchreport[i].PrepaymentID || '',
                                fixedAssetID: data.tglobalsearchreport[i].FixedAssetID || '',
                                partsID: data.tglobalsearchreport[i].PartsID || ''

                            };

                            var dataListNew = [
                                dataSelectID || '',
                                data.tglobalsearchreport[i].Company || '',
                                data.tglobalsearchreport[i].Type || '',
                                data.tglobalsearchreport[i].Globalref || '',
                                isProcessed

                            ];
                            //if(dataSelectID != ""){
                            dataTableList.push(dataList);
                            splashArrayList.push(dataListNew);
                            //}
                        }




                        setTimeout(function () {
                            $('#searchPOP').modal('toggle');

                            $('#tblSearchOverview').DataTable({
                                data: splashArrayList,
                                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                                paging: true,
                                "aaSorting": [],
                                "orderMulti": true,
                                columnDefs: [{
                                    className: "colId",
                                    "targets": [0]
                                },
                                    {
                                        className: "colName",
                                        "targets": [1]
                                    },
                                    {
                                        className: "colType",
                                        "targets": [2]
                                    },
                                    {
                                        className: "colTransGlobal",
                                        "targets": [3]
                                    },
                                    {
                                        className: "colTransStatus",
                                        "targets": [4]
                                    }

                                ],
                                rowId: 0,
                                select: true,
                                destroy: true,
                                // colReorder: true,
                                colReorder: {
                                    fixedColumnsLeft: 1
                                },

                                pageLength: initialReportDatatableLoad,
                                lengthMenu: [
                                    [initialReportDatatableLoad, -1],
                                    [initialReportDatatableLoad, "All"]
                                ],
                                info: true,
                                responsive: true,
                                language: { search: "", searchPlaceholder: "Search List..." },
                                "fnDrawCallback": function (oSettings) {
                                    var searchDataValue = $('.txtGlobalSearch').val().toLowerCase();
                                    $('#tblSearchOverview_wrapper .paginate_button.page-item').removeClass('disabled');
                                    $('#tblSearchOverview_ellipsis').addClass('disabled');
                                    if (oSettings._iDisplayLength == -1) {
                                        if (oSettings.fnRecordsDisplay() > 150) {
                                            $('#tblSearchOverview_wrapper .paginate_button.page-item.previous').addClass('disabled');
                                            $('#tblSearchOverview_wrapper .paginate_button.page-item.next').addClass('disabled');
                                        }
                                    } else {

                                    }
                                    if (oSettings.fnRecordsDisplay() < initialReportLoad) {
                                        $('#tblSearchOverview_wrapper .paginate_button.page-item.next').addClass('disabled');
                                    }
                                    $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                        .on('click', function () {
                                            $('.fullScreenSpin').css('display', 'inline-block');
                                            let dataLenght = oSettings._iDisplayLength;


                                            sideBarService.getGlobalSearchReport(searchDataValue, initialReportLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {

                                                let dataOld = splashArrayList;
                                                for (let i = 0; i < dataObjectnew.tglobalsearchreport.length; i++) {
                                                    if (dataObjectnew.tglobalsearchreport[i].Type === "Purchase Order") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].PurchaseOrderID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Bill") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].PurchaseOrderID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Credit") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].PurchaseOrderID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Customer Payment") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].PaymentID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Supplier Payment") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].PaymentID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Invoice") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].SaleID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "PO") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].PurchaseOrderID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Cheque") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].PurchaseOrderID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Customer") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].ClientId;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Sales Order") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].SaleID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Quote") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].SaleID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Employee") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].ID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Product") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].PartsID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Refund") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].SaleID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "INV-BO") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].SaleID;
                                                    } else if (dataObjectnew.tglobalsearchreport[i].Type === "Account") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].AccountsID;
                                                    } else if (data.tglobalsearchreport[i].Type === "Stock Adjustment") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].StockAdjustID;
                                                        if (data.tglobalsearchreport[i].IsProcessed) {
                                                            isProcessed = "Processed";
                                                        } else {
                                                            isProcessed = "On Hold";
                                                        }
                                                    } else if (data.tglobalsearchreport[i].Type === "Stock Transfer") {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].TransId;
                                                        if (data.tglobalsearchreport[i].IsProcessed) {
                                                            isProcessed = "Processed";
                                                        } else {
                                                            isProcessed = "On Hold";
                                                        }
                                                    } else {
                                                        dataSelectID = dataObjectnew.tglobalsearchreport[i].ID;
                                                    }
                                                    var dataListDupp = {
                                                        catg: dataObjectnew.tglobalsearchreport[i].Catg || '',
                                                        catgdesc: dataObjectnew.tglobalsearchreport[i].Catgdesc || '',
                                                        ClientId: dataObjectnew.tglobalsearchreport[i].ClientId || '',
                                                        id: dataSelectID || '',
                                                        type: dataObjectnew.tglobalsearchreport[i].Type || '',
                                                        company: dataObjectnew.tglobalsearchreport[i].Company || '',
                                                        globalref: dataObjectnew.tglobalsearchreport[i].Globalref || '',
                                                        transDate: dataObjectnew.tglobalsearchreport[i].TransDate != '' ? moment(dataObjectnew.tglobalsearchreport[i].TransDate).format("YYYY/MM/DD") : dataObjectnew.tglobalsearchreport[i].TransDate,
                                                        transId: dataObjectnew.tglobalsearchreport[i].TransId || '',
                                                        saleID: dataObjectnew.tglobalsearchreport[i].SaleID || '',
                                                        purchaseOrderID: dataObjectnew.tglobalsearchreport[i].PurchaseOrderID || '',
                                                        paymentID: dataObjectnew.tglobalsearchreport[i].PaymentID || '',
                                                        prepaymentID: dataObjectnew.tglobalsearchreport[i].PrepaymentID || '',
                                                        fixedAssetID: dataObjectnew.tglobalsearchreport[i].FixedAssetID || '',
                                                        partsID: dataObjectnew.tglobalsearchreport[i].PartsID || ''

                                                    };

                                                    var dataListNewDupp = [
                                                        dataSelectID || '',
                                                        dataObjectnew.tglobalsearchreport[i].Company || '',
                                                        dataObjectnew.tglobalsearchreport[i].Type || '',
                                                        dataObjectnew.tglobalsearchreport[i].Globalref || '',
                                                        isProcessed

                                                    ];
                                                    dataTableListDupp.push(dataListDupp);
                                                    splashArrayListDupp.push(dataListNewDupp);
                                                }
                                                var thirdaryData = $.merge($.merge([], splashArrayListDupp), splashArrayList);
                                                let uniqueChars = [...new Set(thirdaryData)];
                                                var datatable = $('#tblSearchOverview').DataTable();
                                                datatable.clear();
                                                datatable.rows.add(uniqueChars);
                                                datatable.draw(false);

                                                $('.fullScreenSpin').css('display', 'none');

                                            }).catch(function (err) {
                                                $('.fullScreenSpin').css('display', 'none');
                                            });

                                        });
                                    setTimeout(function () {
                                        checkStockColor();
                                    }, 100);
                                }

                            }).on('page', function () {

                            });
                            $('div.dataTables_filter input').addClass('form-control form-control-sm');
                        }, 0);
                    } else {
                        swal('No record with that exact number "' + barcode + '"', '', 'warning');
                    }
                    $('#tblSearchOverview tbody').on('click', 'tr', function () {
                        var listData = $(this).closest('tr').attr('id');
                        var transactiontype = $(event.target).closest("tr").find(".colType").text();
                        if ((listData) && (transactiontype)) {
                            if (transactiontype === 'Purchase Order') {
                                window.open('/purchaseordercard?id=' + listData, '_self');
                            } else if (transactiontype === 'Bill') {
                                window.open('/billcard?id=' + listData, '_self');
                            } else if (transactiontype === 'Credit') {
                                window.open('/creditcard?id=' + listData, '_self');
                            } else if (transactiontype === 'Customer Payment') {
                                window.open('/paymentcard?id=' + listData, '_self');
                            } else if (transactiontype === 'Supplier Payment') {
                                window.open('/supplierpaymentcard?id=' + listData, '_self');
                            } else if (transactiontype === 'Invoice') {
                                window.open('/invoicecard?id=' + listData, '_self');
                            } else if (transactiontype === 'PO') {
                                window.open('/purchaseordercard?id=' + listData, '_self');
                            } else if (transactiontype === 'Cheque') {
                                window.open('/chequecard?id=' + listData, '_self');
                            } else if (transactiontype === 'Customer') {
                                window.open('/customerscard?id=' + listData, '_self');
                            } else if (transactiontype === 'Sales Order') {
                                window.open('/salesordercard?id=' + listData, '_self');
                            } else if (transactiontype === 'Quote') {
                                window.open('/quotecard?id=' + listData, '_self');
                            } else if (transactiontype === 'Employee') {
                                window.open('/employeescard?id=' + listData, '_self');
                            } else if (transactiontype === 'Product') {
                                window.open('/productview?id=' + listData, '_self');
                            } else if (transactiontype === 'Refund') {
                                window.open('/refundcard?id=' + listData, '_self');
                            } else if (transactiontype === 'INV-BO') {
                                window.open('/invoicecard?id=' + listData, '_self');
                            } else if (transactiontype === 'Account') {
                                window.open('/accountsoverview?id=' + listData, '_self');
                            } else if (transactiontype === 'Stock Adjustment') {
                                window.open('/stockadjustmentcard?id=' + listData, '_self');
                            } else if (transactiontype === 'Stock Transfer') {
                                window.open('/stocktransfercard?id=' + listData, '_self');
                            } else {

                            }

                        }


                    });




                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            }
        }
    };
    templateObject.receiveData = function(barcodeScanner){
        switch (templateObject.data.type) {
            case 'transaction':
                var trElement = $(`#${templateObject.data.cust_id}`);
                var tdElement = trElement.find(`.${templateObject.data.targetClass}`);
                tdElement.html(barcodeScanner);
                break;
            case 'newTransaction':
                var tdElement = $(`#${templateObject.data.targetTable} td.${templateObject.data.targetClass}:last`);
                tdElement.html(barcodeScanner);
                break;
            case 'globalSearch':
                templateObject.getAllGlobalSearch(barcodeScanner)
                break;
        }
    };
    $(document).ready(function() {
        // $('#scanProdServiceBarcodePOP').click(function(){
        //     if(templateObject.mobileDevice.get() == true) {
        //         let html5QrcodeScanner;
        //         setTimeout(function() {
        //             html5QrcodeScanner = new Html5QrcodeScanner(
        //                 `qr-reader`, {
        //                     fps: 10,
        //                     qrbox: 250,
        //                     rememberLastUsedCamera: true
        //                 });
        //             html5QrcodeScanner.render(onScanSuccess);
        //         }, 500);
        //         function onScanSuccess(decodedText, decodedResult) {
        //             var barcodeScanner = decodedText.toUpperCase();
        //             if (barcodeScanner != '') {
        //
        //                 setTimeout(function() {
        //                     $('#tblSearchOverview_filter .form-control-sm').val(barcodeScanner);
        //                 }, 200);
        //
        //                 if (html5QrcodeScanner.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
        //                     html5QrcodeScanner.pause();
        //                 }
        //
        //                 // templateObject.receiveData(barcodeScanner);
        //                 $('#scanBarcodeModal').modal('hide');
        //
        //             }
        //         }
        //         //init input element
        //         $('#scanBarcodeModalInput').val('');
        //         $('#scanBarcodeModal').modal('show');
        //     }
        //     else
        //         warnMessage();
        // });
        //Type Enter on edit element
        $('#scanBarcodeModalInput').keypress(function(event){
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == '13'){
                //Enter key passed
                let barcodeScanner = $('#scanBarcodeModalInput').val();
                templateObject.receiveData(barcodeScanner);
                $('#scanBarcodeModal').modal('hide');
            }
        });
        //Click check button manually
        $('.save_new').click(function() {
            let barcodeScanner = $('#scanBarcodeModalInput').val();
            templateObject.receiveData(barcodeScanner);
            $('#scanBarcodeModal').modal('hide');
        });
        //Click barcode button
        $(`#${templateObject.data.cust_id}.btn`).click(function() {
            if(templateObject.mobileDevice.get() == true) {
                let html5QrcodeScanner;
                setTimeout(function() {
                    html5QrcodeScanner = new Html5QrcodeScanner(
                        `qr-reader`, {
                            fps: 10,
                            qrbox: 250,
                            rememberLastUsedCamera: true
                        });
                    html5QrcodeScanner.render(onScanSuccess);
                }, 500);
                function onScanSuccess(decodedText, decodedResult) {
                    var barcodeScanner = decodedText.toUpperCase();
                    if (barcodeScanner != '') {

                        setTimeout(function() {
                            $('#tblSearchOverview_filter .form-control-sm').val(barcodeScanner);
                        }, 200);

                        if (html5QrcodeScanner.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
                            html5QrcodeScanner.pause();
                        }

                        templateObject.receiveData(barcodeScanner);
                        $('#scanBarcodeModal').modal('hide');

                    }
                }
                //init input element
                $('#scanBarcodeModalInput').val('');
                if(templateObject.data.type == "transaction") {
                    var trElement = $(`#${templateObject.data.cust_id}`);
                    var tdElement = trElement.find(`.${templateObject.data.targetClass}`);
                    $('#scanBarcodeModalInput').val(tdElement.val());
                }

                $('#scanBarcodeModal').modal('show');
            }
            else
                warnMessage();
        });
    });
});
Template.barcodebutton.onRendered(function(){

});
Template.barcodebutton.events({

});

Template.barcodebutton.helpers({

});

Template.registerHelper("equals", function (a, b) {
    return a === b;
});
