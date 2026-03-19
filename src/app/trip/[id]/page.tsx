import { notFound } from "next/navigation";
import { getTrip } from "@/app/actions/trips";
import { TripView } from "@/components/trip/TripView";
import { TripNavbar } from "@/components/navbar/TripNavbar";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) notFound();

  return (
    <div className="min-h-screen flex flex-col page-bg">
      <TripNavbar />
      <TripView trip={trip} />
    </div>
  );
}
