const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirectory = path.resolve(__dirname, '../../public/uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Storage engine config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Image type validation
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif/;
  const isExtensionAllowed = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const isMimetypeAllowed = allowedExtensions.test(file.mimetype);

  if (isExtensionAllowed && isMimetypeAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Error: Only images of type jpeg, jpg, png, webp, or gif are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit per file
  fileFilter: fileFilter
});

const fileFields = [
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 20 },
  { name: 'gallery_image_1', maxCount: 1 },
  { name: 'gallery_image_2', maxCount: 1 },
  { name: 'gallery_image_3', maxCount: 1 },
  { name: 'gallery_image_4', maxCount: 1 },
  { name: 'gallery_image_5', maxCount: 1 },

];

// Multer fields mapping for business details (Logo + up to 5 gallery images)
const businessUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery_image', maxCount: 1 },
  { name: 'gallery_image', maxCount: 1 },
  { name: 'gallery_image', maxCount: 1 },
  { name: 'gallery_image', maxCount: 1 },
  { name: 'gallery_image', maxCount: 1 },

]);

// Multer single image upload for posts
const postUpload = upload.single('image');
const parseForm = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return next();
  }

  return upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 20 },
    { name: 'gallery_image_1', maxCount: 1 },
    { name: 'gallery_image_2', maxCount: 1 },
    { name: 'gallery_image_3', maxCount: 1 },
    { name: 'gallery_image_4', maxCount: 1 },
    { name: 'gallery_image_5', maxCount: 1 },
    { name: 'result_image', maxCount: 1 }
  ])(req, res, (error) => {
    if (error) return next(error);

    if (Array.isArray(req.files)) {
      req.files.forEach((file) => {
        const fieldName = file.fieldname;
        const imagePath = `/uploads/${file.filename}`;

        if (fieldName === 'image' && !req.file) {
          req.file = file;
        }

        if (fieldName === 'images') {
          if (!Array.isArray(req.body.images)) {
            req.body.images = [];
          }
          req.body.images.push(imagePath);
          return;
        }

        if (req.body[fieldName] === undefined) {
          req.body[fieldName] = imagePath;
        } else if (Array.isArray(req.body[fieldName])) {
          req.body[fieldName].push(imagePath);
        } else {
          req.body[fieldName] = [req.body[fieldName], imagePath];
        }
      });
    }

    // Populate req.body.image from req.file (single) or req.files.image[0] (fields)
    if (req.file && !req.body.image) {
      req.body.image = `/uploads/${req.file.filename}`;
    }
    if (req.files?.image?.[0] && !req.body.image) {
      req.body.image = `/uploads/${req.files.image[0].filename}`;
    }
    if (req.files?.images?.length) {
      req.body.images = req.files.images.map((file) => `/uploads/${file.filename}`);
    }
    for (let i = 1; i <= 5; i++) {
      const key = `gallery_image_${i}`;
      if (req.files?.[key]?.[0]) {
        req.body[key] = `/uploads/${req.files[key][0].filename}`;
      }
    }
    if (req.files?.result_image?.[0]) {
      req.body.result_image = `/uploads/${req.files.result_image[0].filename}`;
    }
    return next();
  });
};

module.exports = {
  upload,
  businessUpload,
  postUpload,
  parseForm
};
