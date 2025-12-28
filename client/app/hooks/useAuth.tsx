import { useLoadUserQuery } from "@/redux/features/api/apiSlice";
import { useSelector } from "react-redux";

export default function useAuth() {
  const { token, user } = useSelector((state: any) => state.auth);

  const { data, isLoading, isSuccess, isError, refetch } = useLoadUserQuery(
    undefined,
    {
      skip: !token,
    }
  );

  return {
    data: data ? { user: data.user || user } : user ? { user } : null,
    isLoading,
    isSuccess,
    isError,
    refetch,
  };
}
