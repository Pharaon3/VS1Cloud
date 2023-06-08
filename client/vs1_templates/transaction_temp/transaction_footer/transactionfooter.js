import { Template } from 'meteor/templating';
import "./transactionfooter.html";
import FxGlobalFunctions from '../../../packages/currency/FxGlobalFunctions';

Template.transactionfooter.onCreated(function() {
    let templateObject = Template.instance();
    templateObject.getWeighttokg = function (itemweight, unit) {
        if(unit.toLowerCase() == 'kg') {
            return itemweight
        } else if(unit.toLowerCase() == 'g') {
            return itemweight / 1000
        } else if(unit.toLowerCase() == 't') {
            return itemweight * 1000
        }
    }

    templateObject.getVolumetom3 = function (itemvolume, unit) {
        if(unit.toLowerCase() == 'm3') {
            return itemvolume
        } else if(unit.toLowerCase() == 'l' ) {
            return itemvolume / 1000
        } else if(unit.toLowerCase() == 'ml' || unit.toLowerCase() == 'cm3') {
            return itemvolume / 1000000
        } 
    }
});

Template.transactionfooter.onRendered(function() {
    if($('#edtSaleCustField_1').hasClass('custfieldDate') == true) {
        $('#edtSaleCustField_1').datepicker({
            showOn: 'button',
            buttonText: 'Show Date',
            buttonImageOnly: true,
            buttonImage: '/img/imgCal2.png',
            constrainInput: false,
            dateFormat: 'd/mm/yy',
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            yearRange: "-90:+10",
          });
    }
    if($('#edtSaleCustField_2').hasClass('custfieldDate') == true) {
        $('#edtSaleCustField_2').datepicker({
            showOn: 'button',
            buttonText: 'Show Date',
            buttonImageOnly: true,
            buttonImage: '/img/imgCal2.png',
            constrainInput: false,
            dateFormat: 'd/mm/yy',
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            yearRange: "-90:+10",
          });
    }
    if($('#edtSaleCustField_3').hasClass('custfieldDate') == true) {
        $('#edtSaleCustField_3').datepicker({
            showOn: 'button',
            buttonText: 'Show Date',
            buttonImageOnly: true,
            buttonImage: '/img/imgCal2.png',
            constrainInput: false,
            dateFormat: 'd/mm/yy',
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            yearRange: "-90:+10",
          });
    }
});

Template.transactionfooter.helpers({
    footerFields: ()=>{
        return Template.instance().data.footerFields;
    },
    footerButtons: ()=> {
        return Template.instance().data.footerButtons;
    },
    convertToForeignAmount: (amount) => {
        let symbol = FxGlobalFunctions.getCurrentCurrencySymbol();
        return FxGlobalFunctions.convertToForeignAmount(amount, $('#exchange_rate').val(), symbol);
    },

    getValue: (amount, quantity) => {
        if(quantity == NaN) {quantity = parseInt(quantity) || 0}
        let returnVal = parseFloat(amount)* parseFloat(quantity);
        return returnVal
    },
    
});



