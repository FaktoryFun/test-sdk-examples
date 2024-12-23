// test-verify.ts
import { FaktorySDK } from "@faktory/core-sdk";
import dotenv from "dotenv";

dotenv.config();

const TOKEN_CONTRACT =
  "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.cat-pepe-faktory";

const sdk = new FaktorySDK({
  network: "mainnet",
});

async function testVerifyTransfer() {
  try {
    const verificationResult = await sdk.verifyTransfer(TOKEN_CONTRACT);
    console.log(
      "Verification Result:",
      JSON.stringify(verificationResult, null, 2)
    );
  } catch (error) {
    console.error("Error in verify transfer:", error);
  }
}

testVerifyTransfer();
