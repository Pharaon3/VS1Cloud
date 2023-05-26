import { Template } from 'meteor/templating';
import './customfiltersmodal.html';


Template.customfiltersmodal.helpers({
switchRuleOptions: () => {
  let switchRuleOptions = [{
    value: '&&',
    name: "And"
  },{
    value: "||",
    name: "Or"
  },{
    value: ">",
    name: "Greater Than"
  },{
    value: "<",
    name: "Less Than"
  }];
  return switchRuleOptions;
}
});
