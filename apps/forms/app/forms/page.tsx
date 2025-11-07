// ============================================================================
// FORMS ZONE - FORMS INDEX PAGE
// ============================================================================
// This page redirects to the patient intake form.
// ============================================================================

import { redirect } from 'next/navigation';

export default function FormsIndexPage() {
  // Redirect to patient intake form
  redirect('/forms/patient-intake');
}

