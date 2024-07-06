const multer = require("multer");
exports.fileStorge = multer.diskStorage({
    destination : (req , file , cb) => {
        cb(null , "images");
    },
    filename : (req , file , cb) => {
        cb(null , Date.now().toString() + "-" + file.originalname);
    }
});
exports.fileFilter = (req , file , cb) => {
    if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
        cb(null , true);
    }
    else {
        cb(null , false);
    }
}