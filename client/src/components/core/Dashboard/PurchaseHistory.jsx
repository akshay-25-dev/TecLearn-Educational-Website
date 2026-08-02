import { useEffect, useState } from "react"
import { VscHistory } from "react-icons/vsc"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { getPurchaseHistory } from "../../../services/operations/studentFeaturesAPI"
import { formatDate } from "../../../services/formatDate"

export default function PurchaseHistory() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [purchases, setPurchases] = useState(null)

  useEffect(() => {
    ;(async () => {
      const res = await getPurchaseHistory(token)
      setPurchases(res || [])
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="text-3xl text-richblack-50">Purchase History</div>

      {!purchases ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : !purchases.length ? (
        <div className="grid h-[10vh] w-full place-content-center text-richblack-5">
          <div className="flex flex-col items-center gap-2">
            <VscHistory className="text-2xl text-richblack-300" />
            <p>You haven&apos;t purchased any courses yet.</p>
          </div>
        </div>
      ) : (
        <div className="my-8 text-richblack-5">
          {/* Headings */}
          <div className="flex rounded-t-lg bg-richblack-500">
            <p className="w-[40%] px-5 py-3">Course(s)</p>
            <p className="w-1/5 px-2 py-3">Amount</p>
            <p className="w-1/5 px-2 py-3">Payment ID</p>
            <p className="flex-1 px-2 py-3">Date</p>
          </div>
          {/* Rows */}
          {purchases.map((purchase, i, arr) => (
            <div
              className={`flex items-center border border-richblack-700 ${
                i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
              }`}
              key={purchase._id}
            >
              <div className="flex w-[40%] flex-col gap-2 px-5 py-3">
                {(purchase.courses || []).map((course) => (
                  <div
                    key={course._id}
                    className="flex cursor-pointer items-center gap-3"
                    onClick={() => navigate(`/courses/${course._id}`)}
                  >
                    <img
                      src={course.thumbnail}
                      alt="course_img"
                      className="h-10 w-10 rounded-md object-cover"
                    />
                    <p className="font-semibold">{course.courseName}</p>
                  </div>
                ))}
              </div>
              <div className="w-1/5 px-2 py-3">₹{purchase.amount}</div>
              <div className="w-1/5 truncate px-2 py-3 text-xs text-richblack-300">
                {purchase.razorpay_payment_id || "—"}
              </div>
              <div className="flex-1 px-2 py-3 text-sm">
                {formatDate(purchase.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
