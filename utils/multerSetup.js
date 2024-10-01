const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

const s3 = new S3Client({
    region : process.env.REGION,
    credentials : {
        secretAccessKey : process.env.SECRET_ACCESS_KEY,
        accessKeyId : process.env.ACCESS_KEY,
    }
});

exports.fileStorage = multerS3({
    s3 : s3,
    bucket : process.env.BUCKET,
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        cb(null, Date.now().toString() + "-" + file.originalname);  // Define how the file is named
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