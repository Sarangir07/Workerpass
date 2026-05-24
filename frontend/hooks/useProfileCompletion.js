export default function useProfileCompletion(profile) {
  const checks = [
    Boolean(profile.fullName),
    Boolean(profile.phone),
    Boolean(profile.email),
    Boolean(profile.address),
    Boolean(profile.bio),
    Boolean(profile.category),
    profile.skills.length > 0,
    profile.languages.length > 0,
    profile.experiences.length > 0,
    Boolean(profile.photo),
    Boolean(profile.resume),
    Boolean(profile.availability)
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}
