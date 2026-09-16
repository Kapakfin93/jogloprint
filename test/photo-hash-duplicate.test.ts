import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { uploadImageAction } from "../app/actions/upload.action";

describe("TASK B: Photo SHA-256 Hash & Duplicate Detection", () => {
  const freshImagePath = path.join(
    process.cwd(),
    "doc_spec produck",
    "lanyard",
    "processed",
    "lanyard_branded_2_focus.jpg"
  );

  const duplicateImagePath = path.join(
    process.cwd(),
    "doc_spec produck",
    "lanyard",
    "processed",
    "lanyard_branded_1_full.jpg"
  );

  const duplicateHash = "8a6714a3d69f3fe18c25f96e547f981a594e91ff8cf21ed76627f7b48ec4e20e";


  it("Step 1: Fresh unique image calculates correct SHA-256 and has no duplicate warning", async () => {
    const fileBytes = fs.readFileSync(freshImagePath);
    const expectedHash = crypto.createHash("sha256").update(fileBytes).digest("hex");

    const file = new File([fileBytes], "lanyard_branded_2_focus.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "test");

    const result = await uploadImageAction(formData);

    assert.strictEqual(result.success, true, "Upload should succeed");
    assert.ok(result.data?.secure_url, "Cloudinary secure_url must be returned");
    assert.strictEqual(result.file_hash, expectedHash, "file_hash must match exact computed SHA-256");
    assert.strictEqual(
      result.duplicate_warning,
      undefined,
      "Fresh image must not have duplicate warning"
    );

    console.log(`[PASS] Step 1 Fresh Photo SHA-256 Verified: ${result.file_hash}`);
  });

  it("Step 2: Uploading image with identical hash triggers duplicate warning with product name", async () => {
    const fileBytes = fs.readFileSync(duplicateImagePath);
    const expectedHash = crypto.createHash("sha256").update(fileBytes).digest("hex");
    assert.strictEqual(expectedHash, duplicateHash, "Hash matches seeded duplicate hash");

    const file = new File([fileBytes], "lanyard_branded_1_full.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "test");

    const result = await uploadImageAction(formData);

    assert.strictEqual(result.success, true, "Upload should succeed");
    assert.strictEqual(result.file_hash, expectedHash, "file_hash matches known hash");
    assert.ok(result.duplicate_warning, "Duplicate warning MUST be returned");
    assert.ok(
      result.duplicate_warning.includes("Tali Lanyard Printing Custom"),
      `Warning must specify the exact product name, got: ${result.duplicate_warning}`
    );

    console.log(`[PASS] Step 2 Duplicate Warning Detected: ${result.duplicate_warning}`);
  });
});

