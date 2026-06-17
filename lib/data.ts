import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Supplier, Exhibition, Opportunity, Meeting } from "@/lib/types";

export async function getSuppliers(): Promise<Supplier[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("suppliers")
      .select("*, exhibition:exhibitions(*), contacts(*)")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as Supplier[];
  } catch {
    return [];
  }
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("suppliers")
      .select("*, exhibition:exhibitions(*), contacts(*), meetings(*, exhibition:exhibitions(*)), products(*)")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as Supplier;
  } catch {
    return null;
  }
}

export async function getMeetingsForExhibition(exhibitionId: string): Promise<Meeting[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("exhibition_id", exhibitionId);
    if (error) return [];
    return (data ?? []) as Meeting[];
  } catch {
    return [];
  }
}

export async function getExhibitions(): Promise<Exhibition[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exhibitions")
      .select("*")
      .order("start_date", { ascending: false });
    if (error) return [];
    return (data ?? []) as Exhibition[];
  } catch {
    return [];
  }
}
export async function getOpportunities(): Promise<Opportunity[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) return [];
    const { data, error } = await supabase
      .from("opportunities")
.select("*")
.eq("user_id", user.id)
.order("created_at", { ascending: false });

    if (error) return [];

    return (data ?? []) as Opportunity[];
  } catch {
    return [];
  }
}
export async function getOpportunity(id: string): Promise<Opportunity | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const supabase = await createClient();
    const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) return null;

    const { data, error } = await supabase
      .from("opportunities")
      .select("*")
      .eq("id", id)
.eq("user_id", user.id)
.single();

    if (error) return null;

    return data as Opportunity;
  } catch {
    return null;
  }
}
import type { OpportunityFollowUp, OpportunityStatusHistory } from "@/lib/types";

export async function getOpportunityFollowUps(
  opportunityId: string
): Promise<OpportunityFollowUp[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("opportunity_followups")
      .select("*")
      .eq("opportunity_id", opportunityId)
      .order("created_at", { ascending: false });

    if (error) return [];

    return (data ?? []) as OpportunityFollowUp[];
  } catch {
    return [];
  }
}

export async function getOpportunityStatusHistory(
  opportunityId: string
): Promise<OpportunityStatusHistory[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("opportunity_status_history")
      .select("*")
      .eq("opportunity_id", opportunityId)
      .order("created_at", { ascending: true });

    if (error) return [];

    return (data ?? []) as OpportunityStatusHistory[];
  } catch {
    return [];
  }
}