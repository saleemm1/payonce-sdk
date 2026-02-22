const crypto = require('crypto');

class PayOnce {
  static async createInvoice({ wallet, price, product, secretKey }) {
    if (!wallet || !price) {
      throw new Error("PayOnce SDK Error: 'wallet' and 'price' are required.");
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

    const response = await fetch('https://payonce-cash.vercel.app/api/upload-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!data.cid) {
        throw new Error("PayOnce SDK Error: Failed to generate IPFS CID.");
    }

    const baseUrl = "https://payonce-cash.vercel.app/unlock";
    const finalUrl = `${baseUrl}?cid=${data.cid}`;

    return {
      url: finalUrl,
      payload: payload,
      signature: payload.sec || null,
      cid: data.cid
    };
  }
}

module.exports = { PayOnce };
