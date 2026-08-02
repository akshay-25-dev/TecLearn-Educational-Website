import React, { useState } from "react"
import copy from "copy-to-clipboard"
import { toast } from "react-hot-toast"
import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"
import { VscHeart, VscHeartFilled } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { addToCart } from "../../../slices/cartSlice"
import { setUser } from "../../../slices/profileSlice"
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../services/operations/profileAPI"
import { ACCOUNT_TYPE } from "../../../utils/constants"

// const CourseIncludes = [
//   "8 hours on-demand video",
//   "Full Lifetime access",
//   "Access on Mobile and TV",
//   "Certificate of completion",
// ]

function CourseDetailsCard({ course, setConfirmationModal, handleBuyCourse }) {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    _id: courseId,
  } = course

  const isWishlisted = Boolean(user?.wishlist?.includes(courseId))
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const handleShare = () => {
    copy(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleToggleWishlist = async () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't wishlist a course.")
      return
    }
    if (!token) {
      setConfirmationModal({
        text1: "You are not logged in!",
        text2: "Please login to add courses to your wishlist",
        btn1Text: "Login",
        btn2Text: "Cancel",
        btn1Handler: () => navigate("/login"),
        btn2Handler: () => setConfirmationModal(null),
      })
      return
    }

    setWishlistLoading(true)
    const updatedWishlist = isWishlisted
      ? await removeFromWishlist(courseId, token)
      : await addToWishlist(courseId, token)

    if (updatedWishlist) {
      const updatedIds = updatedWishlist.map((c) =>
        typeof c === "string" ? c : c._id
      )
      dispatch(setUser({ ...user, wishlist: updatedIds }))
    }
    setWishlistLoading(false)
  }

  const handleAddToCart = () => {
    if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    if (token) {
      dispatch(addToCart(course))
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  // console.log("Student already enrolled ", course?.studentsEnrolled, user?._id)

  return (
    <>
      <div
        className={`flex flex-col gap-4 rounded-md bg-richblack-700 p-4 text-richblack-5`}
      >
        {/* Course Image */}
        <img
          src={ThumbnailImage}
          alt={course?.courseName}
          className="max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full"
        />

        <div className="px-4">
          <div className="flex items-center justify-between pb-4">
            <div className="space-x-3 text-3xl font-semibold">
              Rs. {CurrentPrice}
            </div>
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              aria-label="Toggle wishlist"
              className="text-2xl text-pink-200 disabled:opacity-50"
            >
              {isWishlisted ? <VscHeartFilled /> : <VscHeart />}
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <button
              className="yellowButton"
              onClick={
                user && course?.studentsEnrolled?.includes(user?._id)
                  ? () => navigate("/dashboard/enrolled-courses")
                  : handleBuyCourse
              }
            >
              {user && course?.studentsEnrolled?.includes(user?._id)
                ? "Go To Course"
                : "Buy Now"}
            </button>
            {(!user || !course?.studentsEnrolled?.includes(user?._id)) && (
              <button onClick={handleAddToCart} className="blackButton">
                Add to Cart
              </button>
            )}
          </div>
          <div>
            <p className="pb-3 pt-6 text-center text-sm text-richblack-25">
              30-Day Money-Back Guarantee
            </p>
          </div>

          <div className={``}>
            <p className={`my-2 text-xl font-semibold `}>
              This Course Includes :
            </p>
            <div className="flex flex-col gap-3 text-sm text-caribbeangreen-100">
              {course?.instructions?.map((item, i) => {
                return (
                  <p className={`flex gap-2`} key={i}>
                    <BsFillCaretRightFill />
                    <span>{item}</span>
                  </p>
                )
              })}
            </div>
          </div>
          <div className="text-center">
            <button
              className="mx-auto flex items-center gap-2 py-6 text-yellow-100 "
              onClick={handleShare}
            >
              <FaShareSquare size={15} /> Share
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CourseDetailsCard
