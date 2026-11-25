import { redirect } from "next/navigation";

export const metadata = {
  title: "אקדמיה SiteForge",
  robots: { index: false, follow: false },
};

/** Course picker lives on the home night street — not a separate list page. */
export default function AcademyIndexPage() {
  redirect("/#courses");
}
