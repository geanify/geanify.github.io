# web-herald.com

To install dependencies:

```bash
bun install
```

To run in development:

```bash
bun run dev
```

To run in production:

```bash
bun run start
```

## SSL/HTTPS Configuration

To run the production server with HTTPS, set the following environment variables:

```bash
# SSL Certificate paths
SSL_CERT_PATH=/path/to/your/certificate.crt
SSL_KEY_PATH=/path/to/your/private.key
SSL_CA_PATH=/path/to/your/ca_bundle.crt  # Optional

# Stock API key
STOCK_API_KEY=your_twelve_data_api_key_here
```

The server will automatically detect SSL certificates and start an HTTPS server. If SSL certificates are not provided, it will fall back to HTTP.

This project was created using `bun init` in bun v1.2.16. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
