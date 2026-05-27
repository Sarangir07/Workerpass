import { JobPortalPage } from "../../../../components/jobs/JobPortal";

export default async function WorkerApplicationDetailsPage({ params }) {
  const { id } = await params;
  return <JobPortalPage jobId={id} mode="application-details" />;
}
