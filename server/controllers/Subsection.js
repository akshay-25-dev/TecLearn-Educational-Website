// Import necessary modules
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
  try {
    // fetch data from request body
    const { sectionId, title, description, timeDuration } = req.body;
    // fetch video file from request files
    const video = req.files?.video;

    // validation
    if (!sectionId || !title || !description || !video) {
      return res
        .status(400)
        .json({ success: false, message: "All Fields are Required" });
    }

    // Upload the video file to Cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    console.log("Cloudinary Upload Details:", uploadDetails);

    // Create a new sub-section
    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration || `${uploadDetails.duration || ""}`,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    // Update the corresponding section with the newly created sub-section
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection");

    // Return response
    return res.status(200).json({
      success: true,
      data: updatedSection,
    });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error creating new sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// update SubSection 
exports.updateSubSection = async (req, res) => {
  try {
    // fetch data from request body
    const { sectionId, subSectionId, title, description } = req.body;
    // fetch video file from request files
    const video = req.files?.video;
    // find the sub-section by its ID
    const subSection = await SubSection.findById(subSectionId);
    // check if the sub-section exists
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }
    // update the sub-section's title and description if provided
    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }
    if (video !== undefined) {
      
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME,
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = uploadDetails.duration;
    }

    await subSection.save();

    // find updated section and return it
    const updatedSection =
      await Section.findById(sectionId).populate("subSection");

    console.log("updated section", updatedSection);

    return res.json({
      success: true,
      message: "SubSection updated successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the SubSection",
    });
  }
};
// delete Sub Section
exports.deleteSubSection = async (req, res) => {
  try {
    // fetch id of dection and subsection
    const { subSectionId, sectionId } = req.body;
    // remove subsection from section
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      },
    );
    // delete subsection
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    

    // find updated section and return it
    const updatedSection =
      await Section.findById(sectionId).populate("subSection");

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
};
