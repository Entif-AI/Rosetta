import { buildBootstrapDemoSnapshot, buildBootstrapGateSnapshot, createIngressJob } from '@entif-ai/ingress-refinery';
import { projectToMissionControl, projectToOb1Sidecar, projectToPrismShadow } from '@entif-ai/projection-adapters';
import { buildLifecycleDemo, buildPromotionTransitionDemo, verifyReceiptBundle, verifySignedReceipt } from '@entif-ai/rosetta-receipts';
import { listSchemaCatalogEntries } from '@entif-ai/rosetta-schemas';
import { InMemoryTileStore } from '@entif-ai/rosetta-store';

export function buildRosettaCliOutput() {
  const snapshot = buildBootstrapDemoSnapshot();
  const ingressJob = createIngressJob(snapshot.record.cid, snapshot.manifestation.cid);
  const store = new InMemoryTileStore();

  [
    snapshot.sourceSystem,
    snapshot.record,
    snapshot.manifestation,
    snapshot.fetchReceipt,
    snapshot.normalizationReceipt,
    snapshot.evaluationReceipt,
    snapshot.trustMatrix,
    snapshot.canonicalArtifact,
    snapshot.policyTile,
    snapshot.receipt,
    snapshot.tapestry
  ].forEach((tile) => store.put(tile));

  return {
    lifecycleDemo: buildLifecycleDemo(),
    promotionTransitionDemo: buildPromotionTransitionDemo(),
    action: snapshot.action,
    canonicalArtifact: snapshot.canonicalArtifact,
    conformanceBundle: snapshot.conformanceBundle,
    bootstrapGate: buildBootstrapGateSnapshot(),
    ingressJob,
    missionControl: projectToMissionControl(snapshot.canonicalArtifact, ingressJob, snapshot.receiptBundle),
    ob1: projectToOb1Sidecar(snapshot.canonicalArtifact, snapshot.receiptBundle),
    prism: projectToPrismShadow(snapshot.canonicalArtifact, snapshot.trustMatrix, snapshot.receiptBundle),
    receiptBundleVerification: verifyReceiptBundle(snapshot.receiptBundle, store),
    schemaCatalog: {
      entries: listSchemaCatalogEntries(),
      note: 'Inspection output only; exposureStatus values describe catalog visibility and do not imply runtime support.'
    },
    signedReceiptVerification: verifySignedReceipt(snapshot.signedReceipt),
    sourceSystem: snapshot.sourceSystem
  };
}
