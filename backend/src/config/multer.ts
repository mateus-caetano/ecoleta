import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
export default {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads'),
    filename: (req, file, callback) => {
      const hash = crypto.randomBytes(8).toString('hex');

      const fileName = `${hash}-${file.originalname}`;

      callback(null, fileName);
    },
  }),
};
