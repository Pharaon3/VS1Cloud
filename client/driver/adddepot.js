import { OrganisationService } from "../js/organisation-service";
import { CountryService } from "../js/country-service";
import { ReactiveVar } from "meteor/reactive-var";
import { SideBarService } from "../js/sidebar-service";
import { UtilityService } from "../utility-service";
import "../lib/global/indexdbstorage.js";
import LoadingOverlay from "../LoadingOverlay";
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Template } from 'meteor/templating';
import "./adddepot.html";
import _ from "lodash";
import { ContactService } from "../contacts/contact-service";

let sideBarService = new SideBarService();
let organisationService = new OrganisationService();
let depotTitle = 'depot 1';

async function loadAccountantDetailByName(supplierDataName) {
  $(".fullScreenSpin").css("display", "inline-block");
  try {
    let dataObject = await getVS1Data("TSupplierVS1");
    if (dataObject.length) {
      let data = JSON.parse(dataObject[0].data);
      supplierList = data
      var added = false;
      for (let i = 0; i < data.tsuppliervs1.length; i++) {
          if (
              data.tsuppliervs1[i].fields.ClientName ===
              supplierDataName
          ) {
              added = true;
              accountantDetailObj = data.tsuppliervs1[i]
              supplierListIndex = i
              continue;
          }
      }
      if (!added) {
          data = await sideBarService.getOneSupplierDataExByName(supplierDataName)
          accountantDetailObj = data.tsupplier[0]
      }
    } else {
      let data = await sideBarService.getOneSupplierDataExByName(supplierDataName)
      accountantDetailObj = data.tsupplier[0]
    }
  } catch (e) {
    let data = await sideBarService.getOneSupplierDataExByName(supplierDataName)
    accountantDetailObj = data.tsupplier[0]
  }
  $(".fullScreenSpin").css("display", "none");
}

async function saveAccountantDetail() {
}

Template.adddepot.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.showSkype = new ReactiveVar();
  templateObject.showMob = new ReactiveVar();
  templateObject.showFax = new ReactiveVar();
  templateObject.showLinkedIn = new ReactiveVar();
  templateObject.countryList = new ReactiveVar([]);
  templateObject.showPoAddress = new ReactiveVar();
  templateObject.phCity = new ReactiveVar();
  templateObject.samePhysicalAddress1 = new ReactiveVar();
  templateObject.samePhysicalAddress2 = new ReactiveVar();
  templateObject.samePhysicalAddress3 = new ReactiveVar();
  templateObject.phState = new ReactiveVar();
  templateObject.phCountry = new ReactiveVar();
  templateObject.phCode = new ReactiveVar();
  templateObject.phAttention = new ReactiveVar();
  templateObject.countryData = new ReactiveVar();
  templateObject.suppliersData = new ReactiveVar();
  templateObject.hideCreateField = new ReactiveVar();
  templateObject.paAddress1 = new ReactiveVar();
  templateObject.paAddress2 = new ReactiveVar();
  templateObject.paAddress3 = new ReactiveVar();
  templateObject.phAddress1 = new ReactiveVar();
  templateObject.phAddress2 = new ReactiveVar();
  templateObject.phAddress3 = new ReactiveVar();
  templateObject.fieldLength = new ReactiveVar();
  templateObject.completePoAddress = new ReactiveVar();
  templateObject.completePhAddress = new ReactiveVar();
  templateObject.imageFileData = new ReactiveVar();

  templateObject.isSameAddress = new ReactiveVar();
  templateObject.isSameAddress.set(false);

  templateObject.iscompanyemail = new ReactiveVar();
  templateObject.iscompanyemail.set(false);

  templateObject.isChkUSRegionTax = new ReactiveVar();
  templateObject.isChkUSRegionTax.set(false);
});

