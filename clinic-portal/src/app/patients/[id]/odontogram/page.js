"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClinicalOdontogram from "@/components/odontogram/clinical-odontogram";

export default function PatientAdvancedOdontogramPage() {
  const { id } = useParams();
  const provider = process.env.NEXT_PUBLIC_ODONTOGRAM_PROVIDER || "advanced";
  const enabled = provider !== "legacy";
  const { data: patient, error: patientError } = useSWR(id ? `patient-${id}` : null, () => api.patient.getById(id));

  const error = patientError;
  if (error) {
    return <div className="text-sm text-red-600">Failed to load odontogram data.</div>;
  }
  if (!patient) {
    return <div className="text-sm text-app-muted">Loading odontogram...</div>;
  }

  const person = patient.person || {};
  const name = `${person.first_name || ""} ${person.last_name || ""}`.trim() || "Patient";

  if (!enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Odontogram Disabled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-app-muted">
            Set NEXT_PUBLIC_ODONTOGRAM_PROVIDER=advanced to enable the replacement odontogram route.
          </p>
          <Button variant="outline" as="a" href={`/patients/${id}`}>Back to patient</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" as="a" href={`/patients/${id}`}>
            <ArrowLeft size={14} className="mr-1" /> Back
          </Button>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{name} Odontogram</h1>
          <p className="text-sm text-app-muted">Advanced chart with backend clinical state persistence.</p>
        </div>
        <Button variant="outline" as="a" href={`/appointments/new?patientId=${id}`}>Schedule appointment</Button>
      </div>
      <ClinicalOdontogram patientId={id} mode="patient" selectionMode="multiple" title={`${name} odontogram`} />
    </div>
  );
}
