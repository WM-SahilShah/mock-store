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
 * Fetch products based on metadata from the backend.
 * @param metadata - Metadata containing product-related details.
 * @returns A list of products with associated metadata.
 */
export async function getProductsFromMetadata(metadata: Metadata): Promise<ProductMetadata[]> {
	try {
		const response = await fetch("/api/products-from-metadata", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ metadata }),
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch products: ${response.statusText}`);
		}

		// Safely parse the response JSON and assert the type
		const data = await response.json();

		// Type assertion to ensure the expected response structure
		const responseData: ProductsFromMetadataResponse = data as ProductsFromMetadataResponse;

		return responseData.products; // Return the products from the response
	} catch (error) {
		console.error("Error fetching products from metadata:", error);
		throw error;
	}
}

/**
 * Update stock for a product in the backend.
 * @param productId - The ID of the product to update.
 * @param newStock - The new stock value to set.
 */
export async function updateProductStock(productId: string, newStock: number): Promise<void> {
	try {
		const response = await fetch(`/api/product-stock/${productId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ stock: newStock }),
		});

		if (!response.ok) {
			throw new Error(`Failed to update stock: ${response.statusText}`);
		}

		console.log(`Stock updated successfully for product ${productId}`);
	} catch (error) {
		console.error("Error updating product stock:", error);
		throw error;
	}
}
