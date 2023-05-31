import { ReactiveVar } from 'meteor/reactive-var';
import { ProductService } from '../product/product-service';
import { UtilityService } from '../utility-service';
import '../lib/global/indexdbstorage.js';
import { SideBarService } from '../js/sidebar-service';

// import { Calendar, formatDate } from "@fullcalendar/core";
// import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
// import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import listPlugin from "@fullcalendar/list";
// import bootstrapPlugin from "@fullcalendar/bootstrap";
import { ManufacturingService } from '../manufacture/manufacturing-service';
// import commonStyles from '@fullcalendar/common/main.css';
// import dayGridStyles from '@fullcalendar/daygrid/main.css';
// import timelineStyles from '@fullcalendar/timeline/main.css';
// import resourceTimelineStyles from '@fullcalendar/resource-timeline/main.css';
// import 'jQuery.print/jQuery.print.js';
import { Template } from 'meteor/templating';
import './manufacturing_dashboard.html';
import './production_planner_template/planner_template';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
// import { cloneDeep } from 'lodash';


let sideBarService = new SideBarService();
let manufacturingService = new ManufacturingService();

Template.manufacturingoverview.onCreated(function(){
    const templateObject = Template.instance();    
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.getDataTableList = function(data){

        // let cur_date = new Date();
        // let show_bom_temp = `<button class="btn btn-primary btnShowBOM" id="btnShowBOM"><i class="fa fa-eye" style="padding-right: 8px;"></i>Show BOM </button>`;
        let linestatus;     
        if(data.Deleted == true){
            linestatus = "Deleted";
          }
       
        let dataList = [
            data.fields.ID ,
            data.fields.SaleID || '',
            data.fields.Customer || '',
            data.fields.PONumber || '',
            data.fields.SaleDate || '',
            data.fields.DueDate || '',
            data.fields.ProductName || '',
            data.fields.Quantity || '',
            data.fields.Comment || '',
            linestatus
           
        ];

        return dataList;
      }

    let headerStructure = [
        { index: 0, label: "ID", class: "colID", width: "30", active: false, display: true },
        { index: 1, label: "SalesOrderID", class: "colOrderNumber", width: "100", active: true, display: true },
        { index: 2, label: "Customer", class: "colCustomer", width: "200", active: true, display: true },
        { index: 3, label: "PO Number", class: "colPONumber", width: "100", active: true, display: true },
        { index: 4, label: "Sale Date", class: "colSaleDate", width: "200", active: true, display: true },
        { index: 5, label: "Due Date", class: "colDueDate", width: "200", active: true, display: true },
        { index: 6, label: "Product", class: "colProductName", width: "200", active: true, display: true },
        { index: 7, label: "Amount", class: "colAmount", width: "110", active: true, display: true },
        { index: 8, label: "Comments", class: "colComment", width: "500", active: true, display: true },      
        { index: 9, label: 'Status', class: 'colStatus', active: true, display: true, width: "120" },  
    ];
    templateObject.tableheaderrecords.set(headerStructure)
})

Template.manufacturingoverview.onRendered(function(){
    $('.production_planner_chart .charts .draggable-panel').css('display', 'block !important')
    let html = '<button class="btn btn-primary btn-toplanner" style="margin-right: 20px">To Production Planner</button>';
    $('.mfgplannerchartheader .dropdown.no-arrow').prepend(html)
})

Template.manufacturingoverview.events({
    'click .btn-toplanner': function(e) {
        FlowRouter.go('/productionplanner')
    },

    'click #tblWorkorderList tbody tr': function(event) {
        let workorderid = $(event.target).closest('tr').find('.colID').text();
        FlowRouter.go('/workordercard?id='+workorderid)
    }

})

Template.manufacturingoverview.helpers({
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    datahandler: function () {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    apiFunction:function() {
        let manufacturingService = new ManufacturingService();
        return manufacturingService.getWorkOrder
    },

    searchAPI: function() {
        
        let manufacturingService = new ManufacturingService();
        return manufacturingService.getOneWorkOrderByCustomer
    },

    service: ()=>{
        let manufacturingService = new ManufacturingService();
        return manufacturingService;

    },

    exDataHandler: function() {
        let templateObject = Template.instance();
        return function(data) {
            let dataReturn =  templateObject.getDataTableList(data)
            return dataReturn
        }
    },

    apiParams: function() {
        return ['limitCount', 'limitFrom'];
    },

})