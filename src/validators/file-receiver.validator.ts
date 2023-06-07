import { checkSchema } from "express-validator";

const fileReceiverValidator = checkSchema({
  file: {
    in: "body",
  },  
  country:{
    in: "body",
    trim: true,
    exists: {
      errorMessage: "Tail number is required.",
    },
    notEmpty: {
      errorMessage: "Tail number cannot be empty.",
    },
  },
  folderName: {
    in: "body",
    trim: true,
    exists: {
      errorMessage: "Tail number is required.",
    },
    notEmpty: {
      errorMessage: "Tail number cannot be empty.",
    },
  },
  tailNumber: {
    in: "body",
    trim: true,
    exists: {
      errorMessage: "Tail number is required.",
    },
    notEmpty: {
      errorMessage: "Tail number cannot be empty.",
    },
  },
  id: {
    in: "body",
    trim: true,
    exists: {
      errorMessage: "Id is required.",
    },
    notEmpty: {
      errorMessage: "Id cannot be empty.",
    },
    isNumeric: {
      errorMessage: "Id must be number.",
    },
  },
});

export default fileReceiverValidator;
