import multer from "multer";
import fs from "fs";
import path from "path";

/* =================================
   STATIC FOLDER UPLOADER
================================= */
export const createUploader = (folderName) => {

  // ✅ Vercel writable path
  const uploadPath = path.join(
    "/tmp",
    "uploads",
    folderName
  );

  // ✅ create folder safely
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
        file.originalname
          .replace(ext, "")
          .replace(/\s/g, "-") +
        ext;

      cb(null, name);
    },
  });

  return multer({ storage });
};

/* =================================
   DYNAMIC FOLDER UPLOADER
================================= */
export const createDynamicUploader = () => {

  const storage = multer.diskStorage({

    destination: (req, file, cb) => {

      const folderName = Date.now().toString();

      // ✅ /tmp path
      const uploadPath = path.join(
        "/tmp",
        "uploads",
        folderName
      );

      // create folder safely
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, {
          recursive: true,
        });
      }

      req.dynamicFolder = folderName;

      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {

      const ext = path.extname(file.originalname);

      const fileName =
        Date.now() +
        "-" +
        file.originalname
          .replace(ext, "")
          .replace(/\s/g, "-") +
        ext;

      cb(null, fileName);
    },
  });

  return multer({ storage });
};