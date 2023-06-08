import { Template } from 'meteor/templating';
import './addfixedassetlinepop.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

Template.addfixedassetlinepop.onCreated(function() {

})

Template.addfixedassetlinepop.onRendered(function() {
    $("#costTypeLine").editableSelect();
    

})

Template.addfixedassetlinepop.events({
    'click .btnAssetSave': function(event) {
        let fixedAsset = $("#fixedAssetLine").val();
        let costType = $("#costType").val();
    },
})

Template.addfixedassetlinepop.helpers({})
