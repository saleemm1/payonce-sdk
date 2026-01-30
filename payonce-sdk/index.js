const crypto = require('crypto');

class PayOnce {
  static createInvoice({ wallet, price, product, secretKey }) {
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

    const jsonString = JSON.stringify(payload);
    const encodedId = Buffer.from(jsonString).toString('base64');

    const baseUrl = "https://payonce-cash.vercel.app/unlock";
    const finalUrl = `${baseUrl}?id=${encodedId}`;

    return {
      url: finalUrl,
      payload: payload,
      signature: payload.sec || null
    };
  }
}

module.exports = { PayOnce };

