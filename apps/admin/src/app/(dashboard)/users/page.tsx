import { columns } from "./columns";
import { DataTable } from "./data-table";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { UserType } from "@repo/types";

const getUsersData = async (): Promise<UserType[]> => {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/users`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data?.data || data || [];
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
};

const UsersPage = async () => {
  const data = await getUsersData();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm">
            Manage your application users and their roles.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default UsersPage;
