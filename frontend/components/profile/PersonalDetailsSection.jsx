"use client";

import Button from "../ui/Button";
import TextField from "../ui/TextField";
import ProfileTextArea from "./ProfileTextArea";
import SectionCard from "./SectionCard";

export default function PersonalDetailsSection({ errors, onSave, onUpdate, profile, saving }) {
  return (
    <SectionCard
      id="details"
      title="Personal Details"
      subtitle="Keep your identity and contact details accurate for employers."
      action={
        <Button loading={saving} type="button" onClick={onSave}>
          Save changes
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          error={errors.fullName}
          label="Full name"
          value={profile.fullName}
          onChange={(event) => onUpdate("fullName", event.target.value)}
        />
        <TextField
          error={errors.phone}
          label="Phone number"
          value={profile.phone}
          onChange={(event) => onUpdate("phone", event.target.value)}
        />
        <TextField
          error={errors.email}
          label="Email"
          type="email"
          value={profile.email}
          onChange={(event) => onUpdate("email", event.target.value)}
        />
        <TextField
          label="Address"
          value={profile.address}
          onChange={(event) => onUpdate("address", event.target.value)}
        />
        <TextField
          label="Date of birth"
          type="date"
          value={profile.dateOfBirth}
          onChange={(event) => onUpdate("dateOfBirth", event.target.value)}
        />
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Gender</span>
          <select
            className="min-h-12 w-full rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/70"
            value={profile.gender}
            onChange={(event) => onUpdate("gender", event.target.value)}
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
        </label>
      </div>
      <div className="mt-4">
        <ProfileTextArea
          label="Bio / About"
          maxLength={1000}
          placeholder="Tell employers about your work style, strengths, and availability."
          value={profile.bio}
          onChange={(event) => onUpdate("bio", event.target.value)}
        />
      </div>
    </SectionCard>
  );
}
