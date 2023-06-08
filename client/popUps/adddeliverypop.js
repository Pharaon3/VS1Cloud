import {
    TaxRateService
} from "../settings/settings-service";
import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    SideBarService
} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';

import {Session} from 'meteor/session';
import { Template } from 'meteor/templating';
import './adddeliverypop.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

Template.adddeliverypop.onCreated(function() {
    let templateObject = Template.instance();
    templateObject.initialWeight = new ReactiveVar();
    templateObject.initialWeightUnit = new ReactiveVar();
    templateObject.initialVolume = new ReactiveVar();
    templateObject.initialVolumeUnit = new ReactiveVar();
})

Template.adddeliverypop.onRendered(function(){})

Template.adddeliverypop.helpers({
    initialWeight:function() {
        let templateObject = Template.instance();
        let lineID = templateObject.data.custid
        if(lineID && lineID != '') {
            return $("#"+ templateObject.data.tablename + ' #'+lineID).attr('weight')
        } else {
            return ''
        }
    },
    initialWeightUnit:function() {
        let templateObject = Template.instance();
        let lineID = templateObject.data.custid
        if(lineID && lineID != '') {
            return $("#"+ templateObject.data.tablename + ' #'+lineID).attr('weightUnit')
        } else {
            return 'KG'
        }
    },
    initialVolume:function() {
        let templateObject = Template.instance();
        let lineID = templateObject.data.custid
        if(lineID && lineID != '') {
            return $("#"+ templateObject.data.tablename + ' #'+lineID).attr('volume')
        } else {
            return ''
        }
    },
    initialVolumeUnit:function() {
        let templateObject = Template.instance();
        let lineID = templateObject.data.custid
        if(lineID && lineID != '') {
        return $("#"+ templateObject.data.tablename + ' #'+lineID).attr('volumeUnit')
        }else {
            return 'CF'
        }
    }
})