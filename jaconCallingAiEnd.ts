// export async function getFaktoryContracts(
//     symbol: string,
//     name: string,
//     supply: number,
//     creatorAddress: string,
//     uri: string,
//     logoUrl?: string,
//     mediaUrl?: string,
//     twitter?: string,
//     website?: string,
//     telegram?: string,
//     discord?: string,
//     description?: string
//   ) {
//     const faktoryUrl = `${getFaktoryApiUrl(CONFIG.NETWORK)}/generate`;
//     const faktoryPoolUrl = `${getFaktoryApiUrl(CONFIG.NETWORK)}/generate-pool`;
//     //console.log(`Faktory URL: ${faktoryUrl.toString()}`);
//     //console.log(`Faktory Pool URL: ${faktoryPoolUrl.toString()}`);

//     const faktoryRequestBody: FaktoryRequestBody = {
//       symbol,
//       name,
//       supply,
//       creatorAddress,
//       uri,
//       logoUrl,
//       mediaUrl,
//       twitter,
//       website,
//       telegram,
//       discord,
//       description,
//     };

//     const faktoryResponse = await fetch(faktoryUrl.toString(), {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": CONFIG.AIBTC_FAKTORY_API_KEY,
//       },
//       body: JSON.stringify(faktoryRequestBody),
//     });
//     //console.log(`Faktory response status: ${faktoryResponse.status}`);
//     if (!faktoryResponse.ok) {
//       throw new Error(`Failed to get token and dex from Faktory`);
//     }
//     const result =
//       (await faktoryResponse.json()) as FaktoryResponse<FaktoryTokenAndDex>;
//     //console.log("Faktory result:");
//     //console.log(JSON.stringify(result, null, 2));
//     if (!result.success) {
//       throw new Error(`Failed to get token and dex contract from Faktory`);
//     }

//     const tokenContract = result.data.contracts.token.contract;
//     const dexContract = result.data.contracts.dex.contract;

//     const poolResponse = await fetch(faktoryPoolUrl.toString(), {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": CONFIG.AIBTC_FAKTORY_API_KEY,
//       },
//       body: JSON.stringify({
//         tokenContract,
//         dexContract,
//         senderAddress: creatorAddress,
//         symbol,
//       }),
//     });
//     //console.log(`Faktory pool response status: ${poolResponse.status}`);
//     if (!poolResponse.ok) {
//       throw new Error(`Failed to get pool contract from Faktory`);
//     }
//     const poolResult =
//       (await poolResponse.json()) as FaktoryResponse<FaktoryPool>;

//     //console.log("Faktory pool result:");
//     //console.log(JSON.stringify(poolResult, null, 2));

//     const faktoryContracts: FaktoryGeneratedContracts = {
//       token: result.data.contracts.token,
//       dex: result.data.contracts.dex,
//       pool: poolResult.data.pool,
//     };

//     const verified = verifyFaktoryContracts(faktoryContracts, faktoryRequestBody);
//     if (!verified) {
//       throw new Error(`Failed to verify Faktory contracts`);
//     }

//     return faktoryContracts;
//   }
