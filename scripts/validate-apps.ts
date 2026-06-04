import { apps, type AppStatus, type MetadataConfidence } from '../src/data/apps';

interface ValidationError {
  id: string;
  name: string;
  type: 'error' | 'warning';
  message: string;
  field?: string;
}

const VALID_STATUSES: AppStatus[] = [
  "ok", "broken", "wip", "archived", "active", "maintained", 
  "paused", "complete", "archive-candidate", "duplicate-candidate", 
  "needs-review", "unknown"
];

const VALID_CONFIDENCE: MetadataConfidence[] = ["verified", "inferred", "needs-review"];

function validateInventory() {
  const errors: ValidationError[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();
  const repoUrls = new Set<string>();
  const liveUrls = new Set<string>();
  const localPaths = new Set<string>();

  console.log(`Starting validation of ${apps.length} project entries...\n`);

  apps.forEach((app) => {
    const { id, name, status, metadataConfidence, repoUrl, liveUrl, localPath, primaryUrl, urls } = app;

    // 1. Basic Identity
    if (!id) errors.push({ id: 'unknown', name: name || 'unknown', type: 'error', message: 'Missing ID' });
    else if (ids.has(id)) errors.push({ id, name, type: 'error', message: `Duplicate ID: ${id}` });
    ids.add(id);

    if (!name) errors.push({ id, name: 'unknown', type: 'error', message: 'Missing name' });
    else if (names.has(name.toLowerCase())) errors.push({ id, name, type: 'warning', message: `Duplicate project name: ${name}` });
    names.add(name?.toLowerCase());

    // 2. Status & Confidence
    if (!VALID_STATUSES.includes(status)) {
      errors.push({ id, name, type: 'error', message: `Invalid status: ${status}`, field: 'status' });
    }

    if (metadataConfidence && !VALID_CONFIDENCE.includes(metadataConfidence)) {
      errors.push({ id, name, type: 'error', message: `Invalid metadataConfidence: ${metadataConfidence}`, field: 'metadataConfidence' });
    }

    // 3. URLs and Paths
    if (repoUrl) {
      if (!/^https?:\/\//i.test(repoUrl)) errors.push({ id, name, type: 'error', message: `Invalid repoUrl: ${repoUrl}`, field: 'repoUrl' });
      if (repoUrls.has(repoUrl)) errors.push({ id, name, type: 'warning', message: `Duplicate repository URL: ${repoUrl}`, field: 'repoUrl' });
      repoUrls.add(repoUrl);
    }

    if (liveUrl) {
      if (!/^https?:\/\//i.test(liveUrl)) errors.push({ id, name, type: 'error', message: `Invalid liveUrl: ${liveUrl}`, field: 'liveUrl' });
      if (liveUrls.has(liveUrl)) errors.push({ id, name, type: 'warning', message: `Duplicate live URL: ${liveUrl}`, field: 'liveUrl' });
      liveUrls.add(liveUrl);
    }

    if (localPath) {
      if (localPaths.has(localPath)) errors.push({ id, name, type: 'warning', message: `Duplicate local path: ${localPath}`, field: 'localPath' });
      localPaths.add(localPath);
    }

    // Check for file:/// in primaryUrl or liveUrl
    if (primaryUrl && /^file:\/\/\//i.test(primaryUrl)) {
      errors.push({ id, name, type: 'warning', message: 'file:/// URL found in primaryUrl (should be in localPath)', field: 'primaryUrl' });
    }
    if (liveUrl && /^file:\/\/\//i.test(liveUrl)) {
      errors.push({ id, name, type: 'error', message: 'file:/// URL found in liveUrl (should be in localPath)', field: 'liveUrl' });
    }

    // 4. Content
    if (!app.notes && app.status === 'needs-review') {
      errors.push({ id, name, type: 'warning', message: 'Entry needs review but has no notes explaining why', field: 'notes' });
    }

    if (app.sourceOfTruth && app.duplicateOf) {
      errors.push({ id, name, type: 'error', message: 'Entry is marked as source of truth but also points to a duplicate', field: 'sourceOfTruth' });
    }
  });

  // Report
  const errorCount = errors.filter(e => e.type === 'error').length;
  const warningCount = errors.filter(e => e.type === 'warning').length;

  if (errors.length > 0) {
    console.log('Validation results:');
    errors.forEach(e => {
      const icon = e.type === 'error' ? '❌' : '⚠️';
      console.log(`${icon} [${e.id}] ${e.name}: ${e.message}${e.field ? ` (${e.field})` : ''}`);
    });
    console.log(`\nFound ${errorCount} errors and ${warningCount} warnings.`);
  } else {
    console.log('✅ Validation passed! All entries are healthy.');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

validateInventory();
