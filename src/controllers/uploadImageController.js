const formidable = require('formidable');
const fs = require('fs');

const upload = (req, res, next) => {
  let flag = true;
  try {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (error, fields, files) => {
      if (error) {
        return res.status(400).json({
          error: 'Photo could not be upload',
        });
      }
      const listFiles = Object.values(files);
      let listFilePaths = [];
      if (listFiles.length > 0) {
        listFiles.forEach((file) => {
          const type = file.mimetype;
          if (type !== 'image/jpeg' && type !== 'image/jpg' && type !== 'image/png' && type !== 'image/gif') {
            flag = false;
            return res.status(400).json({
              error: 'Photo type must be png, jpg, jpeg or gif',
            });
          }
          if (file.size > 1000000) {
            flag = false;
            return res.status(400).json({
              error: 'Image should be less than 1mb in size',
            });
          }
          let data;
          try {
            data = fs.readFileSync(file.filepath);
          } catch (error) {
            flag = false;
          }
          const newpath = `src/public/uploads/${Date.now()}${req?.store?.slug ? req.store.slug : ''}${
            req?.product?.slug ? req.product.slug : ''
          }${file.originalFilename}`;
          try {
            fs.writeFileSync(newpath, data);
          } catch (error) {
            flag = false;
            return res.status(400).json({
              error: 'Photo could not be upload',
            });
          }
          listFilePaths.push(newpath.replace('src/public', ''));
        });
      }
      req.filepaths = listFilePaths;
      req.fields = fields;
      if (flag) {
        next();
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { upload };
