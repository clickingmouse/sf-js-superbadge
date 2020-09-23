//import { LightningElement } from "lwc";

import { LightningElement, api, track } from "lwc";
import { createRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import NAME_FIELD from "@salesforce/schema/BoatReview__c.Name";
import COMMENT_FIELD from "@salesforce/schema/BoatReview__c.Comment__c";
import RATING_FIELD from "@salesforce/schema/BoatReview__c.Rating__c"; //
import BOAT_REVIEW_OBJECT from "@salesforce/schema/BoatReview__c";
import BOAT_FIELD from "@salesforce/schema/BoatReview__c.Boat__c"; //

const TOAST_TITLE = "Review Created!";
const TOAST_SUCCESS_VARIANT = "success";
const SUCCESS_TITLE = "Review Created!";
//and
const SUCCESS_VARIANT = "success";

//export default class BoatAddReviewForm extends LightningElement {}
// import
// import BOAT_REVIEW_OBJECT from schema - BoatReview__c
// import NAME_FIELD from schema - BoatReview__c.Name
// import COMMENT_FIELD from schema - BoatReview__c.Comment__c
export default class BoatAddReviewForm extends LightningElement {
  // Private
  @api boat;
  boatId;
  rating = 0;
  boatReviewObject = BOAT_REVIEW_OBJECT;
  nameField = NAME_FIELD;
  commentField = COMMENT_FIELD;
  labelSubject = "Review Subject";
  labelRating = "Rating";
  review = "";
  title = "";
  comment = "";

  // Public Getter and Setter to allow for logic to run on recordId change
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    //sets boatId attribute
    //sets boatId assignment
    this.setAttribute("boatId", value);
    this.boatId = value;
  }

  // Gets user rating input from stars component
  handleRatingChanged(event) {
    //this.rating = JSON.parse(JSON.stringify(event.detail)).rating;
    this.rating = event.detail.rating;
  }

  // Custom submission handler to properly set Rating
  // This function must prevent the anchor element from navigating to a URL.
  // form to be submitted: lightning-record-edit-form
  handleSubmit(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields.Boat__c = this.boatId;
    fields.Rating__c = this.rating;
    this.template.querySelector("lightning-record-edit-form").submit(fields);
  }

  // Shows a toast message once form is submitted successfully
  // Dispatches event when a review is created
  handleSuccess(event) {
    const evt = new ShowToastEvent({
      title: SUCCESS_TITLE,
      variant: SUCCESS_VARIANT
    });
    this.dispatchEvent(evt);
    this.dispatchEvent(new CustomEvent("createreview"));
    this.handleReset();
  }

  // Clears form data upon submission
  // TODO: it must reset each lightning-input-field
  handleReset(event) {
    const inputFields = this.template.querySelectorAll("lightning-input-field");
    //const fields = event.detail.fields;
    if (inputFields) {
      inputFields.forEach((field) => {
        field.reset();
      });
    }
  }
}