Template.adddepot.onRendered(function () {
  $(".fullScreenSpin").css("display", "inline-block");
  const templateObject = Template.instance();
  let countries = [];
  var countryService = new CountryService();
  templateObject.getCountryData = function () {
    getVS1Data("TCountries").then(function(dataObject) {
            if (dataObject.length == 0) {
                countryService.getCountry().then((data) => {
                    for (let i = 0; i < data.tcountries.length; i++) {
                        countries.push(data.tcountries[i].Country);
                    }
                    countries.sort((a, b) => a.localeCompare(b));
                    templateObject.countryData.set(countries);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcountries;
                for (let i = 0; i < useData.length; i++) {
                    countries.push(useData[i].Country);
                }
                countries.sort((a, b) => a.localeCompare(b));
                templateObject.countryData.set(countries);
            }
        }).catch(function(err) {
            countryService.getCountry().then((data) => {
                for (let i = 0; i < data.tcountries.length; i++) {
                    countries.push(data.tcountries[i].Country);
                }
                countries.sort((a, b) => a.localeCompare(b));
                templateObject.countryData.set(countries);
            });
        });
  };
  templateObject.getCountryData();

  templateObject.getDropDown = function (id, country) {
    $("#" + id)
      .autocomplete({
        source: country,
        minLength: 0,
      })
      .focus(function () {
        $(this).autocomplete("search", "");
      });
    $("#" + id)
      .autocomplete("widget")
      .addClass("countries-dropdown");
  };

});

Template.adddepot.helpers({
  showMob: () => {
    return Template.instance().showMob.get();
  },
  showSkype: () => {
    return Template.instance().showSkype.get();
  },
  showFax: () => {
    return Template.instance().showFax.get();
  },
  showLinkedIn: () => {
    return Template.instance().showLinkedIn.get();
  },
  countryList: () => {
    return Template.instance().countryData.get();
  },
  showPoAddress: () => {
    return Template.instance().showPoAddress.get();
  },
  hideCreateField: () => {
    return Template.instance().hideCreateField.get();
  },
  fieldLength: () => {
    return Template.instance().fieldLength.get();
  },
  isSameAddress: () => {
    return Template.instance().isSameAddress.get();
  },
  iscompanyemail: () => {
    return Template.instance().iscompanyemail.get();
  },
  isChkUSRegionTax: () => {
    return Template.instance().isChkUSRegionTax.get();
  },
  checkCountryABN: () => {
    let countryABNValue = "ABN";
    if (LoggedCountry == "South Africa") {
      countryABNValue = "VAT";
    }
    return countryABNValue;
  },
  suppliersData: () => {
    return Template.instance()
      .suppliersData.get()
      .sort(function (a, b) {
        if (a.company == "NA") {
          return 1;
        } else if (b.company == "NA") {
          return -1;
        }
        return a.company.toUpperCase() > b.company.toUpperCase() ? 1 : -1;
      });
  },
});

Template.adddepot.events({
  "click #saveCompanyInfo": function (event) {
    playSaveAudio();
    setTimeout(async function () {
      $(".fullScreenSpin").css("display", "inline-block");

      let shipAddress = $("#edtAddress").val();
      let shipCity = $("#edtCity").val();
      let shipState = $("#edtState").val();
      let shipPostCode = $("#edtPostCode").val();
      let shipCountry = $("#edtCountry").val();

      let isChkUSRegionTax = $("#chkusregiontax").is(":checked");

      var objDetails = {
        type: "TDepotList",
        fields: {
          Address: shipAddress,
          City: shipCity,
          State: shipState,
          Postcode: shipPostCode,
          Country: shipCountry,
          IsUSRegionTax: isChkUSRegionTax,
        },
      };

      await saveAccountantDetail()
      organisationService
        .saveOrganisationSetting(objDetails)
        .then(async function (data) {
          await clearData('TCompanyInfo')

          swal({
            title: "New Depot successfully added!",
            text: "",
            type: "success",
            showCancelButton: false,
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.value) {
              window.open("/depotlist", "_self");
            } else if (result.dismiss === "cancel") {
            }
          });
          $(".fullScreenSpin").css("display", "none");
        })
        .catch(function (err) {
          $(".fullScreenSpin").css("display", "none");
          swal({
            title: "Oooops...",
            text: err,
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Try Again",
          }).then((result) => {
            if (result.value) {
              // Meteor._reload.reload();
            } else if (result.dismiss === "cancel") {
            }
          });
        });
    }, delayTimeAfterSound);
  },
  "click #depotTitleHeader": function (event) {
    $("#depotTitleHeader").addClass("hidden");
    $("#depotTitleInput").removeClass("hidden");
    $("#depotTitleInput").val(depotTitle);
    $("#depotTitleInput").focus();
  },
  "blur #depotTitleInput": function (event) {
    depotTitle = $("#depotTitleInput").val();
    if(depotTitle == "") depotTitle = "Depot 1";
    $("#depotTitleHeader").text(depotTitle);
    $("#depotTitleHeader").removeClass("hidden");
    $("#depotTitleInput").addClass("hidden");
  },
  "click #uploadImg": async function (event) {
    //let imageData= (localStorage.getItem("Image"));
    let templateObject = Template.instance();
    let imageData = templateObject.imageFileData.get();
    let checkCompLogoData = await organisationService.getCheckTcompLogoData();
    let myFilesType = $("#fileInput")[0].files[0].type || "";
    if (imageData != null && imageData != "") {
      addVS1Data("TVS1Image", imageData);
      localStorage.setItem("Image", imageData);
      $("#uploadedImage").attr("src", imageData);
      $("#uploadedImage").attr("width", "50%");
      $("#removeLogo").show();
      $("#changeLogo").show();

      let companyLogoObj = "";
      if (checkCompLogoData.tcomplogo.length) {
        companyLogoObj = {
          type: "TCompLogo",
          fields: {
            ID: parseInt(checkCompLogoData.tcomplogo[0].Id) || 0,
            MIMEEncodedPicture: imageData.split(",")[1],
            ImageTypes: myFilesType || "image/png",
            Pictype: myFilesType.split("/")[1] || "png",
          },
        };
      } else {
        companyLogoObj = {
          type: "TCompLogo",
          fields: {
            MIMEEncodedPicture: imageData.split(",")[1],
            SetupID: 1,
            ImageTypes: myFilesType || "image/png",
            Pictype: myFilesType.split("/")[1] || "png",
          },
        };
      }

      organisationService
        .saveCompanyLogo(companyLogoObj)
        .then(function (companyLogoObj) {});
    }
  },

  "change #fileInput": function (event) {
    let templateObject = Template.instance();
    let selectedFile = event.target.files[0];
    let reader = new FileReader();
    $(".Choose_file").text("");
    reader.onload = function (event) {
      $("#uploadImg").prop("disabled", false);
      $("#uploadImg").addClass("on-upload-logo");
      $(".Choose_file").text(selectedFile.name);
      //$("#uploadImg").css("background-color","yellow");
      templateObject.imageFileData.set(event.target.result);

      //localStorage.setItem("Image",event.target.result);
    };
    reader.readAsDataURL(selectedFile);
  },
  "click .btnBack": function (event) {
    playCancelAudio();
    event.preventDefault();
    setTimeout(function () {
      history.back(1);
    }, delayTimeAfterSound);
    //FlowRouter.go('/settings');
    //window.open('/invoicelist','_self');
  },
  "click .btnUploadFile": function (event) {
    // $('#attachment-upload').val('');
    // $('.file-name').text('');
    //$(".btnImport").removeAttr("disabled");
    $("#fileInput").trigger("click");
  },
  "change #edtCountry": function (event) {
    if (event.target.value == "United States") {
      $("#chkusregiontax").prop("checked", true);
      $(".chkusregiontax-col").show();
    } else {
      $("#chkusregiontax").prop("checked", false);
      swal(
        "Ooops...",
        "Can't Alter Country Once the Database Is Set.",
        "error"
      );
      $(event.target).val("United States");
      event.preventDefault();
      return false;
      // $(".chkusregiontax-col").hide();
    }
  },
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});
