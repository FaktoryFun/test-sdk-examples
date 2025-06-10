// // Manual testing examples for your runes etcher endpoint

// // Example 1: Direct API call to etch a rune
// async function testDirectEtching() {
//   const response = await fetch("http://localhost:3000/api/etch-runes", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-api-key": "your_api_key_here",
//     },
//     body: JSON.stringify({
//       runeName: "TEST•TOKEN",
//       runeSymbol: "T",
//       network: "testnet",
//     }),
//   });

//   const result = await response.json();
//   console.log("Direct API call result:", JSON.stringify(result, null, 2));
// }

// // Example 2: Simulate a chainhook event for a Stacks print function call
// async function simulateChainhookEvent() {
//   // This is a simplified example of a Stacks chainhook event
//   // Actual structure will vary - adjust based on your chainhook setup
//   const mockChainhookEvent = {
//     apply: [
//       {
//         block_identifier: {
//           index: 12345,
//           hash: "0x1234567890abcdef1234567890abcdef",
//         },
//         timestamp: 1617753600,
//         transactions: [
//           {
//             transaction_identifier: {
//               hash: "0xabcdef1234567890abcdef1234567890",
//             },
//             operations: [
//               {
//                 type: "contract_call",
//                 contract_identifier:
//                   "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.my-token",
//                 contract_call_data: {
//                   function_name: "print",
//                   function_args: [
//                     {
//                       name: "amount",
//                       type: "uint",
//                       value: "1000000000",
//                     },
//                     {
//                       name: "recipient",
//                       type: "principal",
//                       value: "SP2JHG9BTM2TTMVBVEL7VQ43K4JMRXQ8AEWPGPJRN",
//                     },
//                   ],
//                 },
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   };

//   const response = await fetch("http://localhost:3000/api/etch-runes", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer your_chainhook_secret_token",
//     },
//     body: JSON.stringify(mockChainhookEvent),
//   });

//   const result = await response.json();
//   console.log("Chainhook event result:", JSON.stringify(result, null, 2));
// }

// // Example 3: Check the status of an existing rune etching order
// async function checkOrderStatus(orderId) {
//   const response = await fetch(`https://api.ordinalsbot.com/order/${orderId}`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${process.env.ORDINALSBOT_API_KEY}`,
//     },
//   });

//   const result = await response.json();
//   console.log(`Order ${orderId} status:`, JSON.stringify(result, null, 2));
// }

// // Run the tests
// // testDirectEtching();
// // simulateChainhookEvent();
// // checkOrderStatus('your-order-id');
