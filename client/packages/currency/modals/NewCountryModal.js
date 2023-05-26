import { TaxRateService } from "../../../settings/settings-service";
import { ReactiveVar } from "meteor/reactive-var";
import { SideBarService } from "../../../js/sidebar-service";
import "../../../lib/global/indexdbstorage.js";
import { CountryService } from "../../../js/country-service";
import FxGlobalFunctions from "../FxGlobalFunctions";
import { Template } from 'meteor/templating';
import './NewCountryModal.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

let sideBarService = new SideBarService();
let countryService = new CountryService();

Template.newcountrymodal.onCreated(function () {

});

Template.newcountrymodal.onRendered(function () {

});

Template.newcountrymodal.events({
    'click .btnSaveCountry': function() {
        playSaveAudio();
        let countryService = new CountryService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        
        let countryName = $('#edtCountry').val() || '';
        let countryID = $('#edtcountryID').val() || 0;
        let objDetails = {};
        if (countryName === '') {
            swal('Country name cannot be blank!', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            e.preventDefault();
        }else{
            if (countryID == "") {
                objDetails = {
                    type: 'TCountries',
                    fields: {
                        Country: countryName
                    }
                };
            } else {
                objDetails = {
                    type: 'TCountries',
                    fields: {
                        ID: parseInt(countryID),
                        Country: countryName
                    }
                };
            }

            // countryService.saveCountry(objDetails).then(function(objDetails) {
            //     sideBarService.getCountries().then(function(dataUpdate) {
            //         // $('#shipvia').val(shipViaData);
            //         $('#newCountryViaModal').modal('toggle');
            //         $('.fullScreenSpin').css('display', 'none');
            //         addVS1Data('TCountries', JSON.stringify(dataUpdate)).then(function(datareturn) {
            //             $('.fullScreenSpin').css('display', 'none');
            //         }).catch(function(err) {});
            //     }).catch(function(err) {
            //         $('#newCountryViaModal').modal('toggle');
            //         $('.fullScreenSpin').css('display', 'none');
            //     });
            // }).catch(function(err) {
            //     $('.fullScreenSpin').css('display', 'none');
            //     swal({
            //         title: 'Oooops...',
            //         text: err,
            //         type: 'error',
            //         showCancelButton: false,
            //         confirmButtonText: 'Try Again'
            //     }).then((result) => {
            //         if (result.value) {
            //             // if(err === checkResponseError){window.open('/', '_self');}
            //         }
            //         else if (result.dismiss === 'cancel') {}
            //     });
            //     $('.fullScreenSpin').css('display', 'none');
            // });
            countryService.saveCountry(objDetails).then(function(result) {
                sideBarService.getCountries().then(function(dataReload) {
                    addVS1Data('TCountries', JSON.stringify(dataReload)).then(function(datareturn) {
                      sideBarService.getCountryDataList(initialBaseDataLoad, 0, false).then(async function(dataLeadList) {
                          await addVS1Data('TCountryList', JSON.stringify(dataLeadList)).then(function(datareturn) {
                            location.reload(true);
                          }).catch(function(err) {
                              location.reload(true);
                          });
                      }).catch(function(err) {
                          location.reload(true);
                      });
                    }).catch(function(err) {
                        location.reload(true);
                    });
                }).catch(function(err) {
                    location.reload(true);
                });
            }).catch(function(err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });
    }   
}, delayTimeAfterSound);
    }
});

Template.newcountrymodal.helpers({

});
