import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"

import { getInstructorData } from "../../../services/operations/profileAPI"
import { getWithdrawals } from "../../../services/operations/withdrawalAPI"

export default function Earning() {
  const { token } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(true)
  const [courseData, setCourseData] = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const [instructorApiData, withdrawalData] = await Promise.all([
        getInstructorData(token),
        getWithdrawals(token),
      ])
      setCourseData(instructorApiData || [])
      setSummary(withdrawalData)
      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">Earning</h1>

      {/* Balance summary */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 rounded-md border border-richblack-700 bg-richblack-800 p-6">
          <p className="text-richblack-300">Available Balance</p>
          <p className="mt-2 text-3xl font-semibold text-yellow-50">
            ₹{summary?.availableBalance ?? 0}
          </p>
        </div>
        <div className="flex-1 rounded-md border border-richblack-700 bg-richblack-800 p-6">
          <p className="text-richblack-300">Total Earned</p>
          <p className="mt-2 text-3xl font-semibold text-richblack-5">
            ₹{summary?.totalEarned ?? 0}
          </p>
        </div>
        <div className="flex-1 rounded-md border border-richblack-700 bg-richblack-800 p-6">
          <p className="text-richblack-300">Total Withdrawn</p>
          <p className="mt-2 text-3xl font-semibold text-richblack-5">
            ₹{summary?.totalWithdrawn ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          to="/dashboard/withdrawals"
          className="rounded-md bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900"
        >
          Request Withdrawal
        </Link>
      </div>

      {/* Per-course breakdown */}
      <div className="mt-8 text-richblack-5">
        {!courseData.length ? (
          <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
            You don&apos;t have any earnings yet.
          </p>
        ) : (
          <>
            <div className="flex rounded-t-lg bg-richblack-500">
              <p className="w-1/2 px-5 py-3">Course Name</p>
              <p className="w-1/4 px-2 py-3">Students Enrolled</p>
              <p className="flex-1 px-2 py-3">Revenue</p>
            </div>
            {courseData.map((course, i, arr) => (
              <div
                className={`flex items-center border border-richblack-700 ${
                  i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
                }`}
                key={course._id}
              >
                <div className="flex w-1/2 items-center gap-4 px-5 py-3">
                  <img
                    src={course.courseThumbnail}
                    alt="course_img"
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <p className="font-semibold">{course.courseName}</p>
                </div>
                <div className="w-1/4 px-2 py-3">
                  {course.totalStudentsEnrolled}
                </div>
                <div className="flex-1 px-2 py-3">
                  ₹{course.totalAmountGenerated}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
