// ============================================================================
// FORMS ZONE - ROOT INDEX PAGE
// ============================================================================
// This is the root index page for the forms zone.
// When accessed directly (http://localhost:3001/), it redirects to the patient intake form.
// ============================================================================

import { redirect } from 'next/navigation';

export default function FormsZoneRoot() {
  // Redirect to patient intake form
  redirect('/forms/patient-intake');
}

