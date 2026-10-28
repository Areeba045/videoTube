// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/temp");
//   },
//   filename: function (req, file, cb) {
//     // cb(null , file.filename + '-' + uniqueSuffiix) ;
//     // console.log(file.filename + '-' + uniqueSuffiix)
//     cb(null, file.originalname);
//   },
// });

// export const upload = multer({
//   storage: storage,
// });


import multer from "multer";
import os from "node:os";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir());
  },

  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
});
