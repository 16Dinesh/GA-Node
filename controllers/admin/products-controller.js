const { imageUploadUtility } = require("../../helpers/cloudinary");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtility(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in Uploading the Image",
      Error: console.error("This is Not Able to Upload Cuz of Backend Issue"),
    });
  }
};

module.exports = {
  handleImageUpload,
  // addProduct,
  // fetchAllProducts,
  // editProduct,
  // deleteProduct,
};
