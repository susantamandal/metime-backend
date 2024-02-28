import multer from "multer";

const storage = multer.diskStorage({
    destination: function (_, __, cb) {
        cb(null, './public/temp');
    },
    filename: function (_, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = file.originalname?.split('.').pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ fileExtension !== file.originalname ? ("."+fileExtension) : ""}`);
    }
});

export const upload = multer({ storage });