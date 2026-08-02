import { useEffect, useState } from "react"
import { VscStarFull } from "react-icons/vsc"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import RatingStars from "../../Common/RatingStars"
import { getUserReviews } from "../../../services/operations/courseDetailsAPI"

export default function Reviews() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [reviews, setReviews] = useState(null)

  useEffect(() => {
    ;(async () => {
      const res = await getUserReviews(token)
      setReviews(res || [])
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="text-3xl text-richblack-50">Reviews</div>

      {!reviews ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : !reviews.length ? (
        <div className="grid h-[10vh] w-full place-content-center text-richblack-5">
          <div className="flex flex-col items-center gap-2">
            <VscStarFull className="text-2xl text-richblack-300" />
            <p>Reviews you write for courses will show up here.</p>
          </div>
        </div>
      ) : (
        <div className="my-8 flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="flex items-start gap-4 rounded-lg border border-richblack-700 bg-richblack-800 p-5"
            >
              <img
                src={review.course?.thumbnail}
                alt="course_img"
                className="h-16 w-16 shrink-0 cursor-pointer rounded-md object-cover"
                onClick={() => navigate(`/courses/${review.course?._id}`)}
              />
              <div className="flex flex-1 flex-col gap-2">
                <p
                  className="cursor-pointer font-semibold text-richblack-5"
                  onClick={() => navigate(`/courses/${review.course?._id}`)}
                >
                  {review.course?.courseName}
                </p>
                <RatingStars Review_Count={review.rating} Star_Size={18} />
                <p className="text-sm text-richblack-300">{review.review}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
