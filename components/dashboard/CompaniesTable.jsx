import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { apiBaseUrl } from "../apis/setting";
import Loader from "../utils/Loader";

const CompaniesTable = () => {
  const [adminsDataAnalytics, setAdminsDataAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchAdminsDataAnalytics = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/admin/admins-analytics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAdminsDataAnalytics(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminsDataAnalytics();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6 bg-main rounded-lg shadow-lg mb-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Registered Companies
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Name
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">
                Trips
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">
                Routes
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">
                Drivers
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {adminsDataAnalytics?.map((company, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="py-3 px-4 text-gray-700">{company.adminName}</td>
                <td className="py-3 px-4 text-gray-700 text-center">
                  {company.vehicles}
                </td>
                <td className="py-3 px-4 text-gray-700 text-center">
                  {company.routes}
                </td>
                <td className="py-3 px-4 text-gray-700 text-center">
                  {company.drivers}
                </td>
                <td className="py-3 px-4 text-gray-700 text-center">
                  Rs. {company.revenue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompaniesTable;
