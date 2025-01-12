import { FaktorySDK } from "@faktoryfun/core-sdk";
import dotenv from "dotenv";

dotenv.config();

const TOKEN_CONTRACT =
  "STV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RJ5XDY2.test-token2-faktory";

const sdk = new FaktorySDK({
  network: "testnet",
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
