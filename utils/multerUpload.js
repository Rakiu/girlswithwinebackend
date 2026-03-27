import multer from "multer";
import fs from "fs";
import path from "path";

/* =================================
   STATIC FOLDER UPLOADER (OLD)
================================= */
export const createUploader = (folderName) => {

  const uploadPath = `uploads/${folderName}`;

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);

      const name =
        Date.now() +
        "-" +
        file.originalname.replace(ext, "").replace(/\s/g, "-") +
        ext;

      cb(null, name);
    },
  });

  return multer({ storage });
};

/* =================================
   DYNAMIC FOLDER UPLOADER (NEW 🔥)
================================= */
export const createDynamicUploader = () => {

  const storage = multer.diskStorage({

    destination: (req, file, cb) => {

      const folderName = Date.now().toString(); // 🔥 unique folder

      const uploadPath = `uploads/${folderName}`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // save folder name for controller
      req.dynamicFolder = folderName;

      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);

      const fileName =
        Date.now() +
        "-" +
        file.originalname.replace(ext, "").replace(/\s/g, "-") +
        ext;

      cb(null, fileName);
    },
  });

  return multer({ storage });
};