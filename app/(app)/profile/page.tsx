import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm, { type ProfileInitial } from "@/components/ProfileForm";

export const metadata = { title: "Profile — ExpoLead OS" };

const EMPTY: ProfileInitial = {
  full_name: null,
  company_name: null,
  role: null,
  country: null,
  linkedin_url: null,
  about: null,
  avatar_url: null,
  avatar_position_y: null,
  quantity_unit: null,
  currency: null,
};

/**
 * Fetches the profile on the server so the form arrives already filled in.
 *
 * This page used to be entirely client-side: it rendered an empty form, then
 * after hydration made two sequential round trips (getUser, then the profile
 * row) before any field populated. With no loading state, a slow connection
 * showed a blank profile that looked broken rather than loading.
 */
export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("full_name, company_name, role, country, linkedin_url, about, avatar_url, avatar_position_y, quantity_unit, currency")
    .eq("id", user.id)
    .single();

  return <ProfileForm initial={(data as ProfileInitial) ?? EMPTY} />;
}
