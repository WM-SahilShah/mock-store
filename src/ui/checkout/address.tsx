import type React from "react";
import { useState, useEffect } from "react";

interface AddressElementProps {
	options?: {
		mode?: "shipping" | "billing";
		fields?: { phone?: "always" | "never" };
		validation?: { phone?: { required?: "auto" | boolean } };
	};
	onChange?: (event: AddressChangeEvent) => void;
	onReady?: () => void;
}

interface AddressChangeEvent {
	value: {
		name?: string;
		phone?: string | null;
		address: {
			city?: string;
			country?: string;
			line1?: string;
			line2?: string | null;
			postal_code?: string;
			state?: string | null;
		};
	};
}

const AddressElement: React.FC<AddressElementProps> = ({ options, onChange, onReady }) => {
	const [address, setAddress] = useState({
		name: "",
		phone: "",
		address: {
			city: "",
			country: "",
			line1: "",
			line2: "",
			postal_code: "",
			state: "",
		},
	});

	useEffect(() => {
		if (onReady) onReady(); // Notify when the component is ready
	}, [onReady]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;

		setAddress((prev) => {
			const updatedAddress = { ...prev };

			if (name.startsWith("address.")) {
				const key = name.split("address.")[1] as keyof typeof updatedAddress.address;

				updatedAddress.address = {
					...updatedAddress.address,
					[key]: value,
				};
			} else {
				if (name === "name") {
					updatedAddress.name = value;
				} else if (name === "phone") {
					updatedAddress.phone = value;
				}
			}

			// Optional chaining for onChange callback
			onChange?.({
				value: updatedAddress,
			});

			return updatedAddress;
		});
	};

	return (
		<div>
			<h4>{options?.mode === "shipping" ? "Shipping Address" : "Billing Address"}</h4>

			<input name="name" placeholder="Name" value={address.name} onChange={handleInputChange} />

			<input
				name="phone"
				placeholder="Phone"
				value={address.phone}
				onChange={handleInputChange}
				required={options?.validation?.phone?.required === "auto"}
			/>

			<input
				name="address.line1"
				placeholder="Address Line 1"
				value={address.address.line1}
				onChange={handleInputChange}
			/>

			<input
				name="address.line2"
				placeholder="Address Line 2"
				value={address.address.line2 || ""}
				onChange={handleInputChange}
			/>

			<input
				name="address.city"
				placeholder="City"
				value={address.address.city}
				onChange={handleInputChange}
			/>

			<input
				name="address.state"
				placeholder="State"
				value={address.address.state || ""}
				onChange={handleInputChange}
			/>

			<input
				name="address.postal_code"
				placeholder="Postal Code"
				value={address.address.postal_code}
				onChange={handleInputChange}
			/>

			<input
				name="address.country"
				placeholder="Country"
				value={address.address.country}
				onChange={handleInputChange}
			/>
		</div>
	);
};

export { AddressElement };
