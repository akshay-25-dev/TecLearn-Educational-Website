import { useEffect, useState } from "react"
import { VscHeart } from "react-icons/vsc"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import {
  getWishlist,
  removeFromWishlist,
} from "../../../services/operations/profileAPI"

export default function Wishlist() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [wishlist, setWishlist] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    ;(async () => {
      const res = await getWishlist(token)
      setWishlist(res || [])
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRemove = async (courseId) => {
    setRemovingId(courseId)
    const updated = await removeFromWishlist(courseId, token)
    if (updated) {
      setWishlist(updated)
    }
    setRemovingId(null)
  }

  return (
    <>
      <div className="text-3xl text-richblack-50">Wishlist</div>

      {!wishlist ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : !wishlist.length ? (
        <div className="grid h-[10vh] w-full place-content-center text-richblack-5">
          <div className="flex flex-col items-center gap-2">
            <VscHeart className="text-2xl text-richblack-300" />
            <p>Courses you save for later will show up here.</p>
          </div>
        </div>
      ) : (
        <div className="my-8 text-richblack-5">
          {/* Headings */}
          <div className="flex rounded-t-lg bg-richblack-500">
            <p className="w-[55%] px-5 py-3">Course Name</p>
            <p className="w-1/4 px-2 py-3">Price</p>
            <p className="flex-1 px-2 py-3">Actions</p>
          </div>
          {/* Rows */}
          {wishlist.map((course, i, arr) => (
            <div
              className={`flex items-center border border-richblack-700 ${
                i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
              }`}
              key={course._id}
            >
              <div
                className="flex w-[55%] cursor-pointer items-center gap-4 px-5 py-3"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                <img
                  src={course.thumbnail}
                  alt="course_img"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex max-w-xs flex-col gap-2">
                  <p className="font-semibold">{course.courseName}</p>
                  <p className="text-xs text-richblack-300">
                    {course?.instructor?.firstName} {course?.instructor?.lastName}
                  </p>
                </div>
              </div>
              <div className="w-1/4 px-2 py-3">₹{course.price}</div>
              <div className="flex flex-1 items-center gap-x-3 px-2 py-3">
                <button
                  className="rounded-md bg-yellow-50 px-3 py-1.5 text-sm font-semibold text-richblack-900 disabled:opacity-50"
                  onClick={() => navigate(`/courses/${course._id}`)}
                >
                  View
                </button>
                <button
                  className="rounded-md border border-richblack-600 px-3 py-1.5 text-sm text-richblack-5 disabled:opacity-50"
                  disabled={removingId === course._id}
                  onClick={() => handleRemove(course._id)}
                >
                  {removingId === course._id ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
