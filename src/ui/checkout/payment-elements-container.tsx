"use client";

import type { ReactNode } from "react";

// Define the PaymentContainer to replace Stripe Elements
export const PaymentContainer = ({
	children,
}: {
	children: ReactNode;
}) => {
	// No need for locale or clientSecret handling
	const options = {
		appearance: {
			variables: {
				fontFamily: `system-ui, sans-serif`,
				fontSizeSm: "0.875rem",
				colorDanger: "hsl(0 84.2% 60.2%)",
			},
		},
	};

	return (
		<div className="payment-container" style={{ ...options.appearance.variables }}>
			{children}
		</div>
	);
};
