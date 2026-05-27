import { JobPortalPage } from "../../../components/jobs/JobPortal";

export default async function JobDetailsPage({ params }) {
  const { id } = await params;
  return <JobPortalPage jobId={id} mode="details" />;
}
