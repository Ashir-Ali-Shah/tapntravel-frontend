import React, { useEffect, useState } from "react";
import { apiBaseUrl } from "../components/apis/setting";
import { formatPhoneNumber } from "../components/utils/utilityFunctions.";
import UsersTable from "../components/users/UsersTable";

const UserTablePage = () => {

  return (
    <div className="content flex flex-col p-2">
      <UsersTable />
    </div>
  );
};

export default UserTablePage;
