import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { apiBaseUrl } from "../components/apis/setting";
import { capitalizeFirstLetter } from "../components/utils/HelperFunctions";
import { formatDate } from "../components/utils/utilityFunctions.";
import Loader from "../components/utils/Loader";

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        // Decode adminId from token
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token);
        const adminId = decodedToken.sub;

        // Make the API call
        const response = await axios.post(
          `${apiBaseUrl}/payment/payments-advance-search`,
          {
            adminId,
          }
        );

        setPayments(response.data.data || []);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Filter payments
  const filteredPayments = payments
    .filter((payment) => {
      const matchesSearch =
        payment?.paymentId.includes(searchTerm) ||
        payment?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment?.amount.toString().includes(searchTerm);
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Today"
          ? new Date(payment.createdAt.$date).toDateString() ===
            new Date().toDateString()
          : payment.status === statusFilter);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className="content container px-6 mt-4 w-full rounded">
      <h1 className="text-2xl font-bold mb-4">Payments Record</h1>

      {/* Search Input */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by payment ID, user, or amount..."
          className="border border-gray-300 rounded-full px-4 py-2 w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Status Filter */}
        <select
          className="border border-gray-300 rounded-lg p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="succeeded">Succeeded</option>
          <option value="pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Today">Today</option>
        </select>
      </div>

      {/* Payment Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <Loader />
        ) : (
          <table className="min-w-full bg-white border border-gray-300 rounded-2xl">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="p-4 border">Transaction ID</th>
                <th className="p-4 border">User</th>
                <th className="p-4 border">Amount</th>
                <th className="p-4 border">Status</th>
                <th className="p-4 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.paymentId} className="hover:bg-gray-50">
                  <td className="p-4 border text-center">
                    {payment?.paymentId}
                  </td>
                  <td className="p-4 border text-center">
                    {payment?.userName ?? payment?.userId}
                  </td>
                  <td className="p-4 border text-center">
                    Rs. {payment?.amount}
                  </td>
                  <td
                    className={`p-4 border  text-center ${
                      payment.status === "succeeded"
                        ? "text-green-600"
                        : payment.status === "Pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {capitalizeFirstLetter(payment.status)}
                  </td>
                  <td className="p-4 border">
                    {formatDate(
                      new Date(payment.createdAt).toLocaleDateString()
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
