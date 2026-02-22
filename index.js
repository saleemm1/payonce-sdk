const crypto = require('crypto');
const https = require('https');

class PayOnce {
  static createInvoice({ wallet, price, product, secretKey }) {
    return new Promise((resolve, reject) => {
      if (!wallet || !price) {
        return reject(new Error("PayOnce SDK Error: 'wallet' and 'price' are required."));
      }

      const payload = {
        w: wallet,
        p: price.toString(),
        n: product || "Digital Item",
        dt: "invoice",
        ts: Date.now()
      };

      if (secretKey) {
        const signature = crypto
          .createHmac('sha256', secretKey)
          .update(JSON.stringify(payload))
          .digest('hex');
        
        payload.sec = signature;
      }

      const dataString = JSON.stringify(payload);

      const options = {
        hostname: 'payonce-cash.vercel.app',
        path: '/api/upload-json',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataString)
        }
      };

      const req = https.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          try {
            const data = JSON.parse(responseBody);
            
            if (!data.cid) {
              return reject(new Error("PayOnce SDK Error: Failed to generate IPFS CID."));
            }

            const baseUrl = "https://payonce-cash.vercel.app/unlock";
            const finalUrl = `${baseUrl}?cid=${data.cid}`;

            resolve({
              url: finalUrl,
              payload: payload,
              signature: payload.sec || null,
              cid: data.cid
            });
          } catch (error) {
            reject(new Error("PayOnce SDK Error: Invalid response from server."));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`PayOnce SDK Error: Request failed - ${error.message}`));
      });

      req.write(dataString);
      req.end();
    });
  }
}

module.exports = { PayOnce };
