# PayOnce SDK 🟢

The official Node.js library for integrating **PayOnce Protocol** (Bitcoin Cash payments).

## 📦 Installation

```bash
npm install git+https://github.com/saleemm1/payonce-sdk.git
```

---

### 🚀 Quick Start
Generate a secure payment link dynamically on your server (Node.js, Next.js API, Express, etc.).

```javascript
const { PayOnce } = require('payonce-sdk');

// 1. Create the invoice payload
const invoice = PayOnce.createInvoice({
  wallet: "bitcoincash:qrz...",   // Your BCH Wallet Address
  price: 25.00,                   // Price in USD
  product: "Premium E-Book",      // Product Name
  secretKey: process.env.SECRET   // (Optional) For Tamper Protection
});

// 2. Redirect the user or send the link to frontend
console.log("Payment Link:", invoice.url);
// Output: [https://payonce-cash.vercel.app/unlock?id=eyJ3IjoiYml0Y29](https://payonce-cash.vercel.app/unlock?id=eyJ3IjoiYml0Y29)...
```
---

### 🛠 API Reference
Generates a cryptographically signed payment URL.

| Parameter  | Type   | Required | Description |
|------------|--------|----------|-------------|
| wallet     | string | Yes      | Your Bitcoin Cash address (starting with `bitcoincash:` or legacy format). |
| price      | number | Yes      | The amount to charge in USD. The protocol converts this to BCH live. |
| product    | string | No       | The name of the item being sold (appears on the checkout page). |
| secretKey  | string | No       | A server-side secret key used to sign the payload (HMAC-SHA256). |

---

## Returns:
An object containing:

- **url (string):** The full payment link to redirect the user to.

- **payload** (object): The raw data object used for generation.

- **signature (string | null):** The HMAC signature (if secretKey was provided).

---

### 🔒 Security: Anti-Tamper Protection
PayOnce runs purely on the client-side (Stateless), which is great for decentralization but usually risky for pricing integrity.

To prevent malicious users from modifying the price in the URL (e.g., changing $100 to $1), use the secretKey parameter.

**Server-Side:** You pass a secret string (e.g., from .env) to the SDK.

**The SDK:** Generates an HMAC-SHA256 signature of the price and wallet.

**Checkout:** When the user pays, the PayOnce Protocol validates that the signature matches the parameters. If a user changes the price manually, the signature becomes invalid, and the transaction is rejected.


```javascript
// Example with Security
const invoice = PayOnce.createInvoice({
  wallet: "bitcoincash:qp...",
  price: 100,
  product: "Developer License",
  secretKey: "MY_SUPER_SECRET_KEY" // Keep this safe!
});
```
---

## 🛒 Real World Integration Example

Here is how you would use PayOnce in a real **Express.js** or **Next.js** checkout endpoint. 
Instead of hardcoding the price, you fetch it from your database.

```javascript
// Example: POST /api/checkout
app.post('/api/checkout', async (req, res) => {
  const { cartId, userWallet } = req.body;

  // 1. Fetch cart details from YOUR database
  const cart = await database.getCart(cartId); 
  // e.g., cart.total = 45.50

  // 2. Generate the dynamic link
  const invoice = PayOnce.createInvoice({
    wallet: process.env.MERCHANT_WALLET, // Your receiving address
    price: cart.total,                   // 🟢 Dynamic Price from DB
    product: `Order #${cartId}`,         // 🟢 Dynamic Product Name
    secretKey: process.env.PAYONCE_SECRET
  });

  // 3. Return the link to the frontend
  res.json({ paymentUrl: invoice.url });
});
```

---

### ⚡ Why use this SDK?
- **Dynamic Pricing:** Great for e-commerce carts where the total price changes per user.

- **Scale:** Generate millions of unique invoices without managing a database.

- **Zero Custody:** Funds go directly from the user to your wallet. No middleman.

- **Zero-Conf:** Optimized for instant settlement on Bitcoin Cash.
