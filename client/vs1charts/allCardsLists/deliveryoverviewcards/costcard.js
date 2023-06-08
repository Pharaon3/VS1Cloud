import { ReactiveVar } from 'meteor/reactive-var';
import { PaymentsService} from '../../../payments/payments-service';
import {UtilityService} from "../../../utility-service";
import {SideBarService} from '../../../js/sidebar-service';
import '../../../lib/global/indexdbstorage.js';

import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './costcard.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { DeliveryService } from "../../../overviews/delivery-service.js";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.costcard.onCreated(function() {
    const templateObject = Template.instance();
});

Template.costcard.onRendered(function() {
    let templateObject = Template.instance();
    let paymentService = new PaymentsService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];
    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlertOverview');
    }

    var today = moment().format('DD/MM/YYYY');
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if ((currentDate.getMonth() + 1) < 10) {
        fromDateMonth = "0" + (currentDate.getMonth() + 1);
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();


    var currentBeginDate = new Date();
    var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    let fromDateMonth2 = currentBeginDate.getMonth();
    let fromDateDay2 = currentBeginDate.getDate();
    if ((currentBeginDate.getMonth() + 1) < 10) {
        fromDateMonth2 = "0" + (currentBeginDate.getMonth() + 1);
    } else {
        fromDateMonth2 = (currentBeginDate.getMonth() + 1);
    }

    if (currentBeginDate.getDate() < 10) {
        fromDateDay2 = "0" + currentBeginDate.getDate();
    }

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
        $('td.colStatus').each(function() {
            if ($(this).text() == "Deleted") $(this).addClass('text-deleted');
            if ($(this).text() == "Reconciled") $(this).addClass('text-reconciled');
            if ($(this).text() == "Paid") $(this).addClass('text-fullyPaid');
            if ($(this).text() == "Partial Paid") $(this).addClass('text-partialPaid');
        });
    };
    
    // $(".totalCost").text("$9102.53");
    // $(".fuelCost").text("$7323.64");
    // $(".serviceCost").text("$1352.94");

});

Template.costcard.helpers({

});
