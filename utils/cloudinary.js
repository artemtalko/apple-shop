const cloudinary = require("cloudinary");

cloudinary.config({ 
    cloud_name: 'dv0vsapta', 
    api_key: '217445754195726', 
    api_secret: 'pGOMashdo7OgZCX7dghEuduYdh8' 
});

  const cloudinaryUploadImg = async (fileToUploads) => {
    return new Promise((resolve) => {
      cloudinary.uploader.upload(fileToUploads, (result) => {
        resolve(
          {
            url: result.secure_url,
            asset_id: result.asset_id,
            public_id: result.public_id,
          },
          {
            resource_type: "auto",
          }
        );
      });
    });
  };

module.exports = { cloudinaryUploadImg };