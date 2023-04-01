const Product = require("../models/product");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

module.exports.createProduct = async (req, res) => {
  try {
    const { name, sku, category, quantity, price, description } = req.body;

    if (!name || !category || !quantity || !price || !description) {
      return res.status(400).send({ error: "Missing required fields." });
    }

    // Handle Image upload
    let fileData = {};
    if (req.file) {
      // Save image to cloudinary
      let uploadedFile;
      try {
        uploadedFile = await cloudinary.uploader.upload(req.file.path, {
          folder: "Pinvent App",
          resource_type: "image",
        });
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error: "Image could not be uploaded." });
      }

      fileData = {
        fileName: req.file.originalname,
        filePath: uploadedFile.secure_url,
        fileType: req.file.mimetype,
        fileSize: fileSizeFormatter(req.file.size, 2),
      };
    }
    // let fileData = {};
    // if (req.file) {
    //   fileData = {
    //     fileName: req.file.originalname,
    //     filePath: req.file.secure_url,
    //     fileType: req.file.mimetype,
    //     fileSize: fileSizeFormatter(req.file.size, 2),
    //   };
    // }

    const product = await Product.create({
      user: req.user._id,
      // user: "63b43d12a216a4fd87f32bc3",
      name,
      sku,
      category,
      quantity,
      price,
      description,
      image: fileData,
    });
    res.send({
      success: true,
      message: "Successfully created",
      product,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Cannot create product." });
  }
};

module.exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      deleted: { $ne: true },
      // user: "63b43d12a216a4fd87f32bc3",
      user: req.user._id,
    }).sort("-createdAt");

    res.send({
      success: true,
      products,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Cannot get products." });
  }
};

module.exports.getOneProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    // if product doesnt exist
    if (!product) {
      return res.status(404).send({ error: "Product not found." });
    }
    // Match product to its user
    // if (product.user.toString() !== req.user._id) {
    //   return res.status(401).send({ error: "User not authorized." });
    // }
    res.send({
      success: true,
      product,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Cannot get product." });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    // if product doesnt exist
    if (!product) {
      return res.status(404).send({ error: "Product not found." });
    }
    await Product.findByIdAndUpdate(req.params.id, { deleted: true });
    res.status(200).json({ success: true, message: "Product deleted." });
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Cannot delete product." });
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    console.log(req.file);
    const { id } = req.params;

    const product = await Product.findById(id);

    // if product doesnt exist
    if (!product) {
      return res.status(404).send({ error: "Product not found." });
    }

    // Handle Image upload
    let fileData = {};
    if (req.file) {
      // Save image to cloudinary
      let uploadedFile;
      try {
        uploadedFile = await cloudinary.uploader.upload(req.file.path, {
          folder: "Pinvent App",
          resource_type: "image",
        });
      } catch (error) {
        res.status(500);
        throw new Error("Image could not be uploaded");
      }

      fileData = {
        fileName: req.file.originalname,
        filePath: uploadedFile.secure_url,
        fileType: req.file.mimetype,
        fileSize: fileSizeFormatter(req.file.size, 2),
      };
    }

    // Update Product
    const p = await Product.findByIdAndUpdate(
      id,
      {
        ...req.body,
        image: Object.keys(fileData).length === 0 ? product?.image : fileData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({ success: true, message: "Product updated.", p });
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Cannot update product." });
  }
};
