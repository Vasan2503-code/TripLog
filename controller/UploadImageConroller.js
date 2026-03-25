const { cloudinary } = require('../config/cloudConfig');

const uploadImages = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                url: req.file.path,
                public_id: req.file.filename
            }
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: error.message
        });
    }
};

const getImages = async (req, res) => {
    try {
        const result = await cloudinary.api.resources();
        res.status(200).json({
            success: true,
            message: "Images fetched successfully",
            data: result
        });
    } catch (e) {
        console.error("Fetch error:", e);
        res.status(500).json({
            success: false,
            message: "Error fetching images",
            error: e.message
        });
    }
};

module.exports = {
    uploadImages,
    getImages
};