import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

import {
  getWithdrawals,
  requestWithdrawal,
} from "../../../services/operations/withdrawalAPI"
import { formatDate } from "../../../services/formatDate"

const STATUS_STYLES = {
  Pending: "bg-yellow-800 text-yellow-50",
  Approved: "bg-blue-800 text-blue-50",
  Paid: "bg-caribbeangreen-800 text-caribbeangreen-100",
  Rejected: "bg-pink-800 text-pink-100",
}

export default function Withdrawals() {
  const { token } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState(null)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")

  const fetchData = async () => {
    const res = await getWithdrawals(token)
    setData(res)
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      await fetchData()
      setLoading(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount) return
    setSubmitting(true)
    const success = await requestWithdrawal(amount, note, token)
    if (success) {
      setAmount("")
      setNote("")
      await fetchData()
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">
        Withdrawals
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Balance + request form */}
        <div className="w-full max-w-sm shrink-0 rounded-md border border-richblack-700 bg-richblack-800 p-6">
          <p className="text-richblack-300">Available Balance</p>
          <p className="mt-2 text-3xl font-semibold text-yellow-50">
            ₹{data?.availableBalance ?? 0}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-richblack-5">
                Amount <sup className="text-pink-200">*</sup>
              </span>
              <input
                type="number"
                min="1"
                max={data?.availableBalance ?? 0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full rounded-[0.5rem] border-b-2 border-richblack-600 bg-richblack-700 p-3 text-richblack-5 placeholder-richblack-400"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-richblack-5">Note</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note (e.g. bank details)"
                className="w-full rounded-[0.5rem] border-b-2 border-richblack-600 bg-richblack-700 p-3 text-richblack-5 placeholder-richblack-400"
                rows={3}
              />
            </label>
            <button
              type="submit"
              disabled={submitting || !data?.availableBalance}
              className="rounded-md bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Request Withdrawal"}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="flex-1 text-richblack-5">
          {!data?.withdrawals?.length ? (
            <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
              You haven&apos;t requested any withdrawals yet.
            </p>
          ) : (
            <>
              <div className="flex rounded-t-lg bg-richblack-500">
                <p className="w-1/4 px-5 py-3">Amount</p>
                <p className="w-1/4 px-2 py-3">Status</p>
                <p className="flex-1 px-2 py-3">Requested</p>
              </div>
              {data.withdrawals.map((w, i, arr) => (
                <div
                  className={`flex items-center border border-richblack-700 ${
                    i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
                  }`}
                  key={w._id}
                >
                  <div className="w-1/4 px-5 py-3">₹{w.amount}</div>
                  <div className="w-1/4 px-2 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        STATUS_STYLES[w.status] || "bg-richblack-700"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                  <div className="flex-1 px-2 py-3 text-sm">
                    {formatDate(w.createdAt)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
