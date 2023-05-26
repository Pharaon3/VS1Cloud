import "../../../lib/global/indexdbstorage";
import { CRMService } from "../../../crm/crm-service";

import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './deliveryoverviewcards.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let crmService = new CRMService();

Template.deliveryoverviewcards.onCreated(function () {
  let templateObject = Template.instance();
});

Template.deliveryoverviewcards.onRendered(function () {
  let templateObject = Template.instance();

  templateObject.getInitialAllTaskList = function () {
    $(".total_cost").text("$6483");
    $(".fuel_cost").text("$5583");
    $(".service_cost").text("$1103");
  };

  templateObject.getAllTaskList = function () {    
    $(".total_cost").text("$6483");
    $(".fuel_cost").text("$5583");
    $(".service_cost").text("$1103");
  };

  templateObject.getInitialAllTaskList();

  templateObject.getInitTProjectList = function () {
  };

  templateObject.getTProjectList = function () {
    
  };

  templateObject.getInitTProjectList();

})

Template.deliveryoverviewcards.events({

  "click .total_cost .card-body": function (e) {
    
  },

  "click .fuel_cost .card-body": function (e) {
  },

  "click .service_cost .card-body": function (e) {
    
  },

});
