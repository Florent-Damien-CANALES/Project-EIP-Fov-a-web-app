# Fovea Backend

This is a Node.js project using Express.js and Prisma as an ORM. It provides APIs for managing products, categories, and invoices.

## Installation

1. Duplicate the `.env.example` file and rename it to `.env.docker`.
2. Generate the keys with the following command:

```shell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
3. Build the project with npm:
```shell
npm run build
```
4. Build and run the Docker containers:
```shell
docker-compose up -d --build
```

## API Routes

### Products

- `GET /products`: Fetch all products.
- `GET /products/:id`: Fetch a specific product by its ID.
- `POST /products`: Create a new product.
- `PUT /products/:id`: Update a specific product by its ID.
- `DELETE /products/:id`: Delete a specific product by its ID.

### Categories

- `GET /categories`: Fetch all categories.
- `GET /categories/:id`: Fetch a specific category by its ID.
- `POST /categories`: Create a new category.
- `PUT /categories/:id`: Update a specific category by its ID.
- `DELETE /categories/:id`: Delete a specific category by its ID.

### Invoices

- `GET /invoices`: Fetch all invoices.
- `GET /invoices/:id`: Fetch a specific invoice by its ID.
- `POST /invoices`: Create a new invoice.
- `POST /invoices/:id/download`: Download a specific invoice by its ID as a PDF.
- `DELETE /invoices/:id`: Delete a specific invoice by its ID.


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### License
MIT License
