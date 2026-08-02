const Section = require("../models/Section")
const Course = require("../models/Course")
const SubSection = require("../models/SubSection")


// CREATE a new section
exports.createSection = async (req, res) => {
  try {
    // data fetch
    const { sectionName, courseId } = req.body

    // data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      })
    }

    // Create a  section 
    const newSection = await Section.create({ sectionName })

    // Add the new section to the course's content array
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    // Return the updated course object in the response
     return res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    })
  } catch (error) {
    // Handle errors
     return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// UPDATE a section
exports.updateSection = async (req, res) => {
  try {
    // fetch data
    const { sectionName, sectionId} = req.body
    // validate data 
    if (!sectionName || !sectionId ) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      })
    }
    //update data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    )
    // return response
     return res.status(200).json({
      success: true,
      message: "Section Updated Successfully",
      data: section,
    })
  } catch (error) {
    console.error("Error updating section:", error)
     return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// DELETE a section
exports.deleteSection = async (req, res) => {
  try {
    /// fetch ID 
    const { sectionId, courseId } = req.body

    // remove the section from the course's content array
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    })
    // find the section to be deleted
    const section = await Section.findById(sectionId)
    console.log(sectionId, courseId)

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      })
    }
    // Delete the associated subsections
    await SubSection.deleteMany({ _id: { $in: section.subSection } })
    // Delete the section
    await Section.findByIdAndDelete(sectionId)
    // find the updated course and return it
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()
    
    // return response
     return res.status(200).json({
      success: true,
      message: "Section deleted",
      data: course,
      
    })
  } catch (error) {
    console.error("Error deleting section:", error)
     return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
