// Define the ProductMetadata type based on the expected structure
export type ProductMetadata = {
	id: string;
	name: string;
	stock: number;
	metadata: {
		stock: number;
		// Define other fields in the metadata as per your needs
	};
};

// Define the expected structure of the request payload (metadata)
export type Metadata = {
	[key: string]: string | number | boolean; // Adjust this according to your needs
};

// Response type for the API when fetching products from metadata
export type ProductsFromMetadataResponse = {
	products: ProductMetadata[]; // Array of products
};

/**
 * Fetch products based on metadata from your backend or custom source.
 * @param metadata - Metadata containing product-related details.
 * @returns A list of products with associated metadata.
 */
export async function getProductsFromMetadata(metadata: Metadata): Promise<ProductMetadata[]> {
	try {
		console.log("Fetching products from metadata:", metadata); // Log the input metadata

		const response = await fetch("/api/products-from-metadata", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ metadata }),
		});

		console.log("Response status from products API:", response.status); // Log response status

		if (!response.ok) {
			throw new Error(`Failed to fetch products: ${response.statusText}`);
		}

		// Safely parse the response JSON and assert the type
		const data = await response.json();
		console.log("Response data from products API:", data); // Log the full response

		const responseData: ProductsFromMetadataResponse = data as ProductsFromMetadataResponse;

		console.log("Fetched products:", responseData.products); // Log the fetched products
		return responseData.products; // Return the products from the response
	} catch (error) {
		console.error("Error fetching products from metadata:", error); // Log detailed error
		throw error;
	}
}

/**
 * Update stock for a product in your backend or database.
 * @param productId - The ID of the product to update.
 * @param newStock - The new stock value to set.
 */
export async function updateProductStock(productId: string, newStock: number): Promise<void> {
	try {
		console.log(`Updating stock for product ${productId} to new stock value: ${newStock}`); // Log details

		const response = await fetch(`/api/product-stock/${productId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ stock: newStock }),
		});

		console.log("Response status from stock update API:", response.status); // Log response status

		if (!response.ok) {
			throw new Error(`Failed to update stock: ${response.statusText}`);
		}

		console.log(`Stock updated successfully for product ${productId}`); // Success message
	} catch (error) {
		console.error(`Error updating stock for product ${productId}:`, error); // Log detailed error
		throw error;
	}
}

/**
 * Handle webhook events for payments.
 * This function will fetch products based on metadata and update their stock.
 */
export async function handleWebhookEvent(metadata: Metadata) {
	try {
		console.log("Webhook triggered with metadata:", metadata); // Log the metadata from the webhook

		const products = await getProductsFromMetadata(metadata); // Fetch products based on metadata
		console.log("Products fetched for webhook event:", products); // Log the fetched products

		for (const product of products) {
			if (product.stock !== Infinity) {
				const newStock = product.metadata.stock - 1;
				console.log(
					`Updating stock for product ID: ${product.id}, Current Stock: ${product.metadata.stock}, New Stock: ${newStock}`,
				); // Log stock update details

				await updateProductStock(product.id, newStock); // Update stock
			} else {
				console.log(`Product ID: ${product.id} has unlimited stock, skipping update.`);
			}
		}

		console.log("All relevant product stocks have been updated successfully."); // Summary message
	} catch (error) {
		console.error("Error handling webhook event:", error); // Log any errors in the webhook flow
		throw error;
	}
}
