"use client";

import type { ReactNode } from "react";

export const PaymentContainer = ({
	children,
}: {
	children: ReactNode;
}) => {
	const paymentContainerStyle = {
		fontFamily: `system-ui, sans-serif`,
		fontSize: "0.875rem",
		color: "inherit",
		colorDanger: "hsl(0 84.2% 60.2%)",
	};

	return (
		<div className="payment-container" style={{ ...paymentContainerStyle }}>
			{children}
		</div>
	);
};
