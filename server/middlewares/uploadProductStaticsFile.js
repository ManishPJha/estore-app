const catchAsyncErrors = require("./catchAsyncErrors");
const multer = require("multer");
// const fs = require("fs");
const path = require("path");

let storage = multer.diskStorage({
  destination: "../uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

let upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

function checkFileType(file, cb) {
  // const fileType = /jpeg|jpg|png|gif/;
  const fileType = /pdf/;
  const extName = fileType.test(path.extname(file.originalname).toLowerCase());

  if (extName) {
    return cb(null, true);
  } else {
    cb("Error: PDF file only supported.");
  }
}

exports.uploadProductStaticsFile = catchAsyncErrors(
  upload.single("cgv"),
  async (req, res, next) => {
    next();
  }
);
