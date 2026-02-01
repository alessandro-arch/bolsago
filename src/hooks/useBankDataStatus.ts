import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type BankDataStatus = "not_filled" | "pending" | "validated" | "rejected";

interface BankData {
  bankName: string;
  agency: string;
  account: string;
  accountType: string;
  pixKey: string;
}

interface UseBankDataStatusReturn {
  status: BankDataStatus;
  bankData: BankData | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useBankDataStatus(): UseBankDataStatusReturn {
  const { user } = useAuth();
  const [status, setStatus] = useState<BankDataStatus>("not_filled");
  const [bankData, setBankData] = useState<BankData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBankData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching bank data:", error);
        setStatus("not_filled");
        setBankData(null);
      } else if (!data) {
        // No bank data found
        setStatus("not_filled");
        setBankData(null);
      } else {
        // Bank data exists - for now, set as pending since there's no validation_status column yet
        // This can be updated when the validation workflow is implemented
        setBankData({
          bankName: data.bank_name,
          agency: data.agency,
          account: data.account_number,
          accountType: data.account_type || "",
          pixKey: data.pix_key || "",
        });
        // Default to pending when data exists but no validation status is stored
        setStatus("pending");
      }
    } catch (err) {
      console.error("Error in fetchBankData:", err);
      setStatus("not_filled");
      setBankData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankData();
  }, [user?.id]);

  return {
    status,
    bankData,
    loading,
    refetch: fetchBankData,
  };
}
