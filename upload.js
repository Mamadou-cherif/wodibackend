const util = require("util");
const multer = require("multer");
const maxSize = 2 * 1024 * 1024;
const path= require("path")
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
   // console.log(file.path)
    cb(null, __basedir + "./uploads/publications/");
  },
  filename: (req, file, cb) => {
   // console.log(file.originalname);
    cb(null, file.originalname);
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;